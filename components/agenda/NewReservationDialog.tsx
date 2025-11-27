'use client'
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { notifyError, notifySuccess } from '@/utils/notify';
import { createRoomReservation, getAvailableRooms } from '@/lib/agendaService';
import { Pilgrimage } from '@/types';
import { Room } from '@/types/agenda';
import { PilgrimageCombobox } from './PilgrimageCombobox';
import { RoomSelector } from './RoomSelector';
import { Calendar, Clock, User, Users, Building2, FileText, CheckCircle2, ArrowLeft } from 'lucide-react';

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  date: Date | null;
  pilgrimages: Pilgrimage[];
  rooms: Room[];
  onSuccess?: () => void;
};

export function NewReservationDialog({ open, onOpenChange, date, pilgrimages, rooms, onSuccess }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [reservationType, setReservationType] = useState<'individual' | 'pilgrimage'>('individual');
  const [guestName, setGuestName] = useState('');
  const [guestDocument, setGuestDocument] = useState('');
  const [selectedPilgrimage, setSelectedPilgrimage] = useState('');
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [showRoomSelector, setShowRoomSelector] = useState(false);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [checkInTime, setCheckInTime] = useState(''); // HH:mm
  const [checkOutTime, setCheckOutTime] = useState(''); // HH:mm
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  // Reset form quando abrir
  useEffect(() => {
    if (open && date) {
      setStep(1);
      setCheckInDate(date.toISOString().split('T')[0]);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckOutDate(nextDay.toISOString().split('T')[0]);
      // não aplicar horários padrão
      setCheckInTime('');
      setCheckOutTime('');
      setShowRoomSelector(false);
    }
  }, [open, date]);

  // Buscar quartos disponíveis quando as datas mudarem
  useEffect(() => {
    async function fetchAvailableRooms() {
      if (!checkInDate || !checkOutDate) {
        setAvailableRooms(rooms);
        return;
      }

      try {
        setLoadingRooms(true);
        const start = checkInTime ? `${checkInDate}T${checkInTime}` : checkInDate;
        const end = checkOutTime ? `${checkOutDate}T${checkOutTime}` : checkOutDate;
        
        const available = await getAvailableRooms(start, end);
        setAvailableRooms(available);
      } catch (err) {
        console.error('Erro ao buscar quartos disponíveis:', err);
        // Em caso de erro, mostrar todos os quartos
        setAvailableRooms(rooms);
      } finally {
        setLoadingRooms(false);
      }
    }

    fetchAvailableRooms();
  }, [checkInDate, checkOutDate, checkInTime, checkOutTime, rooms]);

  const handleRoomToggle = (roomId: string) => {
    // Para individual, permitir apenas 1 quarto
    if (reservationType === 'individual') {
      setSelectedRooms([roomId]);
    } else {
      // Para romaria, permitir múltiplos
      setSelectedRooms(prev => 
        prev.includes(roomId) ? prev.filter(id => id !== roomId) : [...prev, roomId]
      );
    }
  };

  const validateForm = (): boolean => {
    if (!checkInDate || !checkOutDate) {
      notifyError('Preencha as datas de check-in e check-out');
      return false;
    }

    if (selectedRooms.length === 0) {
      notifyError('Selecione pelo menos um quarto');
      return false;
    }

    if (reservationType === 'individual' && !guestName) {
      notifyError('Preencha o nome do hóspede');
      return false;
    }

    if (reservationType === 'pilgrimage' && !selectedPilgrimage) {
      notifyError('Selecione uma romaria');
      return false;
    }

    // Validação: fim deve ser estritamente após início
    const datesEqual = checkInDate === checkOutDate;
    if (datesEqual) {
      if (!checkInTime || !checkOutTime) {
        notifyError('Para mesma data, informe horários de check-in e check-out e garanta que check-out seja após o check-in.');
        return false;
      }
      if (checkOutTime <= checkInTime) {
        notifyError('Horário de check-out deve ser após o horário de check-in.');
        return false;
      }
    } else {
      const inD = new Date(checkInDate);
      const outD = new Date(checkOutDate);
      if (!(outD.getTime() > inD.getTime())) {
        notifyError('A data de check-out deve ser após a data de check-in.');
        return false;
      }
    }

    return true;
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
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
      setStep(1);
      
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error('Erro ao criar reserva:', err);
      notifyError('Erro ao criar reserva', err as any);
    } finally {
      setSubmitting(false);
    }
  };

  // Helper para obter informações da romaria selecionada
  const getSelectedPilgrimage = () => {
    return pilgrimages.find(p => p.id === selectedPilgrimage);
  };

  // Helper para formatar data/hora
  const formatDateTime = (date: string, time?: string) => {
    const dateObj = new Date(date + 'T00:00:00');
    let formatted = dateObj.toLocaleDateString('pt-BR');
    if (time) {
      formatted += ` às ${time}`;
    }
    return formatted;
  };

  // Helper para calcular duração da estadia
  const calculateDuration = () => {
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Nova Reserva de Quarto
            {step === 2 && ' - Confirmação'}
          </DialogTitle>
          <DialogDescription>
            {step === 1 
              ? (date ? `Data selecionada: ${date.toLocaleDateString()}` : 'Selecione um dia no calendário.')
              : 'Revise os dados antes de confirmar a reserva'
            }
          </DialogDescription>
        </DialogHeader>

        {/* Indicador de Etapas */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className={`flex items-center gap-2 ${step === 1 ? 'text-primary' : 'text-green-600'}`}>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${step === 1 ? 'border-primary bg-primary text-primary-foreground' : 'border-green-600 bg-green-600 text-white'}`}>
              {step === 1 ? '1' : <CheckCircle2 className="h-5 w-5" />}
            </div>
            <span className="text-sm font-medium">Dados</span>
          </div>
          <div className="w-12 h-0.5 bg-border" />
          <div className={`flex items-center gap-2 ${step === 2 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${step === 2 ? 'border-primary bg-primary text-primary-foreground' : 'border-border'}`}>
              2
            </div>
            <span className="text-sm font-medium">Confirmação</span>
          </div>
        </div>

        {/* ETAPA 1: Formulário */}
        {step === 1 && (
          <form onSubmit={handleNextStep} className="space-y-4">
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
                <PilgrimageCombobox
                  pilgrimages={pilgrimages}
                  value={selectedPilgrimage}
                  onValueChange={setSelectedPilgrimage}
                  placeholder="Busque pelo nome, data ou clique para ver todas..."
                />
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
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>
                  Selecionar Quartos * 
                  {reservationType === 'pilgrimage' && ' (pode selecionar múltiplos)'}
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRoomSelector(!showRoomSelector)}
                >
                  {showRoomSelector ? 'Esconder Seletor' : 'Mostrar Seletor Visual'}
                </Button>
              </div>

              {loadingRooms && (
                <p className="text-sm text-blue-600">🔄 Verificando disponibilidade...</p>
              )}

              {!loadingRooms && availableRooms.length === 0 && (
                <p className="text-sm text-amber-600">⚠️ Nenhum quarto disponível no período selecionado</p>
              )}

              {!loadingRooms && availableRooms.length > 0 && (
                <>
                  {showRoomSelector ? (
                    <RoomSelector
                      availableRooms={availableRooms}
                      selectedRoomId={reservationType === 'individual' ? selectedRooms[0] : undefined}
                      onSelectRoom={(roomId) => {
                        if (reservationType === 'individual') {
                          setSelectedRooms([roomId]);
                        } else {
                          handleRoomToggle(roomId);
                        }
                      }}
                    />
                  ) : (
                    <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                      {availableRooms.map(room => (
                        <div key={room.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={room.id}
                            checked={selectedRooms.includes(room.id)}
                            onCheckedChange={() => handleRoomToggle(room.id)}
                          />
                          <label htmlFor={room.id} className="text-sm font-medium cursor-pointer flex-1">
                            Quarto {room.number}
                            <span className="text-blue-600 font-semibold"> • {room.capacity} pessoas</span>
                            {room.type && ` • ${room.type}`}
                            {room.floor && ` • ${room.floor}º andar`}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedRooms.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {selectedRooms.length} quarto(s) selecionado(s)
                      {reservationType === 'pilgrimage' && selectedRooms.length > 1 && 
                        `: ${selectedRooms.map(id => {
                          const room = availableRooms.find(r => r.id === id);
                          return room ? room.number : id;
                        }).join(', ')}`
                      }
                    </p>
                  )}
                </>
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
              >
                Cancelar
              </Button>
              <Button type="submit">
                Avançar para Confirmação
              </Button>
            </div>
          </form>
        )}

        {/* ETAPA 2: Confirmação */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Resumo da Reserva */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Resumo da Reserva
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Tipo e Hóspede/Romaria */}
                <div className="flex items-start gap-3">
                  {reservationType === 'individual' ? (
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  ) : (
                    <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {reservationType === 'individual' ? 'Hóspede Individual' : 'Romaria/Grupo'}
                    </p>
                    <p className="text-base font-semibold">
                      {reservationType === 'individual' 
                        ? guestName 
                        : getSelectedPilgrimage()?.name || 'Romaria selecionada'
                      }
                    </p>
                    {reservationType === 'individual' && guestDocument && (
                      <p className="text-sm text-muted-foreground">Doc: {guestDocument}</p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Datas */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Check-in</p>
                      <p className="text-base font-semibold">{formatDateTime(checkInDate, checkInTime)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Check-out</p>
                      <p className="text-base font-semibold">{formatDateTime(checkOutDate, checkOutTime)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Duração: {calculateDuration()} {calculateDuration() === 1 ? 'dia' : 'dias'}
                  </p>
                </div>

                <Separator />

                {/* Quartos */}
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      {selectedRooms.length === 1 ? 'Quarto Selecionado' : `${selectedRooms.length} Quartos Selecionados`}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedRooms.map(roomId => {
                        const room = availableRooms.find(r => r.id === roomId);
                        return room ? (
                          <Badge key={room.id} variant="secondary" className="text-sm">
                            Quarto {room.number} • {room.capacity} pessoas
                            {room.type && ` • ${room.type}`}
                            {room.floor && ` • ${room.floor}º andar`}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>

                {/* Observações */}
                {notes && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Observações</p>
                        <p className="text-sm">{notes}</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Informações Adicionais */}
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    {selectedRooms.length === 1 
                      ? 'Uma reserva será criada'
                      : `${selectedRooms.length} reservas serão criadas`
                    }
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Status inicial: <strong>Confirmada</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-2 justify-end pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setStep(1)}
                disabled={submitting}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={submitting}
              >
                {submitting ? 'Criando...' : 'Confirmar Reserva'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default NewReservationDialog;
