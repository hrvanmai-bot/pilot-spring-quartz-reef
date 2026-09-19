import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { createProject, listCustomersLite } from "@/lib/hhb/actions";

export const Route = createFileRoute("/admin/projects/new")({ component: Page });

function Page() {
  return (
    <RequireAuth>
      <Form />
    </RequireAuth>
  );
}

function Form() {
  const nav = useNavigate();
  const [customers, setCustomers] = useState<{ id: number; name: string; phone: string }[]>([]);
  const [name, setName] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [address, setAddress] = useState("");
  const [projectType, setProjectType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [expectedEndDate, setExpectedEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState("Móng\nKết cấu\nXây tô\nĐiện nước âm\nChống thấm\nSơn nước");
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listCustomersLite().then(setCustomers).catch(() => {});
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setSaving(true);
    try {
      const res = await createProject({
        data: {
          name,
          customerId: Number(customerId),
          address,
          projectType: projectType || undefined,
          startDate: startDate || undefined,
          expectedEndDate: expectedEndDate || undefined,
          description: description || undefined,
          items: items.split("\n").map((s) => s.trim()).filter(Boolean),
        },
      });
      nav({ to: "/projects/$id", params: { id: String(res.id) } });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Không tạo được công trình");
    }
    setSaving(false);
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <Link to="/projects" className="text-sm text-muted hover:text-accent">
        ← Quay lại
      </Link>
      <h1 className="mt-3 font-display text-3xl">Tạo công trình</h1>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên công trình" className="h-12 w-full rounded-lg border border-border bg-surface px-4" />
        <select required value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="h-12 w-full rounded-lg border border-border bg-surface px-4">
          <option value="">— Chọn khách hàng —</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.phone})
            </option>
          ))}
        </select>
        {customers.length === 0 ? <p className="text-xs text-accent">Hãy tạo khách hàng trước.</p> : null}
        <input required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Địa chỉ" className="h-12 w-full rounded-lg border border-border bg-surface px-4" />
        <input value={projectType} onChange={(e) => setProjectType(e.target.value)} placeholder="Loại (Nhà phố, Căn hộ...)" className="h-12 w-full rounded-lg border border-border bg-surface px-4" />
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs text-muted">
            Khởi công
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm" />
          </label>
          <label className="text-xs text-muted">
            Dự kiến xong
            <input type="date" value={expectedEndDate} onChange={(e) => setExpectedEndDate(e.target.value)} className="mt-1 h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm" />
          </label>
        </div>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Mô tả" className="w-full rounded-lg border border-border bg-surface px-4 py-3" />
        <textarea value={items} onChange={(e) => setItems(e.target.value)} rows={6} className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm" />
        {err ? <p className="text-sm text-danger">{err}</p> : null}
        <button type="submit" disabled={saving} className="h-12 w-full rounded-xl bg-accent font-semibold text-accent-fg disabled:opacity-50">
          {saving ? "Đang tạo..." : "Tạo công trình"}
        </button>
      </form>
    </div>
  );
}
