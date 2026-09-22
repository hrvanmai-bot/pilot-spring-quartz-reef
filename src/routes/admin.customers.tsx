import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/customers")({
  beforeLoad: () => {
    throw redirect({ to: "/settings", search: { tab: "customers" } });
  },
  component: () => null,
});
