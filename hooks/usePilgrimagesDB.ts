import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Pilgrimage } from '@/types';
import { toast } from 'sonner';

export function usePilgrimagesDB() {
  const [pilgrimages, setPilgrimages] = useState<Pilgrimage[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar todas as romarias
  const fetchPilgrimages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('pilgrimages')
      .select('*')
      .order('arrival_date', { ascending: true });
    if (error) {
      toast.error('Erro ao buscar romarias');
      setPilgrimages([]);
    } else {
      setPilgrimages(data || []);
    }
    setLoading(false);
  };

  // Criar nova romaria
  const createPilgrimage = async (pilgrimage: Omit<Pilgrimage, 'id'>) => {
    const { data, error } = await supabase
      .from('pilgrimages')
      .insert(pilgrimage)
      .select()
      .single();
    if (error) {
      toast.error('Erro ao criar romaria');
      return null;
    }
    toast.success('Romaria criada!');
    await fetchPilgrimages();
    return data.id;
  };

  // Editar romaria
  const updatePilgrimage = async (id: string, updates: Partial<Pilgrimage>) => {
    const { error } = await supabase
      .from('pilgrimages')
      .update(updates)
      .eq('id', id);
    if (error) {
      toast.error('Erro ao atualizar romaria');
      return false;
    }
    toast.success('Romaria atualizada!');
    await fetchPilgrimages();
    return true;
  };

  // Excluir romaria
  const deletePilgrimage = async (id: string) => {
    const { error } = await supabase
      .from('pilgrimages')
      .delete()
      .eq('id', id);
    if (error) {
      toast.error('Erro ao excluir romaria');
      return false;
    }
    toast.success('Romaria excluída!');
    await fetchPilgrimages();
    return true;
  };

  useEffect(() => {
    fetchPilgrimages();
  }, []);

  return {
    pilgrimages,
    loading,
    fetchPilgrimages,
    createPilgrimage,
    updatePilgrimage,
    deletePilgrimage,
  };
}
