'use client'
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { notifyError, notifySuccess } from '@/utils/notify';

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  date: Date | null;
  onCreate: (payload: { date: Date; customer?: string }) => Promise<boolean> | boolean;
};

export function NewBookingDialog({ open, onOpenChange, date, onCreate }: Props) {
  const [customer, setCustomer] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) { notifyError('Selecione uma data'); return; }
    try {
      setSubmitting(true);
      const ok = await onCreate({ date, customer: customer.trim() || undefined });
      if (ok) {
        notifySuccess('Reserva criada');
        setCustomer('');
        onOpenChange(false);
      }
    } catch (err) {
      notifyError('Erro ao criar reserva', err as any);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Reserva</DialogTitle>
          <DialogDescription>
            {date ? `Dia selecionado: ${date.toLocaleDateString()}` : 'Selecione um dia no calendário.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="customer">Cliente / Romaria (opcional)</Label>
            <Input id="customer" value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="João / Romaria X" />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancelar</Button>
            <Button type="submit" disabled={!date || submitting}>{submitting ? 'Salvando...' : 'Criar'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default NewBookingDialog;
