import React from 'react';
import { X, Calendar, Users, Hotel, Bus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RoomReservation {
  id: string;
  room_id: string;
  status: string;
  check_in_date: string;
  check_out_date: string;
  customer_name?: string;
  pilgrimage_id?: string;
}

interface Room {
  id: string;
  number: string;
  floor?: number;
}

interface Pilgrimage {
  id: string;
  name: string;
  arrivalDate: string;
  departureDate: string;
  numberOfPeople: number;
  status?: string;
}

interface DaySidebarProps {
  date: Date | null;
  reservations: RoomReservation[];
  rooms: Room[];
  pilgrimages: Pilgrimage[];
  onClose: () => void;
}

export function DaySidebar({ date, reservations, rooms, pilgrimages, onClose }: DaySidebarProps) {
  if (!date) return null;

  const dateStr = date.toISOString().slice(0, 10);
  
  // Filtra reservas que incluem este dia
  const dayReservations = reservations.filter(r => {
    return r.check_in_date <= dateStr && r.check_out_date > dateStr;
  });

  // Filtra romarias ativas neste dia
  const activePilgrimages = pilgrimages.filter(p => {
    return p.arrivalDate <= dateStr && p.departureDate > dateStr && p.status !== 'cancelled';
  });

  const getRoomById = (id: string) => rooms.find(r => r.id === id);
  const getPilgrimageById = (id: string) => pilgrimages.find(p => p.id === id);

  const statusLabels: Record<string, string> = {
    pending: 'Pendente',
    confirmed: 'Confirmada',
    checked_in: 'Check-in',
    checked_out: 'Check-out',
    cancelled: 'Cancelada',
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    confirmed: 'bg-blue-100 text-blue-700 border-blue-300',
    checked_in: 'bg-green-100 text-green-700 border-green-300',
    checked_out: 'bg-gray-100 text-gray-700 border-gray-300',
    cancelled: 'bg-red-100 text-red-700 border-red-300',
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l border-slate-200 z-50 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {dayReservations.length} reserva{dayReservations.length !== 1 ? 's' : ''} • {activePilgrimages.length} romaria{activePilgrimages.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="p-4 space-y-6">
        {/* Romarias Ativas */}
        {activePilgrimages.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Bus className="w-4 h-4" />
              Romarias Ativas
            </h3>
            <div className="space-y-3">
              {activePilgrimages.map(pilgrimage => (
                <div key={pilgrimage.id} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-medium text-purple-900">{pilgrimage.name}</h4>
                  <div className="text-sm text-purple-700 mt-1">
                    <p>{new Date(pilgrimage.arrivalDate).toLocaleDateString()} - {new Date(pilgrimage.departureDate).toLocaleDateString()}</p>
                    <p className="flex items-center gap-1 mt-1">
                      <Users className="w-3 h-3" />
                      {pilgrimage.numberOfPeople} pessoas
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reservas do Dia */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Hotel className="w-4 h-4" />
            Reservas
          </h3>
          {dayReservations.length === 0 ? (
            <p className="text-sm text-slate-500 italic">Nenhuma reserva para este dia.</p>
          ) : (
            <div className="space-y-3">
              {dayReservations.map(reservation => {
                const room = getRoomById(reservation.room_id);
                const pilgrimage = reservation.pilgrimage_id ? getPilgrimageById(reservation.pilgrimage_id) : null;
                return (
                  <div key={reservation.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-slate-900">
                          Quarto {room?.number || reservation.room_id}
                        </h4>
                        {reservation.customer_name && (
                          <p className="text-sm text-slate-600">{reservation.customer_name}</p>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded text-xs border ${statusColors[reservation.status] || 'bg-gray-100 text-gray-700'}`}>
                        {statusLabels[reservation.status] || reservation.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 space-y-1">
                      <p>Check-in: {new Date(reservation.check_in_date).toLocaleDateString()}</p>
                      <p>Check-out: {new Date(reservation.check_out_date).toLocaleDateString()}</p>
                    </div>
                    {pilgrimage && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-purple-600">
                        <Bus className="w-3 h-3" />
                        <span>{pilgrimage.name}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
