import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
// Using native selects here to ensure compatibility with tests using fireEvent.change on labeled controls
import { Label } from './ui/label';
import { Product } from '../types';
import { useState, useEffect, useId } from 'react';
import { Package, DollarSign, Box, Tag, Tags, CheckCircle2 } from 'lucide-react';

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSave: (product: Partial<Product>) => void;
  title?: string;
}

export function ProductFormDialog({ open, onOpenChange, product, onSave, title }: ProductFormDialogProps) {
  const [form, setForm] = useState<Partial<Product>>({});
  const titleId = useId();
  const descriptionId = useId();

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

  const dialogTitleText = title || (product ? 'Editar Produto' : 'Novo Produto');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-label={dialogTitleText} aria-labelledby={titleId} aria-describedby={descriptionId} className="sm:max-w-lg">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
              <Package className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <div>
              <DialogTitle id={titleId} className="text-xl font-bold text-slate-900">{dialogTitleText}</DialogTitle>
              <DialogDescription id={descriptionId} className="text-sm text-slate-600 mt-0.5">
                Preencha os dados do produto
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form className="space-y-5 pt-2" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="product-name" className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-blue-600" aria-hidden="true" />
              Nome do Produto <span className="text-red-600">*</span>
            </Label>
            <Input 
              id="product-name" 
              value={form.name || ''} 
              onChange={e => handleChange('name', e.target.value)} 
              placeholder="Ex: Suco de Laranja" 
              required 
              className="h-11 mt-2 text-base border-2 border-slate-300 focus:border-blue-500 focus:ring-blue-500 transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="product-price" className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" aria-hidden="true" />
                Preço <span className="text-red-600">*</span>
              </Label>
              <Input 
                id="product-price" 
                type="number" 
                min="0" 
                step="0.01" 
                value={form.price ?? ''} 
                onChange={e => handleChange('price', parseFloat(e.target.value))} 
                placeholder="0,00"
                required 
                className="h-11 mt-2 text-base border-2 border-slate-300 focus:border-green-500 focus:ring-green-500 transition-all font-semibold"
              />
            </div>
            <div>
              <Label htmlFor="product-stock" className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Box className="w-4 h-4 text-orange-600" aria-hidden="true" />
                Estoque <span className="text-red-600">*</span>
              </Label>
              <Input 
                id="product-stock" 
                type="number" 
                min="0" 
                value={form.stock ?? ''} 
                onChange={e => handleChange('stock', parseInt(e.target.value))} 
                placeholder="0"
                required 
                className="h-11 mt-2 text-base border-2 border-slate-300 focus:border-orange-500 focus:ring-orange-500 transition-all font-semibold"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="product-category" className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Tags className="w-4 h-4 text-purple-600" aria-hidden="true" />
                Categoria
              </Label>
              <select
                id="product-category"
                className="mt-2 h-11 file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex w-full min-w-0 rounded-md border-2 border-slate-300 px-3 py-1 text-base bg-white transition-all outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-purple-500 focus-visible:ring-purple-500 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive font-semibold"
                value={form.category ?? ''}
                onChange={e => handleChange('category', e.target.value)}
              >
                <option value="">Sem categoria</option>
                {categoryOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="product-subcategory" className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Tags className="w-4 h-4 text-purple-600" aria-hidden="true" />
                Subcategoria
              </Label>
              <select
                id="product-subcategory"
                className="mt-2 h-11 file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex w-full min-w-0 rounded-md border-2 border-slate-300 px-3 py-1 text-base bg-white transition-all outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-purple-500 focus-visible:ring-purple-500 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive font-semibold"
                value={form.subcategory ?? ''}
                onChange={e => handleChange('subcategory', e.target.value)}
                disabled={!form.category}
              >
                <option value="">Sem subcategoria</option>
                {(subcategoryOptions[String(form.category || 'outros')] || []).map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter className="gap-3 pt-4">
            <Button 
              variant="outline" 
              type="button" 
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
              Salvar Produto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
