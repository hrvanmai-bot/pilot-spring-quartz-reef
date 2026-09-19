'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function NewProjectPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [projectType, setProjectType] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [expectedEnd, setExpectedEnd] = useState('');
  const [description, setDescription] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('customers')
        .select('id, profile:profiles(full_name, phone)')
        .order('created_at', { ascending: false });
      setCustomers(data || []);
    })();
  }, []);

  const generateCode = () => {
    const year = new Date().getFullYear();
    const rand = Math.floor(Math.random() * 900) + 100;
    return `HHB-${year}-${rand}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

    // Check director
    const { data: profile } = await supabase
      .from('profiles')
      .select('permission_level')
      .eq('id', user.id)
      .single();

    if (profile?.permission_level !== 'DIRECTOR') {
      setError('Chỉ Giám đốc mới được tạo công trình');
      setLoading(false);
      return;
    }

    if (!customerId) {
      setError('Vui lòng chọn khách hàng');
      setLoading(false);
      return;
    }

    const code = generateCode();

    const { data, error: insertError } = await supabase
      .from('projects')
      .insert({
        code,
        name,
        address,
        project_type: projectType || null,
        customer_id: customerId,
        start_date: startDate || null,
        expected_end_date: expectedEnd || null,
        description: description || null,
        progress: 0,
        status: 'ACTIVE',
        created_by: user.id,
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    // Audit
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'CREATE_PROJECT',
      entity_type: 'project',
      entity_id: data.id,
      after_data: { code, name },
    });

    router.push(`/projects/${data.id}`);
    router.refresh();
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <Link href="/projects" className="text-sm text-gray-400 hover:text-[#C9A84C]">
        ← Quay lại
      </Link>
      <h1 className="text-2xl font-semibold mt-3 mb-6">Tạo công trình mới</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Tên công trình *" required>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="input"
            placeholder="Nhà phố Quy Nhơn"
          />
        </Field>

        <Field label="Khách hàng *">
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            required
            className="input"
          >
            <option value="">— Chọn khách hàng —</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.profile?.full_name} ({c.profile?.phone})
              </option>
            ))}
          </select>
          {customers.length === 0 && (
            <p className="text-xs text-yellow-400 mt-1">
              Chưa có khách hàng. Hãy tạo khách hàng trước.
            </p>
          )}
        </Field>

        <Field label="Địa chỉ *">
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            className="input"
            placeholder="123 Nguyễn Huệ, Quy Nhơn"
          />
        </Field>

        <Field label="Loại công trình">
          <input
            value={projectType}
            onChange={(e) => setProjectType(e.target.value)}
            className="input"
            placeholder="Nhà phố / Căn hộ / Nội thất..."
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Ngày khởi công">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Dự kiến hoàn thành">
            <input
              type="date"
              value={expectedEnd}
              onChange={(e) => setExpectedEnd(e.target.value)}
              className="input"
            />
          </Field>
        </div>

        <Field label="Mô tả">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="input"
          />
        </Field>

        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#C9A84C] text-[#0B1C2C] font-semibold py-3.5 hover:bg-[#D4B55A] disabled:opacity-50"
        >
          {loading ? 'Đang tạo...' : 'Tạo công trình'}
        </button>
      </form>

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          background: #0b1c2c;
          border: 1px solid #1e3a50;
          padding: 0.75rem 1rem;
          color: white;
          outline: none;
        }
        .input:focus {
          border-color: #c9a84c;
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-300 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
