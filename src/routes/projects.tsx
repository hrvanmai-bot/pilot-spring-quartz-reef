import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { ProgressBar } from "@/components/ProgressBar";
import { RequireAuth } from "@/components/RequireAuth";
import { StatusBadge } from "@/components/StatusBadge";
import { getMyProfile, listProjects } from "@/lib/hhb/actions";
import type { Project } from "@/lib/hhb/types";

export const Route = createFileRoute("/projects")({ component: Page });

function Page() {
  return (
    <RequireAuth>
      <Projects />
    </RequireAuth>
  );
}

function Projects() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [director, setDirector] = useState(false);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "COMPLETED">("ALL");
  const [sort, setSort] = useState<"newest" | "oldest" | "az">("newest");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    listProjects()
      .then(setProjects)
      .catch((e) => setErr(e instanceof Error ? e.message : "Không thể tải dữ liệu."));
    getMyProfile().then((r) => setDirector(r.profile?.permission_level === "DIRECTOR"));
  }, []);

  const list = useMemo(() => {
    let rows = [...(projects ?? [])];
    if (q.trim()) {
      const s = q.toLowerCase();
      rows = rows.filter(
        (p) =>
          p.name.toLowerCase().includes(s) ||
          p.code.toLowerCase().includes(s) ||
          p.address.toLowerCase().includes(s) ||
          (p.customer_name ?? "").toLowerCase().includes(s),
      );
    }
    if (filter !== "ALL") rows = rows.filter((p) => p.status === filter);
    rows.sort((a, b) => {
      if (sort === "az") return a.name.localeCompare(b.name, "vi");
      const da = new Date(a.updated_at).getTime();
      const db = new Date(b.updated_at).getTime();
      return sort === "newest" ? db - da : da - db;
    });
    return rows;
  }, [projects, q, filter, sort]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Công trình</h1>
          <p className="text-sm text-muted">{projects?.length ?? 0} công trình</p>
        </div>
        {director ? (
          <Link
            to="/admin/projects/new"
            className="inline-flex h-11 items-center gap-1 rounded-lg bg-accent px-4 text-sm font-semibold text-accent-fg"
          >
            <Plus className="size-4" /> Tạo mới
          </Link>
        ) : null}
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Tìm theo tên, mã, địa chỉ, khách hàng..."
        className="h-12 w-full rounded-lg border border-border bg-surface px-4 outline-none focus:border-accent"
      />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {(["ALL", "ACTIVE", "COMPLETED"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`rounded-full px-4 py-1.5 text-sm ${filter === s ? "bg-accent font-medium text-accent-fg" : "border border-border text-muted"}`}
          >
            {s === "ALL" ? "Tất cả" : s === "ACTIVE" ? "Đang thi công" : "Đã hoàn thiện"}
          </button>
        ))}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="ml-auto rounded-full border border-border bg-surface px-3 py-1.5 text-sm"
        >
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
          <option value="az">A → Z</option>
        </select>
      </div>

      {err ? <p className="mt-6 text-danger">{err}</p> : null}
      {!projects ? (
        <div className="mt-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-surface" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title={projects.length === 0 ? "Chưa có công trình" : "Không tìm thấy công trình"}
            sub={projects.length === 0 ? "Những công trình được tạo bởi Giám đốc sẽ xuất hiện tại đây." : undefined}
          />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {list.map((p) => (
            <Link
              key={p.id}
              to="/projects/$id"
              params={{ id: String(p.id) }}
              className="block rounded-xl border border-border bg-surface p-4 md:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold">{p.name}</h3>
                  <p className="text-xs text-muted">
                    {p.code}
                    {p.customer_name ? ` · ${p.customer_name}` : ""}
                  </p>
                  <p className="mt-1 truncate text-sm text-muted">{p.address}</p>
                </div>
                <StatusBadge status={p.status} />
              </div>
              <div className="mt-3">
                <ProgressBar value={p.progress} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
