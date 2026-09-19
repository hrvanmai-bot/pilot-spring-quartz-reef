import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { ProjectDetail } from '@/components/projects/ProjectDetail';

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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

  const { data: project, error } = await supabase
    .from('projects')
    .select(`
      *,
      customer:customers(
        id,
        company_name,
        profile:profiles(id, full_name, phone)
      )
    `)
    .eq('id', id)
    .single();

  if (error || !project) notFound();

  // Fetch related data
  const [{ data: items }, { data: journals }, { data: images }, { data: progressLogs }] =
    await Promise.all([
      supabase
        .from('project_items')
        .select('*')
        .eq('project_id', id)
        .order('sort_order'),
      supabase
        .from('journals')
        .select(`
          *,
          author:profiles(id, full_name),
          images:journal_images(*)
        `)
        .eq('project_id', id)
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('project_images')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: false })
        .limit(100),
      supabase
        .from('progress_logs')
        .select('*, changer:profiles(full_name)')
        .eq('project_id', id)
        .order('created_at', { ascending: false })
        .limit(20),
    ]);

  return (
    <ProjectDetail
      project={project}
      items={items || []}
      journals={journals || []}
      images={images || []}
      progressLogs={progressLogs || []}
      profile={profile}
    />
  );
}
