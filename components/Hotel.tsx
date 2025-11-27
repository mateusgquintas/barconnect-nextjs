'use client'
import { useState, useEffect } from 'react';
import { useRoomsDB, Room } from '../hooks/useRoomsDB';
import { Pilgrimage as PilgrimageType } from '@/types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Bed, Users, Clock, DollarSign, Search, Bus, UserPlus, Wrench, Plus, Edit, Tv, Wind, Wifi, Wine, Home, Building2, X, Calendar, TrendingUp, FileSpreadsheet, Printer, Bath, Lock, Phone, Eye, Accessibility, Cigarette, PawPrint, MapPin, Filter, LogOut, LogIn, CheckCircle } from 'lucide-react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { usePilgrimagesDB } from '../hooks/usePilgrimagesDB';
import { RoomEditDialog } from './rooms/RoomEditDialog';
import { getAvailableRooms, listBookingsInRange } from '@/lib/agendaService';
import { Booking } from '@/types/agenda';
import { exportRoomsToExcel } from '@/lib/exportRoomsToExcel';

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
  occupied: 'Ocupado',
  cleaning: 'Limpeza',
  maintenance: 'Manutenção',
};

const statusColors = {
  available: 'bg-green-100 text-green-700 border-green-200',
  occupied: 'bg-red-100 text-red-700 border-red-200',
  cleaning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  maintenance: 'bg-gray-100 text-gray-700 border-gray-200',
};

