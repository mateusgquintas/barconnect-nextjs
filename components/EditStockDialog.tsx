'use client'
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Product } from '@/types';
import { toast } from 'sonner';

interface EditStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onUpdateStock: (productId: string, newStock: number) => void;
}

export function EditStockDialog({ open, onOpenChange, product, onUpdateStock }: EditStockDialogProps) {
  const [stock, setStock] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product) return;

    const newStock = parseInt(stock);
    if (isNaN(newStock) || newStock < 0) {
      toast.error('Quantidade inválida');
      return;
    }

    onUpdateStock(product.id, newStock);
    toast.success('Estoque atualizado com sucesso');
    onOpenChange(false);
    setStock('');
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && product) {
      setStock(product.stock.toString());
    } else {
      setStock('');
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Estoque</DialogTitle>
          <DialogDescription>
            Atualize a quantidade em estoque do produto
          </DialogDescription>
        </DialogHeader>

        {product && (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-slate-600">Produto</Label>
                <p className="text-slate-900 mt-1">{product.name}</p>
              </div>

              <div>
                <Label className="text-slate-600">Estoque Atual</Label>
                <p className="text-slate-900 mt-1">{product.stock} unidades</p>
              </div>

              <div>
                <Label htmlFor="stock">Nova Quantidade</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="Digite a nova quantidade"
                  className="mt-2"
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-slate-900 hover:bg-slate-800">
                Atualizar Estoque
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}