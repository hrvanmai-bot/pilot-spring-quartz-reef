import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, ImagePlus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { ProgressBar } from "@/components/ProgressBar";
import { ProjectStaffPanel } from "@/components/ProjectStaffPanel";
import { RequireAuth } from "@/components/RequireAuth";
import { StatusBadge } from "@/components/StatusBadge";
import {
  getProjectDetail,
  setProjectCover,
  setProjectStatus,
  updateItemStatus,
  updateProgress,
} from "@/lib/hhb/actions";
import {
  ITEM_STATUS_LABEL,
  JOURNAL_CATEGORY_LABEL,
  type ItemStatus,
  type JournalCategory,
} from "@/lib/hhb/types";
import { compressImage, formatDate, formatDateTime } from "@/lib/utils";

export const Route = createFileRoute("/projects/$id")({ component: Page });

function Page() {
  return (
    <RequireAuth>
      <Detail />
    </RequireAuth>
  );
}

type Tab = "items" | "progress" | "journals" | "staff";

function dayKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dayLabel(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function statusTone(s: ItemStatus) {
  if (s === "COMPLETED") return "bg-ok/15 text-ok";
  if (s === "IN_PROGRESS") return "bg-accent/15 text-accent";
  return "bg-surface-2 text-muted";
}

function Detail() {
  const { id } = Route.useParams();
  const pid = Number(id);
  const coverRef = useRef<HTMLInputElement>(null);
  const [data, setData] = useState<Awaited<ReturnType<typeof getProjectDetail>> | null>(null);
  const [tab, setTab] = useState<Tab>("items");
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

  const byDay = useMemo(() => {
    if (!data) return [] as { key: string; journals: typeof data.journals }[];
    const map = new Map<string, { journals: typeof data.journals }>();
    for (const j of data.journals) {
      const k = dayKey(j.created_at);
      if (!map.has(k)) map.set(k, { journals: [] });
      map.get(k)!.journals.push(j);
    }
    return [...map.entries()]
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([key, v]) => ({ key, ...v }));
  }, [data]);

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
        <div className="h-40 animate-pulse rounded-xl bg-surface" />
        <div className="h-8 w-2/3 animate-pulse rounded bg-surface" />
      </div>
    );
  }

  const { profile, project, items, journals } = data;
  const director = profile.permission_level === "DIRECTOR";
  const staff = profile.account_type === "STAFF";
  const customer = profile.account_type === "CUSTOMER";
  const active = project.status === "ACTIVE";
  const doneCount = items.filter((i) => i.status === "COMPLETED").length;

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
      setMsg("Đã cập nhật % tiến độ");
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Lỗi");
    }
    setSaving(false);
  };

  const onCover = async (file: File | undefined) => {
    if (!file) return;
    setSaving(true);
    try {
      const dataUrl = await compressImage(file, 1400, 0.74);
      await setProjectCover({ data: { projectId: pid, dataUrl } });
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Không đổi được ảnh đại diện");
    }
    setSaving(false);
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "items", label: "Hạng mục thi công" },
    { key: "progress", label: "Tiến độ thi công" },
    ...(staff ? [{ key: "journals" as Tab, label: "Nhật ký công trình" }] : []),
    ...(director ? [{ key: "staff" as Tab, label: "Nhân sự" }] : []),
  ];

  const groups = Array.from(
    items.reduce((m, it) => {
      const k = it.category?.trim() || "Khác";
      const arr = m.get(k) ?? [];
      arr.push(it);
      m.set(k, arr);
      return m;
    }, new Map<string, typeof items>()),
  );

  return (
    <div className="mx-auto max-w-3xl pb-8">
      <div className="relative h-52 overflow-hidden bg-surface md:h-64 md:rounded-b-xl">
        {project.cover_image_url ? (
          <img src={project.cover_image_url} alt="" className="size-full object-cover" />
        ) : (
          <div className="grid size-full place-items-center text-muted">
            <div className="text-center">
              <ImagePlus className="mx-auto size-8 opacity-50" />
              <p className="mt-2 text-sm">Chưa có ảnh đại diện</p>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
        {staff ? (
          <>
            <input
              ref={coverRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                void onCover(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => coverRef.current?.click()}
              className="absolute right-3 top-3 rounded-lg bg-bg/80 px-3 py-1.5 text-xs font-medium backdrop-blur"
            >
              Đổi ảnh
            </button>
          </>
        ) : null}
        <div className="absolute inset-x-0 bottom-0 px-4 pb-4">
          <Link to="/projects" className="text-xs text-muted hover:text-accent">
            ← Công trình
          </Link>
          <h1 className="mt-1 font-display text-3xl leading-none">{project.name}</h1>
          <p className="mt-1 text-sm text-muted">
            {project.code}
            {project.customer_name ? ` · ${project.customer_name}` : ""}
          </p>
        </div>
      </div>

      <div className="px-4 md:px-0">
        <div className="mt-4 flex items-center justify-between gap-3">
          <StatusBadge status={project.status} />
          <p className="text-xs text-subtle">{project.address}</p>
        </div>
        <div className="mt-3">
          <ProgressBar value={project.progress} />
          <p className="mt-1 text-xs text-subtle">
            Hạng mục hoàn thành {doneCount}/{items.length}
          </p>
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
          <div className="mt-3 flex gap-2">
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
              className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium ${tab === t.key ? "border-accent text-accent" : "border-transparent text-muted"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "items" && (
          <div className="mt-6">
            {items.length === 0 ? (
              <EmptyState title="Chưa có hạng mục" />
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-muted">
                  Bảng theo dõi thi công — không gồm đơn giá.
                  {director ? " Chỉ Giám đốc được đổi trạng thái." : " Chỉ xem, không chỉnh sửa."}
                </p>
                {groups.map(([group, rows]) => (
                  <div key={group} className="overflow-hidden rounded-xl border border-border">
                    <div className="flex items-center justify-between bg-surface px-4 py-2.5">
                      <p className="text-sm font-semibold text-accent">{group}</p>
                      <p className="text-xs text-subtle">{rows.length} mục</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[480px] text-left text-sm">
                        <thead className="text-xs text-muted">
                          <tr>
                            <th className="px-3 py-2 font-medium">Hạng mục</th>
                            <th className="px-3 py-2 font-medium">ĐVT</th>
                            <th className="px-3 py-2 text-right font-medium">Khối lượng</th>
                            <th className="px-3 py-2 font-medium">Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((it) => (
                            <tr key={it.id} className="border-t border-border/70">
                              <td className="px-3 py-2.5">
                                <p className="font-medium">{it.name}</p>
                              </td>
                              <td className="px-3 py-2.5 text-muted">{it.unit || "—"}</td>
                              <td className="px-3 py-2.5 text-right tabular-nums">{it.quantity ?? "—"}</td>
                              <td className="px-3 py-2.5">
                                {director ? (
                                  <select
                                    value={it.status}
                                    onChange={async (e) => {
                                      await updateItemStatus({
                                        data: { itemId: it.id, status: e.target.value as ItemStatus },
                                      });
                                      load();
                                    }}
                                    className="rounded-md border border-border bg-bg px-2 py-1 text-xs"
                                  >
                                    {(Object.keys(ITEM_STATUS_LABEL) as ItemStatus[]).map((k) => (
                                      <option key={k} value={k}>
                                        {ITEM_STATUS_LABEL[k]}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${statusTone(it.status)}`}>
                                    {ITEM_STATUS_LABEL[it.status]}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "progress" && (
          <div className="mt-6 space-y-6">
            <p className="text-xs text-muted">Tiến độ hiển thị theo nhật ký nhân viên gửi từng ngày.</p>
            {director && active ? (
              <div className="rounded-xl border border-border bg-surface p-4">
                <p className="mb-2 text-sm font-medium">% tổng (Giám đốc)</p>
                <div className="flex items-center gap-3">
                  <input type="range" min={0} max={100} value={progress} onChange={(e) => setProgress(Number(e.target.value))} className="flex-1" />
                  <span className="w-10 text-right font-bold tabular-nums text-accent">{progress}%</span>
                </div>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ghi chú (tuỳ chọn)"
                  className="mt-2 h-10 w-full rounded-lg border border-border bg-bg px-3 text-sm"
                />
                <button
                  type="button"
                  disabled={saving || progress === project.progress}
                  onClick={saveProgress}
                  className="mt-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-fg disabled:opacity-50"
                >
                  Lưu %
                </button>
                {msg ? <p className="mt-1 text-xs text-ok">{msg}</p> : null}
              </div>
            ) : null}

            {byDay.length === 0 ? (
              <EmptyState title="Chưa có tiến độ" sub="Khi nhân viên ghi nhật ký, ảnh và cập nhật sẽ hiện theo từng ngày." />
            ) : (
              byDay.map((day) => (
                <section key={day.key} className="rounded-xl border border-border bg-surface/70 p-4">
                  <h3 className="mb-3 text-sm font-semibold capitalize text-accent">{dayLabel(day.key)}</h3>
                  <div className="space-y-4">
                    {day.journals.map((j) => (
                      <div key={j.id}>
                        <p className="text-xs text-muted">
                          {j.author_name} · {JOURNAL_CATEGORY_LABEL[j.category as JournalCategory]} · {formatDateTime(j.created_at)}
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-sm">{j.content}</p>
                        {j.images.length > 0 ? (
                          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {j.images.map((im) => (
                              <button
                                key={im.id}
                                type="button"
                                onClick={() => setLightbox(im.data_url)}
                                className="aspect-[4/3] overflow-hidden rounded-lg border border-border"
                              >
                                <img src={im.data_url} alt="" className="size-full object-cover" />
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>
        )}

        {tab === "journals" && staff && (
          <div className="mt-6 space-y-4">
            {active ? (
              <Link
                to="/projects/$id/journal"
                params={{ id: String(pid) }}
                className="flex h-12 items-center justify-center rounded-xl border border-accent/40 bg-accent/10 font-semibold text-accent"
              >
                + Ghi nhật ký
              </Link>
            ) : (
              <p className="text-sm text-muted">Công trình đã hoàn thiện — không ghi nhật ký mới.</p>
            )}
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

        {tab === "staff" && director ? <ProjectStaffPanel projectId={pid} director={director} /> : null}

        <dl className="mt-8 space-y-2 text-xs text-subtle">
          <p>Khởi công {formatDate(project.start_date)} · Dự kiến xong {formatDate(project.expected_end_date)}</p>
        </dl>
      </div>

      {lightbox ? (
        <button type="button" className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" className="max-h-full max-w-full object-contain" />
        </button>
      ) : null}
    </div>
  );
}
