import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { RequireAuth } from "@/components/RequireAuth";
import { listNotifications, markNotificationsRead } from "@/lib/hhb/actions";
import type { NotificationRow } from "@/lib/hhb/types";
import { formatDateTime } from "@/lib/utils";

export const Route = createFileRoute("/notifications")({ component: Page });

function Page() {
  return (
    <RequireAuth>
      <Notes />
    </RequireAuth>
  );
}

function Notes() {
  const [items, setItems] = useState<NotificationRow[] | null>(null);
  useEffect(() => {
    listNotifications().then(setItems).catch(() => setItems([]));
  }, []);
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl">Thông báo</h1>
        <button
          type="button"
          onClick={async () => {
            await markNotificationsRead();
            setItems((prev) => prev?.map((n) => ({ ...n, is_read: true })) ?? prev);
          }}
          className="text-sm text-accent"
        >
          Đánh dấu đã đọc
        </button>
      </div>
      {items === null ? (
        <div className="h-24 animate-pulse rounded-xl bg-surface" />
      ) : items.length === 0 ? (
        <EmptyState title="Chưa có thông báo" />
      ) : (
        <div className="space-y-2">
          {items.map((n) => {
            const inner = (
              <div className={`rounded-xl border border-border bg-surface p-4 ${n.is_read ? "opacity-70" : ""}`}>
                <p className="font-medium">{n.title}</p>
                {n.body ? <p className="mt-1 text-sm text-muted">{n.body}</p> : null}
                <p className="mt-2 text-xs text-subtle">{formatDateTime(n.created_at)}</p>
              </div>
            );
            if (n.entity_type === "project" && n.entity_id) {
              return (
                <Link key={n.id} to="/projects/$id" params={{ id: n.entity_id }}>
                  {inner}
                </Link>
              );
            }
            return <div key={n.id}>{inner}</div>;
          })}
        </div>
      )}
    </div>
  );
}
