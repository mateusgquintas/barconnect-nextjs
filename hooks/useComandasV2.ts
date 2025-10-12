'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface Comanda {
  id: string;
  number: number;
  customer_name?: string;
  customer_phone?: string;
  table_number?: number;
  status: 'open' | 'closed' | 'cancelled';
  total: number;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  
  // Itens da comanda
  items?: ComandaItem[];
}

export interface ComandaItem {
  id: string;
  comanda_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
  created_at: string;
}

export interface CreateComandaInput {
  number: number;
  customer_name?: string;
  customer_phone?: string;
  table_number?: number;
}

export interface AddItemInput {
  comanda_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  quantity?: number;
}

export function useComandasV2() {
  const [comandas, setComandasList] = useState<Comanda[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar comandas ativas
  const fetchComandas = async (includeAll = false) => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('comandas')
        .select('*')
        .order('created_at', { ascending: false });

      // Por padrão, buscar apenas comandas abertas
      if (!includeAll) {
        query = query.eq('status', 'open');
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar comandas:', error);
        toast.error('Erro ao carregar comandas');
        return;
      }

      // Buscar itens para cada comanda
      const comandasWithItems = await Promise.all(
        (data || []).map(async (comanda: any) => {
          const { data: items } = await supabase
            .from('comanda_items')
            .select('*')
            .eq('comanda_id', comanda.id)
            .order('created_at', { ascending: true });

          return {
            ...comanda,
            items: items || []
          };
        })
      );

      setComandasList(comandasWithItems);
    } catch (error) {
      console.error('Erro ao buscar comandas:', error);
      toast.error('Erro ao carregar comandas');
    } finally {
      setLoading(false);
    }
  };

  // Criar nova comanda
  const createComanda = async (input: CreateComandaInput): Promise<string | null> => {
    try {
      console.log('📋 Criando comanda:', input);

      // Verificar se já existe comanda aberta com o mesmo número
      const { data: existing } = await supabase
        .from('comandas')
        .select('id')
        .eq('number', input.number)
        .eq('status', 'open')
        .single();

      if (existing) {
        toast.error(`Já existe uma comanda #${input.number} aberta`);
        return null;
      }

      const { data, error } = await supabase
        .from('comandas')
        .insert({
          number: input.number,
          customer_name: input.customer_name || null,
          customer_phone: input.customer_phone || null,
          table_number: input.table_number || null,
          status: 'open'
        })
        .select('id')
        .single();

      if (error) {
        console.error('❌ Erro ao criar comanda:', error);
        toast.error(`Erro ao criar comanda: ${error.message}`);
        return null;
      }

      console.log('✅ Comanda criada com ID:', data.id);
      toast.success(`Comanda #${input.number} criada com sucesso`);
      
      // Atualizar lista
      await fetchComandas();
      
      return data.id;
    } catch (error: any) {
      console.error('❌ Erro fatal ao criar comanda:', error);
      toast.error(`Erro interno: ${error?.message || 'Erro desconhecido'}`);
      return null;
    }
  };

  // Adicionar item à comanda
  const addItemToComanda = async (input: AddItemInput): Promise<boolean> => {
    try {
      console.log('➕ Adicionando item à comanda:', input);

      // Verificar se item já existe na comanda
      const { data: existingItem } = await supabase
        .from('comanda_items')
        .select('id, quantity')
        .eq('comanda_id', input.comanda_id)
        .eq('product_id', input.product_id)
        .single();

      if (existingItem) {
        // Atualizar quantidade se item já existe
        const newQuantity = existingItem.quantity + (input.quantity || 1);
        
        const { error } = await supabase
          .from('comanda_items')
          .update({ quantity: newQuantity })
          .eq('id', existingItem.id);

        if (error) {
          console.error('Erro ao atualizar quantidade:', error);
          toast.error('Erro ao atualizar item');
          return false;
        }

        toast.success(`Quantidade de ${input.product_name} atualizada`);
      } else {
        // Criar novo item
        const { error } = await supabase
          .from('comanda_items')
          .insert({
            comanda_id: input.comanda_id,
            product_id: input.product_id,
            product_name: input.product_name,
            product_price: input.product_price,
            quantity: input.quantity || 1
          });

        if (error) {
          console.error('Erro ao adicionar item:', error);
          toast.error('Erro ao adicionar item');
          return false;
        }

        toast.success(`${input.product_name} adicionado à comanda`);
      }

      // Atualizar lista
      await fetchComandas();
      return true;
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      toast.error('Erro interno ao adicionar item');
      return false;
    }
  };

  // Remover item da comanda
  const removeItemFromComanda = async (itemId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('comanda_items')
        .delete()
        .eq('id', itemId);

      if (error) {
        console.error('Erro ao remover item:', error);
        toast.error('Erro ao remover item');
        return false;
      }

      toast.success('Item removido da comanda');
      await fetchComandas();
      return true;
    } catch (error) {
      console.error('Erro ao remover item:', error);
      toast.error('Erro interno ao remover item');
      return false;
    }
  };

  // Atualizar quantidade de item
  const updateItemQuantity = async (itemId: string, newQuantity: number): Promise<boolean> => {
    try {
      if (newQuantity <= 0) {
        return await removeItemFromComanda(itemId);
      }

      const { error } = await supabase
        .from('comanda_items')
        .update({ quantity: newQuantity })
        .eq('id', itemId);

      if (error) {
        console.error('Erro ao atualizar quantidade:', error);
        toast.error('Erro ao atualizar quantidade');
        return false;
      }

      await fetchComandas();
      return true;
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
      return false;
    }
  };

  // Fechar comanda (status)
  const closeComanda = async (comandaId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('comandas')
        .update({ 
          status: 'closed',
          closed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', comandaId);

      if (error) {
        console.error('Erro ao fechar comanda:', error);
        toast.error('Erro ao fechar comanda');
        return false;
      }

      toast.success('Comanda fechada com sucesso');
      await fetchComandas();
      return true;
    } catch (error) {
      console.error('Erro ao fechar comanda:', error);
      return false;
    }
  };

  // Cancelar comanda
  const cancelComanda = async (comandaId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('comandas')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', comandaId);

      if (error) {
        console.error('Erro ao cancelar comanda:', error);
        toast.error('Erro ao cancelar comanda');
        return false;
      }

      toast.success('Comanda cancelada');
      await fetchComandas();
      return true;
    } catch (error) {
      console.error('Erro ao cancelar comanda:', error);
      return false;
    }
  };

  // Buscar detalhes de uma comanda específica
  const getComandaDetails = async (comandaId: string): Promise<Comanda | null> => {
    try {
      const { data: comanda, error: comandaError } = await supabase
        .from('comandas')
        .select('*')
        .eq('id', comandaId)
        .single();

      if (comandaError) {
        console.error('Erro ao buscar comanda:', comandaError);
        return null;
      }

      const { data: items, error: itemsError } = await supabase
        .from('comanda_items')
        .select('*')
        .eq('comanda_id', comandaId)
        .order('created_at', { ascending: true });

      if (itemsError) {
        console.error('Erro ao buscar itens:', itemsError);
        return { ...comanda, items: [] };
      }

      return { ...comanda, items: items || [] };
    } catch (error) {
      console.error('Erro ao buscar detalhes da comanda:', error);
      return null;
    }
  };

  // Carregar comandas na inicialização
  useEffect(() => {
    fetchComandas();
  }, []);

  return {
    comandas,
    loading,
    fetchComandas,
    createComanda,
    addItemToComanda,
    removeItemFromComanda,
    updateItemQuantity,
    closeComanda,
    cancelComanda,
    getComandaDetails,
    refetch: fetchComandas
  };
}