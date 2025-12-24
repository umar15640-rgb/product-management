'use client';

import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export function Header() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <header className="bg-white border-b border-neutral-200 h-20 flex items-center justify-between px-8 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-linear-to-br from-primary-600 to-primary-700 flex items-center justify-center">
          <span className="text-white font-bold text-lg">W</span>
        </div>
        <h2 className="text-2xl font-bold text-neutral-900">Product & Warranty Management</h2>
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-700 font-semibold">👤</span>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </header>
  );
}
