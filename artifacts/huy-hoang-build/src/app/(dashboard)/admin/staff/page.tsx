'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function StaffManagementPage() {
  const supabase = createClient();
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('account_type', 'STAFF')
      .order('created_at', { ascending: false });
    setStaff(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          phone,
          password,
          account_type: 'STAFF',
          permission_level: 'STAFF',
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Lỗi tạo nhân sự');
      } else {
        setSuccess('Đã tạo nhân sự thành công');
        setFullName('');
        setPhone('');
        setPassword('');
        setShowForm(false);
        load();
      }
    } catch {
      setError('Lỗi kết nối');
    }
    setSaving(false);
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-[#C9A84C]">
            ← Dashboard
          </Link>
          <h1 className="text-2xl font-semibold mt-1">Quản lý Nhân sự</h1>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-xl bg-[#C9A84C] text-[#0B1C2C] font-semibold px-4 py-2.5 text-sm"
        >
          {showForm ? 'Đóng' : '+ Thêm nhân sự'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-2xl bg-[#132A3E] border border-[#1E3A50] p-5 mb-6 space-y-3">
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Họ và tên" className="w-full rounded-xl bg-[#0B1C2C] border border-[#1E3A50] px-4 py-3 focus:outline-none focus:border-[#C9A84C]" />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="Số điện thoại" className="w-full rounded-xl bg-[#0B1C2C] border border-[#1E3A50] px-4 py-3 focus:outline-none focus:border-[#C9A84C]" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Mật khẩu tạm thời" className="w-full rounded-xl bg-[#0B1C2C] border border-[#1E3A50] px-4 py-3 focus:outline-none focus:border-[#C9A84C]" />
          {error && <p className="text-sm text-red-400">{error}</p>}
          {success && <p className="text-sm text-green-400">{success}</p>}
          <button type="submit" disabled={saving} className="w-full rounded-xl bg-[#C9A84C] text-[#0B1C2C] font-semibold py-3 disabled:opacity-50">
            {saving ? 'Đang tạo...' : 'Tạo nhân sự'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-gray-400">Đang tải...</p>
      ) : staff.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#1E3A50] p-10 text-center text-gray-400">Chưa có nhân sự nào</div>
      ) : (
        <div className="space-y-2">
          {staff.map((s) => (
            <div key={s.id} className="rounded-xl bg-[#132A3E] border border-[#1E3A50] px-4 py-3 flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {s.full_name}
                  {s.permission_level === 'DIRECTOR' && <span className="ml-2 text-xs text-[#C9A84C]">Giám đốc</span>}
                </p>
                <p className="text-sm text-gray-400">{s.phone}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${s.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {s.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
