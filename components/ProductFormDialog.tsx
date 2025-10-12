import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
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
              <Select value={String(form.category || '')} onValueChange={(v) => handleChange('category', v)}>
                <SelectTrigger id="product-category">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="product-subcategory">Subcategoria</Label>
              <Select value={String(form.subcategory || '')} onValueChange={(v) => handleChange('subcategory', v)}>
                <SelectTrigger id="product-subcategory">
                  <SelectValue placeholder="Selecione a subcategoria" />
                </SelectTrigger>
                <SelectContent>
                  {(subcategoryOptions[String(form.category || 'outros')] || []).map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
