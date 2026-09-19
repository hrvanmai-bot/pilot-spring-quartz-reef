import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Building2, ChevronLeft, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { authClient, authEnabled, GROK_PROVIDERS, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { bootstrapDirector, getBootstrap, getMyProfile } from "@/lib/hhb/actions";
import { phoneToEmail } from "@/lib/utils";

export const Route = createFileRoute("/login")({ component: Login });

type Mode = "STAFF" | "CUSTOMER" | null;

function Login() {
  const { user, isPending } = useCurrentUserState();
  const nav = useNavigate();
  const [mode, setMode] = useState<Mode>(null);
  const [hasDirector, setHasDirector] = useState(true);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setup, setSetup] = useState(false);

  useEffect(() => {
    getBootstrap()
      .then((r) => {
        setHasDirector(r.hasDirector);
        if (!r.hasDirector) setSetup(true);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isPending || !user) return;
    getMyProfile()
      .then((r) => {
        if (r.profile) nav({ to: "/dashboard" });
      })
      .catch(() => {});
  }, [user, isPending, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const email = phoneToEmail(phone);
    try {
      if (setup && !hasDirector) {
        const { error: su } = await authClient.signUp.email({
          email,
          password,
          name: fullName,
        });
        if (su) throw new Error(su.message ?? "Không tạo được tài khoản");
        await bootstrapDirector({ data: { fullName, phone } });
        nav({ to: "/dashboard" });
        return;
      }
      const { error: si } = await authClient.signIn.email({ email, password });
      if (si) throw new Error("Số điện thoại hoặc mật khẩu không đúng.");
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
    <div className="flex min-h-screen flex-col bg-bg text-fg">
      <header className="px-6 pb-4 pt-12 text-center">
        <p className="font-display text-4xl font-semibold tracking-wide">HUY HOÀNG</p>
        <p className="mt-2 text-xs tracking-[0.28em] text-accent">XÂY DỰNG · ĐẦU TƯ · THƯƠNG MẠI</p>
        <p className="mt-6 text-lg font-medium text-muted">Hệ thống quản lý công trình</p>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md">
          {setup && !hasDirector ? (
            <div className="rounded-xl border border-border bg-surface p-6 md:p-8">
              <h2 className="font-display text-2xl">Khởi tạo Giám đốc</h2>
              <p className="mt-1 text-sm text-muted">Tài khoản đầu tiên sẽ có quyền quản trị toàn hệ thống.</p>
              <form onSubmit={submit} className="mt-6 space-y-3">
                <Field label="Họ và tên" value={fullName} onChange={setFullName} placeholder="Từ Huy Tú" />
                <Field label="Số điện thoại" value={phone} onChange={setPhone} placeholder="0944437238" />
                <Field label="Mật khẩu" value={password} onChange={setPassword} type="password" />
                {error ? <p className="text-sm text-danger">{error}</p> : null}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 h-12 w-full rounded-lg bg-accent font-semibold text-accent-fg disabled:opacity-60"
                >
                  {loading ? "Đang tạo..." : "Tạo tài khoản Giám đốc"}
                </button>
              </form>
            </div>
          ) : !mode ? (
            <div className="space-y-4">
              <Choice
                icon={Building2}
                title="Nhân sự công ty"
                sub="Đăng nhập hệ thống"
                onClick={() => setMode("STAFF")}
              />
              <Choice
                icon={UserRound}
                title="Khách hàng"
                sub="Theo dõi công trình"
                onClick={() => setMode("CUSTOMER")}
              />
              {authEnabled ? (
                <div className="pt-4">
                  <p className="mb-2 text-center text-xs text-subtle">Hoặc đăng nhập nhanh</p>
                  <div className="space-y-2">
                    {GROK_PROVIDERS.map((p) => (
                      <button
                        key={p.providerId}
                        type="button"
                        onClick={() => signIn(p.providerId, { callbackURL: "/dashboard" })}
                        className="h-11 w-full rounded-lg border border-border text-sm text-muted hover:border-accent/40 hover:text-fg"
                      >
                        Tiếp tục với {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-surface p-6 md:p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">
                    {mode === "STAFF" ? "Nhân sự công ty" : "Khách hàng"}
                  </h2>
                  <p className="text-xs text-muted">Đăng nhập bằng số điện thoại</p>
                </div>
                <button type="button" onClick={() => setMode(null)} className="flex items-center gap-1 text-sm text-muted">
                  <ChevronLeft className="size-4" /> Quay lại
                </button>
              </div>
              <form onSubmit={submit} className="space-y-3">
                <Field label="Họ và tên" value={fullName} onChange={setFullName} placeholder="Nguyễn Văn A" />
                <Field label="Số điện thoại" value={phone} onChange={setPhone} placeholder="0901234567" />
                <Field label="Mật khẩu" value={password} onChange={setPassword} type="password" />
                {error ? <p className="text-sm text-danger">{error}</p> : null}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 h-12 w-full rounded-lg bg-accent font-semibold text-accent-fg disabled:opacity-60"
                >
                  {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
      <footer className="pb-8 text-center text-xs text-subtle">HUY HOÀNG BUILD — Quản lý công trình thông minh</footer>
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
        className="h-12 w-full rounded-lg border border-border bg-bg px-4 text-fg outline-none placeholder:text-subtle focus:border-accent"
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
      className="flex w-full items-center gap-4 rounded-xl border border-border bg-surface p-5 text-left transition-colors hover:border-accent/50"
    >
      <span className="grid size-12 place-items-center rounded-lg bg-accent/15 text-accent">
        <Icon className="size-6" />
      </span>
      <span>
        <span className="block text-lg font-semibold">{title}</span>
        <span className="text-sm text-muted">{sub}</span>
      </span>
    </button>
  );
}
