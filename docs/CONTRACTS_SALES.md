# Contrato: Sales

## Modelo (SaleRecord)
```
SaleRecord {
  id: string;
  comandaNumber?: number;      // Pode ser undefined em venda direta
  customerName?: string;
  items: OrderItem[];          // { productId, name, quantity, unitPrice }
  total: number;               // Soma de quantity * unitPrice (recalculável)
  paymentMethod: PaymentMethod;// 'cash' | 'credit' | 'debit' | 'pix' | 'courtesy'
  date: string;                // dd/mm/yyyy (BR)
  time: string;                // HH:mm:ss (24h)
  isDirectSale?: boolean;      // Venda sem comanda
  isCourtesy?: boolean;        // Cortesia (gera transação income? => Não, cortesia reduz receita bruta futura)
  createdBy?: string;          // Usuário responsável
}
```

## Invariantes
- `total` consistente com items (pode ser validado recalculando; divergência => log/alert futuramente).
- `date` e `time` sempre definidos (salesService aplica fallback se ausente).
- `items.length > 0` para vendas comuns (futuras: permitir lançamento manual zero-items?).

## Fontes de Dados
1. Tabela `sales` (preferencial).
2. Tabela legacy `sales_records` (fallback).
3. `localStorage.sales_records` (offline fallback / retries não enviados).

União + deduplicação por `id` + ordenação desc por (date,time).

## Registro de Venda
Função: `registerSale(input: RegisterSaleInput)`
- Persiste venda em `sales` ou localStorage (se falha).
- Cria transação financeira correspondente (income categoria 'Vendas').
- Retorna `{ sale, storedLocally }`.

## Transação Gerada
```
Transaction {
  type: 'income';
  category: 'Vendas';
  description: `Venda comanda #X` OU `Venda direta`;
  amount: total;
  date/time: herdados do registro de venda (ou data atual fallback);
}
```

## Erros & Feedback
- Sucesso: toast 'Venda registrada' (ou '(local)' se offline).
- Erro: toast com mensagem padrão + log contextual (notifyError).

## Futuras Extensões
- Campo `discount` / `serviceFee`.
- Sincronização offline -> online (replay) com marcação `synced`.
- Auditoria: trilha de alterações de items após registro.
