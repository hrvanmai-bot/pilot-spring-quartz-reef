import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as todayLong, s as formatDate, u as getDashboard } from "./utils-2XdzZjEt.mjs";
import { f as Camera } from "../_libs/lucide-react.mjs";
import { t as RequireAuth } from "./RequireAuth-Bj0yJ7HY.mjs";
import { t as EmptyState } from "./EmptyState-BYuyn6TC.mjs";
import { t as ProgressBar } from "./ProgressBar-BvLxpdyV.mjs";
import { t as StatusBadge } from "./StatusBadge-DtmK26Lj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-DowD_-Yz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dashboard, {}) });
}
function Dashboard() {
	const [data, setData] = (0, import_react.useState)(null);
	const [err, setErr] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		getDashboard().then(setData).catch((e) => setErr(e instanceof Error ? e.message : "Không thể tải dữ liệu."));
	}, []);
	if (err) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fail, { msg: err });
	if (!data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skel, {});
	const p = data.profile;
	const director = p.permission_level === "DIRECTOR";
	const staff = p.account_type === "STAFF" && !director;
	const customer = p.account_type === "CUSTOMER";
	const first = p.full_name.split(" ").slice(-1)[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-5xl px-4 py-6 md:px-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
				className: "font-display text-3xl",
				children: ["Xin chào, ", first]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 capitalize text-muted",
				children: todayLong()
			}),
			director && data.stats ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 grid grid-cols-2 gap-3 md:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							title: "Đang thi công",
							value: data.stats.active
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							title: "Đã hoàn thiện",
							value: data.stats.completed
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							title: "Khách hàng",
							value: data.stats.customers
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							title: "Nhân sự",
							value: data.stats.staff
						})
					]
				}),
				data.stats.stale.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-3 text-lg font-semibold",
						children: "Cần chú ý"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-2",
						children: data.stats.stale.filter((s) => s.days >= 3).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/projects/$id",
							params: { id: String(s.id) },
							className: "block rounded-xl border border-border bg-surface px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium",
								children: s.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-muted",
								children: [s.days, " ngày chưa có nhật ký"]
							})]
						}, s.id))
					})]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(JournalList, { items: data.journals })
			] }) : null,
			staff ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 grid grid-cols-2 gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						title: "Đang thi công",
						value: data.stats?.active ?? 0
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						title: "Đã hoàn thiện",
						value: data.stats?.completed ?? 0
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/update",
					className: "mt-6 flex h-14 items-center justify-center gap-2 rounded-xl bg-accent text-lg font-bold text-accent-fg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "size-5" }), " Cập nhật công trình"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(JournalList, { items: data.journals })
			] }) : null,
			customer ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-4 text-lg font-semibold",
					children: "Công trình của bạn"
				}), data.projects.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					title: "Chưa có công trình",
					sub: "Những công trình được tạo bởi Giám đốc sẽ xuất hiện tại đây."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-3",
					children: data.projects.map((pr) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectCard, {
						p: pr,
						latest: data.latest[pr.id]
					}, pr.id))
				})]
			}) : null
		]
	});
}
function JournalList({ items }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mb-3 text-lg font-semibold",
			children: "Nhật ký mới nhất"
		}), items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { title: "Chưa có nhật ký" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-3",
			children: items.map((j) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/projects/$id",
				params: { id: String(j.project_id) },
				className: "block rounded-xl border border-border bg-surface p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium text-accent",
						children: j.project_name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 line-clamp-2 text-sm text-muted",
						children: j.content
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-xs text-subtle",
						children: [
							j.author_name,
							" · ",
							formatDate(j.created_at)
						]
					})
				]
			}, j.id))
		})]
	});
}
function ProjectCard({ p, latest }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/projects/$id",
		params: { id: String(p.id) },
		className: "block rounded-xl border border-border bg-surface p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-semibold",
					children: p.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted",
					children: p.code
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: p.status })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressBar, { value: p.progress })
			}),
			latest ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 line-clamp-2 text-sm text-muted",
				children: latest
			}) : null
		]
	});
}
function Stat({ title, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-border bg-surface p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 font-display text-3xl text-accent tabular-nums",
			children: value
		})]
	});
}
function Skel() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-5xl space-y-4 px-4 py-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-48 animate-pulse rounded-md bg-surface" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-2 gap-3 md:grid-cols-4",
			children: [
				1,
				2,
				3,
				4
			].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-24 animate-pulse rounded-xl bg-surface" }, i))
		})]
	});
}
function Fail({ msg }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-lg px-4 py-16 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-muted",
			children: msg
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => location.reload(),
			className: "mt-4 rounded-lg bg-accent px-5 py-2.5 font-semibold text-accent-fg",
			children: "Thử lại"
		})]
	});
}
//#endregion
export { Page as component };
