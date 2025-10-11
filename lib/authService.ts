// Serviço de autenticação simplificado para desenvolvimento
import { User, UserRole } from '@/types/user';

// Base de usuários para desenvolvimento (em produção seria uma API)
const USERS_DB: Array<{ username: string; password: string; role: UserRole; name: string }> = [
  {
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: 'Administrador'
  },
  {
    username: 'operador',
    password: 'op123',
    role: 'operator',
    name: 'Operador'
  }
];

export const validateCredentials = (username: string, password: string): User | null => {
  const user = USERS_DB.find(u => u.username === username && u.password === password);
  
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

export const getDefaultUsers = () => USERS_DB.map(({ password, ...user }) => user);