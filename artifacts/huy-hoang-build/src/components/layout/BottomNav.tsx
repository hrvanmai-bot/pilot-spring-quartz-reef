'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { PermissionLevel, AccountType } from '@/types/database';

interface BottomNavProps {
  permissionLevel: PermissionLevel;
  accountType: AccountType;
}

export function BottomNav({ permissionLevel, accountType }: BottomNavProps) {
  const pathname = usePathname();
  const isDirector = permissionLevel === 'DIRECTOR';
  const isStaff = accountType === 'STAFF';
  const isCustomer = accountType === 'CUSTOMER';

  let links: { href: string; label: string; icon: string }[] = [];

  if (isDirector) {
    links = [
      { href: '/dashboard', label: 'Dashboard', icon: '📊' },
      { href: '/projects', label: 'Công trình', icon: '🏗️' },
      { href: '/journals', label: 'Hoạt động', icon: '📝' },
      { href: '/notifications', label: 'Thông báo', icon: '🔔' },
      { href: '/admin', label: 'Cài đặt', icon: '⚙️' },
    ];
  } else if (isStaff) {
    links = [
      { href: '/dashboard', label: 'Trang chủ', icon: '🏠' },
      { href: '/projects', label: 'Công trình', icon: '🏗️' },
      { href: '/update', label: 'Cập nhật', icon: '📸' },
      { href: '/notifications', label: 'Thông báo', icon: '🔔' },
      { href: '/account', label: 'Tài khoản', icon: '👤' },
    ];
  } else {
    // Customer
    links = [
      { href: '/dashboard', label: 'Trang chủ', icon: '🏠' },
      { href: '/projects', label: 'Công trình', icon: '🏗️' },
      { href: '/gallery', label: 'Hình ảnh', icon: '📷' },
      { href: '/notifications', label: 'Thông báo', icon: '🔔' },
      { href: '/account', label: 'Tài khoản', icon: '👤' },
    ];
  }

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0B1C2C] border-t border-[#1E3A50] safe-area-pb">
      <div className="flex items-center justify-around h-16">
        {links.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href !== '/dashboard' && pathname.startsWith(link.href));

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors',
                isActive ? 'text-[#C9A84C]' : 'text-gray-400'
              )}
            >
              <span className="text-xl leading-none">{link.icon}</span>
              <span className="text-[10px] font-medium leading-none">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
