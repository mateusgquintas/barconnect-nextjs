export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category?: string;
  subcategory?: string;
  min_stock?: number;
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
  numberOfPeople: number;                        // Número de pessoas NESTA vinda (varia a cada ocorrência)
  numberOfBuses?: number;                        // Número de ônibus NESTA vinda
  status: 'scheduled' | 'active' | 'completed' | 'cancelled'; // Status desta ocorrência
  notes?: string;                                // Observações específicas desta ocorrência
  createdAt?: string;
  updatedAt?: string;
}

export interface Pilgrimage {
  id: string;
  name: string;              // Ex: "Romaria Aparecida" — grupo único, reutilizado a cada vinda
  busGroup: string;          // Ex: "Ônibus 1 - Aparecida"
  contactPhone?: string;     // Telefone de contato do responsável
  status?: 'active' | 'completed' | 'cancelled'; // Status da romaria (calculado a partir das ocorrências)
  origin?: string;           // Cidade/região de origem da romaria
  notes?: string;            // Observações gerais
  // Canal de aquisição padrão desta romaria (agenciador, booking, motorista, chefe_romaria, direto).
  // Usado para pré-preencher o canal automaticamente na Agenda e no Faturamento por Canal,
  // já que romarias recorrentes normalmente sempre chegam pelo mesmo canal.
  defaultChannel?: 'agenciador' | 'booking' | 'motorista' | 'chefe_romaria' | 'direto';

  // Múltiplas ocorrências/datas: cada vinda do grupo, com seu próprio número de pessoas
  occurrences: PilgrimageOccurrence[];

  // DEPRECATED: mantido apenas por compatibilidade com dados antigos; não usar em código novo
  numberOfPeople?: number;   // @deprecated Use occurrences[i].numberOfPeople
  arrivalDate?: string;      // @deprecated Use occurrences array
  departureDate?: string;    // @deprecated Use occurrences array
}

// Tipo helper para forms que ainda usam o modelo antigo (single date)
export type PilgrimageFormData = Omit<Pilgrimage, 'id' | 'occurrences' | 'numberOfPeople'> & {
  arrivalDate: string;
  departureDate: string;
  numberOfPeople: number; // pessoas da PRIMEIRA ocorrência sendo criada/editada
  occurrences?: PilgrimageOccurrence[]; // Opcional para compatibilidade
};