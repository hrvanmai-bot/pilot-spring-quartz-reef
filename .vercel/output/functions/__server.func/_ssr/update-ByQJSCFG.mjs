import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { v as listProjects } from "./utils-2XdzZjEt.mjs";
import { t as RequireAuth } from "./RequireAuth-Bj0yJ7HY.mjs";
import { t as EmptyState } from "./EmptyState-BYuyn6TC.mjs";
import { t as StatusBadge } from "./StatusBadge-DtmK26Lj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/update-ByQJSCFG.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Update, {}) });
}
function Update() {
	const [projects, setProjects] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		listProjects().then(setProjects).catch(() => setProjects([]));
	}, []);
	const active = (projects ?? []).filter((p) => p.status === "ACTIVE");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-lg px-4 py-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: "Cập nhật công trình"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Chọn công trình đang thi công để ghi nhật ký."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 space-y-3",
				children: projects === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-24 animate-pulse rounded-xl bg-surface" }) : active.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { title: "Không có công trình đang thi công" }) : active.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/projects/$id/journal",
					params: { id: String(p.id) },
					className: "block rounded-xl border border-border bg-surface p-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-semibold",
							children: p.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: p.code
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: p.status })]
					})
				}, p.id))
			})
		]
	});
}
//#endregion
export { Page as component };
