import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { RequireAuth } from "@/components/RequireAuth";
import { listJournals } from "@/lib/hhb/actions";
import { JOURNAL_CATEGORY_LABEL, type Journal, type JournalCategory } from "@/lib/hhb/types";
import { formatDateTime } from "@/lib/utils";

export const Route = createFileRoute("/journals")({ component: Page });

function Page() {
  return (
    <RequireAuth>
      <List />
    </RequireAuth>
  );
}

function List() {
  const [items, setItems] = useState<Journal[] | null>(null);
  useEffect(() => {
    listJournals().then(setItems).catch(() => setItems([]));
  }, []);
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-8">
      <h1 className="font-display text-3xl">Nhật ký</h1>
      <div className="mt-6 space-y-3">
        {items === null ? (
          <div className="h-32 animate-pulse rounded-xl bg-surface" />
        ) : items.length === 0 ? (
          <EmptyState title="Chưa có nhật ký" />
        ) : (
          items.map((j) => (
            <Link
              key={j.id}
              to="/projects/$id"
              params={{ id: String(j.project_id) }}
              className="block rounded-xl border border-border bg-surface p-4"
            >
              <p className="text-sm font-medium text-accent">{j.project_name}</p>
              <p className="mt-1 text-sm">{j.content}</p>
              <p className="mt-2 text-xs text-subtle">
                {j.author_name} · {JOURNAL_CATEGORY_LABEL[j.category as JournalCategory]} · {formatDateTime(j.created_at)}
              </p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
