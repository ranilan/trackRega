import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/entities/User';

const DemoModeContext = createContext(null);

export function DemoModeProvider({ children }) {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [realUser, setRealUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const demoUser = {
    id: 'demo_user_id',
    email: 'demo_new_user@trackrega.com',
    full_name: 'משתמש חדש',
    role: 'user',
    created_date: new Date().toISOString(),
  };

  useEffect(() => {
    loadRealUser();
  }, []);

  const loadRealUser = async () => {
    try {
      const user = await User.me();
      setRealUser(user);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDemoMode = () => {
    setIsDemoMode((prev) => !prev);
  };

  const getCurrentUser = () => (isDemoMode ? demoUser : realUser);

  const filterDataForDemo = (data, entityType) => {
    if (!isDemoMode) return data;

    if (entityType === 'categories') {
      return data.filter((item) => item.is_system === true);
    }

    return [];
  };

  if (loading) {
    return null;
  }

  return (
    <DemoModeContext.Provider
      value={{
        isDemoMode,
        toggleDemoMode,
        getCurrentUser,
        filterDataForDemo,
        realUser,
        demoUser,
        loading,
      }}
    >
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  const context = useContext(DemoModeContext);
  if (!context) {
    throw new Error('useDemoMode must be used within DemoModeProvider');
  }
  return context;
}
