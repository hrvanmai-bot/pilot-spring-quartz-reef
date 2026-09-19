import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as formatDateTime, p as listAudit } from "./utils-2XdzZjEt.mjs";
import { t as RequireAuth } from "./RequireAuth-Bj0yJ7HY.mjs";
import { t as EmptyState } from "./EmptyState-BYuyn6TC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.audit-Cd05vo24.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Audit, {}) });
}
function Audit() {
	const [rows, setRows] = (0, import_react.useState)(null);
	const [err, setErr] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		listAudit().then(setRows).catch((e) => setErr(e instanceof Error ? e.message : "Lỗi"));
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl px-4 py-6 md:px-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: "Nhật ký hệ thống"
			}),
			err ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-danger",
				children: err
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 space-y-2",
				children: rows === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-24 animate-pulse rounded-xl bg-surface" }) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { title: "Chưa có nhật ký" }) : rows.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-border bg-surface p-4 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-medium",
							children: [
								a.action,
								" · ",
								a.entity_type,
								a.entity_id ? ` #${a.entity_id}` : ""
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-xs text-muted",
							children: [
								a.actor_name ?? "Hệ thống",
								" · ",
								formatDateTime(a.created_at)
							]
						}),
						a.after_data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 truncate text-xs text-subtle",
							children: a.after_data
						}) : null
					]
				}, a.id))
			})
		]
	});
}
//#endregion
export { Page as component };
