'use client'

import { X } from 'lucide-react';
import { Card } from './ui/card';
import { Comanda } from '@/types';
import { ScrollArea } from './ui/scroll-area';
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
  const openComandas = comandas.filter(c => c.status === 'open');

  const calculateTotal = (comanda: Comanda) => {
    return comanda.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const getTotalItems = (comanda: Comanda) => {
    return comanda.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col">
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-slate-900">Comandas Abertas</h2>
        <p className="text-sm text-slate-500">{openComandas.length} ativa(s)</p>
      </div>

      <ScrollArea className="flex-1">
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
                  className={`p-4 cursor-pointer transition-all relative ${
                    isSelected 
                      ? 'border-2 border-slate-900 bg-white shadow-md' 
                      : 'border border-slate-200 hover:border-slate-400 bg-white'
                  }`}
                  onClick={() => onSelectComanda(comanda)}
                >
                  {userRole === 'admin' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCloseComanda(comanda.id);
                      }}
                      className="absolute top-2 right-2 w-5 h-5 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  
                  <div className={userRole === 'admin' ? 'pr-6' : ''}>
                    <div className="flex items-baseline gap-2 mb-1">
                      <h3 className="text-slate-900">#{comanda.number}</h3>
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
      </ScrollArea>
    </div>
  );
}