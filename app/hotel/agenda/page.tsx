"use client"
import React from 'react';
import dynamic from 'next/dynamic';
import { MonthlyCalendar } from '@/components/agenda/MonthlyCalendar';
import { WeeklyCalendar } from '@/components/agenda/WeeklyCalendar';
import { NewReservationDialog } from '@/components/agenda/NewReservationDialog';
import { EditReservationDialog } from '@/components/agenda/EditReservationDialog';
import { DaySidebar } from '@/components/agenda/DaySidebar';
import { DashboardRomarias } from '@/components/agenda/DashboardRomarias';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Calendar, Filter, X, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cancelRoomReservation, syncOccurrenceCancellation } from '@/lib/agendaService';
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
import { CalendarLegend } from '@/components/agenda/CalendarLegend';

export default function AgendaPage() {
  const [month, setMonth] = React.useState(() => new Date());
  const [viewMode, setViewMode] = React.useState<'month' | 'week'>('month');
  const [selected, setSelected] = React.useState<Date | null>(null);
  const [open, setOpen] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [editingReservation, setEditingReservation] = React.useState<any | null>(null);
  const [showEditReservation, setShowEditReservation] = React.useState(false);
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

  // Filtrar reservas por romaria. O filtro de status é aplicado depois, numa segunda etapa,
  // porque "pendente/confirmada" não é um valor gravado em room_reservations.status — é
  // calculado a partir do valor em aberto (ver statusFilteredReservations mais abaixo).
  const filteredReservations = React.useMemo(() => {
    return reservations.filter(r => filterPilgrimage === 'all' || r.pilgrimage_id === filterPilgrimage);
  }, [reservations, filterPilgrimage]);

  // "Em aberto" é calculado dinamicamente (total − parcelas já pagas), não gravado fixo na reserva.
  const [openAmountByReservation, setOpenAmountByReservation] = React.useState<Record<string, number>>({});
  React.useEffect(() => {
    const ids = filteredReservations.map(r => r.id);
    if (ids.length === 0) { setOpenAmountByReservation({}); return; }
    agendaService.getOpenAmountsByReservation(ids)
      .then(setOpenAmountByReservation)
      .catch(err => console.error('Erro ao calcular valores em aberto:', err));
  }, [filteredReservations]);

  // Filtro de status da Agenda: só Pendente / Confirmada / Cancelada (check-in/check-out são
  // conceito da Gestão de Quartos, não daqui). Pendente = ainda tem valor em aberto; Confirmada
  // = sem pendência bloqueante; Cancelada = reserva cancelada.
  const statusFilteredReservations = React.useMemo(() => {
    if (filterStatus === 'all') return filteredReservations;
    return filteredReservations.filter(r => {
      if (r.status === 'cancelled') return filterStatus === 'cancelled';
      const open = openAmountByReservation[r.id] ?? (r.total_value || 0);
      const computed = open > 0 ? 'pending' : 'confirmed';
      return computed === filterStatus;
    });
  }, [filteredReservations, filterStatus, openAmountByReservation]);

  function prevMonth() { const d = new Date(month); d.setMonth(d.getMonth()-1); setMonth(d); }
  function nextMonth() { const d = new Date(month); d.setMonth(d.getMonth()+1); setMonth(d); }
  function prevWeek() { const d = new Date(month); d.setDate(d.getDate()-7); setMonth(d); }
  function nextWeek() { const d = new Date(month); d.setDate(d.getDate()+7); setMonth(d); }

  function dayKey(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }


  function handleOpenDialog(date: Date) {
    setSelected(date);
    setOpen(true);
  }

  function handleEditReservation(reservation: any) {
    setEditingReservation(reservation);
    setShowEditReservation(true);
  }

  // Chamar window.confirm() a partir do menu "..." do popover de detalhe fecha o Radix Popover
  // como efeito colateral (ele trata a interação com o confirm() nativo do navegador como um
  // clique fora do popover), então o cancelamento nunca chegava a acontecer. Usamos um diálogo
  // in-app em vez disso — mesmo padrão já aplicado ao aviso de capacidade da Nova Reserva.
  const [cancelTarget, setCancelTarget] = React.useState<any | null>(null);
  // Uma romaria com vários quartos vira várias linhas em room_reservations. Cancelar precisa
  // encerrar todas elas — senão os quartos restantes continuam ocupados e a reserva parece
  // "não ter sido cancelada" (a barra continua aparecendo na agenda).
  const [cancelTargetIds, setCancelTargetIds] = React.useState<string[]>([]);
  const [cancelling, setCancelling] = React.useState(false);

  function handleCancelReservation(reservation: any, allIds?: string[]) {
    setCancelTarget(reservation);
    setCancelTargetIds(allIds && allIds.length > 0 ? allIds : [reservation.id]);
  }

  async function confirmCancelReservation() {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await Promise.all(cancelTargetIds.map(id => cancelRoomReservation(id)));
      await syncOccurrenceCancellation(cancelTarget.occurrence_id);
      notifySuccess('Reserva cancelada!');
      setCancelTarget(null);
      setCancelTargetIds([]);
      refetch?.();
    } catch (err) {
      notifyError('Erro ao cancelar reserva', err as any);
    } finally {
      setCancelling(false);
    }
  }

  async function handleSaveEditedReservation(id: string, updates: any) {
    const { error } = await supabase.from('room_reservations').update(updates).eq('id', id);
    if (!error) refetch?.();
    return !error;
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
    <div className="flex-1 min-h-0 overflow-y-auto bg-slate-50">
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
        {!loading && !error && (() => {
          const calendarHeaderActions = (
            <div className="flex items-center gap-2">
              <Select value={viewMode} onValueChange={(v) => setViewMode(v as 'month' | 'week')}>
                <SelectTrigger className="h-9 w-28" aria-label="Alternar visualização">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Mês</SelectItem>
                  <SelectItem value="week">Semana</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => setOpen(true)}
                disabled={loading}
                size="sm"
                className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm hover:shadow-md transition-all"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Reserva
              </Button>
            </div>
          );
          const handleEventClick = (reservation: { check_in_date: string }) => {
            const date = new Date(reservation.check_in_date);
            setSelected(date);
            setSidebarOpen(true);
          };
          return (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              {viewMode === 'month' ? (
                <MonthlyCalendar
                  month={month}
                  selectedDate={selected || undefined}
                  onDayClick={(d) => { setSelected(d); setSidebarOpen(true); }}
                  onDayDoubleClick={(d) => { setSelected(d); setOpen(true); }}
                  reservations={statusFilteredReservations}
                  rooms={rooms as any}
                  pilgrimages={pilgrimages}
                  openAmountByReservation={openAmountByReservation}
                  onEditReservation={handleEditReservation}
                  onCancelReservation={handleCancelReservation}
                  onPrevMonth={prevMonth}
                  onNextMonth={nextMonth}
                  onToday={() => setMonth(new Date())}
                  headerActions={calendarHeaderActions}
                />
              ) : (
                <WeeklyCalendar
                  weekStart={month}
                  selectedDate={selected || undefined}
                  onDayClick={(d) => { setSelected(d); setSidebarOpen(true); }}
                  onDayDoubleClick={(d) => { setSelected(d); setOpen(true); }}
                  reservations={statusFilteredReservations}
                  rooms={rooms as any}
                  pilgrimages={pilgrimages}
                  onEventClick={handleEventClick}
                  onPrevWeek={prevWeek}
                  onNextWeek={nextWeek}
                  headerActions={calendarHeaderActions}
                />
              )}
            </div>
          );
        })()}
      </div>
      <NewReservationDialog
        open={open}
        onOpenChange={setOpen}
        date={selected}
        pilgrimages={pilgrimages}
        rooms={rooms as any}
        onSuccess={handleSuccess}
      />
      <EditReservationDialog
        open={showEditReservation}
        onOpenChange={setShowEditReservation}
        reservation={editingReservation}
        rooms={rooms as any}
        onSave={handleSaveEditedReservation}
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
      <Dialog open={!!cancelTarget} onOpenChange={(v) => !v && setCancelTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar reserva?</DialogTitle>
            <DialogDescription>
              {cancelTargetIds.length > 1
                ? `Isso vai cancelar os ${cancelTargetIds.length} quartos desta reserva. A reserva inteira será removida da agenda. Esta ação não pode ser desfeita.`
                : 'Esta reserva será removida da agenda. Esta ação não pode ser desfeita.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelTarget(null)} disabled={cancelling}>Voltar</Button>
            <Button onClick={confirmCancelReservation} disabled={cancelling} className="bg-red-600 hover:bg-red-700">
              {cancelling ? 'Cancelando...' : 'Cancelar Reserva'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
