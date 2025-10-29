'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import DebugPageWrapper from '@/components/DebugPageWrapper';

interface SupabaseCheck {
  salesTable: any[];
  salesRecordsTable: any[];
  error?: string;
}

export default function DebugSupabase() {
  const [data, setData] = useState<SupabaseCheck | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSupabase = async () => {
      try {
        console.log('🔍 Verificando tabelas no Supabase...');
        
        // Verificar tabela 'sales'
        const { data: salesData, error: salesError } = await supabase
          .from('sales')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
        
        console.log('📊 Tabela sales:', { data: salesData, error: salesError });
        
        // Verificar tabela 'sales_records'
        const { data: salesRecordsData, error: salesRecordsError } = await supabase
          .from('sales_records')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
        
        console.log('📊 Tabela sales_records:', { data: salesRecordsData, error: salesRecordsError });

        // Tentar inserir um registro de teste para ver quais campos são aceitos
        const testRecord = {
          items: JSON.stringify([{ product: { id: 'test', name: 'Test Product', price: 10 }, quantity: 1 }]),
          total: 10,
          paymentMethod: 'cash',
          date: new Date().toLocaleDateString('pt-BR'),
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          isDirectSale: true,
          isCourtesy: false,
        };

        console.log('🧪 Testando insert na tabela sales_records...');
        const { data: insertTest, error: insertError } = await supabase
          .from('sales_records')
          .insert([testRecord])
          .select();

        console.log('🧪 Resultado do teste de insert:', { data: insertTest, error: insertError });
        
        setData({
          salesTable: salesData || [],
          salesRecordsTable: salesRecordsData || [],
          error: salesError?.message || salesRecordsError?.message || insertError?.message
        });
        
      } catch (err: any) {
        console.error('❌ Erro ao verificar Supabase:', err);
        setData({
          salesTable: [],
          salesRecordsTable: [],
          error: err.message
        });
      } finally {
        setLoading(false);
      }
    };

    checkSupabase();
  }, []);

  if (loading) {
    return (
      <DebugPageWrapper title="Debug - Supabase">
        <div className="p-8">Verificando Supabase...</div>
      </DebugPageWrapper>
    );
  }

  return (
    <DebugPageWrapper title="Debug - Supabase">
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Debug - Supabase</h1>
      
      {data?.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Erro:</strong> {data.error}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Tabela 'sales'</h2>
          <p><strong>Registros encontrados:</strong> {data?.salesTable.length || 0}</p>
          
          {data?.salesTable.map((sale, index) => (
            <div key={index} className="border p-4 rounded mt-2">
              <p><strong>ID:</strong> {sale.id}</p>
              <p><strong>Data:</strong> {sale.date}</p>
              <p><strong>Hora:</strong> {sale.time}</p>
              <p><strong>Total:</strong> R$ {sale.total}</p>
              <p><strong>Pagamento:</strong> {sale.paymentMethod}</p>
              <p><strong>Items (raw):</strong> {typeof sale.items === 'string' ? sale.items.substring(0, 100) + '...' : JSON.stringify(sale.items).substring(0, 100) + '...'}</p>
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Tabela 'sales_records'</h2>
          <p><strong>Registros encontrados:</strong> {data?.salesRecordsTable.length || 0}</p>
          
          {data?.salesRecordsTable.map((sale, index) => (
            <div key={index} className="border p-4 rounded mt-2">
              <p><strong>ID:</strong> {sale.id}</p>
              <p><strong>Data:</strong> {sale.date}</p>
              <p><strong>Hora:</strong> {sale.time}</p>
              <p><strong>Total:</strong> R$ {sale.total}</p>
              <p><strong>Pagamento:</strong> {sale.paymentMethod}</p>
            </div>
          ))}
        </div>
      </div>
      </div>
    </DebugPageWrapper>
  );
}