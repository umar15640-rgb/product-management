'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface StoreContextType {
  currentStore: any;
  currentUser: any;
  activeStoreUser: any;
  allStores: any[];
  allStoreUsers: any[];
  loggedInStoreUsers: any[]; // Store users the current user has logged into
  isLoading: boolean;
  setCurrentStore: (store: any) => void;
  setActiveStoreUser: (user: any) => void;
  refreshContext: () => void;
  addLoggedInStoreUser: (user: any) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [currentStore, setCurrentStoreState] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeStoreUser, setActiveStoreUser] = useState<any>(null);
  const [allStores, setAllStores] = useState<any[]>([]);
  const [allStoreUsers, setAllStoreUsers] = useState<any[]>([]);
  const [loggedInStoreUsers, setLoggedInStoreUsers] = useState<any[]>([]);
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
      
      // Handle both account types
      if (userData.accountType === 'store_user') {
        // Store user (employee)
        if (userData.storeUser) {
          setActiveStoreUser(userData.storeUser);
          const storedLoggedIn = localStorage.getItem('loggedInStoreUsers');
          if (storedLoggedIn) {
            try {
              const parsed = JSON.parse(storedLoggedIn);
              setLoggedInStoreUsers(parsed);
            } catch {
              setLoggedInStoreUsers([userData.storeUser]);
            }
          } else {
            setLoggedInStoreUsers([userData.storeUser]);
            localStorage.setItem('loggedInStoreUsers', JSON.stringify([userData.storeUser]));
          }
        }
      } else {
        // User account (store owner) - may have store user
        if (userData.storeUser) {
          setActiveStoreUser(userData.storeUser);
        }
      }

      // Get stores that the user has access to
      const currentStoreId = userData.storeUser?.store_id?._id || userData.storeUser?.store_id;
      if (currentStoreId) {
        const storeRes = await fetch(`/api/stores/${currentStoreId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (storeRes.ok) {
          const storeData = await storeRes.json();
          setCurrentStoreState(storeData.store);
          localStorage.setItem('currentStoreId', currentStoreId);
        }
      }

      // Fetch all stores (for users who might have access to multiple stores)
      // This will be limited by what the API returns based on store user access
      const storesRes = await fetch('/api/stores', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const storesData = await storesRes.json();
      
      if (storesData.stores && storesData.stores.length > 0) {
        setAllStores(storesData.stores);
      } else if (currentStoreId) {
        // If no stores returned but we have a current store, use it
        const storeRes = await fetch(`/api/stores/${currentStoreId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (storeRes.ok) {
          const storeData = await storeRes.json();
          setAllStores([storeData.store]);
        }
      }

      // Fetch store users for the current store
      if (currentStoreId) {
        const usersRes = await fetch(`/api/store-users?store_id=${currentStoreId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          const users = usersData.storeUsers || [];
          setAllStoreUsers(users);
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
            // Find logged in store user for this store
            const loggedInForStore = loggedInStoreUsers.find(su => 
              (su.store_id?._id || su.store_id) === store._id
            );
            if (loggedInForStore) {
              setActiveStoreUser(loggedInForStore);
            } else {
              // Find current user's profile in this store
              const myProfile = users.find((su: any) => su._id === activeStoreUser?._id);
              if (myProfile) {
                setActiveStoreUser(myProfile);
              }
            }
          })
          .catch(err => console.error('Error fetching store users:', err));
      }
      // Redirect to dashboard when switching stores
      router.push('/dashboard');
    }
  };

  const handleSetActiveStoreUser = (user: any) => {
    setActiveStoreUser(user);
    // Redirect to dashboard when switching store users
    router.push('/dashboard');
  };

  const addLoggedInStoreUser = (user: any) => {
    const updated = [...loggedInStoreUsers, user];
    setLoggedInStoreUsers(updated);
    localStorage.setItem('loggedInStoreUsers', JSON.stringify(updated));
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
      loggedInStoreUsers,
      isLoading,
      setCurrentStore: handleSetCurrentStore,
      setActiveStoreUser: handleSetActiveStoreUser,
      refreshContext: fetchContextData,
      addLoggedInStoreUser
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
