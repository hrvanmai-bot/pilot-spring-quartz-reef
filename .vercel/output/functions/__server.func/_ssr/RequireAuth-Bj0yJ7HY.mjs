import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime, d as useRouterState, v as Link, y as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as signOut } from "./client-B40BzJxt.mjs";
import { a as hasGateSessionMarker } from "./server-BD3SgFGz.mjs";
import { n as useCurrentUserState, t as useCurrentUser } from "./use-current-user-DG6UNzh9.mjs";
import { d as getMyProfile, n as cn } from "./utils-2XdzZjEt.mjs";
import { c as House, i as Settings, l as ClipboardList, m as Bell, n as UserRound, o as NotebookPen, p as Building2, s as LogOut, t as Users } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/RequireAuth-Bj0yJ7HY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var subscribeToNothing = () => () => {};
var noGateSessionOnServer = () => false;
/**
* Auth state components — plain wrappers around `useCurrentUserState()`.
*
* With auth on, visitors are signed out until they authenticate — in the sandbox
* live preview too, which does real sign-in. The shared dev user appears only
* when auth is disabled (`VITE_AUTH_ENABLED=false`, the shipped default).
* While the session is still resolving, gates that care about signed-out state
* render nothing so there's no signed-out flash on hard reload.
*/
/** Where `RedirectToSignIn` sends signed-out visitors. Create this route. */
var SIGN_IN_PATH = "/login";
/**
* Client-side redirect to the sign-in route (TanStack `<Navigate>` — NOT a full
* `window.location` reload). A hard navigation re-bootstraps the SPA and re-runs
* session loading, which feels like a second "Loading…" on /login.
*
* Guard routes by waiting out `isPending` first (see `use-current-user`), then
* render this.
*/
function RedirectToSignIn({ to = SIGN_IN_PATH }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to });
}
/**
* Minimal signed-in identity chip + sign-out. Restyle freely (see the
* `design-ui` skill). Sign-out is only shown when auth is enabled (the
* disabled-auth dev user has nothing to sign out of) and the session is not
* gate-materialized — behind the gate the next request signs the viewer
* straight back in, so a sign-out control there is a broken loop.
*/
function UserButton() {
	const user = useCurrentUser();
	const [signingOut, setSigningOut] = (0, import_react.useState)(false);
	const gateSession = (0, import_react.useSyncExternalStore)(subscribeToNothing, hasGateSessionMarker, noGateSessionOnServer);
	if (!user) return null;
	const label = user.displayName ?? user.primaryEmail ?? "Account";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [
			user.profileImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: user.profileImageUrl,
				alt: "",
				className: "h-8 w-8 rounded-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid h-8 w-8 place-items-center rounded-full bg-black/10 text-sm font-medium dark:bg-white/20",
				children: label.charAt(0).toUpperCase()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium",
				children: label
			}),
			!gateSession && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: signingOut,
				onClick: () => {
					setSigningOut(true);
					signOut().catch(() => setSigningOut(false));
				},
				className: "cursor-pointer text-sm underline-offset-4 opacity-70 hover:underline disabled:cursor-wait disabled:no-underline",
				children: signingOut ? "Signing out…" : "Sign out"
			})
		]
	});
}
function AppShell({ children }) {
	const { user, isPending } = useCurrentUserState();
	const [profile, setProfile] = (0, import_react.useState)(null);
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	(0, import_react.useEffect)(() => {
		if (!user) return;
		getMyProfile().then((r) => setProfile(r.profile)).catch(() => setProfile(null));
	}, [user?.id]);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-screen place-items-center bg-bg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-10 w-40 animate-pulse rounded-lg bg-surface" })
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
	const director = profile?.permission_level === "DIRECTOR";
	const staff = profile?.account_type === "STAFF";
	const customer = profile?.account_type === "CUSTOMER";
	const side = [
		{
			href: "/dashboard",
			label: "Dashboard",
			icon: House
		},
		{
			href: "/projects",
			label: "Công trình",
			icon: Building2
		},
		{
			href: "/journals",
			label: "Nhật ký",
			icon: NotebookPen
		},
		{
			href: "/notifications",
			label: "Thông báo",
			icon: Bell
		},
		...director ? [
			{
				href: "/admin/staff",
				label: "Nhân sự",
				icon: Users
			},
			{
				href: "/admin/customers",
				label: "Khách hàng",
				icon: UserRound
			},
			{
				href: "/admin/audit",
				label: "Nhật ký hệ thống",
				icon: ClipboardList
			}
		] : []
	];
	const bottom = director ? [
		{
			href: "/dashboard",
			label: "Dashboard",
			icon: House
		},
		{
			href: "/projects",
			label: "Công trình",
			icon: Building2
		},
		{
			href: "/journals",
			label: "Hoạt động",
			icon: NotebookPen
		},
		{
			href: "/notifications",
			label: "Thông báo",
			icon: Bell
		},
		{
			href: "/admin/staff",
			label: "Cài đặt",
			icon: Settings
		}
	] : staff ? [
		{
			href: "/dashboard",
			label: "Trang chủ",
			icon: House
		},
		{
			href: "/projects",
			label: "Công trình",
			icon: Building2
		},
		{
			href: "/update",
			label: "Cập nhật",
			icon: NotebookPen
		},
		{
			href: "/notifications",
			label: "Thông báo",
			icon: Bell
		},
		{
			href: "/account",
			label: "Tài khoản",
			icon: UserRound
		}
	] : [
		{
			href: "/dashboard",
			label: "Trang chủ",
			icon: House
		},
		{
			href: "/projects",
			label: "Công trình",
			icon: Building2
		},
		{
			href: "/journals",
			label: "Hình ảnh",
			icon: NotebookPen
		},
		{
			href: "/notifications",
			label: "Thông báo",
			icon: Bell
		},
		{
			href: "/account",
			label: "Tài khoản",
			icon: UserRound
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-bg lg:flex",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border-b border-border px-5 py-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-2xl font-semibold tracking-wide",
							children: "HUY HOÀNG"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-0.5 text-[10px] tracking-[0.22em] text-accent",
							children: "BUILD"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "flex-1 space-y-1 overflow-y-auto px-3 py-4",
						children: side.map((l) => {
							const active = pathname === l.href || l.href !== "/dashboard" && pathname.startsWith(l.href);
							const Icon = l.icon;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: l.href,
								className: cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors", active ? "bg-accent/15 font-medium text-accent" : "text-muted hover:bg-surface hover:text-fg"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), l.label]
							}, l.href);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border-t border-border px-4 py-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-sm font-medium",
								children: profile?.full_name ?? user.displayName
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted",
								children: director ? "Giám đốc" : staff ? "Nhân sự" : customer ? "Khách hàng" : "Tài khoản"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex items-center gap-2 text-muted",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-3.5" })]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex min-w-0 flex-1 flex-col",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "flex-1 pb-20 lg:pb-8",
					children
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg/95 backdrop-blur lg:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex h-16 items-stretch",
					children: bottom.map((l) => {
						const active = pathname === l.href || l.href !== "/dashboard" && pathname.startsWith(l.href);
						const Icon = l.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: l.href,
							className: cn("flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium", active ? "text-accent" : "text-muted"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" }), l.label]
						}, l.href);
					})
				})
			})
		]
	});
}
function RequireAuth({ children }) {
	const { user, isPending } = useCurrentUserState();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-screen place-items-center bg-bg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-24 w-64 animate-pulse rounded-xl bg-surface" })
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, { to: "/login" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children });
}
//#endregion
export { UserButton as n, RequireAuth as t };
