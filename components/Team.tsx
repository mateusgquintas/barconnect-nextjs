'use client'

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { useTeamMembers, TeamMember } from '@/hooks/useTeamMembers';
import { Plus, Pencil, Trash2, Users, Mail, Phone } from 'lucide-react';

const emptyForm = {
  name: '', position: '', phone: '', email: '', admission_date: '', status: 'ativo' as 'ativo' | 'inativo', notes: '',
};

export function Team() {
  const { members, loading, addMember, updateMember, deleteMember } = useTeamMembers();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openNewForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (m: TeamMember) => {
    setEditingId(m.id);
    setForm({
      name: m.name,
      position: m.position,
      phone: m.phone || '',
      email: m.email || '',
      admission_date: m.admission_date || '',
      status: m.status,
      notes: m.notes || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const payload = {
      name: form.name,
      position: form.position,
      phone: form.phone || null,
      email: form.email || null,
      admission_date: form.admission_date || null,
      status: form.status,
      notes: form.notes || null,
    };
    if (editingId) {
      await updateMember(editingId, payload);
    } else {
      await addMember(payload);
    }
    setShowForm(false);
  };

  const activeCount = members.filter(m => m.status === 'ativo').length;

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50">
      <div className="p-8 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Equipe</h1>
            <p className="text-slate-600 text-sm">{activeCount} colaborador(es) ativo(s) de {members.length} cadastrado(s).</p>
          </div>
          <Button onClick={openNewForm} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Colaborador
          </Button>
        </div>

        <Card className="p-5">
          {loading ? (
            <p className="text-sm text-slate-400 text-center py-10">Carregando equipe...</p>
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Users className="w-10 h-10 mb-3" />
              <p className="text-sm">Nenhum colaborador cadastrado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map(m => (
                <div key={m.id} className="border border-slate-200 rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{m.name}</p>
                      <p className="text-sm text-slate-600 truncate">{m.position || '—'}</p>
                    </div>
                    <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
                      m.status === 'ativo' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {m.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  {(m.phone || m.email) && (
                    <div className="space-y-1 text-xs text-slate-500">
                      {m.phone && (
                        <p className="flex items-center gap-1.5"><Phone className="w-3 h-3" />{m.phone}</p>
                      )}
                      {m.email && (
                        <p className="flex items-center gap-1.5 truncate"><Mail className="w-3 h-3" />{m.email}</p>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-1 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => openEditForm(m)}
                      className="p-1.5 text-slate-500 hover:bg-slate-100 rounded"
                      aria-label={`Editar ${m.name}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteMember(m.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                      aria-label={`Remover ${m.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Colaborador' : 'Novo Colaborador'}</DialogTitle>
            <DialogDescription>Cadastre os dados do membro da equipe.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Cargo</Label>
                <Input value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v: 'ativo' | 'inativo') => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(00) 00000-0000" />
              </div>
              <div className="space-y-2">
                <Label>Data de Admissão</Label>
                <Input type="date" value={form.admission_date} onChange={e => setForm(f => ({ ...f, admission_date: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
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
