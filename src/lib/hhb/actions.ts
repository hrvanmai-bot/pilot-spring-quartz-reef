import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { hashPassword } from "better-auth/crypto";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSessionUser } from "@/lib/auth/verify.server";
import { getSql } from "@/lib/db";
import type {
  AuditRow,
  Journal,
  JournalCategory,
  NotificationRow,
  Profile,
  ProgressLog,
  Project,
  ProjectItem,
} from "./types";

type Sql = Awaited<ReturnType<typeof getSql>>;

async function getProfile(sql: Sql, userId: string): Promise<Profile | null> {
  const rows = await sql<Profile>`
    select user_id, full_name, phone, account_type, permission_level, job_title, is_active, created_at::text as created_at
    from profiles where user_id = ${userId}
  `;
  return rows[0] ?? null;
}

async function requireProfile(sql: Sql, userId: string): Promise<Profile> {
  const p = await getProfile(sql, userId);
  if (!p || !p.is_active) throw new Error("Tài khoản chưa được kích hoạt. Liên hệ Giám đốc.");
  return p;
}

function isDirector(p: Profile) {
  return p.account_type === "STAFF" && p.permission_level === "DIRECTOR";
}
function isStaff(p: Profile) {
  return p.account_type === "STAFF";
}

async function canSeeProject(sql: Sql, p: Profile, projectId: number) {
  if (isStaff(p)) return true;
  const rows = await sql<{ ok: number }>`
    select 1 as ok from projects pr
    join customers c on c.id = pr.customer_id
    where pr.id = ${projectId} and c.user_id = ${p.user_id}
  `;
  return rows.length > 0;
}

async function audit(
  sql: Sql,
  userId: string,
  action: string,
  entityType: string,
  entityId: string | number | null,
  before?: unknown,
  after?: unknown,
) {
  await sql`
    insert into audit_logs (user_id, action, entity_type, entity_id, before_data, after_data)
    values (
      ${userId},
      ${action},
      ${entityType},
      ${entityId == null ? null : String(entityId)},
      ${before ? JSON.stringify(before) : null},
      ${after ? JSON.stringify(after) : null}
    )
  `;
}

async function notify(
  sql: Sql,
  userIds: string[],
  title: string,
  body: string,
  type: string,
  entityType?: string,
  entityId?: string,
) {
  const unique = [...new Set(userIds)];
  for (const uid of unique) {
    await sql`
      insert into notifications (user_id, title, body, type, entity_type, entity_id)
      values (${uid}, ${title}, ${body}, ${type}, ${entityType ?? null}, ${entityId ?? null})
    `;
  }
}

async function staffUserIds(sql: Sql) {
  const rows = await sql<{ user_id: string }>`
    select user_id from profiles where account_type = 'STAFF' and is_active = true
  `;
  return rows.map((r) => r.user_id);
}

export const getBootstrap = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const rows = await sql<{ n: number }>`select count(*)::int as n from profiles`;
  return { hasDirector: (rows[0]?.n ?? 0) > 0 };
});

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    let profile = await getProfile(sql, context.userId);
  if (!profile) {
  const count = await sql<{ n: number }>`select count(*)::int as n from profiles`;
  const u = await getSessionUser();
  const sessionEmail = u?.email ?? "";
  const isDefaultDirector = sessionEmail.startsWith("0944437238@");
  if ((count[0]?.n ?? 0) === 0 || isDefaultDirector) {
  const phone = isDefaultDirector ? "0944437238" : `000${Date.now().toString().slice(-7)}`;
  await sql`
  insert into profiles (user_id, full_name, phone, account_type, permission_level, job_title, is_active)
  values (${context.userId}, ${isDefaultDirector ? "Từ Huy Tú" : sessionEmail.split("@")[0] || "Giám đốc"}, ${phone}, 'STAFF', 'DIRECTOR', 'Giám đốc', true)
  on conflict (user_id) do nothing
  `;
  profile = await getProfile(sql, context.userId);
  }
  }
    return { profile };
  });

