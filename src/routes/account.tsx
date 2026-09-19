import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { UserButton } from "@/lib/auth/gates";
import { getMyProfile } from "@/lib/hhb/actions";
import type { Profile } from "@/lib/hhb/types";

export const Route = createFileRoute("/account")({ component: Page });

function Page() {
  return (
    <RequireAuth>
      <Account />
    </RequireAuth>
  );
}

function Account() {
  const [p, setP] = useState<Profile | null>(null);
  useEffect(() => {
    getMyProfile().then((r) => setP(r.profile));
  }, []);
  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="font-display text-3xl">Tài khoản</h1>
      <div className="mt-6 space-y-3 rounded-xl border border-border bg-surface p-5">
        <Row label="Họ tên" value={p?.full_name ?? "—"} />
        <Row label="Điện thoại" value={p?.phone ?? "—"} />
        <Row
          label="Vai trò"
          value={p?.permission_level === "DIRECTOR" ? "Giám đốc" : p?.account_type === "STAFF" ? "Nhân sự" : "Khách hàng"}
        />
      </div>
      <div className="mt-6">
        <UserButton />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted">{label}</span>
      <span>{value}</span>
    </div>
  );
}
