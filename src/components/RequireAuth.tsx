import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { AppShell } from "@/components/layout/AppShell";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return (
      <div className="grid min-h-screen place-items-center bg-bg">
        <div className="h-24 w-64 animate-pulse rounded-xl bg-surface" />
      </div>
    );
  }
  if (!user) return <RedirectToSignIn to="/login" />;
  return <AppShell>{children}</AppShell>;
}
