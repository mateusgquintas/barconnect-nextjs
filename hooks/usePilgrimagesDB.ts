import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Pilgrimage } from '@/types';
import { toast } from 'sonner';

// Helpers: DB <-> App mappers
type DbPilgrimage = {
  id: string;
  name: string;
  arrival_date: string; // date
  departure_date: string; // date
  number_of_people: number;
  bus_group: string;
  contact_phone?: string | null;
  status?: 'active' | 'completed' | 'cancelled' | null;
  notes?: string | null;
};

const fromDb = (row: DbPilgrimage): Pilgrimage => ({
  id: row.id,
  name: row.name,
  arrivalDate: row.arrival_date,
  departureDate: row.departure_date,
  numberOfPeople: row.number_of_people ?? 0,
  busGroup: row.bus_group,
  contactPhone: row.contact_phone ?? undefined,
  status: (row.status as any) ?? 'active',
  notes: row.notes ?? undefined,
});

const toDb = (p: Omit<Pilgrimage, 'id'> | Partial<Pilgrimage>): Partial<DbPilgrimage> => ({
  name: p.name!,
  arrival_date: p.arrivalDate!,
  departure_date: p.departureDate!,
  number_of_people: p.numberOfPeople as any,
  bus_group: p.busGroup!,
  contact_phone: p.contactPhone ?? null,
  status: (p.status as any) ?? 'active',
  notes: p.notes ?? null,
});

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
      const list = (data as DbPilgrimage[] | null)?.map(fromDb) ?? [];
      setPilgrimages(list);
    }
    setLoading(false);
  };

  // Criar nova romaria
  const createPilgrimage = async (pilgrimage: Omit<Pilgrimage, 'id'>) => {
    const payload = toDb(pilgrimage);
    const { data, error } = await supabase
      .from('pilgrimages')
      .insert(payload)
      .select()
      .single();
    if (error) {
      toast.error('Erro ao criar romaria');
      return null;
    }
    toast.success('Romaria criada!');
    await fetchPilgrimages();
    return (data as DbPilgrimage).id;
  };

  // Editar romaria
  const updatePilgrimage = async (id: string, updates: Partial<Pilgrimage>) => {
    const payload = toDb(updates);
    const { error } = await supabase
      .from('pilgrimages')
      .update(payload)
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
