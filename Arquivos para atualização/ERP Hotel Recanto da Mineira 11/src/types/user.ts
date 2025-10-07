export type UserRole = 'operator' | 'admin';

export interface User {
  id: string;
  name: string;
  username: string;
  password: string;
  role: UserRole;
}

export const users: User[] = [
  {
    id: '1',
    name: 'Administrador',
    username: 'admin',
    password: 'admin123',
    role: 'admin'
  },
  {
    id: '2',
    name: 'Operador PDV',
    username: 'operador',
    password: 'operador123',
    role: 'operator'
  }
];