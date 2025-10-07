import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Bed, Users, Calendar, Clock, DollarSign, Search, Phone, Mail, CreditCard, User, Bus } from 'lucide-react';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';

interface GuestInfo {
  name: string;
  cpf?: string;
  phone?: string;
  email?: string;
  observations?: string;
}

interface Room {
  id: string;
  number: string;
  type: 'single' | 'double' | 'suite';
  status: 'available' | 'occupied' | 'cleaning' | 'maintenance';
  guest?: GuestInfo;
  checkIn?: string;
  checkOut?: string;
  dailyRate: number;
  pilgrimage?: string; // Nome da romaria
}

interface Pilgrimage {
  id: string;
  name: string;
  arrivalDate: string;
  departureDate: string;
  numberOfPeople: number;
  busGroup: string;
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
  available: 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200',
  occupied: 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200',
  cleaning: 'bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200',
  maintenance: 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200',
};

export function HotelRooms() {
  const [rooms, setRooms] = useState<Room[]>([
    { id: '1', number: '101', type: 'single', status: 'available', dailyRate: 150 },
    { id: '2', number: '102', type: 'single', status: 'cleaning', dailyRate: 150 },
    { 
      id: '3', 
      number: '103', 
      type: 'double', 
      status: 'occupied', 
      guest: { name: 'João Silva', cpf: '123.456.789-00', phone: '(11) 98765-4321' },
      checkIn: '01/10/2025', 
      checkOut: '05/10/2025', 
      dailyRate: 200,
      pilgrimage: 'Romaria Aparecida 2025'
    },
    { id: '4', number: '104', type: 'double', status: 'available', dailyRate: 200 },
    { 
      id: '5', 
      number: '201', 
      type: 'suite', 
      status: 'occupied', 
      guest: { name: 'Maria Santos', phone: '(21) 91234-5678' },
      checkIn: '30/09/2025', 
      checkOut: '03/10/2025', 
      dailyRate: 350,
      pilgrimage: 'Romaria Aparecida 2025'
    },
    { id: '6', number: '202', type: 'suite', status: 'available', dailyRate: 350 },
    { id: '7', number: '203', type: 'double', status: 'available', dailyRate: 200 },
    { id: '8', number: '204', type: 'single', status: 'maintenance', dailyRate: 150 },
    { 
      id: '9', 
      number: '301', 
      type: 'suite', 
      status: 'occupied', 
      guest: { name: 'Carlos Oliveira', cpf: '987.654.321-00', phone: '(31) 99876-5432' },
      checkIn: '28/09/2025', 
      checkOut: '10/10/2025', 
      dailyRate: 350,
      pilgrimage: 'Grupo Nossa Senhora'
    },
    { id: '10', number: '302', type: 'double', status: 'available', dailyRate: 200 },
  ]);

  // Romarias disponíveis
  const [pilgrimages] = useState<Pilgrimage[]>([
    {
      id: '1',
      name: 'Romaria Aparecida 2025',
      arrivalDate: '01/10/2025',
      departureDate: '05/10/2025',
      numberOfPeople: 45,
      busGroup: 'Ônibus 1 - Aparecida'
    },
    {
      id: '2',
      name: 'Grupo Nossa Senhora',
      arrivalDate: '28/09/2025',
      departureDate: '10/10/2025',
      numberOfPeople: 30,
      busGroup: 'Ônibus 2 - Fátima'
    },
    {
      id: '3',
      name: 'Romaria São Paulo',
      arrivalDate: '05/10/2025',
      departureDate: '08/10/2025',
      numberOfPeople: 38,
      busGroup: 'Ônibus 3 - SP'
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPilgrimage, setFilterPilgrimage] = useState<string>('all');
  
  // Check-in dialog
  const [showCheckInDialog, setShowCheckInDialog] = useState(false);
  const [selectedRoomForCheckIn, setSelectedRoomForCheckIn] = useState<Room | null>(null);
  const [guestName, setGuestName] = useState('');
  const [guestCpf, setGuestCpf] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestObservations, setGuestObservations] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [selectedPilgrimage, setSelectedPilgrimage] = useState('');

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.number.includes(searchQuery) || 
                         room.guest?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || room.status === filterStatus;
    const matchesPilgrimage = filterPilgrimage === 'all' || room.pilgrimage === filterPilgrimage;
    return matchesSearch && matchesStatus && matchesPilgrimage;
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

  const handleOpenCheckIn = (room: Room) => {
    setSelectedRoomForCheckIn(room);
    setShowCheckInDialog(true);
    // Resetar campos
    setGuestName('');
    setGuestCpf('');
    setGuestPhone('');
    setGuestEmail('');
    setGuestObservations('');
    setCheckInDate('');
    setCheckOutDate('');
    setSelectedPilgrimage('');
  };

  const handleConfirmCheckIn = () => {
    if (!selectedRoomForCheckIn || !guestName || !checkInDate || !checkOutDate) {
      alert('Por favor, preencha os campos obrigatórios');
      return;
    }

    const guestInfo: GuestInfo = {
      name: guestName,
      cpf: guestCpf,
      phone: guestPhone,
      email: guestEmail,
      observations: guestObservations,
    };

    setRooms(rooms.map(room =>
      room.id === selectedRoomForCheckIn.id
        ? {
            ...room,
            status: 'occupied' as const,
            guest: guestInfo,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            pilgrimage: selectedPilgrimage === 'none' ? undefined : selectedPilgrimage,
          }
        : room
    ));

    setShowCheckInDialog(false);
  };

  const handleCheckOut = (roomId: string) => {
    setRooms(rooms.map(room =>
      room.id === roomId
        ? { ...room, status: 'cleaning' as const, guest: undefined, checkIn: undefined, checkOut: undefined, pilgrimage: undefined }
        : room
    ));
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-slate-900 mb-2">Gestão de Quartos</h1>
          <p className="text-slate-600">Controle de ocupação e disponibilidade</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bed className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total</p>
                <p className="text-2xl text-slate-900">{stats.total}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Bed className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Disponíveis</p>
                <p className="text-2xl text-slate-900">{stats.available}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Ocupados</p>
                <p className="text-2xl text-slate-900">{stats.occupied}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Limpeza</p>
                <p className="text-2xl text-slate-900">{stats.cleaning}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Taxa de Ocupação</p>
                <p className="text-2xl text-slate-900">{stats.occupancyRate}%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Buscar por quarto ou hóspede..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Status Filters - Com Cores */}
            <div>
              <p className="text-sm text-slate-600 mb-2">Status do Quarto</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('all')}
                  className="gap-2"
                >
                  Todos
                </Button>
                <Button
                  variant={filterStatus === 'available' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('available')}
                  className={`gap-2 ${filterStatus === 'available' ? '' : 'border-green-300 text-green-700 hover:bg-green-50'}`}
                >
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Disponível
                </Button>
                <Button
                  variant={filterStatus === 'occupied' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('occupied')}
                  className={`gap-2 ${filterStatus === 'occupied' ? '' : 'border-red-300 text-red-700 hover:bg-red-50'}`}
                >
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Ocupado
                </Button>
                <Button
                  variant={filterStatus === 'cleaning' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('cleaning')}
                  className={`gap-2 ${filterStatus === 'cleaning' ? '' : 'border-yellow-300 text-yellow-700 hover:bg-yellow-50'}`}
                >
                  <span className="w-2 h-2 rounded-full bg-yellow-500" />
                  Limpeza
                </Button>
                <Button
                  variant={filterStatus === 'maintenance' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('maintenance')}
                  className={`gap-2 ${filterStatus === 'maintenance' ? '' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  <span className="w-2 h-2 rounded-full bg-gray-500" />
                  Manutenção
                </Button>
              </div>
            </div>

            {/* Pilgrimage Filter */}
            <div>
              <p className="text-sm text-slate-600 mb-2">
                <Bus className="w-4 h-4 inline mr-1" />
                Filtrar por Romaria
              </p>
              <Select value={filterPilgrimage} onValueChange={setFilterPilgrimage}>
                <SelectTrigger className="w-full md:w-80">
                  <SelectValue placeholder="Todas as romarias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as romarias</SelectItem>
                  {pilgrimages.map(p => (
                    <SelectItem key={p.id} value={p.name}>
                      {p.name} - {p.busGroup} ({p.numberOfPeople} pessoas)
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
            <Card key={room.id} className="overflow-hidden">
              <div className={`p-4 border-l-4 ${
                room.status === 'available' ? 'border-l-green-500' :
                room.status === 'occupied' ? 'border-l-red-500' :
                room.status === 'cleaning' ? 'border-l-yellow-500' :
                'border-l-gray-500'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-slate-900">Quarto {room.number}</h3>
                    <p className="text-sm text-slate-600">{roomTypeLabels[room.type]}</p>
                  </div>
                  <Badge className={`${statusColors[room.status]} border`}>
                    {statusLabels[room.status]}
                  </Badge>
                </div>

                {room.guest && (
                  <div className="mb-3 p-3 bg-slate-50 rounded-lg space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-900">{room.guest.name}</span>
                    </div>
                    {room.guest.phone && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="w-4 h-4" />
                        {room.guest.phone}
                      </div>
                    )}
                    {room.guest.cpf && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CreditCard className="w-4 h-4" />
                        {room.guest.cpf}
                      </div>
                    )}
                    {room.pilgrimage && (
                      <div className="flex items-center gap-2 text-sm text-purple-600">
                        <Bus className="w-4 h-4" />
                        <span className="truncate">{room.pilgrimage}</span>
                      </div>
                    )}
                  </div>
                )}

                {room.checkIn && room.checkOut && (
                  <div className="mb-3 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{room.checkIn} - {room.checkOut}</span>
                    </div>
                  </div>
                )}

                <div className="mb-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span>R$ {room.dailyRate.toFixed(2)}/diária</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {room.status === 'available' && (
                    <Button
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleOpenCheckIn(room)}
                    >
                      Check-in
                    </Button>
                  )}
                  {room.status === 'occupied' && (
                    <Button
                      size="sm"
                      className="flex-1 bg-red-600 hover:bg-red-700"
                      onClick={() => handleCheckOut(room.id)}
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
                  {room.status === 'maintenance' && (
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleChangeStatus(room.id, 'available')}
                    >
                      Concluir Manutenção
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredRooms.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400">Nenhum quarto encontrado</p>
          </div>
        )}
      </div>

      {/* Check-in Dialog com Informações Completas */}
      <Dialog open={showCheckInDialog} onOpenChange={setShowCheckInDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Check-in - Quarto {selectedRoomForCheckIn?.number}</DialogTitle>
            <DialogDescription>
              Preencha os dados do hóspede e período de hospedagem
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Dados do Hóspede */}
            <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
              <h4 className="text-slate-900">Dados do Hóspede</h4>
              
              <div>
                <Label htmlFor="guestName">Nome Completo *</Label>
                <Input
                  id="guestName"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Ex: João da Silva"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="guestCpf">CPF</Label>
                  <Input
                    id="guestCpf"
                    value={guestCpf}
                    onChange={(e) => setGuestCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="guestPhone">Telefone</Label>
                  <Input
                    id="guestPhone"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="(00) 00000-0000"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="guestEmail">E-mail</Label>
                <Input
                  id="guestEmail"
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="guestObservations">Observações</Label>
                <Textarea
                  id="guestObservations"
                  value={guestObservations}
                  onChange={(e) => setGuestObservations(e.target.value)}
                  placeholder="Informações adicionais, restrições alimentares, etc."
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>

            {/* Período e Romaria */}
            <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
              <h4 className="text-slate-900">Período de Hospedagem</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="checkInDate">Check-in *</Label>
                  <Input
                    id="checkInDate"
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="checkOutDate">Check-out *</Label>
                  <Input
                    id="checkOutDate"
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="pilgrimage">
                  <Bus className="w-4 h-4 inline mr-1" />
                  Romaria (opcional)
                </Label>
                <Select value={selectedPilgrimage} onValueChange={setSelectedPilgrimage}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione uma romaria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma romaria</SelectItem>
                    {pilgrimages.map(p => (
                      <SelectItem key={p.id} value={p.name}>
                        {p.name} - {p.busGroup}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Resumo */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="text-blue-900 mb-2">Resumo</h4>
              <p className="text-sm text-blue-700">
                Quarto: {selectedRoomForCheckIn?.number} ({roomTypeLabels[selectedRoomForCheckIn?.type || 'single']})
              </p>
              <p className="text-sm text-blue-700">
                Diária: R$ {selectedRoomForCheckIn?.dailyRate.toFixed(2)}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCheckInDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmCheckIn} className="bg-green-600 hover:bg-green-700">
              Confirmar Check-in
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}