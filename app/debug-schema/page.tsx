'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import DebugPageWrapper from '@/components/DebugPageWrapper';

export default function DebugSchema() {
  const [schemas, setSchemas] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSchema = async () => {
      try {
        console.log('🔍 Verificando schema das tabelas...');
        
        // Tentar inserir um objeto vazio para descobrir quais campos são obrigatórios
        const testData = {};
        
        // Teste tabela sales
        const { error: salesError } = await supabase
          .from('sales')
          .insert(testData)
          .select();
        
        console.log('📊 Erro sales (mostra campos obrigatórios):', salesError);
        
        // Teste tabela sales_records  
        const { error: salesRecordsError } = await supabase
          .from('sales_records')
          .insert(testData)
          .select();
        
        console.log('📊 Erro sales_records (mostra campos obrigatórios):', salesRecordsError);

        // Tentar buscar uma linha para ver estrutura
        const { data: salesData, error: salesFetchError } = await supabase
          .from('sales')
          .select('*')
          .limit(1);
        
        const { data: salesRecordsData, error: salesRecordsFetchError } = await supabase
          .from('sales_records')
          .select('*')
          .limit(1);

        setSchemas({
          sales: {
            insertError: salesError,
            fetchError: salesFetchError,
            sampleData: salesData?.[0] || null
          },
          sales_records: {
            insertError: salesRecordsError,
            fetchError: salesRecordsFetchError,
            sampleData: salesRecordsData?.[0] || null
          }
        });
        
      } catch (err: any) {
        console.error('❌ Erro ao verificar schema:', err);
        setSchemas({ error: err.message });
      } finally {
        setLoading(false);
      }
    };

    checkSchema();
  }, []);

  if (loading) {
    return (
      <DebugPageWrapper title="Debug - Schema Supabase">
        <div className="p-8">Verificando schema...</div>
      </DebugPageWrapper>
    );
  }

  return (
    <DebugPageWrapper title="Debug - Schema Supabase">
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Debug - Schema Supabase</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Tabela 'sales'</h2>
          
          <div className="bg-gray-100 p-4 rounded mb-4">
            <h3 className="font-medium mb-2">Erro de Insert (campos obrigatórios):</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(schemas.sales?.insertError, null, 2)}
            </pre>
          </div>

          <div className="bg-blue-100 p-4 rounded mb-4">
            <h3 className="font-medium mb-2">Erro de Fetch:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(schemas.sales?.fetchError, null, 2)}
            </pre>
          </div>

          <div className="bg-green-100 p-4 rounded">
            <h3 className="font-medium mb-2">Dados de exemplo:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(schemas.sales?.sampleData, null, 2)}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Tabela 'sales_records'</h2>
          
          <div className="bg-gray-100 p-4 rounded mb-4">
            <h3 className="font-medium mb-2">Erro de Insert (campos obrigatórios):</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(schemas.sales_records?.insertError, null, 2)}
            </pre>
          </div>

          <div className="bg-blue-100 p-4 rounded mb-4">
            <h3 className="font-medium mb-2">Erro de Fetch:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(schemas.sales_records?.fetchError, null, 2)}
            </pre>
          </div>

          <div className="bg-green-100 p-4 rounded">
            <h3 className="font-medium mb-2">Dados de exemplo:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(schemas.sales_records?.sampleData, null, 2)}
            </pre>
          </div>
        </div>
      </div>
      </div>
    </DebugPageWrapper>
  );
}