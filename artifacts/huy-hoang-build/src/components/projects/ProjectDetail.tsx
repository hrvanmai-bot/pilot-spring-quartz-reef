'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatDate, formatDateTime } from '@/lib/utils';
import type { Profile, ProjectStatus, ItemStatus, JournalCategory } from '@/types/database';
import { PROJECT_STATUS_LABEL, ITEM_STATUS_LABEL, JOURNAL_CATEGORY_LABEL } from '@/types/database';

interface Props {
  project: any;
  items: any[];
  journals: any[];
  images: any[];
  progressLogs: any[];
  profile: Profile;
}

type Tab = 'overview' | 'items' | 'images' | 'journals' | 'info';

export function ProjectDetail({ project, items, journals, images, progressLogs, profile }: Props) {
  const [tab, setTab] = useState<Tab>('overview');
  const [progress, setProgress] = useState(project.progress);
  const [progressNote, setProgressNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const isDirector = profile.permission_level === 'DIRECTOR';
  const isStaff = profile.account_type === 'STAFF';
  const isActive = project.status === 'ACTIVE';

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Tổng quan' },
    { key: 'items', label: 'Hạng mục' },
    { key: 'images', label: 'Hình ảnh' },
    { key: 'journals', label: 'Nhật ký' },
    { key: 'info', label: 'Thông tin' },
  ];

  const handleUpdateProgress = async () => {
    if (!isDirector) return;
    if (progress === project.progress) return;
    setSaving(true);
    setMessage(null);

    const { error: logError } = await supabase.from('progress_logs').insert({
      project_id: project.id,
      old_progress: project.progress,
      new_progress: progress,
      note: progressNote || null,
      changed_by: profile.id,
    });

    if (logError) {
      setMessage('Lỗi khi ghi lịch sử tiến độ');
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from('projects')
      .update({ progress, updated_at: new Date().toISOString() })
      .eq('id', project.id);

    if (error) {
      setMessage('Lỗi khi cập nhật tiến độ');
    } else {
      // Audit
      await supabase.from('audit_logs').insert({
        user_id: profile.id,
        action: 'UPDATE_PROGRESS',
        entity_type: 'project',
        entity_id: project.id,
        before_data: { progress: project.progress },
        after_data: { progress },
      });
      setMessage('Đã cập nhật tiến độ');
      router.refresh();
    }
    setSaving(false);
  };

  const handleComplete = async () => {
    if (!isDirector) return;
    if (!confirm('Chuyển công trình sang ĐÃ HOÀN THIỆN? Progress sẽ = 100%.')) return;

    setSaving(true);
    const { error } = await supabase
      .from('projects')
      .update({
        status: 'COMPLETED',
        progress: 100,
        actual_end_date: new Date().toISOString().slice(0, 10),
        updated_at: new Date().toISOString(),
      })
      .eq('id', project.id);

    if (!error) {
      await supabase.from('progress_logs').insert({
        project_id: project.id,
        old_progress: project.progress,
        new_progress: 100,
        note: 'Hoàn thành công trình',
        changed_by: profile.id,
      });
      await supabase.from('audit_logs').insert({
        user_id: profile.id,
        action: 'COMPLETE_PROJECT',
        entity_type: 'project',
        entity_id: project.id,
        before_data: { status: project.status, progress: project.progress },
        after_data: { status: 'COMPLETED', progress: 100 },
      });
      router.refresh();
    }
    setSaving(false);
  };

  const handleReopen = async () => {
    if (!isDirector) return;
    if (!confirm('Mở lại công trình về trạng thái ĐANG THI CÔNG?')) return;

    setSaving(true);
    const { error } = await supabase
      .from('projects')
      .update({
        status: 'ACTIVE',
        actual_end_date: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', project.id);

    if (!error) {
      await supabase.from('audit_logs').insert({
        user_id: profile.id,
        action: 'REOPEN_PROJECT',
        entity_type: 'project',
        entity_id: project.id,
        before_data: { status: 'COMPLETED' },
        after_data: { status: 'ACTIVE' },
      });
      router.refresh();
    }
    setSaving(false);
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/projects" className="text-sm text-gray-400 hover:text-[#C9A84C]">
          ← Công trình
        </Link>
        <div className="mt-2 flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{project.name}</h1>
            <p className="text-sm text-gray-400 mt-1">
              {project.code}
              {project.customer?.profile?.full_name && (
                <> · {project.customer.profile.full_name}</>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {PROJECT_STATUS_LABEL[project.status as ProjectStatus]}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">Tiến độ</span>
            <span className="text-[#C9A84C] font-semibold">{project.progress}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-[#132A3E] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#C9A84C] transition-all"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        {/* Staff CTA */}
        {isStaff && isActive && (
          <Link
            href={`/projects/${project.id}/journal`}
            className="mt-5 block w-full rounded-2xl bg-[#C9A84C] text-[#0B1C2C] font-bold text-center py-4 hover:bg-[#D4B55A] transition-colors"
          >
            ✍️ GHI NHẬT KÝ
          </Link>
        )}

        {/* Director actions */}
        {isDirector && (
          <div className="mt-4 flex flex-wrap gap-2">
            {isActive ? (
              <button
                onClick={handleComplete}
                disabled={saving}
                className="rounded-xl bg-green-600/20 text-green-400 border border-green-600/40 px-4 py-2 text-sm font-medium hover:bg-green-600/30"
              >
                🟢 Hoàn thành
              </button>
            ) : (
              <button
                onClick={handleReopen}
                disabled={saving}
                className="rounded-xl bg-yellow-600/20 text-yellow-400 border border-yellow-600/40 px-4 py-2 text-sm font-medium"
              >
                🟡 Mở lại
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-[#1E3A50] mb-6 pb-px">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              tab === t.key
                ? 'border-[#C9A84C] text-[#C9A84C]'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview' && (
        <div className="space-y-6">
          {isDirector && isActive && (
            <div className="rounded-2xl bg-[#132A3E] border border-[#1E3A50] p-5">
              <h3 className="font-semibold mb-3">Cập nhật tiến độ</h3>
              <div className="flex items-center gap-4 mb-3">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-[#C9A84C] font-bold w-12 text-right">{progress}%</span>
              </div>
              <input
                type="text"
                placeholder="Ghi chú (tuỳ chọn)"
                value={progressNote}
                onChange={(e) => setProgressNote(e.target.value)}
                className="w-full rounded-xl bg-[#0B1C2C] border border-[#1E3A50] px-4 py-2.5 text-sm mb-3 focus:outline-none focus:border-[#C9A84C]"
              />
              <button
                onClick={handleUpdateProgress}
                disabled={saving || progress === project.progress}
                className="rounded-xl bg-[#C9A84C] text-[#0B1C2C] font-semibold px-5 py-2.5 text-sm disabled:opacity-50"
              >
                {saving ? 'Đang lưu...' : 'Lưu tiến độ'}
              </button>
              {message && <p className="text-sm text-green-400 mt-2">{message}</p>}
            </div>
          )}

          {progressLogs.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Lịch sử tiến độ</h3>
              <div className="space-y-2">
                {progressLogs.map((log: any) => (
                  <div key={log.id} className="rounded-xl bg-[#132A3E] border border-[#1E3A50] px-4 py-3 text-sm">
                    <span className="text-[#C9A84C]">{log.old_progress}% → {log.new_progress}%</span>
                    {log.note && <span className="text-gray-400"> · {log.note}</span>}
                    <p className="text-xs text-gray-500 mt-1">
                      {log.changer?.full_name} · {formatDateTime(log.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {journals.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Nhật ký gần đây</h3>
              <div className="space-y-3">
                {journals.slice(0, 5).map((j: any) => (
                  <div key={j.id} className="rounded-2xl bg-[#132A3E] border border-[#1E3A50] p-4">
                    <p className="text-sm text-gray-300">{j.content}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      👷 {j.author?.full_name} · {JOURNAL_CATEGORY_LABEL[j.category as JournalCategory]} · {formatDateTime(j.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'items' && (
        <div>
          {items.length === 0 ? (
            <Empty icon="📋" text="Chưa có hạng mục" />
          ) : (
            <div className="space-y-2">
              {items.map((item: any) => (
                <div key={item.id} className="rounded-xl bg-[#132A3E] border border-[#1E3A50] px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    {item.description && <p className="text-sm text-gray-400">{item.description}</p>}
                  </div>
                  <span className="text-sm text-gray-300">
                    {ITEM_STATUS_LABEL[item.status as ItemStatus]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'images' && (
        <div>
          {images.length === 0 ? (
            <Empty icon="📷" text="Chưa có hình ảnh" />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {images.map((img: any) => (
                <div key={img.id} className="aspect-square rounded-xl bg-[#132A3E] border border-[#1E3A50] overflow-hidden flex items-center justify-center text-gray-500 text-sm">
                  Ảnh
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'journals' && (
        <div>
          {journals.length === 0 ? (
            <Empty icon="📝" text="Chưa có nhật ký" />
          ) : (
            <div className="space-y-4">
              {journals.map((j: any) => (
                <div key={j.id} className="rounded-2xl bg-[#132A3E] border border-[#1E3A50] p-4">
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                    <span>👷 {j.author?.full_name}</span>
                    <span>·</span>
                    <span>{JOURNAL_CATEGORY_LABEL[j.category as JournalCategory]}</span>
                    <span>·</span>
                    <span>{formatDateTime(j.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-200 whitespace-pre-wrap">{j.content}</p>
                  {j.images?.length > 0 && (
                    <p className="text-xs text-[#C9A84C] mt-2">{j.images.length} ảnh</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'info' && (
        <div className="rounded-2xl bg-[#132A3E] border border-[#1E3A50] p-5 space-y-3 text-sm">
          <Row label="Mã công trình" value={project.code} />
          <Row label="Địa chỉ" value={project.address} />
          <Row label="Loại" value={project.project_type || '—'} />
          <Row label="Khách hàng" value={project.customer?.profile?.full_name || '—'} />
          <Row label="Ngày khởi công" value={project.start_date ? formatDate(project.start_date) : '—'} />
          <Row label="Dự kiến hoàn thành" value={project.expected_end_date ? formatDate(project.expected_end_date) : '—'} />
          <Row label="Hoàn thành thực tế" value={project.actual_end_date ? formatDate(project.actual_end_date) : '—'} />
          {project.description && <Row label="Mô tả" value={project.description} />}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-400 shrink-0">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

function Empty({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#1E3A50] p-10 text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-gray-400">{text}</p>
    </div>
  );
}