export const bootstrapDirector = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      fullName: z.string().min(2),
      phone: z.string().min(8),
    }),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const count = await sql<{ n: number }>`select count(*)::int as n from profiles`;
    if ((count[0]?.n ?? 0) > 0) throw new Error("Hệ thống đã được khởi tạo");
    await sql`
      insert into profiles (user_id, full_name, phone, account_type, permission_level, job_title, is_active)
      values (${context.userId}, ${data.fullName}, ${data.phone}, 'STAFF', 'DIRECTOR', 'Giám đốc', true)
    `;
    await audit(sql, context.userId, "BOOTSTRAP_DIRECTOR", "profile", context.userId, null, {
      fullName: data.fullName,
      phone: data.phone,
    });
    return { ok: true };
  });

export const getDashboard = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const profile = await requireProfile(sql, context.userId);

    if (profile.account_type === "CUSTOMER") {
      const projects = await sql<Project>`
        select p.id, p.code, p.name, p.customer_id, pr.full_name as customer_name,
               p.address, p.project_type, p.start_date::text as start_date,
               p.expected_end_date::text as expected_end_date,
               p.actual_end_date::text as actual_end_date,
               p.progress, p.status, p.description, p.cover_image_url,
               p.created_at::text as created_at, p.updated_at::text as updated_at
        from projects p
        join customers c on c.id = p.customer_id
        join profiles pr on pr.user_id = c.user_id
        where c.user_id = ${context.userId}
        order by p.updated_at desc
      `;
      const latest: Record<number, string> = {};
      for (const p of projects) {
        const j = await sql<{ content: string }>`
          select content from journals
          where project_id = ${p.id} and is_visible_to_customer = true
          order by created_at desc limit 1
        `;
        if (j[0]) latest[p.id] = j[0].content;
      }
      return { profile, projects, latest, stats: null, journals: [] as Journal[] };
    }

    const active = await sql<{ n: number }>`select count(*)::int as n from projects where status = 'ACTIVE'`;
    const completed = await sql<{ n: number }>`select count(*)::int as n from projects where status = 'COMPLETED'`;
    const customers = await sql<{ n: number }>`select count(*)::int as n from customers`;
    const staff = await sql<{ n: number }>`select count(*)::int as n from profiles where account_type = 'STAFF'`;

    const stale = await sql<{ id: number; name: string; days: number }>`
      select p.id, p.name,
        greatest(0, floor(extract(epoch from (now() - coalesce(
          (select max(j.created_at) from journals j where j.project_id = p.id), p.created_at
        ))) / 86400))::int as days
      from projects p
      where p.status = 'ACTIVE'
      order by days desc
      limit 8
    `;

    const journalsRaw = await sql<{
      id: number;
      project_id: number;
      project_name: string;
      author_id: string;
      author_name: string | null;
      category: JournalCategory;
      content: string;
      created_at: string;
    }>`
      select j.id, j.project_id, p.name as project_name, j.author_id,
             a.full_name as author_name, j.category, j.content,
             j.created_at::text as created_at
      from journals j
      join projects p on p.id = j.project_id
      join profiles a on a.user_id = j.author_id
      order by j.created_at desc
      limit 8
    `;

    return {
      profile,
      projects: [] as Project[],
      latest: {} as Record<number, string>,
      stats: {
        active: active[0]?.n ?? 0,
        completed: completed[0]?.n ?? 0,
        customers: customers[0]?.n ?? 0,
        staff: staff[0]?.n ?? 0,
        stale,
      },
      journals: journalsRaw.map((j) => ({ ...j, images: [] })),
    };
  });

export const listProjects = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const profile = await requireProfile(sql, context.userId);
    if (isStaff(profile)) {
      return sql<Project>`
        select p.id, p.code, p.name, p.customer_id, pr.full_name as customer_name,
               p.address, p.project_type, p.start_date::text as start_date,
               p.expected_end_date::text as expected_end_date,
               p.actual_end_date::text as actual_end_date,
               p.progress, p.status, p.description, p.cover_image_url,
               p.created_at::text as created_at, p.updated_at::text as updated_at
        from projects p
        join customers c on c.id = p.customer_id
        join profiles pr on pr.user_id = c.user_id
        order by p.updated_at desc
      `;
    }
    return sql<Project>`
      select p.id, p.code, p.name, p.customer_id, pr.full_name as customer_name,
             p.address, p.project_type, p.start_date::text as start_date,
             p.expected_end_date::text as expected_end_date,
             p.actual_end_date::text as actual_end_date,
             p.progress, p.status, p.description, p.cover_image_url,
             p.created_at::text as created_at, p.updated_at::text as updated_at
      from projects p
      join customers c on c.id = p.customer_id
      join profiles pr on pr.user_id = c.user_id
      where c.user_id = ${context.userId}
      order by p.updated_at desc
    `;
  });

