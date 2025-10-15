'use client'

import { useState, useEffect, useRef } from 'react';
import { Comanda, OrderItem } from '@/types';
import { toast } from 'sonner';
// localComandas removido: agora tudo é Supabase
import { supabase, isSupabaseMock } from '@/lib/supabase';

export function useComandasDB() {
  const [comandas, setComandas] = useState<Comanda[]>([]);
  const [loading, setLoading] = useState(true);
  // Controle de toasts para evitar repetição no mobile
  const hasShownSourceToastRef = useRef(false);
  const lastOpenCountRef = useRef<number | null>(null);

  // Buscar comandas e seus itens do Supabase
  const fetchComandas = async () => {
    setLoading(true);
    try {
      console.log('🔍 Buscando comandas do Supabase...');
      const { data: comandasData, error } = await supabase.from('comandas').select('*').order('created_at', { ascending: false });
      if (error) {
        console.error('❌ Erro ao buscar comandas:', error);
        toast.error('Erro ao carregar comandas');
        setComandas([]);
        return;
      }
      console.log('📦 Comandas recebidas do Supabase:', comandasData?.length || 0);
      console.log('📊 Status das comandas:', comandasData?.map((c: any) => ({ id: c.id, number: c.number, status: c.status })));
      
      const openComandas = (comandasData || []).filter((row: any) => row.status === 'open');
      console.log('✅ Comandas abertas encontradas:', openComandas.length);
      
      // Mostrar uma vez a origem dos dados (Supabase real vs Mock)
      if (!hasShownSourceToastRef.current) {
        try {
          toast.info(isSupabaseMock ? 'Usando dados locais (mock)' : 'Conectado ao Supabase', { duration: 2500 });
        } catch {}
        hasShownSourceToastRef.current = true;
      }
      
      // Se não houver comandas abertas, avisar no mobile uma única vez por mudança
      const totalComandas = comandasData?.length ?? 0;
      if (openComandas.length === 0) {
        if (lastOpenCountRef.current !== 0) {
          try {
            toast.warning(totalComandas === 0 
              ? 'Nenhuma comanda encontrada no banco'
              : 'Não há comandas abertas no momento', { duration: 2500 });
          } catch {}
          lastOpenCountRef.current = 0;
        }
      } else {
        // Atualiza o contador para evitar toasts repetidos
        lastOpenCountRef.current = openComandas.length;
      }
      
      const comandas = await Promise.all(openComandas.map(async (row: any) => {
        const { data: itemsData, error: itemsError } = await supabase.from('comanda_items').select('*').eq('comanda_id', row.id);
        if (itemsError) {
          console.error('Erro ao buscar itens da comanda:', itemsError);
        }
        const items = (itemsData || []).map((it: any) => ({
          product: {
            id: it.product_id,
            name: it.product_name,
            price: Number(it.product_price),
            stock: 0,
            category: 'bar',
          },
          quantity: it.quantity,
        }));
        return {
          id: row.id,
          number: Number(row.number),
          customerName: row.customer_name ?? undefined,
          items,
          createdAt: new Date(row.created_at ?? Date.now()),
          status: row.status,
        };
      }));
      console.log('💾 Total de comandas processadas:', comandas.length);
      console.log('📋 Comandas finais:', comandas.map((c: any) => ({ number: c.number, items: c.items.length, customer: c.customerName })));
      setComandas(comandas);
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
      
      console.log('🔄 Criando comanda:', { number: num, customerName });
      
      const { data, error } = await (supabase.from('comandas') as any)
        .insert({ 
          number: num, 
          customer_name: customerName || null, 
          status: 'open' 
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erro detalhado ao criar comanda:', {
          error,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        try { toast.error(`Erro ao criar comanda: ${error.message || 'Erro desconhecido'}`); } catch {}
        return null;
      }

      console.log('✅ Comanda criada com sucesso:', data);
      await fetchComandas();
      return data?.id ?? null;
    } catch (error: any) {
      console.error('❌ Erro fatal ao criar comanda:', {
        error,
        message: error?.message,
        stack: error?.stack
      });
      try { toast.error(`Erro fatal: ${error?.message || 'Erro desconhecido'}`); } catch {}
      return null;
    }
  };

  // Adicionar item à comanda
  // Adicionar item à comanda (Supabase)
  const addItemToComanda = async (
    comandaId: string,
    productId: string,
    productName: string,
    productPrice: number
  ) => {
    try {
      console.log('🔄 Adicionando item à comanda:', { comandaId, productId, productName, productPrice });
      
      // Verifica se já existe, se sim, faz update na quantidade
      const { data: existing, error: selectError } = await supabase
        .from('comanda_items')
        .select('*')
        .eq('comanda_id', comandaId)
        .eq('product_id', productId)
        .maybeSingle();
      
      if (selectError) {
        console.error('Erro ao verificar item existente:', selectError);
        throw selectError;
      }
      
      if (existing) {
        console.log('📝 Atualizando quantidade do item existente');
        const { error: updateError } = await supabase
          .from('comanda_items')
          .update({ quantity: existing.quantity + 1 })
          .eq('id', existing.id);
        
        if (updateError) {
          console.error('Erro ao atualizar item:', updateError);
          throw updateError;
        }
      } else {
        console.log('➕ Inserindo novo item');
        const { error: insertError } = await supabase
          .from('comanda_items')
          .insert({
            comanda_id: comandaId,
            product_id: productId,
            product_name: productName,
            product_price: productPrice,
            quantity: 1
          });
        
        if (insertError) {
          console.error('Erro ao inserir item:', insertError);
          throw insertError;
        }
      }
      
      toast.success(`${productName} adicionado`);
      await fetchComandas();
      console.log('✅ Item adicionado com sucesso');
    } catch (error: any) {
      console.error('❌ Erro ao adicionar item:', error);
      toast.error(`Erro ao adicionar item: ${error.message || 'Erro desconhecido'}`);
    }
  };

  // Remover item da comanda
  // Remover item da comanda (Supabase)
  const removeItem = async (comandaId: string, productId: string) => {
    try {
      console.log('🗑️ Removendo item da comanda:', { comandaId, productId });
      
      const { error } = await supabase
        .from('comanda_items')
        .delete()
        .eq('comanda_id', comandaId)
        .eq('product_id', productId);
      
      if (error) {
        console.error('Erro ao remover item do Supabase:', error);
        throw error;
      }
      
      toast.success('Item removido');
      await fetchComandas();
      console.log('✅ Item removido com sucesso');
    } catch (error: any) {
      console.error('❌ Erro ao remover item:', error);
      toast.error(`Erro ao remover item: ${error.message || 'Erro desconhecido'}`);
    }
  };

  // Fechar comanda (usar novo processador)
  const closeComanda = async (comandaId: string, paymentMethod?: string) => {
    try {
      console.log('⚠️ ATENÇÃO: closeComanda chamado');
      // Atualizar status da comanda no Supabase
      const { error } = await (supabase.from('comandas') as any)
        .update({ status: 'closed' })
        .eq('id', comandaId);
      if (error) {
        console.error('Erro ao fechar comanda no Supabase:', error);
        toast.error('Erro ao fechar comanda no servidor');
        return;
      }
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
      // Remove a comanda do Supabase (e itens via cascade)
      const { error } = await (supabase.from('comandas') as any)
        .delete()
        .eq('id', comandaId);
      if (error) {
        console.error('Erro ao deletar comanda no Supabase:', error);
        toast.error('Erro ao deletar comanda no servidor');
        return;
      }
      await fetchComandas();
      toast.success('Comanda removida');
    } catch (error: any) {
      console.error('Erro ao deletar comanda:', error);
      toast.error('Erro ao deletar comanda');
    }
  };

  useEffect(() => {
      console.log('🚀 useComandasDB montado - iniciando busca de comandas...');
    fetchComandas();
  }, []);

  // Realtime e refetch on-focus/online (apenas quando não for mock)
  useEffect(() => {
      console.log('🔌 Configurando Realtime - isSupabaseMock:', isSupabaseMock);
    if (isSupabaseMock) return; // não assina em mock

    const refetchTimerRef = { current: null as number | null };
    
    const scheduleRefetch = (delay = 150) => {
      if (refetchTimerRef.current) clearTimeout(refetchTimerRef.current);
      refetchTimerRef.current = setTimeout(() => {
        fetchComandas();
      }, delay) as any;
    };

    // Canal Realtime
    const channel = (supabase as any).channel?.('comandas-sync');
    if (!channel) return;

    const onChange = () => {
      scheduleRefetch(150);
    };

    channel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comandas' }, onChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comanda_items' }, onChange)
      .subscribe();

    // Listeners de visibilidade e conexão
    const onVisibility = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        scheduleRefetch(0);
      }
    };
    const onOnline = () => scheduleRefetch(0);

    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', onVisibility);
      window.addEventListener('online', onOnline);
    }

    return () => {
      try { 
        (supabase as any).removeChannel?.(channel); 
      } catch (e) {
        console.warn('Erro ao remover canal Realtime:', e);
      }
      if (typeof window !== 'undefined') {
        document.removeEventListener('visibilitychange', onVisibility);
        window.removeEventListener('online', onOnline);
      }
      if (refetchTimerRef.current) clearTimeout(refetchTimerRef.current);
    };
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