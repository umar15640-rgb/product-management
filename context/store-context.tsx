'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface StoreContextType {
  currentStore: any;
  currentUser: any;
  activeStoreUser: any;
  allStores: any[];
  allStoreUsers: any[];
  isLoading: boolean;
  setCurrentStore: (store: any) => void;
  setActiveStoreUser: (user: any) => void;
  refreshContext: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [currentStore, setCurrentStoreState] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeStoreUser, setActiveStoreUser] = useState<any>(null);
  const [allStores, setAllStores] = useState<any[]>([]);
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

      setAllStores(storesData.stores);

      // Get current store from localStorage or use first store
      const storedStoreId = localStorage.getItem('currentStoreId');
      let selectedStore = null;

      if (storedStoreId) {
        selectedStore = storesData.stores.find((s: any) => s._id === storedStoreId);
      }

      if (!selectedStore) {
        selectedStore = storesData.stores[0];
      }

      setCurrentStoreState(selectedStore);
      if (selectedStore) {
        localStorage.setItem('currentStoreId', selectedStore._id);
      }

      // Fetch store users for the current store
      if (selectedStore) {
        const usersRes = await fetch(`/api/store-users?store_id=${selectedStore._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const usersData = await usersRes.json();
        const users = usersData.storeUsers || [];
        setAllStoreUsers(users);

        // Find the current user's store user profile
        const myProfile = users.find((su: any) => su.user_id?._id === userData.user?._id);
        if (myProfile) {
          setActiveStoreUser(myProfile);
        }
      }
    } catch (error) {
      console.error('Error loading store context:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetCurrentStore = (store: any) => {
    setCurrentStoreState(store);
    if (store && store._id) {
      localStorage.setItem('currentStoreId', store._id);
      // Refresh store users for the new store
      const token = localStorage.getItem('token');
      if (token) {
        fetch(`/api/store-users?store_id=${store._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(usersData => {
            const users = usersData.storeUsers || [];
            setAllStoreUsers(users);
            const myProfile = users.find((su: any) => su.user_id?._id === currentUser?._id);
            if (myProfile) {
              setActiveStoreUser(myProfile);
            }
          })
          .catch(err => console.error('Error fetching store users:', err));
      }
    }
  };

  const handleSetActiveStoreUser = (user: any) => {
    setActiveStoreUser(user);
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
      allStores,
      allStoreUsers, 
      isLoading,
      setCurrentStore: handleSetCurrentStore,
      setActiveStoreUser: handleSetActiveStoreUser,
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