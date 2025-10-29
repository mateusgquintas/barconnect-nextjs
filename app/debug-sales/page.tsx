'use client';

import { useEffect, useState } from 'react';
import { useSalesDB } from '@/hooks/useSalesDB';
import { SaleRecord } from '@/types';
import DebugPageWrapper from '@/components/DebugPageWrapper';

export default function DebugSales() {
  const { sales, loading } = useSalesDB();
  const [filteredSales, setFilteredSales] = useState<SaleRecord[]>([]);
  const [localStorageData, setLocalStorageData] = useState<any>(null);

  useEffect(() => {
    // Verificar localStorage
    try {
      const localSales = localStorage.getItem('sales_records');
      setLocalStorageData(localSales ? JSON.parse(localSales) : null);
    } catch (err) {
      console.error('Erro ao ler localStorage:', err);
    }

    if (sales.length > 0) {
      console.log('🔍 DEBUG - Total vendas:', sales.length);
      console.log('🔍 DEBUG - Vendas:', sales);
      
      const today = new Date().toLocaleDateString('pt-BR');
      console.log('🔍 DEBUG - Data de hoje:', today);
      
      const todaySales = sales.filter(sale => sale.date === today);
      console.log('🔍 DEBUG - Vendas de hoje:', todaySales);
      
      setFilteredSales(todaySales);
    }
  }, [sales]);

  if (loading) {
    return (
      <DebugPageWrapper title="Debug - Vendas">
        <div className="p-8">Carregando vendas...</div>
      </DebugPageWrapper>
    );
  }

  return (
    <DebugPageWrapper title="Debug - Vendas">
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Debug - Vendas</h1>
      
      <div className="mb-6">
        <p><strong>Total de vendas (hook):</strong> {sales.length}</p>
        <p><strong>Vendas de hoje:</strong> {filteredSales.length}</p>
        <p><strong>Data de hoje:</strong> {new Date().toLocaleDateString('pt-BR')}</p>
        <p><strong>localStorage sales_records:</strong> {localStorageData ? localStorageData.length : 'null'}</p>
      </div>

      {localStorageData && localStorageData.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-100 rounded">
          <h3 className="font-semibold">LocalStorage Sales:</h3>
          {localStorageData.slice(0, 3).map((sale: any, index: number) => (
            <div key={index} className="text-sm">
              • {sale.date} {sale.time} - R$ {sale.total} ({sale.paymentMethod})
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Todas as vendas (hook):</h2>
        {sales.length === 0 ? (
          <p className="text-gray-500">Nenhuma venda encontrada</p>
        ) : (
          sales.map((sale, index) => (
            <div key={sale.id} className="border p-4 rounded">
              <p><strong>#{index + 1}</strong></p>
              <p><strong>ID:</strong> {sale.id}</p>
              <p><strong>Data:</strong> {sale.date}</p>
              <p><strong>Hora:</strong> {sale.time}</p>
              <p><strong>Total:</strong> R$ {sale.total.toFixed(2)}</p>
              <p><strong>Pagamento:</strong> {sale.paymentMethod}</p>
              <p><strong>Cortesia:</strong> {sale.isCourtesy ? 'Sim' : 'Não'}</p>
              <p><strong>Venda Direta:</strong> {sale.isDirectSale ? 'Sim' : 'Não'}</p>
              {sale.comandaNumber && <p><strong>Comanda:</strong> #{sale.comandaNumber}</p>}
              <p><strong>Itens:</strong> {sale.items.length}</p>
            </div>
          ))
        )}
      </div>
      </div>
    </DebugPageWrapper>
  );
}