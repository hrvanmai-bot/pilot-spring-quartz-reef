import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://epgxybqxzscnbmdyjjmf.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwZ3h5YnF4enNjbmJtZHlqam1mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTc5NjY4NSwiZXhwIjoyMTA1MzcyNjg1fQ.2IhiNqRL4-ge4B-xzqq_-yLsdqto1CcNev4CyUFtXzo';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createDirector() {
  const phone = '0944437238';
  const email = `${phone}@huyhoang.build`;
  const password = 'Hoang040222';
  const fullName = 'Từ Huy Tú';

  console.log('Creating Director account...');
  console.log('Email (internal):', email);
  console.log('Phone:', phone);
  console.log('Name:', fullName);

  // 1. Create user in Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      phone,
    },
  });

  if (authError) {
    console.error('Auth error:', authError.message);
    // If user already exists, try to get them
    if (authError.message.includes('already')) {
      console.log('User may already exist, trying to find...');
      const { data: list } = await supabase.auth.admin.listUsers();
      const existing = list?.users?.find((u) => u.email === email);
      if (existing) {
        console.log('Found existing user:', existing.id);
        await upsertProfile(existing.id, fullName, phone);
        return;
      }
    }
    process.exit(1);
  }

  const userId = authData.user.id;
  console.log('Auth user created:', userId);

  // 2. Create profile
  await upsertProfile(userId, fullName, phone);

  console.log('\n✅ Director account created successfully!');
  console.log('Login with:');
  console.log('  - Mode: Nhân sự công ty');
  console.log('  - Họ tên: Từ Huy Tú');
  console.log('  - SĐT: 0944437238');
  console.log('  - Mật khẩu: Hoang040222');
}

async function upsertProfile(userId, fullName, phone) {
  const { error } = await supabase.from('profiles').upsert({
    id: userId,
    full_name: fullName,
    phone,
    account_type: 'STAFF',
    permission_level: 'DIRECTOR',
    is_active: true,
  });

  if (error) {
    console.error('Profile error:', error.message);
    console.log('\n⚠️  Profile table may not exist yet.');
    console.log('Please run the SQL schema first in Supabase SQL Editor:');
    console.log('File: supabase/migrations/001_initial_schema.sql');
    process.exit(1);
  }

  console.log('Profile created/updated successfully.');
}

createDirector().catch(console.error);
