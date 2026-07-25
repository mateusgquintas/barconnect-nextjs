'use client'
import { useState, useEffect, useRef } from 'react';
import { Room } from '../hooks/useRoomsDB';
import { useRoomOperationalStatus } from '@/hooks/useRoomOperationalStatus';
import { Pilgrimage as PilgrimageType } from '@/types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Bed, Users, Clock, DollarSign, Search, Bus, Wrench, Plus, Edit, Tv, Wind, Wifi, Wine, Home, Building2, X, Calendar, TrendingUp, FileSpreadsheet, Printer, Accessibility, PawPrint, Filter, LogIn, CalendarSearch } from 'lucide-react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { usePilgrimagesDB } from '../hooks/usePilgrimagesDB';
import { RoomEditDialog } from './rooms/RoomEditDialog';
import { NewReservationDialog } from './agenda/NewReservationDialog';
import { exportRoomsToExcel } from '@/lib/exportRoomsToExcel';
import { getOpenAmountsByReservation, syncOccurrenceCancellation } from '@/lib/agendaService';
import { supabase } from '@/lib/supabase';
import { notifyError, notifySuccess } from '@/utils/notify';
import { getLocalDateStr } from '@/utils/agenda';
import { formatCurrency } from '@/utils/format';

interface PeriodReservation {
  id: string;
  room_id: string;
  check_in_date: string;
  check_out_date: string;
  total_value: number | null;
  number_of_people: number | null;
  notes: string | null;
  pilgrimage_id: string | null;
}

// Helper para compatibilidade com múltiplas datas
const getPilgrimageDates = (p: PilgrimageType) => {
  const arrivalDate = p.arrivalDate || p.occurrences?.[0]?.arrivalDate || '';
  const departureDate = p.departureDate || p.occurrences?.[0]?.departureDate || '';
  return { arrivalDate, departureDate };
};
const roomTypeLabels = {
  standard: 'Prédio Principal',
  anexo: 'Anexo',
  pousada: 'Pousada',
  single: 'Solteiro',
  double: 'Casal',
  suite: 'Suíte',
};

const statusLabels = {
  available: 'Disponível',
  reserved: 'Reservado',
  occupied: 'Ocupado',
  cleaning: 'Limpeza',
  maintenance: 'Manutenção',
};

const statusColors = {
  available: 'bg-green-100 text-green-700 border-green-200',
  reserved: 'bg-blue-100 text-blue-700 border-blue-200',
  occupied: 'bg-red-100 text-red-700 border-red-200',
  cleaning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  maintenance: 'bg-gray-100 text-gray-700 border-gray-200',
};

