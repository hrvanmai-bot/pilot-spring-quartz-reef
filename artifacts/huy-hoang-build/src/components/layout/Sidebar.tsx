'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { PermissionLevel, AccountType } from '@/types/database';

interface SidebarProps {
  permissionLevel: PermissionLevel;
  accountType: AccountType;
  fullName: string;
  onLogout: () => void;
}

const commonLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/projects', label: 'Công trình', icon: '🏗️' },
  { href: '/journals', label: 'Nhật ký', icon: '📝' },
  { href: '/notifications', label: 'Thông báo', icon: '🔔' },
];

const directorLinks = [
  { href: '/admin/staff', label: 'Nhân sự', icon: '👷' },
  { href: '/admin/customers', label: 'Khách hàng', icon: '👤' },
  { href: '/admin/projects', label: 'Quản lý CT', icon: '📋' },
  { href: '/admin/audit', label: 'Nhật ký HT', icon: '📜' },
];

export function Sidebar({ permissionLevel, accountType, fullName, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const isDirector = permissionLevel === 'DIRECTOR';

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#0B1C2C] border-r border-[#1E3A50] h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-[#1E3A50]">
        <h1 className="text-lg font-bold tracking-wide text-white">HUY HOÀNG</h1>
        <p className="text-[10px] tracking-[0.15em] text-[#C9A84C] mt-0.5">
          BUILD
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 text-[11px] uppercase tracking-wider text-gray-500 mb-2">
          Chung
        </p>
        {commonLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors',
              pathname === link.href || pathname.startsWith(link.href + '/')
                ? 'bg-[#C9A84C]/15 text-[#C9A84C] font-medium'
                : 'text-gray-300 hover:bg-[#132A3E] hover:text-white'
            )}
          >
            <span className="text-base">{link.icon}</span>
            {link.label}
          </Link>
        ))}

        {isDirector && (
          <>
            <p className="px-3 text-[11px] uppercase tracking-wider text-gray-500 mt-6 mb-2">
              Quản trị
            </p>
            {directorLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors',
                  pathname === link.href || pathname.startsWith(link.href + '/')
                    ? 'bg-[#C9A84C]/15 text-[#C9A84C] font-medium'
                    : 'text-gray-300 hover:bg-[#132A3E] hover:text-white'
                )}
              >
                <span className="text-base">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-[#1E3A50]">
        <div className="px-3 py-2 mb-2">
          <p className="text-sm font-medium text-white truncate">{fullName}</p>
          <p className="text-xs text-gray-400">
            {isDirector ? 'Giám đốc' : accountType === 'STAFF' ? 'Nhân sự' : 'Khách hàng'}
          </p>
        </div>
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-300 hover:bg-[#132A3E] hover:text-white transition-colors"
        >
          <span>⚙️</span> Cài đặt
        </Link>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <span>🚪</span> Đăng xuất
        </button>
      </div>
    </aside>
  );
}
