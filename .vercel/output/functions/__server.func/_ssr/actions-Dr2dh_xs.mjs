import { i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { A as boolean, D as _enum, F as object, P as number, R as string, k as array } from "../_libs/@better-auth/core+[...].mjs";
import { i as hashPassword$1, r as getSql } from "./db-BQ1sLAyD.mjs";
import { t as authMiddleware } from "./middleware-DzilJ0ce.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/actions-Dr2dh_xs.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
async function getProfile(sql, userId) {
	return (await sql`
    select user_id, full_name, phone, account_type, permission_level, job_title, is_active, created_at::text as created_at
    from profiles where user_id = ${userId}
  `)[0] ?? null;
}
async function requireProfile(sql, userId) {
	const p = await getProfile(sql, userId);
	if (!p || !p.is_active) throw new Error("Tài khoản chưa được kích hoạt. Liên hệ Giám đốc.");
	return p;
}
function isDirector(p) {
	return p.account_type === "STAFF" && p.permission_level === "DIRECTOR";
}
function isStaff(p) {
	return p.account_type === "STAFF";
}
async function canSeeProject(sql, p, projectId) {
	if (isStaff(p)) return true;
	return (await sql`
    select 1 as ok from projects pr
    join customers c on c.id = pr.customer_id
    where pr.id = ${projectId} and c.user_id = ${p.user_id}
  `).length > 0;
}
async function audit(sql, userId, action, entityType, entityId, before, after) {
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
async function notify(sql, userIds, title, body, type, entityType, entityId) {
	const unique = [...new Set(userIds)];
	for (const uid of unique) await sql`
      insert into notifications (user_id, title, body, type, entity_type, entity_id)
      values (${uid}, ${title}, ${body}, ${type}, ${entityType ?? null}, ${entityId ?? null})
    `;
}
async function staffUserIds(sql) {
	return (await sql`
    select user_id from profiles where account_type = 'STAFF' and is_active = true
  `).map((r) => r.user_id);
}
var getBootstrap_createServerFn_handler = createServerRpc({
	id: "b426bb599eb98133fab301a09486e4c8728a9687cee02b592bffd83867e0b77e",
	name: "getBootstrap",
	filename: "src/lib/hhb/actions.ts"
}, (opts) => getBootstrap.__executeServer(opts));
var getBootstrap = createServerFn({ method: "GET" }).handler(getBootstrap_createServerFn_handler, async () => {
	return { hasDirector: ((await (await getSql())`select count(*)::int as n from profiles`)[0]?.n ?? 0) > 0 };
});
var getMyProfile_createServerFn_handler = createServerRpc({
	id: "6cbed7828d5a18b006fe35df8af8c77fe7bee1db46ba801717a540c03ef0a7d9",
	name: "getMyProfile",
	filename: "src/lib/hhb/actions.ts"
}, (opts) => getMyProfile.__executeServer(opts));
var getMyProfile = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getMyProfile_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	let profile = await getProfile(sql, context.userId);
	if (!profile) {
		if (((await sql`select count(*)::int as n from profiles`)[0]?.n ?? 0) === 0) {
			const { getSessionUser } = await import("./verify.server-BX3zMbg5.mjs");
			const name = (await getSessionUser())?.email?.split("@")[0] || "Giám đốc";
			const phone = `000${Date.now().toString().slice(-7)}`;
			await sql`
          insert into profiles (user_id, full_name, phone, account_type, permission_level, job_title, is_active)
          values (${context.userId}, ${name}, ${phone}, 'STAFF', 'DIRECTOR', 'Giám đốc', true)
        `;
			profile = await getProfile(sql, context.userId);
		}
	}
	return { profile };
});
var bootstrapDirector_createServerFn_handler = createServerRpc({
	id: "beb6fbd1559faf946695545a8dee8be9913cd25942cb5e2a19f55d28651acea4",
	name: "bootstrapDirector",
	filename: "src/lib/hhb/actions.ts"
}, (opts) => bootstrapDirector.__executeServer(opts));
var bootstrapDirector = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	fullName: string().min(2),
	phone: string().min(8)
})).handler(bootstrapDirector_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	if (((await sql`select count(*)::int as n from profiles`)[0]?.n ?? 0) > 0) throw new Error("Hệ thống đã được khởi tạo");
	await sql`
      insert into profiles (user_id, full_name, phone, account_type, permission_level, job_title, is_active)
      values (${context.userId}, ${data.fullName}, ${data.phone}, 'STAFF', 'DIRECTOR', 'Giám đốc', true)
    `;
	await audit(sql, context.userId, "BOOTSTRAP_DIRECTOR", "profile", context.userId, null, {
		fullName: data.fullName,
		phone: data.phone
	});
	return { ok: true };
});
var getDashboard_createServerFn_handler = createServerRpc({
	id: "7e61fac29aed80823dd1759dcff27cc5166a8d0e9b77c74cf358389dba33fe9d",
	name: "getDashboard",
	filename: "src/lib/hhb/actions.ts"
}, (opts) => getDashboard.__executeServer(opts));
var getDashboard = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getDashboard_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const profile = await requireProfile(sql, context.userId);
	if (profile.account_type === "CUSTOMER") {
		const projects = await sql`
        select p.id, p.code, p.name, p.customer_id, pr.full_name as customer_name,
               p.address, p.project_type, p.start_date::text as start_date,
               p.expected_end_date::text as expected_end_date,
               p.actual_end_date::text as actual_end_date,
               p.progress, p.status, p.description,
               p.created_at::text as created_at, p.updated_at::text as updated_at
        from projects p
        join customers c on c.id = p.customer_id
        join profiles pr on pr.user_id = c.user_id
        where c.user_id = ${context.userId}
        order by p.updated_at desc
      `;
		const latest = {};
		for (const p of projects) {
			const j = await sql`
          select content from journals
          where project_id = ${p.id} and is_visible_to_customer = true
          order by created_at desc limit 1
        `;
			if (j[0]) latest[p.id] = j[0].content;
		}
		return {
			profile,
			projects,
			latest,
			stats: null,
			journals: []
		};
	}
	const active = await sql`select count(*)::int as n from projects where status = 'ACTIVE'`;
	const completed = await sql`select count(*)::int as n from projects where status = 'COMPLETED'`;
	const customers = await sql`select count(*)::int as n from customers`;
	const staff = await sql`select count(*)::int as n from profiles where account_type = 'STAFF'`;
	const stale = await sql`
      select p.id, p.name,
        greatest(0, floor(extract(epoch from (now() - coalesce(
          (select max(j.created_at) from journals j where j.project_id = p.id), p.created_at
        ))) / 86400))::int as days
      from projects p
      where p.status = 'ACTIVE'
      order by days desc
      limit 8
    `;
	const journalsRaw = await sql`
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
		projects: [],
		latest: {},
		stats: {
			active: active[0]?.n ?? 0,
			completed: completed[0]?.n ?? 0,
			customers: customers[0]?.n ?? 0,
			staff: staff[0]?.n ?? 0,
			stale
		},
		journals: journalsRaw.map((j) => ({
			...j,
			images: []
		}))
	};
});
var listProjects_createServerFn_handler = createServerRpc({
	id: "7a1278c3e8401a4236b8b505ffeefcc5e15807057fecfb3780a6ca04f0572152",
	name: "listProjects",
	filename: "src/lib/hhb/actions.ts"
}, (opts) => listProjects.__executeServer(opts));
var listProjects = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listProjects_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	if (isStaff(await requireProfile(sql, context.userId))) return sql`
        select p.id, p.code, p.name, p.customer_id, pr.full_name as customer_name,
               p.address, p.project_type, p.start_date::text as start_date,
               p.expected_end_date::text as expected_end_date,
               p.actual_end_date::text as actual_end_date,
               p.progress, p.status, p.description,
               p.created_at::text as created_at, p.updated_at::text as updated_at
        from projects p
        join customers c on c.id = p.customer_id
        join profiles pr on pr.user_id = c.user_id
        order by p.updated_at desc
      `;
	return sql`
      select p.id, p.code, p.name, p.customer_id, pr.full_name as customer_name,
             p.address, p.project_type, p.start_date::text as start_date,
             p.expected_end_date::text as expected_end_date,
             p.actual_end_date::text as actual_end_date,
             p.progress, p.status, p.description,
             p.created_at::text as created_at, p.updated_at::text as updated_at
      from projects p
      join customers c on c.id = p.customer_id
      join profiles pr on pr.user_id = c.user_id
      where c.user_id = ${context.userId}
      order by p.updated_at desc
    `;
});
var getProjectDetail_createServerFn_handler = createServerRpc({
	id: "481f95ed2a6b1c7f904cc0ebf020d55fc5c5e82181d217b64df5e7590508fe53",
	name: "getProjectDetail",
	filename: "src/lib/hhb/actions.ts"
}, (opts) => getProjectDetail.__executeServer(opts));
var getProjectDetail = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator(object({ id: number() })).handler(getProjectDetail_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const profile = await requireProfile(sql, context.userId);
	if (!await canSeeProject(sql, profile, data.id)) throw new Error("Không có quyền xem công trình này");
	const showCost = isDirector(profile);
	const project = (await sql`
      select p.id, p.code, p.name, p.customer_id, pr.full_name as customer_name,
             p.address, p.project_type, p.start_date::text as start_date,
             p.expected_end_date::text as expected_end_date,
             p.actual_end_date::text as actual_end_date,
             p.progress, p.status, p.description,
             p.created_at::text as created_at, p.updated_at::text as updated_at
      from projects p
      join customers c on c.id = p.customer_id
      join profiles pr on pr.user_id = c.user_id
      where p.id = ${data.id}
    `)[0];
	if (!project) throw new Error("Không tìm thấy công trình");
	const items = (await sql`
      select id, project_id, name, description, category, status, sort_order,
             internal_cost::text as internal_cost,
             unit, quantity::text as quantity, is_visible_to_customer
      from project_items
      where project_id = ${data.id}
      order by sort_order, id
    `).filter((it) => profile.account_type !== "CUSTOMER" || it.is_visible_to_customer).map((it) => ({
		...it,
		internal_cost: showCost ? it.internal_cost : null
	}));
	const visibleJournals = (await sql`
      select j.id, j.project_id, j.author_id, a.full_name as author_name,
             j.category, j.content, j.created_at::text as created_at,
             j.is_visible_to_customer
      from journals j
      join profiles a on a.user_id = j.author_id
      where j.project_id = ${data.id}
      order by j.created_at desc
      limit 50
    `).filter((j) => profile.account_type !== "CUSTOMER" || j.is_visible_to_customer);
	const journals = [];
	for (const j of visibleJournals) {
		const images = await sql`
        select id, data_url from journal_images where journal_id = ${j.id} order by sort_order
      `;
		journals.push({
			...j,
			images
		});
	}
	return {
		profile,
		project,
		items,
		journals,
		logs: await sql`
      select l.id, l.old_progress, l.new_progress, l.note,
             p.full_name as changed_by_name, l.created_at::text as created_at
      from progress_logs l
      left join profiles p on p.user_id = l.changed_by
      where l.project_id = ${data.id}
      order by l.created_at desc
      limit 20
    `,
		gallery: (await sql`
      select id, data_url, caption, is_visible_to_customer from project_images
      where project_id = ${data.id}
      order by created_at desc
      limit 80
    `).filter((g) => profile.account_type !== "CUSTOMER" || g.is_visible_to_customer)
	};
});
var listCustomersLite_createServerFn_handler = createServerRpc({
	id: "fe6a02310630a432692306abd615648828b436c991f1c9fe1b1644db5b2e0aa0",
	name: "listCustomersLite",
	filename: "src/lib/hhb/actions.ts"
}, (opts) => listCustomersLite.__executeServer(opts));
var listCustomersLite = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listCustomersLite_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	if (!isDirector(await requireProfile(sql, context.userId))) throw new Error("Chỉ Giám đốc được xem");
	return sql`
      select c.id, p.full_name as name, p.phone
      from customers c join profiles p on p.user_id = c.user_id
      order by p.full_name
    `;
});
var createProject_createServerFn_handler = createServerRpc({
	id: "9035a7332515fce5828fdcc500c8857bcef8a5918fb363e0cef18ed134b6a395",
	name: "createProject",
	filename: "src/lib/hhb/actions.ts"
}, (opts) => createProject.__executeServer(opts));
var createProject = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	name: string().min(2),
	customerId: number(),
	address: string().min(2),
	projectType: string().optional(),
	startDate: string().optional(),
	expectedEndDate: string().optional(),
	description: string().optional(),
	items: array(string()).optional()
})).handler(createProject_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	if (!isDirector(await requireProfile(sql, context.userId))) throw new Error("Chỉ Giám đốc được tạo công trình");
	const year = (/* @__PURE__ */ new Date()).getFullYear();
	const cnt = await sql`
      select count(*)::int as n from projects where code like ${`HHB-${year}-%`}
    `;
	const code = `HHB-${year}-${String((cnt[0]?.n ?? 0) + 1).padStart(3, "0")}`;
	const id = (await sql`
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
    `)[0].id;
	const defaults = data.items?.filter(Boolean).length ? data.items.filter(Boolean) : [
		"Móng",
		"Kết cấu",
		"Xây tô",
		"Điện nước âm",
		"Chống thấm",
		"Sơn nước"
	];
	let i = 0;
	for (const name of defaults) await sql`
        insert into project_items (project_id, name, status, sort_order)
        values (${id}, ${name}, 'NOT_STARTED', ${i++})
      `;
	await audit(sql, context.userId, "CREATE_PROJECT", "project", id, null, {
		code,
		name: data.name
	});
	const cust = await sql`
      select c.user_id, p.full_name from customers c join profiles p on p.user_id = c.user_id where c.id = ${data.customerId}
    `;
	if (cust[0]) await notify(sql, [cust[0].user_id, ...await staffUserIds(sql)], "Công trình mới", `${data.name} (${code}) đã được tạo.`, "project_created", "project", String(id));
	return {
		id,
		code
	};
});
var updateProgress_createServerFn_handler = createServerRpc({
	id: "0001d1de8ed3b48de5ee98ea9c914804a55767b7692247d997322b9f00312eca",
	name: "updateProgress",
	filename: "src/lib/hhb/actions.ts"
}, (opts) => updateProgress.__executeServer(opts));
var updateProgress = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	projectId: number(),
	progress: number().min(0).max(100),
	note: string().optional()
})).handler(updateProgress_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	if (!isDirector(await requireProfile(sql, context.userId))) throw new Error("Chỉ Giám đốc được đổi tiến độ");
	const cur = await sql`
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
	await notify(sql, await staffUserIds(sql), "Tiến độ cập nhật", `${cur[0].name}: ${old}% → ${data.progress}%`, "progress", "project", String(data.projectId));
	return { ok: true };
});
var setProjectStatus_createServerFn_handler = createServerRpc({
	id: "bc76927b73c0b267f6fa20fa9f3b36a2803cc81b5b12c2734e359f95a496f6e9",
	name: "setProjectStatus",
	filename: "src/lib/hhb/actions.ts"
}, (opts) => setProjectStatus.__executeServer(opts));
var setProjectStatus = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	projectId: number(),
	status: _enum(["ACTIVE", "COMPLETED"])
})).handler(setProjectStatus_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	if (!isDirector(await requireProfile(sql, context.userId))) throw new Error("Chỉ Giám đốc được đổi trạng thái");
	const cur = await sql`
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
var updateItemStatus_createServerFn_handler = createServerRpc({
	id: "a1c1e1aab24d35e432705c384d0059edf25b82aa89010c3ecacf3d61b964a30e",
	name: "updateItemStatus",
	filename: "src/lib/hhb/actions.ts"
}, (opts) => updateItemStatus.__executeServer(opts));
var updateItemStatus = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	itemId: number(),
	status: _enum([
		"NOT_STARTED",
		"IN_PROGRESS",
		"COMPLETED"
	])
})).handler(updateItemStatus_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	if (!isDirector(await requireProfile(sql, context.userId))) throw new Error("Chỉ Giám đốc được đổi hạng mục");
	await sql`update project_items set status = ${data.status}, updated_at = now() where id = ${data.itemId}`;
	await audit(sql, context.userId, "UPDATE_ITEM", "project_item", data.itemId, null, { status: data.status });
	return { ok: true };
});
var createJournal_createServerFn_handler = createServerRpc({
	id: "85ae6d85a595aef3753fcee84a6b5cdeb2f916a7a6f131faa3d27342760fd787",
	name: "createJournal",
	filename: "src/lib/hhb/actions.ts"
}, (opts) => createJournal.__executeServer(opts));
var createJournal = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	projectId: number(),
	category: _enum([
		"XAY_DUNG",
		"DIEN",
		"NUOC",
		"SON",
		"NOI_THAT",
		"KHAC"
	]),
	content: string().min(3),
	images: array(string()).max(8)
})).handler(createJournal_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const profile = await requireProfile(sql, context.userId);
	if (!isStaff(profile)) throw new Error("Khách hàng không được ghi nhật ký");
	const proj = await sql`select status, name from projects where id = ${data.projectId}`;
	if (!proj[0]) throw new Error("Không tìm thấy công trình");
	if (proj[0].status !== "ACTIVE") throw new Error("Công trình đã hoàn thiện, không thể ghi nhật ký");
	const jid = (await sql`
      insert into journals (project_id, author_id, category, content, is_visible_to_customer)
      values (${data.projectId}, ${context.userId}, ${data.category}, ${data.content}, true)
      returning id
    `)[0].id;
	let i = 0;
	for (const img of data.images) {
		if (!img.startsWith("data:image/")) continue;
		if (img.length > 12e5) continue;
		await sql`
        insert into journal_images (journal_id, data_url, mime_type, sort_order)
        values (${jid}, ${img}, 'image/jpeg', ${i++})
      `;
		await sql`
        insert into project_images (project_id, data_url, uploaded_by, is_visible_to_customer)
        values (${data.projectId}, ${img}, ${context.userId}, true)
      `;
	}
	await sql`update projects set updated_at = now() where id = ${data.projectId}`;
	await audit(sql, context.userId, "CREATE_JOURNAL", "journal", jid, null, {
		projectId: data.projectId,
		images: i
	});
	const cust = await sql`
      select c.user_id from projects p join customers c on c.id = p.customer_id where p.id = ${data.projectId}
    `;
	const targets = await staffUserIds(sql);
	if (cust[0]) targets.push(cust[0].user_id);
	await notify(sql, targets.filter((id) => id !== context.userId), "Nhật ký mới", `${profile.full_name} vừa cập nhật ${proj[0].name}.`, "journal", "project", String(data.projectId));
	return { id: jid };
});
var listJournals_createServerFn_handler = createServerRpc({
	id: "db9e56b0bb3801d2926887956d1bdb9a293be4dbd52794a50038e3168565ece4",
	name: "listJournals",
	filename: "src/lib/hhb/actions.ts"
}, (opts) => listJournals.__executeServer(opts));
var listJournals = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listJournals_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	return (isStaff(await requireProfile(sql, context.userId)) ? await sql`
          select j.id, j.project_id, p.name as project_name, j.author_id,
                 a.full_name as author_name, j.category, j.content, j.created_at::text as created_at
          from journals j
          join projects p on p.id = j.project_id
          join profiles a on a.user_id = j.author_id
          order by j.created_at desc
          limit 40
        ` : await sql`
          select j.id, j.project_id, p.name as project_name, j.author_id,
                 a.full_name as author_name, j.category, j.content, j.created_at::text as created_at
          from journals j
          join projects p on p.id = j.project_id
          join customers c on c.id = p.customer_id
          join profiles a on a.user_id = j.author_id
          where c.user_id = ${context.userId} and j.is_visible_to_customer = true
          order by j.created_at desc
          limit 40
        `).map((j) => ({
		...j,
		images: []
	}));
});
var listPeople_createServerFn_handler = createServerRpc({
	id: "216222a0b01c804b51aa2b56e44f1dc1b37bc0b37fa2240a55d4489f39720242",
	name: "listPeople",
	filename: "src/lib/hhb/actions.ts"
}, (opts) => listPeople.__executeServer(opts));
var listPeople = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator(object({ kind: _enum(["STAFF", "CUSTOMER"]) })).handler(listPeople_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	if (!isDirector(await requireProfile(sql, context.userId))) throw new Error("Chỉ Giám đốc được quản trị");
	if (data.kind === "STAFF") return sql`
        select user_id, full_name, phone, account_type, permission_level, job_title, is_active, created_at::text as created_at
        from profiles where account_type = 'STAFF' order by created_at desc
      `;
	return sql`
      select p.user_id, p.full_name, p.phone, p.account_type, p.permission_level, p.job_title, p.is_active,
             p.created_at::text as created_at, c.id as customer_id
      from customers c join profiles p on p.user_id = c.user_id
      order by p.created_at desc
    `;
});
var createPerson_createServerFn_handler = createServerRpc({
	id: "24c1dba83201d09faac94ea6177b220c1f5a03d23649b68a25d81a9143d30d5b",
	name: "createPerson",
	filename: "src/lib/hhb/actions.ts"
}, (opts) => createPerson.__executeServer(opts));
var createPerson = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	kind: _enum(["STAFF", "CUSTOMER"]),
	fullName: string().min(2),
	phone: string().min(8),
	password: string().min(6),
	jobTitle: string().optional()
})).handler(createPerson_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	if (!isDirector(await requireProfile(sql, context.userId))) throw new Error("Chỉ Giám đốc được tạo tài khoản");
	const email = `${data.phone.replace(/\s+/g, "")}@huyhoang.build`;
	if ((await sql`select id from "user" where email = ${email}`)[0]) throw new Error("Số điện thoại đã được dùng");
	const id = crypto.randomUUID();
	const hashed = await hashPassword$1(data.password);
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
	if (data.kind === "CUSTOMER") await sql`insert into customers (user_id) values (${id})`;
	await audit(sql, context.userId, "CREATE_USER", "profile", id, null, {
		kind: data.kind,
		phone: data.phone,
		name: data.fullName
	});
	return { id };
});
var setPersonActive_createServerFn_handler = createServerRpc({
	id: "f947f902fd4e742494365f2665a70226c6d8c8a0b6a7025b7234a447a6646594",
	name: "setPersonActive",
	filename: "src/lib/hhb/actions.ts"
}, (opts) => setPersonActive.__executeServer(opts));
var setPersonActive = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	userId: string(),
	isActive: boolean()
})).handler(setPersonActive_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	if (!isDirector(await requireProfile(sql, context.userId))) throw new Error("Chỉ Giám đốc");
	if (data.userId === context.userId) throw new Error("Không thể khóa chính mình");
	await sql`update profiles set is_active = ${data.isActive}, updated_at = now() where user_id = ${data.userId}`;
	await audit(sql, context.userId, data.isActive ? "ENABLE_USER" : "DISABLE_USER", "profile", data.userId);
	return { ok: true };
});
var listNotifications_createServerFn_handler = createServerRpc({
	id: "4ef62b92f76d7405fda9a37979f67598fda4a4c39ba3b267405a587e3a840865",
	name: "listNotifications",
	filename: "src/lib/hhb/actions.ts"
}, (opts) => listNotifications.__executeServer(opts));
var listNotifications = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listNotifications_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await requireProfile(sql, context.userId);
	return sql`
      select id, title, body, type, entity_type, entity_id, is_read, created_at::text as created_at
      from notifications where user_id = ${context.userId}
      order by created_at desc limit 50
    `;
});
var markNotificationsRead_createServerFn_handler = createServerRpc({
	id: "53e11c0f835ed540b1003f18317c14d66ee6a563df6c303c41aa8ebd4addc509",
	name: "markNotificationsRead",
	filename: "src/lib/hhb/actions.ts"
}, (opts) => markNotificationsRead.__executeServer(opts));
var markNotificationsRead = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(markNotificationsRead_createServerFn_handler, async ({ context }) => {
	await (await getSql())`update notifications set is_read = true where user_id = ${context.userId}`;
	return { ok: true };
});
var listAudit_createServerFn_handler = createServerRpc({
	id: "fac677731fa652de6da36faa3d58453e0a36bd31b4c8a17d14a752c4cbc63c64",
	name: "listAudit",
	filename: "src/lib/hhb/actions.ts"
}, (opts) => listAudit.__executeServer(opts));
var listAudit = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listAudit_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	if (!isDirector(await requireProfile(sql, context.userId))) throw new Error("Chỉ Giám đốc được xem nhật ký hệ thống");
	return sql`
      select a.id, a.user_id, p.full_name as actor_name, a.action, a.entity_type, a.entity_id,
             a.before_data, a.after_data, a.created_at::text as created_at
      from audit_logs a
      left join profiles p on p.user_id = a.user_id
      order by a.created_at desc
      limit 80
    `;
});
//#endregion
export { bootstrapDirector_createServerFn_handler, createJournal_createServerFn_handler, createPerson_createServerFn_handler, createProject_createServerFn_handler, getBootstrap_createServerFn_handler, getDashboard_createServerFn_handler, getMyProfile_createServerFn_handler, getProjectDetail_createServerFn_handler, listAudit_createServerFn_handler, listCustomersLite_createServerFn_handler, listJournals_createServerFn_handler, listNotifications_createServerFn_handler, listPeople_createServerFn_handler, listProjects_createServerFn_handler, markNotificationsRead_createServerFn_handler, setPersonActive_createServerFn_handler, setProjectStatus_createServerFn_handler, updateItemStatus_createServerFn_handler, updateProgress_createServerFn_handler };
