'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/user';
import { 
  loginWithEmail as svcLoginWithEmail, 
  validateCredentials, 
  signOut as svcSignOut 
} from '@/lib/authService';
import { useAuthProfile } from '@/hooks/useAuthProfile';
import { isSupabaseMock } from '@/lib/supabase';

interface AuthContextProps {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  loginWithCredentials: (username: string, password: string) => Promise<boolean>;
  loginWithEmail: (email: string) => Promise<{ sent: boolean; message?: string }>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);
  
  // Usar novo hook para gerenciar perfil via Supabase Auth
  const { profile, isAuthenticated, isLoading } = useAuthProfile();

  // Sincronizar perfil do hook com estado local
  useEffect(() => {
    if (profile && !isSupabaseMock) {
      setUser(profile);
    }
  }, [profile]);

  // Carregar usuário do localStorage (fallback para mock ou primeira carga)
  useEffect(() => {
    if (isSupabaseMock || !profile) {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (error) {
          console.error('❌ Erro ao carregar usuário do localStorage:', error);
          localStorage.removeItem('user');
        }
      }
    }
    setInitialized(true);
  }, [profile]);

  // Salvar no localStorage (útil para mock e reload rápido)
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  /**
   * Login com email/senha via Supabase Auth
   */
  async function loginWithCredentials(username: string, password: string): Promise<boolean> {
    try {
      const validated = await validateCredentials(username, password);
      if (validated) {
        setUser(validated);
        console.log('✅ Login com credenciais bem-sucedido');
        return true;
      }
      console.warn('⚠️ Credenciais inválidas');
      return false;
    } catch (error) {
      console.error('❌ Erro ao fazer login:', error);
      return false;
    }
  }

  /**
   * Login com Magic Link (email OTP)
   */
  async function loginWithEmail(email: string): Promise<{ sent: boolean; message?: string }> {
    try {
      const res = await svcLoginWithEmail(email);
      
      // Em modo mock, já loga diretamente
      if (res.user) {
        setUser(res.user);
      }
      
      return { sent: res.sent, message: res.message };
    } catch (error: any) {
      console.error('❌ Erro ao enviar magic link:', error);
      return { sent: false, message: error?.message || 'Erro ao enviar link' };
    }
  }

  /**
   * Logout
   */
  function logout() {
    setUser(null);
    svcSignOut();
    console.log('✅ Logout realizado');
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      logout, 
      loginWithCredentials, 
      loginWithEmail,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
