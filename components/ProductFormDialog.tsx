import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
// Using native selects here to ensure compatibility with tests using fireEvent.change on labeled controls
import { Label } from './ui/label';
import { Product } from '../types';
import { useState, useEffect } from 'react';
import { Package, Box, Tag, CheckCircle2, AlertTriangle } from 'lucide-react';
import { CategoryCombobox } from './CategoryCombobox';

// Categorias de itens perecíveis/in natura: compradas semanalmente, então toleram um
// estoque mínimo mais baixo antes de serem consideradas críticas.
const PERISHABLE_CATEGORIES = new Set(['Hortaliças e legumes', 'Frutas', 'Carnes e embutidos', 'Laticínios e ovos']);
function defaultMinStockFor(category?: string) {
  return category && PERISHABLE_CATEGORIES.has(category) ? 5 : 20;
}

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSave: (product: Partial<Product>) => void;
  title?: string;
  existingCategories?: string[];
}

export function ProductFormDialog({ open, onOpenChange, product, onSave, title, existingCategories = [] }: ProductFormDialogProps) {
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

  // Sugestões de categoria: apenas as já cadastradas no estoque
  const categorySuggestions = Array.from(new Set(existingCategories)).filter(Boolean);

  const dialogTitleText = title || (product ? 'Editar Produto' : 'Novo Produto');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-label={dialogTitleText} className="sm:max-w-lg">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
              <Package className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900">{dialogTitleText}</DialogTitle>
              <DialogDescription className="text-sm text-slate-600 mt-0.5">
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
          <div>
            <Label htmlFor="product-min-stock" className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" aria-hidden="true" />
              Estoque mínimo
            </Label>
            <Input
              id="product-min-stock"
              type="number"
              min="0"
              value={form.min_stock ?? ''}
              onChange={e => handleChange('min_stock', e.target.value === '' ? undefined as any : parseInt(e.target.value))}
              placeholder={`Padrão: ${defaultMinStockFor(form.category)} un.`}
              className="h-11 mt-2 text-base border-2 border-slate-300 focus:border-red-500 focus:ring-red-500 transition-all font-semibold"
            />
            <p className="text-xs text-slate-500 mt-1">
              Abaixo desse valor o produto aparece como "Crítico". Deixe em branco para usar o padrão da categoria
              {PERISHABLE_CATEGORIES.has(form.category || '') ? ' (itens perecíveis: 5 un., comprados semanalmente)' : ' (20 un.)'}.
            </p>
          </div>
          <div>
            <Label htmlFor="product-category" className="text-sm font-bold text-slate-900">
              Categoria
            </Label>
            <div className="mt-2">
              <CategoryCombobox
                id="product-category"
                categories={categorySuggestions}
                value={form.category ?? ''}
                onValueChange={(v) => handleChange('category', v)}
              />
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
