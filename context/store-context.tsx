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
      if (!userRes.ok) {
        const errorData = await userRes.text();
        throw new Error(`Auth failed: ${userRes.status} - ${errorData}`);
      }
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
        const users = usersData.storeUsers || [];
        setAllStoreUsers(users);

        // Logic to determine active user (Persisted > Me > First)
        const storedActiveUserId = localStorage.getItem('activeStoreUserId');
        let selectedUser = null;

        if (storedActiveUserId) {
            selectedUser = users.find((u: any) => u._id === storedActiveUserId);
        }

        if (!selectedUser) {
            const myProfile = users.find((su: any) => su.user_id?._id === userData.user?._id);
            selectedUser = myProfile || users[0];
        }
        
        setActiveStoreUser(selectedUser);
        if (selectedUser) {
            localStorage.setItem('activeStoreUserId', selectedUser._id);
        }
      }
    } catch (error) {
      console.error('Error loading store context:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetActiveUser = (user: any) => {
    setActiveStoreUser(user);
    if (user && user._id) {
        localStorage.setItem('activeStoreUserId', user._id);
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
      setActiveStoreUser: handleSetActiveUser,
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