import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Bus, Users, Calendar, Plus, Pencil, Trash2, Eye, Bed, Search } from 'lucide-react';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';

interface Pilgrimage {
  id: string;
  name: string;
  arrivalDate: string;
  departureDate: string;
  numberOfPeople: number;
  busGroup: string;
  status: 'active' | 'completed' | 'cancelled';
  notes?: string;
}

const INITIAL_PILGRIMAGES: Pilgrimage[] = [
  {
    id: '1',
    name: 'Romaria Aparecida 2025',
    arrivalDate: '2025-10-01',
    departureDate: '2025-10-05',
    numberOfPeople: 45,
    busGroup: 'Ônibus 1 - Aparecida',
    status: 'active',
    notes: 'Grupo de São Paulo. Preferem quartos no 1º andar.',
  },
  {
    id: '2',
    name: 'Grupo Nossa Senhora',
    arrivalDate: '2025-09-28',
    departureDate: '2025-10-10',
    numberOfPeople: 30,
    busGroup: 'Ônibus 2 - Fátima',
    status: 'active',
    notes: '2 pessoas com mobilidade reduzida.',
  },
  {
    id: '3',
    name: 'Romaria São Paulo',
    arrivalDate: '2025-10-05',
    departureDate: '2025-10-08',
    numberOfPeople: 38,
    busGroup: 'Ônibus 3 - SP',
    status: 'active',
  },
  {
    id: '4',
    name: 'Grupo São José',
    arrivalDate: '2025-09-15',
    departureDate: '2025-09-20',
    numberOfPeople: 25,
    busGroup: 'Ônibus 4 - RJ',
    status: 'completed',
  },
];

const statusLabels = {
  active: 'Ativa',
  completed: 'Concluída',
  cancelled: 'Cancelada',
};

const statusColors = {
  active: 'bg-green-100 text-green-700 border-green-300',
  completed: 'bg-blue-100 text-blue-700 border-blue-300',
  cancelled: 'bg-red-100 text-red-700 border-red-300',
};

