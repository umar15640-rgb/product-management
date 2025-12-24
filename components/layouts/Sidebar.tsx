'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Stores', href: '/stores', icon: '🏪' },
  { name: 'Store Users', href: '/store-users', icon: '👥' },
  { name: 'Customers', href: '/customers', icon: '👤' },
  { name: 'Products', href: '/products', icon: '📦' },
  { name: 'Warranties', href: '/warranties', icon: '🛡️' },
  { name: 'Claims', href: '/claims', icon: '📋' },
  { name: 'Audit Logs', href: '/audit-logs', icon: '📝' },
  { name: 'WhatsApp', href: '/whatsapp', icon: '💬' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-72 bg-white border-r border-neutral-200 min-h-screen shadow-sm">
      <div className="flex items-center justify-center h-20 border-b border-neutral-200 bg-linear-to-r from-primary-600 to-primary-700">
        <h1 className="text-white text-xl font-bold">Warranty System</h1>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-primary-100 text-primary-700 border-l-4 border-primary-600'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              )}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-neutral-200 p-4 bg-neutral-50">
        <p className="text-xs text-neutral-500 text-center">Warranty Management System v1.0</p>
      </div>
    </div>
  );
}
