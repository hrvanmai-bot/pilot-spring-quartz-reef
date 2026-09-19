import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as formatDateTime, h as listJournals } from "./utils-2XdzZjEt.mjs";
import { t as RequireAuth } from "./RequireAuth-Bj0yJ7HY.mjs";
import { t as EmptyState } from "./EmptyState-BYuyn6TC.mjs";
import { n as JOURNAL_CATEGORY_LABEL } from "./types-KMXsLaO5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/journals-CzDFrouB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {}) });
}
function List() {
	const [items, setItems] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		listJournals().then(setItems).catch(() => setItems([]));
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl px-4 py-6 md:px-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-3xl",
			children: "Nhật ký"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6 space-y-3",
			children: items === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-32 animate-pulse rounded-xl bg-surface" }) : items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { title: "Chưa có nhật ký" }) : items.map((j) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/projects/$id",
				params: { id: String(j.project_id) },
				className: "block rounded-xl border border-border bg-surface p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium text-accent",
						children: j.project_name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm",
						children: j.content
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-xs text-subtle",
						children: [
							j.author_name,
							" · ",
							JOURNAL_CATEGORY_LABEL[j.category],
							" · ",
							formatDateTime(j.created_at)
						]
					})
				]
			}, j.id))
		})]
	});
}
//#endregion
export { Page as component };
