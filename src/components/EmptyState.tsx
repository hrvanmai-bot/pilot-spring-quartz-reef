export function EmptyState({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
      <p className="font-medium text-fg">{title}</p>
      {sub ? <p className="mt-1 text-sm text-muted">{sub}</p> : null}
    </div>
  );
}
