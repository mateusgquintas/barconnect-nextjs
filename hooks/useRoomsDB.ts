import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';

export interface Room {
  id: string;
  number: number;
  type?: string;
  status?: string;
  description?: string;
  created_at?: string;
  pilgrimage_id?: string;    // ID da romaria associada
  guest_name?: string;       // Nome do hóspede principal
  guest_cpf?: string;        // CPF do hóspede
  guest_phone?: string;      // Telefone do hóspede
  guest_email?: string;      // Email do hóspede
  check_in_date?: string;    // Data de check-in
  check_out_date?: string;   // Data de check-out
  observations?: string;     // Observações
}

export function useRoomsDB() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<PostgrestError | null>(null);

  // Fetch all rooms
  const fetchRooms = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('number', { ascending: true });
    if (error) setError(error);
    else setRooms(data || []);
    setLoading(false);
  };

  // Add a new room
  const addRoom = async (room: Omit<Room, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('rooms')
      .insert([room])
      .select();
    if (error) setError(error);
    else if (data) setRooms((prev) => [...prev, ...data]);
    return { data, error };
  };

  // Update a room
  const updateRoom = async (id: string, updates: Partial<Room>) => {
    const { data, error } = await supabase
      .from('rooms')
      .update(updates)
      .eq('id', id)
      .select();
    if (error) setError(error);
    else if (data) setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
    return { data, error };
  };

  // Delete a room
  const deleteRoom = async (id: string) => {
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', id);
    if (error) setError(error);
    else setRooms((prev) => prev.filter((r) => r.id !== id));
    return { error };
  };

  useEffect(() => {
    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    rooms,
    loading,
    error,
    fetchRooms,
    addRoom,
    updateRoom,
    deleteRoom,
  };
}
