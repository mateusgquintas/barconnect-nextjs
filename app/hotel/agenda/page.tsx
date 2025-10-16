'use client'
import React from 'react';
import { MonthlyCalendar } from '@/components/agenda/MonthlyCalendar';
import { NewBookingDialog } from '@/components/agenda/NewBookingDialog';
import { notifyError, notifySuccess } from '@/utils/notify';
import { hasOverlap } from '@/utils/agenda';

export default function AgendaPage() {
  const [month, setMonth] = React.useState(() => new Date());
  const [selected, setSelected] = React.useState<Date | null>(null);
  const [open, setOpen] = React.useState(false);
  const [bookings, setBookings] = React.useState<Array<{ id: string; date: string; customer?: string }>>([]);

  function prevMonth() { const d = new Date(month); d.setMonth(d.getMonth()-1); setMonth(d); }
  function nextMonth() { const d = new Date(month); d.setMonth(d.getMonth()+1); setMonth(d); }

  function dayKey(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function renderBadge(d: Date) {
    const key = dayKey(d);
    const count = bookings.filter(b => b.date === key).length;
    if (!count) return null;
    return <span className="inline-flex items-center rounded bg-primary/10 text-primary px-1 py-0.5 text-[10px]" aria-label={`${count} reservas`}>{count} res.</span>;
  }

  async function handleCreate({ date, customer }: { date: Date; customer?: string }) {
    // Minimal single-day booking model for the skeleton: [date, date+1)
    const start = new Date(date); start.setHours(0,0,0,0);
    const end = new Date(start); end.setDate(end.getDate()+1);
    // Overlap check vs existing same-day items (since all are day-long here)
    const conflict = bookings.some(b => {
      const d = new Date(b.date + 'T00:00:00');
      const rStart = d; const rEnd = new Date(d); rEnd.setDate(rEnd.getDate()+1);
      return hasOverlap({ start, end }, { start: rStart, end: rEnd });
    });
    if (conflict) {
      notifyError('Conflito de reserva neste dia');
      return false;
    }
    const id = Math.random().toString(36).slice(2);
    setBookings(prev => [...prev, { id, date: dayKey(start), customer }]);
    notifySuccess('Reserva criada');
    return true;
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded border" onClick={prevMonth}>Mês Anterior</button>
          <button className="px-3 py-1 rounded border" onClick={nextMonth}>Próximo Mês</button>
        </div>
        {selected && (
          <div className="text-sm text-muted-foreground">Selecionado: {selected.toLocaleDateString()}</div>
        )}
      </div>
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
