import { useEffect, useState } from "react";
import { createPerson, listPeople, setPersonActive } from "@/lib/hhb/actions";
import { resetPersonPassword, updatePerson } from "@/lib/hhb/people-admin";
import type { Profile } from "@/lib/hhb/types";

export function PeopleAdmin({
  kind,
  title,
  embedded = false,
}: {
  kind: "STAFF" | "CUSTOMER";
  title: string;
  embedded?: boolean;
}) {
  const [rows, setRows] = useState<Profile[] | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () =>
    listPeople({ data: { kind } })
      .then(setRows)
      .catch((e) => setErr(e instanceof Error ? e.message : "Lỗi"));

  useEffect(() => {
    load();
  }, [kind]);

  const startCreate = () => {
    setEditing(null);
    setFullName("");
    setPhone("");
    setPassword("");
    setJobTitle("");
    setIsActive(true);
    setErr(null);
    setOk(null);
    setOpen(true);
  };

  const startEdit = (p: Profile) => {
    setEditing(p);
    setFullName(p.full_name);
    setPhone(p.phone);
    setPassword("");
    setJobTitle(p.job_title ?? "");
    setIsActive(p.is_active);
    setErr(null);
    setOk(null);
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setOk(null);
    setSaving(true);
    try {
      if (editing) {
        await updatePerson({
          data: {
            userId: editing.user_id,
            fullName,
            phone,
            jobTitle: jobTitle || null,
            isActive: editing.permission_level === "DIRECTOR" ? true : isActive,
          },
        });
        if (password.trim().length >= 6) {
          await resetPersonPassword({ data: { userId: editing.user_id, password: password.trim() } });
        }
        setOk("Đã cập nhật tài khoản");
      } else {
        if (password.trim().length < 6) throw new Error("Mật khẩu tối thiểu 6 ký tự");
        await createPerson({
          data: { kind, fullName, phone, password, jobTitle: jobTitle || undefined },
        });
        setOk("Đã tạo tài khoản");
      }
      setOpen(false);
      setEditing(null);
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Không lưu được");
    }
    setSaving(false);
  };

  return (
    <div className={embedded ? "pt-4" : "mx-auto max-w-3xl px-4 py-6 md:px-8"}>
      <div className="mb-4 flex items-center justify-between gap-3">
        {title ? <h1 className="font-display text-3xl">{title}</h1> : <div />}
        <button
          type="button"
          onClick={() => (open ? setOpen(false) : startCreate())}
          className="h-11 shrink-0 rounded-lg bg-accent px-4 text-sm font-semibold text-accent-fg"
        >
          {open ? "Đóng" : kind === "STAFF" ? "+ Thêm nhân sự" : "+ Thêm khách hàng"}
        </button>
      </div>

      {ok && !open ? <p className="mb-3 text-sm text-ok">{ok}</p> : null}

      {open ? (
        <form onSubmit={submit} className="mb-6 space-y-3 rounded-xl border border-border bg-surface p-5">
          <p className="text-sm font-medium">
            {editing ? `Sửa: ${editing.full_name}` : kind === "STAFF" ? "Tạo nhân sự mới" : "Tạo khách hàng mới"}
          </p>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Họ và tên"
            className="h-11 w-full rounded-lg border border-border bg-bg px-3"
          />
          <input
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Số điện thoại (dùng đăng nhập)"
            className="h-11 w-full rounded-lg border border-border bg-bg px-3"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={editing ? "Mật khẩu mới (để trống nếu không đổi)" : "Mật khẩu tạm thời *"}
            required={!editing}
            minLength={editing ? undefined : 6}
            className="h-11 w-full rounded-lg border border-border bg-bg px-3"
          />
          {kind === "STAFF" ? (
            <input
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Chức vụ"
              className="h-11 w-full rounded-lg border border-border bg-bg px-3"
            />
          ) : null}
          {editing && editing.permission_level !== "DIRECTOR" ? (
            <label className="flex items-center gap-2 text-sm text-muted">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              Tài khoản đang hoạt động
            </label>
          ) : null}
          {err ? <p className="text-sm text-danger">{err}</p> : null}
          <button
            type="submit"
            disabled={saving}
            className="h-11 w-full rounded-lg bg-accent font-semibold text-accent-fg disabled:opacity-50"
          >
            {saving ? "Đang lưu..." : editing ? "Lưu thay đổi" : "Tạo tài khoản"}
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
            <div
              key={s.user_id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3"
            >
              <div className="min-w-0">
                <p className="font-medium">
                  {s.full_name}
                  {s.permission_level === "DIRECTOR" ? (
                    <span className="ml-2 text-xs text-accent">Giám đốc</span>
                  ) : null}
                </p>
                <p className="text-sm text-muted">
                  {s.phone}
                  {s.job_title ? ` · ${s.job_title}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    s.is_active ? "bg-ok/20 text-ok" : "bg-danger/20 text-danger"
                  }`}
                >
                  {s.is_active ? "Active" : "Khóa"}
                </span>
                <button
                  type="button"
                  onClick={() => startEdit(s)}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted hover:border-accent hover:text-accent"
                >
                  Sửa
                </button>
                {s.permission_level !== "DIRECTOR" ? (
                  <button
                    type="button"
                    onClick={() =>
                      setPersonActive({ data: { userId: s.user_id, isActive: !s.is_active } }).then(load)
                    }
                    className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted"
                  >
                    {s.is_active ? "Khóa" : "Mở"}
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
