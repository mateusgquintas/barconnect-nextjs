import { PaymentMethod } from '../types';

export const PAYMENT_METHOD_NAMES: Record<PaymentMethod, string> = {
  cash: 'Dinheiro',
  credit: 'Crédito',
  debit: 'Débito',
  pix: 'Pix',
  courtesy: 'Cortesia',
};

export const INCOME_CATEGORIES = [
  'Vendas',
  'Hospedagens',
  'Eventos',
  'Outros',
];

export const EXPENSE_CATEGORIES = [
  'Fornecedores',
  'Salários',
  'Luz',
  'Água',
  'Internet',
  'Manutenção',
  'Impostos',
  'Outros',
];

export const STOCK_THRESHOLDS = {
  LOW: 20,
  MEDIUM: 50,
};