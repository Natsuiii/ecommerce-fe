"use client";

import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getMyProfile } from "@/lib/api";

type Shop = { id: string; name: string } | null;
type User = { name: string; email: string; shop: Shop } | null;

type Ctx = {
  isClient: boolean;
  isLoggedIn: boolean;
  isLoadingUser: boolean;
  user: User;
  // API
  setTokenAndLoadUser: (token: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => void;
};

const AuthCtx = React.createContext<Ctx | null>(null);
export const useAuth = () => {
  const c = React.useContext(AuthCtx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();

  const [isClient, setIsClient] = React.useState(false);
  const [token, setToken] = React.useState<string | null>(null);
  const [user, setUser] = React.useState<User>(null);
  const [isLoadingUser, setIsLoadingUser] = React.useState(false);

  // on mount: sinkron dari localStorage
  React.useEffect(() => {
    setIsClient(true);
    const t =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    setToken(t);
  }, []);

  const isLoggedIn = !!token;

  const loadUser = React.useCallback(async () => {
    const t =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!t) {
      setUser(null);
      return;
    }

    setIsLoadingUser(true);
    try {
      const res = await getMyProfile();
      const any = res as any;
      const profile = (any?.data ?? any) as User;
      setUser(profile);
    } catch {
      localStorage.removeItem("authToken");
      setUser(null);
    } finally {
      setIsLoadingUser(false);
    }
  }, []); // ← kosong, jangan [token]

  // auto load saat token berubah
  React.useEffect(() => {
    if (isLoggedIn) loadUser();
  }, [isLoggedIn, loadUser]);

  // API untuk login
  const setTokenAndLoadUser = React.useCallback(
    async (t: string) => {
      localStorage.setItem("authToken", t);
      setToken(t);
      await loadUser(); // sekarang pasti pakai token terbaru dari localStorage
      qc.invalidateQueries();
    },
    [loadUser, qc]
  );

  React.useEffect(() => {
    if (isLoggedIn) loadUser();
  }, [isLoggedIn, loadUser]);

  const refreshUser = React.useCallback(async () => {
    await loadUser();
  }, [loadUser]);

  const logout = React.useCallback(() => {
    localStorage.removeItem("authToken");
    setToken(null);
    setUser(null);
    qc.clear(); // opsional: bersihkan seluruh cache
  }, [qc]);

  const value: Ctx = {
    isClient,
    isLoggedIn,
    isLoadingUser,
    user,
    setTokenAndLoadUser,
    refreshUser,
    logout,
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
