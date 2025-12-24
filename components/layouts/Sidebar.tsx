'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LuLayoutDashboard, 
  LuStore, 
  LuUsers, 
  LuUser, 
  LuPackage, 
  LuShieldCheck, 
  LuClipboardList, 
  LuFileClock 
} from 'react-icons/lu';
import { FaWhatsapp } from 'react-icons/fa';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LuLayoutDashboard },
  { name: 'Stores', href: '/stores', icon: LuStore },
  { name: 'Store Users', href: '/store-users', icon: LuUsers },
  { name: 'Customers', href: '/customers', icon: LuUser },
  { name: 'Products', href: '/products', icon: LuPackage },
  { name: 'Warranties', href: '/warranties', icon: LuShieldCheck },
  { name: 'Claims', href: '/claims', icon: LuClipboardList },
  { name: 'Audit Logs', href: '/audit-logs', icon: LuFileClock },
  { name: 'WhatsApp', href: '/whatsapp', icon: FaWhatsapp },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-72 bg-white border-r border-neutral-200 min-h-screen shadow-sm">
      <div className="flex items-center gap-3 px-6 h-20 border-b border-neutral-200 bg-gradient-to-r from-primary-600 to-primary-700">
        <LuShieldCheck className="w-8 h-8 text-white" />
        <h1 className="text-white text-lg font-bold tracking-wide">Warranty Sys</h1>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon; // Get the icon component
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group',
                isActive
                  ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600 shadow-sm'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
              )}
            >
              <Icon 
                className={cn(
                  "w-5 h-5 mr-3 transition-colors",
                  isActive ? "text-primary-600" : "text-neutral-400 group-hover:text-neutral-600"
                )} 
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-neutral-200 p-4 bg-neutral-50">
        <p className="text-xs text-neutral-500 text-center font-medium">Warranty Management System v1.0</p>
      </div>
    </div>
  );
}