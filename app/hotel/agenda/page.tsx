'use client'
import React from 'react';
import { MonthlyCalendar } from '@/components/agenda/MonthlyCalendar';
import { NewBookingDialog } from '@/components/agenda/NewBookingDialog';
import { notifyError, notifySuccess } from '@/utils/notify';
import { listBookingsInRange, listRooms, createBooking } from '@/lib/agendaService';
import type { Booking, Room } from '@/types/agenda';

export default function AgendaPage() {
  const [month, setMonth] = React.useState(() => new Date());
  const [selected, setSelected] = React.useState<Date | null>(null);
  const [open, setOpen] = React.useState(false);
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [rooms, setRooms] = React.useState<Room[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Load bookings for the current month
  React.useEffect(() => {
    const start = new Date(month.getFullYear(), month.getMonth(), 1);
    const end = new Date(month.getFullYear(), month.getMonth() + 1, 1);
    setLoading(true);
    Promise.all([
      listBookingsInRange({ start, end }),
      listRooms()
    ])
      .then(([bookingsData, roomsData]) => {
        setBookings(bookingsData);
        setRooms(roomsData);
      })
      .catch(err => {
        console.error('[AgendaPage] load error:', err);
        notifyError('Erro ao carregar agenda', err);
      })
      .finally(() => setLoading(false));
  }, [month]);

  function prevMonth() { const d = new Date(month); d.setMonth(d.getMonth()-1); setMonth(d); }
  function nextMonth() { const d = new Date(month); d.setMonth(d.getMonth()+1); setMonth(d); }

  function dayKey(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function renderBadge(d: Date) {
    // Count bookings that overlap this day
    const dayStart = new Date(d); dayStart.setHours(0,0,0,0);
    const dayEnd = new Date(dayStart); dayEnd.setDate(dayEnd.getDate() + 1);
    const count = bookings.filter(b => {
      const bStart = new Date(b.start);
      const bEnd = new Date(b.end);
      return bStart < dayEnd && bEnd > dayStart;
    }).length;
    if (!count) return null;
    return <span className="inline-flex items-center rounded bg-primary/10 text-primary px-1 py-0.5 text-[10px]" aria-label={`${count} reservas`}>{count} res.</span>;
  }

  async function handleCreate({ date, customer }: { date: Date; customer?: string }) {
    if (rooms.length === 0) {
      notifyError('Nenhum quarto disponível. Configure quartos primeiro.');
      return false;
    }
    
    // For simple day booking: use first available room and create booking [date 00:00, date+1 00:00)
    const start = new Date(date); start.setHours(0,0,0,0);
    const end = new Date(start); end.setDate(end.getDate()+1);
    
    try {
      const newId = await createBooking({
        room_id: rooms[0].id, // Use first room for now (in real app, user selects)
        start: start.toISOString(),
        end: end.toISOString(),
        customer_name: customer || null,
      });
      
      // Optimistic update
      setBookings(prev => [...prev, {
        id: newId,
        room_id: rooms[0].id,
        start: start.toISOString(),
        end: end.toISOString(),
        status: 'pending',
        customer_name: customer || null,
      }]);
      
      notifySuccess('Reserva criada');
      return true;
    } catch (err: any) {
      notifyError('Erro ao criar reserva', err);
      return false;
    }
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded border" onClick={prevMonth} disabled={loading}>
            Mês Anterior
          </button>
          <button className="px-3 py-1 rounded border" onClick={nextMonth} disabled={loading}>
            Próximo Mês
          </button>
        </div>
        {selected && (
          <div className="text-sm text-muted-foreground">Selecionado: {selected.toLocaleDateString()}</div>
        )}
      </div>
      {loading && <div className="text-sm text-muted-foreground">Carregando...</div>}
      <MonthlyCalendar
        month={month}
        selectedDate={selected || undefined}
        onDayClick={(d) => { setSelected(d); setOpen(true); }}
        renderDayBadge={renderBadge}
      />
      <NewBookingDialog
        open={open}
        onOpenChange={setOpen}
        date={selected}
        onCreate={handleCreate}
      />
    </div>
  );
}
