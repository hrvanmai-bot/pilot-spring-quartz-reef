import { createFileRoute } from "@tanstack/react-router";
import { PeopleAdmin } from "@/components/PeopleAdmin";
import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/admin/customers")({ component: Page });

function Page() {
  return (
    <RequireAuth>
      <PeopleAdmin kind="CUSTOMER" title="Quản lý Khách hàng" />
    </RequireAuth>
  );
}
