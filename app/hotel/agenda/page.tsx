"use client"
import React from 'react';
import dynamic from 'next/dynamic';
import { MonthlyCalendar } from '@/components/agenda/MonthlyCalendar';
import { NewReservationDialog } from '@/components/agenda/NewReservationDialog';
import { DaySidebar } from '@/components/agenda/DaySidebar';
import { DashboardRomarias } from '@/components/agenda/DashboardRomarias';
// Defer heavy PDF export component to improve initial UI responsiveness
const ExportAgendaPDF = dynamic(() => import('@/components/agenda/ExportAgendaPDF').then(m => m.ExportAgendaPDF), {
  ssr: false,
  loading: () => <div className="text-sm text-muted-foreground">Preparando exportação…</div>,
});
import { notifyError, notifySuccess } from '@/utils/notify';
import { useAgendaDB } from '@/hooks/useAgendaDB';
import { usePilgrimagesDB } from '@/hooks/usePilgrimagesDB';
import { useRoomsDB } from '@/hooks/useRoomsDB';
import * as agendaService from '@/lib/agendaService';
import { DayOccupancyBar } from '@/components/agenda/DayOccupancyBar';
import { CalendarLegend } from '@/components/agenda/CalendarLegend';

export default function AgendaPage() {
  const [month, setMonth] = React.useState(() => new Date());
  const [selected, setSelected] = React.useState<Date | null>(null);
  const [open, setOpen] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [filterPilgrimage, setFilterPilgrimage] = React.useState<string>('all');
  const [filterStatus, setFilterStatus] = React.useState<string>('all');
  const { reservations, loading, error, refetch } = useAgendaDB(month.getMonth() + 1, month.getFullYear());
  const { pilgrimages } = usePilgrimagesDB();
  const { rooms } = useRoomsDB();
  const [occupancy, setOccupancy] = React.useState<Record<string, { 
    percent: number; 
    occupied: number; 
    total: number;
    occupiedPeople: number;
    totalPeople: number;
    peoplePercent: number;
  }>>({});
  
  React.useEffect(() => {
    const fn = (agendaService as any)?.getDetailedOccupancyByDay;
    if (typeof fn === 'function') {
      fn(month.getMonth() + 1, month.getFullYear()).then(setOccupancy).catch(() => {});
    }
  }, [month, reservations]);

  // Persistência de filtros
  React.useEffect(() => {
    try {
      const saved = typeof window !== 'undefined' ? window.localStorage.getItem('agenda:filters') : null;
      if (saved) {
        const obj = JSON.parse(saved);
        if (obj.status) setFilterStatus(obj.status);
        if (obj.pilgrimage) setFilterPilgrimage(obj.pilgrimage);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('agenda:filters', JSON.stringify({ status: filterStatus, pilgrimage: filterPilgrimage }));
      }
    } catch {}
  }, [filterStatus, filterPilgrimage]);

  // Filtrar reservas
  const filteredReservations = React.useMemo(() => {
    return reservations.filter(r => {
      if (filterPilgrimage !== 'all' && r.pilgrimage_id !== filterPilgrimage) return false;
      if (filterStatus !== 'all' && r.status !== filterStatus) return false;
      return true;
    });
  }, [reservations, filterPilgrimage, filterStatus]);

  function prevMonth() { const d = new Date(month); d.setMonth(d.getMonth()-1); setMonth(d); }
  function nextMonth() { const d = new Date(month); d.setMonth(d.getMonth()+1); setMonth(d); }

  function dayKey(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  const renderBadge = React.useCallback((d: Date) => {
    // Mostra contadores de quartos e pessoas na segunda linha com legendas
    const key = d.toISOString().slice(0,10);
    const data = occupancy[key];
    
    if (!data || (data.occupied === 0 && data.occupiedPeople === 0)) return null;
    
    return (
      <div className="flex items-center justify-between gap-2 w-full text-[10px] font-semibold">
        {/* Quartos - alinhado à esquerda */}
        <span className="text-blue-700 tabular-nums" aria-label={`${data.occupied} de ${data.total} quartos reservados`}>
          {data.occupied}/{data.total} <span className="text-slate-500 font-normal">Quartos</span>
        </span>
        
        {/* Pessoas - alinhado à direita */}
        <span className="text-purple-700 tabular-nums" aria-label={`${data.occupiedPeople} de ${data.totalPeople} pessoas`}>
          {data.occupiedPeople}/{data.totalPeople} <span className="text-slate-500 font-normal">Pessoas</span>
        </span>
      </div>
    );
  }, [occupancy]);

  const renderOccupancyBar = React.useCallback((d: Date) => {
    const key = d.toISOString().slice(0,10);
    const data = occupancy[key];
    if (!data || data.percent === 0) return null;
    return <DayOccupancyBar percent={data.percent} occupied={data.occupied} total={data.total} />;
  }, [occupancy]);

  function handleOpenDialog(date: Date) {
    setSelected(date);
    setOpen(true);
  }

  function handleSuccess() {
    // Recarrega dados após criar reserva
    refetch?.();
    const fn = (agendaService as any)?.getDetailedOccupancyByDay;
    if (typeof fn === 'function') {
      fn(month.getMonth() + 1, month.getFullYear()).then(setOccupancy).catch(() => {});
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
          <button 
            className="px-3 py-1 rounded border bg-primary text-primary-foreground hover:bg-primary/90" 
            onClick={() => setOpen(true)}
          >
            + Nova Reserva
          </button>
        </div>
        {selected && (
          <div className="text-sm text-muted-foreground">Selecionado: {selected.toLocaleDateString()}</div>
        )}
      </div>
      
        {/* Filtros */}
        <div className="flex gap-3 items-center">
          <div className="flex gap-2 items-center">
            <label className="text-sm font-medium">Romaria:</label>
            <select 
              className="px-2 py-1 rounded border text-sm"
              value={filterPilgrimage}
              onChange={(e) => setFilterPilgrimage(e.target.value)}
            >
              <option value="all">Todas</option>
              {pilgrimages.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 items-center">
            <label className="text-sm font-medium">Status:</label>
            <select 
              className="px-2 py-1 rounded border text-sm"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="pending">Pendente</option>
              <option value="confirmed">Confirmada</option>
              <option value="checked_in">Check-in</option>
              <option value="checked_out">Check-out</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </div>
          {(filterPilgrimage !== 'all' || filterStatus !== 'all') && (
            <button 
              className="text-sm text-muted-foreground hover:text-foreground"
              onClick={() => { setFilterPilgrimage('all'); setFilterStatus('all'); }}
            >
              Limpar filtros
            </button>
          )}
        </div>

      {/* Legenda de cores */}
      <CalendarLegend />
      
      {/* Exportar PDF */}
      <div className="mb-4">
        <ExportAgendaPDF 
          month={month}
          reservations={filteredReservations}
          pilgrimages={pilgrimages}
          rooms={rooms as any}
          occupancy={Object.fromEntries(
            Object.entries(occupancy).map(([date, data]) => [date, data.percent])
          )}
        />
      </div>
      
      {/* Dashboard de Romarias */}
      <DashboardRomarias 
        month={month}
        reservations={filteredReservations}
        pilgrimages={pilgrimages}
        totalRooms={rooms.length}
      />
      
      {loading && <div className="text-sm text-muted-foreground">Carregando...</div>}
      {error && <div className="text-sm text-red-500">Erro: {error}</div>}
      <MonthlyCalendar
        month={month}
        selectedDate={selected || undefined}
        onDayClick={(d) => { setSelected(d); setSidebarOpen(true); }}
        onDayDoubleClick={(d) => { setSelected(d); setOpen(true); }}
        renderDayBadge={renderBadge}
        renderOccupancyBar={renderOccupancyBar}
        reservations={filteredReservations}
        rooms={rooms as any}
        pilgrimages={pilgrimages}
        onEventClick={(reservation) => {
          // Quando clicar em um evento, abre a sidebar naquele dia
          const date = new Date(reservation.check_in_date);
          setSelected(date);
          setSidebarOpen(true);
        }}
        showEvents={true}
      />
      <NewReservationDialog
        open={open}
        onOpenChange={setOpen}
        date={selected}
        pilgrimages={pilgrimages}
        rooms={rooms as any}
        onSuccess={handleSuccess}
      />
      <DaySidebar
        date={sidebarOpen ? selected : null}
          reservations={filteredReservations}
        rooms={rooms as any}
        pilgrimages={pilgrimages}
        onCreateReservation={(d) => { setSelected(d); setOpen(true); }}
        onReservationChanged={handleSuccess}
        onClose={() => setSidebarOpen(false)}
      />
    </div>
  );
}
