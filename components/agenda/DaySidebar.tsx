import React from 'react';
import { X, Calendar, Users, Hotel, Bus, ChevronsRight, ChevronsLeft, Bed, Building2, DollarSign, Wifi, Tv, Wind, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { notifyError, notifySuccess } from '@/utils/notify';
import { cancelRoomReservation } from '@/lib/agendaService';
import { Pilgrimage as PilgrimageType } from '@/types';

interface RoomReservation {
  id: string;
  room_id: string;
  status: string;
  check_in_date: string;
  check_out_date: string;
  customer_name?: string;
  pilgrimage_id?: string;
  notes?: string | null;
}

interface Room {
  id: string;
  number: string;
  floor?: number;
  capacity?: number;
  type?: string;
  beds?: number;
  customName?: string;
  // Amenidades (quando implementadas)
  hasMinibar?: boolean;
  hasAC?: boolean;
  hasTv?: boolean;
  hasWifi?: boolean;
  hasBalcony?: boolean;
}

// Helper para pegar datas de uma romaria (compatível com occurrences)
const getPilgrimageDates = (p: PilgrimageType) => {
  const arrivalDate = p.arrivalDate || p.occurrences?.[0]?.arrivalDate || '';
  const departureDate = p.departureDate || p.occurrences?.[0]?.departureDate || '';
  return { arrivalDate, departureDate };
};

interface DaySidebarProps {
  date: Date | null;
  reservations: RoomReservation[];
  rooms: Room[];
  pilgrimages: PilgrimageType[];
  onClose: () => void;
  onCreateReservation?: (date: Date) => void;
  onReservationChanged?: () => void;
}

export function DaySidebar({ date, reservations, rooms, pilgrimages, onClose, onCreateReservation, onReservationChanged }: DaySidebarProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [cancellingId, setCancellingId] = React.useState<string | null>(null);
  if (!date) return null;

  const dateStr = date.toISOString().slice(0, 10);
  
  // Filtra reservas que incluem este dia
  const dayReservations = reservations.filter(r => {
    return r.check_in_date <= dateStr && r.check_out_date > dateStr;
  });

  // Filtra romarias ativas neste dia
  const activePilgrimages = pilgrimages.filter(p => {
    const { arrivalDate, departureDate } = getPilgrimageDates(p);
    if (!arrivalDate || !departureDate) return false;
    return arrivalDate <= dateStr && departureDate > dateStr && p.status !== 'cancelled';
  });

  const getRoomById = (id: string) => rooms.find(r => r.id === id);
  const getPilgrimageById = (id: string) => pilgrimages.find(p => p.id === id);

  // Helper para calcular duração da reserva
  const calculateDuration = (checkIn: string, checkOut: string): number => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Helper para estimar taxa (exemplo: R$ 150/dia)
  const estimateRate = (duration: number): number => {
    const dailyRate = 150; // Pode ser configurável por tipo de quarto no futuro
    return dailyRate * duration;
  };

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

  async function handleCancel(resId: string) {
    const ok = typeof window !== 'undefined' ? window.confirm('Cancelar esta reserva?') : true;
    if (!ok) return;
    try {
      setCancellingId(resId);
      await cancelRoomReservation(resId);
      notifySuccess('Reserva cancelada');
      onReservationChanged?.();
    } catch (e: any) {
      console.error('Cancel error', e);
      notifyError('Erro ao cancelar reserva', e);
    } finally {
      setCancellingId(null);
    }
  }

  const containerWidth = collapsed ? 'w-10' : 'w-96';
  const hiddenWhenCollapsed = collapsed ? 'hidden' : '';

  const formatDateMaybeTime = (value: string) => {
    if (!value) return '';
    // Se tiver hora, mostrar data e hora; senão, só data
    const hasTime = value.includes('T');
    const d = new Date(value);
    return hasTime
      ? d.toLocaleString('pt-BR')
      : d.toLocaleDateString('pt-BR');
  };

  return (
    <div
      className={`fixed right-0 ${containerWidth} bg-white shadow-2xl border-l border-slate-200 z-50 h-[calc(100vh-var(--app-header-height,56px))]`}
      style={{ top: 'var(--app-header-height, 56px)' }}
      role="region"
      aria-label="Detalhes do dia da agenda"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 p-3 border-b border-slate-200 flex-shrink-0">
          <div className={`min-w-0 ${hiddenWhenCollapsed}`}>
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {dayReservations.length} reserva{dayReservations.length !== 1 ? 's' : ''} • {activePilgrimages.length} romaria{activePilgrimages.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!collapsed && onCreateReservation && (
              <Button size="sm" onClick={() => onCreateReservation(date)}>
                Criar reserva
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? 'Expandir' : 'Recolher'}>
              {collapsed ? <ChevronsLeft className="w-5 h-5" /> : <ChevronsRight className="w-5 h-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Conteúdo rolável */}
        <div className={`flex-1 overflow-y-auto min-h-0 p-4 space-y-6 ${hiddenWhenCollapsed}`}>
        {/* Romarias Ativas */}
        {activePilgrimages.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Bus className="w-4 h-4" />
              Romarias Ativas
            </h3>
            <div className="space-y-3">
              {activePilgrimages.map(pilgrimage => {
                const { arrivalDate, departureDate } = getPilgrimageDates(pilgrimage);
                return (
                <div key={pilgrimage.id} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-medium text-purple-900">{pilgrimage.name}</h4>
                  <div className="text-sm text-purple-700 mt-1">
                    <p>
                      {arrivalDate && new Date(arrivalDate).toLocaleDateString()} - 
                      {departureDate && new Date(departureDate).toLocaleDateString()}
                    </p>
                    <p className="flex items-center gap-1 mt-1">
                      <Users className="w-3 h-3" />
                      {pilgrimage.numberOfPeople} pessoas
                    </p>
                  </div>
                </div>
              )})}
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
                const duration = calculateDuration(reservation.check_in_date, reservation.check_out_date);
                const estimatedRate = estimateRate(duration);
                
                return (
                  <div key={reservation.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                    {/* Header com quarto e status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Hotel className="w-4 h-4 text-slate-600 flex-shrink-0" />
                          <h4 className="font-semibold text-slate-900">
                            Quarto {room?.number || reservation.room_id}
                          </h4>
                        </div>
                        {room?.customName && (
                          <p className="text-xs text-slate-500 italic ml-6">{room.customName}</p>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded text-xs border whitespace-nowrap ${statusColors[reservation.status] || 'bg-gray-100 text-gray-700'}`}>
                        {statusLabels[reservation.status] || reservation.status}
                      </span>
                    </div>

                    {/* Informações do quarto */}
                    {room && (
                      <div className="flex flex-wrap gap-2">
                        {room.capacity && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{room.capacity} {room.capacity === 1 ? 'pessoa' : 'pessoas'}</span>
                          </Badge>
                        )}
                        {room.beds && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Bed className="w-3 h-3" />
                            <span>{room.beds} {room.beds === 1 ? 'cama' : 'camas'}</span>
                          </Badge>
                        )}
                        {room.floor !== undefined && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            <span>{room.floor}º andar</span>
                          </Badge>
                        )}
                        {room.type && (
                          <Badge variant="outline">
                            {room.type}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Amenidades (quando disponíveis) */}
                    {room && (room.hasWifi || room.hasTv || room.hasAC || room.hasMinibar || room.hasBalcony) && (
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
                        {room.hasWifi && (
                          <div className="flex items-center gap-1 text-xs text-slate-600" title="Wi-Fi">
                            <Wifi className="w-3 h-3" />
                          </div>
                        )}
                        {room.hasTv && (
                          <div className="flex items-center gap-1 text-xs text-slate-600" title="TV">
                            <Tv className="w-3 h-3" />
                          </div>
                        )}
                        {room.hasAC && (
                          <div className="flex items-center gap-1 text-xs text-slate-600" title="Ar-condicionado">
                            <Wind className="w-3 h-3" />
                          </div>
                        )}
                        {room.hasMinibar && (
                          <div className="flex items-center gap-1 text-xs text-slate-600" title="Frigobar">
                            <Coffee className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Hóspede/Romaria */}
                    {reservation.customer_name && (
                      <div className="pt-2 border-t border-slate-200">
                        <p className="text-sm text-slate-700">
                          <span className="font-medium">Hóspede:</span> {reservation.customer_name}
                        </p>
                      </div>
                    )}
                    {pilgrimage && (
                      <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                        <Bus className="w-4 h-4 text-purple-600" />
                        <p className="text-sm text-purple-700 font-medium">{pilgrimage.name}</p>
                      </div>
                    )}

                    {/* Datas e duração */}
                    <div className="pt-2 border-t border-slate-200 space-y-1">
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                        <div>
                          <span className="font-medium">Check-in:</span>
                          <p className="text-slate-700">{formatDateMaybeTime(reservation.check_in_date)}</p>
                        </div>
                        <div>
                          <span className="font-medium">Check-out:</span>
                          <p className="text-slate-700">{formatDateMaybeTime(reservation.check_out_date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">
                          Duração: <span className="font-medium text-slate-700">{duration} {duration === 1 ? 'dia' : 'dias'}</span>
                        </span>
                        <div className="flex items-center gap-1 text-green-700 font-semibold">
                          <DollarSign className="w-3 h-3" />
                          <span>~R$ {estimatedRate.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Observações */}
                    {reservation.notes && (
                      <div className="pt-2 border-t border-slate-200">
                        <p className="text-xs text-slate-600">
                          <span className="font-medium">Obs:</span> {reservation.notes}
                        </p>
                      </div>
                    )}

                    {/* Botões de ação */}
                    <div className="pt-2 flex items-center justify-end gap-2">
                      {reservation.status !== 'cancelled' && reservation.status !== 'checked_out' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancel(reservation.id)}
                          disabled={cancellingId === reservation.id}
                        >
                          {cancellingId === reservation.id ? 'Cancelando...' : 'Cancelar'}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
