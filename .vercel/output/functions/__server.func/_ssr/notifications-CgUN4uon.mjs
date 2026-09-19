import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as formatDateTime, g as listNotifications, y as markNotificationsRead } from "./utils-2XdzZjEt.mjs";
import { t as RequireAuth } from "./RequireAuth-Bj0yJ7HY.mjs";
import { t as EmptyState } from "./EmptyState-BYuyn6TC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/notifications-CgUN4uon.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notes, {}) });
}
function Notes() {
	const [items, setItems] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		listNotifications().then(setItems).catch(() => setItems([]));
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl px-4 py-6 md:px-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-6 flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: "Thông báo"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: async () => {
					await markNotificationsRead();
					setItems((prev) => prev?.map((n) => ({
						...n,
						is_read: true
					})) ?? prev);
				},
				className: "text-sm text-accent",
				children: "Đánh dấu đã đọc"
			})]
		}), items === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-24 animate-pulse rounded-xl bg-surface" }) : items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { title: "Chưa có thông báo" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-2",
			children: items.map((n) => {
				const inner = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `rounded-xl border border-border bg-surface p-4 ${n.is_read ? "opacity-70" : ""}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: n.title
						}),
						n.body ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: n.body
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-subtle",
							children: formatDateTime(n.created_at)
						})
					]
				});
				if (n.entity_type === "project" && n.entity_id) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/projects/$id",
					params: { id: n.entity_id },
					children: inner
				}, n.id);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: inner }, n.id);
			})
		})]
	});
}
//#endregion
export { Page as component };
