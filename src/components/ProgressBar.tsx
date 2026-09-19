export function ProgressBar({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-muted">Tiến độ</span>
        <span className="font-semibold tabular-nums text-accent">{v}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-bg">
        <div className="h-full rounded-full bg-accent transition-[width] duration-300" style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}
