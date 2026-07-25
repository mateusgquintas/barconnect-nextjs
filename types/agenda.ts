export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'checked_in' | 'checked_out';

export interface Room {
  id: string;
  name: string;
  number?: string | number;
  type?: string;
  floor?: number;
  capacity: number;
  
  // Informações básicas
  beds?: number;
  bed_configuration?: any;   // JSONB array with {id, type, quantity}
  customName?: string;
  dailyRate?: number;        // Taxa diária (R$)
  roomSize?: number;         // Área em m²
  
  // Status
  status?: 'active' | 'maintenance' | 'inactive';
  
  // Amenidades principais
  hasMinibar?: boolean;      // Frigobar
  hasAc?: boolean;           // Ar-condicionado
  hasTv?: boolean;           // TV
  hasWifi?: boolean;         // Wi-Fi
  hasBalcony?: boolean;      // Varanda
  
  // Amenidades banheiro
  hasBathtub?: boolean;      // Banheira
  hasHairdryer?: boolean;    // Secador de cabelo
  
  // Amenidades extras
  hasSafe?: boolean;         // Cofre
  hasPhone?: boolean;        // Telefone
  hasBathrobe?: boolean;     // Roupão/chinelos
  
  // Características especiais
  viewType?: string;         // Tipo de vista (oceano/cidade/jardim/etc)
  isAccessible?: boolean;    // Acessível para PCD
  isSmokingAllowed?: boolean; // Permite fumar
  isPetFriendly?: boolean;   // Pet friendly
  
  // Custos e manutenção (migration 011)
  fixedCostMonthly?: number;   // Custo fixo mensal (R$)
  variableCostDaily?: number;  // Custo variável por dia (R$)
  lastMaintenanceDate?: string; // Data última manutenção
  maintenanceNotes?: string;    // Observações de manutenção
}

// Interface simplificada para uso no Agenda (sem occurrences)
// Para dados completos, use Pilgrimage de @/types
export interface Pilgrimage {
  id: string;
  groupName: string;
  contact?: string | null;
  size?: number | null;
  notes?: string | null;
  // Opcional: datas para compatibilidade
  arrivalDate?: string;
  departureDate?: string;
}

export type AcquisitionChannel = 'agenciador' | 'booking' | 'motorista' | 'chefe_romaria' | 'direto';

export interface Booking {
  id: string;
  room_id: string;
  start: string; // ISO datetime
  end: string;   // ISO datetime
  status: BookingStatus;
  customer_name?: string | null;
  pilgrimage_id?: string | null;
  occurrence_id?: string | null;
  notes?: string | null;
  created_at?: string;
  channel?: AcquisitionChannel | null;
  total_value?: number | null;
  number_of_people?: number | null;
  number_of_buses?: number | null;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export type MonthMatrix = Date[]; // length 42, days for a 6x7 grid
