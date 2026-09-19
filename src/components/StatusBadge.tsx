import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: "ACTIVE" | "COMPLETED" }) {
  const active = status === "ACTIVE";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        active ? "bg-accent/15 text-accent" : "bg-ok/15 text-ok",
      )}
    >
      <Circle className="size-2 fill-current" />
      {active ? "Đang thi công" : "Đã hoàn thiện"}
    </span>
  );
}
