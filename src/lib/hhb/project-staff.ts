import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";

async function requireDirector(userId: string) {
  const sql = await getSql();
  const rows = await sql<{ permission_level: string; account_type: string; is_active: boolean }>`
    select permission_level, account_type, is_active from profiles where user_id = ${userId}
  `;
  const p = rows[0];
  if (!p?.is_active || p.account_type !== "STAFF" || p.permission_level !== "DIRECTOR") {
    throw new Error("Chỉ Giám đốc được thực hiện");
  }
  return sql;
}

export const listStaffLite = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const me = await sql<{ account_type: string }>`
      select account_type from profiles where user_id = ${context.userId}
    `;
    if (me[0]?.account_type !== "STAFF") throw new Error("Không có quyền");
    return sql<{ user_id: string; full_name: string; phone: string; job_title: string | null }>`
      select user_id, full_name, phone, job_title
      from profiles
      where account_type = 'STAFF' and is_active = true
      order by full_name
    `;
  });

export const listProjectStaff = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(z.object({ projectId: z.number() }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const me = await sql<{ account_type: string }>`
      select account_type from profiles where user_id = ${context.userId}
    `;
    if (me[0]?.account_type !== "STAFF") throw new Error("Không có quyền");
    return sql<{ id: number; staff_user_id: string; full_name: string; phone: string; role_in_project: string | null; job_title: string | null }>`
      select ps.id, ps.staff_user_id, p.full_name, p.phone, ps.role_in_project, p.job_title
      from project_staff ps
      join profiles p on p.user_id = ps.staff_user_id
      where ps.project_id = ${data.projectId}
      order by p.full_name
    `;
  });

export const setProjectStaff = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      projectId: z.number(),
      staffUserIds: z.array(z.string()),
      roleInProject: z.string().optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    const sql = await requireDirector(context.userId);

    const exists = await sql<{ id: number }>`select id from projects where id = ${data.projectId}`;
    if (!exists[0]) throw new Error("Không tìm thấy công trình");

    await sql`delete from project_staff where project_id = ${data.projectId}`;

    const role = data.roleInProject || "Thi công";
    for (const uid of data.staffUserIds) {
      const ok = await sql<{ user_id: string }>`
        select user_id from profiles
        where user_id = ${uid} and account_type = 'STAFF' and is_active = true
      `;
      if (!ok[0]) continue;
      await sql`
        insert into project_staff (project_id, staff_user_id, role_in_project)
        values (${data.projectId}, ${uid}, ${role})
        on conflict (project_id, staff_user_id) do update set role_in_project = excluded.role_in_project
      `;
    }

    await sql`
      insert into audit_logs (user_id, action, entity_type, entity_id, after_data)
      values (
        ${context.userId},
        'SET_PROJECT_STAFF',
        'project',
        ${String(data.projectId)},
        ${JSON.stringify({ staffUserIds: data.staffUserIds })}
      )
    `;

    return { ok: true, count: data.staffUserIds.length };
  });