export const getProjectDetail = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.number() }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const profile = await requireProfile(sql, context.userId);
    if (!(await canSeeProject(sql, profile, data.id))) {
      throw new Error("Không có quyền xem công trình này");
    }
    const showCost = isDirector(profile);
    const projects = await sql<Project>`
      select p.id, p.code, p.name, p.customer_id, pr.full_name as customer_name,
             p.address, p.project_type, p.start_date::text as start_date,
             p.expected_end_date::text as expected_end_date,
             p.actual_end_date::text as actual_end_date,
             p.progress, p.status, p.description, p.cover_image_url,
             p.created_at::text as created_at, p.updated_at::text as updated_at
      from projects p
      join customers c on c.id = p.customer_id
      join profiles pr on pr.user_id = c.user_id
      where p.id = ${data.id}
    `;
    const project = projects[0];
    if (!project) throw new Error("Không tìm thấy công trình");

    const itemsRaw = await sql<ProjectItem>`
      select id, project_id, name, description, category, status, sort_order,
             internal_cost::text as internal_cost,
             unit, quantity::text as quantity, is_visible_to_customer
      from project_items
      where project_id = ${data.id}
      order by sort_order, id
    `;
    const items = itemsRaw
      .filter((it) => profile.account_type !== "CUSTOMER" || it.is_visible_to_customer)
      .map((it) => ({
        ...it,
        internal_cost: showCost ? it.internal_cost : null,
      }));


    const journalsRows = await sql<{
      id: number;
      project_id: number;
      author_id: string;
      author_name: string | null;
      category: JournalCategory;
      content: string;
      created_at: string;
      is_visible_to_customer: boolean;
    }>`
      select j.id, j.project_id, j.author_id, a.full_name as author_name,
             j.category, j.content, j.created_at::text as created_at,
             j.is_visible_to_customer
      from journals j
      join profiles a on a.user_id = j.author_id
      where j.project_id = ${data.id}
      order by j.created_at desc
      limit 50
    `;
    const visibleJournals = journalsRows.filter(
      (j) => profile.account_type !== "CUSTOMER" || j.is_visible_to_customer,
    );


    const journals: Journal[] = [];
    for (const j of visibleJournals) {

      const images = await sql<{ id: number; data_url: string }>`
        select id, data_url from journal_images where journal_id = ${j.id} order by sort_order
      `;
      journals.push({ ...j, images });
    }

    const logs = await sql<ProgressLog>`
      select l.id, l.old_progress, l.new_progress, l.note,
             p.full_name as changed_by_name, l.created_at::text as created_at
      from progress_logs l
      left join profiles p on p.user_id = l.changed_by
      where l.project_id = ${data.id}
      order by l.created_at desc
      limit 20
    `;

    const galleryRaw = await sql<{
      id: number;
      data_url: string;
      caption: string | null;
      is_visible_to_customer: boolean;
    }>`
      select id, data_url, caption, is_visible_to_customer from project_images
      where project_id = ${data.id}
      order by created_at desc
      limit 80
    `;
    const gallery = galleryRaw.filter(
      (g) => profile.account_type !== "CUSTOMER" || g.is_visible_to_customer,
    );


    return { profile, project, items, journals, logs, gallery };
  });

export const listCustomersLite = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const profile = await requireProfile(sql, context.userId);
    if (!isDirector(profile)) throw new Error("Chỉ Giám đốc được xem");
    return sql<{ id: number; name: string; phone: string }>`
      select c.id, p.full_name as name, p.phone
      from customers c join profiles p on p.user_id = c.user_id
      order by p.full_name
    `;
  });

