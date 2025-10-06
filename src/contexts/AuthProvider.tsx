'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMyProfile, type UserProfile } from '@/lib/api';

type AuthContextType = {
  isClient: boolean;
  token: string | null;
  isLoggedIn: boolean;
  user: UserProfile | null;
  isLoadingUser: boolean;
  login: (token: string) => void;
  logout: () => void;
  refetchUser: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();
  const [isClient, setIsClient] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // only read localStorage on client
  useEffect(() => {
    setIsClient(true);
    setToken(localStorage.getItem('authToken'));

    // sync antar tab
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'authToken') setToken(e.newValue);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const isLoggedIn = !!token;

  const { data: user, isLoading: isLoadingUser, refetch } = useQuery({
    queryKey: ['userProfile'],
    queryFn: getMyProfile,
    enabled: isClient && isLoggedIn,  
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const login = (newToken: string) => {
    localStorage.setItem('authToken', newToken);
    setToken(newToken);
    qc.removeQueries({ queryKey: ['userProfile'] });
    refetch();
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    qc.removeQueries({ queryKey: ['userProfile'] });
  };

  const value = useMemo<AuthContextType>(() => ({
    isClient,
    token,
    isLoggedIn,
    user: user ?? null,
    isLoadingUser,
    login,
    logout,
    refetchUser: refetch,
  }), [isClient, token, isLoggedIn, user, isLoadingUser, refetch]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
