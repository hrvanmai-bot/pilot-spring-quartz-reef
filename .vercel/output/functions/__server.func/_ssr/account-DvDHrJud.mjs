import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as getMyProfile } from "./utils-2XdzZjEt.mjs";
import { n as UserButton, t as RequireAuth } from "./RequireAuth-Bj0yJ7HY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/account-DvDHrJud.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Account, {}) });
}
function Account() {
	const [p, setP] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		getMyProfile().then((r) => setP(r.profile));
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-lg px-4 py-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: "Tài khoản"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 space-y-3 rounded-xl border border-border bg-surface p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Họ tên",
						value: p?.full_name ?? "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Điện thoại",
						value: p?.phone ?? "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Vai trò",
						value: p?.permission_level === "DIRECTOR" ? "Giám đốc" : p?.account_type === "STAFF" ? "Nhân sự" : "Khách hàng"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})
			})
		]
	});
}
function Row({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex justify-between text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: value })]
	});
}
//#endregion
export { Page as component };
