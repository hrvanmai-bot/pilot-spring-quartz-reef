import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { hashPassword } from "better-auth/crypto";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { phoneToEmail } from "@/lib/utils";

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

export const updatePerson = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      userId: z.string().min(1),
      fullName: z.string().min(2),
      phone: z.string().min(8),
      jobTitle: z.string().optional().nullable(),
      isActive: z.boolean().optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    const sql = await requireDirector(context.userId);

    const target = await sql<{ user_id: string; permission_level: string; phone: string }>`
      select user_id, permission_level, phone from profiles where user_id = ${data.userId}
    `;
    if (!target[0]) throw new Error("Không tìm thấy tài khoản");

    // phone unique check
    const clash = await sql<{ user_id: string }>`
      select user_id from profiles where phone = ${data.phone} and user_id <> ${data.userId} limit 1
    `;
    if (clash[0]) throw new Error("Số điện thoại đã được dùng bởi tài khoản khác");

    await sql`
      update profiles set
        full_name = ${data.fullName},
        phone = ${data.phone},
        job_title = ${data.jobTitle || null},
        is_active = ${data.isActive ?? true},
        updated_at = now()
      where user_id = ${data.userId}
    `;

    // sync auth user name / email if phone changed
    const email = phoneToEmail(data.phone);
    await sql`
      update "user" set
        name = ${data.fullName},
        email = ${email},
        "updatedAt" = now()
      where id = ${data.userId}
    `;

    await sql`
      insert into audit_logs (user_id, action, entity_type, entity_id, after_data)
      values (
        ${context.userId},
        'UPDATE_PERSON',
        'profile',
        ${data.userId},
        ${JSON.stringify({ fullName: data.fullName, phone: data.phone, isActive: data.isActive })}
      )
    `;

    return { ok: true };
  });

export const resetPersonPassword = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      userId: z.string().min(1),
      password: z.string().min(6),
    }),
  )
  .handler(async ({ context, data }) => {
    const sql = await requireDirector(context.userId);

    const target = await sql<{ user_id: string }>`
      select user_id from profiles where user_id = ${data.userId}
    `;
    if (!target[0]) throw new Error("Không tìm thấy tài khoản");

    const hashed = await hashPassword(data.password);

    const accounts = await sql<{ id: string }>`
      select id from "account"
      where "userId" = ${data.userId} and "providerId" = 'credential'
      limit 1
    `;

    if (accounts[0]) {
      await sql`
        update "account"
        set password = ${hashed}, "updatedAt" = now()
        where id = ${accounts[0].id}
      `;
    } else {
      const id = crypto.randomUUID();
      await sql`
        insert into "account" (
          id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt"
        ) values (
          ${id}, ${data.userId}, 'credential', ${data.userId}, ${hashed}, now(), now()
        )
      `;
    }

    await sql`
      insert into audit_logs (user_id, action, entity_type, entity_id, after_data)
      values (
        ${context.userId},
        'RESET_PASSWORD',
        'profile',
        ${data.userId},
        ${JSON.stringify({ reset: true })}
      )
    `;

    return { ok: true };
  });
