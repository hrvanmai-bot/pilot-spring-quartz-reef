import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ProjectsList } from '@/components/projects/ProjectsList';

export default async function ProjectsPage() {
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

  // Staff & Director see all, Customer sees only own (RLS handles this)
  const { data: projects, error } = await supabase
    .from('projects')
    .select(`
      id, code, name, address, status, progress, 
      start_date, expected_end_date, actual_end_date, updated_at,
      customer:customers(id, profile:profiles(full_name))
    `)
    .order('updated_at', { ascending: false });

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Công trình</h1>
          <p className="text-sm text-gray-400 mt-1">
            {projects?.length || 0} công trình
          </p>
        </div>
        {profile.permission_level === 'DIRECTOR' && (
          <Link
            href="/admin/projects/new"
            className="rounded-xl bg-[#C9A84C] text-[#0B1C2C] font-semibold px-4 py-2.5 text-sm hover:bg-[#D4B55A] transition-colors"
          >
            + Tạo mới
          </Link>
        )}
      </div>

      <ProjectsList
        projects={projects || []}
        permissionLevel={profile.permission_level}
        accountType={profile.account_type}
      />
    </div>
  );
}
