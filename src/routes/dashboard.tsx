import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera } from "lucide-react";
import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { EmptyState } from "@/components/EmptyState";
import { ProgressBar } from "@/components/ProgressBar";
import { StatusBadge } from "@/components/StatusBadge";
import { getDashboard } from "@/lib/hhb/actions";
import type { Journal, Profile, Project } from "@/lib/hhb/types";
import { formatDate, todayLong } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({ component: Page });

function Page() {
  return (
    <RequireAuth>
      <Dashboard />
    </RequireAuth>
  );
}

function Dashboard() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getDashboard>> | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch((e) => setErr(e instanceof Error ? e.message : "Không thể tải dữ liệu."));
  }, []);

  if (err) return <Fail msg={err} />;
  if (!data) return <Skel />;
  const p = data.profile as Profile;
  const director = p.permission_level === "DIRECTOR";
  const staff = p.account_type === "STAFF" && !director;
  const customer = p.account_type === "CUSTOMER";
  const first = p.full_name.split(" ").slice(-1)[0];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-8">
      <h1 className="font-display text-3xl">Xin chào, {first}</h1>
      <p className="mt-1 capitalize text-muted">{todayLong()}</p>

      {director && data.stats ? (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat title="Đang thi công" value={data.stats.active} />
            <Stat title="Đã hoàn thiện" value={data.stats.completed} />
            <Stat title="Khách hàng" value={data.stats.customers} />
            <Stat title="Nhân sự" value={data.stats.staff} />
          </div>
          {data.stats.stale.length > 0 ? (
            <section className="mt-8">
              <h2 className="mb-3 text-lg font-semibold">Cần chú ý</h2>
              <div className="space-y-2">
                {data.stats.stale
                  .filter((s) => s.days >= 3)
                  .map((s) => (
                    <Link
                      key={s.id}
                      to="/projects/$id"
                      params={{ id: String(s.id) }}
                      className="block rounded-xl border border-border bg-surface px-4 py-3"
                    >
                      <p className="font-medium">{s.name}</p>
                      <p className="text-sm text-muted">{s.days} ngày chưa có nhật ký</p>
                    </Link>
                  ))}
              </div>
            </section>
          ) : null}
          <JournalList items={data.journals} />
        </>
      ) : null}

      {staff ? (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Stat title="Đang thi công" value={data.stats?.active ?? 0} />
            <Stat title="Đã hoàn thiện" value={data.stats?.completed ?? 0} />
          </div>
          <Link
            to="/update"
            className="mt-6 flex h-14 items-center justify-center gap-2 rounded-xl bg-accent text-lg font-bold text-accent-fg"
          >
            <Camera className="size-5" /> Cập nhật công trình
          </Link>
          <JournalList items={data.journals} />
        </>
      ) : null}

      {customer ? (
        <section className="mt-6">
          <h2 className="mb-4 text-lg font-semibold">Công trình của bạn</h2>
          {data.projects.length === 0 ? (
            <EmptyState
              title="Chưa có công trình"
              sub="Những công trình được tạo bởi Giám đốc sẽ xuất hiện tại đây."
            />
          ) : (
            <div className="space-y-3">
              {data.projects.map((pr) => (
                <ProjectCard key={pr.id} p={pr} latest={data.latest[pr.id]} />
              ))}
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}

function JournalList({ items }: { items: Journal[] }) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-lg font-semibold">Nhật ký mới nhất</h2>
      {items.length === 0 ? (
        <EmptyState title="Chưa có nhật ký" />
      ) : (
        <div className="space-y-3">
          {items.map((j) => (
            <Link
              key={j.id}
              to="/projects/$id"
              params={{ id: String(j.project_id) }}
              className="block rounded-xl border border-border bg-surface p-4"
            >
              <p className="text-sm font-medium text-accent">{j.project_name}</p>
              <p className="mt-1 line-clamp-2 text-sm text-muted">{j.content}</p>
              <p className="mt-2 text-xs text-subtle">
                {j.author_name} · {formatDate(j.created_at)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function ProjectCard({ p, latest }: { p: Project; latest?: string }) {
  return (
    <Link
      to="/projects/$id"
      params={{ id: String(p.id) }}
      className="block rounded-xl border border-border bg-surface p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{p.name}</h3>
          <p className="text-xs text-muted">{p.code}</p>
        </div>
        <StatusBadge status={p.status} />
      </div>
      <div className="mt-4">
        <ProgressBar value={p.progress} />
      </div>
      {latest ? <p className="mt-3 line-clamp-2 text-sm text-muted">{latest}</p> : null}
    </Link>
  );
}

function Stat({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-xs text-muted">{title}</p>
      <p className="mt-1 font-display text-3xl text-accent tabular-nums">{value}</p>
    </div>
  );
}

function Skel() {
  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-8">
      <div className="h-8 w-48 animate-pulse rounded-md bg-surface" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-surface" />
        ))}
      </div>
    </div>
  );
}

function Fail({ msg }: { msg: string }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <p className="text-muted">{msg}</p>
      <button type="button" onClick={() => location.reload()} className="mt-4 rounded-lg bg-accent px-5 py-2.5 font-semibold text-accent-fg">
        Thử lại
      </button>
    </div>
  );
}
