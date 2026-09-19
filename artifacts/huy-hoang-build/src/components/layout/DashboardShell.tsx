'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import type { Profile } from '@/types/database';

interface DashboardShellProps {
  profile: Profile;
  children: React.ReactNode;
}

export function DashboardShell({ profile, children }: DashboardShellProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#0B1C2C] text-white flex">
      <Sidebar
        permissionLevel={profile.permission_level}
        accountType={profile.account_type}
        fullName={profile.full_name}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1 pb-20 lg:pb-6 overflow-x-hidden">
          {children}
        </main>
      </div>

      <BottomNav
        permissionLevel={profile.permission_level}
        accountType={profile.account_type}
      />
    </div>
  );
}
