'use client'

import { DashboardBar } from './DashboardBar';
import { DashboardControladoria } from './DashboardControladoria';
import { Comanda, Transaction, SaleRecord } from '@/types';

interface DashboardProps {
  activeView: 'bar' | 'controladoria';
  transactions: Transaction[];
  comandas: Comanda[];
  salesRecords: SaleRecord[];
}

export function Dashboard({ activeView, transactions, comandas, salesRecords }: DashboardProps) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
      {activeView === 'bar' && <DashboardBar transactions={transactions} comandas={comandas} salesRecords={salesRecords} />}
      {activeView === 'controladoria' && <DashboardControladoria transactions={transactions} />}
    </div>
  );
}
