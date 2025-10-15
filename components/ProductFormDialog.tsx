import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
// Using native selects here to ensure compatibility with tests using fireEvent.change on labeled controls
import { Label } from './ui/label';
import { Product } from '../types';
import { useState, useEffect } from 'react';

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSave: (product: Partial<Product>) => void;
  title?: string;
}

export function ProductFormDialog({ open, onOpenChange, product, onSave, title }: ProductFormDialogProps) {
  const [form, setForm] = useState<Partial<Product>>({});

  useEffect(() => {
    if (open && product) {
      setForm(product);
    } else if (open) {
      setForm({});
    }
  }, [open, product]);

  const handleChange = (field: keyof Product, value: string | number) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onOpenChange(false);
  };

  // Category and subcategory options
  const categoryOptions = [
    { value: 'bebidas', label: 'Bebidas' },
    { value: 'porcoes', label: 'Porções' },
    { value: 'almoco', label: 'Almoço' },
    { value: 'outros', label: 'Outros' },
  ];

  const subcategoryOptions: Record<string, { value: string; label: string }[]> = {
    bebidas: [
      { value: 'agua', label: 'Água' },
      { value: 'refrigerante', label: 'Refrigerante' },
      { value: 'cerveja', label: 'Cerveja' },
      { value: 'drink', label: 'Drink' },
      { value: 'garrafa', label: 'Garrafa' },
    ],
    porcoes: [
      { value: 'frita', label: 'Fritas' },
      { value: 'carne', label: 'Carnes' },
      { value: 'mista', label: 'Mistas' },
    ],
    almoco: [
      { value: 'executivo', label: 'Executivo' },
    ],
    outros: [],
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title || (product ? 'Editar Produto' : 'Novo Produto')}</DialogTitle>
          <DialogDescription id="product-form-description">
            Preencha os campos abaixo e clique em Salvar para {product ? 'atualizar' : 'cadastrar'} o produto.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4 py-2" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="product-name">Nome</Label>
            <Input id="product-name" value={form.name || ''} onChange={e => handleChange('name', e.target.value)} placeholder="Ex: Suco de Laranja" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="product-price">Preço (R$)</Label>
              <Input id="product-price" type="number" min="0" step="0.01" value={form.price ?? ''} onChange={e => handleChange('price', parseFloat(e.target.value))} required />
            </div>
            <div>
              <Label htmlFor="product-stock">Estoque</Label>
              <Input id="product-stock" type="number" min="0" value={form.stock ?? ''} onChange={e => handleChange('stock', parseInt(e.target.value))} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="product-category">Categoria Principal</Label>
              <select
                id="product-category"
                className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base bg-input-background transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                value={form.category ?? ''}
                onChange={e => handleChange('category', e.target.value || null)}
              >
                <option value="">Sem categoria</option>
                {categoryOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="product-subcategory">Subcategoria</Label>
              <select
                id="product-subcategory"
                className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base bg-input-background transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                value={form.subcategory ?? ''}
                onChange={e => handleChange('subcategory', e.target.value || null)}
                disabled={!form.category}
              >
                <option value="">Sem subcategoria</option>
                {(subcategoryOptions[String(form.category || 'outros')] || []).map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
