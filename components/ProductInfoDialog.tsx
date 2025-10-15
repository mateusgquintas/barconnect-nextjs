import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Product } from '../types';
import { useEffect, useMemo } from 'react';
import { startOfWeek, format, parseISO, addWeeks, isAfter, isValid } from 'date-fns';
// Função para converter dd/MM/yyyy para Date
function parseDateBR(dateStr: string): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  const [day, month, year] = parts.map(Number);
  if (!day || !month || !year) return null;
  const d = new Date(year, month - 1, day);
  return isNaN(d.getTime()) ? null : d;
}
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
    // Ignora cortesias e usa campo de data igual ao dashboard
    return sales
      .filter(sale => !sale.isCourtesy)
      .map(sale => sale.items.filter(item => item.product.id === product.id).map(item => ({
        quantity: item.quantity,
        // Dashboard usa sale.date (formato dd/MM/yyyy)
        date: sale.date
      })))
      .flat();
  }, [sales, product]);

  // Agrupar vendas por semana (últimas 8 semanas)
  const salesByWeek = useMemo(() => {
    if (!product) return [];
    // Agrupa vendas por semana
    const weekMap: Record<string, number> = {};
    productSales.forEach(({ date, quantity }) => {
      if (!date) return;
      const parsed = parseDateBR(date);
      if (!parsed || !isValid(parsed)) return;
      const week = format(startOfWeek(parsed, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      weekMap[week] = (weekMap[week] || 0) + quantity;
    });
    // Lista de semanas ordenadas (com vendas)
    const weeksWithSales = Object.keys(weekMap).sort();
    // Se houver vendas, pega as 8 semanas mais recentes com vendas
    let weeks: string[] = [];
    if (weeksWithSales.length > 0) {
      const last = weeksWithSales[weeksWithSales.length - 1];
      let cursor = startOfWeek(parseISO(last), { weekStartsOn: 1 });
      for (let i = 0; i < 8; i++) {
        weeks.push(format(addWeeks(cursor, -7 + i), 'yyyy-MM-dd'));
      }
    } else {
      // Se não houver vendas, mostra as últimas 8 semanas a partir de hoje
      let cursor = startOfWeek(new Date(), { weekStartsOn: 1 });
      for (let i = 0; i < 8; i++) {
        weeks.push(format(addWeeks(cursor, -7 + i), 'yyyy-MM-dd'));
      }
    }
    return weeks.map(week => ({
      week,
      qty: weekMap[week] || 0,
      label: format(parseISO(week), "dd/MM")
    }));
  }, [productSales, product]);

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
            <p className="text-xs text-slate-500 mb-2">Histórico semanal de vendas (8 semanas)</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={salesByWeek} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" fontSize={10} />
                <YAxis fontSize={10} allowDecimals={false} />
                <Tooltip labelFormatter={(_, payload) => {
                  if (!payload?.length) return '';
                  const week = payload[0].payload.week;
                  return `Semana de ${format(parseISO(week), 'dd/MM/yyyy')}`;
                }} />
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
