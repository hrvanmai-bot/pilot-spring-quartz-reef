import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { RequireAuth } from "@/components/RequireAuth";
import { listAudit } from "@/lib/hhb/actions";
import type { AuditRow } from "@/lib/hhb/types";
import { formatDateTime } from "@/lib/utils";

export const Route = createFileRoute("/admin/audit")({ component: Page });

function Page() {
  return (
    <RequireAuth>
      <Audit />
    </RequireAuth>
  );
}

function Audit() {
  const [rows, setRows] = useState<AuditRow[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    listAudit()
      .then(setRows)
      .catch((e) => setErr(e instanceof Error ? e.message : "Lỗi"));
  }, []);
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-8">
      <h1 className="font-display text-3xl">Nhật ký hệ thống</h1>
      {err ? <p className="mt-4 text-danger">{err}</p> : null}
      <div className="mt-6 space-y-2">
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
