'use client'

import { useState, useEffect } from 'react';
import { Comanda, OrderItem } from '@/types';
import { toast } from 'sonner';
import { getLocalComandas, saveLocalComandas, updateLocalComanda, deleteLocalComanda } from '@/lib/localComandas';
import { supabase } from '@/lib/supabase';

export function useComandasDB() {
  const [comandas, setComandas] = useState<Comanda[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar comandas (Supabase + fallback para itens no localStorage)
  const fetchComandas = async () => {
    try {
      // garantir que o primeiro render mantenha loading=true
      setLoading(true);

      const { data, error } = await (supabase.from('comandas') as any)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar comandas:', error);
        try { toast.error('Erro ao carregar comandas'); } catch {}
        setComandas([]);
        return;
      }

      const mapped: Comanda[] = (data || [])
        .filter((row: any) => row.status === 'open')
        .map((row: any) => {
          const key = `comanda_items_${row.id}`;
          let items: OrderItem[] = [];
          try {
            const raw = localStorage.getItem(key);
            if (raw) {
              const arr = JSON.parse(raw) as Array<{
                product_id: string;
                product_name: string;
                product_price: number | string;
                quantity: number;
              }>;
              items = arr.map((it) => ({
                product: {
                  id: it.product_id,
                  name: it.product_name,
                  price: Number(it.product_price),
                  stock: 0,
                  category: 'bar',
                },
                quantity: it.quantity,
              }));
            } else if (Array.isArray(row.comanda_items) && row.comanda_items.length) {
              items = row.comanda_items.map((it: any) => ({
                product: {
                  id: it.product_id,
                  name: it.product_name,
                  price: Number(it.product_price),
                  stock: 0,
                  category: 'bar',
                },
                quantity: it.quantity,
              }));
            }
          } catch (e) {
            console.log('⚠️ Erro ao buscar itens do localStorage:', e as any);
            items = [];
          }

          const comanda: Comanda = {
            id: row.id,
            number: Number(row.number),
            customerName: row.customer_name ?? undefined,
            items,
            createdAt: new Date(row.created_at ?? Date.now()),
            status: row.status,
          };
          return comanda;
        });

      setComandas(mapped);
    } catch (error: any) {
      console.error('Erro ao buscar comandas:', error);
      setComandas([]);
    } finally {
      setLoading(false);
    }
  };

  // Criar nova comanda
  const createComanda = async (number: number | string, customerName?: string) => {
    try {
      const num = typeof number === 'string' ? parseInt(number) : number;
      const { data, error } = await ((supabase.from('comandas') as any)
        .insert({ number: num, customer_name: customerName ?? null, status: 'open' })
        .select()
        .single());

      if (error) {
        console.error('Erro ao criar comanda:', error);
        try { toast.error('Erro ao criar comanda'); } catch {}
        return null;
      }

      try { toast.success(`Comanda #${num} criada`); } catch {}
      await fetchComandas();
      return (data as any)?.id ?? null;
    } catch (error: any) {
      console.error('Erro ao criar comanda:', error);
      try { toast.error('Erro ao criar comanda'); } catch {}
      return null;
    }
  };

  // Adicionar item à comanda
  const addItemToComanda = async (
    comandaId: string,
    productId: string,
    productName: string,
    productPrice: number
  ) => {
    try {
      console.log('➕ Adicionando item à comanda:', { comandaId, productId, productName });

      const key = `comanda_items_${comandaId}`;
      let itemsRaw: Array<{ product_id: string; product_name: string; product_price: number; quantity: number }>[] | any = [];
      try {
        const current = localStorage.getItem(key);
        itemsRaw = current ? JSON.parse(current) : [];
      } catch (e) {
        console.log('📝 Criando nova lista de itens no localStorage');
        itemsRaw = [];
      }

      const idx = itemsRaw.findIndex((it: any) => it.product_id === productId);
      if (idx >= 0) {
        itemsRaw[idx].quantity += 1;
      } else {
        itemsRaw.push({
          product_id: productId,
          product_name: productName,
          product_price: productPrice,
          quantity: 1,
        });
      }

      localStorage.setItem(key, JSON.stringify(itemsRaw));
      try { toast.success(`${productName} adicionado`); } catch {}
      await fetchComandas();
      console.log('✅ Item adicionado com sucesso');
    } catch (error: any) {
      console.error('Erro ao adicionar item:', error);
      try { toast.error('Erro ao adicionar item à comanda'); } catch {}
    }
  };

  // Remover item da comanda
  const removeItem = async (comandaId: string, productId: string) => {
    try {
      const comandas = getLocalComandas();
      const comandaIndex = comandas.findIndex(c => c.id === comandaId);
      
      if (comandaIndex === -1) return;

      const comanda = comandas[comandaIndex];
      comanda.items = comanda.items.filter(item => item.product.id !== productId);
      
      comandas[comandaIndex] = comanda;
      saveLocalComandas(comandas);
      
      await fetchComandas();
      toast.success('Item removido');
    } catch (error: any) {
      console.error('Erro ao remover item:', error);
      toast.error('Erro ao remover item');
    }
  };

  // Fechar comanda
  const closeComanda = async (comandaId: string) => {
    try {
      updateLocalComanda(comandaId, { status: 'closed' });
      await fetchComandas();
      toast.success('Comanda fechada');
    } catch (error: any) {
      console.error('Erro ao fechar comanda:', error);
      toast.error('Erro ao fechar comanda');
    }
  };

  // Deletar comanda
  const deleteComanda = async (comandaId: string) => {
    try {
      deleteLocalComanda(comandaId);
      await fetchComandas();
      toast.success('Comanda removida');
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
    refetch: fetchComandas
  };
}