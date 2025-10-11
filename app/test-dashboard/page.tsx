'use client';

import { useSalesDB } from '@/hooks/useSalesDB';
import { Dashboard } from '@/components/Dashboard';
import { useComandasDB } from '@/hooks/useComandasDB';
import { useTransactionsDB } from '@/hooks/useTransactionsDB';
import { useProductsDB } from '@/hooks/useProductsDB';

export default function TestDashboard() {
  const { sales, loading } = useSalesDB();
  const { comandas } = useComandasDB();
  const { transactions } = useTransactionsDB();
  const { products } = useProductsDB();

  if (loading) {
    return <div className="p-8">Carregando...</div>;
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 bg-gray-100">
        <h1 className="text-xl font-bold">Teste Dashboard</h1>
        <p>Vendas: {sales.length} | Comandas: {comandas.length} | Transações: {transactions.length}</p>
      </div>
      
      <Dashboard
        activeView="bar"
        transactions={transactions}
        comandas={comandas}
        salesRecords={sales}
        products={products}
      />
    </div>
  );
}