'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { JOURNAL_CATEGORY_LABEL } from '@/types/database';
import type { JournalCategory } from '@/types/database';

const CATEGORIES: JournalCategory[] = ['XAY_DUNG', 'DIEN', 'NUOC', 'SON', 'NOI_THAT', 'KHAC'];

export default function CreateJournalPage() {
  const params = useParams();
  const projectId = params.id as string;
  const router = useRouter();
  const supabase = createClient();

  const [content, setContent] = useState('');
  const [category, setCategory] = useState<JournalCategory>('XAY_DUNG');
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('projects')
        .select('id, name, code, status')
        .eq('id', projectId)
        .single();
      setProject(data);
    })();
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Vui lòng nhập nội dung nhật ký');
      return;
    }
    setError(null);
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError('Chưa đăng nhập');
      setLoading(false);
      return;
    }

    if (project?.status !== 'ACTIVE') {
      setError('Chỉ được ghi nhật ký trên công trình đang thi công');
      setLoading(false);
      return;
    }

    const { data: journal, error: journalError } = await supabase
      .from('journals')
      .insert({
        project_id: projectId,
        author_id: user.id,
        category,
        content: content.trim(),
        is_visible_to_customer: true,
      })
      .select()
      .single();

    if (journalError) {
      setError(journalError.message);
      setLoading(false);
      return;
    }

    // Upload images if any (basic - store path, real optimization later)
    if (files.length > 0 && journal) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split('.').pop() || 'jpg';
        const path = `${projectId}/${journal.id}/${Date.now()}-${i}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('journal-images')
          .upload(path, file, { contentType: file.type });

        if (!uploadError) {
          await supabase.from('journal_images').insert({
            journal_id: journal.id,
            storage_path: path,
            file_size: file.size,
            mime_type: file.type,
            sort_order: i,
          });
        }
      }
    }

    // Audit
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'CREATE_JOURNAL',
      entity_type: 'journal',
      entity_id: journal.id,
      after_data: { project_id: projectId, category, images: files.length },
    });

    router.push(`/projects/${projectId}`);
    router.refresh();
  };

  if (project && project.status !== 'ACTIVE') {
    return (
      <div className="p-6 max-w-lg mx-auto text-center">
        <p className="text-gray-300 mb-4">Công trình đã hoàn thiện, không thể ghi nhật ký mới.</p>
        <Link href={`/projects/${projectId}`} className="text-[#C9A84C]">
          ← Quay lại
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto">
      <Link href={`/projects/${projectId}`} className="text-sm text-gray-400 hover:text-[#C9A84C]">
        ← Quay lại
      </Link>
      <h1 className="text-xl font-semibold mt-3 mb-1">✍️ Ghi nhật ký</h1>
      {project && (
        <p className="text-sm text-gray-400 mb-6">
          {project.name} · {project.code}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-1.5">Nhóm công việc</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`rounded-full px-3 py-1.5 text-sm ${
                  category === c
                    ? 'bg-[#C9A84C] text-[#0B1C2C] font-medium'
                    : 'bg-[#132A3E] text-gray-300 border border-[#1E3A50]'
                }`}
              >
                {JOURNAL_CATEGORY_LABEL[c]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1.5">Nội dung *</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={6}
            placeholder="Hôm nay đã hoàn thành tô tường tầng 1..."
            className="w-full rounded-xl bg-[#0B1C2C] border border-[#1E3A50] px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A84C]"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1.5">Hình ảnh (tuỳ chọn)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
            className="w-full text-sm text-gray-400 file:mr-3 file:rounded-lg file:border-0 file:bg-[#C9A84C] file:text-[#0B1C2C] file:px-3 file:py-2 file:font-medium"
          />
          {files.length > 0 && (
            <p className="text-xs text-gray-400 mt-1">{files.length} ảnh đã chọn</p>
          )}
        </div>

        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#C9A84C] text-[#0B1C2C] font-bold py-4 text-lg hover:bg-[#D4B55A] disabled:opacity-50"
        >
          {loading ? 'Đang lưu...' : 'Lưu nhật ký'}
        </button>
      </form>
    </div>
  );
}
