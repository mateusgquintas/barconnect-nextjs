'use client'

import { ArrowLeft, Plus, Receipt, ShoppingBag } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Comanda } from '@/types';

// Helper para formatação de moeda
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

interface ComandasListProps {
  comandas: Comanda[];
  onBack: () => void;
  onNewComanda: () => void;
  onSelectComanda: (comanda: Comanda) => void;
}

export function ComandasList({ comandas, onBack, onNewComanda, onSelectComanda }: ComandasListProps) {
  const openComandas = comandas.filter(c => c.status === 'open');

  const calculateTotal = (comanda: Comanda) => {
    return comanda.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4 md:p-6 flex flex-col">
      <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack} 
            aria-label="Voltar"
            className="rounded-full hover:bg-slate-200"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Comandas Abertas</h1>
            <p className="text-sm font-semibold text-slate-600 mt-0.5">{openComandas.length} {openComandas.length === 1 ? 'comanda ativa' : 'comandas ativas'}</p>
          </div>
        </div>

        <div className="mb-6">
          <Button
            onClick={onNewComanda}
            className="w-full h-14 gap-2.5 bg-blue-600 hover:bg-blue-700 text-base font-bold shadow-md hover:shadow-lg transition-all"
            aria-label="Criar nova comanda"
          >
            <Plus className="w-5 h-5" aria-hidden="true" />
            Nova Comanda
          </Button>
        </div>

        <div className="flex-1 space-y-4 pb-6 overflow-y-auto">
          {openComandas.length === 0 ? (
            <Card className="p-12 text-center border-2 border-dashed border-slate-300">
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
                  <Receipt className="w-10 h-10 text-slate-400" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Nenhuma comanda aberta</h3>
                  <p className="text-sm text-slate-600">Clique no botão acima para criar a primeira</p>
                </div>
              </div>
            </Card>
          ) : (
            openComandas.map((comanda) => (
              <Card
                key={comanda.id}
                className="p-5 md:p-6 hover:shadow-lg transition-all cursor-pointer border-2 border-slate-200 hover:border-blue-500 hover:scale-102"
                onClick={() => onSelectComanda(comanda)}
                role="button"
                tabIndex={0}
                aria-label={`Comanda número ${comanda.number}, ${comanda.items.length} ${comanda.items.length === 1 ? 'item' : 'itens'}, total ${formatCurrency(calculateTotal(comanda))}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectComanda(comanda);
                  }
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg flex-shrink-0">
                      <ShoppingBag className="w-7 h-7 text-white" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Comanda #{comanda.number}</h3>
                      <p className="text-sm font-semibold text-slate-600 mt-0.5">{comanda.items.length} {comanda.items.length === 1 ? 'item' : 'itens'}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl md:text-3xl font-bold text-slate-900">{formatCurrency(calculateTotal(comanda))}</p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}