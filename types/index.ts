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

export interface PilgrimageOccurrence {
  id: string;
  pilgrimageId: string;                          // Referência à romaria
  arrivalDate: string;                           // Data de chegada desta ocorrência
  departureDate: string;                         // Data de saída desta ocorrência
  status: 'scheduled' | 'active' | 'completed' | 'cancelled'; // Status desta ocorrência
  notes?: string;                                // Observações específicas desta ocorrência
  createdAt?: string;
  updatedAt?: string;
}

export interface Pilgrimage {
  id: string;
  name: string;              // Ex: "Romaria Aparecida 2025"
  numberOfPeople: number;    // Número de pessoas
  busGroup: string;          // Ex: "Ônibus 1 - Aparecida"
  contactPhone?: string;     // Telefone de contato do responsável
  status?: 'active' | 'completed' | 'cancelled'; // Status da romaria
  notes?: string;            // Observações gerais
  
  // NOVO: Múltiplas ocorrências/datas
  occurrences: PilgrimageOccurrence[];
  
  // DEPRECATED: Mantido para compatibilidade (use occurrences[0])
  arrivalDate?: string;      // @deprecated Use occurrences array
  departureDate?: string;    // @deprecated Use occurrences array
}

// Tipo helper para forms que ainda usam o modelo antigo (single date)
export type PilgrimageFormData = Omit<Pilgrimage, 'id' | 'occurrences'> & {
  arrivalDate: string;
  departureDate: string;
  occurrences?: PilgrimageOccurrence[]; // Opcional para compatibilidade
};