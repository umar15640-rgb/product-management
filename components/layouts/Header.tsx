'use client';

import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { LuLogOut, LuShieldCheck, LuUser } from 'react-icons/lu';

export function Header() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <header className="bg-white border-b border-neutral-200 h-20 flex items-center justify-between px-8 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary-600 flex items-center justify-center shadow-md">
          <LuShieldCheck className="text-white w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-800 tracking-tight">Product & Warranty Management</h2>
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="flex items-center gap-3 pl-6 border-l border-neutral-200">
          <div className="flex flex-col items-end">
            <span className="text-sm font-semibold text-neutral-900">Admin User</span>
            <span className="text-xs text-neutral-500">admin@example.com</span>
          </div>
          <div className="h-10 w-10 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center">
            <LuUser className="text-primary-600 w-6 h-6" />
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleLogout}
          className="flex items-center gap-2 text-neutral-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50"
        >
          <LuLogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </header>
  );
}