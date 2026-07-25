'use client'

import { useMemo, useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { useSOPs, SOP } from '@/hooks/useSOPs';
import { Plus, Pencil, Trash2, ClipboardList, Search } from 'lucide-react';

const emptyForm = { title: '', category: 'Geral', content: '' };

export function Processes() {
  const { sops, loading, addSOP, updateSOP, deleteSOP } = useSOPs();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const categories = useMemo(() => {
    const set = new Set(sops.map(s => s.category));
    return Array.from(set).sort();
  }, [sops]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sops;
    return sops.filter(s => s.title.toLowerCase().includes(q) || s.category.toLowerCase().includes(q));
  }, [sops, search]);

  const grouped = useMemo(() => {
    const map: Record<string, SOP[]> = {};
    filtered.forEach(s => {
      if (!map[s.category]) map[s.category] = [];
      map[s.category].push(s);
    });
    return map;
  }, [filtered]);

  const selected = sops.find(s => s.id === selectedId) || null;

  const openNewForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (sop: SOP) => {
    setEditingId(sop.id);
    setForm({ title: sop.title, category: sop.category, content: sop.content });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (editingId) {
      await updateSOP(editingId, form);
    } else {
      await addSOP(form);
    }
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    await deleteSOP(id);
    if (selectedId === id) setSelectedId(null);
  };

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50">
      <div className="p-8 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Processos (SOPs)</h1>
            <p className="text-slate-600 text-sm">Procedimentos operacionais padrão da equipe.</p>
          </div>
          <Button onClick={openNewForm} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Processo
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-4 lg:col-span-1">
            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar processo..."
                className="pl-8"
              />
            </div>
            {loading ? (
              <p className="text-sm text-slate-400 text-center py-8">Carregando...</p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Nenhum processo cadastrado.</p>
            ) : (
              <div className="space-y-4 max-h-[65vh] overflow-y-auto">
                {categories.filter(c => grouped[c]?.length).map(cat => (
                  <div key={cat}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">{cat}</p>
                    <div className="space-y-1">
                      {grouped[cat].map(sop => (
                        <button
                          key={sop.id}
                          onClick={() => setSelectedId(sop.id)}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                            selectedId === sop.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {sop.title}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6 lg:col-span-2">
            {selected ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">{selected.category}</p>
                    <h2 className="text-xl font-semibold text-slate-900">{selected.title}</h2>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEditForm(selected)}
                      className="p-2 text-slate-500 hover:bg-slate-100 rounded-md"
                      aria-label="Editar processo"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(selected.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-md"
                      aria-label="Remover processo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="prose prose-sm max-w-none whitespace-pre-wrap text-slate-700">
                  {selected.content || <span className="text-slate-400 italic">Sem conteúdo.</span>}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-16 text-slate-400">
                <ClipboardList className="w-10 h-10 mb-3" />
                <p className="text-sm">Selecione um processo à esquerda para visualizar.</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Processo' : 'Novo Processo'}</DialogTitle>
            <DialogDescription>Documente um procedimento operacional padrão.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Input
                list="sop-category-suggestions"
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                placeholder="Ex: Recepção, Cozinha, Governança"
              />
              <datalist id="sop-category-suggestions">
                {categories.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>
            <div className="space-y-2">
              <Label>Conteúdo</Label>
              <Textarea
                rows={10}
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder="Descreva o passo a passo do processo..."
              />
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
