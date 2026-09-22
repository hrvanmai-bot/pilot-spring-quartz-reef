import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";

const itemSchema = z.object({
  name: z.string().min(1),
  unit: z.string().optional().nullable(),
  quantity: z.number().optional().nullable(),
  category: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

export const createProjectRich = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      name: z.string().min(2),
      customerId: z.number(),
      address: z.string().min(2),
      projectType: z.string().optional(),
      startDate: z.string().optional(),
      expectedEndDate: z.string().optional(),
      description: z.string().optional(),
      items: z.array(itemSchema).min(1),
    }),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const profiles = await sql<{ permission_level: string; account_type: string; is_active: boolean }>`
      select permission_level, account_type, is_active from profiles where user_id = ${context.userId}
    `;
    const p = profiles[0];
    if (!p?.is_active || p.account_type !== "STAFF" || p.permission_level !== "DIRECTOR") {
      throw new Error("Chỉ Giám đốc được tạo công trình");
    }

    const year = new Date().getFullYear();
    const cnt = await sql<{ n: number }>`
      select count(*)::int as n from projects where code like ${`HHB-${year}-%`}
    `;
    const code = `HHB-${year}-${String((cnt[0]?.n ?? 0) + 1).padStart(3, "0")}`;

    const inserted = await sql<{ id: number }>`
      insert into projects (code, name, customer_id, address, project_type, start_date, expected_end_date, description, progress, status, created_by)
      values (
        ${code}, ${data.name}, ${data.customerId}, ${data.address},
        ${data.projectType || null},
        ${data.startDate || null},
        ${data.expectedEndDate || null},
        ${data.description || null},
        0, 'ACTIVE', ${context.userId}
      )
      returning id
    `;
    const id = inserted[0].id;

    let i = 0;
    for (const it of data.items) {
      await sql`
        insert into project_items (project_id, name, description, category, status, sort_order, unit, quantity)
        values (
          ${id},
          ${it.name},
          ${it.description || null},
          ${it.category || null},
          'NOT_STARTED',
          ${i++},
          ${it.unit || null},
          ${it.quantity ?? null}
        )
      `;
    }

    await sql`
      insert into audit_logs (user_id, action, entity_type, entity_id, after_data)
      values (
        ${context.userId},
        'CREATE_PROJECT',
        'project',
        ${String(id)},
        ${JSON.stringify({ code, name: data.name, items: data.items.length })}
      )
    `;

    const staff = await sql<{ user_id: string }>`
      select user_id from profiles where account_type = 'STAFF' and is_active = true
    `;
    const cust = await sql<{ user_id: string }>`
      select user_id from customers where id = ${data.customerId}
    `;
    const recipients = [...new Set([...(cust.map((c) => c.user_id)), ...staff.map((s) => s.user_id)])];
    for (const uid of recipients) {
      await sql`
        insert into notifications (user_id, title, body, type, entity_type, entity_id)
        values (
          ${uid},
          ${"Công trình mới"},
          ${`${data.name} (${code}) — ${data.items.length} hạng mục`},
          'project_created',
          'project',
          ${String(id)}
        )
      `;
    }

    return { id, code };
  });
