import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Building2, ChevronLeft, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { authClient, authEnabled, GROK_PROVIDERS, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getMyProfile } from "@/lib/hhb/actions";
import { ensureDefaultDirector } from "@/lib/hhb/bootstrap-director";
import { phoneToEmail } from "@/lib/utils";

export const Route = createFileRoute("/login")({ component: Login });

type Mode = "STAFF" | "CUSTOMER" | null;

const DIRECTOR_PHONE = "0944437238";
const DIRECTOR_PASSWORD = "04022022";

/** Login corporate 2 cột — logo HUY HOÀNG (force rebuild Vercel 2026-09-22) */
function Login() {
  const { user, isPending } = useCurrentUserState();
  const nav = useNavigate();
  const [mode, setMode] = useState<Mode>(null);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    ensureDefaultDirector()
      .then(() => setReady(true))
      .catch(() => setReady(true));
  }, []);

  useEffect(() => {
    if (isPending || !user) return;
    getMyProfile()
      .then((r) => {
        if (r.profile) nav({ to: "/dashboard" });
      })
      .catch(() => {});
  }, [user, isPending, nav]);

  const pickStaff = () => {
    setMode("STAFF");
    setPhone(DIRECTOR_PHONE);
    setPassword(DIRECTOR_PASSWORD);
    setError(null);
  };

  const pickCustomer = () => {
    setMode("CUSTOMER");
    setPhone("");
    setPassword("");
    setError(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: si } = await authClient.signIn.email({ email: phoneToEmail(phone), password });
      if (si) throw new Error(si.message ?? "Số điện thoại hoặc mật khẩu không đúng.");
      const me = await getMyProfile();
      if (!me.profile) throw new Error("Tài khoản chưa được kích hoạt. Liên hệ Giám đốc.");
      if (mode === "STAFF" && me.profile.account_type !== "STAFF") {
        throw new Error("Tài khoản này không phải Nhân sự công ty.");
      }
      if (mode === "CUSTOMER" && me.profile.account_type !== "CUSTOMER") {
        throw new Error("Tài khoản này không phải Khách hàng.");
      }
      if (!me.profile.is_active) throw new Error("Tài khoản đã bị khóa.");
      nav({ to: "/dashboard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg px-4 py-8 text-fg md:py-12">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(900px 480px at 12% 0%, color-mix(in srgb, var(--color-accent) 16%, transparent), transparent 58%), radial-gradient(720px 420px at 92% 100%, color-mix(in srgb, var(--color-brand) 40%, transparent), transparent 55%)",
        }}
      />

      <div className="relative grid w-full max-w-5xl gap-5 lg:grid-cols-[1.08fr_0.92fr]">
        <aside className="relative overflow-hidden rounded-xl border border-border bg-surface p-8 shadow-2xl md:p-10">
          <div className="inline-flex rounded-lg bg-plate p-4">
            <img
              src="/huy-hoang-logo.png"
              alt="Logo HUY HOÀNG"
              className="h-28 w-auto object-contain md:h-36"
            />
          </div>

          <p className="mt-8 text-xs font-semibold tracking-[0.28em] text-accent">HUY HOÀNG GROUP</p>
          <h1 className="mt-3 font-display text-5xl font-semibold uppercase leading-none tracking-wide md:text-6xl">
            Xây dựng
            <span className="mt-1 block text-accent">tương lai.</span>
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-muted">
            Hệ thống quản lý công trình, nhân sự và khách hàng của Công ty TNHH Xây dựng Đầu tư và Thương mại Huy Hoàng.
          </p>
          <p className="mt-6 text-[11px] font-semibold tracking-[0.22em] text-accent">
            XÂY DỰNG · ĐẦU TƯ · THƯƠNG MẠI
          </p>
          <div className="mt-8 h-px w-full bg-border" />
          <p className="mt-5 text-[11px] leading-relaxed text-subtle">
            MST 4101617237 · 34 Chương Dương, P. Quy Nhơn Nam, Gia Lai
            <br />
            Hotline 094.443.7238
          </p>
        </aside>

        <section className="rounded-xl border border-border bg-surface p-7 shadow-2xl md:p-9">
          <header className="mb-8">
            <div className="rounded-md bg-plate px-4 py-3">
              <img
                src="/huy-hoang-wordmark.png"
                alt="HUY HOÀNG"
                className="h-9 w-auto max-w-full object-contain"
              />
            </div>
            <p className="mt-3 text-[10px] font-semibold tracking-[0.28em] text-accent">
              XÂY DỰNG · ĐẦU TƯ · THƯƠNG MẠI
            </p>
            <p className="mt-3 text-sm text-muted">Hệ thống quản lý công trình</p>
          </header>

          {!mode ? (
            <div className="space-y-3">
              <Choice icon={Building2} title="Nhân sự công ty" sub="Đăng nhập hệ thống" onClick={pickStaff} />
              <Choice icon={UserRound} title="Khách hàng" sub="Theo dõi công trình" onClick={pickCustomer} />
              {authEnabled ? (
                <div className="pt-5">
                  <p className="mb-3 text-center text-xs tracking-wide text-subtle">Hoặc đăng nhập nhanh</p>
                  <div className="space-y-2">
                    {GROK_PROVIDERS.map((p) => (
                      <button
                        key={p.providerId}
                        type="button"
                        onClick={() => signIn(p.providerId, { callbackURL: "/dashboard" })}
                        className="h-12 w-full rounded-lg border border-border text-sm text-muted transition-colors hover:border-accent hover:text-fg"
                      >
                        Tiếp tục với {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{mode === "STAFF" ? "Nhân sự công ty" : "Khách hàng"}</h2>
                  <p className="text-xs text-muted">Đăng nhập bằng số điện thoại</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMode(null)}
                  className="flex items-center gap-1 text-sm text-muted hover:text-accent"
                >
                  <ChevronLeft className="size-4" /> Quay lại
                </button>
              </div>
              <form onSubmit={submit} className="space-y-3">
                <Field label="Số điện thoại" value={phone} onChange={setPhone} placeholder="0944437238" />
                <Field label="Mật khẩu" value={password} onChange={setPassword} type="password" />
                {error ? <p className="text-sm text-danger">{error}</p> : null}
                <button
                  type="submit"
                  disabled={loading || !ready}
                  className="mt-2 h-12 w-full rounded-lg bg-accent font-semibold text-accent-fg transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                </button>
              </form>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-muted">{label}</span>
      <input
        type={type}
        value={value}
        required
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full rounded-lg border border-border bg-bg px-4 text-fg outline-none transition-colors placeholder:text-subtle focus:border-accent"
      />
    </label>
  );
}

function Choice({
  icon: Icon,
  title,
  sub,
  onClick,
}: {
  icon: typeof Building2;
  title: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-lg border border-border bg-surface-2/50 p-5 text-left transition-colors hover:border-accent hover:bg-surface-2"
    >
      <span className="grid size-12 place-items-center rounded-md bg-accent/15 text-accent">
        <Icon className="size-6" />
      </span>
      <span>
        <span className="block text-lg font-semibold">{title}</span>
        <span className="text-sm text-muted">{sub}</span>
      </span>
    </button>
  );
}
