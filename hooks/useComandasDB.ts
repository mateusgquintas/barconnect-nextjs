'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Comanda } from '@/types';
import { toast } from 'sonner';

export function useComandasDB() {
  const [comandas, setComandas] = useState<Comanda[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar comandas do banco
  const fetchComandas = async () => {
    try {
      const { data, error } = await supabase
        .from('comandas')
        .select(`
          *,
          comanda_items (*)
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transformar dados do banco para formato do app
      const formatted = (data || []).map((comanda: any) => ({
        id: comanda.id,
        number: comanda.number,
        customerName: comanda.customer_name,
        items: comanda.comanda_items.map((item: any) => ({
          product: {
            id: item.product_id || item.id,
            name: item.product_name,
            price: parseFloat(item.product_price),
            stock: 999,
            category: 'unknown',
          },
          quantity: item.quantity,
        })),
        createdAt: new Date(comanda.created_at),
        status: comanda.status as 'open' | 'closed',
      }));

      setComandas(formatted);
      setLoading(false);
    } catch (error: any) {
      console.error('Erro ao buscar comandas:', error);
      toast.error('Erro ao carregar comandas');
      setLoading(false);
    }
  };

  // Criar nova comanda
  const createComanda = async (number: number, customerName?: string) => {
    try {
      const { data, error } = await supabase
        .from('comandas')
        .insert({
          number,
          customer_name: customerName,
          status: 'open'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success(`Comanda #${number} criada`);
      await fetchComandas();
      return data.id;
    } catch (error: any) {
      console.error('Erro ao criar comanda:', error);
      toast.error('Erro ao criar comanda');
      return null;
    }
  };

  // Adicionar item na comanda
  const addItemToComanda = async (
    comandaId: string,
    productId: string,
    productName: string,
    productPrice: number
  ) => {
    try {
      const { data: existing } = await supabase
        .from('comanda_items')
        .select('*')
        .eq('comanda_id', comandaId)
        .eq('product_id', productId)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('comanda_items')
          .update({ quantity: existing.quantity + 1 })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('comanda_items')
          .insert({
            comanda_id: comandaId,
            product_id: productId,
            product_name: productName,
            product_price: productPrice,
            quantity: 1
          });

        if (error) throw error;
      }

      toast.success(`${productName} adicionado`);
      await fetchComandas();
    } catch (error: any) {
      console.error('Erro ao adicionar item:', error);
      toast.error('Erro ao adicionar item');
    }
  };

  // Remover item
  const removeItem = async (comandaId: string, productId: string) => {
    try {
      const { error } = await supabase
        .from('comanda_items')
        .delete()
        .eq('comanda_id', comandaId)
        .eq('product_id', productId);

      if (error) throw error;

      toast.success('Item removido');
      await fetchComandas();
    } catch (error: any) {
      console.error('Erro ao remover item:', error);
      toast.error('Erro ao remover item');
    }
  };

  // Fechar comanda
  const closeComanda = async (comandaId: string) => {
    try {
      const { error } = await supabase
        .from('comandas')
        .update({
          status: 'closed',
          closed_at: new Date().toISOString()
        })
        .eq('id', comandaId);

      if (error) throw error;

      toast.success('Comanda finalizada');
      await fetchComandas();
    } catch (error: any) {
      console.error('Erro ao fechar comanda:', error);
      toast.error('Erro ao fechar comanda');
    }
  };

  // Deletar comanda
  const deleteComanda = async (comandaId: string) => {
    try {
      const { error } = await supabase
        .from('comandas')
        .delete()
        .eq('id', comandaId);

      if (error) throw error;

      toast.success('Comanda removida');
      await fetchComandas();
    } catch (error: any) {
      console.error('Erro ao deletar comanda:', error);
      toast.error('Erro ao deletar comanda');
    }
  };

  useEffect(() => {
    fetchComandas();
  }, []);

  return {
    comandas,
    loading,
    createComanda,
    addItemToComanda,
    removeItem,
    closeComanda,
    deleteComanda,
    refetch: fetchComandas,
  };
}