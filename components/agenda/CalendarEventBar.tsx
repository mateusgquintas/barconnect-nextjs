'use client'
import React from 'react';
import { Hotel, Users, Bus } from 'lucide-react';
import { Pilgrimage as PilgrimageType } from '@/types';

interface Room {
  id: string;
  number: number | string;
}

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

interface CalendarEvent {
  id: string;
  title: string;
  tooltip?: string;
  startDate: Date;
  endDate: Date;
  color: string;
  textColor: string;
  room?: Room;
  pilgrimage?: PilgrimageType;
  status: string;
  reservation: RoomReservation;
  isHighCapacity?: boolean; // Romaria ocupando > 80% dos quartos
  roomCount?: number; // Quantidade de quartos da romaria
}

interface CalendarEventBarProps {
  event: CalendarEvent;
  gridStartCol: number;
  gridEndCol: number;
  weekIndex: number;
  eventIndex: number;
  isCompactWeek?: boolean; // para ajustar a posição vertical conforme a altura da célula
  onClick?: () => void;
}

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  pending: { bg: 'bg-amber-50', text: 'text-amber-900', border: 'border-amber-400' },
  confirmed: { bg: 'bg-blue-50', text: 'text-blue-900', border: 'border-blue-500' },
  reserved: { bg: 'bg-blue-50', text: 'text-blue-900', border: 'border-blue-500' },
  checked_in: { bg: 'bg-emerald-50', text: 'text-emerald-900', border: 'border-emerald-500' },
  checked_out: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-400' },
  cancelled: { bg: 'bg-rose-50', text: 'text-rose-900', border: 'border-rose-400' },
};

// Layout constants
const CELL_HEIGHT_FULL_REM = 7;      // h-28 = 7rem (112px) - células com eventos
const CELL_HEIGHT_COMPACT_REM = 5;   // h-20 = 5rem (80px) - células vazias
const BAR_ROW_REM = 1.2;             // Altura + espaçamento por linha (mais compacto para caber dentro da célula)
const BAR_TOP_MARGIN_REM = 0.1;      // Margem sutil
const LANE_TOP_RATIO = 0.55;         // Posição vertical base (55% da altura da célula)

