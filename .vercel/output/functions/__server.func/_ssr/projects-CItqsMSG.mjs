import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as getMyProfile, v as listProjects } from "./utils-2XdzZjEt.mjs";
import { a as Plus } from "../_libs/lucide-react.mjs";
import { t as RequireAuth } from "./RequireAuth-Bj0yJ7HY.mjs";
import { t as EmptyState } from "./EmptyState-BYuyn6TC.mjs";
import { t as ProgressBar } from "./ProgressBar-BvLxpdyV.mjs";
import { t as StatusBadge } from "./StatusBadge-DtmK26Lj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/projects-CItqsMSG.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Projects, {}) });
}
function Projects() {
	const [projects, setProjects] = (0, import_react.useState)(null);
	const [director, setDirector] = (0, import_react.useState)(false);
	const [q, setQ] = (0, import_react.useState)("");
	const [filter, setFilter] = (0, import_react.useState)("ALL");
	const [sort, setSort] = (0, import_react.useState)("newest");
	const [err, setErr] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		listProjects().then(setProjects).catch((e) => setErr(e instanceof Error ? e.message : "Không thể tải dữ liệu."));
		getMyProfile().then((r) => setDirector(r.profile?.permission_level === "DIRECTOR"));
	}, []);
	const list = (0, import_react.useMemo)(() => {
		let rows = [...projects ?? []];
		if (q.trim()) {
			const s = q.toLowerCase();
			rows = rows.filter((p) => p.name.toLowerCase().includes(s) || p.code.toLowerCase().includes(s) || p.address.toLowerCase().includes(s) || (p.customer_name ?? "").toLowerCase().includes(s));
		}
		if (filter !== "ALL") rows = rows.filter((p) => p.status === filter);
		rows.sort((a, b) => {
			if (sort === "az") return a.name.localeCompare(b.name, "vi");
			const da = new Date(a.updated_at).getTime();
			const db = new Date(b.updated_at).getTime();
			return sort === "newest" ? db - da : da - db;
		});
		return rows;
	}, [
		projects,
		q,
		filter,
		sort
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-5xl px-4 py-6 md:px-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl",
					children: "Công trình"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted",
					children: [projects?.length ?? 0, " công trình"]
				})] }), director ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/admin/projects/new",
					className: "inline-flex h-11 items-center gap-1 rounded-lg bg-accent px-4 text-sm font-semibold text-accent-fg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " Tạo mới"]
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				value: q,
				onChange: (e) => setQ(e.target.value),
				placeholder: "Tìm theo tên, mã, địa chỉ, khách hàng...",
				className: "h-12 w-full rounded-lg border border-border bg-surface px-4 outline-none focus:border-accent"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap items-center gap-2",
				children: [[
					"ALL",
					"ACTIVE",
					"COMPLETED"
				].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setFilter(s),
					className: `rounded-full px-4 py-1.5 text-sm ${filter === s ? "bg-accent font-medium text-accent-fg" : "border border-border text-muted"}`,
					children: s === "ALL" ? "Tất cả" : s === "ACTIVE" ? "Đang thi công" : "Đã hoàn thiện"
				}, s)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					value: sort,
					onChange: (e) => setSort(e.target.value),
					className: "ml-auto rounded-full border border-border bg-surface px-3 py-1.5 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "newest",
							children: "Mới nhất"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "oldest",
							children: "Cũ nhất"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "az",
							children: "A → Z"
						})
					]
				})]
			}),
			err ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 text-danger",
				children: err
			}) : null,
			!projects ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 space-y-3",
				children: [
					1,
					2,
					3
				].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-28 animate-pulse rounded-xl bg-surface" }, i))
			}) : list.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					title: projects.length === 0 ? "Chưa có công trình" : "Không tìm thấy công trình",
					sub: projects.length === 0 ? "Những công trình được tạo bởi Giám đốc sẽ xuất hiện tại đây." : void 0
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 space-y-3",
				children: list.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/projects/$id",
					params: { id: String(p.id) },
					className: "block rounded-xl border border-border bg-surface p-4 md:p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "truncate font-semibold",
									children: p.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted",
									children: [p.code, p.customer_name ? ` · ${p.customer_name}` : ""]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 truncate text-sm text-muted",
									children: p.address
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: p.status })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressBar, { value: p.progress })
					})]
				}, p.id))
			})
		]
	});
}
//#endregion
export { Page as component };
