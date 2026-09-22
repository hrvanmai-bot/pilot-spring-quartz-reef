import { useEffect, useState } from "react";
import { listProjectStaff, listStaffLite, setProjectStaff } from "@/lib/hhb/project-staff";

type StaffLite = { user_id: string; full_name: string; phone: string; job_title: string | null };

export function ProjectStaffPanel({
  projectId,
  director,
}: {
  projectId: number;
  director: boolean;
}) {
  const [all, setAll] = useState<StaffLite[]>([]);
  const [assigned, setAssigned] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const [staff, proj] = await Promise.all([
        listStaffLite(),
        listProjectStaff({ data: { projectId } }),
      ]);
      setAll(staff);
      setAssigned(proj.map((p) => p.staff_user_id));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Không tải được nhân sự");
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [projectId]);

  const toggle = (uid: string) => {
    if (!director) return;
    setAssigned((prev) => (prev.includes(uid) ? prev.filter((x) => x !== uid) : [...prev, uid]));
  };

  const save = async () => {
    setSaving(true);
    setMsg(null);
    setErr(null);
    try {
      await setProjectStaff({ data: { projectId, staffUserIds: assigned } });
      setMsg(`Đã gán ${assigned.length} nhân sự`);
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Lỗi lưu");
    }
    setSaving(false);
  };

  if (loading) return <div className="mt-6 h-24 animate-pulse rounded-xl bg-surface" />;
  if (err && all.length === 0) return <p className="mt-6 text-sm text-danger">{err}</p>;

  return (
    <div className="mt-6 space-y-4">
      <p className="text-sm text-muted">
        {director
          ? "Chọn nhân sự phụ trách công trình này. Họ vẫn xem được tất cả CT; danh sách giúp theo dõi phân công."
          : "Nhân sự được phân công cho công trình."}
      </p>

      {all.length === 0 ? (
        <p className="text-sm text-muted">Chưa có nhân sự. Tạo tại Cài đặt → Nhân sự.</p>
      ) : (
        <div className="space-y-2">
          {all.map((s) => {
            const on = assigned.includes(s.user_id);
            return (
              <button
                key={s.user_id}
                type="button"
                disabled={!director}
                onClick={() => toggle(s.user_id)}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left ${
                  on ? "border-accent/50 bg-accent/10" : "border-border bg-surface"
                } ${director ? "" : "cursor-default"}`}
              >
                <div>
                  <p className="font-medium">{s.full_name}</p>
                  <p className="text-xs text-muted">
                    {s.phone}
                    {s.job_title ? ` · ${s.job_title}` : ""}
                  </p>
                </div>
                <span className={`text-xs font-medium ${on ? "text-accent" : "text-subtle"}`}>
                  {on ? "Đã gán" : director ? "Chạm để gán" : "—"}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {director ? (
        <button
          type="button"
          disabled={saving}
          onClick={save}
          className="h-12 w-full rounded-xl bg-accent font-semibold text-accent-fg disabled:opacity-50"
        >
          {saving ? "Đang lưu..." : "Lưu phân công"}
        </button>
      ) : null}
      {msg ? <p className="text-sm text-ok">{msg}</p> : null}
      {err ? <p className="text-sm text-danger">{err}</p> : null}
    </div>
  );
}
