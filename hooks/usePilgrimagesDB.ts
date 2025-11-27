import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Pilgrimage, PilgrimageOccurrence, PilgrimageFormData } from '@/types';
import { toast } from 'sonner';

// Helpers: DB <-> App mappers
type DbPilgrimage = {
  id: string;
  name: string;
  arrival_date?: string | null; // DEPRECATED - mantido por compatibilidade
  departure_date?: string | null; // DEPRECATED - mantido por compatibilidade
  number_of_people: number;
  bus_group: string;
  contact_phone?: string | null;
  status?: 'active' | 'completed' | 'cancelled' | null;
  notes?: string | null;
};

type DbPilgrimageOccurrence = {
  id: string;
  pilgrimage_id: string;
  arrival_date: string;
  departure_date: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
};

const occurrenceFromDb = (row: DbPilgrimageOccurrence): PilgrimageOccurrence => ({
  id: row.id,
  pilgrimageId: row.pilgrimage_id,
  arrivalDate: row.arrival_date,
  departureDate: row.departure_date,
  status: row.status,
  notes: row.notes ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const occurrenceToDb = (o: Omit<PilgrimageOccurrence, 'id' | 'createdAt' | 'updatedAt'>): Omit<DbPilgrimageOccurrence, 'id' | 'created_at' | 'updated_at'> => ({
  pilgrimage_id: o.pilgrimageId,
  arrival_date: o.arrivalDate,
  departure_date: o.departureDate,
  status: o.status,
  notes: o.notes ?? null,
});

const fromDb = (row: DbPilgrimage, occurrences: DbPilgrimageOccurrence[] = []): Pilgrimage => {
  const mappedOccurrences = occurrences.map(occurrenceFromDb);
  
  return {
    id: row.id,
    name: row.name,
    numberOfPeople: row.number_of_people ?? 0,
    busGroup: row.bus_group,
    contactPhone: row.contact_phone ?? undefined,
    status: (row.status as any) ?? 'active',
    notes: row.notes ?? undefined,
    occurrences: mappedOccurrences,
    // DEPRECATED: Para compatibilidade, pegar primeira occurrence
    arrivalDate: mappedOccurrences[0]?.arrivalDate ?? row.arrival_date ?? undefined,
    departureDate: mappedOccurrences[0]?.departureDate ?? row.departure_date ?? undefined,
  };
};

const toDb = (p: Omit<Pilgrimage, 'id'> | Partial<Pilgrimage>): Partial<DbPilgrimage> => ({
  name: p.name!,
  number_of_people: p.numberOfPeople as any,
  bus_group: p.busGroup!,
  contact_phone: p.contactPhone ?? null,
  status: (p.status as any) ?? 'active',
  notes: p.notes ?? null,
  // Não salvamos mais arrival_date/departure_date na tabela principal
});

export function usePilgrimagesDB() {
  const [pilgrimages, setPilgrimages] = useState<Pilgrimage[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar todas as romarias com suas ocorrências
  const fetchPilgrimages = async () => {
    setLoading(true);
    
    // Buscar romarias
    const { data: pilgrimagesData, error: pilgrimagesError } = await supabase
      .from('pilgrimages')
      .select('*')
      .order('name', { ascending: true });
      
    if (pilgrimagesError) {
      toast.error('Erro ao buscar romarias');
      setPilgrimages([]);
      setLoading(false);
      return;
    }

    // Buscar todas as ocorrências
    const { data: occurrencesData, error: occurrencesError } = await supabase
      .from('pilgrimage_occurrences')
      .select('*')
      .order('arrival_date', { ascending: true });
      
    if (occurrencesError) {
      console.error('Erro ao buscar ocorrências:', occurrencesError);
      // Não falha se não houver ocorrências, usa array vazio
    }

    // Mapear romarias com suas ocorrências
    const pilgrimagesList = (pilgrimagesData as DbPilgrimage[] | null)?.map(p => {
      const pilgrimageOccurrences = (occurrencesData as DbPilgrimageOccurrence[] | null)
        ?.filter(o => o.pilgrimage_id === p.id) ?? [];
      return fromDb(p, pilgrimageOccurrences);
    }) ?? [];
    
    setPilgrimages(pilgrimagesList);
    setLoading(false);
  };

  // Criar nova romaria com ocorrências
  const createPilgrimage = async (pilgrimage: Omit<Pilgrimage, 'id'> | PilgrimageFormData) => {
    const payload = toDb(pilgrimage);
    
    // 1. Criar romaria
    const { data, error } = await supabase
      .from('pilgrimages')
      .insert(payload)
      .select()
      .single();
      
    if (error) {
      toast.error('Erro ao criar romaria');
      return null;
    }

    const pilgrimageId = (data as DbPilgrimage).id;

    // 2. Criar ocorrências (se fornecidas)
    if ('occurrences' in pilgrimage && pilgrimage.occurrences && pilgrimage.occurrences.length > 0) {
      const occurrencesPayload = pilgrimage.occurrences.map(o => 
        occurrenceToDb({ ...o, pilgrimageId })
      );
      
      const { error: occError } = await supabase
        .from('pilgrimage_occurrences')
        .insert(occurrencesPayload);
        
      if (occError) {
        console.error('Erro ao criar ocorrências:', occError);
        toast.error('Romaria criada, mas erro ao adicionar datas');
      }
    } else if ('arrivalDate' in pilgrimage && pilgrimage.arrivalDate && pilgrimage.departureDate) {
      // Compatibilidade: criar occurrence com datas antigas
      const { error: occError } = await supabase
        .from('pilgrimage_occurrences')
        .insert({
          pilgrimage_id: pilgrimageId,
          arrival_date: pilgrimage.arrivalDate,
          departure_date: pilgrimage.departureDate,
          status: 'scheduled',
        });
        
      if (occError) {
        console.error('Erro ao criar occurrence inicial:', occError);
      }
    }

    toast.success('Romaria criada!');
    await fetchPilgrimages();
    return pilgrimageId;
  };

  // Editar romaria
  const updatePilgrimage = async (id: string, updates: Partial<Pilgrimage> | Partial<PilgrimageFormData>) => {
    const payload = toDb(updates);
    const { error } = await supabase
      .from('pilgrimages')
      .update(payload)
      .eq('id', id);
      
    if (error) {
      toast.error('Erro ao atualizar romaria');
      return false;
    }

    // Se forneceu occurrences, atualizar também
    if ('occurrences' in updates && updates.occurrences) {
      // Por simplicidade, deletar todas e recriar
      await supabase
        .from('pilgrimage_occurrences')
        .delete()
        .eq('pilgrimage_id', id);
        
      if (updates.occurrences.length > 0) {
        const occurrencesPayload = updates.occurrences.map(o => 
          occurrenceToDb({ ...o, pilgrimageId: id })
        );
        
        const { error: occError } = await supabase
          .from('pilgrimage_occurrences')
          .insert(occurrencesPayload);
          
        if (occError) {
          console.error('Erro ao atualizar ocorrências:', occError);
          toast.error('Romaria atualizada, mas erro ao atualizar datas');
        }
      }
    } else if ('arrivalDate' in updates && updates.arrivalDate && updates.departureDate) {
      // Compatibilidade: atualizar/criar occurrence única
      const { data: existing } = await supabase
        .from('pilgrimage_occurrences')
        .select('id')
        .eq('pilgrimage_id', id)
        .limit(1)
        .single();
        
      if (existing) {
        await supabase
          .from('pilgrimage_occurrences')
          .update({
            arrival_date: updates.arrivalDate,
            departure_date: updates.departureDate,
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('pilgrimage_occurrences')
          .insert({
            pilgrimage_id: id,
            arrival_date: updates.arrivalDate,
            departure_date: updates.departureDate,
            status: 'scheduled',
          });
      }
    }

    toast.success('Romaria atualizada!');
    await fetchPilgrimages();
    return true;
  };

  // Excluir romaria (cascade deleta occurrences automaticamente)
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

  // Adicionar nova ocorrência a uma romaria existente
  const addOccurrence = async (pilgrimageId: string, occurrence: Omit<PilgrimageOccurrence, 'id' | 'pilgrimageId' | 'createdAt' | 'updatedAt'>) => {
    const payload = occurrenceToDb({ ...occurrence, pilgrimageId });
    const { error } = await supabase
      .from('pilgrimage_occurrences')
      .insert(payload);
      
    if (error) {
      toast.error('Erro ao adicionar data');
      return false;
    }
    toast.success('Data adicionada!');
    await fetchPilgrimages();
    return true;
  };

  // Remover ocorrência
  const removeOccurrence = async (occurrenceId: string) => {
    const { error } = await supabase
      .from('pilgrimage_occurrences')
      .delete()
      .eq('id', occurrenceId);
      
    if (error) {
      toast.error('Erro ao remover data');
      return false;
    }
    toast.success('Data removida!');
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
    addOccurrence,
    removeOccurrence,
  };
}
