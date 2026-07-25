'use client'

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface TeamMember {
  id: string;
  name: string;
  position: string;
  phone: string | null;
  email: string | null;
  admission_date: string | null;
  status: 'ativo' | 'inativo';
  notes: string | null;
  created_at: string;
}

export function useTeamMembers() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('team_members').select('*').order('name');
      if (error) throw error;
      setMembers((data as TeamMember[]) || []);
    } catch (error: any) {
      console.error('Erro ao carregar equipe:', error?.message || error);
      toast.error('Erro ao carregar equipe');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addMember = async (member: {
    name: string; position: string; phone?: string | null; email?: string | null;
    admission_date?: string | null; status?: 'ativo' | 'inativo'; notes?: string | null;
  }) => {
    try {
      const { error } = await supabase.from('team_members').insert([{ status: 'ativo', ...member }]);
      if (error) throw error;
      toast.success('Colaborador adicionado!');
      await fetchAll();
    } catch (error: any) {
      console.error('Erro ao adicionar colaborador:', error?.message || error);
      toast.error('Erro ao adicionar colaborador');
    }
  };

  const updateMember = async (id: string, updates: Partial<TeamMember>) => {
    try {
      const { error } = await supabase.from('team_members').update(updates).eq('id', id);
      if (error) throw error;
      toast.success('Colaborador atualizado!');
      await fetchAll();
    } catch (error: any) {
      console.error('Erro ao atualizar colaborador:', error?.message || error);
      toast.error('Erro ao atualizar colaborador');
    }
  };

  const deleteMember = async (id: string) => {
    try {
      const { error } = await supabase.from('team_members').delete().eq('id', id);
      if (error) throw error;
      toast.success('Colaborador removido!');
      await fetchAll();
    } catch (error: any) {
      console.error('Erro ao remover colaborador:', error?.message || error);
      toast.error('Erro ao remover colaborador');
    }
  };

  return { members, loading, addMember, updateMember, deleteMember, refetch: fetchAll };
}
