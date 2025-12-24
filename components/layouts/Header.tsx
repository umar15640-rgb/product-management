'use client';

import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { LuLogOut, LuShieldCheck, LuUser, LuStore, LuChevronDown } from 'react-icons/lu';
import { useStore } from '@/context/store-context';
import { useState, useRef, useEffect } from 'react';

export function Header() {
  const router = useRouter();
  const { currentStore, activeStoreUser, allStoreUsers, setActiveStoreUser } = useStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-neutral-200 h-20 flex items-center justify-between px-8 shadow-sm relative z-20">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary-600 flex items-center justify-center shadow-md">
          <LuStore className="text-white w-6 h-6" />
        </div>
        <div>
           <h2 className="text-xl font-bold text-neutral-800 tracking-tight leading-none">
             {currentStore?.store_name || 'Loading Store...'}
           </h2>
           <span className="text-xs text-neutral-500 font-medium">Product & Warranty Management</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-6">
        {/* User Switcher */}
        <div className="relative" ref={menuRef}>
            <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-3 pl-6 border-l border-neutral-200 hover:bg-neutral-50 p-2 rounded-lg transition-colors"
            >
            <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-neutral-900">
                    {activeStoreUser?.user_id?.full_name || 'Loading...'}
                </span>
                <span className="text-xs text-neutral-500 uppercase tracking-wider">
                    {activeStoreUser?.role || 'Role'}
                </span>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center">
                <LuUser className="text-primary-600 w-6 h-6" />
            </div>
            <LuChevronDown className="text-neutral-400 w-4 h-4" />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-neutral-100 py-2">
                    <div className="px-4 py-2 border-b border-neutral-100">
                        <p className="text-xs font-bold text-neutral-400 uppercase">Switch User View</p>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                        {allStoreUsers.map((user) => (
                            <button
                                key={user._id}
                                onClick={() => {
                                    setActiveStoreUser(user);
                                    setIsMenuOpen(false);
                                }}
                                className={`w-full text-left px-4 py-3 hover:bg-neutral-50 flex items-center gap-3 ${
                                    activeStoreUser?._id === user._id ? 'bg-primary-50 text-primary-900' : 'text-neutral-700'
                                }`}
                            >
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                    activeStoreUser?._id === user._id ? 'bg-primary-200 text-primary-700' : 'bg-neutral-200 text-neutral-600'
                                }`}>
                                    {user.user_id?.full_name?.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{user.user_id?.full_name}</p>
                                    <p className="text-xs opacity-75 capitalize">{user.role}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleLogout}
          className="flex items-center gap-2 text-neutral-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50"
        >
          <LuLogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}