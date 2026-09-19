import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { S as setProjectStatus, T as updateProgress, c as formatDateTime, f as getProjectDetail, s as formatDate, w as updateItemStatus } from "./utils-2XdzZjEt.mjs";
import { f as Camera } from "../_libs/lucide-react.mjs";
import { t as RequireAuth } from "./RequireAuth-Bj0yJ7HY.mjs";
import { t as EmptyState } from "./EmptyState-BYuyn6TC.mjs";
import { t as ProgressBar } from "./ProgressBar-BvLxpdyV.mjs";
import { t as StatusBadge } from "./StatusBadge-DtmK26Lj.mjs";
import { n as JOURNAL_CATEGORY_LABEL, t as ITEM_STATUS_LABEL } from "./types-KMXsLaO5.mjs";
import { r as Route$3 } from "./router-CAo-wAJD.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/projects._id-C8qZOy8L.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Detail, {}) });
}
function Detail() {
	const { id } = Route$3.useParams();
	const pid = Number(id);
	const [data, setData] = (0, import_react.useState)(null);
	const [tab, setTab] = (0, import_react.useState)("overview");
	const [progress, setProgress] = (0, import_react.useState)(0);
	const [note, setNote] = (0, import_react.useState)("");
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [msg, setMsg] = (0, import_react.useState)(null);
	const [err, setErr] = (0, import_react.useState)(null);
	const [lightbox, setLightbox] = (0, import_react.useState)(null);
	const load = () => getProjectDetail({ data: { id: pid } }).then((d) => {
		setData(d);
		setProgress(d.project.progress);
	}).catch((e) => setErr(e instanceof Error ? e.message : "Không thể tải dữ liệu."));
	(0, import_react.useEffect)(() => {
		load();
	}, [pid]);
	if (err) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-4 py-16 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-muted",
			children: err
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => location.reload(),
			className: "mt-4 rounded-lg bg-accent px-4 py-2 font-semibold text-accent-fg",
			children: "Thử lại"
		})]
	});
	if (!data) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl space-y-4 px-4 py-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-2/3 animate-pulse rounded bg-surface" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-40 animate-pulse rounded-xl bg-surface" })]
	});
	const { profile, project, items, journals, logs, gallery } = data;
	const director = profile.permission_level === "DIRECTOR";
	const staff = profile.account_type === "STAFF";
	const active = project.status === "ACTIVE";
	const complete = async () => {
		if (!confirm("Chuyển sang Đã hoàn thiện? Tiến độ sẽ = 100%.")) return;
		setSaving(true);
		await setProjectStatus({ data: {
			projectId: pid,
			status: "COMPLETED"
		} });
		await load();
		setSaving(false);
	};
	const reopen = async () => {
		if (!confirm("Mở lại công trình đang thi công?")) return;
		setSaving(true);
		await setProjectStatus({ data: {
			projectId: pid,
			status: "ACTIVE"
		} });
		await load();
		setSaving(false);
	};
	const saveProgress = async () => {
		setSaving(true);
		setMsg(null);
		try {
			await updateProgress({ data: {
				projectId: pid,
				progress,
				note
			} });
			setMsg("Đã cập nhật tiến độ");
			await load();
		} catch (e) {
			setMsg(e instanceof Error ? e.message : "Lỗi");
		}
		setSaving(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl px-4 py-6 md:px-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/projects",
				className: "text-sm text-muted hover:text-accent",
				children: "← Công trình"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-col gap-3 md:flex-row md:items-start md:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl",
					children: project.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm text-muted",
					children: [project.code, project.customer_name ? ` · ${project.customer_name}` : ""]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: project.status })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressBar, { value: project.progress })
			}),
			staff && active ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/projects/$id/journal",
				params: { id: String(pid) },
				className: "mt-5 flex h-14 items-center justify-center gap-2 rounded-xl bg-accent text-lg font-bold text-accent-fg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "size-5" }), " Ghi nhật ký"]
			}) : null,
			director ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex gap-2",
				children: active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					disabled: saving,
					onClick: complete,
					className: "rounded-lg border border-ok/40 bg-ok/15 px-4 py-2 text-sm font-medium text-ok",
					children: "Hoàn thành"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					disabled: saving,
					onClick: reopen,
					className: "rounded-lg border border-accent/40 bg-accent/15 px-4 py-2 text-sm font-medium text-accent",
					children: "Mở lại"
				})
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 flex gap-1 overflow-x-auto border-b border-border",
				children: [
					{
						key: "overview",
						label: "Tổng quan"
					},
					{
						key: "items",
						label: "Hạng mục"
					},
					{
						key: "images",
						label: "Hình ảnh"
					},
					{
						key: "journals",
						label: "Nhật ký"
					},
					{
						key: "info",
						label: "Thông tin"
					}
				].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setTab(t.key),
					className: `whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium ${tab === t.key ? "border-accent text-accent" : "border-transparent text-muted"}`,
					children: t.label
				}, t.key))
			}),
			tab === "overview" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 space-y-6",
				children: [director && active ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-border bg-surface p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mb-3 font-semibold",
							children: "Cập nhật tiến độ"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-3 flex items-center gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "range",
								min: 0,
								max: 100,
								value: progress,
								onChange: (e) => setProgress(Number(e.target.value)),
								className: "flex-1"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "w-12 text-right font-bold tabular-nums text-accent",
								children: [progress, "%"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: note,
							onChange: (e) => setNote(e.target.value),
							placeholder: "Ghi chú (tuỳ chọn)",
							className: "mb-3 h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm outline-none focus:border-accent"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: saving || progress === project.progress,
							onClick: saveProgress,
							className: "rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-fg disabled:opacity-50",
							children: "Lưu tiến độ"
						}),
						msg ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-ok",
							children: msg
						}) : null
					]
				}) : null, logs.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mb-3 font-semibold",
					children: "Lịch sử tiến độ"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-2",
					children: logs.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border border-border bg-surface px-4 py-3 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-accent",
								children: [
									l.old_progress,
									"% → ",
									l.new_progress,
									"%"
								]
							}),
							l.note ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted",
								children: [" · ", l.note]
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-xs text-subtle",
								children: [
									l.changed_by_name,
									" · ",
									formatDateTime(l.created_at)
								]
							})
						]
					}, l.id))
				})] }) : null]
			}),
			tab === "items" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 space-y-2",
				children: items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { title: "Chưa có hạng mục" }) : items.map((it) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: it.name
						}),
						it.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: it.description
						}) : null,
						director && it.internal_cost ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-subtle",
							children: ["Chi phí nội bộ: ", it.internal_cost]
						}) : null
					] }), director ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						value: it.status,
						onChange: async (e) => {
							await updateItemStatus({ data: {
								itemId: it.id,
								status: e.target.value
							} });
							load();
						},
						className: "rounded-md border border-border bg-bg px-2 py-1 text-sm",
						children: Object.keys(ITEM_STATUS_LABEL).map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: k,
							children: ITEM_STATUS_LABEL[k]
						}, k))
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm text-muted",
						children: ITEM_STATUS_LABEL[it.status]
					})]
				}, it.id))
			}),
			tab === "images" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6",
				children: gallery.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { title: "Chưa có hình ảnh" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 gap-3 md:grid-cols-3",
					children: gallery.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setLightbox(g.data_url),
						className: "aspect-square overflow-hidden rounded-lg border border-border bg-surface",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: g.data_url,
							alt: g.caption ?? "Ảnh công trình",
							className: "size-full object-cover"
						})
					}, g.id))
				})
			}),
			tab === "journals" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 space-y-4",
				children: journals.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { title: "Chưa có nhật ký" }) : journals.map((j) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-border bg-surface p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted",
							children: [
								j.author_name,
								" · ",
								JOURNAL_CATEGORY_LABEL[j.category],
								" · ",
								formatDateTime(j.created_at)
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 whitespace-pre-wrap text-sm",
							children: j.content
						}),
						j.images.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 grid grid-cols-3 gap-2",
							children: j.images.map((im) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setLightbox(im.data_url),
								className: "aspect-square overflow-hidden rounded-md",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: im.data_url,
									alt: "",
									className: "size-full object-cover"
								})
							}, im.id))
						}) : null
					]
				}, j.id))
			}),
			tab === "info" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "mt-6 space-y-3 rounded-xl border border-border bg-surface p-5 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Mã công trình",
						value: project.code
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Địa chỉ",
						value: project.address
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Loại",
						value: project.project_type || "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Khách hàng",
						value: project.customer_name || "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Ngày khởi công",
						value: formatDate(project.start_date)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Dự kiến hoàn thành",
						value: formatDate(project.expected_end_date)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Hoàn thành thực tế",
						value: formatDate(project.actual_end_date)
					})
				]
			}),
			lightbox ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "fixed inset-0 z-50 grid place-items-center bg-black/80 p-4",
				onClick: () => setLightbox(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: lightbox,
					alt: "",
					className: "max-h-full max-w-full object-contain"
				})
			}) : null
		]
	});
}
function Row({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex justify-between gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "text-right",
			children: value
		})]
	});
}
//#endregion
export { Page as component };
