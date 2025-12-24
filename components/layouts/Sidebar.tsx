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
    <div className="flex flex-col w-64 bg-gray-900 min-h-screen">
      <div className="flex items-center justify-center h-16 bg-gray-800">
        <h1 className="text-white text-xl font-bold">Warranty System</h1>
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
