export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category?: string;
  subcategory?: string;
}

export interface OrderItem {
  product: Product;
  quantity: number;
}

export interface Comanda {
  id: string;
  number: number;
  customerName?: string;
  items: OrderItem[];
  createdAt: Date;
  status: 'open' | 'closed';
}

export type PaymentMethod = 'cash' | 'credit' | 'debit' | 'pix' | 'courtesy';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  category: string;
  date: string;
  time: string;
}

export interface SaleRecord {
  id: string;
  comandaNumber?: number;
  customerName?: string;
  items: OrderItem[];
  total: number;
  paymentMethod: PaymentMethod;
  date: string;
  time: string;
  isDirectSale: boolean;
  isCourtesy: boolean;
}