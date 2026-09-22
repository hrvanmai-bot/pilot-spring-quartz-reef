import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { parseHuyHoangBoq, parseQuoteText, type ParsedItem } from "./parse-quote";

const SYSTEM = `Bạn là kỹ sư bóc tách khối lượng xây dựng của HUY HOÀNG.
Đọc báo giá / BOQ / bảng Excel / PDF / ảnh và lập danh sách HẠNG MỤC THI CÔNG để nhân viên và khách hàng theo dõi.

BẮT BUỘC:
- KHÔNG đưa đơn giá, thành tiền, tổng tiền, chiết khấu, VAT, hay bất kỳ số tiền nào.
- Chỉ lấy: tên hạng mục, nhóm, đơn vị tính, khối lượng.
- Bỏ dòng tiêu đề, tổng cộng, ghi chú thanh toán, chữ ký.
- Chuẩn hóa ĐVT: m2, m3, md, kg, tấn, cái, bộ, hệ, lít, bao, viên, công.
- Nhóm (category) một trong: Kết cấu, Xây tô, ME, Hoàn thiện, Thô, Khác.
- Tên hạng mục tiếng Việt, rõ, dễ khách đọc (ví dụ: "Đổ bê tông móng" không viết tắt khó hiểu).
- Nếu không có khối lượng thì quantity = null.

Trả JSON đúng dạng:
{"items":[{"name":"...","unit":"m2","quantity":12.5,"category":"Xây tô","description":null}]}`;

function mapItems(raw: unknown): ParsedItem[] {
  if (!raw || typeof raw !== "object") return [];
  const arr = Array.isArray(raw) ? raw : (raw as { items?: unknown }).items;
  if (!Array.isArray(arr)) return [];
  return arr
    .map((it) => {
      const o = it as Record<string, unknown>;
      const name = String(o.name ?? o.hangMuc ?? o.item ?? "").trim();
      const qtyRaw = o.quantity ?? o.khoiLuong ?? o.qty;
      const qty =
        typeof qtyRaw === "number"
          ? qtyRaw
          : typeof qtyRaw === "string"
            ? Number(String(qtyRaw).replace(/,/g, "."))
            : null;
      return {
        name,
        unit: o.unit || o.dvt ? String(o.unit ?? o.dvt).trim() : null,
        quantity: qty != null && Number.isFinite(qty) ? qty : null,
        category: o.category || o.nhom ? String(o.category ?? o.nhom).trim() : null,
        description: o.description ? String(o.description).trim() : null,
      } satisfies ParsedItem;
    })
    .filter((it) => it.name.length > 1);
}

async function askGrok(params: {
  text: string;
  image?: { mime: string; base64: string };
}): Promise<ParsedItem[]> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) throw new Error("AI_UNAVAILABLE");

  const userContent: unknown[] = [
    {
      type: "text",
      text:
        SYSTEM +
        "\n\nNội dung báo giá (đã loại tiền nếu có). Hãy lập bảng hạng mục:\n\n" +
        params.text.slice(0, 24000),
    },
  ];
  if (params.image) {
    userContent.push({
      type: "image_url",
      image_url: {
        url: `data:${params.image.mime};base64,${params.image.base64}`,
      },
    });
  }

  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-4.5",
      temperature: 0.1,
      max_tokens: 4000,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: userContent },
      ],
    }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`xAI API error ${res.status} ${t.slice(0, 200)}`);
  }
  const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = body.choices?.[0]?.message?.content ?? "";
  const jsonStart = content.indexOf("{");
  const jsonEnd = content.lastIndexOf("}");
  const json = jsonStart >= 0 ? content.slice(jsonStart, jsonEnd + 1) : content;
  try {
    return mapItems(JSON.parse(json));
  } catch {
    return [];
  }
}

async function excelToText(buf: Buffer): Promise<string> {
  const XLSX = await import("xlsx");
  const wb = XLSX.read(buf, { type: "buffer", cellDates: false });
  const parts: string[] = [];
  for (const name of wb.SheetNames.slice(0, 6)) {
    const sheet = wb.Sheets[name];
    if (!sheet) continue;
    const csv = XLSX.utils.sheet_to_csv(sheet, { blankrows: false });
    if (csv.trim()) parts.push(`--- Sheet: ${name} ---\n${csv}`);
  }
  return parts.join("\n\n");
}

