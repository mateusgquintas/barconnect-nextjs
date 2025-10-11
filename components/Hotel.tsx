'use client'
import { useState } from 'react';
import { useRoomsDB, Room } from '../hooks/useRoomsDB';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Bed, Users, Clock, DollarSign, Search, Bus, UserPlus, Wrench } from 'lucide-react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { usePilgrimagesDB } from '../hooks/usePilgrimagesDB';
const roomTypeLabels = {
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
  const { rooms, loading, error, updateRoom } = useRoomsDB();
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
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPilgrimage, setFilterPilgrimage] = useState<string>('all');

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.number?.toString().includes(searchQuery) || 
                         room.guest_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || room.status === filterStatus;
    const matchesPilgrimage = filterPilgrimage === 'all' || room.pilgrimage_id === filterPilgrimage;
    return matchesSearch && matchesStatus && matchesPilgrimage;
  });

  const getPilgrimageById = (id: string) => {
    return pilgrimages.find((p: Pilgrimage) => p.id === id);
  };

  const stats = {
    total: rooms.length,
    available: rooms.filter(r => r.status === 'available').length,
    occupied: rooms.filter(r => r.status === 'occupied').length,
    cleaning: rooms.filter(r => r.status === 'cleaning').length,
    occupancyRate: rooms.length > 0 ? ((rooms.filter(r => r.status === 'occupied').length / rooms.length) * 100).toFixed(0) : '0',
  };

  const handleChangeStatus = async (roomId: string, newStatus: string) => {
    await updateRoom(roomId, { status: newStatus });
  };

  if (loading) {
    return <div className="p-8">Carregando quartos...</div>;
  }
  if (error) {
    return <div className="p-8 text-red-600">Erro ao carregar quartos: {error.message}</div>;
  }
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-slate-900 mb-2">Gestão de Quartos</h1>
          <p className="text-slate-600">Controle de ocupação e status dos quartos</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card className="p-4">
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

          <Card className="p-4">
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

          <Card className="p-4">
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

          <Card className="p-4">
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

          <Card className="p-4">
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
        <Card className="p-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Buscar por quarto ou hóspede..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('all')}
                  size="sm"
                >
                  Todos
                </Button>
                <Button
                  variant={filterStatus === 'available' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('available')}
                  size="sm"
                  className={filterStatus === 'available' ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  Disponíveis
                </Button>
                <Button
                  variant={filterStatus === 'occupied' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('occupied')}
                  size="sm"
                  className={filterStatus === 'occupied' ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  Ocupados
                </Button>
                <Button
                  variant={filterStatus === 'cleaning' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('cleaning')}
                  size="sm"
                  className={filterStatus === 'cleaning' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
                >
                  Limpeza
                </Button>
                <Button
                  variant={filterStatus === 'maintenance' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('maintenance')}
                  size="sm"
                  className={filterStatus === 'maintenance' ? 'bg-gray-600 hover:bg-gray-700' : ''}
                >
                  Manutenção
                </Button>
              </div>
            </div>
            
            {/* Filtro de Romarias */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Bus className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-600">Filtrar por Romaria:</span>
              </div>
              <Select value={filterPilgrimage} onValueChange={setFilterPilgrimage}>
                <SelectTrigger className="w-80">
                  <SelectValue placeholder="Todas as romarias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as romarias</SelectItem>
                  {pilgrimages.map((pilgrimage: Pilgrimage) => (
                    <SelectItem key={pilgrimage.id} value={pilgrimage.id}>
                      <div className="flex items-center gap-2">
                        <Bus className="w-4 h-4 text-blue-500" />
                        <span>{pilgrimage.name} - {pilgrimage.busGroup} ({pilgrimage.numberOfPeople} pessoas)</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRooms.map((room) => (
            <Card key={room.id} className="p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-slate-900 text-xl">Quarto {room.number}</h3>
                  <p className="text-sm text-slate-500">{roomTypeLabels[room.type as keyof typeof roomTypeLabels] || room.type}</p>
                  {room.pilgrimage_id && (
                    <div className="flex items-center gap-1 mt-1">
                      <Bus className="w-3 h-3 text-blue-500" />
                      <span className="text-xs text-blue-600">
                        {getPilgrimageById(room.pilgrimage_id)?.name}
                      </span>
                    </div>
                  )}
                </div>
                <Badge className={`${statusColors[room.status as keyof typeof statusColors] || ''} border`}>
                  {statusLabels[room.status as keyof typeof statusLabels] || room.status}
                </Badge>
              </div>

              {/* Informações do Hóspede */}
              <div className="space-y-2 mb-4">
                {room.guest_name && (
                  <div className="text-sm">
                    <p className="text-slate-600">
                      <Users className="w-3 h-3 inline mr-1" />
                      {room.guest_name}
                    </p>
                    {room.check_in_date && room.check_out_date && (
                      <p className="text-xs text-slate-500">
                        {new Date(room.check_in_date).toLocaleDateString()} - {new Date(room.check_out_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
                {room.observations && (
                  <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded">
                    {room.observations}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                {/* Associação de Romaria */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Romaria:</span>
                  <Select
                    value={room.pilgrimage_id || ''}
                    onValueChange={async (value) => {
                      await updateRoom(room.id, { pilgrimage_id: value === '' ? undefined : value });
                    }}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Nenhuma" />
                    </SelectTrigger>
                    <SelectContent>
                      {pilgrimages.map((pilgrimage: Pilgrimage) => (
                        <SelectItem key={pilgrimage.id} value={pilgrimage.id}>
                          <div className="flex items-center gap-2">
                            <Bus className="w-3 h-3 text-blue-500" />
                            <span>{pilgrimage.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {room.status === 'occupied' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleChangeStatus(room.id, 'cleaning')}
                    >
                      Check-out
                    </Button>
                  )}
                  {room.status === 'cleaning' && (
                    <Button
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleChangeStatus(room.id, 'available')}
                    >
                      Liberar
                    </Button>
                  )}
                  {room.status === 'available' && (
                    <Button
                      size="sm"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 gap-1"
                      onClick={() => handleChangeStatus(room.id, 'occupied')}
                    >
                      <UserPlus className="w-3 h-3" />
                      Check-in
                    </Button>
                  )}
                  {room.status !== 'maintenance' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1"
                      onClick={() => handleChangeStatus(room.id, 'maintenance')}
                    >
                      <Wrench className="w-3 h-3" />
                      Manutenção
                    </Button>
                  )}
                  {room.status === 'maintenance' && (
                    <Button
                      size="sm"
                      className="flex-1 bg-gray-600 hover:bg-gray-700"
                      onClick={() => handleChangeStatus(room.id, 'available')}
                    >
                      Retornar
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
