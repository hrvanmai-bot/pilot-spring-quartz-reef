import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { ClipboardList, UserRound, Users } from "lucide-react";
import { PeopleAdmin } from "@/components/PeopleAdmin";
import { RequireAuth } from "@/components/RequireAuth";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { listAudit } from "@/lib/hhb/actions";
import type { AuditRow } from "@/lib/hhb/types";
import { formatDateTime } from "@/lib/utils";
import { EmptyState } from "@/components/EmptyState";

export const Route = createFileRoute("/settings")({
  validateSearch: (s: Record<string, unknown>) => ({
    tab: (s.tab as string) || "staff",
  }),
  component: Page,
});

type Tab = "staff" | "customers" | "audit";

function Page() {
  return (
    <RequireAuth>
      <Settings />
    </RequireAuth>
  );
}

function Settings() {
  const search = Route.useSearch();
  const tab = (search.tab as Tab) || "staff";

  const tabs: { key: Tab; label: string; icon: typeof Users }[] = [
    { key: "staff", label: "Nhân sự", icon: Users },
    { key: "customers", label: "Khách hàng", icon: UserRound },
    { key: "audit", label: "Nhật ký hệ thống", icon: ClipboardList },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-8">
      <h1 className="font-display text-3xl">Cài đặt</h1>
      <p className="mt-1 text-sm text-muted">Quản lý nhân sự, khách hàng và nhật ký hệ thống</p>

      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-border">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <Link
              key={t.key}
              to="/settings"
              search={{ tab: t.key }}
              className={cn(
                "inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium",
                active ? "border-accent text-accent" : "border-transparent text-muted",
              )}
            >
              <Icon className="size-4" />
              {t.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-2">
        {tab === "staff" ? <PeopleAdmin kind="STAFF" title="" embedded /> : null}
        {tab === "customers" ? <PeopleAdmin kind="CUSTOMER" title="" embedded /> : null}
        {tab === "audit" ? <AuditPanel /> : null}
      </div>
    </div>
  );
}

function AuditPanel() {
  const [rows, setRows] = useState<AuditRow[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    listAudit()
      .then(setRows)
      .catch((e) => setErr(e instanceof Error ? e.message : "Lỗi"));
  }, []);
  return (
    <div className="pt-4">
      {err ? <p className="text-danger">{err}</p> : null}
      <div className="space-y-2">
        {rows === null ? (
          <div className="h-24 animate-pulse rounded-xl bg-surface" />
        ) : rows.length === 0 ? (
          <EmptyState title="Chưa có nhật ký" />
        ) : (
          rows.map((a) => (
            <div key={a.id} className="rounded-xl border border-border bg-surface p-4 text-sm">
              <p className="font-medium">
                {a.action} · {a.entity_type}
                {a.entity_id ? ` #${a.entity_id}` : ""}
              </p>
              <p className="mt-1 text-xs text-muted">
                {a.actor_name ?? "Hệ thống"} · {formatDateTime(a.created_at)}
              </p>
              {a.after_data ? <p className="mt-2 truncate text-xs text-subtle">{a.after_data}</p> : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
