'use client'
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { getToast } from '@/utils/notify';

interface NewComandaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateComanda: (comandaNumber: number, customerName?: string) => void;
}

export function NewComandaDialog({ open, onOpenChange, onCreateComanda }: NewComandaDialogProps) {
  const [comandaNumber, setComandaNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const number = comandaNumber?.trim() ? parseInt(comandaNumber) : 1;
    if (isNaN(number) || number <= 0) {
      setError('Digite um número válido');
      return;
    }

    onCreateComanda(number, customerName.trim() || undefined);
  try { getToast()?.success?.('Comanda criada com sucesso'); } catch {}    // Reset form
    setComandaNumber('');
    setCustomerName('');
    setError('');
    onOpenChange(false);
  };

  const handleCancel = () => {
    setComandaNumber('');
    setCustomerName('');
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Comanda</DialogTitle>
          <DialogDescription>
            Preencha os dados da comanda
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="comandaNumber">
              Número da Comanda <span className="text-red-600">*</span>
            </Label>
            <Input
              id="comandaNumber"
              type="number"
              placeholder="Ex: 001"
              value={comandaNumber}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setComandaNumber(e.target.value);
                setError('');
              }}
              autoFocus
              className="bg-input-background"
            />
            {error && (
              <p role="alert" className="text-sm text-red-600">{error}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerName">Nome do Cliente (opcional)</Label>
            <Input
              id="customerName"
              type="text"
              placeholder="Ex: João Silva"
              value={customerName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerName(e.target.value)}
              className="bg-input-background"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-slate-900 hover:bg-slate-800"
            >
              Criar Comanda
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}