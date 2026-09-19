'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

type LoginMode = 'STAFF' | 'CUSTOMER' | null;

export default function LoginPage() {
  const [mode, setMode] = useState<LoginMode>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Phone is used as the unique identifier.
      // We store email as phone@huyhoang.build for Supabase Auth.
      const email = `${phone.replace(/\s+/g, '')}@huyhoang.build`;

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError('Số điện thoại hoặc mật khẩu không đúng.');
        setLoading(false);
        return;
      }

      if (!data.user) {
        setError('Đăng nhập thất bại. Vui lòng thử lại.');
        setLoading(false);
        return;
      }

      // Fetch profile to verify account_type matches selected mode
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        setError('Tài khoản chưa được kích hoạt. Liên hệ Giám đốc.');
        setLoading(false);
        return;
      }

      if (!profile.is_active) {
        await supabase.auth.signOut();
        setError('Tài khoản đã bị khóa. Liên hệ Giám đốc.');
        setLoading(false);
        return;
      }

      // Verify mode matches account_type
      if (mode === 'STAFF' && profile.account_type !== 'STAFF') {
        await supabase.auth.signOut();
        setError('Tài khoản này không phải Nhân sự công ty.');
        setLoading(false);
        return;
      }

      if (mode === 'CUSTOMER' && profile.account_type !== 'CUSTOMER') {
        await supabase.auth.signOut();
        setError('Tài khoản này không phải Khách hàng.');
        setLoading(false);
        return;
      }

      // Optional: verify full_name matches (soft check)
      if (
        fullName.trim() &&
        profile.full_name.toLowerCase() !== fullName.trim().toLowerCase()
      ) {
        // Soft warning only — still allow login if phone+password correct
        console.warn('Full name mismatch');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      console.error(err);
      setError('Có lỗi xảy ra. Vui lòng thử lại.');
      setLoading(false);
    }
  };

  const resetMode = () => {
    setMode(null);
    setFullName('');
    setPhone('');
    setPassword('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#0B1C2C] flex flex-col">
      {/* Header Brand */}
      <header className="pt-10 pb-6 px-6 text-center">
        <div className="inline-block">
          <h1 className="text-3xl md:text-4xl font-bold tracking-wider text-white">
            HUY HOÀNG
          </h1>
          <p className="mt-1 text-sm md:text-base tracking-[0.2em] text-[#C9A84C] font-medium">
            XÂY DỰNG • ĐẦU TƯ • THƯƠNG MẠI
          </p>
        </div>
        <p className="mt-6 text-lg md:text-xl text-gray-300 font-light">
          HỆ THỐNG QUẢN LÝ CÔNG TRÌNH
        </p>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md">
          {!mode ? (
            /* Mode Selection */
            <div className="space-y-5">
              <button
                onClick={() => setMode('STAFF')}
                className="w-full group relative overflow-hidden rounded-2xl bg-[#132A3E] border border-[#1E3A50] hover:border-[#C9A84C]/60 transition-all duration-300 p-6 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-[#C9A84C]/15 flex items-center justify-center text-3xl">
                    👷
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white group-hover:text-[#C9A84C] transition-colors">
                      NHÂN SỰ CÔNG TY
                    </h2>
                    <p className="text-sm text-gray-400 mt-0.5">
                      Đăng nhập hệ thống
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setMode('CUSTOMER')}
                className="w-full group relative overflow-hidden rounded-2xl bg-[#132A3E] border border-[#1E3A50] hover:border-[#C9A84C]/60 transition-all duration-300 p-6 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-[#C9A84C]/15 flex items-center justify-center text-3xl">
                    👤
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white group-hover:text-[#C9A84C] transition-colors">
                      KHÁCH HÀNG
                    </h2>
                    <p className="text-sm text-gray-400 mt-0.5">
                      Theo dõi công trình
                    </p>
                  </div>
                </div>
              </button>
            </div>
          ) : (
            /* Login Form */
            <div className="rounded-2xl bg-[#132A3E] border border-[#1E3A50] p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {mode === 'STAFF' ? '👷' : '👤'}
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      {mode === 'STAFF' ? 'Nhân sự công ty' : 'Khách hàng'}
                    </h2>
                    <p className="text-xs text-gray-400">Đăng nhập</p>
                  </div>
                </div>
                <button
                  onClick={resetMode}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  ← Quay lại
                </button>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Nguyễn Văn A"
                    className="w-full rounded-xl bg-[#0B1C2C] border border-[#1E3A50] px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A84C] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="0901234567"
                    className="w-full rounded-xl bg-[#0B1C2C] border border-[#1E3A50] px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A84C] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">
                    Mật khẩu
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full rounded-xl bg-[#0B1C2C] border border-[#1E3A50] px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A84C] transition-colors"
                  />
                </div>

                {error && (
                  <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-300">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 rounded-xl bg-[#C9A84C] hover:bg-[#D4B55A] disabled:opacity-60 disabled:cursor-not-allowed text-[#0B1C2C] font-semibold py-3.5 transition-colors"
                >
                  {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-500">
        HUY HOÀNG BUILD — Quản lý công trình thông minh
      </footer>
    </div>
  );
}
