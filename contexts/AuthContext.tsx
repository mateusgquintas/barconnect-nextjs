'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/user';
import { loginWithEmail as svcLoginWithEmail, validateCredentials, getOrCreateUserByUsername, signOut as svcSignOut } from '@/lib/authService';
import { supabase, isSupabaseMock } from '@/lib/supabase';

interface AuthContextProps {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  loginWithCredentials: (username: string, password: string) => Promise<boolean>;
  loginWithEmail: (email: string) => Promise<{ sent: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Carregar usuário do localStorage (opcional)
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  // Integração com Supabase Auth quando disponível
  useEffect(() => {
    let unsub: any;
    (async () => {
      try {
        if (!isSupabaseMock && (supabase as any).auth?.getUser) {
          const { data } = await (supabase as any).auth.getUser();
          const email = data?.user?.email as string | undefined;
          if (email) {
            // Garante usuário de aplicação e carrega papel
            const appUser = await getOrCreateUserByUsername(email);
            setUser(appUser);
          }

          // Listener para mudanças de sessão
          unsub = (supabase as any).auth.onAuthStateChange(async (event: string, session: any) => {
            if (event === 'SIGNED_IN') {
              const email = session?.user?.email as string | undefined;
              if (email) {
                const appUser = await getOrCreateUserByUsername(email);
                setUser(appUser);
              }
            }
            if (event === 'SIGNED_OUT') {
              setUser(null);
            }
          });
        }
      } finally {
        setInitialized(true);
      }
    })();

    return () => {
      if (unsub && typeof unsub?.data?.subscription?.unsubscribe === 'function') {
        try { unsub.data.subscription.unsubscribe(); } catch {}
      }
    };
  }, []);

  async function loginWithCredentials(username: string, password: string) {
    const validated = await validateCredentials(username, password);
    if (validated) {
      setUser(validated);
      return true;
    }
    return false;
  }

  async function loginWithEmail(email: string) {
    const res = await svcLoginWithEmail(email);
    if (res.user) {
      // Ambiente mock: já loga
      setUser(res.user);
    }
    return { sent: res.sent, message: res.message };
  }

  function logout() {
    setUser(null);
    svcSignOut();
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loginWithCredentials, loginWithEmail }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
