'use client'
import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Bed, Users, Calendar, Clock, DollarSign, Search } from 'lucide-react';
import { Input } from './ui/input';

interface Room {
  id: string;
  number: string;
  type: 'single' | 'double' | 'suite';
  status: 'available' | 'occupied' | 'cleaning' | 'maintenance';
  guest?: string;
  checkIn?: string;
  checkOut?: string;
  dailyRate: number;
}

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
  const [rooms, setRooms] = useState<Room[]>([
    { id: '1', number: '101', type: 'single', status: 'available', dailyRate: 150 },
    { id: '2', number: '102', type: 'single', status: 'cleaning', dailyRate: 150 },
    { id: '3', number: '103', type: 'double', status: 'occupied', guest: 'João Silva', checkIn: '01/10/2025', checkOut: '05/10/2025', dailyRate: 200 },
    { id: '4', number: '104', type: 'double', status: 'available', dailyRate: 200 },
    { id: '5', number: '201', type: 'suite', status: 'occupied', guest: 'Maria Santos', checkIn: '30/09/2025', checkOut: '03/10/2025', dailyRate: 350 },
    { id: '6', number: '202', type: 'suite', status: 'available', dailyRate: 350 },
    { id: '7', number: '203', type: 'double', status: 'available', dailyRate: 200 },
    { id: '8', number: '204', type: 'single', status: 'maintenance', dailyRate: 150 },
    { id: '9', number: '301', type: 'suite', status: 'occupied', guest: 'Carlos Oliveira', checkIn: '28/09/2025', checkOut: '10/10/2025', dailyRate: 350 },
    { id: '10', number: '302', type: 'double', status: 'available', dailyRate: 200 },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.number.includes(searchQuery) || 
                         room.guest?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || room.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: rooms.length,
    available: rooms.filter(r => r.status === 'available').length,
    occupied: rooms.filter(r => r.status === 'occupied').length,
    cleaning: rooms.filter(r => r.status === 'cleaning').length,
    occupancyRate: ((rooms.filter(r => r.status === 'occupied').length / rooms.length) * 100).toFixed(0),
  };

  const handleChangeStatus = (roomId: string, newStatus: Room['status']) => {
    setRooms(rooms.map(room => 
      room.id === roomId ? { ...room, status: newStatus } : room
    ));
  };

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
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Buscar por quarto ou hóspede..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                  <p className="text-sm text-slate-500">{roomTypeLabels[room.type]}</p>
                </div>
                <Badge className={`${statusColors[room.status]} border`}>
                  {statusLabels[room.status]}
                </Badge>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <DollarSign className="w-4 h-4" />
                  <span>R$ {room.dailyRate}/diária</span>
                </div>

                {room.status === 'occupied' && room.guest && (
                  <>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Users className="w-4 h-4" />
                      <span>{room.guest}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4" />
                      <span>{room.checkIn} - {room.checkOut}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-2">
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
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleChangeStatus(room.id, 'occupied')}
                  >
                    Check-in
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
