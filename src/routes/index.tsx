import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return <div className="grid min-h-screen place-items-center bg-bg text-muted">Đang tải...</div>;
  }
  return <Navigate to={user ? "/dashboard" : "/login"} />;
}
