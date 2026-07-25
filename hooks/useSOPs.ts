'use client'

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface SOP {
  id: string;
  title: string;
  category: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export function useSOPs() {
  const [sops, setSops] = useState<SOP[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('sops').select('*').order('category').order('title');
      if (error) throw error;
      setSops((data as SOP[]) || []);
    } catch (error: any) {
      console.error('Erro ao carregar processos:', error?.message || error);
      toast.error('Erro ao carregar processos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addSOP = async (sop: { title: string; category: string; content: string }) => {
    try {
      const { error } = await supabase.from('sops').insert([sop]);
      if (error) throw error;
      toast.success('Processo criado!');
      await fetchAll();
    } catch (error: any) {
      console.error('Erro ao criar processo:', error?.message || error);
      toast.error('Erro ao criar processo');
    }
  };

  const updateSOP = async (id: string, updates: Partial<{ title: string; category: string; content: string }>) => {
    try {
      const { error } = await supabase.from('sops').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
      toast.success('Processo atualizado!');
      await fetchAll();
    } catch (error: any) {
      console.error('Erro ao atualizar processo:', error?.message || error);
      toast.error('Erro ao atualizar processo');
    }
  };

  const deleteSOP = async (id: string) => {
    try {
      const { error } = await supabase.from('sops').delete().eq('id', id);
      if (error) throw error;
      toast.success('Processo removido!');
      await fetchAll();
    } catch (error: any) {
      console.error('Erro ao remover processo:', error?.message || error);
      toast.error('Erro ao remover processo');
    }
  };

  return { sops, loading, addSOP, updateSOP, deleteSOP, refetch: fetchAll };
}
