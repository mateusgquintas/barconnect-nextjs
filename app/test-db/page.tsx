'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestDB() {
  const [products, setProducts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .limit(5);

        if (error) throw error;
        setProducts(data || []);
      } catch (err: any) {
        setError(err.message);
      }
    }

    fetchProducts();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Teste de Conexão - Supabase</h1>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          ❌ Erro: {error}
        </div>
      )}

      {products.length > 0 ? (
        <div className="bg-green-100 text-green-700 p-4 rounded">
          ✅ Conexão funcionando! {products.length} produtos encontrados:
          <ul className="mt-2">
            {products.map(p => (
              <li key={p.id}>{p.name} - R$ {p.price}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-gray-500">Carregando...</div>
      )}
    </div>
  );
}