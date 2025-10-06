'use client'

import { Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Comanda } from '@/types';

interface ComandaDetailProps {
  comanda: Comanda | null;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
}

export function ComandaDetail({ comanda, onRemoveItem, onCheckout }: ComandaDetailProps) {
  if (!comanda) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-slate-400">
          <p className="mb-2">Selecione uma comanda</p>
          <p className="text-sm">ou crie uma nova</p>
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
      <div className="px-6 py-4 border-b border-slate-200">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="text-slate-900">Comanda #{comanda.number}</h2>
            <p className="text-sm text-slate-500 mt-1">
              {comanda.customerName || (comanda.items.length > 0 ? comanda.items[0].product.name.split(' ')[0] : 'Nova')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Total</p>
            <p className="text-2xl text-slate-900">R$ {total.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-b border-slate-200">
        <h3 className="text-slate-700 mb-3">Itens da Comanda</h3>
      </div>

      <ScrollArea className="flex-1 px-6">
        {comanda.items.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <p>Nenhum item adicionado</p>
          </div>
        ) : (
          <div className="space-y-2 py-4">
            {comanda.items.map((item) => (
              <Card key={item.product.id} className="p-4 border border-slate-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-slate-600 text-sm mb-1">
                      {item.quantity}x {item.product.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-slate-900">
                      R$ {(item.product.price * item.quantity).toFixed(2)}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-red-600"
                      onClick={() => onRemoveItem(item.product.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>

      {comanda.items.length > 0 && (
        <div className="p-6 border-t border-slate-200">
          <Button 
            onClick={onCheckout}
            className="w-full h-12 bg-slate-900 hover:bg-slate-800"
          >
            Fechar Comanda - R$ {total.toFixed(2)}
          </Button>
        </div>
      )}
    </div>
  );
}