import React from 'react';
import { X, Calendar, Users, Hotel, Bus, ChevronsRight, ChevronsLeft, Bed, Building2, DollarSign, Wifi, Tv, Wind, Coffee, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { notifyError, notifySuccess } from '@/utils/notify';
import { cancelRoomReservation } from '@/lib/agendaService';
import { Pilgrimage as PilgrimageType } from '@/types';
import { EditRomariaDialog } from './EditRomariaDialog';

interface RoomReservation {
  id: string;
  room_id: string;
  status: string;
  check_in_date: string;
  check_out_date: string;
  customer_name?: string;
  pilgrimage_id?: string;
  notes?: string | null;
  number_of_people?: number | null;
  total_value?: number | null;
  occurrence_id?: string | null;
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

// Helper para extrair número de pessoas das notas
const extractPeopleCount = (notes: string | null | undefined): number | null => {
  if (!notes) return null;
  const match = notes.match(/(\d+)\s+pessoas/i);
  return match ? parseInt(match[1]) : null;
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
  const [editingPilgrimage, setEditingPilgrimage] = React.useState<{ pilgrimage: PilgrimageType; reservations: RoomReservation[] } | null>(null);
  if (!date) return null;

  const dateStr = date.toISOString().slice(0, 10);
  
  // Filtra reservas que incluem este dia
  const dayReservations = reservations.filter(r => {
    return r.check_in_date <= dateStr && r.check_out_date > dateStr;
  });

  // Agrupa reservas por romaria. Usa occurrence_id (a vinda específica) quando disponível —
  // agrupar só por pilgrimage_id misturaria quartos de vindas diferentes da mesma romaria caso
  // elas coincidissem no mesmo dia (ex: check-out de uma vinda e check-in de outra).
  const pilgrimageGroups = new Map<string, { pilgrimageId: string; reservations: RoomReservation[] }>();
  const individualReservations: RoomReservation[] = [];

  dayReservations.forEach(r => {
    if (r.pilgrimage_id) {
      const key = r.occurrence_id ? `occurrence-${r.occurrence_id}` : `pilgrimage-${r.pilgrimage_id}`;
      if (!pilgrimageGroups.has(key)) {
        pilgrimageGroups.set(key, { pilgrimageId: r.pilgrimage_id, reservations: [] });
      }
      pilgrimageGroups.get(key)!.reservations.push(r);
    } else {
      individualReservations.push(r);
    }
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
              {pilgrimageGroups.size} romaria{pilgrimageGroups.size !== 1 ? 's' : ''} • {individualReservations.length} individual{individualReservations.length !== 1 ? 'is' : ''}
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
            <div className="space-y-4">
              {/* ROMARIAS AGRUPADAS */}
              {Array.from(pilgrimageGroups.entries()).map(([groupKey, { pilgrimageId, reservations: reserves }]) => {
                const pilgrimage = getPilgrimageById(pilgrimageId);
                if (!pilgrimage) return null;
                
                const roomNumbers = reserves.map(r => {
                  const room = getRoomById(r.room_id);
                  return room?.number || r.room_id;
                }).join(', ');
                
                // Soma o número de pessoas gravado em cada linha (mesma fonte que a Agenda e o
                // card de detalhe usam), em vez de tentar extrair um número do texto de notas.
                const totalPeople = reserves.reduce((sum, r) => sum + (r.number_of_people || 0), 0);

                return (
                  <div key={groupKey} className="p-4 bg-purple-50 rounded-lg border-2 border-purple-300 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Bus className="w-5 h-5 text-purple-600 flex-shrink-0" />
                          <h4 className="font-semibold text-purple-900">{pilgrimage.name}</h4>
                        </div>
                        <p className="text-sm text-purple-700 ml-7">
                          {reserves.length} quarto{reserves.length > 1 ? 's' : ''} • {totalPeople > 0 ? totalPeople : pilgrimage.numberOfPeople || 0} pessoas
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs border whitespace-nowrap ${statusColors[reserves[0].status] || 'bg-gray-100 text-gray-700'}`}>
                        {statusLabels[reserves[0].status] || reserves[0].status}
                      </span>
                    </div>

                    {/* Lista de quartos */}
                    <div className="pt-2 border-t border-purple-200">
                      <p className="text-xs font-medium text-purple-700 mb-1">Quartos:</p>
                      <p className="text-sm text-purple-900">{roomNumbers}</p>
                    </div>

                    {/* Datas */}
                    <div className="pt-2 border-t border-purple-200">
                      <div className="grid grid-cols-2 gap-2 text-xs text-purple-700">
                        <div>
                          <span className="font-medium">Check-in:</span>
                          <p className="text-purple-900">{formatDateMaybeTime(reserves[0].check_in_date)}</p>
                        </div>
                        <div>
                          <span className="font-medium">Check-out:</span>
                          <p className="text-purple-900">{formatDateMaybeTime(reserves[0].check_out_date)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex gap-2 pt-2 border-t border-purple-200">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-purple-300 text-purple-700 hover:bg-purple-100"
                        onClick={() => setEditingPilgrimage({ pilgrimage, reservations: reserves })}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </div>
                );
              })}

              {/* RESERVAS INDIVIDUAIS */}
              {individualReservations.map(reservation => {
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
                    
                    {/* Número de pessoas (se informado nas notas) */}
                    {!reservation.pilgrimage_id && extractPeopleCount(reservation.notes) && (
                      <div className="pt-2 border-t border-slate-200">
                        <p className="text-sm text-slate-700 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span className="font-medium">{extractPeopleCount(reservation.notes)} pessoas</span>
                        </p>
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

      {/* Dialog de Edição de Romaria */}
      {editingPilgrimage && (
        <EditRomariaDialog
          open={true}
          onOpenChange={(open) => {
            if (!open) setEditingPilgrimage(null);
          }}
          pilgrimage={editingPilgrimage.pilgrimage}
          reservations={editingPilgrimage.reservations}
          allRooms={rooms}
          onSuccess={() => {
            setEditingPilgrimage(null);
            onReservationChanged?.();
          }}
        />
      )}
    </div>
  );
}