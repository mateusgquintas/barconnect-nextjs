'use client'
import { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Minus, ShoppingCart, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { OrderItem, Product } from '@/types';
import { AddItemDialog } from './AddItemDialog';

// Helper para formatação de moeda
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

interface OrderScreenProps {
  title: string;
  items: OrderItem[];
  onBack: () => void;
  onAddItem: (product: Product, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onFinish: () => void;
  showFinishButton?: boolean;
}

export function OrderScreen({
  title,
  items,
  onBack,
  onAddItem,
  onRemoveItem,
  onUpdateQuantity,
  onFinish,
  showFinishButton = true,
}: OrderScreenProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4 md:p-6 flex flex-col">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack}
            className="rounded-full hover:bg-slate-200"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{title}</h1>
            <p className="text-sm text-slate-600 font-semibold mt-0.5">{items.length} {items.length === 1 ? 'item' : 'itens'}</p>
          </div>
        </div>

        <div className="mb-4">
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="w-full h-14 gap-2.5 bg-blue-600 hover:bg-blue-700 text-base font-bold shadow-md hover:shadow-lg transition-all"
            aria-label="Adicionar novo item ao pedido"
          >
            <Plus className="w-5 h-5" aria-hidden="true" />
            Adicionar Item
          </Button>
        </div>

        <div className="flex-1 space-y-3 mb-4 overflow-y-auto pb-6">
          {items.length === 0 ? (
            <Card className="p-12 text-center border-2 border-dashed border-slate-300">
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
                  <ShoppingCart className="w-10 h-10 text-slate-400" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Nenhum item adicionado</h3>
                  <p className="text-sm text-slate-600">Clique no botão acima para começar</p>
                </div>
              </div>
            </Card>
          ) : (
            items.map((item) => (
              <Card key={item.product.id} className="p-4 border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="text-base font-bold text-slate-900 mb-1">{item.product.name}</h4>
                    <p className="text-sm font-semibold text-slate-600">
                      {formatCurrency(item.product.price)} x {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full border-2 hover:bg-red-50 hover:border-red-500 transition-all"
                        onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                        disabled={item.quantity <= 1}
                        aria-label={`Diminuir quantidade de ${item.product.name}`}
                      >
                        <Minus className="w-4 h-4" aria-hidden="true" />
                      </Button>
                      <span className="w-10 text-center font-bold text-slate-900" aria-label={`Quantidade: ${item.quantity}`}>{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full border-2 hover:bg-green-50 hover:border-green-500 transition-all"
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        aria-label={`Aumentar quantidade de ${item.product.name}`}
                      >
                        <Plus className="w-4 h-4" aria-hidden="true" />
                      </Button>
                    </div>
                    <div className="text-right min-w-[90px]">
                      <p className="text-base font-bold text-slate-900">{formatCurrency(item.product.price * item.quantity)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-red-50 rounded-full"
                      onClick={() => onRemoveItem(item.product.id)}
                      aria-label={`Remover ${item.product.name} do pedido`}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t-2 border-slate-200 bg-gradient-to-b from-white to-slate-50 pt-5 space-y-4 rounded-t-2xl shadow-lg">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide">Total</h3>
              <p className="text-3xl md:text-4xl font-bold text-slate-900">{formatCurrency(calculateTotal())}</p>
            </div>
            {showFinishButton && (
              <Button 
                onClick={onFinish} 
                className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-bold text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5"
                aria-label={`Fechar comanda - Total: ${formatCurrency(calculateTotal())}`}
              >
                <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                Fechar Comanda
              </Button>
            )}
          </div>
        )}
      </div>

      <AddItemDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onAddItem={onAddItem}
      />
    </div>
  );
}