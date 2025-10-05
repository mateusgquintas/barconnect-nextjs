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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Valor inválido");
      return;
    }

    if (!category) {
      toast.error("Selecione uma categoria");
      return;
    }

    onAddTransaction({
      type,
      description,
      amount: numAmount,
      category,
    });

    toast.success(
      type === "income"
        ? "Entrada registrada"
        : "Saída registrada",
    );
    handleClose();
  };

  const handleClose = () => {
    setDescription("");
    setAmount("");
    setCategory("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
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

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Digite a descrição"
                className="mt-2"
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={category}
                onValueChange={setCategory}
                required
              >
                <SelectTrigger className="mt-2">
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
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="mt-2"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
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