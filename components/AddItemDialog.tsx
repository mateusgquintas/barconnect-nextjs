
import { useState } from 'react';
import { Minus, Plus, Search } from 'lucide-react';
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
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Adicionar Item</DialogTitle>
          <DialogDescription>
            Selecione um produto e defina a quantidade
          </DialogDescription>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Buscar produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 mb-4">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className={`p-4 cursor-pointer transition-all ${
                selectedProduct?.id === product.id
                  ? 'border-2 border-primary bg-primary/5'
                  : 'hover:border-primary'
              }`}
              onClick={() => handleProductSelect(product)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4>{product.name}</h4>
                  <p className="text-muted-foreground">R$ {product.price.toFixed(2)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {selectedProduct && (
          <div className="border-t pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4>{selectedProduct.name}</h4>
                <p className="text-muted-foreground">R$ {selectedProduct.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Button onClick={handleAdd} className="w-full h-12">
              Adicionar - R$ {(selectedProduct.price * quantity).toFixed(2)}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}