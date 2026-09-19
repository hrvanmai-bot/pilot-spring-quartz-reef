import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime, b as useNavigate, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { m as listCustomersLite, o as createProject } from "./utils-2XdzZjEt.mjs";
import { t as RequireAuth } from "./RequireAuth-Bj0yJ7HY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.projects.new-Dy1gF-zE.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Form, {}) });
}
function Form() {
	const nav = useNavigate();
	const [customers, setCustomers] = (0, import_react.useState)([]);
	const [name, setName] = (0, import_react.useState)("");
	const [customerId, setCustomerId] = (0, import_react.useState)("");
	const [address, setAddress] = (0, import_react.useState)("");
	const [projectType, setProjectType] = (0, import_react.useState)("");
	const [startDate, setStartDate] = (0, import_react.useState)("");
	const [expectedEndDate, setExpectedEndDate] = (0, import_react.useState)("");
	const [description, setDescription] = (0, import_react.useState)("");
	const [items, setItems] = (0, import_react.useState)("Móng\nKết cấu\nXây tô\nĐiện nước âm\nChống thấm\nSơn nước");
	const [err, setErr] = (0, import_react.useState)(null);
	const [saving, setSaving] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		listCustomersLite().then(setCustomers).catch(() => {});
	}, []);
	const submit = async (e) => {
		e.preventDefault();
		setErr(null);
		setSaving(true);
		try {
			const res = await createProject({ data: {
				name,
				customerId: Number(customerId),
				address,
				projectType: projectType || void 0,
				startDate: startDate || void 0,
				expectedEndDate: expectedEndDate || void 0,
				description: description || void 0,
				items: items.split("\n").map((s) => s.trim()).filter(Boolean)
			} });
			nav({
				to: "/projects/$id",
				params: { id: String(res.id) }
			});
		} catch (e) {
			setErr(e instanceof Error ? e.message : "Không tạo được công trình");
		}
		setSaving(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-xl px-4 py-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/projects",
				className: "text-sm text-muted hover:text-accent",
				children: "← Quay lại"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-display text-3xl",
				children: "Tạo công trình"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: submit,
				className: "mt-6 space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						required: true,
						value: name,
						onChange: (e) => setName(e.target.value),
						placeholder: "Tên công trình",
						className: "h-12 w-full rounded-lg border border-border bg-surface px-4"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						required: true,
						value: customerId,
						onChange: (e) => setCustomerId(e.target.value),
						className: "h-12 w-full rounded-lg border border-border bg-surface px-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "— Chọn khách hàng —"
						}), customers.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
							value: c.id,
							children: [
								c.name,
								" (",
								c.phone,
								")"
							]
						}, c.id))]
					}),
					customers.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-accent",
						children: "Hãy tạo khách hàng trước."
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						required: true,
						value: address,
						onChange: (e) => setAddress(e.target.value),
						placeholder: "Địa chỉ",
						className: "h-12 w-full rounded-lg border border-border bg-surface px-4"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: projectType,
						onChange: (e) => setProjectType(e.target.value),
						placeholder: "Loại (Nhà phố, Căn hộ...)",
						className: "h-12 w-full rounded-lg border border-border bg-surface px-4"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "text-xs text-muted",
							children: ["Khởi công", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "date",
								value: startDate,
								onChange: (e) => setStartDate(e.target.value),
								className: "mt-1 h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "text-xs text-muted",
							children: ["Dự kiến xong", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "date",
								value: expectedEndDate,
								onChange: (e) => setExpectedEndDate(e.target.value),
								className: "mt-1 h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						value: description,
						onChange: (e) => setDescription(e.target.value),
						rows: 3,
						placeholder: "Mô tả",
						className: "w-full rounded-lg border border-border bg-surface px-4 py-3"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						value: items,
						onChange: (e) => setItems(e.target.value),
						rows: 6,
						className: "w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm"
					}),
					err ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-danger",
						children: err
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						disabled: saving,
						className: "h-12 w-full rounded-xl bg-accent font-semibold text-accent-fg disabled:opacity-50",
						children: saving ? "Đang tạo..." : "Tạo công trình"
					})
				]
			})
		]
	});
}
//#endregion
export { Page as component };
