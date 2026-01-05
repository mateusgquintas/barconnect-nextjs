import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Product } from '../types';
import { toast } from 'sonner';
import { Box, Package, CheckCircle2 } from 'lucide-react';

interface EditStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onUpdateStock: (productId: string, newStock: number) => void;
}

export function EditStockDialog({ open, onOpenChange, product, onUpdateStock }: EditStockDialogProps) {
  const [stock, setStock] = useState<string>('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-600 to-orange-700 flex items-center justify-center shadow-lg">
              <Box className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900">Editar Estoque</DialogTitle>
              <DialogDescription className="text-sm text-slate-600 mt-0.5">
                Atualize a quantidade em estoque
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {product && (
          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
            <div>
              <Label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" aria-hidden="true" />
                Produto
              </Label>
              <p className="text-base font-semibold text-slate-900 mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200">{product.name}</p>
            </div>

            <div>
              <Label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Box className="w-4 h-4 text-slate-600" aria-hidden="true" />
                Estoque Atual
              </Label>
              <p className="text-base font-semibold text-slate-900 mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200">{product.stock} unidades</p>
            </div>

            <div>
              <Label htmlFor="stock" className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Box className="w-4 h-4 text-orange-600" aria-hidden="true" />
                Nova Quantidade <span className="text-red-600">*</span>
              </Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={stock}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStock(e.target.value)}
                placeholder="Digite a nova quantidade"
                className="mt-2 h-11 text-base font-semibold border-2 border-slate-300 focus:border-orange-500 focus:ring-orange-500 transition-all"
                required
                aria-label="Nova quantidade em estoque"
              />
            </div>

            <DialogFooter className="gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 h-11 text-base font-bold border-2 hover:bg-slate-50 transition-all"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="flex-1 h-11 text-base font-bold bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                Atualizar Estoque
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}