export function HotelPilgrimages() {
  const [pilgrimages, setPilgrimages] = useState<Pilgrimage[]>(INITIAL_PILGRIMAGES);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedPilgrimage, setSelectedPilgrimage] = useState<Pilgrimage | null>(null);
  
  // Form states
  const [formName, setFormName] = useState('');
  const [formArrivalDate, setFormArrivalDate] = useState('');
  const [formDepartureDate, setFormDepartureDate] = useState('');
  const [formNumberOfPeople, setFormNumberOfPeople] = useState('');
  const [formBusGroup, setFormBusGroup] = useState('');
  const [formStatus, setFormStatus] = useState<Pilgrimage['status']>('active');
  const [formNotes, setFormNotes] = useState('');

  const filteredPilgrimages = pilgrimages.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.busGroup.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: pilgrimages.length,
    active: pilgrimages.filter(p => p.status === 'active').length,
    totalPeople: pilgrimages.filter(p => p.status === 'active').reduce((sum, p) => sum + p.numberOfPeople, 0),
    completed: pilgrimages.filter(p => p.status === 'completed').length,
  };

  const resetForm = () => {
    setFormName('');
    setFormArrivalDate('');
    setFormDepartureDate('');
    setFormNumberOfPeople('');
    setFormBusGroup('');
    setFormStatus('active');
    setFormNotes('');
  };

  const handleOpenAddDialog = () => {
    resetForm();
    setShowAddDialog(true);
  };

  const handleOpenEditDialog = (pilgrimage: Pilgrimage) => {
    setSelectedPilgrimage(pilgrimage);
    setFormName(pilgrimage.name);
    setFormArrivalDate(pilgrimage.arrivalDate);
    setFormDepartureDate(pilgrimage.departureDate);
    setFormNumberOfPeople(pilgrimage.numberOfPeople.toString());
    setFormBusGroup(pilgrimage.busGroup);
    setFormStatus(pilgrimage.status);
    setFormNotes(pilgrimage.notes || '');
    setShowEditDialog(true);
  };

  const handleOpenDetailsDialog = (pilgrimage: Pilgrimage) => {
    setSelectedPilgrimage(pilgrimage);
    setShowDetailsDialog(true);
  };

  const handleAddPilgrimage = () => {
    if (!formName || !formArrivalDate || !formDepartureDate || !formNumberOfPeople || !formBusGroup) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const newPilgrimage: Pilgrimage = {
      id: Date.now().toString(),
      name: formName,
      arrivalDate: formArrivalDate,
      departureDate: formDepartureDate,
      numberOfPeople: parseInt(formNumberOfPeople),
      busGroup: formBusGroup,
      status: formStatus,
      notes: formNotes,
    };

    setPilgrimages([...pilgrimages, newPilgrimage]);
    setShowAddDialog(false);
    toast.success('Romaria adicionada com sucesso!');
    resetForm();
  };

  const handleEditPilgrimage = () => {
    if (!selectedPilgrimage || !formName || !formArrivalDate || !formDepartureDate || !formNumberOfPeople || !formBusGroup) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setPilgrimages(pilgrimages.map(p =>
      p.id === selectedPilgrimage.id
        ? {
            ...p,
            name: formName,
            arrivalDate: formArrivalDate,
            departureDate: formDepartureDate,
            numberOfPeople: parseInt(formNumberOfPeople),
            busGroup: formBusGroup,
            status: formStatus,
            notes: formNotes,
          }
        : p
    ));

    setShowEditDialog(false);
    toast.success('Romaria atualizada com sucesso!');
    resetForm();
  };

  const handleDeletePilgrimage = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta romaria?')) {
      setPilgrimages(pilgrimages.filter(p => p.id !== id));
      toast.success('Romaria excluída com sucesso!');
    }
  };

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const calculateDays = (arrival: string, departure: string) => {
    const arrivalDate = new Date(arrival);
    const departureDate = new Date(departure);
    const diffTime = Math.abs(departureDate.getTime() - arrivalDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-slate-900 mb-2">Gestão de Romarias</h1>
            <p className="text-slate-600">Controle de grupos e ônibus de viagem</p>
          </div>
          <Button 
            onClick={handleOpenAddDialog}
            className="bg-purple-600 hover:bg-purple-700 gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Romaria
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Bus className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total de Romarias</p>
                <p className="text-2xl text-slate-900">{stats.total}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Romarias Ativas</p>
                <p className="text-2xl text-slate-900">{stats.active}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total de Pessoas</p>
                <p className="text-2xl text-slate-900">{stats.totalPeople}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                <Bed className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Concluídas</p>
                <p className="text-2xl text-slate-900">{stats.completed}</p>
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
                placeholder="Buscar por nome ou grupo de ônibus..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Status Filters */}
            <div>
              <p className="text-sm text-slate-600 mb-2">Status da Romaria</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('all')}
                >
                  Todas
                </Button>
                <Button
                  variant={filterStatus === 'active' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('active')}
                  className={filterStatus === 'active' ? '' : 'border-green-300 text-green-700 hover:bg-green-50'}
                >
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                  Ativas
                </Button>
                <Button
                  variant={filterStatus === 'completed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('completed')}
                  className={filterStatus === 'completed' ? '' : 'border-blue-300 text-blue-700 hover:bg-blue-50'}
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                  Concluídas
                </Button>
                <Button
                  variant={filterStatus === 'cancelled' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('cancelled')}
                  className={filterStatus === 'cancelled' ? '' : 'border-red-300 text-red-700 hover:bg-red-50'}
                >
                  <span className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                  Canceladas
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Pilgrimages List */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPilgrimages.map((pilgrimage) => (
            <Card key={pilgrimage.id} className="overflow-hidden">
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-slate-900 mb-1">{pilgrimage.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Bus className="w-4 h-4" />
                      {pilgrimage.busGroup}
                    </div>
                  </div>
                  <Badge className={`${statusColors[pilgrimage.status]} border`}>
                    {statusLabels[pilgrimage.status]}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {formatDate(pilgrimage.arrivalDate)} - {formatDate(pilgrimage.departureDate)}
                    </span>
                  </div>
                  <div className="text-sm text-slate-500">
                    {calculateDays(pilgrimage.arrivalDate, pilgrimage.departureDate)} dias de hospedagem
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Users className="w-4 h-4" />
                    <span>{pilgrimage.numberOfPeople} pessoas</span>
                  </div>
                </div>

                {pilgrimage.notes && (
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600 line-clamp-2">{pilgrimage.notes}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => handleOpenDetailsDialog(pilgrimage)}
                  >
                    <Eye className="w-4 h-4" />
                    Detalhes
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenEditDialog(pilgrimage)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => handleDeletePilgrimage(pilgrimage.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredPilgrimages.length === 0 && (
          <div className="text-center py-12">
            <Bus className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400">Nenhuma romaria encontrada</p>
          </div>
        )}
      </div>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Romaria</DialogTitle>
            <DialogDescription>
              Cadastre uma nova romaria/grupo de viagem
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Nome da Romaria *</Label>
              <Input
                id="name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ex: Romaria Aparecida 2025"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="busGroup">Grupo/Ônibus *</Label>
              <Input
                id="busGroup"
                value={formBusGroup}
                onChange={(e) => setFormBusGroup(e.target.value)}
                placeholder="Ex: Ônibus 1 - Aparecida"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="arrivalDate">Data de Chegada *</Label>
                <Input
                  id="arrivalDate"
                  type="date"
                  value={formArrivalDate}
                  onChange={(e) => setFormArrivalDate(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="departureDate">Data de Partida *</Label>
                <Input
                  id="departureDate"
                  type="date"
                  value={formDepartureDate}
                  onChange={(e) => setFormDepartureDate(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="numberOfPeople">Número de Pessoas *</Label>
              <Input
                id="numberOfPeople"
                type="number"
                value={formNumberOfPeople}
                onChange={(e) => setFormNumberOfPeople(e.target.value)}
                placeholder="Ex: 45"
                className="mt-1"
                min="1"
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formStatus} onValueChange={(value) => setFormStatus(value as Pilgrimage['status'])}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativa</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Informações adicionais, necessidades especiais, etc."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddPilgrimage} className="bg-purple-600 hover:bg-purple-700">
              Adicionar Romaria
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Romaria</DialogTitle>
            <DialogDescription>
              Atualize as informações da romaria
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-name">Nome da Romaria *</Label>
              <Input
                id="edit-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ex: Romaria Aparecida 2025"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="edit-busGroup">Grupo/Ônibus *</Label>
              <Input
                id="edit-busGroup"
                value={formBusGroup}
                onChange={(e) => setFormBusGroup(e.target.value)}
                placeholder="Ex: Ônibus 1 - Aparecida"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-arrivalDate">Data de Chegada *</Label>
                <Input
                  id="edit-arrivalDate"
                  type="date"
                  value={formArrivalDate}
                  onChange={(e) => setFormArrivalDate(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="edit-departureDate">Data de Partida *</Label>
                <Input
                  id="edit-departureDate"
                  type="date"
                  value={formDepartureDate}
                  onChange={(e) => setFormDepartureDate(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-numberOfPeople">Número de Pessoas *</Label>
              <Input
                id="edit-numberOfPeople"
                type="number"
                value={formNumberOfPeople}
                onChange={(e) => setFormNumberOfPeople(e.target.value)}
                placeholder="Ex: 45"
                className="mt-1"
                min="1"
              />
            </div>

            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select value={formStatus} onValueChange={(value) => setFormStatus(value as Pilgrimage['status'])}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativa</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-notes">Observações</Label>
              <Textarea
                id="edit-notes"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Informações adicionais, necessidades especiais, etc."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditPilgrimage} className="bg-purple-600 hover:bg-purple-700">
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedPilgrimage?.name}</DialogTitle>
            <DialogDescription>
              Detalhes completos da romaria
            </DialogDescription>
          </DialogHeader>

          {selectedPilgrimage && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Grupo/Ônibus</p>
                  <p className="text-slate-900">{selectedPilgrimage.busGroup}</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Status</p>
                  <Badge className={`${statusColors[selectedPilgrimage.status]} border`}>
                    {statusLabels[selectedPilgrimage.status]}
                  </Badge>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Período</p>
                <p className="text-slate-900">
                  {formatDate(selectedPilgrimage.arrivalDate)} até {formatDate(selectedPilgrimage.departureDate)}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  {calculateDays(selectedPilgrimage.arrivalDate, selectedPilgrimage.departureDate)} dias de hospedagem
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Número de Pessoas</p>
                <p className="text-2xl text-slate-900">{selectedPilgrimage.numberOfPeople}</p>
              </div>

              {selectedPilgrimage.notes && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900 mb-1">Observações</p>
                  <p className="text-blue-700">{selectedPilgrimage.notes}</p>
                </div>
              )}

              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-900 mb-2">Informações Adicionais</p>
                <p className="text-sm text-purple-700">
                  💡 Você pode associar hóspedes a esta romaria durante o check-in na aba "Gestão de Quartos"
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowDetailsDialog(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}