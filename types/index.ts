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
  createdBy?: string; // Nome do usuário que criou
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
  createdBy?: string; // Nome do usuário que registrou
}

export interface Pilgrimage {
  id: string;
  name: string;              // Ex: "Romaria Aparecida 2025"
  arrivalDate: string;       // Data de chegada
  departureDate: string;     // Data de saída
  numberOfPeople: number;    // Número de pessoas
  busGroup: string;          // Ex: "Ônibus 1 - Aparecida"
  contactPhone?: string;     // Telefone de contato do responsável
  status?: 'active' | 'completed' | 'cancelled'; // Status da romaria
  notes?: string;            // Observações
}