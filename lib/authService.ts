/**
 * Serviço de autenticação com integração Supabase Auth
 * 
 * ESTRATÉGIA:
 * - Usar Supabase Auth (auth.users) para identidade (email/senha ou magic link)
 * - Usar public.users para perfil da aplicação (role, active, etc.)
 * - Vincular via auth_user_id (coluna em public.users)
 * 
 * FLUXO DE LOGIN:
 * 1. Autenticar via Supabase Auth (signInWithPassword ou signInWithOtp)
 * 2. Buscar/criar perfil em public.users vinculado ao auth.uid()
 * 3. Retornar User com dados do perfil (role, name, etc.)
 */

import { User, UserRole } from '@/types/user';
import { supabase, isSupabaseMock } from './supabase';
import bcrypt from 'bcryptjs';

// ⚠️ DEPRECATED: Base de usuários para fallback (modo mock apenas)
// Em produção, use SEMPRE Supabase Auth
const FALLBACK_USERS_DB: Array<{ 
  username: string; 
  email: string; 
  password: string; 
  role: UserRole; 
  name: string 
}> = [
  {
    username: 'admin',
    email: 'admin@barconnect.com',
    password: 'admin123',
    role: 'admin',
    name: 'Administrador'
  },
  {
    username: 'operador',
    email: 'operador@barconnect.com',
    password: 'operador123',
    role: 'operator',
    name: 'Operador'
  }
];

/**
 * Busca ou cria perfil em public.users vinculado ao auth_user_id
 * 
 * FLUXO:
 * 1. Buscar por auth_user_id (vínculo direto)
 * 2. Se não encontrar, buscar por username = email (migração de usuários antigos)
 * 3. Se não encontrar, criar novo perfil com role=operator
 * 
 * @param authUserId - ID do usuário no auth.users (auth.uid())
 * @param email - Email do usuário autenticado
 * @returns Perfil do usuário em public.users
 */
const ensureAppUserForCurrentAuth = async (): Promise<User | null> => {
  if (isSupabaseMock) return null;
  
  try {
    const { data: authData } = await (supabase as any).auth.getUser();
    const authUser = authData?.user;
    if (!authUser) return null;

    const email = (authUser.email || '').toLowerCase();
    const uid = authUser.id;

    // 1) Buscar por auth_user_id direto
    const { data: byAuth } = await (supabase.from('users') as any)
      .select('*')
      .eq('auth_user_id', uid)
      .maybeSingle();

    if (byAuth) {
      return {
        id: byAuth.id,
        name: byAuth.name || byAuth.username || email.split('@')[0],
        username: byAuth.username || email,
        password: byAuth.password ?? '', // ⚠️ DEPRECATED: não usar mais
        role: (byAuth.role as UserRole) || 'operator'
      };
    }

    // 2) Se não encontrado, tentar por username = email (migração)
    const { data: byEmail } = await (supabase.from('users') as any)
      .select('*')
      .eq('username', email)
      .maybeSingle();

    if (byEmail) {
      // Vincular auth_user_id ao perfil existente
      await (supabase.from('users') as any)
        .update({ auth_user_id: uid })
        .eq('id', byEmail.id);
        
      console.log('✅ Perfil migrado e vinculado ao Supabase Auth');
      
      return {
        id: byEmail.id,
        name: byEmail.name || email.split('@')[0],
        username: byEmail.username || email,
        password: byEmail.password ?? '',
        role: (byEmail.role as UserRole) || 'operator'
      };
    }

    // 3) Criar perfil novo (padrão operator e active=true)
    const newProfile = {
      username: email,
      name: email.split('@')[0] || 'Usuário',
      role: 'operator',
      active: true,
      password: '', // Não usamos mais senha local
      auth_user_id: uid
    };
    
    const { data: created, error: createError } = await (supabase.from('users') as any)
      .insert(newProfile)
      .select()
      .single();

    if (createError) {
      console.error('❌ Erro ao criar perfil:', createError);
      return null;
    }

    console.log('✅ Novo perfil criado no sistema');

    return {
      id: created.id,
      name: created.name,
      username: created.username,
      password: '',
      role: (created.role as UserRole) || 'operator'
    };
  } catch (error) {
    console.error('❌ Erro em ensureAppUserForCurrentAuth:', error);
    return null;
  }
};

