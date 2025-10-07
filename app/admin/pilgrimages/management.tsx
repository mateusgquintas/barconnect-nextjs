import { useState } from 'react';
import { usePilgrimagesDB } from '@/hooks/usePilgrimagesDB';
import { useRoomsDB } from '@/hooks/useRoomsDB';
import { toast } from 'sonner';
import { Pilgrimage } from '@/types';
import { Room } from '@/hooks/useRoomsDB';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bus, Users, Edit, Trash2 } from 'lucide-react';

export default function PilgrimagesManagement() {
  const { pilgrimages, loading, createPilgrimage, updatePilgrimage, deletePilgrimage } = usePilgrimagesDB();
  const { rooms, updateRoom } = useRoomsDB();
  const [form, setForm] = useState<Omit<Pilgrimage, 'id'>>({
    name: '',
    arrivalDate: '',
    departureDate: '',
    numberOfPeople: 0,
    busGroup: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updatePilgrimage(editingId, form);
        toast.success('Romaria atualizada com sucesso!');
        setEditingId(null);
      } else {
        await createPilgrimage(form);
        toast.success('Romaria cadastrada com sucesso!');
      }
      setForm({ name: '', arrivalDate: '', departureDate: '', numberOfPeople: 0, busGroup: '' });
    } catch (err) {
      toast.error('Erro ao salvar romaria.');
    }
  };

  const handleEdit = (pilgrimage: Pilgrimage) => {
    setForm({
      name: pilgrimage.name,
      arrivalDate: pilgrimage.arrivalDate,
      departureDate: pilgrimage.departureDate,
      numberOfPeople: pilgrimage.numberOfPeople,
      busGroup: pilgrimage.busGroup,
    });
    setEditingId(pilgrimage.id);
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePilgrimage(id);
      toast.success('Romaria excluída com sucesso!');
    } catch {
      toast.error('Erro ao excluir romaria.');
    }
  };

  // Quartos associados à romaria selecionada
  const associatedRooms = rooms.filter((room) => room.pilgrimage_id === selectedId);

  // Quartos disponíveis para associação
  const availableRooms = rooms.filter((room) => !room.pilgrimage_id);

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Lista de Romarias */}
      <div className="w-1/3 border-r bg-white p-6 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Romarias</h2>
        <ul className="space-y-2 mb-8">
          {loading ? <li>Carregando...</li> : (
            pilgrimages.map((p) => (
              <li key={p.id}>
                <Card className={`p-3 flex items-center justify-between cursor-pointer ${selectedId === p.id ? 'border-blue-500 border-2' : ''}`}
                  onClick={() => setSelectedId(p.id)}>
                  <div>
                    <div className="font-bold flex items-center gap-2"><Bus className="w-4 h-4 text-blue-500" />{p.name}</div>
                    <div className="text-xs text-slate-500">{p.arrivalDate} até {p.departureDate} | {p.numberOfPeople} pessoas | {p.busGroup}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="outline" aria-label="Editar romaria" tabIndex={0} onClick={e => { e.stopPropagation(); handleEdit(p); }} className="focus:ring-2 focus:ring-blue-500"><Edit className="w-4 h-4" /></Button>
                    <Button size="icon" variant="destructive" aria-label="Excluir romaria" tabIndex={0} onClick={e => { e.stopPropagation(); handleDelete(p.id); }} className="focus:ring-2 focus:ring-red-500"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </Card>
              </li>
            ))
          )}
        </ul>
        {/* Formulário de cadastro/edição */}
        <form onSubmit={handleSubmit} className="space-y-2">
          <Input name="name" placeholder="Nome da Romaria" value={form.name} onChange={handleChange} required />
          <Input name="arrivalDate" type="date" placeholder="Data de Chegada" value={form.arrivalDate} onChange={handleChange} required />
          <Input name="departureDate" type="date" placeholder="Data de Saída" value={form.departureDate} onChange={handleChange} required />
          <Input name="numberOfPeople" type="number" placeholder="Nº de Pessoas" value={form.numberOfPeople} onChange={handleChange} required />
          <Input name="busGroup" placeholder="Ônibus/Grupo" value={form.busGroup} onChange={handleChange} required />
          <Button type="submit" className="w-full focus:ring-2 focus:ring-blue-500" aria-label={editingId ? 'Salvar alterações da romaria' : 'Cadastrar nova romaria'}>{editingId ? 'Salvar Alterações' : 'Cadastrar Romaria'}</Button>
          {editingId && (
            <Button type="button" variant="outline" className="w-full focus:ring-2 focus:ring-slate-500" aria-label="Cancelar edição" onClick={() => { setEditingId(null); setForm({ name: '', arrivalDate: '', departureDate: '', numberOfPeople: 0, busGroup: '' }); }}>Cancelar</Button>
          )}
        </form>
      </div>

      {/* Detalhes da Romaria Selecionada */}
      <div className="flex-1 p-8 overflow-y-auto">
        {selectedId ? (
          <>
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Bus className="w-6 h-6 text-blue-500" />
              {pilgrimages.find(p => p.id === selectedId)?.name}
            </h2>
            <div className="mb-4 text-slate-600">
              <span className="mr-4">Data: {pilgrimages.find(p => p.id === selectedId)?.arrivalDate} até {pilgrimages.find(p => p.id === selectedId)?.departureDate}</span>
              <span className="mr-4">Pessoas: {pilgrimages.find(p => p.id === selectedId)?.numberOfPeople}</span>
              <span>Ônibus/Grupo: {pilgrimages.find(p => p.id === selectedId)?.busGroup}</span>
            </div>
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Quartos Associados</h3>
              <ul className="space-y-2">
                {associatedRooms.length === 0 && <li className="text-slate-400">Nenhum quarto associado.</li>}
                {associatedRooms.map(room => (
                  <li key={room.id} className="flex items-center gap-2">
                    <Card className="flex-1 p-2 flex items-center justify-between">
                      <span>Quarto {room.number} {room.guest_name && <span className="text-xs text-slate-500">({room.guest_name})</span>}</span>
                      <Button size="sm" variant="outline" aria-label="Desvincular quarto" className="focus:ring-2 focus:ring-slate-500" onClick={async () => {
                        await updateRoom(room.id, { pilgrimage_id: undefined });
                        toast.success('Quarto desvinculado da romaria!');
                      }}>Desvincular</Button>
                    </Card>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Associar Quarto</h3>
              <Select onValueChange={async (roomId) => {
                await updateRoom(roomId, { pilgrimage_id: selectedId! });
                toast.success('Quarto associado à romaria!');
              }}>
                <SelectTrigger className="w-80">
                  <SelectValue placeholder="Selecione um quarto disponível" />
                </SelectTrigger>
                <SelectContent>
                  {availableRooms.length === 0 ? (
                    <div className="px-3 py-2 text-slate-400 text-sm">Nenhum quarto disponível</div>
                  ) : (
                    availableRooms.map(room => (
                      <SelectItem key={room.id} value={room.id}>Quarto {room.number}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </>
        ) : (
          <div className="text-slate-400 text-lg flex items-center h-full justify-center">Selecione uma romaria para ver detalhes</div>
        )}
      </div>
    </div>
  );
}
