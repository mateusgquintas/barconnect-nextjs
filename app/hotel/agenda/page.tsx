"use client"
import React from 'react';
import dynamic from 'next/dynamic';
import { MonthlyCalendar } from '@/components/agenda/MonthlyCalendar';
import { NewReservationDialog } from '@/components/agenda/NewReservationDialog';
import { DaySidebar } from '@/components/agenda/DaySidebar';
import { DashboardRomarias } from '@/components/agenda/DashboardRomarias';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus, Calendar, Filter, X, AlertCircle, Loader2 } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-50">
      {/* Header Profissional */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            {/* Título e Navegação */}
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 leading-tight">
                    Agenda de Reservas
                  </h1>
                  <p className="text-sm text-slate-500 capitalize">
                    {month.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Navegação de Mês */}
              <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevMonth}
                  disabled={loading}
                  className="h-8 px-3 hover:bg-white hover:shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="px-4 text-sm font-medium text-slate-700 min-w-[140px] text-center capitalize">
                  {month.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextMonth}
                  disabled={loading}
                  className="h-8 px-3 hover:bg-white hover:shadow-sm"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Ações */}
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => setOpen(true)}
                disabled={loading}
                className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm hover:shadow-md transition-all"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Reserva
              </Button>
            </div>
          </div>

          {/* Data Selecionada - Inline */}
          {selected && (
            <div className="mt-4 flex items-center gap-2 text-sm">
              <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
              <span className="text-slate-600">
                Selecionado: <span className="font-semibold text-slate-900 capitalize">
                  {selected.toLocaleDateString('pt-BR', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Container Principal */}
      <div className="max-w-[1600px] mx-auto px-6 py-6 space-y-5">
        
        {/* Filtros - Design Compacto e Elegante */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-5 py-4">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2 text-slate-700 min-w-fit">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-semibold">Filtros</span>
              </div>
              
              <div className="flex items-center gap-4 flex-1">
                {/* Filtro Romaria */}
                <div className="flex items-center gap-2.5 flex-1 max-w-xs">
                  <label className="text-sm text-slate-600 font-medium min-w-fit">Romaria:</label>
                  <select 
                    className="flex-1 h-9 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    value={filterPilgrimage}
                    onChange={(e) => setFilterPilgrimage(e.target.value)}
                  >
                    <option value="all">Todas</option>
                    {pilgrimages.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Filtro Status */}
                <div className="flex items-center gap-2.5 flex-1 max-w-xs">
                  <label className="text-sm text-slate-600 font-medium min-w-fit">Status:</label>
                  <select 
                    className="flex-1 h-9 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
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
              </div>

              {/* Botão Limpar Filtros */}
              {(filterPilgrimage !== 'all' || filterStatus !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setFilterPilgrimage('all'); setFilterStatus('all'); }}
                  className="h-9 px-3 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                >
                  <X className="w-3.5 h-3.5 mr-1.5" />
                  Limpar
                </Button>
              )}
            </div>
          </div>
        </div>

        </div>

        {/* Legenda e Export em linha compacta */}
        <div className="flex items-center justify-between gap-4">
          <CalendarLegend />
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
        
        {/* Loading State Profissional */}
        {loading && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12">
            <div className="flex flex-col items-center justify-center gap-4 text-slate-600">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-900 mb-1">Carregando agenda</p>
                <p className="text-xs text-slate-500">Buscando reservas e ocupação...</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Error State Profissional */}
        {error && (
          <div className="bg-red-50 rounded-xl border border-red-200 shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-1">Erro ao carregar dados</h3>
                <p className="text-sm text-red-700 mb-3">{error}</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => refetch?.()}
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  Tentar novamente
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Calendário */}
        {!loading && !error && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
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
                const date = new Date(reservation.check_in_date);
                setSelected(date);
                setSidebarOpen(true);
              }}
              showEvents={true}
            />
          </div>
        )}
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
