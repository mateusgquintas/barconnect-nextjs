'use client'
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { getToast } from '@/utils/notify';
import { ShoppingBag, User, Hash, CheckCircle2, X } from 'lucide-react';

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
    
    // Reset form
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
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
              <ShoppingBag className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900">Nova Comanda</DialogTitle>
              <DialogDescription className="text-sm text-slate-600 mt-0.5">
                Preencha os dados abaixo
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="space-y-2">
            <Label htmlFor="comandaNumber" className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Hash className="w-4 h-4 text-blue-600" aria-hidden="true" />
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
              aria-required="true"
              aria-invalid={!!error}
              aria-describedby={error ? 'comandaNumber-error' : undefined}
              className={`h-12 text-lg font-semibold transition-all ${
                error 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
            />
            {error && (
              <p id="comandaNumber-error" role="alert" className="text-sm text-red-600 font-medium flex items-center gap-1.5">
                <X className="w-4 h-4" aria-hidden="true" />
                {error}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerName" className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" aria-hidden="true" />
              Nome do Cliente <span className="text-slate-500 text-xs font-normal">(opcional)</span>
            </Label>
            <Input
              id="customerName"
              type="text"
              placeholder="Ex: João Silva"
              value={customerName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerName(e.target.value)}
              aria-label="Nome do cliente (opcional)"
              className="h-12 text-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1 h-12 text-base font-bold border-2 hover:bg-slate-50 transition-all"
              aria-label="Cancelar criação de comanda"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 h-12 text-base font-bold bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              aria-label="Criar nova comanda"
            >
              <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
              Criar Comanda
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}