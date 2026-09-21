"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "./api";

type AdminInfo = { username: string; display_name: string } | null;

type Ctx = {
  token: string | null;
  admin: AdminInfo;
  isAdmin: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AdminAuthContext = createContext<Ctx | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [admin, setAdmin] = useState<AdminInfo>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("aiml_admin_token") : null;
    if (saved) {
      setToken(saved);
      api.me(saved).then((me: any) => setAdmin(me)).catch(() => {
        localStorage.removeItem("aiml_admin_token");
        setToken(null);
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const { access_token } = await api.login(username, password);
    localStorage.setItem("aiml_admin_token", access_token);
    setToken(access_token);
    const me = await api.me(access_token);
    setAdmin(me as AdminInfo);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("aiml_admin_token");
    setToken(null);
    setAdmin(null);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ token, admin, isAdmin: !!admin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
