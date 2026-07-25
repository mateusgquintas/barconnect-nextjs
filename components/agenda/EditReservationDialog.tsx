'use client'

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapReservation } from '@/hooks/useReservationsMap';
import { getAvailableRooms } from '@/lib/agendaService';
import { Room } from '@/hooks/useRoomsDB';
import { notifyError, notifySuccess } from '@/utils/notify';

const CHANNEL_LABELS: Record<string, string> = {
  direto: 'Direto',
  booking: 'Booking',
  agenciador: 'Agenciador',
  motorista: 'Indicação - Motorista de Ônibus',
  chefe_romaria: 'Indicação - Chefe de Romaria',
};

interface EditReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: MapReservation | null;
  rooms: Room[];
  onSave: (id: string, updates: Partial<Omit<MapReservation, 'id'>>) => Promise<boolean>;
}

export function EditReservationDialog({ open, onOpenChange, reservation, rooms, onSave }: EditReservationDialogProps) {
  const [roomId, setRoomId] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [numberOfPeople, setNumberOfPeople] = useState('');
  const [totalValue, setTotalValue] = useState('');
  const [channel, setChannel] = useState('direto');
  const [notes, setNotes] = useState('');
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && reservation) {
      setRoomId(reservation.room_id);
      setCheckInDate(reservation.check_in_date);
      setCheckOutDate(reservation.check_out_date);
      setNumberOfPeople(reservation.number_of_people != null ? String(reservation.number_of_people) : '');
      setTotalValue(reservation.total_value != null ? String(reservation.total_value) : '');
      setChannel(reservation.channel || 'direto');
      setNotes(reservation.notes || '');
    }
  }, [open, reservation]);

  // Busca quartos disponíveis para as datas em edição, sempre incluindo o quarto atual da reserva
  useEffect(() => {
    async function fetchRooms() {
      if (!open || !checkInDate || !checkOutDate) return;
      setLoadingRooms(true);
      try {
        const available = await getAvailableRooms(`${checkInDate}T00:00:00`, `${checkOutDate}T00:00:00`);
        const currentRoom = rooms.find(r => r.id === reservation?.room_id);
        const merged = currentRoom && !available.some((r: any) => r.id === currentRoom.id)
          ? [...available, currentRoom as any]
          : available;
        setAvailableRooms(merged as any);
      } catch (err) {
        console.error('Erro ao buscar quartos disponíveis:', err);
        setAvailableRooms(rooms);
      } finally {
        setLoadingRooms(false);
      }
    }
    fetchRooms();
  }, [open, checkInDate, checkOutDate, reservation?.room_id, rooms]);

  const handleSave = async () => {
    if (!reservation) return;
    if (!checkInDate || !checkOutDate) {
      notifyError('Preencha as datas de check-in e check-out');
      return;
    }
    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      notifyError('Check-out deve ser depois do check-in');
      return;
    }
    setSaving(true);
    try {
      const ok = await onSave(reservation.id, {
        room_id: roomId,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        number_of_people: numberOfPeople ? parseInt(numberOfPeople) : null,
        total_value: totalValue ? parseFloat(totalValue) : null,
        channel: channel || null,
        notes: notes || null,
      });
      if (ok) {
        notifySuccess('Reserva atualizada!');
        onOpenChange(false);
      } else {
        notifyError('Erro ao atualizar reserva');
      }
    } finally {
      setSaving(false);
    }
  };

  if (!reservation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Reserva</DialogTitle>
          <DialogDescription>Altere os dados da reserva. As mudanças refletem no Mapa de Reservas e na Situação Atual dos Quartos.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Quarto</Label>
            <Select value={roomId} onValueChange={setRoomId} disabled={loadingRooms}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {availableRooms.map(r => (
                  <SelectItem key={r.id} value={r.id}>
                    Quarto {r.number} • {r.capacity} pessoas
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Check-in</Label>
              <Input type="date" value={checkInDate} onChange={e => setCheckInDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Check-out</Label>
              <Input type="date" value={checkOutDate} onChange={e => setCheckOutDate(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Nº de Pessoas</Label>
              <Input type="number" min="0" value={numberOfPeople} onChange={e => setNumberOfPeople(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Valor Total (R$)</Label>
              <Input type="number" min="0" step="0.01" value={totalValue} onChange={e => setTotalValue(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Canal de Aquisição</Label>
            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(CHANNEL_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Observações</Label>
            <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Informações adicionais" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : 'Salvar Alterações'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
