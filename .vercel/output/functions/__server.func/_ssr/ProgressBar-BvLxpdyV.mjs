import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ProgressBar-BvLxpdyV.js
var import_jsx_runtime = require_jsx_runtime();
function ProgressBar({ value }) {
	const v = Math.max(0, Math.min(100, value));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-1 flex justify-between text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted",
			children: "Tiến độ"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "font-semibold tabular-nums text-accent",
			children: [v, "%"]
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-2 overflow-hidden rounded-full bg-bg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-full rounded-full bg-accent transition-[width] duration-300",
			style: { width: `${v}%` }
		})
	})] });
}
//#endregion
export { ProgressBar as t };
