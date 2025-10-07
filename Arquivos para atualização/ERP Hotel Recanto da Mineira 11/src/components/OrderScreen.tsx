import { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Minus } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { OrderItem, Product } from '../types';
import { AddItemDialog } from './AddItemDialog';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex flex-col">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl">{title}</h1>
            <p className="text-muted-foreground">{items.length} item(ns)</p>
          </div>
        </div>

        <div className="mb-4">
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="w-full h-14 gap-2"
          >
            <Plus className="w-5 h-5" />
            Adicionar Item
          </Button>
        </div>

        <div className="flex-1 space-y-3 mb-4 overflow-y-auto pb-6">
          {items.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Nenhum item adicionado</p>
            </Card>
          ) : (
            items.map((item) => (
              <Card key={item.product.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="mb-1">{item.product.name}</h4>
                    <p className="text-muted-foreground">
                      R$ {item.product.price.toFixed(2)} x {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="text-right min-w-[80px]">
                      <p>R$ {(item.product.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onRemoveItem(item.product.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t bg-white/80 backdrop-blur pt-4 space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3>Total</h3>
              <p className="text-3xl">R$ {calculateTotal().toFixed(2)}</p>
            </div>
            {showFinishButton && (
              <Button onClick={onFinish} className="w-full h-14">
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