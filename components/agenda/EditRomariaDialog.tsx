'use client'
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Bus, Users, Calendar, CheckCircle2, X } from 'lucide-react';
import { notifyError, notifySuccess } from '@/utils/notify';
import { updateRoomReservation, cancelRoomReservation, createRoomReservation } from '@/lib/agendaService';
import { Pilgrimage as PilgrimageType } from '@/types';

interface Room {
  id: string;
  number: string;
  floor?: number;
  capacity?: number;
  type?: string;
}

interface RoomReservation {
  id: string;
  room_id: string;
  status: string;
  check_in_date: string;
  check_out_date: string;
  customer_name?: string;
  pilgrimage_id?: string;
  notes?: string | null;
}

interface EditRomariaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pilgrimage: PilgrimageType;
  reservations: RoomReservation[];
  allRooms: Room[];
  onSuccess?: () => void;
}

export function EditRomariaDialog({ 
  open, 
  onOpenChange, 
  pilgrimage, 
  reservations,
  allRooms,
  onSuccess 
}: EditRomariaDialogProps) {
  const [numberOfPeople, setNumberOfPeople] = React.useState('');
  const [checkInDate, setCheckInDate] = React.useState('');
  const [checkOutDate, setCheckOutDate] = React.useState('');
  const [selectedRoomIds, setSelectedRoomIds] = React.useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = React.useState(false);

  // Helper para extrair número de pessoas das notas
  const extractPeopleCount = (notes: string | null | undefined): number | null => {
    if (!notes) return null;
    const match = notes.match(/(\d+)\s+pessoas/i);
    return match ? parseInt(match[1]) : null;
  };

  // Inicializar dados quando o dialog abre
  React.useEffect(() => {
    if (open && reservations.length > 0) {
      const firstReservation = reservations[0];
      
      // Extrair número de pessoas
      const peopleCount = extractPeopleCount(firstReservation.notes);
      setNumberOfPeople(peopleCount ? peopleCount.toString() : '');
      
      // Datas
      setCheckInDate(firstReservation.check_in_date.split('T')[0]);
      setCheckOutDate(firstReservation.check_out_date.split('T')[0]);
      
      // Quartos selecionados
      const roomIds = new Set(reservations.map(r => r.room_id));
      setSelectedRoomIds(roomIds);
    }
  }, [open, reservations]);

  const toggleRoom = (roomId: string) => {
    const newSet = new Set(selectedRoomIds);
    if (newSet.has(roomId)) {
      newSet.delete(roomId);
    } else {
      newSet.add(roomId);
    }
    setSelectedRoomIds(newSet);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedRoomIds.size === 0) {
      notifyError('Selecione pelo menos um quarto');
      return;
    }

    try {
      setSubmitting(true);

      // Montar notas com número de pessoas
      const peopleNote = numberOfPeople && numberOfPeople !== '1' ? `${numberOfPeople} pessoas` : '';
      const finalNotes = peopleNote || undefined;

      // Datas com horário padrão 12:00
      const start = `${checkInDate}T12:00:00`;
      const end = `${checkOutDate}T12:00:00`;

      // Identificar quartos adicionados, removidos e mantidos
      const currentRoomIds = new Set(reservations.map(r => r.room_id));
      const roomsToAdd = Array.from(selectedRoomIds).filter(id => !currentRoomIds.has(id));
      const roomsToRemove = reservations.filter(r => !selectedRoomIds.has(r.room_id));
      const roomsToUpdate = reservations.filter(r => selectedRoomIds.has(r.room_id));

      const promises: Promise<any>[] = [];

      // Atualizar reservas existentes
      roomsToUpdate.forEach(reservation => {
        promises.push(
          updateRoomReservation(reservation.id, {
            check_in_date: start,
            check_out_date: end,
            notes: finalNotes,
          })
        );
      });

      // Remover quartos desmarcados
      roomsToRemove.forEach(reservation => {
        promises.push(cancelRoomReservation(reservation.id));
      });

      // Adicionar novos quartos
      roomsToAdd.forEach(roomId => {
        promises.push(
          createRoomReservation({
            room_id: roomId,
            start,
            end,
            pilgrimage_id: pilgrimage.id,
            status: 'confirmed',
            notes: finalNotes,
          } as any)
        );
      });

      await Promise.all(promises);
      
      notifySuccess('Romaria atualizada com sucesso');
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erro ao atualizar romaria:', error);
      notifyError('Erro ao atualizar romaria', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Filtrar quartos disponíveis (não reservados por outras romarias nas mesmas datas)
  const availableRooms = React.useMemo(() => {
    // Para simplificar, mostrar todos os quartos
    // TODO: filtrar quartos já reservados no período
    return allRooms;
  }, [allRooms]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Bus className="w-6 h-6 text-purple-600" />
            Editar Romaria: {pilgrimage.name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações da Romaria */}
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h3 className="font-semibold text-purple-900 mb-2">Informações da Romaria</h3>
            <div className="text-sm text-purple-700 space-y-1">
              <p><strong>Nome:</strong> {pilgrimage.name}</p>
              {(pilgrimage as any).busGroup && (
                <p><strong>Ônibus:</strong> {(pilgrimage as any).busGroup}</p>
              )}
            </div>
          </div>

          {/* Número de Pessoas */}
          <div className="space-y-2">
            <Label htmlFor="numberOfPeople">
              <Users className="w-4 h-4 inline mr-1" />
              Número de Pessoas *
            </Label>
            <Input
              id="numberOfPeople"
              type="number"
              min="1"
              value={numberOfPeople}
              onChange={(e) => setNumberOfPeople(e.target.value)}
              placeholder="Total de pessoas na romaria"
              required
            />
            <p className="text-xs text-slate-500">
              Informe quantas pessoas farão parte desta romaria
            </p>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkInDate">
                <Calendar className="w-4 h-4 inline mr-1" />
                Check-in *
              </Label>
              <Input
                id="checkInDate"
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkOutDate">
                <Calendar className="w-4 h-4 inline mr-1" />
                Check-out *
              </Label>
              <Input
                id="checkOutDate"
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                min={checkInDate}
                required
              />
            </div>
          </div>

          {/* Seleção de Quartos */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              Quartos da Romaria ({selectedRoomIds.size} selecionados)
            </Label>
            <div className="border rounded-lg p-4 max-h-64 overflow-y-auto bg-slate-50">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableRooms.map(room => (
                  <div
                    key={room.id}
                    className={`flex items-center space-x-2 p-2 rounded border cursor-pointer transition-colors ${
                      selectedRoomIds.has(room.id)
                        ? 'bg-purple-100 border-purple-400'
                        : 'bg-white border-slate-300 hover:border-purple-300'
                    }`}
                    onClick={() => toggleRoom(room.id)}
                  >
                    <Checkbox
                      id={`room-${room.id}`}
                      checked={selectedRoomIds.has(room.id)}
                      onCheckedChange={() => toggleRoom(room.id)}
                    />
                    <label
                      htmlFor={`room-${room.id}`}
                      className="text-sm font-medium cursor-pointer flex-1"
                    >
                      Quarto {room.number}
                      {room.capacity && (
                        <span className="text-xs text-slate-500 ml-1">
                          ({room.capacity}p)
                        </span>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Marque/desmarque os quartos que fazem parte desta romaria
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700"
              disabled={submitting || selectedRoomIds.size === 0}
            >
              {submitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Salvando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
