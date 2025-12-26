'use client';

import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { LuLogOut, LuUser, LuStore, LuChevronDown, LuLogIn } from 'react-icons/lu';
import { useStore } from '@/context/store-context';
import { useState, useRef, useEffect } from 'react';

export function Header() {
  const router = useRouter();
  const { currentStore, currentUser, activeStoreUser, allStores, allStoreUsers, loggedInStoreUsers, setCurrentStore, setActiveStoreUser, addLoggedInStoreUser } = useStore();
  const [isStoreMenuOpen, setIsStoreMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const storeMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('storeUserId');
    localStorage.removeItem('currentStoreId');
    localStorage.removeItem('loggedInStoreUsers');
    router.push('/login');
  };

  const handleLoginToStoreUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
          store_id: currentStore?._id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Only allow logging in as store_user (not user_account)
      if (data.accountType === 'user_account') {
        throw new Error('Cannot login as user account. Please use store user credentials.');
      }

      // Add to logged in store users
      if (data.storeUser) {
        addLoggedInStoreUser(data.storeUser);
        setActiveStoreUser(data.storeUser);
        setShowLoginModal(false);
        setLoginEmail('');
        setLoginPassword('');
        // Update token to store user token
        localStorage.setItem('token', data.token);
        localStorage.setItem('storeUserId', data.storeUser.id);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setLoginError(err.message);
    }
  };

  // Filter store users - only show logged in ones unless admin
  const availableStoreUsers = activeStoreUser?.role === 'admin' 
    ? allStoreUsers 
    : allStoreUsers.filter((su: any) => 
        loggedInStoreUsers.some((loggedIn: any) => loggedIn._id === su._id)
      );

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (storeMenuRef.current && !storeMenuRef.current.contains(event.target as Node)) {
        setIsStoreMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="bg-white border-b border-neutral-200 h-20 flex items-center justify-between px-8 shadow-sm relative z-20">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary-600 flex items-center justify-center shadow-md">
            <LuStore className="text-white w-6 h-6" />
          </div>
          <div className="relative" ref={storeMenuRef}>
            <button 
              onClick={() => setIsStoreMenuOpen(!isStoreMenuOpen)}
              className="flex items-center gap-2 hover:bg-neutral-50 p-2 rounded-lg transition-colors"
            >
              <div className="text-left">
                <h2 className="text-xl font-bold text-neutral-800 tracking-tight leading-none">
                  {currentStore?.store_name || 'Loading Store...'}
                </h2>
                <span className="text-xs text-neutral-500 font-medium">Product & Warranty Management</span>
              </div>
              {allStores.length > 1 && <LuChevronDown className="text-neutral-400 w-4 h-4" />}
            </button>

            {/* Store Switcher Dropdown */}
            {isStoreMenuOpen && allStores.length > 1 && (
              <div className="absolute left-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-neutral-100 py-2 z-30">
                <div className="px-4 py-2 border-b border-neutral-100">
                  <p className="text-xs font-bold text-neutral-400 uppercase">Switch Store</p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {allStores.map((store: any) => (
                    <button
                      key={store._id}
                      onClick={() => {
                        setCurrentStore(store);
                        setIsStoreMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-neutral-50 flex items-center gap-3 ${
                        currentStore?._id === store._id ? 'bg-primary-50 text-primary-900' : 'text-neutral-700'
                      }`}
                    >
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        currentStore?._id === store._id ? 'bg-primary-200 text-primary-700' : 'bg-neutral-200 text-neutral-600'
                      }`}>
                        <LuStore className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{store.store_name}</p>
                        <p className="text-xs opacity-75">Store</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          {/* User Switcher - Shows store users within current store */}
          {availableStoreUsers.length > 0 && (
            <div className="relative" ref={userMenuRef}>
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-3 pl-6 border-l border-neutral-200 hover:bg-neutral-50 p-2 rounded-lg transition-colors"
              >
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold text-neutral-900">
                    {activeStoreUser?.full_name || currentUser?.full_name || 'Loading...'}
                  </span>
                  <span className="text-xs text-neutral-500 uppercase tracking-wider">
                    {activeStoreUser?.role || 'User'}
                  </span>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center">
                  <LuUser className="text-primary-600 w-6 h-6" />
                </div>
                <LuChevronDown className="text-neutral-400 w-4 h-4" />
              </button>

              {/* Store User Switcher Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-neutral-100 py-2 z-30">
                  <div className="px-4 py-2 border-b border-neutral-100">
                    <p className="text-xs font-bold text-neutral-400 uppercase">Switch User View</p>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {availableStoreUsers.map((user: any) => (
                      <button
                        key={user._id}
                        onClick={() => {
                          setActiveStoreUser(user);
                          setIsUserMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-neutral-50 flex items-center gap-3 ${
                          activeStoreUser?._id === user._id ? 'bg-primary-50 text-primary-900' : 'text-neutral-700'
                        }`}
                      >
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          activeStoreUser?._id === user._id ? 'bg-primary-200 text-primary-700' : 'bg-neutral-200 text-neutral-600'
                        }`}>
                          {user.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{user.full_name || 'Unknown'}</p>
                          <p className="text-xs opacity-75 capitalize">{user.role}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  {activeStoreUser?.role !== 'admin' && (
                    <div className="border-t border-neutral-100 px-4 py-2">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setShowLoginModal(true);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg flex items-center gap-2"
                      >
                        <LuLogIn className="w-4 h-4" />
                        Login to Another Store User
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {availableStoreUsers.length === 0 && (
            <div className="flex items-center gap-2 pl-6 border-l border-neutral-200">
              <div className="h-10 w-10 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center">
                <LuUser className="text-primary-600 w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-neutral-900">
                  {activeStoreUser?.full_name || currentUser?.full_name || 'Loading...'}
                </span>
                <span className="text-xs text-neutral-500 uppercase tracking-wider">
                  {activeStoreUser?.role || 'User'}
                </span>
              </div>
            </div>
          )}
          
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

      {/* Login to Another Store User Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-neutral-900 mb-4">Login to Another Store User</h3>
            <form onSubmit={handleLoginToStoreUser} className="space-y-4">
              {loginError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                  {loginError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => {
                  setShowLoginModal(false);
                  setLoginError('');
                  setLoginEmail('');
                  setLoginPassword('');
                }}>
                  Cancel
                </Button>
                <Button type="submit">Login</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
