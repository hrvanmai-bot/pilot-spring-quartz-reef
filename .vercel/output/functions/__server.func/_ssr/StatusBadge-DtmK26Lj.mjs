import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as cn } from "./utils-2XdzZjEt.mjs";
import { u as Circle } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/StatusBadge-DtmK26Lj.js
var import_jsx_runtime = require_jsx_runtime();
function StatusBadge({ status }) {
	const active = status === "ACTIVE";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", active ? "bg-accent/15 text-accent" : "bg-ok/15 text-ok"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, { className: "size-2 fill-current" }), active ? "Đang thi công" : "Đã hoàn thiện"]
	});
}
//#endregion
export { StatusBadge as t };
