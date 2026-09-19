import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/EmptyState-BYuyn6TC.js
var import_jsx_runtime = require_jsx_runtime();
function EmptyState({ title, sub }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-dashed border-border px-6 py-12 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-medium text-fg",
			children: title
		}), sub ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted",
			children: sub
		}) : null]
	});
}
//#endregion
export { EmptyState as t };
