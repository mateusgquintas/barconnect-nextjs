'use client'

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tags, Pencil, Trash2, Check, X, Plus } from 'lucide-react';

interface CategoryManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: string[];
  onAddCategory: (name: string) => Promise<void> | void;
  onRenameCategory: (oldName: string, newName: string) => Promise<void> | void;
  onDeleteCategory: (name: string) => Promise<void> | void;
}

function EditableList({
  items,
  onRename,
  onDelete,
}: {
  items: string[];
  onRename: (oldName: string, newName: string) => Promise<void> | void;
  onDelete: (name: string) => Promise<void> | void;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  const startEdit = (item: string) => {
    setEditing(item);
    setDraft(item);
  };

  const commitEdit = async () => {
    if (editing && draft.trim() && draft.trim() !== editing) {
      await onRename(editing, draft.trim());
    }
    setEditing(null);
  };

  if (items.length === 0) {
    return <p className="text-sm text-slate-500">Nenhuma categoria cadastrada ainda.</p>;
  }

  return (
    <ul className="space-y-1.5">
      {items.map(item => (
        <li key={item} className="flex items-center gap-2 bg-slate-50 rounded-md px-3 py-2 border border-slate-200">
          {editing === item ? (
            <>
              <Input
                autoFocus
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') commitEdit();
                  if (e.key === 'Escape') setEditing(null);
                }}
                className="h-8 text-sm"
              />
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={commitEdit} aria-label="Confirmar renomeação">
                <Check className="w-4 h-4 text-green-600" />
              </Button>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setEditing(null)} aria-label="Cancelar">
                <X className="w-4 h-4 text-slate-500" />
              </Button>
            </>
          ) : confirmingDelete === item ? (
            <>
              <span className="flex-1 text-sm text-red-700">Remover "{item}" de todos os produtos?</span>
              <Button
                size="sm"
                variant="destructive"
                className="h-8"
                onClick={async () => { await onDelete(item); setConfirmingDelete(null); }}
              >
                Confirmar
              </Button>
              <Button size="sm" variant="ghost" className="h-8" onClick={() => setConfirmingDelete(null)}>
                Cancelar
              </Button>
            </>
          ) : (
            <>
              <span className="flex-1 text-sm font-medium text-slate-800">{item}</span>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => startEdit(item)} aria-label={`Editar ${item}`}>
                <Pencil className="w-3.5 h-3.5 text-slate-500" />
              </Button>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setConfirmingDelete(item)} aria-label={`Remover ${item}`}>
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
              </Button>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}

export function CategoryManagerDialog({
  open,
  onOpenChange,
  categories,
  onAddCategory,
  onRenameCategory,
  onDeleteCategory,
}: CategoryManagerDialogProps) {
  const [newCategory, setNewCategory] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    await onAddCategory(newCategory.trim());
    setNewCategory('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-md">
              <Tags className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle>Gerenciar Categorias</DialogTitle>
              <DialogDescription>Adicione, renomeie ou remova categorias usadas nos produtos.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <form onSubmit={handleAdd} className="flex items-center gap-2">
            <Input
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              placeholder="Nova categoria"
              className="h-9"
            />
            <Button type="submit" size="sm" className="h-9 gap-1.5 shrink-0">
              <Plus className="w-3.5 h-3.5" />
              Adicionar
            </Button>
          </form>

          <EditableList
            items={categories}
            onRename={onRenameCategory}
            onDelete={onDeleteCategory}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
