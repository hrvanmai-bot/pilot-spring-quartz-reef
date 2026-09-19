import { useEffect, useState } from "react";
import { createPerson, listPeople, setPersonActive } from "@/lib/hhb/actions";
import type { Profile } from "@/lib/hhb/types";

export function PeopleAdmin({ kind, title }: { kind: "STAFF" | "CUSTOMER"; title: string }) {
  const [rows, setRows] = useState<Profile[] | null>(null);
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () =>
    listPeople({ data: { kind } })
      .then(setRows)
      .catch((e) => setErr(e instanceof Error ? e.message : "Lỗi"));

  useEffect(() => {
    load();
  }, [kind]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setSaving(true);
    try {
      await createPerson({ data: { kind, fullName, phone, password, jobTitle: jobTitle || undefined } });
      setFullName("");
      setPhone("");
      setPassword("");
      setJobTitle("");
      setOpen(false);
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Không tạo được");
    }
    setSaving(false);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl">{title}</h1>
        <button type="button" onClick={() => setOpen((v) => !v)} className="h-11 rounded-lg bg-accent px-4 text-sm font-semibold text-accent-fg">
          {open ? "Đóng" : "Thêm"}
        </button>
      </div>
      {open ? (
        <form onSubmit={submit} className="mb-6 space-y-3 rounded-xl border border-border bg-surface p-5">
          <input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Họ và tên" className="h-11 w-full rounded-lg border border-border bg-bg px-3" />
          <input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Số điện thoại" className="h-11 w-full rounded-lg border border-border bg-bg px-3" />
          <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mật khẩu tạm thời" className="h-11 w-full rounded-lg border border-border bg-bg px-3" />
          {kind === "STAFF" ? (
            <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Chức vụ" className="h-11 w-full rounded-lg border border-border bg-bg px-3" />
          ) : null}
          {err ? <p className="text-sm text-danger">{err}</p> : null}
          <button type="submit" disabled={saving} className="h-11 w-full rounded-lg bg-accent font-semibold text-accent-fg disabled:opacity-50">
            {saving ? "Đang tạo..." : "Tạo tài khoản"}
          </button>
        </form>
      ) : null}
      {rows === null ? (
        <div className="h-24 animate-pulse rounded-xl bg-surface" />
      ) : rows.length === 0 ? (
        <p className="text-muted">Chưa có dữ liệu</p>
      ) : (
        <div className="space-y-2">
          {rows.map((s) => (
            <div key={s.user_id} className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
              <div>
                <p className="font-medium">
                  {s.full_name}
                  {s.permission_level === "DIRECTOR" ? <span className="ml-2 text-xs text-accent">Giám đốc</span> : null}
                </p>
                <p className="text-sm text-muted">
                  {s.phone}
                  {s.job_title ? ` · ${s.job_title}` : ""}
                </p>
              </div>
              {s.permission_level !== "DIRECTOR" ? (
                <button
                  type="button"
                  onClick={() => setPersonActive({ data: { userId: s.user_id, isActive: !s.is_active } }).then(load)}
                  className={`rounded-full px-2 py-1 text-xs ${s.is_active ? "bg-ok/20 text-ok" : "bg-danger/20 text-danger"}`}
                >
                  {s.is_active ? "Active" : "Inactive"}
                </button>
              ) : (
                <span className="rounded-full bg-ok/20 px-2 py-1 text-xs text-ok">Active</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
