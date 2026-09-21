"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, Member } from "./api";

type Ctx = {
  token: string | null;
  member: Member | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (payload: { name: string; email: string; password: string; branch?: string; year?: string }) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
};

const MemberAuthContext = createContext<Ctx | null>(null);
const KEY = "aiml_member_token";

export function MemberAuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async (t: string) => {
    try {
      const me = await api.memberMe(t);
      setMember(me);
    } catch {
      localStorage.removeItem(KEY);
      setToken(null);
      setMember(null);
    }
  }, []);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
    if (saved) {
      setToken(saved);
      loadMe(saved).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [loadMe]);

  const login = useCallback(async (email: string, password: string) => {
    const { access_token, member } = await api.memberLogin(email, password);
    localStorage.setItem(KEY, access_token);
    setToken(access_token);
    setMember(member);
  }, []);

  const signup = useCallback(async (payload: any) => {
    const { access_token, member } = await api.memberSignup(payload);
    localStorage.setItem(KEY, access_token);
    setToken(access_token);
    setMember(member);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(KEY);
    setToken(null);
    setMember(null);
  }, []);

  const refresh = useCallback(async () => {
    if (token) await loadMe(token);
  }, [token, loadMe]);

  return (
    <MemberAuthContext.Provider value={{ token, member, loading, login, signup, logout, refresh }}>
      {children}
    </MemberAuthContext.Provider>
  );
}

export function useMemberAuth() {
  const ctx = useContext(MemberAuthContext);
  if (!ctx) throw new Error("useMemberAuth must be used within MemberAuthProvider");
  return ctx;
}
