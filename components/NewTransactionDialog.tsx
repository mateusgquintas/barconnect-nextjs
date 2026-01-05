'use client'
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "sonner";
import { ArrowDownCircle, ArrowUpCircle, DollarSign, FileText, Tag, CheckCircle2 } from 'lucide-react';

// Helper para formatação de moeda
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

interface NewTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "income" | "expense";
  onAddTransaction: (transaction: {
    type: "income" | "expense";
    description: string;
    amount: number;
    category: string;
  }) => void;
}

export function NewTransactionDialog({
  open,
  onOpenChange,
  type,
  onAddTransaction,
}: NewTransactionDialogProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const incomeCategories = [
    "Vendas",
    "Hospedagens",
    "Serviços",
    "Eventos",
    "Outras Receitas",
  ];

  const expenseCategories = [
    "Fornecedores",
    "Salários",
    "Aluguel",
    "Água",
    "Luz",
    "Internet",
    "Gás",
    "Telefone",
    "Manutenção",
    "Limpeza",
    "Marketing",
    "Impostos",
    "Equipamentos",
    "Outras Despesas",
  ];

  const categories =
    type === "income" ? incomeCategories : expenseCategories;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setFormError(null);

  if (amount === '' || amount === null || isNaN(Number(amount))) {
  const msg = "Valor inválido";
      setFormError(msg);
  try { const { toast: t } = require('sonner'); (t as any)?.error?.(msg); } catch {}
      // manter desabilitado brevemente para feedback visual
      setTimeout(() => setIsSubmitting(false), 300);
      return;
    }

  const numAmount = parseFloat(amount);
    if (numAmount <= 0) {
  const msg = "Valor inválido";
      setFormError(msg);
  try { const { toast: t } = require('sonner'); (t as any)?.error?.(msg); } catch {}
      setTimeout(() => setIsSubmitting(false), 300);
      return;
    }

    // Para facilitar o fluxo, usar categoria padrão quando não selecionada
    const finalCategory = category || (type === 'income' ? 'Vendas' : 'Outras Despesas');
    try {
      setIsSubmitting(true);
      await onAddTransaction({
        type,
        description,
        amount: numAmount,
        category: finalCategory,
      });

      try {
        const { toast: t } = require('sonner');
        const msg = type === "income" ? "Entrada registrada" : "Saída registrada";
        (t as any)?.success?.(msg);
      } catch {}
      handleClose();
    } catch (e) {
      const msg = 'Erro ao registrar transação';
      setFormError(msg);
      try { const { toast: t } = require('sonner'); (t as any)?.error?.(msg); } catch {}
      // manter desabilitado brevemente para dar feedback visual
      setTimeout(() => setIsSubmitting(false), 300);
      return;
    } finally {
      // garantir que volta ao normal caso não tenha retornado no catch
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setDescription("");
    setAmount("");
    setCategory("");
    onOpenChange(false);
  };

  return (
  <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
              type === 'income' 
                ? 'bg-gradient-to-br from-green-600 to-green-700' 
                : 'bg-gradient-to-br from-red-600 to-red-700'
            }`}>
              {type === 'income' ? (
                <ArrowDownCircle className="w-6 h-6 text-white" aria-hidden="true" />
              ) : (
                <ArrowUpCircle className="w-6 h-6 text-white" aria-hidden="true" />
              )}
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900">
                {type === "income" ? "Nova Entrada" : "Nova Saída"}
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-600 mt-0.5">
                {type === "income"
                  ? "Registre uma receita"
                  : "Registre uma despesa"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

  <form onSubmit={handleSubmit} noValidate className="space-y-5 pt-2">
          {formError && (
            <div role="alert" className="sr-only">{formError}</div>
          )}
          <div className="space-y-5">
            <div>
              <Label htmlFor="description" className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" aria-hidden="true" />
                Descrição <span className="text-red-600">*</span>
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
                placeholder="Ex: Venda de produtos"
                className="mt-2 h-11 text-base border-2 border-slate-300 focus:border-blue-500 focus:ring-blue-500 transition-all"
                disabled={isSubmitting}
                required
              />
            </div>

            <div>
              <Label id="category-label" htmlFor="category-select-trigger" className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-purple-600" aria-hidden="true" />
                Categoria
              </Label>
              <Select
                value={category}
                onValueChange={setCategory}
                disabled={isSubmitting}
              >
                <SelectTrigger
                  id="category-select-trigger"
                  className="mt-2 h-11 text-base border-2 border-slate-300 focus:border-purple-500 transition-all"
                  aria-labelledby="category-label"
                >
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-base">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount" className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className={`w-4 h-4 ${
                  type === 'income' ? 'text-green-600' : 'text-red-600'
                }`} aria-hidden="true" />
                Valor <span className="text-red-600">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount === null || amount === undefined ? '' : amount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
                placeholder="0,00"
                className={`mt-2 h-11 text-base font-semibold border-2 transition-all ${
                  type === 'income' 
                    ? 'border-slate-300 focus:border-green-500 focus:ring-green-500' 
                    : 'border-slate-300 focus:border-red-500 focus:ring-red-500'
                }`}
                aria-describedby="amount-help"
                disabled={isSubmitting}
                role="textbox"
                aria-label="Valor"
                required
              />
              <span id="amount-help" className="sr-only">Informe o valor em reais, use ponto para decimais</span>
            </div>
          </div>

          <DialogFooter className="gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 h-11 text-base font-bold border-2 hover:bg-slate-50 transition-all"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className={`flex-1 h-11 text-base font-bold text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 ${
                type === "income"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
              aria-label="Salvar"
              disabled={isSubmitting}
            >
              <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
              {type === "income"
                ? "Registrar Entrada"
                : "Registrar Saída"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}