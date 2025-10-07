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
      const formatted = (data || []).map((comanda: any) => {
        let items = [];
        
        // PRIORIZAR localStorage (solução mais robusta)
        try {
          const comandaKey = `comanda_items_${comanda.id}`;
          const localItems = localStorage.getItem(comandaKey);
          if (localItems) {
            console.log('📋 Usando itens do localStorage para comanda:', comanda.number);
            const itensJson = JSON.parse(localItems);
            items = itensJson.map((item: any) => ({
              product: {
                id: item.product_id,
                name: item.product_name,
                price: parseFloat(item.product_price),
                stock: 999,
                category: 'unknown',
              },
              quantity: item.quantity,
            }));
          }
        } catch (e) {
          console.log('⚠️ Erro ao buscar itens do localStorage:', e);
        }

        // Se não encontrou no localStorage, tentar outras fontes
        if (items.length === 0) {
          // Tentar buscar itens da tabela comanda_items
          if (comanda.comanda_items && comanda.comanda_items.length > 0) {
            console.log('📋 Usando itens da tabela comanda_items');
            items = comanda.comanda_items.map((item: any) => ({
              product: {
                id: item.product_id || item.id,
                name: item.product_name,
                price: parseFloat(item.product_price),
                stock: 999,
                category: 'unknown',
              },
              quantity: item.quantity,
            }));
          } else if (comanda.items) {
            // Tentar buscar itens do JSON da comanda (campo items)
            try {
              console.log('📋 Usando itens do campo items da comanda');
              const itensJson = JSON.parse(comanda.items);
              items = itensJson.map((item: any) => ({
                product: {
                  id: item.product_id,
                  name: item.product_name,
                  price: parseFloat(item.product_price),
                  stock: 999,
                  category: 'unknown',
                },
                quantity: item.quantity,
              }));
            } catch (e) {
              console.log('⚠️ Erro ao parsear JSON do campo items:', e);
            }
          } else if (comanda.data) {
            // Tentar buscar itens do JSON da comanda (campo data)
            try {
              console.log('📋 Usando itens do campo data da comanda');
              const itensJson = JSON.parse(comanda.data);
              items = itensJson.map((item: any) => ({
                product: {
                  id: item.product_id,
                  name: item.product_name,
                  price: parseFloat(item.product_price),
                  stock: 999,
                  category: 'unknown',
                },
                quantity: item.quantity,
              }));
            } catch (e) {
              console.log('⚠️ Erro ao parsear JSON do campo data:', e);
            }
          }
        }

        return {
          id: comanda.id,
          number: comanda.number,
          customerName: comanda.customer_name,
          items: items,
          createdAt: new Date(comanda.created_at),
          status: comanda.status as 'open' | 'closed',
        };
      });

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

  // Adicionar item na comanda - VERSÃO NOVA E ROBUSTA
  const addItemToComanda = async (
    comandaId: string,
    productId: string,
    productName: string,
    productPrice: number
  ) => {
    console.log('� NOVA FUNÇÃO: Adicionando item à comanda:', { 
      comandaId, 
      productId, 
      productName, 
      productPrice 
    });

    try {
      // Usar localStorage diretamente como solução mais simples
      const comandaKey = `comanda_items_${comandaId}`;
      
      // Buscar itens existentes do localStorage
      let itensAtuais = [];
      try {
        const existingItems = localStorage.getItem(comandaKey);
        itensAtuais = existingItems ? JSON.parse(existingItems) : [];
      } catch (e) {
        console.log('📝 Criando nova lista de itens no localStorage');
        itensAtuais = [];
      }

      // Verificar se produto já existe nos itens
      const itemExistente = itensAtuais.find((item: any) => item.product_id === productId);
      
      if (itemExistente) {
        console.log('📈 Atualizando quantidade do item existente');
        itemExistente.quantity += 1;
      } else {
        console.log('➕ Adicionando novo item');
        itensAtuais.push({
          product_id: productId,
          product_name: productName,
          product_price: productPrice,
          quantity: 1
        });
      }

      // Salvar no localStorage
      localStorage.setItem(comandaKey, JSON.stringify(itensAtuais));
      console.log('💾 Itens salvos no localStorage:', itensAtuais);

      console.log('✅ Item adicionado com sucesso à comanda (localStorage)');
      toast.success(`${productName} adicionado`);
      await fetchComandas();
    } catch (error: any) {
      console.error('💥 Erro na nova função:', error);
      toast.error(`Erro ao adicionar item: ${error.message || 'Erro desconhecido'}`);
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