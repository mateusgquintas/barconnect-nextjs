import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Product } from '../types';
import { useEffect, useMemo } from 'react';
import { useSalesDB } from '@/hooks/useSalesDB';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface ProductInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

export function ProductInfoDialog({ open, onOpenChange, product }: ProductInfoDialogProps) {
  const { sales } = useSalesDB();

  // Filtrar vendas do produto

  const productSales = useMemo(() => {
    if (!product) return [];
    // Retorna [{ quantity, saleDate }]
    return sales
      .map(sale => sale.items.filter(item => item.product.id === product.id).map(item => ({
        quantity: item.quantity,
        date: sale.date
      })))
      .flat();
  }, [sales, product]);

  // Agrupar vendas por data
  const salesByDate = useMemo(() => {
    const map: Record<string, number> = {};
    productSales.forEach(({ date, quantity }) => {
      map[date] = (map[date] || 0) + quantity;
    });
    return Object.entries(map).map(([date, qty]) => ({ date, qty }));
  }, [productSales]);

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Informações do Produto</DialogTitle>
          <DialogDescription>
            Estatísticas e histórico de vendas do produto
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Nome</p>
            <p className="text-slate-900 font-medium">{product.name}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Preço</p>
              <p className="text-slate-900 font-medium">R$ {product.price.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Estoque</p>
              <p className="text-slate-900 font-medium">{product.stock} un.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Categoria</p>
              <p className="text-slate-900 font-medium">{product.category || '-'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Subcategoria</p>
              <p className="text-slate-900 font-medium">{product.subcategory || '-'}</p>
            </div>
          </div>
          <div className="pt-2 border-t">
            <p className="text-xs text-slate-500 mb-2">Histórico de vendas (últimos 30 dias)</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={salesByDate} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip />
                <Bar dataKey="qty" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
