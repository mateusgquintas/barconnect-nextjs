/**
 * Hook para gerenciar autenticação Supabase Auth + Perfil em public.users
 * 
 * Funcionalidades:
 * - Detecta sessão do Supabase Auth
 * - Busca/cria perfil em public.users vinculado a auth_user_id
 * - Escuta mudanças de autenticação (login/logout)
 * - Sincroniza papel (role) e dados do perfil
 */

import { useEffect, useState } from 'react';
import { supabase, isSupabaseMock } from '@/lib/supabase';
import { User, UserRole } from '@/types/user';

interface AuthProfile {
  session: any;
  profile: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuthProfile(): AuthProfile {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Buscar ou criar perfil em public.users vinculado ao auth_user_id
  const fetchOrCreateProfile = async (authUserId: string, email: string): Promise<User | null> => {
    try {
      // 1) Tentar buscar por auth_user_id
      const { data: existingProfile, error: fetchError } = await (supabase.from('users') as any)
        .select('*')
        .eq('auth_user_id', authUserId)
        .maybeSingle();

      if (existingProfile) {
        return {
          id: existingProfile.id,
          name: existingProfile.name || email.split('@')[0],
          username: existingProfile.username || email,
          password: existingProfile.password || '',
          role: (existingProfile.role as UserRole) || 'operator',
        };
      }

      // 2) Se não encontrou, tentar por username = email (migração)
      const { data: profileByEmail } = await (supabase.from('users') as any)
        .select('*')
        .eq('username', email)
        .maybeSingle();

      if (profileByEmail) {
        // Vincular auth_user_id ao perfil existente
        await (supabase.from('users') as any)
          .update({ auth_user_id: authUserId })
          .eq('id', profileByEmail.id);

        return {
          id: profileByEmail.id,
          name: profileByEmail.name || email.split('@')[0],
          username: profileByEmail.username || email,
          password: profileByEmail.password || '',
          role: (profileByEmail.role as UserRole) || 'operator',
        };
      }

      // 3) Criar novo perfil (padrão: operator, active)
      const newProfile = {
        username: email,
        name: email.split('@')[0] || 'Usuário',
        role: 'operator' as UserRole,
        active: true,
        password: '', // Não usamos mais senha local
        auth_user_id: authUserId,
      };

      const { data: createdProfile, error: createError } = await (supabase.from('users') as any)
        .insert(newProfile)
        .select()
        .single();

      if (createError) {
        console.error('❌ Erro ao criar perfil:', createError);
        return null;
      }

      return {
        id: createdProfile.id,
        name: createdProfile.name,
        username: createdProfile.username,
        password: '',
        role: createdProfile.role as UserRole,
      };
    } catch (error) {
      console.error('❌ Erro ao buscar/criar perfil:', error);
      return null;
    }
  };

  // Carregar sessão inicial
  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      try {
        if (isSupabaseMock) {
          // Em modo mock, não há Supabase Auth real
          setIsLoading(false);
          return;
        }

        // Buscar sessão atual
        const { data: { session: currentSession } } = await (supabase as any).auth.getSession();

        if (!mounted) return;

        if (currentSession?.user) {
          setSession(currentSession);
          
          const userProfile = await fetchOrCreateProfile(
            currentSession.user.id,
            currentSession.user.email || ''
          );
          
          if (mounted) {
            setProfile(userProfile);
          }
        }
      } catch (error) {
        console.error('❌ Erro ao carregar sessão:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadSession();

    return () => {
      mounted = false;
    };
  }, []);

  // Escutar mudanças de autenticação
  useEffect(() => {
    if (isSupabaseMock) {
      return;
    }

    const { data: { subscription } } = (supabase as any).auth.onAuthStateChange(
      async (event: string, currentSession: any) => {
        console.log('🔐 Auth event:', event);

        setSession(currentSession);

        if (event === 'SIGNED_IN' && currentSession?.user) {
          const userProfile = await fetchOrCreateProfile(
            currentSession.user.id,
            currentSession.user.email || ''
          );
          setProfile(userProfile);
        }

        if (event === 'SIGNED_OUT') {
          setProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    session,
    profile,
    isAuthenticated: !!session && !!profile,
    isLoading,
  };
}
