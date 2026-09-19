import { S as require_jsx_runtime, y as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as useCurrentUserState } from "./use-current-user-DG6UNzh9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-C-IHTYYo.js
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	const { user, isPending } = useCurrentUserState();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-screen place-items-center bg-bg text-muted",
		children: "Đang tải..."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: user ? "/dashboard" : "/login" });
}
//#endregion
export { Home as component };
