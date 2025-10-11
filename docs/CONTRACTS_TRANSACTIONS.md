# Contrato: Transactions

## Modelo (Transaction)
```
Transaction {
  id: string;
  type: 'income' | 'expense';
  description: string;       // Texto curto exibido nas listas
  amount: number;            // Valor absoluto positivo
  category: string;          // Categoria analítica
  date: string;              // dd/mm/yyyy
  time: string;              // HH:mm:ss
}
```

## Invariantes
- `amount` > 0 (sinal do tipo vem de `type`).
- `date` e `time` sempre definidos (backfill de created_at se ausentes).
- Descrição não vazia.

## Origem dos Dados
1. Tabela `transactions` (persistida).
2. Vendas convertidas dinamicamente através de `salesToTransactions` (categoria fixa 'Vendas', type 'income').

## Cache
- Hook `useTransactionsDB` aplica cache TTL (7s) via `withCache('transactions:list')`.
- Invalidação após `addTransaction`.

## Adição Manual
- `addTransaction` insere registro bruto (sem date/time explícitos — banco gera `created_at`; fallback aplicado ao ler).

## Conversão de Vendas
`utils/format.ts` -> `salesToTransactions(sales: SaleRecord[])`:
- Gera id sintético `sale-<idDaVenda>` para diferenciar de transações reais.
- Mantém ordenação por data/hora externa com `sortTransactionsDesc` depois.

## Erros & Feedback
- `notifySuccess` / `notifyError` (ou toasts diretos legados em alguns pontos a migrar totalmente).

## Futuras Extensões
- Campos `source` ('manual' | 'sale' | 'adjustment').
- Campo `tags: string[]`.
- Suporte a conciliação bancária (matching). 