export function Hotel() {
  const { rooms, loading, error, updateRoom, addRoom, getEffectiveStatus, activeBookingByRoom, reservedBookingByRoom, bookingInfoByRoom } = useRoomOperationalStatus();
  const { pilgrimages } = usePilgrimagesDB();

  // Tipagem explícita para pilgrimages
  type Pilgrimage = {
    id: string;
    name: string;
    arrivalDate: string;
    departureDate: string;
    numberOfPeople: number;
    busGroup: string;
    contactPhone?: string;
    status?: 'active' | 'completed' | 'cancelled';
    notes?: string;
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'number' | 'capacity' | 'floor'>('number');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPilgrimage, setFilterPilgrimage] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterBuilding, setFilterBuilding] = useState<string>('all');
  const [filterFloor, setFilterFloor] = useState<string>('all');
  const [filterMinCapacity, setFilterMinCapacity] = useState<string>('');
  const [filterMaxCapacity, setFilterMaxCapacity] = useState<string>('');
  const [filterAmenities, setFilterAmenities] = useState<{
    hasTv: boolean;
    hasAc: boolean;
    hasWifi: boolean;
    hasMinibar: boolean;
    hasBalcony: boolean;
  }>({
    hasTv: false,
    hasAc: false,
    hasWifi: false,
    hasMinibar: false,
    hasBalcony: false,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showPrintOptions, setShowPrintOptions] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');

  // Filtro simples de período: "quais quartos estão disponíveis entre X e Y" — não é um calendário navegável.
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [periodBookings, setPeriodBookings] = useState<PeriodReservation[] | null>(null);
  const [periodOpenAmounts, setPeriodOpenAmounts] = useState<Record<string, number>>({});
  const [periodLoading, setPeriodLoading] = useState(false);
  const [periodDetailRoomId, setPeriodDetailRoomId] = useState<string | null>(null);
  const [periodReservationDate, setPeriodReservationDate] = useState<Date | null>(null);
  const [showNewReservation, setShowNewReservation] = useState(false);

  // Check-in: abre um formulário para capturar dados do hóspede em vez de trocar o status direto.
  const [checkInRoom, setCheckInRoom] = useState<Room | null>(null);
  const [checkInGuestName, setCheckInGuestName] = useState('');
  const [checkInGuestCpf, setCheckInGuestCpf] = useState('');
  const [checkInGuestPhone, setCheckInGuestPhone] = useState('');
  const [checkInCheckOutDate, setCheckInCheckOutDate] = useState('');
  const [checkInObservations, setCheckInObservations] = useState('');

  // Manutenção: exige uma observação sobre o problema antes de bloquear o quarto.
  const [maintenanceRoom, setMaintenanceRoom] = useState<Room | null>(null);
  const [maintenanceNote, setMaintenanceNote] = useState('');

  // Exclusão de quarto: bloqueada se houver reservas ativas vinculadas.
  const [deleteRoomTarget, setDeleteRoomTarget] = useState<Room | null>(null);
  const [deleteChecking, setDeleteChecking] = useState(false);
  const [deleteBlockedMessage, setDeleteBlockedMessage] = useState<string | null>(null);

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.number?.toString().includes(searchQuery) || 
                         room.guest_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || getEffectiveStatus(room) === filterStatus;
    const matchesPilgrimage = filterPilgrimage === 'all' || room.pilgrimage_id === filterPilgrimage;
    const matchesType = filterType === 'all' || room.type === filterType;
    const matchesBuilding = filterBuilding === 'all' || room.type === filterBuilding;
    const matchesFloor = filterFloor === 'all' || (room.floor?.toString() === filterFloor);
    
    // Capacity filter
    const capacity = room.capacity || 0;
    const matchesMinCapacity = !filterMinCapacity || capacity >= parseInt(filterMinCapacity);
    const matchesMaxCapacity = !filterMaxCapacity || capacity <= parseInt(filterMaxCapacity);
    
    // Amenities filter - only apply if any amenity is checked
    const hasAnyAmenityFilter = Object.values(filterAmenities).some(v => v);
    const matchesAmenities = !hasAnyAmenityFilter || (
      (!filterAmenities.hasTv || room.has_tv) &&
      (!filterAmenities.hasAc || room.has_ac) &&
      (!filterAmenities.hasWifi || room.has_wifi) &&
      (!filterAmenities.hasMinibar || room.has_minibar) &&
      (!filterAmenities.hasBalcony || room.has_balcony)
    );
    
    return matchesSearch && matchesStatus && matchesPilgrimage && matchesType && 
           matchesBuilding && matchesFloor && matchesMinCapacity && matchesMaxCapacity && matchesAmenities;
  }).sort((a, b) => {
    // Aplicar ordenação
    let comparison = 0;
    
    if (sortBy === 'number') {
      comparison = (a.number || 0) - (b.number || 0);
    } else if (sortBy === 'capacity') {
      comparison = (a.capacity || 0) - (b.capacity || 0);
    } else if (sortBy === 'floor') {
      comparison = (a.floor || 0) - (b.floor || 0);
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Função para formatar descrição das camas
  const formatBedsDescription = (room: Room): string => {
    if (!room.beds || room.beds === 0) return '';
    
    // Por simplicidade, vamos inferir os tipos de cama baseado na capacidade
    const capacity = room.capacity || 0;
    const beds = room.beds || 0;
    
    if (beds === 1) {
      return capacity >= 2 ? '1 cama de casal' : '1 cama de solteiro';
    } else if (beds === 2) {
      if (capacity >= 4) return '2 camas de casal';
      if (capacity === 3) return '1 cama de casal, 1 cama de solteiro';
      return '2 camas de solteiro';
    } else {
      // Múltiplas camas - descrição genérica
      return `${beds} camas`;
    }
  };

  // Função para obter lista detalhada de camas
  const getBedsDetailList = (room: Room): Array<{quantity: number, type: string}> => {
    if (!room.beds || room.beds === 0) return [];
    
    // Mapeamento de tipos de cama
    const bedTypeLabels: Record<string, string> = {
      'solteiro': 'Solteiro',
      'casal': 'Casal',
      'queen': 'Queen',
      'king': 'King',
      'beliche': 'Beliche',
      'sofa-cama': 'Sofá-cama'
    };
    
    // Prioridade 1: Usar configuração salva no banco
    if (room.bed_configuration && Array.isArray(room.bed_configuration) && room.bed_configuration.length > 0) {
      return room.bed_configuration.map((bed: any) => ({
        quantity: bed.quantity || 1,
        type: bedTypeLabels[bed.type] || bed.type || 'Solteiro'
      }));
    }
    
    // Prioridade 2: Estimar baseado em capacity e beds
    const capacity = room.capacity || 0;
    const beds = room.beds || 0;
    const bedsList: Array<{quantity: number, type: string}> = [];
    
    if (beds === 1) {
      bedsList.push({ quantity: 1, type: capacity >= 2 ? 'Casal' : 'Solteiro' });
    } else if (beds === 2) {
      if (capacity >= 4) {
        bedsList.push({ quantity: 2, type: 'Casal' });
      } else if (capacity === 3) {
        bedsList.push({ quantity: 1, type: 'Casal' });
        bedsList.push({ quantity: 1, type: 'Solteiro' });
      } else {
        bedsList.push({ quantity: 2, type: 'Solteiro' });
      }
    } else if (beds === 3) {
      if (capacity >= 5) {
        bedsList.push({ quantity: 2, type: 'Casal' });
        bedsList.push({ quantity: 1, type: 'Solteiro' });
      } else if (capacity === 4) {
        bedsList.push({ quantity: 1, type: 'Casal' });
        bedsList.push({ quantity: 1, type: 'Beliche' });
      } else {
        bedsList.push({ quantity: 3, type: 'Solteiro' });
      }
    } else {
      // Múltiplas camas - distribuir de forma equilibrada
      const casalBeds = Math.floor(beds / 2);
      const solteiroBeds = beds % 2;
      
      if (casalBeds > 0) bedsList.push({ quantity: casalBeds, type: 'Casal' });
      if (solteiroBeds > 0) bedsList.push({ quantity: solteiroBeds, type: 'Solteiro' });
    }
    
    return bedsList;
  };

  const handleSortChange = (newSortBy: 'number' | 'capacity' | 'floor', newSortOrder: 'asc' | 'desc') => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  const getSortLabel = () => {
    const labels = {
      number: 'Número',
      capacity: 'Capacidade',
      floor: 'Andar'
    };
    const arrow = sortOrder === 'asc' ? '↑' : '↓';
    return `Ordenar: ${labels[sortBy]} ${arrow}`;
  };

  const getPilgrimageById = (id: string) => {
    return pilgrimages.find((p: PilgrimageType) => p.id === id);
  };

  const stats = {
    total: rooms.length,
    available: rooms.filter(r => getEffectiveStatus(r) === 'available').length,
    reserved: rooms.filter(r => getEffectiveStatus(r) === 'reserved').length,
    occupied: rooms.filter(r => getEffectiveStatus(r) === 'occupied').length,
    cleaning: rooms.filter(r => r.status === 'cleaning').length,
    maintenance: rooms.filter(r => r.status === 'maintenance').length,
    occupancyRate: rooms.length > 0 ? ((rooms.filter(r => getEffectiveStatus(r) === 'occupied').length / rooms.length) * 100).toFixed(0) : '0',
  };

  const handleChangeStatus = async (roomId: string, newStatus: string) => {
    await updateRoom(roomId, { status: newStatus });
  };

  // Ocupado ou reservado -> check-out sempre manda o quarto para limpeza, nunca direto para disponível.
  const handleCheckOut = async (room: Room) => {
    await updateRoom(room.id, {
      status: 'cleaning',
      guest_name: null as any,
      guest_cpf: null as any,
      guest_phone: null as any,
      guest_email: null as any,
      check_in_date: null as any,
      check_out_date: null as any,
      observations: null as any,
    });
    // Se a ocupação vem de uma reserva da Agenda (room_reservations), encerra ela agora —
    // no momento real do check-out, não na data prevista, que pode ter passado ou ainda não
    // ter chegado. Sem isso, o quarto voltaria a contar como ocupado/reservado no próximo cálculo.
    const bookingId = activeBookingByRoom[room.id];
    if (bookingId) {
      const { error: bookingError } = await supabase
        .from('room_reservations')
        .update({ status: 'checked_out', check_out_date: getLocalDateStr() })
        .eq('id', bookingId);
      if (bookingError) console.error('Erro ao encerrar reserva no check-out:', bookingError);
    }
  };

  const handleCleaningDone = async (room: Room) => {
    await updateRoom(room.id, { status: 'available' });
  };

  // Cancelar uma reserva futura (quarto "reservado") precisa encerrar a room_reservations de
  // verdade — não só o rooms.status — senão a Agenda continua mostrando a reserva como ativa
  // (as duas telas leem o mesmo registro, então cancelar aqui tem que refletir lá também).
  const handleCancelReservedRoom = async (room: Room) => {
    const bookingId = reservedBookingByRoom[room.id];
    if (bookingId) {
      const { error: bookingError } = await supabase
        .from('room_reservations')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);
      if (bookingError) {
        console.error('Erro ao cancelar reserva:', bookingError);
        notifyError('Erro ao cancelar reserva');
        return;
      }
      await syncOccurrenceCancellation(bookingInfoByRoom[room.id]?.occurrence_id);
    }
    await updateRoom(room.id, { status: 'available' });
    notifySuccess('Reserva cancelada!');
  };

  const handleMaintenanceDone = async (room: Room) => {
    await updateRoom(room.id, { status: 'available', maintenance_notes: null as any });
  };

  const openCheckInDialog = (room: Room) => {
    setCheckInRoom(room);
    setCheckInGuestName('');
    setCheckInGuestCpf('');
    setCheckInGuestPhone('');
    setCheckInCheckOutDate('');
    setCheckInObservations('');
  };

  const handleConfirmCheckIn = async () => {
    if (!checkInRoom) return;
    if (!checkInGuestName.trim()) {
      notifyError('Informe o nome do hóspede');
      return;
    }
    await updateRoom(checkInRoom.id, {
      status: 'occupied',
      guest_name: checkInGuestName.trim(),
      guest_cpf: checkInGuestCpf.trim() || null as any,
      guest_phone: checkInGuestPhone.trim() || null as any,
      check_in_date: getLocalDateStr() as any,
      check_out_date: checkInCheckOutDate || null as any,
      observations: checkInObservations.trim() || null as any,
    });
    notifySuccess('Check-in realizado!');
    setCheckInRoom(null);
  };

  const openMaintenanceDialog = (room: Room) => {
    setMaintenanceRoom(room);
    setMaintenanceNote(room.maintenance_notes || '');
  };

  const handleConfirmMaintenance = async () => {
    if (!maintenanceRoom) return;
    if (!maintenanceNote.trim()) {
      notifyError('Descreva o problema para colocar em manutenção');
      return;
    }
    await updateRoom(maintenanceRoom.id, { status: 'maintenance', maintenance_notes: maintenanceNote.trim() });
    notifySuccess('Quarto colocado em manutenção');
    setMaintenanceRoom(null);
  };

  const handleRequestDeleteRoom = async (room: Room) => {
    setDeleteRoomTarget(room);
    setDeleteBlockedMessage(null);
    setDeleteChecking(true);
    try {
      if (getEffectiveStatus(room) === 'occupied' || room.guest_name) {
        setDeleteBlockedMessage('Este quarto está ocupado no momento. Faça o check-out antes de excluí-lo.');
        return;
      }
      const { data, error: checkError } = await supabase
        .from('room_reservations')
        .select('id, status, check_out_date')
        .eq('room_id', room.id)
        .neq('status', 'cancelled');
      if (checkError) throw checkError;
      const today = getLocalDateStr();
      const active = (data || []).filter((r: any) => !r.check_out_date || r.check_out_date >= today);
      if (active.length > 0) {
        setDeleteBlockedMessage(`Este quarto tem ${active.length} reserva(s) ativa(s) vinculada(s). Cancele ou finalize essas reservas antes de excluir o quarto.`);
      }
    } catch (err) {
      console.error('Erro ao verificar reservas do quarto:', err);
      setDeleteBlockedMessage('Não foi possível verificar reservas vinculadas. Tente novamente.');
    } finally {
      setDeleteChecking(false);
    }
  };

  const handleConfirmDeleteRoom = async () => {
    if (!deleteRoomTarget || deleteBlockedMessage) return;
    const { error: delError } = await supabase.from('rooms').delete().eq('id', deleteRoomTarget.id);
    if (delError) {
      notifyError('Erro ao excluir quarto');
    } else {
      notifySuccess('Quarto excluído');
      setDeleteRoomTarget(null);
    }
  };

  const runPeriodSearch = async (start: string, end: string) => {
    if (!start || !end) return;
    if (new Date(end) <= new Date(start)) {
      notifyError('A data final deve ser depois da data inicial');
      return;
    }
    setPeriodLoading(true);
    setPeriodDetailRoomId(null);
    try {
      // Sobreposição [check_in, check_out) com o período [start, end)
      const { data, error: queryError } = await supabase
        .from('room_reservations')
        .select('id, room_id, check_in_date, check_out_date, total_value, number_of_people, notes, pilgrimage_id')
        .neq('status', 'cancelled')
        .lt('check_in_date', end)
        .gt('check_out_date', start);
      if (queryError) throw queryError;
      const bookings = (data || []) as PeriodReservation[];
      setPeriodBookings(bookings);
      const openAmounts = await getOpenAmountsByReservation(bookings.map(b => b.id));
      setPeriodOpenAmounts(openAmounts);
    } catch (err) {
      console.error('Erro ao verificar disponibilidade no período:', err);
      notifyError('Erro ao verificar disponibilidade');
    } finally {
      setPeriodLoading(false);
    }
  };

  const handlePeriodSearch = async () => {
    if (!periodStart || !periodEnd) {
      notifyError('Selecione data de início e fim');
      return;
    }
    await runPeriodSearch(periodStart, periodEnd);
  };

  // Ao abrir a tela, já mostra a semana atual (domingo a sábado) em vez de começar em branco —
  // é só um filtro de consulta, mas o padrão precisa responder "quem está livre agora" de cara.
  const periodInitialized = useRef(false);
  useEffect(() => {
    if (periodInitialized.current) return;
    periodInitialized.current = true;
    const today = new Date();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - today.getDay());
    const saturdayExclusive = new Date(sunday);
    saturdayExclusive.setDate(sunday.getDate() + 7);
    const startStr = getLocalDateStr(sunday);
    const endStr = getLocalDateStr(saturdayExclusive);
    setPeriodStart(startStr);
    setPeriodEnd(endStr);
    runPeriodSearch(startStr, endStr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClearPeriod = () => {
    setPeriodStart('');
    setPeriodEnd('');
    setPeriodBookings(null);
    setPeriodDetailRoomId(null);
  };

  const handleReserveAvailableRoom = () => {
    setPeriodReservationDate(periodStart ? new Date(`${periodStart}T00:00:00`) : new Date());
    setShowNewReservation(true);
  };

  const handleCreateRoom = () => {
    setDialogMode('create');
    setSelectedRoom(null);
    setEditDialogOpen(true);
  };

  const handleEditRoom = (room: Room) => {
    setDialogMode('edit');
    setSelectedRoom(room);
    setEditDialogOpen(true);
  };

  const handleSaveRoom = async (roomData: Partial<Room>) => {
    if (dialogMode === 'create') {
      await addRoom(roomData as Omit<Room, 'id' | 'created_at'>);
    } else if (selectedRoom) {
      await updateRoom(selectedRoom.id, roomData);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterStatus('all');
    setFilterPilgrimage('all');
    setFilterType('all');
    setFilterFloor('all');
    setFilterMinCapacity('');
    setFilterMaxCapacity('');
    setFilterAmenities({
      hasTv: false,
      hasAc: false,
      hasWifi: false,
      hasMinibar: false,
      hasBalcony: false,
    });
  };

  const handleExportToExcel = () => {
    exportRoomsToExcel(filteredRooms, {
      includeAmenities: true,
      includeOccupancy: false,
    });
  };

  const handlePrint = (includeFilters: boolean) => {
    // Add or remove class to control filter visibility
    if (includeFilters) {
      document.body.classList.remove('print-hide-filters');
    } else {
      document.body.classList.add('print-hide-filters');
    }
    
    // Small delay to ensure class is applied
    setTimeout(() => {
      window.print();
      // Clean up after print
      setTimeout(() => {
        document.body.classList.remove('print-hide-filters');
      }, 100);
    }, 100);
  };

  // Get unique floors from rooms
  const uniqueFloors = Array.from(new Set(rooms.map(r => r.floor).filter(f => f !== null && f !== undefined))).sort((a, b) => (a || 0) - (b || 0));

  if (loading) {
    return <div className="p-8">Carregando quartos...</div>;
  }
  if (error) {
    return <div className="p-8 text-red-600">Erro ao carregar quartos: {error.message}</div>;
  }
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <div className="p-8">
        {/* Header with Title and Actions */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-slate-900 mb-1">Gestão de Quartos</h1>
            <p className="text-slate-600 text-sm">Controle de ocupação e status dos quartos</p>
          </div>
        </div>

        {/* Filtro de período: pergunta direta "quais quartos estão livres entre X e Y", sem calendário */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <CalendarSearch className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-semibold text-slate-900">Verificar disponibilidade em um período</span>
          </div>
          <div className="flex items-end gap-3 flex-wrap">
            <div>
              <Label className="text-xs text-slate-600 mb-1 block">Início</Label>
              <Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} className="w-40" />
            </div>
            <div>
              <Label className="text-xs text-slate-600 mb-1 block">Fim</Label>
              <Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} className="w-40" />
            </div>
            <Button onClick={handlePeriodSearch} disabled={periodLoading} className="h-10">
              {periodLoading ? 'Verificando...' : 'Buscar disponibilidade'}
            </Button>
            {periodBookings !== null && (
              <Button variant="ghost" onClick={handleClearPeriod} className="h-10">
                <X className="w-4 h-4 mr-1" /> Limpar
              </Button>
            )}
          </div>

          {periodBookings !== null && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              {(() => {
                const occupiedRoomIds = new Set(periodBookings.map(b => b.room_id));
                const availableCount = rooms.length - occupiedRoomIds.size;
                return (
                  <>
                    <p className="text-sm text-slate-700 mb-3">
                      <span className="font-semibold text-green-700">{availableCount}</span> de {rooms.length} quartos disponíveis entre{' '}
                      <span className="font-medium">{periodStart.split('-').reverse().join('/')}</span> e{' '}
                      <span className="font-medium">{periodEnd.split('-').reverse().join('/')}</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {rooms.map(room => {
                        const booking = periodBookings.find(b => b.room_id === room.id);
                        const isAvailable = !booking;
                        const occupantName = booking
                          ? (booking.pilgrimage_id ? getPilgrimageById(booking.pilgrimage_id)?.name : (booking.notes || room.guest_name))
                          : null;
                        return (
                          <button
                            key={room.id}
                            type="button"
                            onClick={() => isAvailable ? handleReserveAvailableRoom() : setPeriodDetailRoomId(periodDetailRoomId === room.id ? null : room.id)}
                            className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                              isAvailable
                                ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                            }`}
                          >
                            Quarto {room.number}{occupantName ? ` · ${occupantName}` : ''}
                          </button>
                        );
                      })}
                    </div>
                    {periodDetailRoomId && (() => {
                      const room = rooms.find(r => r.id === periodDetailRoomId);
                      const booking = periodBookings.find(b => b.room_id === periodDetailRoomId);
                      if (!room || !booking) return null;
                      const nights = Math.max(1, Math.round((new Date(booking.check_out_date).getTime() - new Date(booking.check_in_date).getTime()) / 86400000));
                      const openAmount = periodOpenAmounts[booking.id];
                      const occupantName = booking.pilgrimage_id ? getPilgrimageById(booking.pilgrimage_id)?.name : (booking.notes || room.guest_name);
                      return (
                        <div className="mt-3 p-3 bg-slate-50 rounded-md border border-slate-200 text-sm">
                          <p className="font-medium text-slate-900">Quarto {room.number} — ocupado neste período</p>
                          {occupantName && <p className="text-slate-600">{booking.pilgrimage_id ? 'Romaria' : 'Hóspede'}: <span className="text-slate-900">{occupantName}</span></p>}
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-slate-600">
                            <p>Hóspedes: <span className="text-slate-900">{booking.number_of_people ?? '—'}</span></p>
                            <p>Diárias: <span className="text-slate-900">{nights}</span></p>
                            <p>Check-in: <span className="text-slate-900">{booking.check_in_date.split('-').reverse().join('/')}</span></p>
                            <p>Check-out: <span className="text-slate-900">{booking.check_out_date.split('-').reverse().join('/')}</span></p>
                            <p>Valor total: <span className="text-slate-900">{booking.total_value != null ? formatCurrency(booking.total_value) : '—'}</span></p>
                            <p>Em aberto: <span className="text-slate-900">{openAmount != null ? formatCurrency(openAmount) : '—'}</span></p>
                          </div>
                        </div>
                      );
                    })()}
                  </>
                );
              })()}
            </div>
          )}
        </Card>

        <div className="flex items-center justify-end mb-6">
          <div className="flex items-center gap-3">
            {/* Export/Print Buttons */}
            <button
              onClick={handleExportToExcel}
              className="flex items-center gap-2 h-10 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm hover:shadow-md transition-all focus:ring-2 focus:ring-green-400 text-sm font-medium min-w-fit whitespace-nowrap"
              disabled={filteredRooms.length === 0}
              aria-label="Exportar para Excel"
              type="button"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Exportar Excel
            </button>
            <div className="relative">
              <Button 
                onClick={() => setShowPrintOptions(!showPrintOptions)}
                variant="outline" 
                size="sm"
                className="gap-2 h-10 px-4 rounded-lg shadow-sm hover:shadow-md transition-all font-medium min-w-fit whitespace-nowrap"
                disabled={filteredRooms.length === 0}
              >
                <Printer className="h-4 w-4" />
                Imprimir
              </Button>
              {showPrintOptions && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 p-3 z-50 no-print">
                  <p className="text-sm font-medium text-slate-900 mb-3">Opções de Impressão</p>
                  <div className="space-y-2">
                    <Button
                      onClick={() => {
                        setShowPrintOptions(false);
                        handlePrint(true);
                      }}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Imprimir com filtros
                    </Button>
                    <Button
                      onClick={() => {
                        setShowPrintOptions(false);
                        handlePrint(false);
                      }}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Imprimir sem filtros
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <Button onClick={handleCreateRoom} className="gap-2 h-10 px-4 rounded-lg shadow-sm hover:shadow-md transition-all bg-slate-800 hover:bg-slate-900 text-white font-medium text-sm min-w-fit whitespace-nowrap">
              <Plus className="h-4 w-4" />
              Adicionar Quarto
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-5 stats-grid">
          <Card className="p-4 stats-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Bed className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total</p>
                <p className="text-2xl text-slate-900">{stats.total}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 stats-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <Bed className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Disponíveis</p>
                <p className="text-2xl text-green-600">{stats.available}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 stats-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Reservados</p>
                <p className="text-2xl text-blue-600">{stats.reserved}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 stats-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Ocupados</p>
                <p className="text-2xl text-red-600">{stats.occupied}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 stats-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Limpeza</p>
                <p className="text-2xl text-yellow-600">{stats.cleaning}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 stats-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Ocupação</p>
                <p className="text-2xl text-purple-600">{stats.occupancyRate}%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6 filters-card">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-900 whitespace-nowrap">Filtros:</span>
            
            {/* Status Filter Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                size="sm"
                className="h-9 px-4 text-sm font-medium min-w-[90px]"
              >
                Todos ({stats.total})
              </Button>
              <Button
                variant={filterStatus === 'available' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('available')}
                size="sm"
                className={filterStatus === 'available' ? 'bg-green-600 hover:bg-green-700 h-9 px-4 text-sm font-medium min-w-[140px]' : 'h-9 px-4 text-sm font-medium min-w-[140px]'}
              >
                <Bed className="h-4 w-4 mr-2" />
                Disponíveis ({stats.available})
              </Button>
              <Button
                variant={filterStatus === 'reserved' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('reserved')}
                size="sm"
                className={filterStatus === 'reserved' ? 'bg-blue-600 hover:bg-blue-700 h-9 px-4 text-sm font-medium min-w-[140px]' : 'h-9 px-4 text-sm font-medium min-w-[140px]'}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Reservados ({stats.reserved})
              </Button>
              <Button
                variant={filterStatus === 'occupied' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('occupied')}
                size="sm"
                className={filterStatus === 'occupied' ? 'bg-red-600 hover:bg-red-700 h-9 px-4 text-sm font-medium min-w-[130px]' : 'h-9 px-4 text-sm font-medium min-w-[130px]'}
              >
                <Users className="h-4 w-4 mr-2" />
                Ocupados ({stats.occupied})
              </Button>
              <Button
                variant={filterStatus === 'cleaning' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('cleaning')}
                size="sm"
                className={filterStatus === 'cleaning' ? 'bg-yellow-600 hover:bg-yellow-700 h-9 px-4 text-sm font-medium min-w-[115px]' : 'h-9 px-4 text-sm font-medium min-w-[115px]'}
              >
                <Clock className="h-4 w-4 mr-2" />
                Limpeza ({stats.cleaning})
              </Button>
              <Button
                variant={filterStatus === 'maintenance' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('maintenance')}
                size="sm"
                className={filterStatus === 'maintenance' ? 'bg-gray-600 hover:bg-gray-700 h-9 px-4 text-sm font-medium min-w-[150px]' : 'h-9 px-4 text-sm font-medium min-w-[150px]'}
              >
                <Wrench className="h-4 w-4 mr-2" />
                Manutenção ({stats.maintenance})
              </Button>
            </div>

            <div className="h-6 w-px bg-slate-300 mx-1"></div>

            <div className="flex-1"></div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-slate-600 hover:text-slate-900 h-9 px-3 text-sm font-medium min-w-fit whitespace-nowrap gap-2"
              >
                <X className="h-4 w-4" />
                Limpar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="text-slate-600 hover:text-slate-900 h-9 px-3 text-sm font-medium min-w-fit whitespace-nowrap gap-2"
              >
                <Filter className="h-4 w-4" />
                {showFilters ? 'Ocultar' : 'Avançado'}
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="space-y-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Buscar por número de quarto ou nome do hóspede..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Grid Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Type Filter */}
                <div>
                  <Label htmlFor="filter-type" className="text-sm font-medium text-slate-700 mb-2 block">
                    Tipo de Quarto
                  </Label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger id="filter-type">
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      <SelectItem value="single">Solteiro</SelectItem>
                      <SelectItem value="double">Casal</SelectItem>
                      <SelectItem value="suite">Suíte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Building Filter */}
                <div>
                  <Label htmlFor="filter-building" className="text-sm font-medium text-slate-700 mb-2 block">
                    <Building2 className="w-4 h-4 inline mr-1" />
                    Edifício
                  </Label>
                  <Select value={filterBuilding} onValueChange={setFilterBuilding}>
                    <SelectTrigger id="filter-building">
                      <SelectValue placeholder="Todos os edifícios" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os edifícios</SelectItem>
                      <SelectItem value="standard">Prédio Principal</SelectItem>
                      <SelectItem value="anexo">Anexo</SelectItem>
                      <SelectItem value="pousada">Pousada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Floor Filter */}
                <div>
                  <Label htmlFor="filter-floor" className="text-sm font-medium text-slate-700 mb-2 block">
                    <Building2 className="w-4 h-4 inline mr-1" />
                    Andar
                  </Label>
                  <Select value={filterFloor} onValueChange={setFilterFloor}>
                    <SelectTrigger id="filter-floor">
                      <SelectValue placeholder="Todos os andares" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os andares</SelectItem>
                      {uniqueFloors.map((floor) => (
                        <SelectItem key={floor} value={floor?.toString() || ''}>
                          {floor}º andar
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Pilgrimage Filter */}
                <div>
                  <Label htmlFor="filter-pilgrimage" className="text-sm font-medium text-slate-700 mb-2 block">
                    <Bus className="w-4 h-4 inline mr-1" />
                    Romaria
                  </Label>
                  <Select value={filterPilgrimage} onValueChange={setFilterPilgrimage}>
                    <SelectTrigger id="filter-pilgrimage">
                      <SelectValue placeholder="Todas as romarias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as romarias</SelectItem>
                      {pilgrimages.map((pilgrimage: PilgrimageType) => (
                        <SelectItem key={pilgrimage.id} value={pilgrimage.id}>
                          {pilgrimage.name} - {pilgrimage.busGroup}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Capacity Range */}
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">
                  <Users className="w-4 h-4 inline mr-1" />
                  Capacidade
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input
                      type="number"
                      placeholder="Mínima"
                      value={filterMinCapacity}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterMinCapacity(e.target.value)}
                      min="1"
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="Máxima"
                      value={filterMaxCapacity}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterMaxCapacity(e.target.value)}
                      min="1"
                    />
                  </div>
                </div>
              </div>

              {/* Amenities Filter */}
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-3 block">Amenidades</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="amenity-tv"
                      checked={filterAmenities.hasTv}
                      onCheckedChange={(checked) => 
                        setFilterAmenities({ ...filterAmenities, hasTv: checked as boolean })
                      }
                    />
                    <label
                      htmlFor="amenity-tv"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 cursor-pointer"
                    >
                      <Tv className="w-4 h-4 text-slate-600" />
                      TV
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="amenity-ac"
                      checked={filterAmenities.hasAc}
                      onCheckedChange={(checked) => 
                        setFilterAmenities({ ...filterAmenities, hasAc: checked as boolean })
                      }
                    />
                    <label
                      htmlFor="amenity-ac"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 cursor-pointer"
                    >
                      <Wind className="w-4 h-4 text-slate-600" />
                      Ar-cond.
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="amenity-wifi"
                      checked={filterAmenities.hasWifi}
                      onCheckedChange={(checked) => 
                        setFilterAmenities({ ...filterAmenities, hasWifi: checked as boolean })
                      }
                    />
                    <label
                      htmlFor="amenity-wifi"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 cursor-pointer"
                    >
                      <Wifi className="w-4 h-4 text-slate-600" />
                      Wi-Fi
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="amenity-minibar"
                      checked={filterAmenities.hasMinibar}
                      onCheckedChange={(checked) => 
                        setFilterAmenities({ ...filterAmenities, hasMinibar: checked as boolean })
                      }
                    />
                    <label
                      htmlFor="amenity-minibar"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 cursor-pointer"
                    >
                      <Wine className="w-4 h-4 text-slate-600" />
                      Frigobar
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="amenity-balcony"
                      checked={filterAmenities.hasBalcony}
                      onCheckedChange={(checked) => 
                        setFilterAmenities({ ...filterAmenities, hasBalcony: checked as boolean })
                      }
                    />
                    <label
                      htmlFor="amenity-balcony"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 cursor-pointer"
                    >
                      <Home className="w-4 h-4 text-slate-600" />
                      Varanda
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Results count and export info */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <p className="text-sm text-slate-600">
              Mostrando <span className="font-semibold text-slate-900">{filteredRooms.length}</span> {filteredRooms.length === 1 ? 'quarto' : 'quartos'}
              {filteredRooms.length !== rooms.length && (
                <span className="text-slate-500"> de {rooms.length} total</span>
              )}
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="gap-2 text-slate-600 hover:text-slate-900 h-9 px-3 font-medium min-w-fit whitespace-nowrap"
                >
                  <TrendingUp className="h-4 w-4" />
                  {getSortLabel()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleSortChange('number', 'asc')} className="gap-2">
                  Número ↑
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange('number', 'desc')} className="gap-2">
                  Número ↓
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange('capacity', 'asc')} className="gap-2">
                  Capacidade ↑
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange('capacity', 'desc')} className="gap-2">
                  Capacidade ↓
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange('floor', 'asc')} className="gap-2">
                  Andar ↑
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange('floor', 'desc')} className="gap-2">
                  Andar ↓
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {filteredRooms.length > 0 && (
            <Button 
              onClick={handleExportToExcel} 
              variant="ghost" 
              size="sm"
              className="gap-2 text-slate-600 hover:text-slate-900 h-9 px-3 font-medium min-w-fit whitespace-nowrap"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Exportar filtrados
            </Button>
          )}
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 rooms-grid">
          {filteredRooms.map((room) => {
            const effectiveStatus = getEffectiveStatus(room);

            return (
            <Card key={room.id} className="p-0 hover:shadow-lg transition-all duration-200 room-card overflow-hidden border-2 hover:border-slate-300 flex flex-col">
              {/* Header compacto */}
              <div className={`p-2 ${
                effectiveStatus === 'available' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200' :
                effectiveStatus === 'reserved' ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-200' :
                effectiveStatus === 'occupied' ? 'bg-gradient-to-r from-red-50 to-rose-50 border-b border-red-200' :
                effectiveStatus === 'cleaning' ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-b border-yellow-200' :
                'bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200'
              }`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-slate-900 text-lg font-bold room-number truncate">
                      {room.custom_name || `Quarto ${room.number}`}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <Badge variant="outline" className="text-xs bg-white h-5 px-1.5 py-0">
                        <Building2 className="w-3 h-3 mr-0.5" />
                        {room.floor}º
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-white h-5 px-1.5 py-0">
                        {roomTypeLabels[room.type as keyof typeof roomTypeLabels] || room.type}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Badge className={`${statusColors[effectiveStatus as keyof typeof statusColors] || ''} border text-xs h-5 px-2`}>
                      {statusLabels[effectiveStatus as keyof typeof statusLabels] || effectiveStatus}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditRoom(room)}
                      className="h-6 w-6 p-0 no-print hover:bg-white/80"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                {/* Ocupante/reserva direto na listagem, sem precisar abrir detalhes */}
                {(effectiveStatus === 'occupied' || effectiveStatus === 'reserved') && (() => {
                  const booking = bookingInfoByRoom[room.id];
                  // room_reservations não tem coluna customer_name — o nome do hóspede avulso
                  // fica em notes; romaria usa o nome do grupo.
                  const occupantName = room.guest_name
                    || (booking?.pilgrimage_id ? getPilgrimageById(booking.pilgrimage_id)?.name : booking?.notes)
                    || undefined;
                  if (!occupantName) return null;
                  return (
                    <p className="text-xs text-slate-600 mt-1 flex items-center gap-1 truncate">
                      {booking?.pilgrimage_id ? <Bus className="w-3 h-3 shrink-0" /> : <Users className="w-3 h-3 shrink-0" />}
                      <span className="truncate">{occupantName}</span>
                    </p>
                  );
                })()}
              </div>

              {/* Body compacto */}
              <div className="px-2.5 pb-3 space-y-2 flex-1">
                {/* Capacidade e Camas */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm text-slate-700">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-medium">{room.capacity || 2}</span>
                    <span className="text-xs text-slate-500">{(room.capacity || 2) === 1 ? 'pessoa' : 'pessoas'}</span>
                  </div>
                  {room.daily_rate && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-green-600" />
                      <span className="font-bold text-green-600 text-sm">R$ {room.daily_rate.toFixed(2)}</span>
                      <span className="text-xs text-slate-400">/noite</span>
                    </div>
                  )}
                </div>

                {/* Lista de camas */}
                {room.beds && room.beds > 0 && (
                  <div className="bg-slate-50 rounded-md p-2 border border-slate-200">
                    <div className="flex items-center gap-1 mb-1">
                      <Bed className="w-3 h-3 text-slate-600" />
                      <span className="text-xs font-medium text-slate-700">Camas:</span>
                    </div>
                    <div className="space-y-0.5">
                      {getBedsDetailList(room).map((bed, idx) => (
                        <div key={idx} className="text-xs text-slate-600 flex items-center gap-1 ml-4">
                          <span className="text-slate-400">•</span>
                          <span>{bed.quantity}x {bed.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Amenidades compactas */}
                {(room.has_tv || room.has_ac || room.has_wifi || room.has_minibar || room.has_balcony) && (
                  <div className="flex flex-wrap gap-1">
                    {room.has_tv && (
                      <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                        <Tv className="w-3 h-3" />
                        <span>TV</span>
                      </div>
                    )}
                    {room.has_ac && (
                      <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-cyan-50 text-cyan-700 rounded text-xs">
                        <Wind className="w-3 h-3" />
                        <span>AC</span>
                      </div>
                    )}
                    {room.has_wifi && (
                      <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded text-xs">
                        <Wifi className="w-3 h-3" />
                        <span>Wi-Fi</span>
                      </div>
                    )}
                    {room.has_minibar && (
                      <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded text-xs">
                        <Wine className="w-3 h-3" />
                        <span>Frigobar</span>
                      </div>
                    )}
                    {room.has_balcony && (
                      <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-green-50 text-green-700 rounded text-xs">
                        <Home className="w-3 h-3" />
                        <span>Varanda</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Características especiais em linha */}
                {(room.is_accessible || room.is_pet_friendly) && (
                  <div className="flex flex-wrap gap-1">
                    {room.is_accessible && (
                      <Badge variant="outline" className="text-xs h-5 px-1.5 py-0 bg-blue-50 text-blue-700 border-blue-200">
                        <Accessibility className="w-3 h-3 mr-0.5" />
                        Acessível
                      </Badge>
                    )}
                    {room.is_pet_friendly && (
                      <Badge variant="outline" className="text-xs h-5 px-1.5 py-0 bg-pink-50 text-pink-700 border-pink-200">
                        <PawPrint className="w-3 h-3 mr-0.5" />
                        Pets
                      </Badge>
                    )}
                  </div>
                )}

                {/* Romaria associada */}
                {room.pilgrimage_id && (
                  <div className="mb-3 p-2 bg-blue-50 rounded-md border border-blue-100">
                    <div className="flex items-center gap-2">
                      <Bus className="w-4 h-4 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-blue-900">
                          {getPilgrimageById(room.pilgrimage_id)?.name}
                        </p>
                        <p className="text-xs text-blue-600">
                          {getPilgrimageById(room.pilgrimage_id)?.busGroup}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Informações do hóspede */}
                {room.guest_name && (
                  <div className="mb-3 p-2 bg-slate-50 rounded-md border border-slate-200">
                    <p className="text-xs font-medium text-slate-900 mb-1">
                      <Users className="w-3 h-3 inline mr-1" />
                      {room.guest_name}
                    </p>
                    {room.check_in_date && room.check_out_date && (
                      <p className="text-xs text-slate-600">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {new Date(room.check_in_date).toLocaleDateString('pt-BR')} - {new Date(room.check_out_date).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                )}

                {room.observations && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-200">
                    {room.observations}
                  </p>
                )}
              </div>

              {/* Ações do quarto - Sempre na parte inferior */}
              <div className="flex gap-2 no-print px-3 pb-3">
                {effectiveStatus === 'occupied' && (
                  <Button
                    size="sm"
                    onClick={() => handleCheckOut(room)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Check-out
                  </Button>
                )}
                {room.status === 'cleaning' && (
                  <Button
                    size="sm"
                    onClick={() => handleCleaningDone(room)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    Limpeza Concluída
                  </Button>
                )}
                {effectiveStatus === 'available' && (
                  <Button
                    size="sm"
                    onClick={() => openCheckInDialog(room)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Check-in
                  </Button>
                )}
                {effectiveStatus === 'reserved' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Reservado ▼
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => openCheckInDialog(room)}>
                        <LogIn className="w-4 h-4 mr-2" />
                        Fazer Check-in
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCheckOut(room)}>
                        <Clock className="w-4 h-4 mr-2" />
                        Check-out
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCancelReservedRoom(room)}>
                        <X className="w-4 h-4 mr-2" />
                        Cancelar Reserva
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                {room.status === 'maintenance' && (
                  <Button
                    size="sm"
                    onClick={() => handleMaintenanceDone(room)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Manutenção Concluída
                  </Button>
                )}
                {room.status !== 'maintenance' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openMaintenanceDialog(room)}
                  >
                    <Wrench className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </Card>
          );
          })}
        </div>
      </div>

      {/* Room Edit Dialog */}
      <RoomEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        room={selectedRoom}
        onSave={handleSaveRoom}
        onDelete={(room) => { setEditDialogOpen(false); handleRequestDeleteRoom(room); }}
        mode={dialogMode}
      />

      {/* Check-in: captura dados do hóspede antes de ocupar o quarto */}
      <Dialog open={!!checkInRoom} onOpenChange={(v) => !v && setCheckInRoom(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check-in — Quarto {checkInRoom?.number}</DialogTitle>
            <DialogDescription>Informe os dados do hóspede para ocupar o quarto agora.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nome do hóspede *</Label>
              <Input value={checkInGuestName} onChange={(e) => setCheckInGuestName(e.target.value)} placeholder="Nome completo" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>CPF</Label>
                <Input value={checkInGuestCpf} onChange={(e) => setCheckInGuestCpf(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input value={checkInGuestPhone} onChange={(e) => setCheckInGuestPhone(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Previsão de check-out</Label>
              <Input type="date" value={checkInCheckOutDate} onChange={(e) => setCheckInCheckOutDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Input value={checkInObservations} onChange={(e) => setCheckInObservations(e.target.value)} placeholder="Informações adicionais" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckInRoom(null)}>Cancelar</Button>
            <Button onClick={handleConfirmCheckIn} className="bg-emerald-600 hover:bg-emerald-700">Confirmar Check-in</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manutenção: exige observação sobre o problema */}
      <Dialog open={!!maintenanceRoom} onOpenChange={(v) => !v && setMaintenanceRoom(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manutenção — Quarto {maintenanceRoom?.number}</DialogTitle>
            <DialogDescription>Descreva o problema. O quarto ficará indisponível até a manutenção ser concluída.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label>Observação *</Label>
            <Input value={maintenanceNote} onChange={(e) => setMaintenanceNote(e.target.value)} placeholder="Ex: torneira vazando, ar-condicionado quebrado..." />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMaintenanceRoom(null)}>Cancelar</Button>
            <Button onClick={handleConfirmMaintenance} className="bg-gray-700 hover:bg-gray-800">Colocar em Manutenção</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Exclusão de quarto: bloqueada se houver reservas ativas */}
      <Dialog open={!!deleteRoomTarget} onOpenChange={(v) => !v && setDeleteRoomTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Quarto {deleteRoomTarget?.number}?</DialogTitle>
            <DialogDescription>Esta ação não pode ser desfeita.</DialogDescription>
          </DialogHeader>
          {deleteChecking ? (
            <p className="text-sm text-slate-600 py-2">Verificando reservas vinculadas...</p>
          ) : deleteBlockedMessage ? (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">{deleteBlockedMessage}</p>
          ) : (
            <p className="text-sm text-slate-600 py-2">Nenhuma reserva ativa vinculada. O quarto será excluído permanentemente.</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteRoomTarget(null)}>Cancelar</Button>
            <Button
              onClick={handleConfirmDeleteRoom}
              disabled={deleteChecking || !!deleteBlockedMessage}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir Quarto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Nova reserva a partir do filtro de período (quarto disponível clicado) */}
      <NewReservationDialog
        open={showNewReservation}
        onOpenChange={setShowNewReservation}
        date={periodReservationDate}
        pilgrimages={pilgrimages as any}
        rooms={rooms as any}
        onSuccess={handlePeriodSearch}
      />
    </div>
  );
}
