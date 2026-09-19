import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { RequireAuth } from "@/components/RequireAuth";
import { StatusBadge } from "@/components/StatusBadge";
import { listProjects } from "@/lib/hhb/actions";
import type { Project } from "@/lib/hhb/types";

export const Route = createFileRoute("/update")({ component: Page });

function Page() {
  return (
    <RequireAuth>
      <Update />
    </RequireAuth>
  );
}

function Update() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  useEffect(() => {
    listProjects().then(setProjects).catch(() => setProjects([]));
  }, []);
  const active = (projects ?? []).filter((p) => p.status === "ACTIVE");
  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="font-display text-3xl">Cập nhật công trình</h1>
      <p className="mt-1 text-sm text-muted">Chọn công trình đang thi công để ghi nhật ký.</p>
      <div className="mt-6 space-y-3">
        {projects === null ? (
          <div className="h-24 animate-pulse rounded-xl bg-surface" />
        ) : active.length === 0 ? (
          <EmptyState title="Không có công trình đang thi công" />
        ) : (
          active.map((p) => (
            <Link
              key={p.id}
              to="/projects/$id/journal"
              params={{ id: String(p.id) }}
              className="block rounded-xl border border-border bg-surface p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-xs text-muted">{p.code}</p>
                </div>
                <StatusBadge status={p.status} />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
