import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Building2,
  Home,
  LogOut,
  NotebookPen,
  Settings,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getMyProfile } from "@/lib/hhb/actions";
import type { Profile } from "@/lib/hhb/types";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, isPending } = useCurrentUserState();
  const [profile, setProfile] = useState<Profile | null>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!user) return;
    getMyProfile()
      .then((r) => setProfile(r.profile))
      .catch(() => setProfile(null));
  }, [user?.id]);

  if (isPending) {
    return (
      <div className="grid min-h-screen place-items-center bg-bg">
        <div className="h-10 w-40 animate-pulse rounded-lg bg-surface" />
      </div>
    );
  }

  if (!user) return <>{children}</>;

  const director = profile?.permission_level === "DIRECTOR";
  const staff = profile?.account_type === "STAFF";
  const customer = profile?.account_type === "CUSTOMER";

  const side = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/projects", label: "Công trình", icon: Building2 },
    { href: "/journals", label: "Nhật ký", icon: NotebookPen },
    { href: "/notifications", label: "Thông báo", icon: Bell },
    ...(director ? [{ href: "/settings", label: "Cài đặt", icon: Settings }] : []),
  ];

  const bottom = director
    ? [
        { href: "/dashboard", label: "Dashboard", icon: Home },
        { href: "/projects", label: "Công trình", icon: Building2 },
        { href: "/journals", label: "Hoạt động", icon: NotebookPen },
        { href: "/notifications", label: "Thông báo", icon: Bell },
        { href: "/settings", label: "Cài đặt", icon: Settings },
      ]
    : staff
      ? [
          { href: "/dashboard", label: "Trang chủ", icon: Home },
          { href: "/projects", label: "Công trình", icon: Building2 },
          { href: "/update", label: "Cập nhật", icon: NotebookPen },
          { href: "/notifications", label: "Thông báo", icon: Bell },
          { href: "/account", label: "Tài khoản", icon: UserRound },
        ]
      : [
          { href: "/dashboard", label: "Trang chủ", icon: Home },
          { href: "/projects", label: "Công trình", icon: Building2 },
          { href: "/journals", label: "Hình ảnh", icon: NotebookPen },
          { href: "/notifications", label: "Thông báo", icon: Bell },
          { href: "/account", label: "Tài khoản", icon: UserRound },
        ];

  return (
    <div className="flex min-h-screen bg-bg text-fg">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-bg lg:flex">
        <div className="border-b border-border px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="shrink-0 rounded-md bg-plate p-1.5">
              <img src="/huy-hoang-logo.png" alt="" className="size-11 object-contain" />
            </div>
            <div className="min-w-0">
              <p className="font-display text-lg font-semibold uppercase tracking-wide">Huy Hoàng</p>
              <p className="text-[9px] font-semibold tracking-[0.14em] text-accent">Xây dựng tương lai</p>
            </div>
          </div>
          <p className="mt-3 text-[10px] leading-4 text-subtle">MST 4101617237 · Hotline 094.443.7238</p>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {side.map((l) => {
            const active = pathname === l.href || (l.href !== "/dashboard" && pathname.startsWith(l.href));
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                to={l.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                  active ? "bg-accent/15 font-medium text-accent" : "text-muted hover:bg-surface hover:text-fg",
                )}
              >
                <Icon className="size-4" />
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border px-4 py-4">
          <p className="truncate text-sm font-medium">{profile?.full_name ?? user.displayName}</p>
          <p className="text-xs text-muted">
            {director ? "Giám đốc" : staff ? "Nhân sự" : customer ? "Khách hàng" : "Tài khoản"}
          </p>
          <div className="mt-3 flex items-center gap-2 text-muted">
            <UserButton />
            <LogOut className="size-3.5" />
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 pb-20 lg:pb-8">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg/95 backdrop-blur lg:hidden">
        <div className="flex h-16 items-stretch">
          {bottom.map((l) => {
            const active = pathname === l.href || (l.href !== "/dashboard" && pathname.startsWith(l.href));
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                to={l.href}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium",
                  active ? "text-accent" : "text-muted",
                )}
              >
                <Icon className="size-5" />
                {l.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
