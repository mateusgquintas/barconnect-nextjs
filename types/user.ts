export type UserRole = 'operator' | 'admin';

export interface User {
  id: string;
  name: string;
  username: string;
  password: string;
  role: UserRole;
}