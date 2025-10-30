import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User, UserRole } from '@/types/user';
import { validateCredentials } from '@/lib/authService';
import bcrypt from 'bcryptjs';

export function useUsersDB() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase.from('users') as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setUsers(data.map((row: any) => ({
          id: row.id,
          name: row.name,
          username: row.username,
          password: row.password ?? '',
          role: row.role as UserRole
        })));
      }
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const createUser = async (
    userData: { name: string; username: string; password: string; role: UserRole },
    adminCredentials: { username: string; password: string }
  ): Promise<boolean> => {
    try {
      // 1. Validar credenciais de admin
      const adminUser = await validateCredentials(adminCredentials.username, adminCredentials.password);
      
      if (!adminUser || adminUser.role !== 'admin') {
        console.error('❌ Credenciais de administrador inválidas');
        return false;
      }

      // 2. Verificar se username já existe
      const { data: existing } = await (supabase.from('users') as any)
        .select('id')
        .eq('username', userData.username)
        .single();

      if (existing) {
        console.error('❌ Nome de usuário já existe');
        return false;
      }

      // 3. Fazer hash da senha antes de salvar
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // 4. Criar novo usuário com senha hasheada
      const { data, error } = await (supabase.from('users') as any)
        .insert({
          name: userData.name,
          username: userData.username,
          password: hashedPassword,
          role: userData.role
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar usuário:', error);
        return false;
      }

      if (data) {
        const newUser: User = {
          id: data.id,
          name: data.name,
          username: data.username,
          password: hashedPassword,
          role: data.role as UserRole
        };
        setUsers(prev => [newUser, ...prev]);
        return true;
      }

      return false;
    } catch (err) {
      console.error('❌ Erro ao criar usuário:', err);
      return false;
    }
  };

  const updateUser = async (
    userId: string,
    updates: Partial<Pick<User, 'name' | 'password' | 'role'>>,
    adminCredentials: { username: string; password: string }
  ): Promise<boolean> => {
    try {
      // Validar credenciais de admin
      const adminUser = await validateCredentials(adminCredentials.username, adminCredentials.password);
      
      if (!adminUser || adminUser.role !== 'admin') {
        console.error('❌ Credenciais de administrador inválidas');
        return false;
      }

      // Se estiver atualizando a senha, fazer hash
      const updatedData = { ...updates };
      if (updates.password) {
        updatedData.password = await bcrypt.hash(updates.password, 10);
      }

      const { error } = await (supabase.from('users') as any)
        .update(updatedData)
        .eq('id', userId);

      if (error) {
        console.error('❌ Erro ao atualizar usuário:', error);
        return false;
      }

      await fetchUsers();
      return true;
    } catch (err) {
      console.error('❌ Erro ao atualizar usuário:', err);
      return false;
    }
  };

  const deleteUser = async (
    userId: string,
    adminCredentials: { username: string; password: string }
  ): Promise<boolean> => {
    try {
      // Validar credenciais de admin
      const adminUser = await validateCredentials(adminCredentials.username, adminCredentials.password);
      
      if (!adminUser || adminUser.role !== 'admin') {
        console.error('❌ Credenciais de administrador inválidas');
        return false;
      }

      const { error } = await (supabase.from('users') as any)
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('❌ Erro ao deletar usuário:', error);
        return false;
      }

      setUsers(prev => prev.filter(u => u.id !== userId));
      return true;
    } catch (err) {
      console.error('❌ Erro ao deletar usuário:', err);
      return false;
    }
  };

  return {
    users,
    loading,
    createUser,
    updateUser,
    deleteUser,
    refetch: fetchUsers
  };
}
