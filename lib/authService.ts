// Serviço de autenticação com integração Supabase
import { User, UserRole } from '@/types/user';
import { supabase } from './supabase';

// Base de usuários para fallback (caso Supabase não esteja disponível)
const FALLBACK_USERS_DB: Array<{ username: string; password: string; role: UserRole; name: string }> = [
  {
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: 'Administrador'
  },
  {
    username: 'operador',
    password: 'operador123',
    role: 'operator',
    name: 'Operador'
  }
];

export const validateCredentials = async (username: string, password: string): Promise<User | null> => {
  try {
    // Primeiro, tentar buscar do Supabase
    const { data, error } = await (supabase.from('users') as any)
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();

    if (!error && data) {
      return {
        id: data.id || `user_${Date.now()}`,
        name: data.name || data.username,
        username: data.username,
        password: data.password,
        role: data.role as UserRole
      };
    }
  } catch (dbError) {
    console.log('📝 Banco indisponível, usando credenciais locais');
  }

  // Fallback para credenciais locais
  const user = FALLBACK_USERS_DB.find(u => u.username === username && u.password === password);
  
  if (user) {
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

export const getDefaultUsers = () => FALLBACK_USERS_DB.map(({ password, ...user }) => user);