/**
 * Validar credenciais (username ou email + senha) via Supabase Auth
 * 
 * PRODUÇÃO (Supabase Auth):
 * - Aceita username OU email (busca email em public.users se for username)
 * - Autentica via supabase.auth.signInWithPassword
 * - Busca/cria perfil em public.users vinculado ao auth_user_id
 * 
 * MOCK (desenvolvimento sem Supabase):
 * - Usa tabela users local ou FALLBACK_USERS_DB
 * 
 * @param username - Username ou email do usuário
 * @param password - Senha do usuário
 * @returns User com perfil completo ou null se falhar
 */
export const validateCredentials = async (username: string, password: string): Promise<User | null> => {
  // ✅ PRODUÇÃO: Usar Supabase Auth
  if (!isSupabaseMock) {
    try {
      const isEmail = username.includes('@');
      let emailToUse = username;
      
      // Se não é email, buscar email em public.users pelo username
      if (!isEmail) {
        const { data: userData, error: userError } = await (supabase.from('users') as any)
          .select('email')
          .eq('username', username)
          .maybeSingle();
        
        if (userError || !userData?.email) {
          console.warn('⚠️ Usuário não encontrado');
          return null;
        }
        
        emailToUse = userData.email;
      }

      // Autenticar via Supabase Auth
      const { data, error } = await (supabase as any).auth.signInWithPassword({
        email: emailToUse,
        password
      });

      if (error) {
        console.error('❌ Erro ao autenticar:', error.message);
        return null;
      }

      if (!data?.user) {
        console.error('❌ Usuário não retornado após login');
        return null;
      }

      // Buscar/criar perfil em public.users
      const appUser = await ensureAppUserForCurrentAuth();
      
      if (!appUser) {
        console.error('❌ Falha ao buscar/criar perfil da aplicação');
        return null;
      }

      console.log('✅ Login bem-sucedido | Role:', appUser.role);
      return appUser;
    } catch (error: any) {
      console.error('❌ Erro em validateCredentials:', error);
      return null;
    }
  }

  // ⚠️ MOCK: Manter lógica antiga (desenvolvimento sem Supabase Auth)
  try {
    // Tentar buscar por username OU email (aceita ambos!)
    const isEmail = username.includes('@');
    const { data, error } = await (supabase.from('users') as any)
      .select('*')
      .or(isEmail ? `username.eq.${username},email.eq.${username}` : `username.eq.${username}`)
      .maybeSingle();
      
    if (!error && data) {
      const isHashed = data.password?.startsWith('$2a$') || data.password?.startsWith('$2b$');
      const passwordMatch = isHashed 
        ? await bcrypt.compare(password, data.password) 
        : data.password === password;
        
      if (passwordMatch) {
        return {
          id: data.id,
          name: data.name || data.username,
          username: data.username,
          password: data.password,
          role: data.role as UserRole
        };
      }
      return null;
    }
  } catch (error) {
    console.error('❌ Erro ao buscar usuário no mock:', error);
  }

  // Fallback final (mock sem banco) - aceita username OU email
  const user = FALLBACK_USERS_DB.find(u => 
    (u.username === username || u.email === username) && u.password === password
  );
  if (user) {
    console.log('✅ Login com fallback | Role:', user.role);
    return {
      id: `user_${Date.now()}`,
      name: user.name,
      username: user.username,
      password: user.password,
      role: user.role
    };
  }
  
  return null;
};

/**
 * ⚠️ DEPRECATED: Retorna usuários do fallback (apenas para desenvolvimento)
 * Em produção, gerenciar usuários via Supabase Dashboard ou interface admin
 */
