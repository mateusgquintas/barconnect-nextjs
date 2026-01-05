
import { useState } from 'react';
import { Minus, Plus, Search, ShoppingCart, CheckCircle2, Package } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Product } from '@/types';
import { useProductsDB } from '@/hooks/useProductsDB';
import { Skeleton } from './ui/skeleton';

// Helper para formatação de moeda
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Skeleton para produtos loading
const ProductSkeleton = () => (
  <Card className="p-4">
    <div className="flex items-center justify-between">
      <div className="space-y-2 flex-1">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  </Card>
);

interface AddItemDialogProps {
  open: boolean;
  onClose: () => void;
  onAddItem: (product: Product, quantity: number) => void;
}

export function AddItemDialog({ open, onClose, onAddItem }: AddItemDialogProps) {
  const { products, loading } = useProductsDB();
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (selectedProduct) {
      onAddItem(selectedProduct, quantity);
      setSelectedProduct(null);
      setQuantity(1);
      setSearch('');
      onClose();
    }
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setQuantity(1);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center shadow-lg">
              <ShoppingCart className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900">Adicionar Item</DialogTitle>
              <DialogDescription className="text-sm text-slate-600 mt-0.5">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'produto disponível' : 'produtos disponíveis'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" aria-hidden="true" />
          <Input
            placeholder="Buscar produto..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            aria-label="Buscar produtos"
            className="pl-12 h-12 text-base border-2 border-slate-300 focus:border-green-500 focus:ring-green-500 transition-all"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2.5 mb-4 pr-1">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <Package className="w-10 h-10 text-slate-400" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Nenhum produto encontrado</h3>
              <p className="text-sm text-slate-600">Tente buscar com outros termos</p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <Card
                key={product.id}
                className={`p-4 cursor-pointer transition-all ${
                  selectedProduct?.id === product.id
                    ? 'border-2 border-green-600 bg-gradient-to-br from-green-50 to-green-50/30 shadow-md scale-102'
                    : 'border-2 border-slate-200 hover:border-green-400 hover:shadow-md'
                }`}
                onClick={() => handleProductSelect(product)}
                role="button"
                tabIndex={0}
                aria-label={`Selecionar ${product.name} por ${formatCurrency(product.price)}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleProductSelect(product);
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-bold text-slate-900">{product.name}</h4>
                    <p className="text-sm font-semibold text-slate-600 mt-0.5">{formatCurrency(product.price)}</p>
                  </div>
                  {selectedProduct?.id === product.id && (
                    <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center shadow-md">
                      <CheckCircle2 className="w-5 h-5 text-white" aria-hidden="true" />
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>

        {selectedProduct && (
          <div className="border-t-2 border-slate-200 pt-5 space-y-4 bg-gradient-to-b from-white to-slate-50 -mx-6 px-6 -mb-6 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-slate-900">{selectedProduct.name}</h4>
                <p className="text-sm font-semibold text-slate-600 mt-0.5">{formatCurrency(selectedProduct.price)} por unidade</p>
              </div>
              <div className="flex items-center gap-2.5">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  aria-label="Diminuir quantidade"
                  className="h-10 w-10 rounded-full border-2 hover:bg-red-50 hover:border-red-500 disabled:opacity-50 transition-all"
                >
                  <Minus className="w-4 h-4" aria-hidden="true" />
                </Button>
                <span className="w-14 text-center text-xl font-bold text-slate-900" aria-label={`Quantidade: ${quantity}`}>{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  aria-label="Aumentar quantidade"
                  className="h-10 w-10 rounded-full border-2 hover:bg-green-50 hover:border-green-500 transition-all"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                </Button>
              </div>
            </div>

            <Button 
              onClick={handleAdd} 
              className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-bold text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5"
              aria-label={`Adicionar ${quantity} ${quantity === 1 ? 'unidade' : 'unidades'} de ${selectedProduct.name} por ${formatCurrency(selectedProduct.price * quantity)}`}
            >
              <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
              Adicionar - {formatCurrency(selectedProduct.price * quantity)}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}