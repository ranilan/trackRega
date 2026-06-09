import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

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
      const user = await base44.auth.me();
      setRealUser(user);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDemoMode = () => {
    setIsDemoMode(prev => !prev);
  };

  const getCurrentUser = () => {
    return isDemoMode ? demoUser : realUser;
  };

  const filterDataForDemo = (data, entityType) => {
    if (!isDemoMode) return data;
    
    // In demo mode, show only system categories and no other data
    if (entityType === 'categories') {
      return data.filter(item => item.is_system === true);
    }
    
    // For transactions, sources, budgets - show empty
    return [];
  };

  const value = {
    isDemoMode,
    toggleDemoMode,
    getCurrentUser,
    filterDataForDemo,
    realUser,
    demoUser,
    loading,
  };

  if (loading) {
    return null; // Let the child components handle their own loading
  }

  return (
    <DemoModeContext.Provider value={value}>
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