export const createProject = createServerFn({ method: "POST" })
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
      items: z.array(z.string()).optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const profile = await requireProfile(sql, context.userId);
    if (!isDirector(profile)) throw new Error("Chỉ Giám đốc được tạo công trình");
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
    const defaults = data.items?.filter(Boolean).length
      ? data.items.filter(Boolean)
      : ["Móng", "Kết cấu", "Xây tô", "Điện nước âm", "Chống thấm", "Sơn nước"];
    let i = 0;
    for (const name of defaults) {
      await sql`
        insert into project_items (project_id, name, status, sort_order)
        values (${id}, ${name}, 'NOT_STARTED', ${i++})
      `;
    }
    await audit(sql, context.userId, "CREATE_PROJECT", "project", id, null, { code, name: data.name });
    const cust = await sql<{ user_id: string; full_name: string }>`
      select c.user_id, p.full_name from customers c join profiles p on p.user_id = c.user_id where c.id = ${data.customerId}
    `;
    if (cust[0]) {
      await notify(
        sql,
        [cust[0].user_id, ...(await staffUserIds(sql))],
        "Công trình mới",
        `${data.name} (${code}) đã được tạo.`,
        "project_created",
        "project",
        String(id),
      );
    }
    return { id, code };
  });

export const updateProgress = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      projectId: z.number(),
      progress: z.number().min(0).max(100),
      note: z.string().optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const profile = await requireProfile(sql, context.userId);
    if (!isDirector(profile)) throw new Error("Chỉ Giám đốc được đổi tiến độ");
    const cur = await sql<{ progress: number; name: string }>`
      select progress, name from projects where id = ${data.projectId}
    `;
    if (!cur[0]) throw new Error("Không tìm thấy công trình");
    const old = cur[0].progress;
    await sql`
      insert into progress_logs (project_id, old_progress, new_progress, note, changed_by)
      values (${data.projectId}, ${old}, ${data.progress}, ${data.note || null}, ${context.userId})
    `;
    await sql`
      update projects set progress = ${data.progress}, updated_at = now() where id = ${data.projectId}
    `;
    await audit(sql, context.userId, "UPDATE_PROGRESS", "project", data.projectId, { progress: old }, { progress: data.progress });
    await notify(
      sql,
      await staffUserIds(sql),
      "Tiến độ cập nhật",
      `${cur[0].name}: ${old}% → ${data.progress}%`,
      "progress",
      "project",
      String(data.projectId),
    );
    return { ok: true };
  });

export const setProjectStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ projectId: z.number(), status: z.enum(["ACTIVE", "COMPLETED"]) }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const profile = await requireProfile(sql, context.userId);
    if (!isDirector(profile)) throw new Error("Chỉ Giám đốc được đổi trạng thái");
    const cur = await sql<{ status: string; progress: number; name: string }>`
      select status, progress, name from projects where id = ${data.projectId}
    `;
    if (!cur[0]) throw new Error("Không tìm thấy công trình");
    if (data.status === "COMPLETED") {
      await sql`
        update projects set status = 'COMPLETED', progress = 100, actual_end_date = current_date, updated_at = now()
        where id = ${data.projectId}
      `;
      await sql`
        insert into progress_logs (project_id, old_progress, new_progress, note, changed_by)
        values (${data.projectId}, ${cur[0].progress}, 100, 'Hoàn thành công trình', ${context.userId})
      `;
      await audit(sql, context.userId, "COMPLETE_PROJECT", "project", data.projectId, { status: cur[0].status }, { status: "COMPLETED" });
    } else {
      await sql`
        update projects set status = 'ACTIVE', actual_end_date = null, updated_at = now()
        where id = ${data.projectId}
      `;
      await audit(sql, context.userId, "REOPEN_PROJECT", "project", data.projectId, { status: "COMPLETED" }, { status: "ACTIVE" });
    }
    return { ok: true };
  });

export const updateItemStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      itemId: z.number(),
      status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"]),
    }),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const profile = await requireProfile(sql, context.userId);
    if (!isDirector(profile)) throw new Error("Chỉ Giám đốc được đổi hạng mục");
    await sql`update project_items set status = ${data.status}, updated_at = now() where id = ${data.itemId}`;
    await audit(sql, context.userId, "UPDATE_ITEM", "project_item", data.itemId, null, { status: data.status });
    return { ok: true };
  });

