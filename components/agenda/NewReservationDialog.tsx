'use client'
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { notifyError, notifySuccess } from '@/utils/notify';
import { createRoomReservation } from '@/lib/agendaService';
import { Pilgrimage } from '@/types';

type Room = {
  id: string;
  number: string | number;
  floor?: number;
  type?: string;
  status?: string;
};

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  date: Date | null;
  pilgrimages: Pilgrimage[];
  rooms: Room[];
  onSuccess?: () => void;
};

export function NewReservationDialog({ open, onOpenChange, date, pilgrimages, rooms, onSuccess }: Props) {
  const [reservationType, setReservationType] = useState<'individual' | 'pilgrimage'>('individual');
  const [guestName, setGuestName] = useState('');
  const [guestDocument, setGuestDocument] = useState('');
  const [selectedPilgrimage, setSelectedPilgrimage] = useState('');
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [checkInTime, setCheckInTime] = useState(''); // HH:mm
  const [checkOutTime, setCheckOutTime] = useState(''); // HH:mm
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Reset form quando abrir
  React.useEffect(() => {
    if (open && date) {
      setCheckInDate(date.toISOString().split('T')[0]);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckOutDate(nextDay.toISOString().split('T')[0]);
      // não aplicar horários padrão
      setCheckInTime('');
      setCheckOutTime('');
    }
  }, [open, date]);

  const handleRoomToggle = (roomId: string) => {
    setSelectedRooms(prev => 
      prev.includes(roomId) ? prev.filter(id => id !== roomId) : [...prev, roomId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!checkInDate || !checkOutDate) {
      notifyError('Preencha as datas de check-in e check-out');
      return;
    }

    if (selectedRooms.length === 0) {
      notifyError('Selecione pelo menos um quarto');
      return;
    }

    if (reservationType === 'individual' && !guestName) {
      notifyError('Preencha o nome do hóspede');
      return;
    }

    if (reservationType === 'pilgrimage' && !selectedPilgrimage) {
      notifyError('Selecione uma romaria');
      return;
    }

    try {
      setSubmitting(true);

      // Criar reserva para cada quarto selecionado
      const start = checkInTime ? `${checkInDate}T${checkInTime}` : checkInDate;
      const end = checkOutTime ? `${checkOutDate}T${checkOutTime}` : checkOutDate;
      const promises = selectedRooms.map(roomId => 
        createRoomReservation({
          room_id: roomId,
          // Usar data+hora quando fornecido; caso contrário, apenas a data
          start,
          end,
          customer_name: reservationType === 'individual' ? guestName : null,
          pilgrimage_id: reservationType === 'pilgrimage' ? selectedPilgrimage : null,
          status: 'confirmed',
          notes: notes || undefined
        } as any)
      );

      await Promise.all(promises);

      notifySuccess(
        selectedRooms.length === 1 
          ? 'Reserva criada com sucesso!' 
          : `${selectedRooms.length} reservas criadas com sucesso!`
      );

      // Reset form
      setGuestName('');
      setGuestDocument('');
      setSelectedPilgrimage('');
      setSelectedRooms([]);
      setNotes('');
  setCheckInTime('');
  setCheckOutTime('');
      setReservationType('individual');
      
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error('Erro ao criar reserva:', err);
      notifyError('Erro ao criar reserva', err as any);
    } finally {
      setSubmitting(false);
    }
  };

  // Filtrar quartos disponíveis (status = 'available' ou sem status)
  const availableRooms = rooms.filter(r => !r.status || r.status === 'available');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Reserva de Quarto</DialogTitle>
          <DialogDescription>
            {date ? `Data selecionada: ${date.toLocaleDateString()}` : 'Selecione um dia no calendário.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de Reserva */}
          <div className="space-y-2">
            <Label>Tipo de Reserva</Label>
            <Select value={reservationType} onValueChange={(v: any) => setReservationType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="pilgrimage">Romaria/Grupo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Campos para Individual */}
          {reservationType === 'individual' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="guestName">Nome do Hóspede *</Label>
                <Input 
                  id="guestName" 
                  value={guestName} 
                  onChange={(e) => setGuestName(e.target.value)} 
                  placeholder="Nome completo"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guestDocument">Documento (CPF/RG)</Label>
                <Input 
                  id="guestDocument" 
                  value={guestDocument} 
                  onChange={(e) => setGuestDocument(e.target.value)} 
                  placeholder="000.000.000-00"
                />
              </div>
            </>
          )}

          {/* Campos para Romaria */}
          {reservationType === 'pilgrimage' && (
            <div className="space-y-2">
              <Label>Romaria *</Label>
              <Select value={selectedPilgrimage} onValueChange={setSelectedPilgrimage}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a romaria" />
                </SelectTrigger>
                <SelectContent>
                  {pilgrimages.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({new Date(p.arrivalDate).toLocaleDateString()} - {new Date(p.departureDate).toLocaleDateString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Datas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="checkIn">Check-in *</Label>
              <Input 
                id="checkIn" 
                type="date" 
                value={checkInDate} 
                onChange={(e) => setCheckInDate(e.target.value)} 
                required
              />
              <Input
                id="checkInTime"
                type="time"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
                placeholder="HH:MM"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkOut">Check-out *</Label>
              <Input 
                id="checkOut" 
                type="date" 
                value={checkOutDate} 
                onChange={(e) => setCheckOutDate(e.target.value)} 
                required
              />
              <Input
                id="checkOutTime"
                type="time"
                value={checkOutTime}
                onChange={(e) => setCheckOutTime(e.target.value)}
                placeholder="HH:MM"
              />
            </div>
          </div>

          {/* Seleção de Quartos */}
          <div className="space-y-2">
            <Label>Quartos Disponíveis * {reservationType === 'pilgrimage' && '(pode selecionar múltiplos)'}</Label>
            <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
              {availableRooms.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum quarto disponível</p>
              ) : (
                availableRooms.map(room => (
                  <div key={room.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={room.id}
                      checked={selectedRooms.includes(room.id)}
                      onCheckedChange={() => handleRoomToggle(room.id)}
                    />
                    <label htmlFor={room.id} className="text-sm font-medium cursor-pointer flex-1">
                      Quarto {room.number} - {room.floor}º andar {room.type && `(${room.type})`}
                    </label>
                  </div>
                ))
              )}
            </div>
            {selectedRooms.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {selectedRooms.length} quarto(s) selecionado(s)
              </p>
            )}
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Input 
              id="notes" 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              placeholder="Informações adicionais"
            />
          </div>

          {/* Botões */}
          <div className="flex gap-2 justify-end pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Criando...' : 'Criar Reserva'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default NewReservationDialog;
