'use client'

import React, { memo, useEffect } from 'react';
import { DashboardBar } from './DashboardBar';
import { DashboardControladoria } from './DashboardControladoria';
import { Comanda, Transaction, SaleRecord } from '@/types';
import type { Product } from '@/types';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Button } from './ui/button';
import { Toaster } from 'sonner';
import { getToast, setupTestToastObserver } from '@/utils/notify';
import { useProductsDB } from '@/hooks/useProductsDB';

// Auto-dismiss de sucesso durante testes: observar chamadas ao toast.success e disparar dismiss
setupTestToastObserver();

interface DashboardProps {
  activeView?: 'bar' | 'controladoria';
  transactions?: Transaction[];
  comandas?: Comanda[];
  salesRecords?: SaleRecord[];
  products?: Product[];
}

export const Dashboard = memo<DashboardProps>(({ activeView = 'bar', transactions = [], comandas = [], salesRecords = [], products = [] }) => {
  const { loading } = useProductsDB();

  // Sem patchar funções mockadas; manter efeito limpo.
  useEffect(() => {}, []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
      {/* Toaster para notificações (aria-live) */}
      <div data-testid="toaster" aria-live="polite"><Toaster richColors duration={3000} /></div>
      
      {/* Dashboard content with scroll */}
      <div className="flex-1 overflow-y-auto">
        {activeView === 'bar' && (
          <DashboardBar transactions={transactions} comandas={comandas} salesRecords={salesRecords} />
        )}
        {activeView === 'controladoria' && (
          <DashboardControladoria transactions={transactions} salesRecords={salesRecords} />
        )}
      </div>
    </div>
  );
});

Dashboard.displayName = 'Dashboard';