export function CalendarEventBar({ event, gridStartCol, gridEndCol, weekIndex, eventIndex, isCompactWeek, onClick }: CalendarEventBarProps) {
  const colors = statusColors[event.status] || statusColors.confirmed;
  
  // Calcula posição vertical para desenhar as barras DENTRO das células do dia (com leve sombreamento)
  const baseCellRem = isCompactWeek ? CELL_HEIGHT_COMPACT_REM : CELL_HEIGHT_FULL_REM;
  const topOffset = (baseCellRem * LANE_TOP_RATIO) + BAR_TOP_MARGIN_REM + (eventIndex * BAR_ROW_REM); // em rem
  
  // Calcula se é o primeiro ou último dia do evento para bordas arredondadas
  const isStart = gridStartCol > 1;
  const isEnd = gridEndCol <= 7;
  
  const borderRadius = `${isStart ? '0.5rem' : '0.125rem'} ${isEnd ? '0.5rem' : '0.125rem'} ${isEnd ? '0.5rem' : '0.125rem'} ${isStart ? '0.5rem' : '0.125rem'}`;
  
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={`absolute z-10 ${colors.bg} ${colors.text} px-2.5 py-1 text-xs font-semibold 
        cursor-pointer transition-all duration-200 ease-out
        hover:shadow-md hover:z-20 hover:brightness-95
        border-l-3 ${colors.border}
        overflow-hidden whitespace-nowrap text-ellipsis shadow-sm/50 ring-1 ring-black/5 bg-opacity-70`}
      style={{
        gridColumn: `${gridStartCol} / ${gridEndCol}`,
        top: `${topOffset}rem`,
        height: '1.2rem',
        left: '0.25rem',
        right: '0.25rem',
        borderRadius,
        borderLeftWidth: '3px',
      }}
      title={event.tooltip || `${event.title}\n${event.startDate.toLocaleDateString('pt-BR')} - ${event.endDate.toLocaleDateString('pt-BR')}`}
    >
      <div className="flex items-center gap-1.5 h-full relative">
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/0 to-black/10" />
        {event.pilgrimage ? (
          <>
            <Bus className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">
              {event.title}
            </span>
            {event.isHighCapacity && (
              <span className="ml-auto flex-shrink-0 px-1.5 py-0.5 bg-orange-500 text-white text-[9px] font-bold rounded">
                LOTADO
              </span>
            )}
          </>
        ) : (
          <>
            <Hotel className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">
              {event.title}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

interface CalendarGridWithEventsProps {
  month: Date;
  days: Date[];
  reservations: RoomReservation[];
  rooms: Room[];
  pilgrimages: PilgrimageType[];
  selectedDate?: Date | null;
  onDayClick?: (date: Date) => void;
  onDayDoubleClick?: (date: Date) => void;
  onEventClick?: (reservation: RoomReservation) => void;
  renderDayBadge?: (date: Date) => React.ReactNode;
  renderOccupancyBar?: (date: Date) => React.ReactNode;
}

function isSameDay(a?: Date | null, b?: Date | null) {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function CalendarGridWithEvents({
  month,
  days,
  reservations,
  rooms,
  pilgrimages,
  selectedDate,
  onDayClick,
  onDayDoubleClick,
  onEventClick,
  renderDayBadge,
  renderOccupancyBar,
}: CalendarGridWithEventsProps) {
  const monthIdx = month.getMonth();
  const year = month.getFullYear();

  // Converte reservas em eventos de calendário
  // Para ROMARIAS: agrupar por pilgrimage_id (uma barra para toda a romaria)
  // Para INDIVIDUAIS: uma barra por quarto
  const events: CalendarEvent[] = React.useMemo(() => {
    const grouped = new Map<string, typeof reservations>();
    
    reservations
      .filter(r => r.status !== 'cancelled')
      .forEach(r => {
        if (r.pilgrimage_id) {
          // Agrupar por romaria
          const key = `pilgrimage-${r.pilgrimage_id}`;
          if (!grouped.has(key)) {
            grouped.set(key, []);
          }
          grouped.get(key)!.push(r);
        } else {
          // Individual: uma barra por reserva (por quarto)
          const key = `individual-${r.id}`;
          grouped.set(key, [r]);
        }
      });
    
    return Array.from(grouped.entries()).map(([key, reservationGroup]) => {
      const firstReservation = reservationGroup[0];
      const pilgrimage = firstReservation.pilgrimage_id 
        ? pilgrimages.find(p => p.id === firstReservation.pilgrimage_id) 
        : undefined;
      
      const startDate = new Date(firstReservation.check_in_date);
      const endDate = new Date(firstReservation.check_out_date);
      
      let title = '';
      let tooltip = '';
      let isHighCapacity = false;
      
      if (pilgrimage) {
        // Calcula se é alta capacidade (> 80% dos quartos)
        const totalRooms = rooms.length;
        const occupancyPercent = totalRooms > 0 ? (reservationGroup.length / totalRooms) * 100 : 0;
        isHighCapacity = occupancyPercent > 80;
        
        // Para romarias: mostrar nome da romaria e quantidade de quartos
        title = `${pilgrimage.name} (${reservationGroup.length} quartos)`;
        
        // Tooltip rico com informações do ônibus
        const pessoas = (pilgrimage as any).numberOfPeople || (pilgrimage as any).number_of_people || 0;
        const onibus = (pilgrimage as any).busGroup || (pilgrimage as any).bus_group || 'N/A';
        tooltip = `${pilgrimage.name}\n` +
                  `Ônibus: ${onibus}\n` +
                  `${pessoas} pessoas em ${reservationGroup.length} quarto${reservationGroup.length > 1 ? 's' : ''}\n` +
                  `Ocupação: ${Math.round(occupancyPercent)}% dos quartos\n` +
                  `${startDate.toLocaleDateString('pt-BR')} - ${endDate.toLocaleDateString('pt-BR')}`;
      } else {
        // Para individuais: mostrar número do quarto
        const room = rooms.find(rm => rm.id === firstReservation.room_id);
        const roomLabel = room ? `Q${room.number}` : 'Quarto';
        const guestName = firstReservation.notes || firstReservation.customer_name || '';
        title = guestName ? `${roomLabel} - ${guestName}` : roomLabel;
        tooltip = `${title}\n${startDate.toLocaleDateString('pt-BR')} - ${endDate.toLocaleDateString('pt-BR')}`;
      }

      return {
        id: key,
        title,
        tooltip,
        startDate,
        endDate,
        color: statusColors[firstReservation.status]?.bg || 'bg-blue-500',
        textColor: statusColors[firstReservation.status]?.text || 'text-white',
        room: rooms.find(rm => rm.id === firstReservation.room_id),
        pilgrimage,
        status: firstReservation.status,
        reservation: firstReservation,
        isHighCapacity,
        roomCount: reservationGroup.length,
      };
    });
  }, [reservations, rooms, pilgrimages]);

  // Organiza eventos em semanas e calcula posicionamento
  const weekEvents = React.useMemo(() => {
    const weeks: CalendarEvent[][][] = [[], [], [], [], [], []]; // 6 semanas, cada dia pode ter múltiplos eventos
    
    days.forEach((day, dayIndex) => {
      const weekIndex = Math.floor(dayIndex / 7);
      const dayOfWeek = dayIndex % 7;
      
      if (!weeks[weekIndex]) weeks[weekIndex] = [];
      if (!weeks[weekIndex][dayOfWeek]) weeks[weekIndex][dayOfWeek] = [];
      
      // Encontra eventos que começam neste dia ou já estavam ativos
      const dayStart = new Date(day);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      
      events.forEach(event => {
        const eventStart = new Date(event.startDate);
        eventStart.setHours(0, 0, 0, 0);
        const eventEnd = new Date(event.endDate);
        eventEnd.setHours(0, 0, 0, 0);
        
        // Verifica se o evento está ativo neste dia
        if (eventStart < dayEnd && eventEnd > dayStart) {
          weeks[weekIndex][dayOfWeek].push(event);
        }
      });
    });
    
    return weeks;
  }, [days, events]);

  // Renderiza barras de eventos que podem atravessar múltiplos dias
  const renderEventBars = (weekIndex: number, isCompactWeek: boolean) => {
    const weekStart = weekIndex * 7;
    const weekDays = days.slice(weekStart, weekStart + 7);
    const processedEvents = new Set<string>();
    const bars: React.ReactElement[] = [];

    weekDays.forEach((day, dayIndex) => {
      const dayStart = new Date(day);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      events.forEach((event, eventIdx) => {
        // Evita renderizar o mesmo evento múltiplas vezes na mesma semana
        const eventKey = `${event.id}-week${weekIndex}`;
        if (processedEvents.has(eventKey)) return;

        const eventStart = new Date(event.startDate);
        eventStart.setHours(0, 0, 0, 0);
        const eventEnd = new Date(event.endDate);
        eventEnd.setHours(0, 0, 0, 0);

        // Verifica se o evento começa neste dia ou antes
        const weekEndDate = new Date(weekDays[6]);
        weekEndDate.setHours(23, 59, 59, 999);
        const startsThisWeek = eventStart >= weekDays[0] && eventStart < weekEndDate;
        const activeThisDay = eventStart < dayEnd && eventEnd > dayStart;

        if (activeThisDay && (startsThisWeek || dayIndex === 0)) {
          processedEvents.add(eventKey);

          // Calcula qual coluna o evento começa e termina
          let startCol = dayIndex + 1;
          if (eventStart < weekDays[0]) {
            startCol = 1; // Começa no início da semana
          } else {
            startCol = Math.max(1, dayIndex + 1);
          }

          let endCol = 8; // Fim da semana por padrão
          for (let i = dayIndex; i < weekDays.length; i++) {
            const checkDay = new Date(weekDays[i]);
            checkDay.setHours(23, 59, 59, 999);
            if (eventEnd <= checkDay) {
              endCol = i + 2; // +1 para índice, +1 para grid-end
              break;
            }
          }

          // Limita a 4 eventos visíveis por dia
          const displayIndex = eventIdx % 4;
          
          bars.push(
            <CalendarEventBar
              key={eventKey}
              event={event}
              gridStartCol={startCol}
              gridEndCol={endCol}
              weekIndex={weekIndex}
              eventIndex={displayIndex}
              isCompactWeek={isCompactWeek}
              onClick={() => onEventClick?.(event.reservation)}
            />
          );
        }
      });
    });

    return bars;
  };

  function dateKey(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  return (
    <div className="w-full">
      {[0, 1, 2, 3, 4, 5].map(weekIndex => {
        const weekStart = weekIndex * 7;
        const weekDays = days.slice(weekStart, weekStart + 7);
        
  // Calcula linhas necessárias (aproximação: número de eventos ativos na semana, limitado a 4)
        const weekStartDate = new Date(weekDays[0]);
        weekStartDate.setHours(0,0,0,0);
        const weekEndDate = new Date(weekDays[6]);
        weekEndDate.setHours(23,59,59,999);
        const activeThisWeek = events.filter(e => e.startDate < weekEndDate && e.endDate > weekStartDate).length;
  // As barras agora ficam DENTRO das células; não precisamos reservar espaço abaixo
  const rows = Math.min(4, activeThisWeek);
  const paddingBottomRem = 0;
        
  // Compactar semanas vazias (sem eventos) para economizar espaço
  const isEmpty = activeThisWeek === 0;
        const cellHeightClass = isEmpty ? 'h-20' : 'h-28'; // 80px vs 112px

        return (
          <div key={weekIndex} className="relative grid grid-cols-7 gap-1 mb-1" style={{ paddingBottom: `${paddingBottomRem}rem` }}>
            {/* Células de fundo */}
            {weekDays.map((d, dayIdx) => {
              const inCurrentMonth = d.getMonth() === monthIdx && d.getFullYear() === year;
              const selected = isSameDay(d, selectedDate || null);
              const key = dateKey(d);
              const isWeekend = d.getDay() === 0 || d.getDay() === 6; // Domingo ou Sábado
              
              return (
                <button
                  key={key}
                  role="gridcell"
                  aria-selected={selected}
                  data-date={key}
                  onClick={() => onDayClick?.(d)}
                  onDoubleClick={() => onDayDoubleClick?.(d)}
                  className={[
                    `${cellHeightClass} p-2 rounded-lg text-left border-2 transition-all relative`,
                    inCurrentMonth 
                      ? (isWeekend ? 'bg-blue-50/30 border-blue-200 hover:border-blue-400 hover:shadow-sm' : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm')
                      : 'bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-100',
                    selected ? 'ring-2 ring-blue-500 border-blue-500' : '',
                  ].join(' ')}
                >
                  <div className={[
                    'text-sm font-bold mb-1',
                    inCurrentMonth ? (isWeekend ? 'text-blue-700' : 'text-gray-900') : 'text-gray-400'
                  ].join(' ')}>
                    {d.getDate()}
                  </div>
                  <div className="text-[10px] space-y-1">
                    {renderOccupancyBar?.(d)}
                  </div>
                </button>
              );
            })}
            
            {/* Barras de eventos sobrepostas (dentro das células, com leve sombreamento) */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="relative grid grid-cols-7 gap-1 h-full pointer-events-auto">
                {renderEventBars(weekIndex, isEmpty)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
