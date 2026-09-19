import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera } from "lucide-react";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { ProgressBar } from "@/components/ProgressBar";
import { RequireAuth } from "@/components/RequireAuth";
import { StatusBadge } from "@/components/StatusBadge";
import { getProjectDetail, setProjectStatus, updateItemStatus, updateProgress } from "@/lib/hhb/actions";
import { ITEM_STATUS_LABEL, JOURNAL_CATEGORY_LABEL, type ItemStatus, type JournalCategory } from "@/lib/hhb/types";
import { formatDate, formatDateTime } from "@/lib/utils";

export const Route = createFileRoute("/projects/$id")({ component: Page });

function Page() {
  return (
    <RequireAuth>
      <Detail />
    </RequireAuth>
  );
}

type Tab = "overview" | "items" | "images" | "journals" | "info";

function Detail() {
  const { id } = Route.useParams();
  const pid = Number(id);
  const [data, setData] = useState<Awaited<ReturnType<typeof getProjectDetail>> | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [progress, setProgress] = useState(0);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const load = () =>
    getProjectDetail({ data: { id: pid } })
      .then((d) => {
        setData(d);
        setProgress(d.project.progress);
      })
      .catch((e) => setErr(e instanceof Error ? e.message : "Không thể tải dữ liệu."));

  useEffect(() => {
    load();
  }, [pid]);

  if (err) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-muted">{err}</p>
        <button type="button" onClick={() => location.reload()} className="mt-4 rounded-lg bg-accent px-4 py-2 font-semibold text-accent-fg">
          Thử lại
        </button>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-8">
        <div className="h-8 w-2/3 animate-pulse rounded bg-surface" />
        <div className="h-40 animate-pulse rounded-xl bg-surface" />
      </div>
    );
  }

  const { profile, project, items, journals, logs, gallery } = data;
  const director = profile.permission_level === "DIRECTOR";
  const staff = profile.account_type === "STAFF";
  const active = project.status === "ACTIVE";

  const complete = async () => {
    if (!confirm("Chuyển sang Đã hoàn thiện? Tiến độ sẽ = 100%.")) return;
    setSaving(true);
    await setProjectStatus({ data: { projectId: pid, status: "COMPLETED" } });
    await load();
    setSaving(false);
  };
  const reopen = async () => {
    if (!confirm("Mở lại công trình đang thi công?")) return;
    setSaving(true);
    await setProjectStatus({ data: { projectId: pid, status: "ACTIVE" } });
    await load();
    setSaving(false);
  };
  const saveProgress = async () => {
    setSaving(true);
    setMsg(null);
    try {
      await updateProgress({ data: { projectId: pid, progress, note } });
      setMsg("Đã cập nhật tiến độ");
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Lỗi");
    }
    setSaving(false);
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Tổng quan" },
    { key: "items", label: "Hạng mục" },
    { key: "images", label: "Hình ảnh" },
    { key: "journals", label: "Nhật ký" },
    { key: "info", label: "Thông tin" },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-8">
      <Link to="/projects" className="text-sm text-muted hover:text-accent">
        ← Công trình
      </Link>
      <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="font-display text-3xl">{project.name}</h1>
          <p className="mt-1 text-sm text-muted">
            {project.code}
            {project.customer_name ? ` · ${project.customer_name}` : ""}
          </p>
        </div>
        <StatusBadge status={project.status} />
      </div>
      <div className="mt-5">
        <ProgressBar value={project.progress} />
      </div>

      {staff && active ? (
        <Link
          to="/projects/$id/journal"
          params={{ id: String(pid) }}
          className="mt-5 flex h-14 items-center justify-center gap-2 rounded-xl bg-accent text-lg font-bold text-accent-fg"
        >
          <Camera className="size-5" /> Ghi nhật ký
        </Link>
      ) : null}

      {director ? (
        <div className="mt-4 flex gap-2">
          {active ? (
            <button type="button" disabled={saving} onClick={complete} className="rounded-lg border border-ok/40 bg-ok/15 px-4 py-2 text-sm font-medium text-ok">
              Hoàn thành
            </button>
          ) : (
            <button type="button" disabled={saving} onClick={reopen} className="rounded-lg border border-accent/40 bg-accent/15 px-4 py-2 text-sm font-medium text-accent">
              Mở lại
            </button>
          )}
        </div>
      ) : null}

      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium ${tab === t.key ? "border-accent text-accent" : "border-transparent text-muted"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="mt-6 space-y-6">
          {director && active ? (
            <div className="rounded-xl border border-border bg-surface p-5">
              <h3 className="mb-3 font-semibold">Cập nhật tiến độ</h3>
              <div className="mb-3 flex items-center gap-4">
                <input type="range" min={0} max={100} value={progress} onChange={(e) => setProgress(Number(e.target.value))} className="flex-1" />
                <span className="w-12 text-right font-bold tabular-nums text-accent">{progress}%</span>
              </div>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ghi chú (tuỳ chọn)"
                className="mb-3 h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm outline-none focus:border-accent"
              />
              <button
                type="button"
                disabled={saving || progress === project.progress}
                onClick={saveProgress}
                className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-fg disabled:opacity-50"
              >
                Lưu tiến độ
              </button>
              {msg ? <p className="mt-2 text-sm text-ok">{msg}</p> : null}
            </div>
          ) : null}
          {logs.length > 0 ? (
            <div>
              <h3 className="mb-3 font-semibold">Lịch sử tiến độ</h3>
              <div className="space-y-2">
                {logs.map((l) => (
                  <div key={l.id} className="rounded-lg border border-border bg-surface px-4 py-3 text-sm">
                    <span className="text-accent">
                      {l.old_progress}% → {l.new_progress}%
                    </span>
                    {l.note ? <span className="text-muted"> · {l.note}</span> : null}
                    <p className="mt-1 text-xs text-subtle">
                      {l.changed_by_name} · {formatDateTime(l.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {tab === "items" && (
        <div className="mt-6 space-y-2">
          {items.length === 0 ? (
            <EmptyState title="Chưa có hạng mục" />
          ) : (
            items.map((it) => (
              <div key={it.id} className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3">
                <div>
                  <p className="font-medium">{it.name}</p>
                  {it.description ? <p className="text-sm text-muted">{it.description}</p> : null}
                  {director && it.internal_cost ? <p className="text-xs text-subtle">Chi phí nội bộ: {it.internal_cost}</p> : null}
                </div>
                {director ? (
                  <select
                    value={it.status}
                    onChange={async (e) => {
                      await updateItemStatus({ data: { itemId: it.id, status: e.target.value as ItemStatus } });
                      load();
                    }}
                    className="rounded-md border border-border bg-bg px-2 py-1 text-sm"
                  >
                    {(Object.keys(ITEM_STATUS_LABEL) as ItemStatus[]).map((k) => (
                      <option key={k} value={k}>
                        {ITEM_STATUS_LABEL[k]}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-sm text-muted">{ITEM_STATUS_LABEL[it.status]}</span>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {tab === "images" && (
        <div className="mt-6">
          {gallery.length === 0 ? (
            <EmptyState title="Chưa có hình ảnh" />
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {gallery.map((g) => (
                <button key={g.id} type="button" onClick={() => setLightbox(g.data_url)} className="aspect-square overflow-hidden rounded-lg border border-border bg-surface">
                  <img src={g.data_url} alt={g.caption ?? "Ảnh công trình"} className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "journals" && (
        <div className="mt-6 space-y-4">
          {journals.length === 0 ? (
            <EmptyState title="Chưa có nhật ký" />
          ) : (
            journals.map((j) => (
              <div key={j.id} className="rounded-xl border border-border bg-surface p-4">
                <p className="text-xs text-muted">
                  {j.author_name} · {JOURNAL_CATEGORY_LABEL[j.category as JournalCategory]} · {formatDateTime(j.created_at)}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm">{j.content}</p>
                {j.images.length > 0 ? (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {j.images.map((im) => (
                      <button key={im.id} type="button" onClick={() => setLightbox(im.data_url)} className="aspect-square overflow-hidden rounded-md">
                        <img src={im.data_url} alt="" className="size-full object-cover" />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
      )}

      {tab === "info" && (
        <dl className="mt-6 space-y-3 rounded-xl border border-border bg-surface p-5 text-sm">
          <Row label="Mã công trình" value={project.code} />
          <Row label="Địa chỉ" value={project.address} />
          <Row label="Loại" value={project.project_type || "—"} />
          <Row label="Khách hàng" value={project.customer_name || "—"} />
          <Row label="Ngày khởi công" value={formatDate(project.start_date)} />
          <Row label="Dự kiến hoàn thành" value={formatDate(project.expected_end_date)} />
          <Row label="Hoàn thành thực tế" value={formatDate(project.actual_end_date)} />
        </dl>
      )}

      {lightbox ? (
        <button type="button" className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" className="max-h-full max-w-full object-contain" />
        </button>
      ) : null}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}
