/** Parse HUY HOÀNG BOQ / báo giá into structured project items (no prices). */
export type ParsedItem = {
  name: string;
  unit: string | null;
  quantity: number | null;
  category: string | null;
  description: string | null;
};

const UNIT_TOKEN = String.raw`m2\/tường|m2\/sàn|m\/dài|m2|m²|m3|m³|cái|gói`;

const SECTION_MAP: Record<string, string> = {
  i: "Thi công phần thô",
  ii: "Ốp lát gạch + đá",
  iii: "Thạch cao + sơn nước + chống thấm",
  iv: "Nhôm + kính + sắt",
  v: "Điện và thiết bị vệ sinh",
};

function skipLine(line: string) {
  const s = line.trim();
  if (!s) return true;
  if (s.length <= 2) return true;
  if (/^(stt|tt|mst:?|hotline|tổng|tong|tạm tính|ghi chú|đơn giá|thành tiền|vật liệu|đơn vị|khối lượng)$/i.test(s))
    return true;
  if (/công ty tnhh|bảng khối lượng|xin báo giá|văn phòng:|chương dương/i.test(s)) return true;
  if (/^[-—=.*]+\s*$/.test(s)) return true;
  if (/^[\d.\s,-]+$/.test(s)) return true;
  return false;
}

function parseQty(raw: string | undefined | null) {
  if (!raw) return null;
  const n = Number(String(raw).replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function normalizeUnit(u: string) {
  return u.replace("m²", "m2").replace("m³", "m3").replace("m/dài", "md");
}

function maskWorkWords(s: string) {
  return s
    .replace(/gia công/gi, "GC")
    .replace(/thi công/gi, "TC")
    .replace(/nhân công/gi, "NC")
    .replace(/toàn bộ/gi, "TB")
    .replace(/vật tư/gi, "VT");
}

function splitNameUnitQty(line: string): { name: string; unit: string; quantity: number | null } | null {
  const masked = maskWorkWords(line).replace(/\b\d{1,3}(?:\.\d{3})+\b/g, " ").replace(/\s+/g, " ").trim();
  const re = new RegExp(`(${UNIT_TOKEN}|công|bộ)\\s+(\\d+(?:[.,]\\d+)?)?`, "gi");
  let last: RegExpExecArray | null = null;
  let m: RegExpExecArray | null;
  while ((m = re.exec(masked))) {
    const token = m[1].toLowerCase();
    if ((token === "công" || token === "bộ") && !m[2]) continue;
    last = m;
  }
  if (!last) return null;
  const name = masked
    .slice(0, last.index)
    .replace(/^\d{1,2}\s+/, "")
    .replace(/\b(GC|TC|NC|TB|VT)\b/g, (x) => {
      const map: Record<string, string> = {
        GC: "Gia công",
        TC: "thi công",
        NC: "Nhân công",
        TB: "toàn bộ",
        VT: "vật tư",
      };
      return map[x] ?? x;
    })
    .replace(/[.,;:\-]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (name.length < 6) return null;
  return {
    name,
    unit: normalizeUnit(last[1]),
    quantity: parseQty(last[2]),
  };
}

function looksLikeNewItem(line: string) {
  const m = line.match(/^(\d{1,2})\s+(\S+)/);
  if (!m) return false;
  if (/^(m2|m3|m\/|cái|gói|công|bộ)([/\s]|$)/i.test(m[2])) return false;
  return /[A-Za-zÀ-ỹĂăÂâÊêÔôƠơƯưĐđ]/.test(m[2]);
}

/**
 * Dedicated parser for HUY HOÀNG quotation PDFs:
 * STT | Hạng mục | ĐVT | Khối lượng | (ignore materials / unit price / amount)
 */
export function parseHuyHoangBoq(text: string): ParsedItem[] {
  const lines: string[] = [];
  for (const raw of text.replace(/\r/g, "").split("\n")) {
    const line = raw.replace(/\s+/g, " ").trim();
    if (!line) continue;
    if (skipLine(line) && !/^thi công/i.test(line) && !/^[IVX]{1,3}$/i.test(line) && line !== "I" && !/^\d{1,2}$/.test(line))
      continue;
    lines.push(line);
  }

  const items: ParsedItem[] = [];
  let category: string | null = "Thi công phần thô";
  let pending = "";

  const commit = (blob: string) => {
    const parsed = splitNameUnitQty(blob);
    if (!parsed) return false;
    if (/^tổng/i.test(parsed.name)) return true;
    items.push({ ...parsed, category, description: null });
    return true;
  };

  for (const line of lines) {
    const roman = line.match(/^(I{1,3}|IV|V|VI)$/i);
    if (roman) {
      if (pending) commit(pending);
      pending = "";
      category = SECTION_MAP[roman[1].toLowerCase()] ?? category;
      continue;
    }
    const section = line.match(/^thi công phần\s+(.+)/i);
    if (section) {
      if (pending) commit(pending);
      pending = "";
      const label = section[1].replace(/\s*tổng.*$/i, "").toLowerCase();
      if (label.includes("thô")) category = SECTION_MAP.i;
      else if (label.includes("ốp") || label.includes("gạch")) category = SECTION_MAP.ii;
      else if (label.includes("thạch") || label.includes("sơn") || label.includes("chống")) category = SECTION_MAP.iii;
      else if (label.includes("nhôm") || label.includes("kính") || label.includes("sắt") || label.includes("kinh"))
        category = SECTION_MAP.iv;
      else if (label.includes("điện")) category = SECTION_MAP.v;
      else category = `Thi công phần ${section[1].replace(/\s*tổng.*$/i, "").trim()}`;
      continue;
    }

    if (/^\d{1,2}$/.test(line)) {
      if (pending) commit(pending);
      pending = "";
      continue;
    }

    if (looksLikeNewItem(line)) {
      if (pending) commit(pending);
      pending = line.replace(/^\d{1,2}\s+/, "");
      if (commit(pending)) pending = "";
      continue;
    }

    if (pending) {
      pending = `${pending} ${line}`;
      if (commit(pending)) pending = "";
    } else if (looksLikeNewItem(`1 ${line}`) || splitNameUnitQty(line)) {
      pending = line;
      if (commit(pending)) pending = "";
    }
  }
  if (pending) commit(pending);

  const seen = new Set<string>();
  return items.filter((it) => {
    if (/^(sl|m2|m3|cái|gói)\b/i.test(it.name)) return false;
    if (/^cường lực/i.test(it.name)) return false;
    const cat = (it.category ?? "").toLowerCase();
    if (cat.includes("nhôm") || cat.includes("kinh") || cat.includes("kính")) {
      it.category = "Nhôm + kính + sắt";
    }
    if (cat.includes("điện")) it.category = "Điện và thiết bị vệ sinh";
    const k = `${it.category}|${it.name}|${it.quantity}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return it.name.length >= 6;
  });
}

export function parseQuoteText(text: string): ParsedItem[] {
  const boq = parseHuyHoangBoq(text);
  if (boq.length >= 5) return boq;

  const out: ParsedItem[] = [];
  for (const line of text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 8)) {
    if (skipLine(line)) continue;
    if (line.includes("|")) {
      const [name, unit, qty] = line.split("|").map((x) => x.trim());
      if (name && name.length >= 6) {
        out.push({ name, unit: unit || null, quantity: qty ? parseQty(qty) : null, category: null, description: null });
      }
      continue;
    }
    const parsed = splitNameUnitQty(line);
    if (parsed) out.push({ ...parsed, category: null, description: null });
  }
  return out;
}

export const DEFAULT_ITEMS: ParsedItem[] = [
  { name: "Diện tích sàn / phần thô", unit: "m2", quantity: null, category: "Thi công phần thô", description: null },
  { name: "Xây tô tường", unit: "m2", quantity: null, category: "Thi công phần thô", description: null },
  { name: "Lát gạch nền", unit: "m2", quantity: null, category: "Ốp lát gạch + đá", description: null },
  { name: "Trần thạch cao", unit: "m2", quantity: null, category: "Thạch cao + sơn nước + chống thấm", description: null },
  { name: "Sơn nước", unit: "m2", quantity: null, category: "Thạch cao + sơn nước + chống thấm", description: null },
  { name: "Cửa nhôm kính", unit: "m2", quantity: null, category: "Nhôm + kính + sắt", description: null },
  { name: "Điện nước âm", unit: "m2", quantity: null, category: "Điện và thiết bị vệ sinh", description: null },
];
