"use client";
import { useState } from 'react';
import { usePilgrimagesDB } from '@/hooks/usePilgrimagesDB';
import { useRoomsDB } from '@/hooks/useRoomsDB';
import { Pilgrimage, PilgrimageFormData, PilgrimageOccurrence } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bus, Users, Calendar, Plus, Pencil, Trash2, Eye, Search, Phone, CalendarPlus, X, History, CalendarClock, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { getLocalDateStr } from '@/utils/agenda';

const CHANNEL_LABELS: Record<NonNullable<Pilgrimage['defaultChannel']>, string> = {
  direto: 'Direto',
  booking: 'Booking',
  agenciador: 'Agenciador',
  motorista: 'Indicação - Motorista de Ônibus',
  chefe_romaria: 'Indicação - Chefe de Romaria',
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

// Última vinda: a ocorrência mais recente cuja chegada já passou (ou é hoje)
const getLastVisit = (p: Pilgrimage): PilgrimageOccurrence | null => {
  const today = getLocalDateStr();
  const past = (p.occurrences || []).filter(o => o.arrivalDate <= today);
  if (past.length === 0) return null;
  return past.reduce((latest, o) => (o.arrivalDate > latest.arrivalDate ? o : latest));
};

// Próxima vinda agendada: a ocorrência futura mais próxima
const getNextVisit = (p: Pilgrimage): PilgrimageOccurrence | null => {
  const today = getLocalDateStr();
  const future = (p.occurrences || []).filter(o => o.arrivalDate > today && o.status !== 'cancelled');
  if (future.length === 0) return null;
  return future.reduce((earliest, o) => (o.arrivalDate < earliest.arrivalDate ? o : earliest));
};

type OccurrenceFormEntry = Omit<PilgrimageOccurrence, 'id' | 'pilgrimageId'>;

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
  const [formOrigin, setFormOrigin] = useState('');
  const [formNumberOfBuses, setFormNumberOfBuses] = useState(0);
  const [formNotes, setFormNotes] = useState('');
  const [formChannel, setFormChannel] = useState<NonNullable<Pilgrimage['defaultChannel']>>('direto');
  // Estado para múltiplas occurrences (datas adicionais, além da primeira)
  const [formOccurrences, setFormOccurrences] = useState<OccurrenceFormEntry[]>([]);
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
  };

  const resetForm = () => {
    setForm({ name: '', arrivalDate: '', departureDate: '', numberOfPeople: 0, busGroup: '', contactPhone: '' });
    setFormOrigin('');
    setFormNumberOfBuses(0);
    setFormNotes('');
    setFormChannel('direto');
    setFormOccurrences([]);
    setShowMultipleDates(false);
  };

  const addOccurrence = () => {
    setFormOccurrences(prev => [
      ...prev,
      {
        arrivalDate: '',
        departureDate: '',
        numberOfPeople: 0,
        status: 'scheduled',
        notes: ''
      }
    ]);
  };

  const removeOccurrence = (index: number) => {
    setFormOccurrences(prev => prev.filter((_, i) => i !== index));
  };

  const updateOccurrence = (index: number, field: keyof OccurrenceFormEntry, value: any) => {
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
    const sortedOccurrences = [...(pilgrimage.occurrences || [])].sort((a, b) => a.arrivalDate.localeCompare(b.arrivalDate));
    const first = sortedOccurrences[0];
    setForm({
      name: pilgrimage.name,
      arrivalDate: first?.arrivalDate || '',
      departureDate: first?.departureDate || '',
      numberOfPeople: first?.numberOfPeople || 0,
      busGroup: pilgrimage.busGroup,
      contactPhone: pilgrimage.contactPhone || '',
    });
    setFormOrigin(pilgrimage.origin || '');
    setFormNumberOfBuses(first?.numberOfBuses || 0);
    setFormNotes((pilgrimage as any).notes || '');
    setFormChannel(pilgrimage.defaultChannel || 'direto');

    // Carregar occurrences existentes (excluindo a primeira que já está no form)
    if (sortedOccurrences.length > 1) {
      setFormOccurrences(sortedOccurrences.slice(1).map(occ => ({
        arrivalDate: occ.arrivalDate,
        departureDate: occ.departureDate,
        numberOfPeople: occ.numberOfPeople,
        numberOfBuses: occ.numberOfBuses,
        status: occ.status,
        notes: occ.notes
      })));
      setShowMultipleDates(true);
    } else {
      setFormOccurrences([]);
      setShowMultipleDates(false);
    }

    setShowEditDialog(true);
  };

  const handleOpenDetailsDialog = (pilgrimage: Pilgrimage) => {
    setSelectedPilgrimage(pilgrimage);
    setShowDetailsDialog(true);
  };

  const validateOccurrences = () => {
    if (!showMultipleDates) return true;
    for (let i = 0; i < formOccurrences.length; i++) {
      const occ = formOccurrences[i];
      if (!occ.arrivalDate || !occ.departureDate) {
        toast.error(`Preencha as datas da ocorrência ${i + 2}`);
        return false;
      }
      if (new Date(occ.arrivalDate) >= new Date(occ.departureDate)) {
        toast.error(`Data de partida deve ser posterior à chegada (ocorrência ${i + 2})`);
        return false;
      }
    }
    return true;
  };

  const buildAllOccurrences = (): OccurrenceFormEntry[] => [
    {
      arrivalDate: form.arrivalDate,
      departureDate: form.departureDate,
      numberOfPeople: form.numberOfPeople,
      numberOfBuses: formNumberOfBuses || undefined,
      status: 'scheduled',
      notes: formNotes
    },
    ...formOccurrences
  ];

  const handleAddPilgrimage = async () => {
    if (!form.name || !form.arrivalDate || !form.departureDate || !form.numberOfPeople || !form.busGroup) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    if (!validateOccurrences()) return;

    await createPilgrimage({
      ...form,
      origin: formOrigin || undefined,
      notes: formNotes,
      defaultChannel: formChannel,
      occurrences: buildAllOccurrences() as any // IDs serão gerados pelo backend
    });
    setShowAddDialog(false);
    resetForm();
  };

  const handleEditPilgrimage = async () => {
    if (!selectedPilgrimage || !form.name || !form.arrivalDate || !form.departureDate || !form.numberOfPeople || !form.busGroup) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    if (!validateOccurrences()) return;

    await updatePilgrimage(selectedPilgrimage.id, {
      ...form,
      origin: formOrigin || undefined,
      notes: formNotes,
      // Canal de aquisição não é editável aqui de propósito — é fixado na primeira vinda
      // (ver seção 3.3 da especificação) e não deve mudar por causa de uma edição posterior.
      occurrences: buildAllOccurrences() as any // IDs serão gerados pelo backend
    });
    setShowEditDialog(false);
    resetForm();
  };

  const handleDeletePilgrimage = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta romaria?')) {
      await deletePilgrimage(id);
    }
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
  const occurrenceStatusLabels: Record<string, string> = {
    scheduled: 'Agendada',
    active: 'Em andamento',
    completed: 'Concluída',
    cancelled: 'Cancelada',
  };
  const occurrenceStatusColors: Record<string, string> = {
    scheduled: 'bg-amber-100 text-amber-700 border-amber-300',
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
            <p className="text-slate-600">Cadastro e histórico dos grupos de romaria</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
                  className="min-w-[110px] justify-center"
                >
                  Todas
                </Button>
                <Button
                  variant={filterStatus === 'active' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('active')}
                  className={`min-w-[110px] justify-center ${filterStatus === 'active' ? '' : 'border-green-300 text-green-700 hover:bg-green-50'}`}
                >
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-2" /> Ativas
                </Button>
                <Button
                  variant={filterStatus === 'completed' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('completed')}
                  className={`min-w-[110px] justify-center ${filterStatus === 'completed' ? '' : 'border-blue-300 text-blue-700 hover:bg-blue-50'}`}
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500 mr-2" /> Concluídas
                </Button>
                <Button
                  variant={filterStatus === 'cancelled' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('cancelled')}
                  className={`min-w-[110px] justify-center ${filterStatus === 'cancelled' ? '' : 'border-red-300 text-red-700 hover:bg-red-50'}`}
                >
                  <span className="w-2 h-2 rounded-full bg-red-500 mr-2" /> Canceladas
                </Button>
              </div>
            </div>
          </div>
        </Card>
        {/* Pilgrimages List */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPilgrimages.map((pilgrimage) => {
            const visitCount = pilgrimage.occurrences?.length || 0;
            const lastVisit = getLastVisit(pilgrimage);
            const nextVisit = getNextVisit(pilgrimage);
            return (
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
                      {pilgrimage.origin && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                          <MapPin className="w-4 h-4" /> {pilgrimage.origin}
                        </div>
                      )}
                    </div>
                    <Badge className={`${statusColors[pilgrimage.status ?? 'active']} border`}>
                      {statusLabels[pilgrimage.status ?? 'active']}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs font-normal">
                        {CHANNEL_LABELS[pilgrimage.defaultChannel || 'direto']}
                      </Badge>
                      <Badge variant="outline" className="text-xs font-normal bg-purple-50 text-purple-700 border-purple-200">
                        <History className="w-3 h-3 mr-1" /> Veio {visitCount}x
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Última vez: {lastVisit ? formatDate(lastVisit.arrivalDate) : '—'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <CalendarClock className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Próxima vez: {nextVisit ? formatDate(nextVisit.arrivalDate) : 'Nenhuma agendada'}</span>
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
            );
          })}
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
              <Input id="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Romaria Aparecida" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="busGroup">Grupo/Ônibus *</Label>
              <Input id="busGroup" value={form.busGroup} onChange={e => setForm(f => ({ ...f, busGroup: e.target.value }))} placeholder="Ex: Ônibus 1 - Aparecida" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="contactPhone">Telefone de Contato *</Label>
              <Input id="contactPhone" value={form.contactPhone} onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))} placeholder="Ex: (99) 99999-9999" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="origin">Local/Origem</Label>
              <Input id="origin" value={formOrigin} onChange={e => setFormOrigin(e.target.value)} placeholder="Ex: Ribeirão Preto - SP" className="mt-1" />
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label htmlFor="arrivalDate">Data de Chegada *</Label>
                <Input id="arrivalDate" type="date" value={form.arrivalDate} onChange={e => setForm(f => ({ ...f, arrivalDate: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="departureDate">Data de Partida *</Label>
                <Input id="departureDate" type="date" value={form.departureDate} onChange={e => setForm(f => ({ ...f, departureDate: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="numberOfPeople">Nº de Pessoas *</Label>
                <Input id="numberOfPeople" type="number" value={form.numberOfPeople} onChange={e => setForm(f => ({ ...f, numberOfPeople: Number(e.target.value) }))} placeholder="Ex: 45" className="mt-1" min="1" />
              </div>
              <div>
                <Label htmlFor="numberOfBuses">Nº de Ônibus</Label>
                <Input id="numberOfBuses" type="number" value={formNumberOfBuses || ''} onChange={e => setFormNumberOfBuses(Number(e.target.value))} placeholder="Ex: 1" className="mt-1" min="0" />
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
                    Adicione outras vindas já agendadas para este grupo. O número de pessoas pode ser diferente em cada data.
                  </p>

                  {formOccurrences.map((occ, index) => (
                    <div key={index} className="flex gap-2 items-start p-3 bg-white rounded border">
                      <div className="flex-1 grid grid-cols-4 gap-2">
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
                        <div>
                          <Label className="text-xs">Pessoas</Label>
                          <Input
                            type="number"
                            min="1"
                            value={occ.numberOfPeople || ''}
                            onChange={e => updateOccurrence(index, 'numberOfPeople', Number(e.target.value))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Ônibus</Label>
                          <Input
                            type="number"
                            min="0"
                            value={occ.numberOfBuses || ''}
                            onChange={e => updateOccurrence(index, 'numberOfBuses', Number(e.target.value))}
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
              <Label htmlFor="channel">Canal de Aquisição</Label>
              <Select value={formChannel} onValueChange={value => setFormChannel(value as any)}>
                <SelectTrigger id="channel" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(CHANNEL_LABELS) as (keyof typeof CHANNEL_LABELS)[]).map(ch => (
                    <SelectItem key={ch} value={ch}>{CHANNEL_LABELS[ch]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 mt-1">Este é o canal que fica registrado como origem da romaria — não muda mais depois (vindas futuras podem usar outro canal na reserva, sem afetar este registro).</p>
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
              <Input id="edit-name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Romaria Aparecida" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="edit-busGroup">Grupo/Ônibus *</Label>
              <Input id="edit-busGroup" value={form.busGroup} onChange={e => setForm(f => ({ ...f, busGroup: e.target.value }))} placeholder="Ex: Ônibus 1 - Aparecida" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="edit-contactPhone">Telefone de Contato *</Label>
              <Input id="edit-contactPhone" value={form.contactPhone} onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))} placeholder="Ex: (99) 99999-9999" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="edit-origin">Local/Origem</Label>
              <Input id="edit-origin" value={formOrigin} onChange={e => setFormOrigin(e.target.value)} placeholder="Ex: Ribeirão Preto - SP" className="mt-1" />
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label htmlFor="edit-arrivalDate">Data de Chegada *</Label>
                <Input id="edit-arrivalDate" type="date" value={form.arrivalDate} onChange={e => setForm(f => ({ ...f, arrivalDate: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="edit-departureDate">Data de Partida *</Label>
                <Input id="edit-departureDate" type="date" value={form.departureDate} onChange={e => setForm(f => ({ ...f, departureDate: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="edit-numberOfPeople">Nº de Pessoas *</Label>
                <Input id="edit-numberOfPeople" type="number" value={form.numberOfPeople} onChange={e => setForm(f => ({ ...f, numberOfPeople: Number(e.target.value) }))} placeholder="Ex: 45" className="mt-1" min="1" />
              </div>
              <div>
                <Label htmlFor="edit-numberOfBuses">Nº de Ônibus</Label>
                <Input id="edit-numberOfBuses" type="number" value={formNumberOfBuses || ''} onChange={e => setFormNumberOfBuses(Number(e.target.value))} placeholder="Ex: 1" className="mt-1" min="0" />
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
                    Gerencie as outras vindas deste grupo. O número de pessoas pode ser diferente em cada data.
                  </p>

                  {formOccurrences.map((occ, index) => (
                    <div key={index} className="flex gap-2 items-start p-3 bg-white rounded border">
                      <div className="flex-1 grid grid-cols-4 gap-2">
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
                        <div>
                          <Label className="text-xs">Pessoas</Label>
                          <Input
                            type="number"
                            min="1"
                            value={occ.numberOfPeople || ''}
                            onChange={e => updateOccurrence(index, 'numberOfPeople', Number(e.target.value))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Ônibus</Label>
                          <Input
                            type="number"
                            min="0"
                            value={occ.numberOfBuses || ''}
                            onChange={e => updateOccurrence(index, 'numberOfBuses', Number(e.target.value))}
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
              <Label>Canal de Aquisição</Label>
              <div className="mt-1 h-9 px-3 flex items-center rounded-md border bg-slate-50 text-sm text-slate-600">
                {CHANNEL_LABELS[formChannel]}
              </div>
              <p className="text-xs text-slate-500 mt-1">Fixo desde a primeira vinda — não é possível alterar por aqui, para manter o histórico de origem correto.</p>
            </div>
            <div>
              <Label>Status</Label>
              <div className="mt-1 h-9 px-3 flex items-center rounded-md border bg-slate-50 text-sm text-slate-600 capitalize">
                {statusLabels[selectedPilgrimage?.status ?? 'active']}
              </div>
              <p className="text-xs text-slate-500 mt-1">Calculado automaticamente a partir das ocorrências (próxima vinda agendada, já concluída ou cancelada).</p>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPilgrimage?.name}</DialogTitle>
            <DialogDescription>Detalhes e histórico completo de vindas da romaria</DialogDescription>
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
                  <Badge className={`${statusColors[selectedPilgrimage.status ?? 'active']} border`}>
                    {statusLabels[selectedPilgrimage.status ?? 'active']}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Telefone de Contato</p>
                  <p className="text-slate-900 flex items-center gap-2"><Phone className="w-4 h-4" />{selectedPilgrimage.contactPhone || '-'}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Local/Origem</p>
                  <p className="text-slate-900 flex items-center gap-2"><MapPin className="w-4 h-4" />{selectedPilgrimage.origin || '-'}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Canal de Aquisição</p>
                  <p className="text-slate-900">{CHANNEL_LABELS[selectedPilgrimage.defaultChannel || 'direto']}</p>
                  <p className="text-xs text-slate-400 mt-1">Fixo desde a 1ª vinda</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-900 mb-1">Vezes que esteve conosco</p>
                  <p className="text-2xl text-purple-900">{selectedPilgrimage.occurrences?.length || 0}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-900 mb-1">Total de ônibus trazidos</p>
                  <p className="text-2xl text-purple-900">
                    {(selectedPilgrimage.occurrences || []).reduce((sum, o) => sum + (o.numberOfBuses || 0), 0)}
                  </p>
                </div>
              </div>
              {selectedPilgrimage.notes && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900 mb-1">Observações</p>
                  <p className="text-blue-700">{selectedPilgrimage.notes}</p>
                </div>
              )}

              {/* Histórico completo de vindas */}
              <div>
                <p className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <History className="w-4 h-4 text-purple-600" />
                  Histórico de vindas
                </p>
                {(selectedPilgrimage.occurrences || []).length === 0 ? (
                  <p className="text-sm text-slate-400">Nenhuma data registrada ainda.</p>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr className="text-left text-xs text-slate-500 uppercase tracking-wide">
                          <th className="px-3 py-2">Chegada</th>
                          <th className="px-3 py-2">Partida</th>
                          <th className="px-3 py-2">Pessoas</th>
                          <th className="px-3 py-2">Ônibus</th>
                          <th className="px-3 py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {[...(selectedPilgrimage.occurrences || [])]
                          .sort((a, b) => b.arrivalDate.localeCompare(a.arrivalDate))
                          .map(occ => (
                            <tr key={occ.id}>
                              <td className="px-3 py-2 text-slate-900">{formatDate(occ.arrivalDate)}</td>
                              <td className="px-3 py-2 text-slate-900">{formatDate(occ.departureDate)}</td>
                              <td className="px-3 py-2 text-slate-600"><span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{occ.numberOfPeople}</span></td>
                              <td className="px-3 py-2 text-slate-600">{occ.numberOfBuses ?? '—'}</td>
                              <td className="px-3 py-2">
                                <Badge className={`${occurrenceStatusColors[occ.status] || 'bg-slate-100 text-slate-600 border-slate-300'} border text-xs`}>
                                  {occurrenceStatusLabels[occ.status] || occ.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
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
          )}
          <DialogFooter>
            <Button onClick={() => setShowDetailsDialog(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
