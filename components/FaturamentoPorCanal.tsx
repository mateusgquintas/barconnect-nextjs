'use client'

import { useMemo, useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import {
  useFinanceControladoria,
  CHANNEL_LABELS,
  AcquisitionChannel,
} from '@/hooks/useFinanceControladoria';
import { usePilgrimagesDB } from '@/hooks/usePilgrimagesDB';
import { PilgrimageCombobox } from './agenda/PilgrimageCombobox';
import { formatCurrency } from '@/utils/format';
import { Plus, Trash2, Pencil, Link2, ChevronLeft, ChevronRight } from 'lucide-react';

const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function currentMonthYear() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function shiftMonthYear(my: string, delta: number): string {
  const year = parseInt(my.slice(0, 4));
  const month = parseInt(my.slice(4, 6)) - 1;
  const d = new Date(year, month + delta, 1);
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonthYearLabel(my: string): string {
  const month = parseInt(my.slice(4, 6)) - 1;
  const year = my.slice(0, 4);
  return `${MONTH_LABELS[month]} de ${year}`;
}

function monthYearOf(dateStr: string): string {
  return dateStr.slice(0, 7).replace('-', '');
}

const emptyForm = {
  event_date: new Date().toISOString().split('T')[0],
  description: '',
  channel: 'direto' as AcquisitionChannel,
  total_value: '',
  number_of_people: '',
  number_of_buses: '',
};

export function FaturamentoPorCanal() {
  const [monthYear, setMonthYear] = useState(currentMonthYear());
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [selectedPilgrimageId, setSelectedPilgrimageId] = useState('');

  const {
    loading,
    revenueEntries,
    addRevenueEntry,
    updateRevenueEntry,
    deleteRevenueEntry,
  } = useFinanceControladoria(monthYear);
  const { pilgrimages } = usePilgrimagesDB();

  const monthEntries = useMemo(
    () => revenueEntries
      .filter(r => monthYearOf(r.event_date) === monthYear)
      .sort((a, b) => b.event_date.localeCompare(a.event_date)),
    [revenueEntries, monthYear]
  );

  const monthTotal = useMemo(() => monthEntries.reduce((s, r) => s + (r.total_value || 0), 0), [monthEntries]);

  const openNewForm = () => {
    setEditingId(null);
    setSelectedPilgrimageId('');
    setForm({ ...emptyForm, event_date: new Date().toISOString().split('T')[0] });
    setShowForm(true);
  };

  const openEditForm = (id: string) => {
    const entry = monthEntries.find(r => r.id === id);
    if (!entry) return;
    setEditingId(id);
    setForm({
      event_date: entry.event_date.slice(0, 10),
      description: entry.description,
      channel: entry.channel,
      total_value: String(entry.total_value ?? ''),
      number_of_people: entry.number_of_people != null ? String(entry.number_of_people) : '',
      number_of_buses: entry.number_of_buses != null ? String(entry.number_of_buses) : '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(form.total_value);
    if (!form.description || isNaN(value) || value <= 0) return;
    const payload = {
      event_date: form.event_date,
      description: form.description,
      channel: form.channel,
      total_value: value,
      number_of_people: form.number_of_people ? parseInt(form.number_of_people) : null,
      number_of_buses: form.number_of_buses ? parseInt(form.number_of_buses) : null,
    };
    if (editingId) {
      await updateRevenueEntry(editingId, payload);
    } else {
      await addRevenueEntry(payload);
    }
    setShowForm(false);
  };

  const channels: AcquisitionChannel[] = ['agenciador', 'booking', 'motorista', 'chefe_romaria', 'direto'];

  if (loading && revenueEntries.length === 0) {
    return (
      <main className="flex-1 overflow-y-auto bg-slate-50 p-8">
        <p className="text-slate-500">Carregando faturamento por canal...</p>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50">
      <div className="p-8 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Faturamento por Canal</h1>
            <p className="text-slate-600 text-sm">
              Lance manualmente o faturamento de romarias/reservas. Os valores aparecem automaticamente na Controladoria Financeira.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
              <button
                onClick={() => setMonthYear(m => shiftMonthYear(m, -1))}
                className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-600"
                aria-label="Mês anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 text-sm font-medium text-slate-900 min-w-[130px] text-center capitalize">
                {formatMonthYearLabel(monthYear)}
              </span>
              <button
                onClick={() => setMonthYear(m => shiftMonthYear(m, 1))}
                className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-600"
                aria-label="Próximo mês"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <Button onClick={openNewForm} className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Lançamento
            </Button>
          </div>
        </div>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">Total faturado em {formatMonthYearLabel(monthYear)}</p>
            <p className="text-xl font-bold text-slate-900">{formatCurrency(monthTotal)}</p>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Lançamentos do Mês</h2>
          {monthEntries.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-10">Nenhum lançamento neste mês.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs text-slate-500 uppercase tracking-wide">
                    <th className="py-2 pr-3 w-full">Descrição</th>
                    <th className="py-2 px-3 whitespace-nowrap">Data</th>
                    <th className="py-2 px-3 whitespace-nowrap">Canal</th>
                    <th className="py-2 px-3 whitespace-nowrap">Pessoas</th>
                    <th className="py-2 px-3 whitespace-nowrap">Ônibus</th>
                    <th className="py-2 px-3 whitespace-nowrap">Valor</th>
                    <th className="py-2 pl-3 whitespace-nowrap">Origem</th>
                    <th className="py-2 pl-3 whitespace-nowrap">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {monthEntries.map(entry => (
                    <tr key={entry.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-2 pr-3 font-medium text-slate-900">{entry.description}</td>
                      <td className="py-2 px-3 whitespace-nowrap text-slate-600">
                        {new Date(entry.event_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap text-slate-600">{CHANNEL_LABELS[entry.channel]}</td>
                      <td className="py-2 px-3 whitespace-nowrap text-slate-600">{entry.number_of_people ?? '—'}</td>
                      <td className="py-2 px-3 whitespace-nowrap text-slate-600">{entry.number_of_buses ?? '—'}</td>
                      <td className="py-2 px-3 whitespace-nowrap font-semibold text-slate-900">{formatCurrency(entry.total_value)}</td>
                      <td className="py-2 pl-3 whitespace-nowrap">
                        {entry.source === 'reservation' ? (
                          <span className="inline-flex items-center gap-1 text-xs text-blue-600" title="Criado automaticamente por uma reserva na Agenda">
                            <Link2 className="w-3 h-3" />
                            Agenda
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">Manual</span>
                        )}
                      </td>
                      <td className="py-2 pl-3 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditForm(entry.id)}
                            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded"
                            aria-label={`Editar ${entry.description}`}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteRevenueEntry(entry.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                            aria-label={`Remover ${entry.description}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Lançamento' : 'Novo Lançamento'}</DialogTitle>
            <DialogDescription>
              Registre o faturamento de uma romaria ou reserva por canal de aquisição.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!editingId && (
              <div className="space-y-2">
                <Label>Romaria cadastrada (opcional)</Label>
                <PilgrimageCombobox
                  pilgrimages={pilgrimages}
                  value={selectedPilgrimageId}
                  onValueChange={(id) => {
                    setSelectedPilgrimageId(id);
                    const pilgrimage = pilgrimages.find(p => p.id === id);
                    if (pilgrimage) {
                      setForm(f => ({
                        ...f,
                        description: pilgrimage.name,
                        channel: pilgrimage.defaultChannel || f.channel,
                        number_of_people: pilgrimage.numberOfPeople ? String(pilgrimage.numberOfPeople) : f.number_of_people,
                      }));
                    }
                  }}
                  placeholder="Selecione para preencher descrição e canal automaticamente..."
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Descrição *</Label>
              <Input
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Ex: Romaria Nossa Senhora Aparecida"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Data *</Label>
                <Input
                  type="date"
                  value={form.event_date}
                  onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Canal *</Label>
                <Select value={form.channel} onValueChange={(v: AcquisitionChannel) => setForm(f => ({ ...f, channel: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {channels.map(ch => (
                      <SelectItem key={ch} value={ch}>{CHANNEL_LABELS[ch]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Valor Total (R$) *</Label>
                <Input
                  type="number" min="0" step="0.01"
                  value={form.total_value}
                  onChange={e => setForm(f => ({ ...f, total_value: e.target.value }))}
                  placeholder="0,00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Nº Pessoas</Label>
                <Input
                  type="number" min="0"
                  value={form.number_of_people}
                  onChange={e => setForm(f => ({ ...f, number_of_people: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Nº Ônibus</Label>
                <Input
                  type="number" min="0"
                  value={form.number_of_buses}
                  onChange={e => setForm(f => ({ ...f, number_of_buses: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button type="submit">{editingId ? 'Salvar' : 'Adicionar'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
