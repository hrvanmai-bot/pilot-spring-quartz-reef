import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime, b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as signIn, t as authClient } from "./client-B40BzJxt.mjs";
import { t as GROK_PROVIDERS } from "./server-BD3SgFGz.mjs";
import { n as useCurrentUserState } from "./use-current-user-DG6UNzh9.mjs";
import { b as phoneToEmail, d as getMyProfile, l as getBootstrap, t as bootstrapDirector } from "./utils-2XdzZjEt.mjs";
import { d as ChevronLeft, n as UserRound, p as Building2 } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-BvuOo_Dc.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Login() {
	const { user, isPending } = useCurrentUserState();
	const nav = useNavigate();
	const [mode, setMode] = (0, import_react.useState)(null);
	const [hasDirector, setHasDirector] = (0, import_react.useState)(true);
	const [fullName, setFullName] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [setup, setSetup] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		getBootstrap().then((r) => {
			setHasDirector(r.hasDirector);
			if (!r.hasDirector) setSetup(true);
		}).catch(() => {});
	}, []);
	(0, import_react.useEffect)(() => {
		if (isPending || !user) return;
		getMyProfile().then((r) => {
			if (r.profile) nav({ to: "/dashboard" });
		}).catch(() => {});
	}, [
		user,
		isPending,
		nav
	]);
	const submit = async (e) => {
		e.preventDefault();
		setError(null);
		setLoading(true);
		const email = phoneToEmail(phone);
		try {
			if (setup && !hasDirector) {
				const { error: su } = await authClient.signUp.email({
					email,
					password,
					name: fullName
				});
				if (su) throw new Error(su.message ?? "Không tạo được tài khoản");
				await bootstrapDirector({ data: {
					fullName,
					phone
				} });
				nav({ to: "/dashboard" });
				return;
			}
			const { error: si } = await authClient.signIn.email({
				email,
				password
			});
			if (si) throw new Error("Số điện thoại hoặc mật khẩu không đúng.");
			const me = await getMyProfile();
			if (!me.profile) throw new Error("Tài khoản chưa được kích hoạt. Liên hệ Giám đốc.");
			if (mode === "STAFF" && me.profile.account_type !== "STAFF") throw new Error("Tài khoản này không phải Nhân sự công ty.");
			if (mode === "CUSTOMER" && me.profile.account_type !== "CUSTOMER") throw new Error("Tài khoản này không phải Khách hàng.");
			if (!me.profile.is_active) throw new Error("Tài khoản đã bị khóa.");
			nav({ to: "/dashboard" });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
		} finally {
			setLoading(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen flex-col bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "px-6 pb-4 pt-12 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-4xl font-semibold tracking-wide",
						children: "HUY HOÀNG"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs tracking-[0.28em] text-accent",
						children: "XÂY DỰNG · ĐẦU TƯ · THƯƠNG MẠI"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-6 text-lg font-medium text-muted",
						children: "Hệ thống quản lý công trình"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "flex flex-1 items-center justify-center px-4 pb-12",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "w-full max-w-md",
					children: setup && !hasDirector ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-border bg-surface p-6 md:p-8",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-2xl",
								children: "Khởi tạo Giám đốc"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted",
								children: "Tài khoản đầu tiên sẽ có quyền quản trị toàn hệ thống."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								onSubmit: submit,
								className: "mt-6 space-y-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Họ và tên",
										value: fullName,
										onChange: setFullName,
										placeholder: "Từ Huy Tú"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Số điện thoại",
										value: phone,
										onChange: setPhone,
										placeholder: "0944437238"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Mật khẩu",
										value: password,
										onChange: setPassword,
										type: "password"
									}),
									error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-danger",
										children: error
									}) : null,
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "submit",
										disabled: loading,
										className: "mt-2 h-12 w-full rounded-lg bg-accent font-semibold text-accent-fg disabled:opacity-60",
										children: loading ? "Đang tạo..." : "Tạo tài khoản Giám đốc"
									})
								]
							})
						]
					}) : !mode ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
								icon: Building2,
								title: "Nhân sự công ty",
								sub: "Đăng nhập hệ thống",
								onClick: () => setMode("STAFF")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
								icon: UserRound,
								title: "Khách hàng",
								sub: "Theo dõi công trình",
								onClick: () => setMode("CUSTOMER")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "pt-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mb-2 text-center text-xs text-subtle",
									children: "Hoặc đăng nhập nhanh"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "space-y-2",
									children: GROK_PROVIDERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => signIn(p.providerId, { callbackURL: "/dashboard" }),
										className: "h-11 w-full rounded-lg border border-border text-sm text-muted hover:border-accent/40 hover:text-fg",
										children: ["Tiếp tục với ", p.label]
									}, p.providerId))
								})]
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-border bg-surface p-6 md:p-8",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-6 flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-semibold",
								children: mode === "STAFF" ? "Nhân sự công ty" : "Khách hàng"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted",
								children: "Đăng nhập bằng số điện thoại"
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setMode(null),
								className: "flex items-center gap-1 text-sm text-muted",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-4" }), " Quay lại"]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							onSubmit: submit,
							className: "space-y-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Họ và tên",
									value: fullName,
									onChange: setFullName,
									placeholder: "Nguyễn Văn A"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Số điện thoại",
									value: phone,
									onChange: setPhone,
									placeholder: "0901234567"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Mật khẩu",
									value: password,
									onChange: setPassword,
									type: "password"
								}),
								error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-danger",
									children: error
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "submit",
									disabled: loading,
									className: "mt-2 h-12 w-full rounded-lg bg-accent font-semibold text-accent-fg disabled:opacity-60",
									children: loading ? "Đang đăng nhập..." : "Đăng nhập"
								})
							]
						})]
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "pb-8 text-center text-xs text-subtle",
				children: "HUY HOÀNG BUILD — Quản lý công trình thông minh"
			})
		]
	});
}
function Field({ label, value, onChange, type = "text", placeholder }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mb-1.5 block text-sm text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			type,
			value,
			required: true,
			placeholder,
			onChange: (e) => onChange(e.target.value),
			className: "h-12 w-full rounded-lg border border-border bg-bg px-4 text-fg outline-none placeholder:text-subtle focus:border-accent"
		})]
	});
}
function Choice({ icon: Icon, title, sub, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: "flex w-full items-center gap-4 rounded-xl border border-border bg-surface p-5 text-left transition-colors hover:border-accent/50",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "grid size-12 place-items-center rounded-lg bg-accent/15 text-accent",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-6" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "block text-lg font-semibold",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-sm text-muted",
			children: sub
		})] })]
	});
}
//#endregion
export { Login as component };
