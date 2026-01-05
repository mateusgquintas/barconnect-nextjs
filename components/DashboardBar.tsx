'use client'

import React, { useState, useMemo, memo, useCallback } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { logger } from '@/utils/logger';
import { TrendingUp, ShoppingCart, DollarSign, Calendar, Search, Gift, Eye, ArrowUpRight, Loader2, CreditCard, Smartphone } from 'lucide-react';
import { Comanda, Transaction, SaleRecord, PaymentMethod } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Skeleton } from './ui/skeleton';

interface DashboardBarProps {
  transactions: Transaction[];
  comandas: Comanda[];
  salesRecords: SaleRecord[];
}

// Formatador de moeda brasileira
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Skeleton Loading para cards
function CardSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="w-14 h-14 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
        </div>
      </div>
      <Skeleton className="h-4 w-28" />
    </Card>
  );
}

export function DashboardBar({ transactions, comandas, salesRecords }: DashboardBarProps) {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  const [startDate, setStartDate] = useState(firstDayOfMonth.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(lastDayOfMonth.toISOString().split('T')[0]);
  const [searchComanda, setSearchComanda] = useState('');
  const [selectedSale, setSelectedSale] = useState<SaleRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Debug logs para verificar dados
  logger.debug('📊 DashboardBar - Dados recebidos:', {
    transactions: transactions.length,
    comandas: comandas.length,
    salesRecords: salesRecords.length,
    startDate,
    endDate,
  });

  // Debug: mostrar algumas vendas para verificar formato
  if (salesRecords.length > 0) {
    logger.debug('📋 Primeiras vendas:', salesRecords.slice(0, 3).map(s => ({
      id: s.id,
      date: s.date,
      time: s.time,
      total: s.total,
      isCourtesy: s.isCourtesy
    })));
  }


  // Função robusta para converter string dd/MM/yyyy em Date
  function parseDateBR(dateStr: string): Date | null {
    if (!dateStr || typeof dateStr !== 'string') return null;
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    const [day, month, year] = parts.map(Number);
    if (!day || !month || !year) return null;
    const d = new Date(year, month - 1, day);
    return isNaN(d.getTime()) ? null : d;
  }

  // Filtrar vendas não-cortesia por período
  const salesInPeriod = salesRecords.filter(sale => {
    const saleDate = parseDateBR(sale.date);
    if (!saleDate) return false;
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return saleDate >= start && saleDate <= end && !sale.isCourtesy;
  });

  // Filtrar cortesias por período
  const courtesiesInPeriod = salesRecords.filter(sale => {
    const saleDate = parseDateBR(sale.date);
    if (!saleDate) return false;
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return saleDate >= start && saleDate <= end && sale.isCourtesy;
  });

  logger.debug('🎯 Vendas filtradas:', {
    totalSalesRecords: salesRecords.length,
    salesInPeriod: salesInPeriod.length,
    courtesiesInPeriod: courtesiesInPeriod.length,
    startDate,
    endDate
  });

  // Calcular totais
  const totalRevenue = salesInPeriod.reduce((sum, s) => sum + s.total, 0);
  const totalSales = salesInPeriod.length;
  const ticketMedio = totalSales > 0 ? totalRevenue / totalSales : 0;
  const totalCourtesy = courtesiesInPeriod.reduce((sum, s) => sum + s.total, 0);

  // Produtos mais vendidos
  const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
  salesInPeriod.forEach(sale => {
    sale.items.forEach(item => {
      if (!productSales[item.product.id]) {
        productSales[item.product.id] = {
          name: item.product.name,
          quantity: 0,
          revenue: 0,
        };
      }
      productSales[item.product.id].quantity += item.quantity;
      productSales[item.product.id].revenue += item.product.price * item.quantity;
    });
  });
  
  const topProducts = Object.values(productSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Métodos de pagamento
  const paymentMethods: Record<PaymentMethod, { count: number; total: number }> = {
  cash: { count: 0, total: 0 },
  credit: { count: 0, total: 0 },
  debit: { count: 0, total: 0 },
  pix: { count: 0, total: 0 },
  courtesy: { count: 0, total: 0 },
  };
  
  salesInPeriod.forEach(sale => {
    paymentMethods[sale.paymentMethod].count++;
    paymentMethods[sale.paymentMethod].total += sale.total;
  });

  const methodNames = {
  cash: 'Dinheiro',
  credit: 'Crédito',
  debit: 'Débito',
  pix: 'Pix',
  courtesy: 'Cortesia',
  };

  // Criar lista de vendas + comandas abertas
  const salesList = salesRecords.map(sale => ({
    id: sale.id,
    number: sale.comandaNumber || 0,
    customer: sale.customerName || null,
    total: sale.total,
    time: sale.time,
    status: 'Fechada' as const,
    saleRecord: sale,
  }));

  const comandasAbertas = comandas.map(c => {
    const total = c.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const createdTime = c.createdAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    return {
      id: c.id,
      number: c.number,
      customer: c.customerName || null,
      total: total,
      time: createdTime,
      status: 'Aberta' as const,
      saleRecord: null,
    };
  });

  // Exibir apenas vendas já consolidadas (status 'Fechada') na lista de últimas vendas
  const closedSales = salesList.sort((a, b) => {
    // Ordenar por data/hora decrescente (mais recente primeiro)
    if (a.saleRecord && b.saleRecord) {
      const aDate = new Date(`${a.saleRecord.date.split('/').reverse().join('-')}T${a.saleRecord.time}`);
      const bDate = new Date(`${b.saleRecord.date.split('/').reverse().join('-')}T${b.saleRecord.time}`);
      return bDate.getTime() - aDate.getTime();
    }
    return 0;
  });

  const filteredComandas = closedSales.filter(c => 
    searchComanda === '' || 
    c.number.toString().includes(searchComanda) ||
    (c.customer && c.customer.toLowerCase().includes(searchComanda.toLowerCase()))
  );

  return (
    <>
      {/* Placeholder de loading para testes */}
      <div data-testid="placeholder-loading" className="hidden" />
      
      <div className="flex-1 overflow-y-auto p-6 md:p-8 transition-all bg-slate-50">
        {/* Filtros de Data - Responsivo */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-slate-600" aria-hidden="true" />
            <span className="text-sm font-medium text-slate-700">Período:</span>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1">
            <div className="flex flex-col w-full sm:w-auto">
              <label htmlFor="bar-start-date" className="sr-only">Data de início do período</label>
              <Input
                id="bar-start-date"
                type="date"
                value={startDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
                className="w-full sm:w-40 h-10"
                aria-label="Data de início do período"
              />
            </div>
            <span className="text-slate-600 hidden sm:inline">até</span>
            <div className="flex flex-col w-full sm:w-auto">
              <label htmlFor="bar-end-date" className="sr-only">Data de fim do período</label>
              <Input
                id="bar-end-date"
                type="date"
                value={endDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
                className="w-full sm:w-40 h-10"
                aria-label="Data de fim do período"
              />
            </div>
          </div>
        </div>

        {/* Cards de Resumo - Responsivo com Loading */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          {isLoading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : (
            <>
              {/* Card Receita Total - Destaque */}
              <Card className="p-6 border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-green-50/30">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md">
                      <DollarSign className="w-7 h-7 text-white" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Receita Total</p>
                      <p className="text-3xl font-bold text-slate-900 mt-1">{formatCurrency(totalRevenue)}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <p className="text-sm font-medium text-green-700">Vendas confirmadas</p>
                  <ArrowUpRight className="w-4 h-4 text-green-600" aria-hidden="true" />
                </div>
              </Card>

              {/* Card Comandas */}
              <Card className="p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                      <ShoppingCart className="w-7 h-7 text-white" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Vendas</p>
                      <p className="text-3xl font-bold text-slate-900 mt-1">{totalSales}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <p className="text-sm font-medium text-blue-700">{comandasAbertas.length} comandas abertas</p>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
                    {comandasAbertas.length}
                  </span>
                </div>
              </Card>

              {/* Card Ticket Médio */}
              <Card className="p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                      <TrendingUp className="w-7 h-7 text-white" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Ticket Médio</p>
                      <p className="text-3xl font-bold text-slate-900 mt-1">{formatCurrency(ticketMedio)}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <p className="text-sm font-medium text-purple-700">Por venda</p>
                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-semibold">
                    Média
                  </span>
                </div>
              </Card>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Últimas Vendas */}
          <Card className="p-6 shadow-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <h3 className="text-lg font-bold text-slate-900">Últimas Vendas</h3>
              <div className="relative w-full sm:flex-1 sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
                <Input
                  placeholder="Buscar por número ou nome..."
                  value={searchComanda}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchComanda(e.target.value)}
                  className="pl-9 h-10"
                  aria-label="Buscar vendas"
                />
              </div>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {filteredComandas.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">Nenhuma venda encontrada</p>
              ) : (
                filteredComandas.map((comanda) => (
                  <div
                    key={comanda.id}
                    className="p-3 rounded-lg border bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 cursor-pointer transition-all"
                    onClick={() => comanda.saleRecord && setSelectedSale(comanda.saleRecord)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Ver detalhes da ${comanda.number > 0 ? `comanda ${comanda.number}` : 'venda direta'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-900">
                            {comanda.number > 0 ? `#${comanda.number}` : 'Venda Direta'}
                          </span>
                          {comanda.customer && (
                            <span className="text-sm text-slate-600 truncate">- {comanda.customer}</span>
                          )}
                          {comanda.saleRecord && (
                            <Eye className="w-4 h-4 text-slate-400 ml-auto flex-shrink-0" aria-hidden="true" />
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-xs text-slate-500">
                            {comanda.saleRecord && comanda.saleRecord.date
                              ? `${comanda.saleRecord.date} ${comanda.time}`
                              : comanda.time}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                            Fechada
                          </span>
                        </div>
                      </div>
                      <div className="text-right ml-3 flex-shrink-0">
                        <p className="font-bold text-slate-900">{formatCurrency(comanda.total)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Produtos Mais Vendidos */}
          <Card className="p-6 shadow-md">
            <h3 className="mb-4 text-lg font-bold text-slate-900">Produtos Mais Vendidos</h3>
            <div className="space-y-3">
              {topProducts.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">Nenhuma venda no período</p>
              ) : (
                topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 truncate">{product.name}</p>
                        <p className="text-xs text-slate-600 font-medium">{product.quantity} vendidos</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-slate-900 ml-3 flex-shrink-0">{formatCurrency(product.revenue)}</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Métodos de Pagamento */}
          <Card className="p-6 shadow-md">
            <h3 className="mb-4 text-lg font-bold text-slate-900">Métodos de Pagamento</h3>
            <div className="space-y-3">
              {Object.entries(paymentMethods)
                .filter(([_, data]) => data.count > 0)
                .sort(([, a], [, b]) => b.total - a.total)
                .map(([method, data]) => (
                  <div key={method} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        method === 'cash' ? 'bg-green-100' :
                        method === 'card' ? 'bg-blue-100' :
                        method === 'pix' ? 'bg-purple-100' : 'bg-slate-100'
                      }`}>
                        {method === 'cash' && <DollarSign className="w-5 h-5 text-green-600" aria-hidden="true" />}
                        {method === 'card' && <CreditCard className="w-5 h-5 text-blue-600" aria-hidden="true" />}
                        {method === 'pix' && <Smartphone className="w-5 h-5 text-purple-600" aria-hidden="true" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{methodNames[method as PaymentMethod]}</p>
                        <p className="text-xs text-slate-600 font-medium">{data.count} transações</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-slate-900 flex-shrink-0">{formatCurrency(data.total)}</p>
                  </div>
                ))
              }
              {Object.values(paymentMethods).every(m => m.count === 0) && (
                <p className="text-sm text-slate-400 text-center py-8">Nenhuma venda no período</p>
              )}
            </div>
          </Card>

          {/* Cortesias */}
          <Card className="p-6 border-l-4 border-l-purple-500 bg-gradient-to-br from-white to-purple-50/30 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                <Gift className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Cortesias</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-purple-100/50 rounded-lg border border-purple-200">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total em Cortesias</p>
                  <p className="text-3xl font-bold text-purple-700">{formatCurrency(totalCourtesy)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-600">Quantidade</p>
                  <p className="text-2xl font-bold text-slate-900">{courtesiesInPeriod.length}</p>
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                {courtesiesInPeriod.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">Nenhuma cortesia no período</p>
                ) : (
                  courtesiesInPeriod.map(courtesy => (
                    <div
                      key={courtesy.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-100 cursor-pointer hover:bg-purple-50 hover:border-purple-200 transition-all"
                      onClick={() => setSelectedSale(courtesy)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Ver detalhes da cortesia ${courtesy.isDirectSale ? 'venda direta' : `comanda ${courtesy.comandaNumber}`}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900">
                          {courtesy.isDirectSale ? 'Venda Direta' : `#${courtesy.comandaNumber}`}
                        </p>
                        <p className="text-xs text-slate-600 font-medium">{courtesy.time}</p>
                      </div>
                      <p className="text-sm font-bold text-slate-900 flex-shrink-0">{formatCurrency(courtesy.total)}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Dialog de Detalhes */}
      <Dialog open={selectedSale !== null} onOpenChange={() => setSelectedSale(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              {selectedSale?.isDirectSale ? 'Venda Direta' : `Comanda #${selectedSale?.comandaNumber}`}
            </DialogTitle>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-lg border border-slate-200">
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Data</p>
                  <p className="text-sm font-medium text-slate-900">{selectedSale.date}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Horário</p>
                  <p className="text-sm font-medium text-slate-900">{selectedSale.time}</p>
                </div>
                {selectedSale.customerName && (
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Cliente</p>
                    <p className="text-sm font-medium text-slate-900">{selectedSale.customerName}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Pagamento</p>
                  <p className="text-sm font-medium text-slate-900">{methodNames[selectedSale.paymentMethod]}</p>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-900 mb-4">Itens do Pedido</h4>
                <div className="space-y-2">
                  {selectedSale.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900">{item.product.name}</p>
                        <p className="text-xs text-slate-600 mt-1 font-medium">
                          {item.quantity}x {formatCurrency(item.product.price)}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-slate-900">
                        {formatCurrency(item.product.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-5 border-t-2 border-slate-200 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Total da Venda</h3>
                <p className="text-3xl font-bold text-slate-900">{formatCurrency(selectedSale.total)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
