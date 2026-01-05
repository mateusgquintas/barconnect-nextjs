'use client'

import { Trash2, ShoppingBag, Package, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Comanda } from '@/types';

import { UserRole } from '@/types/user';

// Helper para formatação de moeda
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

interface ComandaDetailProps {
  comanda: Comanda | null;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
  userRole: UserRole;
}

export function ComandaDetail({ comanda, onRemoveItem, onCheckout, userRole }: ComandaDetailProps) {
  if (!comanda) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-50 to-white p-8">
        <div className="text-center max-w-xs">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-10 h-10 text-slate-400" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Nenhuma comanda selecionada</h3>
          <p className="text-sm text-slate-500 mb-1">Selecione uma comanda existente</p>
          <p className="text-sm text-slate-500">ou crie uma nova para começar</p>
        </div>
      </div>
    );
  }

  const calculateTotal = () => {
    return comanda.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const total = calculateTotal();

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-6 py-5 border-b-2 border-blue-500 bg-gradient-to-br from-blue-50 to-white flex-shrink-0 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="w-4 h-4 text-white" aria-hidden="true" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 truncate">Comanda #{comanda.number}</h2>
            </div>
            {comanda.customerName && (
              <p className="text-sm font-medium text-slate-700 ml-10 truncate">
                👤 {comanda.customerName}
              </p>
            )}
            <p className="text-xs text-slate-500 ml-10 mt-1">
              {comanda.items.length} {comanda.items.length === 1 ? 'item' : 'itens'}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Total</p>
            <p className="text-3xl font-bold text-slate-900">{formatCurrency(total)}</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-b border-slate-200 flex-shrink-0 bg-slate-50">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Itens da Comanda</h3>
      </div>

      <div className="flex-1 overflow-y-auto px-6 min-h-0">
        {comanda.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-slate-400" aria-hidden="true" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-2">Nenhum item adicionado</h3>
            <p className="text-sm text-slate-500 max-w-xs">
              Adicione produtos do catálogo para esta comanda
            </p>
          </div>
        ) : (
          <div className="space-y-3 py-4">
            {comanda.items.map((item) => (
              <Card key={item.product.id} className="p-4 border border-slate-200 hover:shadow-md transition-shadow bg-white">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-sm font-bold text-blue-600">{item.quantity}x</span>
                      <p className="text-sm font-semibold text-slate-900 truncate">{item.product.name}</p>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">
                      {formatCurrency(item.product.price)} cada
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <p className="text-base font-bold text-slate-900">
                      {formatCurrency(item.product.price * item.quantity)}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      onClick={() => userRole === 'admin' && onRemoveItem(item.product.id)}
                      disabled={userRole !== 'admin'}
                      aria-label={`Remover ${item.product.name} da comanda`}
                      title={userRole !== 'admin' ? 'Apenas administradores podem remover itens' : `Remover ${item.product.name}`}
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {comanda.items.length > 0 && (
        <div className="p-6 border-t-2 border-slate-200 bg-gradient-to-b from-white to-slate-50 flex-shrink-0 shadow-lg">
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm text-slate-600 mb-1">
              <span>Subtotal ({comanda.items.length} {comanda.items.length === 1 ? 'item' : 'itens'})</span>
              <span className="font-semibold">{formatCurrency(total)}</span>
            </div>
          </div>
          <button
            onClick={onCheckout}
            className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 text-base"
            aria-label={`Fechar comanda número ${comanda.number} no valor de ${formatCurrency(total)}`}
          >
            <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
            <span>Fechar Comanda - {formatCurrency(total)}</span>
          </button>
        </div>
      )}
    </div>
  );
}