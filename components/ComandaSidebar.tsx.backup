
'use client'
import { useState } from 'react';

import { X } from 'lucide-react';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Comanda } from '@/types';
import { UserRole } from '@/types/user';

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
    <div className="flex flex-col h-full bg-slate-50">
      <div className="p-4 border-b border-slate-200 flex-shrink-0">
        <h2 className="text-slate-900">Comandas Abertas</h2>
        <p className="text-sm text-slate-500">{openComandas.length} ativa(s)</p>
        <Input
          type="text"
          placeholder="Buscar por número ou cliente..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="mt-3"
          aria-label="Buscar comanda"
        />
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-3 space-y-2">
          {openComandas.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              Nenhuma comanda aberta
            </div>
          ) : (
            openComandas.map((comanda) => {
              const isSelected = selectedComandaId === comanda.id;
              const totalItems = getTotalItems(comanda);
              return (
                <Card
                  key={comanda.id}
                  tabIndex={0}
                  aria-label={`Selecionar comanda #${comanda.number}`}
                  className={`p-4 cursor-pointer transition-all relative outline-none ${
                    isSelected
                      ? 'border-2 border-blue-700 bg-blue-50 shadow-md'
                      : 'border border-slate-200 hover:border-blue-400 hover:bg-blue-50'
                  } focus:ring-2 focus:ring-blue-500`}
                  onClick={() => onSelectComanda(comanda)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') onSelectComanda(comanda);
                  }}
                >
                  {userRole === 'admin' && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onCloseComanda(comanda.id);
                      }}
                      className="absolute top-2 right-2 w-5 h-5 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
                      aria-label={`Fechar comanda #${comanda.number}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  <div className={userRole === 'admin' ? 'pr-6' : ''}>
                    <div className="flex items-baseline gap-2 mb-1">
                      <h3 className="text-slate-900">#{comanda.number}</h3>
                      <Badge className="bg-green-100 text-green-700 border-green-300 border">Aberta</Badge>
                      <span className="text-xs text-slate-500">{totalItems} item(ns)</span>
                    </div>
                    {comanda.customerName && (
                      <p className="text-sm text-slate-600 mb-1">
                        {comanda.customerName}
                      </p>
                    )}
                    {comanda.items.length > 0 && (
                      <p className="text-sm text-slate-500 mb-2">
                        {comanda.items[0].product.name}
                        {comanda.items.length > 1 && ` +${comanda.items.length - 1}`}
                      </p>
                    )}
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-500">Total</span>
                      <p className="text-slate-900">R$ {calculateTotal(comanda).toFixed(2)}</p>
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