"use client";
import { useState } from 'react';
import { usePilgrimagesDB } from '@/hooks/usePilgrimagesDB';
// import { useRoomsDB } from '../hooks/useRoomsDB';
import { useRoomsDB } from '@/hooks/useRoomsDB';
import { Pilgrimage, PilgrimageFormData, PilgrimageOccurrence } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bus, Users, Calendar, Plus, Pencil, Trash2, Eye, Bed, Search, Phone, CalendarPlus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

// Helper para compatibilidade com múltiplas datas
const getPilgrimageDates = (p: Pilgrimage) => {
  const arrivalDate = p.arrivalDate || p.occurrences?.[0]?.arrivalDate || '';
  const departureDate = p.departureDate || p.occurrences?.[0]?.departureDate || '';
  return { arrivalDate, departureDate };
};

export function HotelPilgrimages() {
  const { pilgrimages, createPilgrimage, updatePilgrimage, deletePilgrimage, loading } = usePilgrimagesDB();
  const { rooms } = useRoomsDB();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedPilgrimage, setSelectedPilgrimage] = useState<Pilgrimage | null>(null);
  // Form states
  const [form, setForm] = useState<PilgrimageFormData>({
    name: '',
    arrivalDate: '',
    departureDate: '',
    numberOfPeople: 0,
    busGroup: '',
    contactPhone: '',
  });
  const [formStatus, setFormStatus] = useState<'active' | 'completed' | 'cancelled'>('active');
  const [formNotes, setFormNotes] = useState('');
  // Estado para múltiplas occurrences
  const [formOccurrences, setFormOccurrences] = useState<Omit<PilgrimageOccurrence, 'id' | 'pilgrimageId'>[]>([]);
  const [showMultipleDates, setShowMultipleDates] = useState(false);

  const filteredPilgrimages = pilgrimages.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.busGroup.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.contactPhone || '').includes(searchQuery);
    const matchesStatus = filterStatus === 'all' || (p.status ?? 'active') === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: pilgrimages.length,
    active: pilgrimages.filter(p => (p.status ?? 'active') === 'active').length,
    totalPeople: pilgrimages.filter(p => (p.status ?? 'active') === 'active').reduce((sum, p) => sum + (p.numberOfPeople || 0), 0),
    completed: pilgrimages.filter(p => (p.status ?? 'active') === 'completed').length,
  };

  const resetForm = () => {
    setForm({ name: '', arrivalDate: '', departureDate: '', numberOfPeople: 0, busGroup: '', contactPhone: '' });
    setFormStatus('active');
    setFormNotes('');
    setFormOccurrences([]);
    setShowMultipleDates(false);
  };

  const addOccurrence = () => {
    setFormOccurrences(prev => [
      ...prev,
      {
        arrivalDate: '',
        departureDate: '',
        status: 'scheduled',
        notes: ''
      }
    ]);
  };

  const removeOccurrence = (index: number) => {
    setFormOccurrences(prev => prev.filter((_, i) => i !== index));
  };

  const updateOccurrence = (index: number, field: keyof Omit<PilgrimageOccurrence, 'id' | 'pilgrimageId'>, value: any) => {
    setFormOccurrences(prev => prev.map((occ, i) => 
      i === index ? { ...occ, [field]: value } : occ
    ));
  };

  const handleOpenAddDialog = () => {
    resetForm();
    setShowAddDialog(true);
  };

  const handleOpenEditDialog = (pilgrimage: Pilgrimage) => {
    setSelectedPilgrimage(pilgrimage);
    const arrivalDate = pilgrimage.arrivalDate || pilgrimage.occurrences?.[0]?.arrivalDate || '';
    const departureDate = pilgrimage.departureDate || pilgrimage.occurrences?.[0]?.departureDate || '';
    setForm({
      name: pilgrimage.name,
      arrivalDate,
      departureDate,
      numberOfPeople: pilgrimage.numberOfPeople,
      busGroup: pilgrimage.busGroup,
      contactPhone: pilgrimage.contactPhone || '',
    });
    setFormStatus((pilgrimage.status as any) || 'active');
    setFormNotes((pilgrimage as any).notes || '');
    
    // Carregar occurrences existentes (excluindo a primeira que já está no form)
    const existingOccurrences = pilgrimage.occurrences || [];
    if (existingOccurrences.length > 1) {
      setFormOccurrences(existingOccurrences.slice(1).map(occ => ({
        arrivalDate: occ.arrivalDate,
        departureDate: occ.departureDate,
        status: occ.status,
        notes: occ.notes
      })));
      setShowMultipleDates(true);
    }
    
    setShowEditDialog(true);
  };

  const handleOpenDetailsDialog = (pilgrimage: Pilgrimage) => {
    setSelectedPilgrimage(pilgrimage);
    setShowDetailsDialog(true);
  };

  const handleAddPilgrimage = async () => {
    if (!form.name || !form.arrivalDate || !form.departureDate || !form.numberOfPeople || !form.busGroup) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    
    // Validar occurrences adicionais
    if (showMultipleDates) {
      for (let i = 0; i < formOccurrences.length; i++) {
        const occ = formOccurrences[i];
        if (!occ.arrivalDate || !occ.departureDate) {
          toast.error(`Preencha as datas da ocorrência ${i + 2}`);
          return;
        }
        if (new Date(occ.arrivalDate) >= new Date(occ.departureDate)) {
          toast.error(`Data de partida deve ser posterior à chegada (ocorrência ${i + 2})`);
          return;
        }
      }
    }
    
    // Criar romaria com occurrences
    const allOccurrences: Omit<PilgrimageOccurrence, 'id' | 'pilgrimageId'>[] = [
      {
        arrivalDate: form.arrivalDate,
        departureDate: form.departureDate,
        status: 'scheduled',
        notes: formNotes
      },
      ...formOccurrences
    ];
    
    await createPilgrimage({ 
      ...form, 
      status: formStatus, 
      notes: formNotes,
      occurrences: allOccurrences as any // IDs serão gerados pelo backend
    });
    setShowAddDialog(false);
    resetForm();
  };

  const handleEditPilgrimage = async () => {
    if (!selectedPilgrimage || !form.name || !form.arrivalDate || !form.departureDate || !form.numberOfPeople || !form.busGroup) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    
    // Validar occurrences adicionais
    if (showMultipleDates) {
      for (let i = 0; i < formOccurrences.length; i++) {
        const occ = formOccurrences[i];
        if (!occ.arrivalDate || !occ.departureDate) {
          toast.error(`Preencha as datas da ocorrência ${i + 2}`);
          return;
        }
        if (new Date(occ.arrivalDate) >= new Date(occ.departureDate)) {
          toast.error(`Data de partida deve ser posterior à chegada (ocorrência ${i + 2})`);
          return;
        }
      }
    }
    
    // Atualizar romaria com occurrences
    const allOccurrences: Omit<PilgrimageOccurrence, 'id' | 'pilgrimageId'>[] = [
      {
        arrivalDate: form.arrivalDate,
        departureDate: form.departureDate,
        status: 'scheduled',
        notes: formNotes
      },
      ...formOccurrences
    ];
    
    await updatePilgrimage(selectedPilgrimage.id, { 
      ...form, 
      status: formStatus, 
      notes: formNotes,
      occurrences: allOccurrences as any // IDs serão gerados pelo backend
    });
    setShowEditDialog(false);
    resetForm();
  };

  const handleDeletePilgrimage = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta romaria?')) {
      await deletePilgrimage(id);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const calculateDays = (arrival: string, departure: string) => {
    if (!arrival || !departure) return 0;
    const arrivalDate = new Date(arrival);
    const departureDate = new Date(departure);
    const diffTime = Math.abs(departureDate.getTime() - arrivalDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

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
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-lg flex items-center justify-center gap-3 shadow-md transition-all duration-200 min-w-[170px] font-semibold text-base"
            aria-label="Adicionar nova romaria"
            style={{ boxShadow: '0 2px 8px 0 rgba(16, 185, 129, 0.10)' }}
          >
            <Plus className="w-5 h-5" aria-hidden="true" />
            <span className="font-semibold text-lg">Romaria</span>
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
                placeholder="Buscar por nome, grupo ou telefone..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            {/* Status Filters */}
            <div>
              <p className="text-sm text-slate-600 mb-2">Status da Romaria</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}

                  onClick={() => setFilterStatus('all')}
                >
                  Todas
                </Button>
                <Button
                  variant={filterStatus === 'active' ? 'default' : 'outline'}

                  onClick={() => setFilterStatus('active')}
                  className={filterStatus === 'active' ? '' : 'border-green-300 text-green-700 hover:bg-green-50'}
                >
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-2" /> Ativas
                </Button>
                <Button
                  variant={filterStatus === 'completed' ? 'default' : 'outline'}

                  onClick={() => setFilterStatus('completed')}
                  className={filterStatus === 'completed' ? '' : 'border-blue-300 text-blue-700 hover:bg-blue-50'}
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500 mr-2" /> Concluídas
                </Button>
                <Button
                  variant={filterStatus === 'cancelled' ? 'default' : 'outline'}

                  onClick={() => setFilterStatus('cancelled')}
                  className={filterStatus === 'cancelled' ? '' : 'border-red-300 text-red-700 hover:bg-red-50'}
                >
                  <span className="w-2 h-2 rounded-full bg-red-500 mr-2" /> Canceladas
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
                      <Bus className="w-4 h-4" /> {pilgrimage.busGroup}
                    </div>
                    {pilgrimage.contactPhone && (
                      <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                        <Phone className="w-4 h-4" /> {pilgrimage.contactPhone}
                      </div>
                    )}
                  </div>
                  <Badge className={`${statusColors[pilgrimage.status ?? 'active']} border`}>
                    {statusLabels[pilgrimage.status ?? 'active']}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(getPilgrimageDates(pilgrimage).arrivalDate)} - {formatDate(getPilgrimageDates(pilgrimage).departureDate)}</span>
                  </div>
                  <div className="text-sm text-slate-500">
                    {calculateDays(getPilgrimageDates(pilgrimage).arrivalDate, getPilgrimageDates(pilgrimage).departureDate)} dias de hospedagem
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
                  <Button variant="outline" className="flex-1 gap-2" onClick={() => handleOpenDetailsDialog(pilgrimage)}>
                    <Eye className="w-4 h-4" /> Detalhes
                  </Button>
                  <Button variant="outline" onClick={() => handleOpenEditDialog(pilgrimage)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => handleDeletePilgrimage(pilgrimage.id)}>
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
            <DialogDescription>Cadastre uma nova romaria/grupo de viagem</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Nome da Romaria *</Label>
              <Input id="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Romaria Aparecida 2025" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="busGroup">Grupo/Ônibus *</Label>
              <Input id="busGroup" value={form.busGroup} onChange={e => setForm(f => ({ ...f, busGroup: e.target.value }))} placeholder="Ex: Ônibus 1 - Aparecida" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="contactPhone">Telefone de Contato *</Label>
              <Input id="contactPhone" value={form.contactPhone} onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))} placeholder="Ex: (99) 99999-9999" className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="arrivalDate">Data de Chegada *</Label>
                <Input id="arrivalDate" type="date" value={form.arrivalDate} onChange={e => setForm(f => ({ ...f, arrivalDate: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="departureDate">Data de Partida *</Label>
                <Input id="departureDate" type="date" value={form.departureDate} onChange={e => setForm(f => ({ ...f, departureDate: e.target.value }))} className="mt-1" />
              </div>
            </div>
            
            {/* Múltiplas Datas */}
            <div className="space-y-2">
              <Button 
                type="button" 
                variant="outline" 
 
                onClick={() => setShowMultipleDates(!showMultipleDates)} 
                className="w-full gap-2"
              >
                <CalendarPlus className="w-4 h-4" />
                {showMultipleDates ? 'Ocultar' : 'Adicionar'} datas adicionais (romaria recorrente)
              </Button>
              
              {showMultipleDates && (
                <div className="space-y-3 p-4 border rounded-lg bg-slate-50">
                  <p className="text-sm text-slate-600">
                    Adicione múltiplas datas para romarias que retornam regularmente (ex: mensalmente, anualmente)
                  </p>
                  
                  {formOccurrences.map((occ, index) => (
                    <div key={index} className="flex gap-2 items-start p-3 bg-white rounded border">
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Chegada {index + 2}</Label>
                          <Input 
                            type="date" 
                            value={occ.arrivalDate} 
                            onChange={e => updateOccurrence(index, 'arrivalDate', e.target.value)}
                            className="mt-1"

                          />
                        </div>
                        <div>
                          <Label className="text-xs">Partida {index + 2}</Label>
                          <Input 
                            type="date" 
                            value={occ.departureDate} 
                            onChange={e => updateOccurrence(index, 'departureDate', e.target.value)}
                            className="mt-1"

                          />
                        </div>
                      </div>
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeOccurrence(index)}
                        className="text-red-600 hover:bg-red-50 mt-5"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <Button 
                    type="button"
                    variant="outline" 
 
                    onClick={addOccurrence} 
                    className="w-full gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar data
                  </Button>
                </div>
              )}
            </div>
            
            <div>
              <Label htmlFor="numberOfPeople">Número de Pessoas *</Label>
              <Input id="numberOfPeople" type="number" value={form.numberOfPeople} onChange={e => setForm(f => ({ ...f, numberOfPeople: Number(e.target.value) }))} placeholder="Ex: 45" className="mt-1" min="1" />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formStatus} onValueChange={value => setFormStatus(value as any)}>
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
              <Textarea id="notes" value={formNotes} onChange={e => setFormNotes(e.target.value)} placeholder="Informações adicionais, necessidades especiais, etc." className="mt-1" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancelar</Button>
            <Button onClick={handleAddPilgrimage} className="bg-purple-600 hover:bg-purple-700">Adicionar Romaria</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Romaria</DialogTitle>
            <DialogDescription>Atualize as informações da romaria</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-name">Nome da Romaria *</Label>
              <Input id="edit-name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Romaria Aparecida 2025" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="edit-busGroup">Grupo/Ônibus *</Label>
              <Input id="edit-busGroup" value={form.busGroup} onChange={e => setForm(f => ({ ...f, busGroup: e.target.value }))} placeholder="Ex: Ônibus 1 - Aparecida" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="edit-contactPhone">Telefone de Contato *</Label>
              <Input id="edit-contactPhone" value={form.contactPhone} onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))} placeholder="Ex: (99) 99999-9999" className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-arrivalDate">Data de Chegada *</Label>
                <Input id="edit-arrivalDate" type="date" value={form.arrivalDate} onChange={e => setForm(f => ({ ...f, arrivalDate: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="edit-departureDate">Data de Partida *</Label>
                <Input id="edit-departureDate" type="date" value={form.departureDate} onChange={e => setForm(f => ({ ...f, departureDate: e.target.value }))} className="mt-1" />
              </div>
            </div>
            
            {/* Múltiplas Datas - Edit */}
            <div className="space-y-2">
              <Button 
                type="button" 
                variant="outline" 
 
                onClick={() => setShowMultipleDates(!showMultipleDates)} 
                className="w-full gap-2"
              >
                <CalendarPlus className="w-4 h-4" />
                {showMultipleDates ? 'Ocultar' : 'Gerenciar'} datas adicionais
              </Button>
              
              {showMultipleDates && (
                <div className="space-y-3 p-4 border rounded-lg bg-slate-50">
                  <p className="text-sm text-slate-600">
                    Gerencie múltiplas datas para esta romaria
                  </p>
                  
                  {formOccurrences.map((occ, index) => (
                    <div key={index} className="flex gap-2 items-start p-3 bg-white rounded border">
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Chegada {index + 2}</Label>
                          <Input 
                            type="date" 
                            value={occ.arrivalDate} 
                            onChange={e => updateOccurrence(index, 'arrivalDate', e.target.value)}
                            className="mt-1"

                          />
                        </div>
                        <div>
                          <Label className="text-xs">Partida {index + 2}</Label>
                          <Input 
                            type="date" 
                            value={occ.departureDate} 
                            onChange={e => updateOccurrence(index, 'departureDate', e.target.value)}
                            className="mt-1"

                          />
                        </div>
                      </div>
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeOccurrence(index)}
                        className="text-red-600 hover:bg-red-50 mt-5"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <Button 
                    type="button"
                    variant="outline" 
 
                    onClick={addOccurrence} 
                    className="w-full gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar data
                  </Button>
                </div>
              )}
            </div>
            
            <div>
              <Label htmlFor="edit-numberOfPeople">Número de Pessoas *</Label>
              <Input id="edit-numberOfPeople" type="number" value={form.numberOfPeople} onChange={e => setForm(f => ({ ...f, numberOfPeople: Number(e.target.value) }))} placeholder="Ex: 45" className="mt-1" min="1" />
            </div>
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select value={formStatus} onValueChange={value => setFormStatus(value as any)}>
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
              <Textarea id="edit-notes" value={formNotes} onChange={e => setFormNotes(e.target.value)} placeholder="Informações adicionais, necessidades especiais, etc." className="mt-1" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancelar</Button>
            <Button onClick={handleEditPilgrimage} className="bg-purple-600 hover:bg-purple-700">Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedPilgrimage?.name}</DialogTitle>
            <DialogDescription>Detalhes completos da romaria</DialogDescription>
          </DialogHeader>
          {selectedPilgrimage && (
            <div className="space-y-4 py-4">
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Grupo/Ônibus</p>
                  <p className="text-slate-900">{selectedPilgrimage.busGroup}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Status</p>
                  <Badge className={`${statusColors[selectedPilgrimage.status ?? 'active']} border`}>
                    {statusLabels[selectedPilgrimage.status ?? 'active']}
                  </Badge>
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Telefone de Contato</p>
                <p className="text-slate-900 flex items-center gap-2"><Phone className="w-4 h-4" />{selectedPilgrimage.contactPhone}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Período</p>
                <p className="text-slate-900">{formatDate(getPilgrimageDates(selectedPilgrimage).arrivalDate)} até {formatDate(getPilgrimageDates(selectedPilgrimage).departureDate)}</p>
                <p className="text-sm text-slate-500 mt-1">{calculateDays(getPilgrimageDates(selectedPilgrimage).arrivalDate, getPilgrimageDates(selectedPilgrimage).departureDate)} dias de hospedagem</p>
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
                {/* Quartos e hóspedes associados */}
                <p className="text-sm text-purple-900 mb-2 font-semibold">Quartos e hóspedes associados</p>
                {rooms.filter(r => r.pilgrimage_id === selectedPilgrimage.id).length === 0 ? (
                  <p className="text-sm text-purple-700">Nenhum quarto associado a esta romaria ainda.</p>
                ) : (
                  <ul className="space-y-2">
                    {rooms.filter(r => r.pilgrimage_id === selectedPilgrimage.id).map(room => (
                      <li key={room.id} className="bg-white rounded-lg p-3 border border-purple-200">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-purple-800">Quarto {room.number}</span>
                          {room.guest_name && (
                            <span className="text-sm text-slate-700">Hóspede: {room.guest_name}</span>
                          )}
                        </div>
                        {room.guest_cpf && (
                          <div className="text-xs text-slate-500">CPF: {room.guest_cpf}</div>
                        )}
                        {room.guest_phone && (
                          <div className="text-xs text-slate-500">Telefone: {room.guest_phone}</div>
                        )}
                        {room.check_in_date && (
                          <div className="text-xs text-slate-500">Check-in: {room.check_in_date}</div>
                        )}
                        {room.check_out_date && (
                          <div className="text-xs text-slate-500">Check-out: {room.check_out_date}</div>
                        )}
                        {room.observations && (
                          <div className="text-xs text-slate-500">Obs: {room.observations}</div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="text-xs text-purple-700 mt-3">💡 Você pode associar hóspedes a esta romaria durante o check-in na aba "Gestão de Quartos"</p>
              </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowDetailsDialog(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