export function Hotel() {
  const { rooms, loading, error, updateRoom, addRoom } = useRoomsDB();
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
  const [showDateFilter, setShowDateFilter] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]); // Dia atual por padrão
  const [availableRoomIds, setAvailableRoomIds] = useState<Set<string>>(new Set());
  const [roomOccupancy, setRoomOccupancy] = useState<Record<string, number>>({});
  const [showPrintOptions, setShowPrintOptions] = useState(false);
  const [printWithFilters, setPrintWithFilters] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.number?.toString().includes(searchQuery) || 
                         room.guest_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || room.status === filterStatus;
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
    
    // Date availability filter - não aplicar para quartos em manutenção
    const matchesDateAvailability = !selectedDate || room.status === 'maintenance' || availableRoomIds.has(room.id);
    
    return matchesSearch && matchesStatus && matchesPilgrimage && matchesType && 
           matchesBuilding && matchesFloor && matchesMinCapacity && matchesMaxCapacity && matchesAmenities &&
           matchesDateAvailability;
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
    available: rooms.filter(r => r.status === 'available').length,
    occupied: rooms.filter(r => r.status === 'occupied').length,
    cleaning: rooms.filter(r => r.status === 'cleaning').length,
    maintenance: rooms.filter(r => r.status === 'maintenance').length,
    occupancyRate: rooms.length > 0 ? ((rooms.filter(r => r.status === 'occupied').length / rooms.length) * 100).toFixed(0) : '0',
  };

  const handleChangeStatus = async (roomId: string, newStatus: string) => {
    await updateRoom(roomId, { status: newStatus });
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
    setSelectedDate(new Date().toISOString().split('T')[0]); // Resetar para hoje
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
      includeOccupancy: selectedDate ? true : false,
      occupancyData: roomOccupancy,
      dateRange: selectedDate ? {
        start: selectedDate,
        end: new Date(new Date(selectedDate).getTime() + 24*60*60*1000).toISOString().split('T')[0],
      } : undefined,
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

  // Effect to calculate room availability and occupancy when date changes
  useEffect(() => {
    async function calculateOccupancy() {
      if (!selectedDate) {
        setAvailableRoomIds(new Set());
        setRoomOccupancy({});
        return;
      }

      try {
        const start = new Date(selectedDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(selectedDate);
        end.setHours(23, 59, 59, 999);

        // Get available rooms for the selected day
        const availableRooms = await getAvailableRooms(start, end);
        const availableIds = new Set(availableRooms.map(r => r.id));
        setAvailableRoomIds(availableIds);

        // Get all bookings in the day to check occupancy
        const bookings = await listBookingsInRange({ start, end });
        
        // Calculate occupancy for each room (occupied or not on this day)
        const occupancyMap: Record<string, number> = {};
        
        rooms.forEach(room => {
          const roomBookings = bookings.filter(b => b.room_id === room.id);
          
          if (roomBookings.length === 0) {
            occupancyMap[room.id] = 0;
            return;
          }

          // Check if room is occupied on this specific day
          const dayStr = selectedDate;
          const isOccupied = roomBookings.some(booking => {
            const bookingStart = new Date(booking.start);
            const bookingEnd = new Date(booking.end);
            const day = new Date(dayStr);
            return day >= bookingStart && day < bookingEnd;
          });
          
          occupancyMap[room.id] = isOccupied ? 100 : 0;
        });
        
        setRoomOccupancy(occupancyMap);
      } catch (error) {
        console.error('Error calculating occupancy:', error);
      }
    }

    calculateOccupancy();
  }, [selectedDate, rooms]);

  if (loading) {
    return <div className="p-8">Carregando quartos...</div>;
  }
  if (error) {
    return <div className="p-8 text-red-600">Erro ao carregar quartos: {error.message}</div>;
  }
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <div className="p-8">
        {/* Header with Title, Date Filter, and Actions */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-slate-900 mb-1">Gestão de Quartos</h1>
            <p className="text-slate-600 text-sm">Controle de ocupação e status dos quartos</p>
          </div>
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-5 stats-grid">
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

            {/* Date Filter - Highlighted */}
            {showDateFilter && (
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-md px-3 py-1.5">
                <Calendar className="h-4 w-4 text-blue-600" />
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedDate(e.target.value)}
                  className="w-36 h-8 text-sm border-blue-300"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                  className="h-8 px-3 text-sm border-blue-300 hover:bg-blue-100 whitespace-nowrap"
                >
                  Hoje
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDateFilter(false)}
                  className="text-blue-600 hover:text-blue-900 hover:bg-blue-100 h-8 px-3 text-sm whitespace-nowrap"
                >
                  <X className="h-4 w-4 mr-1" />
                  Ocultar
                </Button>
              </div>
            )}
            {!showDateFilter && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDateFilter(true)}
                className="text-slate-600 hover:text-slate-900 h-9 px-3 text-sm whitespace-nowrap"
              >
                <Calendar className="h-4 w-4 mr-1" />
                Data
              </Button>
            )}

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
          {filteredRooms.map((room) => (
            <Card key={room.id} className="p-0 hover:shadow-lg transition-all duration-200 room-card overflow-hidden border-2 hover:border-slate-300 flex flex-col">
              {/* Header compacto */}
              <div className={`p-2 ${
                room.status === 'available' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200' :
                room.status === 'occupied' ? 'bg-gradient-to-r from-red-50 to-rose-50 border-b border-red-200' :
                room.status === 'cleaning' ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-b border-yellow-200' :
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
                    <Badge className={`${statusColors[room.status as keyof typeof statusColors] || ''} border text-xs h-5 px-2`}>
                      {statusLabels[room.status as keyof typeof statusLabels] || room.status}
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

                {/* Ocupação para a data selecionada (apenas se diferente de hoje) */}
                {selectedDate && selectedDate !== new Date().toISOString().split('T')[0] && roomOccupancy[room.id] !== undefined && (
                  <div className={`mb-3 p-2 rounded-md border ${
                    roomOccupancy[room.id] === 100 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <TrendingUp className={`w-4 h-4 ${
                        roomOccupancy[room.id] === 100 ? 'text-red-600' : 'text-green-600'
                      }`} />
                      <div className="flex-1">
                        <p className={`text-xs font-medium ${
                          roomOccupancy[room.id] === 100 ? 'text-red-900' : 'text-green-900'
                        }`}>
                          {roomOccupancy[room.id] === 100 ? 'Ocupado' : 'Disponível'} em {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      {availableRoomIds.has(room.id) ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200 border text-xs">
                          ✓ Disponível
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700 border-red-200 border text-xs">
                          ✗ Ocupado
                        </Badge>
                      )}
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
                {room.status === 'occupied' && (
                  <Button
                    size="sm"
                    onClick={() => handleChangeStatus(room.id, 'cleaning')}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Check-out
                  </Button>
                )}
                {room.status === 'cleaning' && (
                  <Button
                    size="sm"
                    onClick={() => handleChangeStatus(room.id, 'available')}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    Liberar
                  </Button>
                )}
                {room.status === 'available' && (
                  <Button
                    size="sm"
                    onClick={() => handleChangeStatus(room.id, 'occupied')}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Check-in
                  </Button>
                )}
                {room.status === 'maintenance' && (
                  <Button
                    size="sm"
                    onClick={() => handleChangeStatus(room.id, 'available')}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Disponibilizar
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleChangeStatus(room.id, 'maintenance')}
                >
                  <Wrench className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Room Edit Dialog */}
      <RoomEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        room={selectedRoom}
        onSave={handleSaveRoom}
        mode={dialogMode}
      />
    </div>
  );
}
