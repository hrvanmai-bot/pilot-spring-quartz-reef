'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { ProjectStatus, PermissionLevel, AccountType } from '@/types/database';
import { formatDate } from '@/lib/utils';

interface ProjectRow {
  id: string;
  code: string;
  name: string;
  address: string;
  status: ProjectStatus;
  progress: number;
  start_date: string | null;
  expected_end_date: string | null;
  actual_end_date: string | null;
  updated_at: string;
  customer?: {
    id: string;
    profile?: { full_name: string } | null;
  } | null;
}

interface ProjectsListProps {
  projects: ProjectRow[];
  permissionLevel: PermissionLevel;
  accountType: AccountType;
}

export function ProjectsList({ projects, permissionLevel, accountType }: ProjectsListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'az'>('newest');

  const filtered = useMemo(() => {
    let list = [...projects];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.customer?.profile?.full_name?.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'ALL') {
      list = list.filter((p) => p.status === statusFilter);
    }

    list.sort((a, b) => {
      if (sort === 'newest') return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      if (sort === 'oldest') return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
      return a.name.localeCompare(b.name, 'vi');
    });

    return list;
  }, [projects, search, statusFilter, sort]);

  return (
    <div>
      {/* Search + Filters */}
      <div className="space-y-3 mb-6">
        <input
          type="search"
          placeholder="Tìm theo tên, mã, địa chỉ, khách hàng..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl bg-[#132A3E] border border-[#1E3A50] px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A84C]"
        />

        <div className="flex flex-wrap gap-2">
          {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-[#C9A84C] text-[#0B1C2C]'
                  : 'bg-[#132A3E] text-gray-300 border border-[#1E3A50]'
              }`}
            >
              {s === 'ALL' ? 'Tất cả' : s === 'ACTIVE' ? '🟡 Đang thi công' : '🟢 Đã hoàn thiện'}
            </button>
          ))}

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="ml-auto rounded-full bg-[#132A3E] border border-[#1E3A50] px-3 py-1.5 text-sm text-gray-300 focus:outline-none"
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="az">A → Z</option>
          </select>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#1E3A50] p-10 text-center">
          <div className="text-3xl mb-2">🏗️</div>
          <p className="text-gray-300 font-medium">
            {projects.length === 0 ? 'Chưa có công trình' : 'Không tìm thấy công trình'}
          </p>
          {projects.length === 0 && (
            <p className="text-sm text-gray-500 mt-1">
              Những công trình được tạo bởi Giám đốc sẽ xuất hiện tại đây.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="block rounded-2xl bg-[#132A3E] border border-[#1E3A50] p-4 md:p-5 hover:border-[#C9A84C]/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-white truncate">{p.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {p.code}
                    {p.customer?.profile?.full_name && (
                      <> · {p.customer.profile.full_name}</>
                    )}
                  </p>
                  <p className="text-sm text-gray-400 mt-1 truncate">{p.address}</p>
                </div>
                <span className="text-sm whitespace-nowrap shrink-0">
                  {p.status === 'ACTIVE' ? '🟡 ĐANG THI CÔNG' : '🟢 ĐÃ HOÀN THIỆN'}
                </span>
              </div>

              <div className="mt-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Tiến độ</span>
                  <span className="text-[#C9A84C] font-medium">{p.progress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#0B1C2C] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#C9A84C]"
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
