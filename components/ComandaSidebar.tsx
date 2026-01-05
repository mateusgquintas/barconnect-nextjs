
'use client'
import { useState } from 'react';

import { X, Search, Package, ShoppingBag } from 'lucide-react';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { Comanda } from '@/types';
import { UserRole } from '@/types/user';

// Helper para formatação de moeda
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Skeleton para loading de comandas
function ComandaSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-3" />
      <div className="flex justify-between">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-5 w-20" />
      </div>
    </Card>
  );
}

interface ComandaSidebarProps {
  comandas: Comanda[];
  selectedComandaId: string | null;
  onSelectComanda: (comanda: Comanda) => void;
  onCloseComanda: (comandaId: string) => void;
  userRole: UserRole;
}

export function ComandaSidebar({ 
  comandas, 
  selectedComandaId, 
  onSelectComanda,
  onCloseComanda,
  userRole 
}: ComandaSidebarProps) {
  const [search, setSearch] = useState('');
  const openComandas = comandas.filter(c => c.status === 'open' && (
    !search.trim() ||
    c.number.toString().includes(search) ||
    (c.customerName && c.customerName.toLowerCase().includes(search.toLowerCase()))
  ));

  const calculateTotal = (comanda: Comanda) => {
    return comanda.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const getTotalItems = (comanda: Comanda) => {
    return comanda.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-50 to-white">
      <div className="p-4 border-b-2 border-slate-200 bg-white flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Comandas Abertas</h2>
            <p className="text-sm font-medium text-slate-600">
              <span className="text-blue-600 font-bold">{openComandas.length}</span> {openComandas.length === 1 ? 'ativa' : 'ativas'}
            </p>
          </div>
        </div>
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
          <Input
            type="text"
            placeholder="Buscar número ou cliente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-slate-50 border-slate-200 h-10"
            aria-label="Buscar comanda por número ou nome do cliente"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-3 space-y-2">
          {openComandas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Package className="w-10 h-10 text-slate-400" aria-hidden="true" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">
                {search ? 'Nenhuma comanda encontrada' : 'Nenhuma comanda aberta'}
              </h3>
              <p className="text-sm text-slate-500 max-w-xs">
                {search 
                  ? 'Tente buscar com outro termo'
                  : 'Crie uma nova comanda para começar a registrar pedidos'
                }
              </p>
            </div>
          ) : (
            openComandas.map((comanda) => {
              const isSelected = selectedComandaId === comanda.id;
              const totalItems = getTotalItems(comanda);
              const total = calculateTotal(comanda);
              return (
                <Card
                  key={comanda.id}
                  tabIndex={0}
                  aria-label={`Selecionar comanda número ${comanda.number}${comanda.customerName ? `, cliente ${comanda.customerName}` : ''}, total ${formatCurrency(total)}`}
                  className={`p-4 cursor-pointer transition-all relative outline-none ${
                    isSelected
                      ? 'border-l-4 border-l-blue-600 bg-gradient-to-r from-blue-50 to-blue-50/30 shadow-lg border-y-2 border-r-2 border-blue-200'
                      : 'border-l-4 border-l-slate-300 border border-slate-200 hover:border-l-blue-400 hover:bg-slate-50 hover:shadow-md'
                  } focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                  onClick={() => onSelectComanda(comanda)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectComanda(comanda);
                    }
                  }}
                >
                  {userRole === 'admin' && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onCloseComanda(comanda.id);
                      }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white border border-slate-200 hover:bg-red-50 hover:border-red-300 flex items-center justify-center text-slate-400 hover:text-red-600 transition-colors shadow-sm"
                      aria-label={`Fechar comanda número ${comanda.number}`}
                    >
                      <X className="w-4 h-4" aria-hidden="true" />
                    </button>
                  )}
                  <div className={userRole === 'admin' ? 'pr-8' : ''}>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="text-lg font-bold text-slate-900">#{comanda.number}</h3>
                      <Badge className="bg-green-100 text-green-700 border-green-300 border font-semibold text-xs">Aberta</Badge>
                      {totalItems > 0 && (
                        <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
                          {totalItems} {totalItems === 1 ? 'item' : 'itens'}
                        </span>
                      )}
                    </div>
                    {comanda.customerName && (
                      <p className="text-sm font-medium text-slate-700 mb-2 truncate">
                        👤 {comanda.customerName}
                      </p>
                    )}
                    {comanda.items.length > 0 && (
                      <p className="text-xs text-slate-500 mb-3 truncate">
                        {comanda.items[0].product.name}
                        {comanda.items.length > 1 && (
                          <span className="ml-1 font-semibold text-blue-600">+{comanda.items.length - 1}</span>
                        )}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                      <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Total</span>
                      <p className="text-lg font-bold text-slate-900">{formatCurrency(total)}</p>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}