export const setProjectCover = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ projectId: z.number(), dataUrl: z.string().min(20).max(1_500_000) }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const profile = await requireProfile(sql, context.userId);
    if (!isStaff(profile)) throw new Error("Khách hàng không đổi ảnh đại diện");
    if (!data.dataUrl.startsWith("data:image/")) throw new Error("File ảnh không hợp lệ");
    if (!(await canSeeProject(sql, profile, data.projectId))) throw new Error("Không có quyền");
    await sql`
      update projects set cover_image_url = ${data.dataUrl}, updated_at = now() where id = ${data.projectId}
    `;
    await audit(sql, context.userId, "SET_COVER", "project", data.projectId);
    return { ok: true };
  });

export const createJournal = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      projectId: z.number(),
      category: z.enum(["XAY_DUNG", "DIEN", "NUOC", "SON", "NOI_THAT", "KHAC"]),
      content: z.string().min(3),
      images: z.array(z.string()).max(8),
    }),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const profile = await requireProfile(sql, context.userId);
    if (!isStaff(profile)) throw new Error("Khách hàng không được ghi nhật ký");
    const proj = await sql<{ status: string; name: string }>`select status, name from projects where id = ${data.projectId}`;
    if (!proj[0]) throw new Error("Không tìm thấy công trình");
    if (proj[0].status !== "ACTIVE") throw new Error("Công trình đã hoàn thiện, không thể ghi nhật ký");
    const inserted = await sql<{ id: number }>`
      insert into journals (project_id, author_id, category, content, is_visible_to_customer)
      values (${data.projectId}, ${context.userId}, ${data.category}, ${data.content}, true)
      returning id
    `;
    const jid = inserted[0].id;
    let i = 0;
    for (const img of data.images) {
      if (!img.startsWith("data:image/")) continue;
      if (img.length > 1_200_000) continue;
      await sql`
        insert into journal_images (journal_id, data_url, mime_type, sort_order)
        values (${jid}, ${img}, 'image/jpeg', ${i++})
      `;
      await sql`
        insert into project_images (project_id, data_url, uploaded_by, is_visible_to_customer)
        values (${data.projectId}, ${img}, ${context.userId}, true)
      `;
    }
    await sql`
      update projects
      set updated_at = now(),
          cover_image_url = coalesce(cover_image_url, ${data.images.find((x) => x.startsWith("data:image/")) ?? null})
      where id = ${data.projectId}
    `;
    await audit(sql, context.userId, "CREATE_JOURNAL", "journal", jid, null, {
      projectId: data.projectId,
      images: i,
    });
    const cust = await sql<{ user_id: string }>`
      select c.user_id from projects p join customers c on c.id = p.customer_id where p.id = ${data.projectId}
    `;
    const targets = await staffUserIds(sql);
    if (cust[0]) targets.push(cust[0].user_id);
    await notify(
      sql,
      targets.filter((id) => id !== context.userId),
      "Nhật ký mới",
      `${profile.full_name} vừa cập nhật ${proj[0].name}.`,
      "journal",
      "project",
      String(data.projectId),
    );
    return { id: jid };
  });

export const listJournals = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const profile = await requireProfile(sql, context.userId);
    const rows = isStaff(profile)
      ? await sql<{
          id: number;
          project_id: number;
          project_name: string;
          author_id: string;
          author_name: string | null;
          category: JournalCategory;
          content: string;
          created_at: string;
        }>`
          select j.id, j.project_id, p.name as project_name, j.author_id,
                 a.full_name as author_name, j.category, j.content, j.created_at::text as created_at
          from journals j
          join projects p on p.id = j.project_id
          join profiles a on a.user_id = j.author_id
          order by j.created_at desc
          limit 40
        `
      : await sql<{
          id: number;
          project_id: number;
          project_name: string;
          author_id: string;
          author_name: string | null;
          category: JournalCategory;
          content: string;
          created_at: string;
        }>`
          select j.id, j.project_id, p.name as project_name, j.author_id,
                 a.full_name as author_name, j.category, j.content, j.created_at::text as created_at
          from journals j
          join projects p on p.id = j.project_id
          join customers c on c.id = p.customer_id
          join profiles a on a.user_id = j.author_id
          where c.user_id = ${context.userId} and j.is_visible_to_customer = true
          order by j.created_at desc
          limit 40
        `;
    return rows.map((j) => ({ ...j, images: [] as { id: number; data_url: string }[] }));
  });

