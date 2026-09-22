import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { hashPassword } from "better-auth/crypto";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";

const DIRECTOR_PHONE = "0944437238";
const DIRECTOR_EMAIL = "0944437238@huyhoang.build";
const DIRECTOR_PASSWORD = "04022022";
const DIRECTOR_NAME = "Từ Huy Tú";

/** Seed / reset default Giám đốc so phone login always works. */
export const ensureDefaultDirector = createServerFn({ method: "POST" }).handler(async () => {
  const sql = await getSql();
  const hashed = await hashPassword(DIRECTOR_PASSWORD);

  const byPhone = await sql<{ user_id: string }>`
    select user_id from profiles where phone = ${DIRECTOR_PHONE} limit 1
  `;
  const byEmail = await sql<{ id: string }>`
    select id from "user" where email = ${DIRECTOR_EMAIL} limit 1
  `;

  let userId = byPhone[0]?.user_id ?? byEmail[0]?.id;

  if (!userId) {
    userId = crypto.randomUUID();
    await sql`
      insert into "user" ("id", "name", "email", "emailVerified", "createdAt", "updatedAt")
      values (${userId}, ${DIRECTOR_NAME}, ${DIRECTOR_EMAIL}, true, now(), now())
    `;
  } else {
    await sql`
      update "user"
      set name = ${DIRECTOR_NAME}, email = ${DIRECTOR_EMAIL}, "emailVerified" = true, "updatedAt" = now()
      where id = ${userId}
    `;
  }

  const acct = await sql<{ id: string }>`
    select id from "account"
    where "userId" = ${userId} and "providerId" = 'credential'
    limit 1
  `;
  if (acct[0]) {
    await sql`
      update "account" set password = ${hashed}, "updatedAt" = now() where id = ${acct[0].id}
    `;
  } else {
    await sql`
      insert into "account" ("id", "accountId", "providerId", "userId", "password", "createdAt", "updatedAt")
      values (${crypto.randomUUID()}, ${userId}, 'credential', ${userId}, ${hashed}, now(), now())
    `;
  }

  const profile = await sql<{ user_id: string }>`
    select user_id from profiles where user_id = ${userId} limit 1
  `;
  if (profile[0]) {
    await sql`
      update profiles
      set full_name = ${DIRECTOR_NAME},
          phone = ${DIRECTOR_PHONE},
          account_type = 'STAFF',
          permission_level = 'DIRECTOR',
          job_title = 'Giám đốc',
          is_active = true,
          updated_at = now()
      where user_id = ${userId}
    `;
  } else {
    await sql`
      insert into profiles (user_id, full_name, phone, account_type, permission_level, job_title, is_active)
      values (${userId}, ${DIRECTOR_NAME}, ${DIRECTOR_PHONE}, 'STAFF', 'DIRECTOR', 'Giám đốc', true)
    `;
  }

  return { ok: true };
});

export const getDirectorStatus = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const rows = await sql<{ n: number }>`
    select count(*)::int as n
    from profiles
    where account_type = 'STAFF'
      and permission_level = 'DIRECTOR'
      and is_active = true
  `;
  return { hasDirector: (rows[0]?.n ?? 0) > 0 };
});

export const bootstrapDirectorSafe = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ fullName: z.string().min(2), phone: z.string().min(8) }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const existing = await sql<{ user_id: string }>`
      select user_id from profiles
      where account_type = 'STAFF'
        and permission_level = 'DIRECTOR'
        and is_active = true
      limit 1
    `;
    if (existing[0] && existing[0].user_id !== context.userId) {
      throw new Error("Hệ thống đã có tài khoản Giám đốc");
    }

    const current = await sql<{ user_id: string }>`
      select user_id from profiles where user_id = ${context.userId} limit 1
    `;
    if (current[0]) {
      await sql`
        update profiles
        set full_name = ${data.fullName}, phone = ${data.phone},
            account_type = 'STAFF', permission_level = 'DIRECTOR',
            job_title = 'Giám đốc', is_active = true, updated_at = now()
        where user_id = ${context.userId}
      `;
    } else {
      await sql`
        insert into profiles (user_id, full_name, phone, account_type, permission_level, job_title, is_active)
        values (${context.userId}, ${data.fullName}, ${data.phone}, 'STAFF', 'DIRECTOR', 'Giám đốc', true)
      `;
    }
    return { ok: true };
  });
