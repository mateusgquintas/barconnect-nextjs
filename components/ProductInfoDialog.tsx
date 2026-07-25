import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Product } from '../types';
import { useEffect, useMemo, useState } from 'react';
import { startOfWeek, format, parseISO, addWeeks, isValid } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface StockMovement {
  movement_type: 'in' | 'out' | 'adjustment';
  quantity: number;
  created_at: string;
}

interface ProductInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

export function ProductInfoDialog({ open, onOpenChange, product }: ProductInfoDialogProps) {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loadingMovements, setLoadingMovements] = useState(false);

  useEffect(() => {
    if (!open || !product) {
      setMovements([]);
      return;
    }
    setLoadingMovements(true);
    supabase
      .from('stock_movements')
      .select('movement_type, quantity, created_at')
      .eq('product_id', product.id)
      .order('created_at', { ascending: true })
      .then(({ data, error }: { data: StockMovement[] | null; error: unknown }) => {
        if (!error) setMovements(data || []);
        setLoadingMovements(false);
      });
  }, [open, product]);

  // Agrupar retiradas (consumo) por semana (últimas 8 semanas)
  const consumptionByWeek = useMemo(() => {
    const weekMap: Record<string, number> = {};
    movements
      .filter(m => m.movement_type === 'out')
      .forEach(({ created_at, quantity }) => {
        const parsed = new Date(created_at);
        if (!isValid(parsed)) return;
        const week = format(startOfWeek(parsed, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        weekMap[week] = (weekMap[week] || 0) + quantity;
      });

    const weeksWithData = Object.keys(weekMap).sort();
    const weeks: string[] = [];
    if (weeksWithData.length > 0) {
      const last = weeksWithData[weeksWithData.length - 1];
      const cursor = startOfWeek(parseISO(last), { weekStartsOn: 1 });
      for (let i = 0; i < 8; i++) {
        weeks.push(format(addWeeks(cursor, -7 + i), 'yyyy-MM-dd'));
      }
    } else {
      const cursor = startOfWeek(new Date(), { weekStartsOn: 1 });
      for (let i = 0; i < 8; i++) {
        weeks.push(format(addWeeks(cursor, -7 + i), 'yyyy-MM-dd'));
      }
    }
    return weeks.map(week => ({
      week,
      qty: weekMap[week] || 0,
      label: format(parseISO(week), 'dd/MM'),
    }));
  }, [movements]);

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Estatísticas de Consumo</DialogTitle>
          <DialogDescription>
            Estatísticas e histórico de retiradas de estoque do produto
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Nome</p>
            <p className="text-slate-900 font-medium">{product.name}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Estoque</p>
              <p className="text-slate-900 font-medium">{product.stock} un.</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Categoria</p>
              <p className="text-slate-900 font-medium">{product.category || '-'}</p>
            </div>
          </div>
          <div className="pt-2 border-t">
            <p className="text-xs text-slate-500 mb-2">Consumo semanal (últimas 8 semanas)</p>
            {loadingMovements ? (
              <p className="text-sm text-slate-500 py-8 text-center">Carregando histórico...</p>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={consumptionByWeek} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" fontSize={10} />
                  <YAxis fontSize={10} allowDecimals={false} />
                  <Tooltip labelFormatter={(_, payload) => {
                    if (!payload?.length) return '';
                    const week = payload[0].payload.week;
                    return `Semana de ${format(parseISO(week), 'dd/MM/yyyy')}`;
                  }} />
                  <Bar dataKey="qty" fill="#dc2626" name="Retirado" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
