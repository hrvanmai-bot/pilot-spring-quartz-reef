import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FileUp, Plus, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { listCustomersLite } from "@/lib/hhb/actions";
import { createProjectRich } from "@/lib/hhb/create-project-rich";
import { DEFAULT_ITEMS, type ParsedItem } from "@/lib/hhb/parse-quote";
import { parseQuoteWithAI } from "@/lib/hhb/parse-quote-ai";
import { compressImage } from "@/lib/utils";

export const Route = createFileRoute("/admin/projects/new")({ component: Page });

function Page() {
  return (
    <RequireAuth>
      <Form />
    </RequireAuth>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result ?? "").split(",")[1] ?? "");
    r.onerror = () => reject(new Error("Không đọc được file"));
    r.readAsDataURL(file);
  });
}

function Form() {
  const nav = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [customers, setCustomers] = useState<{ id: number; name: string; phone: string }[]>([]);
  const [name, setName] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [address, setAddress] = useState("");
  const [projectType, setProjectType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [expectedEndDate, setExpectedEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<ParsedItem[]>(DEFAULT_ITEMS.map((x) => ({ ...x })));
  const [quoteText, setQuoteText] = useState("");
  const [fileLabel, setFileLabel] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importNote, setImportNote] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<{ name: string; mime: string; base64: string } | null>(null);

  useEffect(() => {
    listCustomersLite().then(setCustomers).catch(() => {});
  }, []);

  const updateItem = (idx: number, patch: Partial<ParsedItem>) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };

  const addRow = () =>
    setItems((prev) => [...prev, { name: "", unit: "", quantity: null, category: "", description: null }]);

  const removeRow = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const onPickFile = async (file: File | undefined) => {
    if (!file) return;
    setErr(null);
    if (file.size > 4_500_000) {
      setErr("File tối đa 4MB. Nén ảnh hoặc xuất Excel gọn hơn.");
      return;
    }
    try {
      let mime = file.type || "application/octet-stream";
      let base64: string;
      if (mime.startsWith("image/")) {
        const dataUrl = await compressImage(file, 1600, 0.78);
        mime = "image/jpeg";
        base64 = dataUrl.split(",")[1] ?? "";
      } else {
        base64 = await fileToBase64(file);
      }
      setPendingFile({ name: file.name, mime, base64 });
      setFileLabel(file.name);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Không đọc được file");
    }
  };

  const importQuote = async () => {
    if (!quoteText.trim() && !pendingFile) {
      setErr("Hãy tải file báo giá (Excel / PDF / ảnh) hoặc dán nội dung.");
      return;
    }
    setErr(null);
    setImportNote(null);
    setImporting(true);
    try {
      const res = await parseQuoteWithAI({
        data: {
          text: quoteText || undefined,
          fileName: pendingFile?.name,
          mime: pendingFile?.mime,
          base64: pendingFile?.base64,
        },
      });
      if (!res.items.length) {
        setErr(res.note || "Không đọc được hạng mục từ báo giá.");
        return;
      }
      setItems(res.items);
      setImportNote(res.note);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Không bóc tách được báo giá");
    } finally {
      setImporting(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const clean = items
      .map((it) => ({
        name: it.name.trim(),
        unit: it.unit?.trim() || null,
        quantity: it.quantity,
        category: it.category?.trim() || null,
        description: it.description?.trim() || null,
      }))
      .filter((it) => it.name.length > 0);
    if (!clean.length) {
      setErr("Cần ít nhất 1 hạng mục thi công");
      return;
    }
    setSaving(true);
    try {
      const res = await createProjectRich({
        data: {
          name,
          customerId: Number(customerId),
          address,
          projectType: projectType || undefined,
          startDate: startDate || undefined,
          expectedEndDate: expectedEndDate || undefined,
          description: description || undefined,
          items: clean,
        },
      });
      nav({ to: "/projects/$id", params: { id: String(res.id) } });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Không tạo được công trình");
    }
    setSaving(false);
  };

  const groups = [...new Set(items.map((i) => i.category?.trim() || "Khác"))];

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Link to="/projects" className="text-sm text-muted hover:text-accent">
        ← Quay lại
      </Link>
      <h1 className="mt-3 font-display text-3xl uppercase tracking-wide">Tạo công trình</h1>
      <p className="mt-1 text-sm text-muted">
        Tải báo giá — AI lập bảng hạng mục (không hiện giá) để kỹ sư, nhân viên và khách theo dõi.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tên công trình *"
          className="h-12 w-full rounded-lg border border-border bg-surface px-4"
        />
        <select
          required
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          className="h-12 w-full rounded-lg border border-border bg-surface px-4"
        >
          <option value="">— Chọn khách hàng —</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.phone})
            </option>
          ))}
        </select>
        {customers.length === 0 ? (
          <p className="text-xs text-accent">Hãy tạo khách hàng trước tại Cài đặt → Khách hàng.</p>
        ) : null}
        <input
          required
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Địa chỉ *"
          className="h-12 w-full rounded-lg border border-border bg-surface px-4"
        />
        <input
          value={projectType}
          onChange={(e) => setProjectType(e.target.value)}
          placeholder="Loại (Nhà phố, Căn hộ...)"
          className="h-12 w-full rounded-lg border border-border bg-surface px-4"
        />
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs text-muted">
            Khởi công
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm"
            />
          </label>
          <label className="text-xs text-muted">
            Dự kiến xong
            <input
              type="date"
              value={expectedEndDate}
              onChange={(e) => setExpectedEndDate(e.target.value)}
              className="mt-1 h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm"
            />
          </label>
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Mô tả / ghi chú"
          className="w-full rounded-lg border border-border bg-surface px-4 py-3"
        />

        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-semibold">Hạng mục thi công</h2>
              <p className="text-xs text-muted">Không hiện đơn giá — chỉ tên, nhóm, ĐVT, khối lượng.</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowImport((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent"
              >
                <Sparkles className="size-4" /> Tải báo giá AI
              </button>
              <button
                type="button"
                onClick={addRow}
                className="inline-flex items-center gap-1 rounded-lg bg-surface-2 px-3 py-1.5 text-sm font-medium text-muted hover:text-fg"
              >
                <Plus className="size-4" /> Thêm dòng
              </button>
            </div>
          </div>

          {showImport ? (
            <div className="mb-4 space-y-3 rounded-xl border border-accent/25 p-4">
              <p className="text-sm font-semibold">AI đọc Excel · PDF · ảnh</p>
              <p className="text-xs text-muted">
                Tải file báo giá. AI lập bảng hạng mục chi tiết, bỏ hết giá tiền, để nhân viên và khách theo dõi thi công.
              </p>
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls,.csv,.pdf,image/png,image/jpeg,image/webp,image/heic"
                className="hidden"
                onChange={(e) => {
                  void onPickFile(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex h-24 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-bg text-sm text-muted hover:border-accent hover:text-accent"
              >
                <FileUp className="size-6" />
                {fileLabel ? <span className="text-fg">{fileLabel}</span> : <span>Chọn file Excel, PDF hoặc ảnh</span>}
                <span className="text-xs text-subtle">Tối đa 4MB</span>
              </button>
              <textarea
                value={quoteText}
                onChange={(e) => setQuoteText(e.target.value)}
                rows={4}
                placeholder="Hoặc dán chữ báo giá tại đây (không cần đơn giá)..."
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <button
                type="button"
                onClick={importQuote}
                disabled={importing}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-accent-fg disabled:opacity-60"
              >
                <Sparkles className="size-4" />
                {importing ? "AI đang đọc báo giá..." : "AI lập bảng hạng mục"}
              </button>
            </div>
          ) : null}

          {importNote ? <p className="mb-3 text-xs text-ok">{importNote}</p> : null}

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="bg-bg text-xs text-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">#</th>
                  <th className="px-3 py-2 font-medium">Hạng mục</th>
                  <th className="px-3 py-2 font-medium">Nhóm</th>
                  <th className="px-3 py-2 font-medium">ĐVT</th>
                  <th className="px-3 py-2 font-medium">Khối lượng</th>
                  <th className="px-3 py-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => (
                  <tr key={idx} className="border-t border-border/70">
                    <td className="px-3 py-2 text-subtle">{idx + 1}</td>
                    <td className="px-3 py-2">
                      <input
                        value={it.name}
                        onChange={(e) => updateItem(idx, { name: e.target.value })}
                        required
                        className="h-9 w-full rounded-md border border-border bg-bg px-2"
                        placeholder="Tên hạng mục"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={it.category ?? ""}
                        onChange={(e) => updateItem(idx, { category: e.target.value })}
                        className="h-9 w-full rounded-md border border-border bg-bg px-2"
                        placeholder="Kết cấu..."
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={it.unit ?? ""}
                        onChange={(e) => updateItem(idx, { unit: e.target.value })}
                        className="h-9 w-20 rounded-md border border-border bg-bg px-2"
                        placeholder="m2"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        step="any"
                        value={it.quantity ?? ""}
                        onChange={(e) =>
                          updateItem(idx, {
                            quantity: e.target.value === "" ? null : Number(e.target.value),
                          })
                        }
                        className="h-9 w-24 rounded-md border border-border bg-bg px-2"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => removeRow(idx)}
                        className="rounded p-1.5 text-muted hover:bg-danger/15 hover:text-danger"
                        aria-label="Xóa"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-subtle">
            {items.filter((i) => i.name.trim()).length} hạng mục · {groups.length} nhóm · không gồm giá
          </p>
        </div>

        {err ? <p className="text-sm text-danger">{err}</p> : null}
        <button
          type="submit"
          disabled={saving}
          className="h-12 w-full rounded-xl bg-accent font-semibold text-accent-fg disabled:opacity-50"
        >
          {saving ? "Đang tạo..." : "Tạo công trình"}
        </button>
      </form>
    </div>
  );
}
