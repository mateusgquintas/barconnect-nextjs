'use client'
import React from 'react';
import { MonthlyCalendar } from '@/components/agenda/MonthlyCalendar';
import { NewBookingDialog } from '@/components/agenda/NewBookingDialog';
import { DaySidebar } from '@/components/agenda/DaySidebar';
import { notifyError, notifySuccess } from '@/utils/notify';
import { useAgendaDB } from '@/hooks/useAgendaDB';
import { usePilgrimagesDB } from '@/hooks/usePilgrimagesDB';
import { supabase } from '@/lib/supabase';
import { getOccupancyByDay } from '@/lib/agendaService';
import { DayOccupancyBar } from '@/components/agenda/DayOccupancyBar';

export default function AgendaPage() {
  const [month, setMonth] = React.useState(() => new Date());
  const [selected, setSelected] = React.useState<Date | null>(null);
  const [open, setOpen] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const { reservations, loading, error } = useAgendaDB(month.getMonth() + 1, month.getFullYear());
  const { pilgrimages } = usePilgrimagesDB();
  const [rooms, setRooms] = React.useState<any[]>([]);
  const [occupancy, setOccupancy] = React.useState<Record<string, number>>({});
  React.useEffect(() => {
    supabase.from('rooms').select('*').then(({ data }: any) => setRooms(data || []));
  }, []);
  React.useEffect(() => {
    getOccupancyByDay(month.getMonth() + 1, month.getFullYear()).then(setOccupancy);
  }, [month, reservations]);

  function prevMonth() { const d = new Date(month); d.setMonth(d.getMonth()-1); setMonth(d); }
  function nextMonth() { const d = new Date(month); d.setMonth(d.getMonth()+1); setMonth(d); }

  function dayKey(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function renderBadge(d: Date) {
    // Conta reservas que incluem este dia
    const dayStart = new Date(d); dayStart.setHours(0,0,0,0);
    const dayEnd = new Date(dayStart); dayEnd.setDate(dayEnd.getDate() + 1);
    const count = reservations.filter(b => {
      const bStart = new Date(b.check_in_date);
      const bEnd = new Date(b.check_out_date);
      return bStart < dayEnd && bEnd > dayStart;
    }).length;
    if (!count) return null;
    return <span className="inline-flex items-center rounded bg-primary/10 text-primary px-1 py-0.5 text-[10px]" aria-label={`${count} reservas`}>{count} res.</span>;
  }

  function renderOccupancyBar(d: Date) {
    const key = d.toISOString().slice(0,10);
    const percent = occupancy[key] ?? 0;
    return percent > 0 ? <DayOccupancyBar percent={percent} /> : null;
  }

  async function handleCreate({ date, customer }: { date: Date; customer?: string }) {
    if (rooms.length === 0) {
      notifyError('Nenhum quarto disponível. Configure quartos primeiro.');
      return false;
    }
    // Cria reserva simples para o primeiro quarto disponível
    const start = new Date(date); start.setHours(0,0,0,0);
    const end = new Date(start); end.setDate(end.getDate()+1);
    try {
      const { data, error } = await supabase.from('room_reservations').insert({
        room_id: rooms[0].id,
        check_in_date: start.toISOString().slice(0,10),
        check_out_date: end.toISOString().slice(0,10),
        status: 'pending',
        customer_name: customer || null,
      }).select('id').single();
      if (error) throw error;
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
      {error && <div className="text-sm text-red-500">Erro: {error}</div>}
      <MonthlyCalendar
        month={month}
        selectedDate={selected || undefined}
        onDayClick={(d) => { setSelected(d); setSidebarOpen(true); }}
        renderDayBadge={renderBadge}
        renderOccupancyBar={renderOccupancyBar}
      />
      <NewBookingDialog
        open={open}
        onOpenChange={setOpen}
        date={selected}
        onCreate={handleCreate}
      />
      <DaySidebar
        date={sidebarOpen ? selected : null}
        reservations={reservations}
        rooms={rooms}
        pilgrimages={pilgrimages}
        onClose={() => setSidebarOpen(false)}
      />
    </div>
  );
}
