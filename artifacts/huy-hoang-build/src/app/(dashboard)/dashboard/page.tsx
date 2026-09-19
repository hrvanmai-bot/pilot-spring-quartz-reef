import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) redirect('/login');

  const isDirector = profile.permission_level === 'DIRECTOR';
  const isStaff = profile.account_type === 'STAFF';
  const isCustomer = profile.account_type === 'CUSTOMER';

  let activeCount = 0;
  let completedCount = 0;
  let customerCount = 0;
  let staffCount = 0;
  let recentJournals: any[] = [];
  let myProjects: any[] = [];

  if (isStaff) {
    const { count: a } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ACTIVE');
    activeCount = a || 0;

    const { count: c } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'COMPLETED');
    completedCount = c || 0;

    const { data: journals } = await supabase
      .from('journals')
      .select('id, content, created_at, project:projects(id, name, code), author:profiles(full_name)')
      .order('created_at', { ascending: false })
      .limit(5);
    recentJournals = journals || [];
  }

  if (isDirector) {
    const { count: a } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ACTIVE');
    activeCount = a || 0;

    const { count: c } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'COMPLETED');
    completedCount = c || 0;

    const { count: cust } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true });
    customerCount = cust || 0;

    const { count: st } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('account_type', 'STAFF');
    staffCount = st || 0;

    const { data: journals } = await supabase
      .from('journals')
      .select('id, content, created_at, project:projects(id, name, code), author:profiles(full_name)')
      .order('created_at', { ascending: false })
      .limit(8);
    recentJournals = journals || [];
  }

  if (isCustomer) {
    const { data: projects } = await supabase
      .from('projects')
      .select('id, code, name, status, progress, address, updated_at')
      .order('updated_at', { ascending: false });
    myProjects = projects || [];
  }

  const today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">
          Xin chào, {profile.full_name.split(' ').slice(-1)[0]}
        </h1>
        <p className="text-gray-400 text-sm mt-1 capitalize">{today}</p>
      </div>

      {isDirector && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <StatCard title="Đang thi công" value={String(activeCount)} />
            <StatCard title="Đã hoàn thiện" value={String(completedCount)} />
            <StatCard title="Khách hàng" value={String(customerCount)} />
            <StatCard title="Nhân sự" value={String(staffCount)} />
          </div>

          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-3">Nhật ký mới nhất</h2>
            {recentJournals.length === 0 ? (
              <EmptyState icon="📝" text="Chưa có nhật ký nào" />
            ) : (
              <div className="space-y-3">
                {recentJournals.map((j: any) => (
                  <Link
                    key={j.id}
                    href={`/projects/${j.project?.id}`}
                    className="block rounded-2xl bg-[#132A3E] border border-[#1E3A50] p-4 hover:border-[#C9A84C]/40 transition-colors"
                  >
                    <p className="text-sm text-[#C9A84C] font-medium truncate">
                      {j.project?.name || 'Công trình'}
                    </p>
                    <p className="text-sm text-gray-300 mt-1 line-clamp-2">{j.content}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      👷 {j.author?.full_name} · {formatDate(j.created_at)}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {isStaff && !isDirector && (
        <>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <StatCard title="Đang thi công" value={String(activeCount)} />
            <StatCard title="Đã hoàn thiện" value={String(completedCount)} />
          </div>

          <Link
            href="/update"
            className="block w-full rounded-2xl bg-[#C9A84C] text-[#0B1C2C] font-bold text-lg py-5 text-center hover:bg-[#D4B55A] transition-colors mb-8 shadow-lg shadow-[#C9A84C]/20"
          >
            📸 CẬP NHẬT CÔNG TRÌNH
          </Link>

          <section>
            <h2 className="text-lg font-semibold mb-3">Cập nhật gần đây</h2>
            {recentJournals.length === 0 ? (
              <EmptyState icon="📝" text="Chưa có nhật ký nào" />
            ) : (
              <div className="space-y-3">
                {recentJournals.map((j: any) => (
                  <Link
                    key={j.id}
                    href={`/projects/${j.project?.id}`}
                    className="block rounded-2xl bg-[#132A3E] border border-[#1E3A50] p-4"
                  >
                    <p className="text-sm text-[#C9A84C] font-medium">{j.project?.name}</p>
                    <p className="text-sm text-gray-300 mt-1 line-clamp-2">{j.content}</p>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {isCustomer && (
        <section>
          <h2 className="text-lg font-semibold mb-4">Công trình của bạn</h2>
          {myProjects.length === 0 ? (
            <EmptyState
              icon="🏗️"
              text="Chưa có công trình"
              sub="Những công trình được tạo bởi Giám đốc sẽ xuất hiện tại đây."
            />
          ) : (
            <div className="space-y-4">
              {myProjects.map((p: any) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="block rounded-2xl bg-[#132A3E] border border-[#1E3A50] p-5 hover:border-[#C9A84C]/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-white">{p.name}</h3>
                      <p className="text-xs text-gray-400 mt-1">{p.code}</p>
                    </div>
                    <span className="text-sm whitespace-nowrap">
                      {p.status === 'ACTIVE' ? '🟡 ĐANG THI CÔNG' : '🟢 ĐÃ HOÀN THIỆN'}
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Tiến độ</span>
                      <span className="text-[#C9A84C] font-medium">{p.progress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#0B1C2C] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#C9A84C] transition-all"
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#132A3E] border border-[#1E3A50] p-4">
      <p className="text-xs text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-[#C9A84C] mt-1">{value}</p>
    </div>
  );
}

function EmptyState({
  icon,
  text,
  sub,
}: {
  icon: string;
  text: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[#1E3A50] p-8 text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-gray-300 font-medium">{text}</p>
      {sub && <p className="text-sm text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}
