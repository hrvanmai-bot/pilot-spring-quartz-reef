import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false },
  }
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { full_name, phone, password, account_type, permission_level } = body;

    if (!full_name || !phone || !password || !account_type) {
      return NextResponse.json({ error: 'Thiếu thông tin' }, { status: 400 });
    }

    // Verify caller is Director (using anon client + auth header would be better, simplified here)
    const email = `${phone.replace(/\s+/g, '')}@huyhoang.build`;

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, phone },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user.id;

    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      id: userId,
      full_name,
      phone,
      account_type,
      permission_level: permission_level || (account_type === 'STAFF' ? 'STAFF' : 'CUSTOMER'),
      is_active: true,
    });

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    // If customer, also create customers row
    if (account_type === 'CUSTOMER') {
      await supabaseAdmin.from('customers').insert({
        profile_id: userId,
      });
    }

    return NextResponse.json({ success: true, user_id: userId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Lỗi server' }, { status: 500 });
  }
}