export const listPeople = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(z.object({ kind: z.enum(["STAFF", "CUSTOMER"]) }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const profile = await requireProfile(sql, context.userId);
    if (!isDirector(profile)) throw new Error("Chỉ Giám đốc được quản trị");
    if (data.kind === "STAFF") {
      return sql<Profile>`
        select user_id, full_name, phone, account_type, permission_level, job_title, is_active, created_at::text as created_at
        from profiles where account_type = 'STAFF' order by created_at desc
      `;
    }
    return sql<Profile & { customer_id: number }>`
      select p.user_id, p.full_name, p.phone, p.account_type, p.permission_level, p.job_title, p.is_active,
             p.created_at::text as created_at, c.id as customer_id
      from customers c join profiles p on p.user_id = c.user_id
      order by p.created_at desc
    `;
  });

export const createPerson = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      kind: z.enum(["STAFF", "CUSTOMER"]),
      fullName: z.string().min(2),
      phone: z.string().min(8),
      password: z.string().min(6),
      jobTitle: z.string().optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const profile = await requireProfile(sql, context.userId);
    if (!isDirector(profile)) throw new Error("Chỉ Giám đốc được tạo tài khoản");
    const email = `${data.phone.replace(/\s+/g, "")}@huyhoang.build`;
    const existing = await sql<{ id: string }>`select id from "user" where email = ${email}`;
    if (existing[0]) throw new Error("Số điện thoại đã được dùng");
    const id = crypto.randomUUID();
    const hashed = await hashPassword(data.password);
    await sql`
      insert into "user" ("id", "name", "email", "emailVerified", "createdAt", "updatedAt")
      values (${id}, ${data.fullName}, ${email}, true, now(), now())
    `;
    await sql`
      insert into "account" ("id", "accountId", "providerId", "userId", "password", "createdAt", "updatedAt")
      values (${crypto.randomUUID()}, ${id}, 'credential', ${id}, ${hashed}, now(), now())
    `;
    const level = data.kind === "STAFF" ? "STAFF" : "CUSTOMER";
    await sql`
      insert into profiles (user_id, full_name, phone, account_type, permission_level, job_title, is_active)
      values (${id}, ${data.fullName}, ${data.phone}, ${data.kind}, ${level}, ${data.jobTitle || null}, true)
    `;
    if (data.kind === "CUSTOMER") {
      await sql`insert into customers (user_id) values (${id})`;
    }
    await audit(sql, context.userId, "CREATE_USER", "profile", id, null, {
      kind: data.kind,
      phone: data.phone,
      name: data.fullName,
    });
    return { id };
  });

export const setPersonActive = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ userId: z.string(), isActive: z.boolean() }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const profile = await requireProfile(sql, context.userId);
    if (!isDirector(profile)) throw new Error("Chỉ Giám đốc");
    if (data.userId === context.userId) throw new Error("Không thể khóa chính mình");
    await sql`update profiles set is_active = ${data.isActive}, updated_at = now() where user_id = ${data.userId}`;
    await audit(sql, context.userId, data.isActive ? "ENABLE_USER" : "DISABLE_USER", "profile", data.userId);
    return { ok: true };
  });

export const listNotifications = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await requireProfile(sql, context.userId);
    return sql<NotificationRow>`
      select id, title, body, type, entity_type, entity_id, is_read, created_at::text as created_at
      from notifications where user_id = ${context.userId}
      order by created_at desc limit 50
    `;
  });

export const markNotificationsRead = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await sql`update notifications set is_read = true where user_id = ${context.userId}`;
    return { ok: true };
  });

export const listAudit = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const profile = await requireProfile(sql, context.userId);
    if (!isDirector(profile)) throw new Error("Chỉ Giám đốc được xem nhật ký hệ thống");
    return sql<AuditRow>`
      select a.id, a.user_id, p.full_name as actor_name, a.action, a.entity_type, a.entity_id,
             a.before_data, a.after_data, a.created_at::text as created_at
      from audit_logs a
      left join profiles p on p.user_id = a.user_id
      order by a.created_at desc
      limit 80
    `;
  });