async function pdfToText(buf: Uint8Array): Promise<string> {
  const { extractText, getDocumentProxy } = await import("unpdf");
  const pdf = await getDocumentProxy(buf);
  const { text } = await extractText(pdf, { mergePages: true });
  return Array.isArray(text) ? text.join("\n") : String(text ?? "");
}

async function requireDirector(userId: string) {
  const sql = await getSql();
  const rows = await sql<{ permission_level: string; account_type: string }>`
    select permission_level, account_type from profiles where user_id = ${userId} and is_active = true
  `;
  const p = rows[0];
  if (!p || p.account_type !== "STAFF" || p.permission_level !== "DIRECTOR") {
    throw new Error("Chỉ Giám đốc được bóc tách báo giá");
  }
}

const inputSchema = z.object({
  text: z.string().max(40000).optional(),
  fileName: z.string().max(200).optional(),
  mime: z.string().max(80).optional(),
  base64: z.string().max(6_000_000).optional(),
});

export const parseQuoteWithAI = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(inputSchema)
  .handler(async ({ context, data }): Promise<{ items: ParsedItem[]; source: "ai" | "fallback"; note: string }> => {
    await requireDirector(context.userId);

    let extracted = (data.text ?? "").trim();
    let image: { mime: string; base64: string } | undefined;
    const name = (data.fileName ?? "").toLowerCase();
    const mime = data.mime ?? "";

    if (data.base64) {
      const raw = data.base64.replace(/^data:[^;]+;base64,/, "");
      const buf = Buffer.from(raw, "base64");
      if (buf.length > 4_500_000) throw new Error("File quá lớn (tối đa ~4MB).");

      const isExcel =
        name.endsWith(".xlsx") ||
        name.endsWith(".xls") ||
        name.endsWith(".csv") ||
        mime.includes("spreadsheet") ||
        mime.includes("excel") ||
        mime === "text/csv";
      const isPdf = name.endsWith(".pdf") || mime === "application/pdf";
      const isImage = mime.startsWith("image/") || /\.(png|jpe?g|webp|heic|gif)$/i.test(name);

      if (isExcel) {
        extracted = (await excelToText(buf)).slice(0, 40000);
      } else if (isPdf) {
        extracted = (await pdfToText(new Uint8Array(buf))).slice(0, 40000);
      } else if (isImage) {
        image = { mime: mime.startsWith("image/") ? mime : "image/jpeg", base64: raw };
        extracted = extracted || "Ảnh báo giá / bảng khối lượng đính kèm. Hãy đọc toàn bộ hạng mục trên ảnh.";
      } else {
        extracted = buf.toString("utf8").slice(0, 40000);
      }
    }

    if (!extracted && !image) {
      return { items: [], source: "fallback", note: "Chưa có nội dung báo giá." };
    }

    const structured = parseHuyHoangBoq(extracted);
    if (structured.length >= 8 && !image) {
      return {
        items: structured,
        source: "fallback",
        note: `Đã đọc bảng khối lượng HUY HOÀNG: ${structured.length} hạng mục (không gồm đơn giá / thành tiền). Kiểm tra khối lượng rồi lưu.`,
      };
    }

    try {
      const items = await askGrok({ text: extracted || " ", image });
      const cleaned = items.filter((it) => it.name.length >= 6 && !/^(cô|ng|ty|stt)$/i.test(it.name));
      if (cleaned.length >= structured.length && cleaned.length) {
        return {
          items: cleaned,
          source: "ai",
          note: `AI đã lập ${cleaned.length} hạng mục (không gồm đơn giá). Kiểm tra khối lượng trước khi lưu.`,
        };
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      console.log("[hhb] parseQuoteWithAI", msg);
    }

    const fallback = structured.length ? structured : parseQuoteText(extracted);
    return {
      items: fallback,
      source: "fallback",
      note: fallback.length
        ? `Đã đọc ${fallback.length} hạng mục từ file (không gồm giá).`
        : "Không đọc được hạng mục. Dùng PDF bảng khối lượng HUY HOÀNG hoặc Excel rõ cột.",
    };
  });
