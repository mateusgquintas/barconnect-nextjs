'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestDB() {
  const [products, setProducts] = useState<any[]>([]);
  const [comandas, setComandas] = useState<any[]>([]);
  const [comandaItems, setComandaItems] = useState<any[]>([]);
  const [tableInfo, setTableInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  // Limpeza local
  const handleClearLocal = () => {
    if (typeof window !== 'undefined') {
      try {
        // Importa função utilitária
        // @ts-ignore
        const { clearLocalSalesAndComandas } = require('@/lib/salesService');
        clearLocalSalesAndComandas();
        alert('Registros locais (vendas e comandas) limpos!');
      } catch (e) {
        alert('Erro ao limpar localStorage: ' + e);
      }
    }
  };

  // Limpeza completa para resolver problemas de duplicação
  const handleClearAllLocal = () => {
    if (typeof window !== 'undefined') {
      try {
        // Limpar todos os dados relacionados ao sistema
        const keysToRemove = [
          'sales_records',
          'transactions_pending',
          // Comandas
          ...Object.keys(localStorage).filter(k => k.startsWith('comanda_items_')),
          // Outros dados cache
          ...Object.keys(localStorage).filter(k => k.includes('cache'))
        ];
        
        keysToRemove.forEach(key => {
          try {
            localStorage.removeItem(key);
          } catch (e) {
            console.warn(`Erro ao remover ${key}:`, e);
          }
        });
        
        alert(`Limpeza completa realizada! Removidas ${keysToRemove.length} chaves do localStorage.`);
        window.location.reload(); // Recarregar para garantir estado limpo
      } catch (e) {
        alert('Erro na limpeza completa: ' + e);
      }
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        // Testar products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .limit(3);

        if (productsError) throw productsError;
        setProducts(productsData || []);

        // Testar comandas
        const { data: comandasData, error: comandasError } = await supabase
          .from('comandas')
          .select('*')
          .limit(3);

        if (comandasError) throw comandasError;
        setComandas(comandasData || []);

        // Testar comanda_items
        const { data: itemsData, error: itemsError } = await supabase
          .from('comanda_items')
          .select('*')
          .limit(3);

        if (itemsError) {
          console.error('Erro ao buscar comanda_items:', itemsError);
          setError(`Erro na tabela comanda_items: ${itemsError.message}`);
        } else {
          setComandaItems(itemsData || []);
        }

        // Tentar inserir um item de teste
        console.log('🧪 Testando inserção na tabela comanda_items...');
        
        // Testar estrutura da tabela comanda_items
        const testComandaId = comandasData?.[0]?.id;
        const testProductId = productsData?.[0]?.id;
        
        if (testComandaId && testProductId) {
          console.log('🔬 Tentando inserção de teste...', { testComandaId, testProductId });
          
          const testItem = {
            comanda_id: testComandaId,
            product_id: testProductId,
            product_name: productsData[0].name,
            product_price: productsData[0].price,
            quantity: 1
          };
          
          const { data: testResult, error: testError } = await supabase
            .from('comanda_items')
            .insert(testItem)
            .select();
            
          if (testError) {
            console.error('❌ Erro na inserção de teste:', testError);
            console.error('📝 Detalhes do erro:', JSON.stringify(testError, null, 2));
            
            // Tentar descobrir a estrutura da tabela
            const { data: tableInfo, error: describeError } = await supabase
              .from('comanda_items')
              .select('*')
              .limit(0);
              
            console.log('📊 Info da tabela:', { tableInfo, describeError });
          } else {
            console.log('✅ Inserção de teste bem-sucedida:', testResult);
            
            // Limpar o item de teste
            if (testResult?.[0]?.id) {
              await supabase
                .from('comanda_items')
                .delete()
                .eq('id', testResult[0].id);
              console.log('🧹 Item de teste removido');
            }
          }
        }
        
      } catch (err: any) {
        setError(err.message);
        console.error('Erro geral:', err);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="p-8">
      <div className="flex gap-4 mb-4">
        <button
          onClick={handleClearLocal}
          className="px-4 py-2 rounded bg-red-100 text-red-700 border border-red-300 hover:bg-red-200"
        >
          Limpar registros locais (vendas e comandas)
        </button>
        <button
          onClick={handleClearAllLocal}
          className="px-4 py-2 rounded bg-orange-100 text-orange-700 border border-orange-300 hover:bg-orange-200 font-semibold"
        >
          🚨 LIMPEZA COMPLETA (resolver problemas)
        </button>
      </div>
      <h1 className="text-2xl font-bold mb-4">Teste de Conexão - Supabase</h1>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          ❌ Erro: {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Products ({products.length})</h2>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(products, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Comandas ({comandas.length})</h2>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(comandas, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Comanda Items ({comandaItems.length})</h2>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(comandaItems, null, 2)}
          </pre>
        </div>
      </div>
      
      <div className="mt-6">
        <p className="text-sm text-gray-600">
          Abra o console para ver logs detalhados das operações.
        </p>
      </div>
    </div>
  );
}