export const getDefaultUsers = () => FALLBACK_USERS_DB.map(({ password, ...user }) => user);

/**
 * Busca ou cria usuário por username (usado para compatibilidade com código antigo)
 * 
 * @deprecated Usar ensureAppUserForCurrentAuth() ao invés
 * @param username - Username ou email do usuário
 * @returns User com perfil completo
 */
export const getOrCreateUserByUsername = async (username: string): Promise<User> => {
  try {
    // Buscar na tabela de usuários da aplicação
    const { data, error } = await (supabase.from('users') as any)
      .select('*')
      .eq('username', username)
      .maybeSingle();

    if (!error && data) {
      return {
        id: data.id,
        name: data.name || username.split('@')[0] || username,
        username: data.username,
        password: data.password ?? '',
        role: (data.role as UserRole) || 'operator'
      };
    }

    // Se não existir, criar com role padrão "operator"
    const insertPayload = {
      username,
      password: '',
      name: username.split('@')[0] || username,
      role: 'operator',
      active: true
    };

    const { data: created, error: insertError } = await (supabase.from('users') as any)
      .insert(insertPayload)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Erro ao criar usuário:', insertError);
      throw insertError;
    }

    return {
      id: created.id,
      name: created.name,
      username: created.username,
      password: '',
      role: (created.role as UserRole) || 'operator'
    };
  } catch (error) {
    console.error('❌ Erro em getOrCreateUserByUsername:', error);
    // Fallback para evitar quebrar app
    return {
      id: `temp_${Date.now()}`,
      name: username.split('@')[0] || username,
      username,
      password: '',
      role: 'operator'
    };
  }
};

/**
 * Login via Link Mágico (Magic Link / OTP por e-mail)
 * 
 * PRODUÇÃO:
 * - Envia email com link mágico via supabase.auth.signInWithOtp
 * - Usuário clica no link e é autenticado automaticamente
 * - AuthContext detecta login e busca/cria perfil em public.users
 * 
 * MOCK:
 * - Cria/busca usuário e "loga" diretamente (sem email real)
 * 
 * @param email - Email do usuário
 * @returns Objeto com status do envio e mensagem
 */
export const loginWithEmail = async (email: string): Promise<{ sent: boolean; user?: User; message?: string }> => {
  if (!email || !email.includes('@')) {
    return { sent: false, message: 'E-mail inválido' };
  }

  // ⚠️ MOCK: Cria usuário local e "loga" diretamente
  if (isSupabaseMock) {
    try {
      const user = await getOrCreateUserByUsername(email);
      return { sent: true, user, message: 'Login local (mock) concluído' };
    } catch (error: any) {
      return { sent: false, message: error?.message || 'Erro ao criar usuário mock' };
    }
  }

  // ✅ PRODUÇÃO: Enviar magic link via Supabase Auth
  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : undefined;
    
    const { error } = await (supabase as any).auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: origin
      }
    });
    
    if (error) {
      console.error('❌ Erro ao enviar magic link:', error.message);
      return { sent: false, message: error.message };
    }
    
    console.log('✅ Magic link enviado com sucesso');
    return { sent: true, message: 'Enviamos um link para seu e-mail. Clique para fazer login.' };
  } catch (err: any) {
    console.error('❌ Erro em loginWithEmail:', err);
    return { sent: false, message: err?.message || 'Falha ao solicitar link mágico' };
  }
};

/**
 * Logout (desautenticar usuário)
 * 
 * Remove sessão do Supabase Auth e limpa estado local
 */
export const signOut = async () => {
  try {
    if (!isSupabaseMock && (supabase as any).auth?.signOut) {
      await (supabase as any).auth.signOut();
      console.log('✅ Logout bem-sucedido');
    }
  } catch (error) {
    console.error('❌ Erro ao fazer logout:', error);
  }
};