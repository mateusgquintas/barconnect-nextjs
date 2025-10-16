import { Booking, Room, DateRange } from '@/types/agenda';
import { supabase } from '@/lib/supabase';

// NOTE: Stubs for future implementation. Keep signatures and types ready.

export async function listRooms(): Promise<Room[]> {
  // TODO: return supabase.from('rooms').select('*')
  return [];
}

export async function listBookingsInRange(range: DateRange): Promise<Booking[]> {
  // TODO: query supabase for bookings overlapping range.start..range.end
  // including status != 'cancelled'
  return [];
}

export async function createBooking(payload: Omit<Booking,'id'|'created_at'|'status'> & { status?: Booking['status'] }): Promise<string> {
  // TODO: validate overlap, then insert
  return 'booking_placeholder_id';
}

export async function cancelBooking(id: string): Promise<boolean> {
  // TODO: set status='cancelled'
  return true;
}
