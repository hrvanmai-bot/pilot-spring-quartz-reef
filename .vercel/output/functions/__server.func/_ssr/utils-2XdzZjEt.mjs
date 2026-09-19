import { a as getServerFnById, i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { A as boolean, D as _enum, F as object, P as number, R as string, k as array } from "../_libs/@better-auth/core+[...].mjs";
import { t as authMiddleware } from "./middleware-DzilJ0ce.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/utils-2XdzZjEt.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var getBootstrap = createServerFn({ method: "GET" }).handler(createSsrRpc("b426bb599eb98133fab301a09486e4c8728a9687cee02b592bffd83867e0b77e"));
var getMyProfile = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("6cbed7828d5a18b006fe35df8af8c77fe7bee1db46ba801717a540c03ef0a7d9"));
var bootstrapDirector = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	fullName: string().min(2),
	phone: string().min(8)
})).handler(createSsrRpc("beb6fbd1559faf946695545a8dee8be9913cd25942cb5e2a19f55d28651acea4"));
var getDashboard = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("7e61fac29aed80823dd1759dcff27cc5166a8d0e9b77c74cf358389dba33fe9d"));
var listProjects = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("7a1278c3e8401a4236b8b505ffeefcc5e15807057fecfb3780a6ca04f0572152"));
var getProjectDetail = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator(object({ id: number() })).handler(createSsrRpc("481f95ed2a6b1c7f904cc0ebf020d55fc5c5e82181d217b64df5e7590508fe53"));
var listCustomersLite = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("fe6a02310630a432692306abd615648828b436c991f1c9fe1b1644db5b2e0aa0"));
var createProject = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	name: string().min(2),
	customerId: number(),
	address: string().min(2),
	projectType: string().optional(),
	startDate: string().optional(),
	expectedEndDate: string().optional(),
	description: string().optional(),
	items: array(string()).optional()
})).handler(createSsrRpc("9035a7332515fce5828fdcc500c8857bcef8a5918fb363e0cef18ed134b6a395"));
var updateProgress = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	projectId: number(),
	progress: number().min(0).max(100),
	note: string().optional()
})).handler(createSsrRpc("0001d1de8ed3b48de5ee98ea9c914804a55767b7692247d997322b9f00312eca"));
var setProjectStatus = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	projectId: number(),
	status: _enum(["ACTIVE", "COMPLETED"])
})).handler(createSsrRpc("bc76927b73c0b267f6fa20fa9f3b36a2803cc81b5b12c2734e359f95a496f6e9"));
var updateItemStatus = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	itemId: number(),
	status: _enum([
		"NOT_STARTED",
		"IN_PROGRESS",
		"COMPLETED"
	])
})).handler(createSsrRpc("a1c1e1aab24d35e432705c384d0059edf25b82aa89010c3ecacf3d61b964a30e"));
var createJournal = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	projectId: number(),
	category: _enum([
		"XAY_DUNG",
		"DIEN",
		"NUOC",
		"SON",
		"NOI_THAT",
		"KHAC"
	]),
	content: string().min(3),
	images: array(string()).max(8)
})).handler(createSsrRpc("85ae6d85a595aef3753fcee84a6b5cdeb2f916a7a6f131faa3d27342760fd787"));
var listJournals = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("db9e56b0bb3801d2926887956d1bdb9a293be4dbd52794a50038e3168565ece4"));
var listPeople = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator(object({ kind: _enum(["STAFF", "CUSTOMER"]) })).handler(createSsrRpc("216222a0b01c804b51aa2b56e44f1dc1b37bc0b37fa2240a55d4489f39720242"));
var createPerson = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	kind: _enum(["STAFF", "CUSTOMER"]),
	fullName: string().min(2),
	phone: string().min(8),
	password: string().min(6),
	jobTitle: string().optional()
})).handler(createSsrRpc("24c1dba83201d09faac94ea6177b220c1f5a03d23649b68a25d81a9143d30d5b"));
var setPersonActive = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	userId: string(),
	isActive: boolean()
})).handler(createSsrRpc("f947f902fd4e742494365f2665a70226c6d8c8a0b6a7025b7234a447a6646594"));
var listNotifications = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("4ef62b92f76d7405fda9a37979f67598fda4a4c39ba3b267405a587e3a840865"));
var markNotificationsRead = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("53e11c0f835ed540b1003f18317c14d66ee6a563df6c303c41aa8ebd4addc509"));
var listAudit = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("fac677731fa652de6da36faa3d58453e0a36bd31b4c8a17d14a752c4cbc63c64"));
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function formatDate(date) {
	if (!date) return "—";
	const d = typeof date === "string" ? new Date(date) : date;
	if (Number.isNaN(d.getTime())) return "—";
	return d.toLocaleDateString("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric"
	});
}
function formatDateTime(date) {
	if (!date) return "—";
	const d = typeof date === "string" ? new Date(date) : date;
	if (Number.isNaN(d.getTime())) return "—";
	return d.toLocaleString("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit"
	});
}
function todayLong() {
	return (/* @__PURE__ */ new Date()).toLocaleDateString("vi-VN", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric"
	});
}
function phoneToEmail(phone) {
	return `${phone.replace(/\s+/g, "")}@huyhoang.build`;
}
function compressImage(file, maxW = 1600, quality = .78) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		const url = URL.createObjectURL(file);
		img.onload = () => {
			const scale = Math.min(1, maxW / img.width);
			const w = Math.round(img.width * scale);
			const h = Math.round(img.height * scale);
			const canvas = document.createElement("canvas");
			canvas.width = w;
			canvas.height = h;
			const ctx = canvas.getContext("2d");
			if (!ctx) {
				URL.revokeObjectURL(url);
				reject(/* @__PURE__ */ new Error("Canvas"));
				return;
			}
			ctx.drawImage(img, 0, 0, w, h);
			const data = canvas.toDataURL("image/jpeg", quality);
			URL.revokeObjectURL(url);
			resolve(data);
		};
		img.onerror = () => {
			URL.revokeObjectURL(url);
			reject(/* @__PURE__ */ new Error("Không đọc được ảnh"));
		};
		img.src = url;
	});
}
//#endregion
export { todayLong as C, setProjectStatus as S, updateProgress as T, listPeople as _, createPerson as a, phoneToEmail as b, formatDateTime as c, getMyProfile as d, getProjectDetail as f, listNotifications as g, listJournals as h, createJournal as i, getBootstrap as l, listCustomersLite as m, cn as n, createProject as o, listAudit as p, compressImage as r, formatDate as s, bootstrapDirector as t, getDashboard as u, listProjects as v, updateItemStatus as w, setPersonActive as x, markNotificationsRead as y };
