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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {type === "income" ? "Nova Entrada" : "Nova Saída"}
          </DialogTitle>
          <DialogDescription>
            {type === "income"
              ? "Registre uma nova entrada financeira"
              : "Registre uma nova saída financeira"}
          </DialogDescription>
        </DialogHeader>

  <form onSubmit={handleSubmit} noValidate>
          {formError && (
            <div role="alert" className="sr-only">{formError}</div>
          )}
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
                placeholder="Digite a descrição"
                className="mt-2"
                disabled={isSubmitting}
                required
              />
            </div>

            <div>
              <Label id="category-label" htmlFor="category-select-trigger">Categoria</Label>
              <Select
                value={category}
                onValueChange={setCategory}
                disabled={isSubmitting}
              >
                <SelectTrigger
                  id="category-select-trigger"
                  className="mt-2"
                  aria-labelledby="category-label"
                >
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount === null || amount === undefined ? '' : amount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
                placeholder="0.00"
                className="mt-2"
                aria-describedby="amount-help"
                disabled={isSubmitting}
                role="textbox"
                aria-label="Valor"
                required
              />
              <span id="amount-help" className="sr-only">Informe o valor em reais, use ponto para decimais</span>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className={
                type === "income"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
              aria-label="Salvar"
              disabled={isSubmitting}
            >
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