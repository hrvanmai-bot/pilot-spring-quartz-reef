import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as listPeople, a as createPerson, x as setPersonActive } from "./utils-2XdzZjEt.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/PeopleAdmin-CoHMPoDc.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PeopleAdmin({ kind, title }) {
	const [rows, setRows] = (0, import_react.useState)(null);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [fullName, setFullName] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [jobTitle, setJobTitle] = (0, import_react.useState)("");
	const [err, setErr] = (0, import_react.useState)(null);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const load = () => listPeople({ data: { kind } }).then(setRows).catch((e) => setErr(e instanceof Error ? e.message : "Lỗi"));
	(0, import_react.useEffect)(() => {
		load();
	}, [kind]);
	const submit = async (e) => {
		e.preventDefault();
		setErr(null);
		setSaving(true);
		try {
			await createPerson({ data: {
				kind,
				fullName,
				phone,
				password,
				jobTitle: jobTitle || void 0
			} });
			setFullName("");
			setPhone("");
			setPassword("");
			setJobTitle("");
			setOpen(false);
			await load();
		} catch (e) {
			setErr(e instanceof Error ? e.message : "Không tạo được");
		}
		setSaving(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl px-4 py-6 md:px-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setOpen((v) => !v),
					className: "h-11 rounded-lg bg-accent px-4 text-sm font-semibold text-accent-fg",
					children: open ? "Đóng" : "Thêm"
				})]
			}),
			open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: submit,
				className: "mb-6 space-y-3 rounded-xl border border-border bg-surface p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						required: true,
						value: fullName,
						onChange: (e) => setFullName(e.target.value),
						placeholder: "Họ và tên",
						className: "h-11 w-full rounded-lg border border-border bg-bg px-3"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						required: true,
						value: phone,
						onChange: (e) => setPhone(e.target.value),
						placeholder: "Số điện thoại",
						className: "h-11 w-full rounded-lg border border-border bg-bg px-3"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						required: true,
						type: "password",
						value: password,
						onChange: (e) => setPassword(e.target.value),
						placeholder: "Mật khẩu tạm thời",
						className: "h-11 w-full rounded-lg border border-border bg-bg px-3"
					}),
					kind === "STAFF" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: jobTitle,
						onChange: (e) => setJobTitle(e.target.value),
						placeholder: "Chức vụ",
						className: "h-11 w-full rounded-lg border border-border bg-bg px-3"
					}) : null,
					err ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-danger",
						children: err
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						disabled: saving,
						className: "h-11 w-full rounded-lg bg-accent font-semibold text-accent-fg disabled:opacity-50",
						children: saving ? "Đang tạo..." : "Tạo tài khoản"
					})
				]
			}) : null,
			rows === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-24 animate-pulse rounded-xl bg-surface" }) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted",
				children: "Chưa có dữ liệu"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-2",
				children: rows.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-medium",
						children: [s.full_name, s.permission_level === "DIRECTOR" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-2 text-xs text-accent",
							children: "Giám đốc"
						}) : null]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: [s.phone, s.job_title ? ` · ${s.job_title}` : ""]
					})] }), s.permission_level !== "DIRECTOR" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setPersonActive({ data: {
							userId: s.user_id,
							isActive: !s.is_active
						} }).then(load),
						className: `rounded-full px-2 py-1 text-xs ${s.is_active ? "bg-ok/20 text-ok" : "bg-danger/20 text-danger"}`,
						children: s.is_active ? "Active" : "Inactive"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rounded-full bg-ok/20 px-2 py-1 text-xs text-ok",
						children: "Active"
					})]
				}, s.user_id))
			})
		]
	});
}
//#endregion
export { PeopleAdmin as t };
