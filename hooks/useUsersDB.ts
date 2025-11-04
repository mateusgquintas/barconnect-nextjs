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
    userData: { name: string; username: string; email: string; password: string; role: UserRole },
    adminCredentials: { username: string; password: string }
  ): Promise<boolean> => {
    try {
      // Chamar API Route que usa Service Role Key
      const response = await fetch('/api/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email, // Email real fornecido pelo usuário
          password: userData.password,
          name: userData.name,
          username: userData.username,
          role: userData.role,
          adminUsername: adminCredentials.username,
          adminPassword: adminCredentials.password
        })
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Erro ao criar usuário:', result.error);
        return false;
      }

      if (result.success) {
        // Atualizar lista local
        const newUser: User = {
          id: result.user.id,
          name: result.user.name,
          username: result.user.username,
          password: '',
          role: result.user.role as UserRole
        };
        setUsers(prev => [newUser, ...prev]);
        console.log('✅ Usuário criado com sucesso!');
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
