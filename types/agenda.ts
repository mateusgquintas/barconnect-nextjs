export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'checked_in' | 'checked_out';

export interface Room {
  id: string;
  name: string;
  capacity?: number | null;
  status?: 'active' | 'maintenance' | 'inactive';
}

export interface Pilgrimage {
  id: string;
  groupName: string;
  contact?: string | null;
  size?: number | null;
  notes?: string | null;
}

export interface Booking {
  id: string;
  room_id: string;
  start: string; // ISO datetime
  end: string;   // ISO datetime
  status: BookingStatus;
  customer_name?: string | null;
  pilgrimage_id?: string | null;
  created_at?: string;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export type MonthMatrix = Date[]; // length 42, days for a 6x7 grid
