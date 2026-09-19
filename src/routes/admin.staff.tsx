import { createFileRoute } from "@tanstack/react-router";
import { PeopleAdmin } from "@/components/PeopleAdmin";
import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/admin/staff")({ component: Page });

function Page() {
  return (
    <RequireAuth>
      <PeopleAdmin kind="STAFF" title="Quản lý Nhân sự" />
    </RequireAuth>
  );
}
