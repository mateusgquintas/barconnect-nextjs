'use client'

import { useState } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { TrendingUp, ShoppingCart, DollarSign, Calendar, Search, Gift, Eye } from 'lucide-react';
import { Comanda, Transaction, SaleRecord, PaymentMethod } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface DashboardBarProps {
  transactions: Transaction[];
  comandas: Comanda[];
  salesRecords: SaleRecord[];
}

export function DashboardBar({ transactions, comandas, salesRecords }: DashboardBarProps) {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  const [startDate, setStartDate] = useState(firstDayOfMonth.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(lastDayOfMonth.toISOString().split('T')[0]);
  const [searchComanda, setSearchComanda] = useState('');
  const [selectedSale, setSelectedSale] = useState<SaleRecord | null>(null);

  // Debug logs para verificar dados
  console.log('📊 DashboardBar - Dados recebidos:', {
    transactions: transactions.length,
    comandas: comandas.length,
    salesRecords: salesRecords.length,
    startDate,
    endDate,
    todayISO: today.toISOString(),
    salesDates: salesRecords.map(s => s.date).slice(0, 5)
  });

  // Filtrar vendas não-cortesia por período
  const salesInPeriod = salesRecords.filter(sale => {
    const [day, month, year] = sale.date.split('/');
    const saleDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    return saleDate >= start && saleDate <= end && !sale.isCourtesy;
  });

  // Filtrar cortesias por período
  const courtesiesInPeriod = salesRecords.filter(sale => {
    const [day, month, year] = sale.date.split('/');
    const saleDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    return saleDate >= start && saleDate <= end && sale.isCourtesy;
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

  const allComandas = [...comandasAbertas, ...salesList].sort((a, b) => {
    // Ordenar por status (abertas primeiro) e depois por horário
    if (a.status === 'Aberta' && b.status !== 'Aberta') return -1;
    if (a.status !== 'Aberta' && b.status === 'Aberta') return 1;
    return b.time.localeCompare(a.time);
  });

  const filteredComandas = allComandas.filter(c => 
    searchComanda === '' || 
    c.number.toString().includes(searchComanda) ||
    (c.customer && c.customer.toLowerCase().includes(searchComanda.toLowerCase()))
  );

  return (
    <>
      <div className="flex-1 overflow-y-auto p-8">
        {/* Filtros de Data */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-slate-600" />
            <span className="text-sm text-slate-600">Período:</span>
          </div>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-40"
          />
          <span className="text-slate-600">até</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-40"
          />
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Receita Total</p>
                <p className="text-2xl text-slate-900">R$ {totalRevenue.toFixed(2)}</p>
              </div>
            </div>
            <p className="text-sm text-green-600">Vendas do período</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Comandas</p>
                <p className="text-2xl text-slate-900">{totalSales}</p>
              </div>
            </div>
            <p className="text-sm text-blue-600">{comandasAbertas.length} comandas abertas</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Ticket Médio</p>
                <p className="text-2xl text-slate-900">R$ {ticketMedio.toFixed(2)}</p>
              </div>
            </div>
            <p className="text-sm text-purple-600">Por venda</p>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Comandas de Hoje */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-900">Comandas de Hoje</h3>
              <div className="relative flex-1 max-w-xs ml-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Buscar por número ou nome..."
                  value={searchComanda}
                  onChange={(e) => setSearchComanda(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {filteredComandas.map((comanda) => (
                <div
                  key={comanda.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    comanda.status === 'Aberta'
                      ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                  onClick={() => comanda.saleRecord && setSelectedSale(comanda.saleRecord)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-900">
                          {comanda.number > 0 ? `#${comanda.number}` : 'Venda Direta'}
                        </span>
                        {comanda.customer && (
                          <span className="text-sm text-slate-600">- {comanda.customer}</span>
                        )}
                        {comanda.saleRecord && (
                          <Eye className="w-4 h-4 text-slate-400 ml-auto" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-slate-500">{comanda.time}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          comanda.status === 'Aberta'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {comanda.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-900">R$ {comanda.total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Produtos Mais Vendidos */}
          <Card className="p-6">
            <h3 className="mb-4 text-slate-900">Produtos Mais Vendidos</h3>
            <div className="space-y-3">
              {topProducts.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">Nenhuma venda no período</p>
              ) : (
                topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-sm text-slate-600">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm text-slate-900">{product.name}</p>
                        <p className="text-xs text-slate-500">{product.quantity} vendidos</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-900">R$ {product.revenue.toFixed(2)}</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Métodos de Pagamento */}
          <Card className="p-6">
            <h3 className="mb-4 text-slate-900">Métodos de Pagamento</h3>
            <div className="space-y-3">
              {Object.entries(paymentMethods)
                .filter(([_, data]) => data.count > 0)
                .sort(([, a], [, b]) => b.total - a.total)
                .map(([method, data]) => (
                  <div key={method} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-900">{methodNames[method as PaymentMethod]}</p>
                      <p className="text-xs text-slate-500">{data.count} transações</p>
                    </div>
                    <p className="text-sm text-slate-900">R$ {data.total.toFixed(2)}</p>
                  </div>
                ))
              }
              {Object.values(paymentMethods).every(m => m.count === 0) && (
                <p className="text-sm text-slate-400 text-center py-4">Nenhuma venda no período</p>
              )}
            </div>
          </Card>

          {/* Cortesias */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Gift className="w-5 h-5 text-purple-600" />
              <h3 className="text-slate-900">Cortesias</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div>
                  <p className="text-sm text-slate-600">Total em Cortesias</p>
                  <p className="text-2xl text-purple-600">R$ {totalCourtesy.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600">Quantidade</p>
                  <p className="text-xl text-slate-900">{courtesiesInPeriod.length}</p>
                </div>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {courtesiesInPeriod.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">Nenhuma cortesia no período</p>
                ) : (
                  courtesiesInPeriod.map(courtesy => (
                    <div
                      key={courtesy.id}
                      className="flex items-center justify-between p-2 bg-white rounded border border-purple-100 cursor-pointer hover:bg-purple-50"
                      onClick={() => setSelectedSale(courtesy)}
                    >
                      <div className="flex-1">
                        <p className="text-sm text-slate-900">
                          {courtesy.isDirectSale ? 'Venda Direta' : `#${courtesy.comandaNumber}`}
                        </p>
                        <p className="text-xs text-slate-500">{courtesy.time}</p>
                      </div>
                      <p className="text-sm text-slate-900">R$ {courtesy.total.toFixed(2)}</p>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedSale?.isDirectSale ? 'Venda Direta' : `Comanda #${selectedSale?.comandaNumber}`}
            </DialogTitle>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm text-slate-600">Data</p>
                  <p className="text-slate-900">{selectedSale.date}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Horário</p>
                  <p className="text-slate-900">{selectedSale.time}</p>
                </div>
                {selectedSale.customerName && (
                  <div>
                    <p className="text-sm text-slate-600">Cliente</p>
                    <p className="text-slate-900">{selectedSale.customerName}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-slate-600">Pagamento</p>
                  <p className="text-slate-900">{methodNames[selectedSale.paymentMethod]}</p>
                </div>
              </div>

              <div>
                <h4 className="text-slate-900 mb-3">Itens do Pedido</h4>
                <div className="space-y-2">
                  {selectedSale.items.map((item, index) => (
                    <div key={index} className="flex justify-between p-3 bg-white border border-slate-200 rounded-lg">
                      <div>
                        <p className="text-slate-900">{item.product.name}</p>
                        <p className="text-sm text-slate-500">
                          {item.quantity}x R$ {item.product.price.toFixed(2)}
                        </p>
                      </div>
                      <p className="text-slate-900">
                        R$ {(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t flex justify-between items-center">
                <h3 className="text-slate-900">Total</h3>
                <p className="text-2xl text-slate-900">R$ {selectedSale.total.toFixed(2)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
