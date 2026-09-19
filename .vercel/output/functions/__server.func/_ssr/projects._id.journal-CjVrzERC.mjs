import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime, b as useNavigate, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { f as getProjectDetail, i as createJournal, r as compressImage } from "./utils-2XdzZjEt.mjs";
import { t as RequireAuth } from "./RequireAuth-Bj0yJ7HY.mjs";
import { n as JOURNAL_CATEGORY_LABEL } from "./types-KMXsLaO5.mjs";
import { n as Route } from "./router-CAo-wAJD.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/projects._id.journal-CjVrzERC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var CATS = Object.keys(JOURNAL_CATEGORY_LABEL);
function Page() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Form, {}) });
}
function Form() {
	const { id } = Route.useParams();
	const pid = Number(id);
	const nav = useNavigate();
	const [name, setName] = (0, import_react.useState)("");
	const [status, setStatus] = (0, import_react.useState)("ACTIVE");
	const [category, setCategory] = (0, import_react.useState)("XAY_DUNG");
	const [content, setContent] = (0, import_react.useState)("");
	const [previews, setPreviews] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		getProjectDetail({ data: { id: pid } }).then((d) => {
			setName(d.project.name);
			setStatus(d.project.status);
		}).catch(() => {});
	}, [pid]);
	const disabled = status !== "ACTIVE";
	const onFiles = async (files) => {
		if (!files) return;
		const next = [...previews];
		for (const f of Array.from(files).slice(0, 8 - next.length)) try {
			next.push(await compressImage(f));
		} catch {
			setError("Không thể tải ảnh lên. Vui lòng thử lại.");
		}
		setPreviews(next);
	};
	const submit = async (e) => {
		e.preventDefault();
		if (!content.trim()) {
			setError("Vui lòng nhập nội dung nhật ký");
			return;
		}
		setError(null);
		setLoading(true);
		try {
			await createJournal({ data: {
				projectId: pid,
				category,
				content: content.trim(),
				images: previews
			} });
			nav({
				to: "/projects/$id",
				params: { id }
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : "Không lưu được nhật ký");
		} finally {
			setLoading(false);
		}
	};
	if (disabled) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-lg px-4 py-16 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-muted",
			children: "Công trình đã hoàn thiện, không thể ghi nhật ký mới."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/projects/$id",
			params: { id },
			className: "mt-4 inline-block text-accent",
			children: "← Quay lại"
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-lg px-4 py-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/projects/$id",
				params: { id },
				className: "text-sm text-muted hover:text-accent",
				children: "← Quay lại"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-display text-2xl",
				children: "Ghi nhật ký"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: submit,
				className: "mt-6 space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-2 text-sm text-muted",
						children: "Nhóm công việc"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: CATS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setCategory(c),
							className: `rounded-full px-3 py-1.5 text-sm ${category === c ? "bg-accent font-medium text-accent-fg" : "border border-border text-muted"}`,
							children: JOURNAL_CATEGORY_LABEL[c]
						}, c))
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mb-1.5 block text-sm text-muted",
							children: "Nội dung"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							required: true,
							rows: 6,
							value: content,
							onChange: (e) => setContent(e.target.value),
							placeholder: "Hôm nay đã hoàn thành tô tường tầng 1...",
							className: "w-full rounded-lg border border-border bg-surface px-4 py-3 outline-none focus:border-accent"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mb-1.5 block text-sm text-muted",
								children: "Hình ảnh"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "file",
								accept: "image/*",
								multiple: true,
								onChange: (e) => onFiles(e.target.files),
								className: "text-sm text-muted"
							}),
							previews.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 grid grid-cols-3 gap-2",
								children: previews.map((src, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src,
									alt: "",
									className: "aspect-square rounded-md object-cover"
								}, i))
							}) : null
						]
					}),
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-danger",
						children: error
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						disabled: loading,
						className: "h-14 w-full rounded-xl bg-accent text-lg font-bold text-accent-fg disabled:opacity-50",
						children: loading ? "Đang lưu..." : "Lưu nhật ký"
					})
				]
			})
		]
	});
}
//#endregion
export { Page as component };
