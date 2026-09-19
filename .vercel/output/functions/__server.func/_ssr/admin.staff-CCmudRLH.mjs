import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as RequireAuth } from "./RequireAuth-Bj0yJ7HY.mjs";
import { t as PeopleAdmin } from "./PeopleAdmin-CoHMPoDc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.staff-CCmudRLH.js
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PeopleAdmin, {
		kind: "STAFF",
		title: "Quản lý Nhân sự"
	}) });
}
//#endregion
export { Page as component };
