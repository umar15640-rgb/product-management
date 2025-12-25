'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface StoreContextType {
  currentStore: any;
  currentUser: any;
  activeStoreUser: any;
  allStoreUsers: any[];
  isLoading: boolean;
  setActiveStoreUser: (user: any) => void;
  refreshContext: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [currentStore, setCurrentStore] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeStoreUser, setActiveStoreUser] = useState<any>(null);
  const [allStoreUsers, setAllStoreUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchContextData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const userRes = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!userRes.ok) throw new Error('Auth failed');
      const userData = await userRes.json();
      setCurrentUser(userData.user);

      const storesRes = await fetch('/api/stores', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const storesData = await storesRes.json();

      if (!storesData.stores || storesData.stores.length === 0) {
        if (typeof window !== 'undefined' && window.location.pathname !== '/setup-store') {
          window.location.href = '/setup-store';
        }
        setIsLoading(false);
        return;
      }

      if (storesData.stores && storesData.stores.length > 0) {
        const primaryStore = storesData.stores[0];
        setCurrentStore(primaryStore);

        const usersRes = await fetch(`/api/store-users?store_id=${primaryStore._id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const usersData = await usersRes.json();
        setAllStoreUsers(usersData.storeUsers || []);

        const myProfile = usersData.storeUsers?.find((su: any) => su.user_id?._id === userData.user?._id);
        
        if (!activeStoreUser) {
            setActiveStoreUser(myProfile || usersData.storeUsers?.[0]);
        }
      }
    } catch (error) {
      console.error('Error loading store context:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContextData();
  }, []);

  return (
    <StoreContext.Provider 
    value={{ 
      currentStore, 
      currentUser, 
      activeStoreUser, 
      allStoreUsers, 
      isLoading,
      setActiveStoreUser,
      refreshContext: fetchContextData
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}