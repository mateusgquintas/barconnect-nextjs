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
import { createRoomReservation, getAvailableRooms, applyReservationPaymentPlan } from '@/lib/agendaService';
import { supabase } from '@/lib/supabase';
import { Pilgrimage } from '@/types';
import { Room } from '@/types/agenda';
import { PilgrimageNameCombobox } from './PilgrimageNameCombobox';
import { RoomSelector } from './RoomSelector';
import { usePilgrimagesDB } from '@/hooks/usePilgrimagesDB';
import { Calendar, Clock, User, Users, Building2, FileText, CheckCircle2, ArrowLeft, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { getLocalDateStr } from '@/utils/agenda';

const CHANNEL_LABELS: Record<string, string> = {
  direto: 'Direto',
  booking: 'Booking',
  agenciador: 'Agenciador',
  motorista: 'Indicação - Motorista de Ônibus',
  chefe_romaria: 'Indicação - Chefe de Romaria',
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  dinheiro: 'Dinheiro',
  pix: 'Pix',
  debito: 'Cartão de débito',
  credito: 'Cartão de crédito',
  boleto: 'Boleto',
  transferencia: 'Transferência bancária',
  permuta: 'Permuta',
  outro: 'Outro',
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
  const { createPilgrimage, addOccurrence } = usePilgrimagesDB();
  const [step, setStep] = useState<1 | 2>(1);
  const [reservationType, setReservationType] = useState<'avulso' | 'romaria'>('avulso');
  const [guestName, setGuestName] = useState('');
  const [guestDocument, setGuestDocument] = useState('');
  // Nomes dos acompanhantes (reserva avulsa com mais de 1 pessoa): um campo por pessoa a mais
  // além do hóspede principal, redimensionado automaticamente conforme "Número de Pessoas".
  const [companionNames, setCompanionNames] = useState<string[]>([]);
  // Por padrão a lista de quartos já vem filtrada pela capacidade informada; esse toggle
  // permite ver todos os quartos disponíveis, não só os compatíveis.
  const [showAllRoomsAvulso, setShowAllRoomsAvulso] = useState(false);
  const [numberOfPeople, setNumberOfPeople] = useState('1'); // Número de pessoas
  const [numberOfBuses, setNumberOfBuses] = useState('0');
  const [channel, setChannel] = useState<string>('direto');
  const [totalValue, setTotalValue] = useState('');
  // Bloco financeiro: mesma lógica do "Registrar movimentação" do fluxo de caixa, adaptada
  // para hospedagem. Controla como e quando o valor da reserva vira transação no caixa.
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [installmentsCount, setInstallmentsCount] = useState('1');
  const [alreadyPaid, setAlreadyPaid] = useState(true);
  const [receivingMode, setReceivingMode] = useState<'antecipado' | 'parcela_a_parcela'>('antecipado');
  const [receivedDate, setReceivedDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  // Nome da romaria (busca livre): não obrigatório. Se digitar um nome já existente,
  // associa a esta ocorrência à romaria existente; se for um nome novo, cria o grupo
  // automaticamente; se ficar em branco, a reserva é tratada como avulsa.
  const [pilgrimageName, setPilgrimageName] = useState('');
  const [matchedPilgrimage, setMatchedPilgrimage] = useState<Pilgrimage | null>(null);
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
  // Aviso de capacidade x nº de pessoas (ver handleNextStep). Usamos um banner in-app em vez de
  // window.confirm() porque o confirm() nativo fecha o Dialog do Radix como efeito colateral
  // (ele interpreta a interação com o diálogo do navegador como um clique fora do modal).
  const [showCapacityWarning, setShowCapacityWarning] = useState(false);
  const [capacityWarningMessage, setCapacityWarningMessage] = useState('');

  // Reset form quando abrir
  useEffect(() => {
    if (open) {
      // Se nenhum dia foi selecionado no calendário (ex: abrindo pelo botão do cabeçalho),
      // usa hoje como padrão em vez de deixar as datas em branco (o que travava a validação
      // do passo 1 sem nenhum aviso visível para o usuário).
      const baseDate = date || new Date();
      setStep(1);
      setReservationType('romaria'); // Padrão: Romaria/Grupo
      setCheckInDate(baseDate.toISOString().split('T')[0]);
      const nextDay = new Date(baseDate);
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckOutDate(nextDay.toISOString().split('T')[0]);
      // Horários padrão: 12:00
      setCheckInTime('12:00');
      setCheckOutTime('12:00');
      setShowRoomSelector(false);
      setChannel('direto');
      setTotalValue('');
      setNumberOfBuses('0');
      setPaymentMethod('pix');
      setInstallmentsCount('1');
      setAlreadyPaid(true);
      setReceivingMode('antecipado');
      setReceivedDate(getLocalDateStr(baseDate));
      setDueDate('');
      setCompanionNames([]);
      setShowAllRoomsAvulso(false);
    }
  }, [open, date]);

  // Redimensiona os campos de acompanhante conforme o número de pessoas (só faz sentido para
  // avulso — romaria não pede nome individual de cada pessoa do grupo).
  useEffect(() => {
    if (reservationType !== 'avulso') return;
    const count = Math.max(0, (parseInt(numberOfPeople) || 1) - 1);
    setCompanionNames(prev => {
      if (prev.length === count) return prev;
      const next = prev.slice(0, count);
      while (next.length < count) next.push('');
      return next;
    });
  }, [numberOfPeople, reservationType]);

  // Buscar quartos disponíveis quando as datas mudarem
  useEffect(() => {
    async function fetchAvailableRooms() {
      if (!checkInDate || !checkOutDate) {
        setAvailableRooms(rooms);
        return;
      }

      try {
        setLoadingRooms(true);
        const start = checkInTime ? `${checkInDate}T${checkInTime}:00` : `${checkInDate}T00:00:00`;
        const end = checkOutTime ? `${checkOutDate}T${checkOutTime}:00` : `${checkOutDate}T00:00:00`;
        
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

  // Qualquer mudança na seleção de quartos ou no número de pessoas invalida uma confirmação
  // de capacidade anterior, para não deixar o aviso "preso" como aceito indevidamente.
  useEffect(() => {
    setShowCapacityWarning(false);
  }, [selectedRooms, numberOfPeople]);

  // Avulso: em vez de misturar todos os quartos disponíveis, prioriza os compatíveis com o
  // número de pessoas informado (capacidade >= pessoas, do menor para o maior — o "melhor
  // encaixe" primeiro). Sem isso, "Mostrar todos" ainda revela a lista completa.
  const people = parseInt(numberOfPeople) || 0;
  const displayedRooms = React.useMemo(() => {
    if (reservationType !== 'avulso' || showAllRoomsAvulso || people <= 0) return availableRooms;
    const compatible = availableRooms
      .filter(r => (r.capacity || 0) >= people)
      .sort((a, b) => (a.capacity || 0) - (b.capacity || 0));
    return compatible.length > 0 ? compatible : availableRooms;
  }, [availableRooms, reservationType, showAllRoomsAvulso, people]);

  const handleRoomToggle = (roomId: string) => {
    // Para avulso, permitir apenas 1 quarto
    if (reservationType === 'avulso') {
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

    if (reservationType === 'avulso' && !guestName) {
      notifyError('Preencha o nome do hóspede');
      return false;
    }

    if (totalValue && parseFloat(totalValue) > 0) {
      const hasInstallments = (parseInt(installmentsCount) || 1) > 1;
      if ((hasInstallments || alreadyPaid) && !receivedDate) {
        notifyError('Informe a data de recebimento');
        return false;
      }
      if (!hasInstallments && !alreadyPaid && !dueDate) {
        notifyError('Informe a data de vencimento');
        return false;
      }
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
    if (!validateForm()) return;

    // Confere se a capacidade dos quartos selecionados bate com o número de pessoas informado.
    // Só avança sem aviso quando a soma bate exatamente; caso contrário, mostra um banner de
    // confirmação in-app (o usuário precisa clicar em "Continuar mesmo assim" para prosseguir).
    const people = parseInt(numberOfPeople) || 0;
    const totalCapacity = selectedRooms.reduce((sum, id) => {
      const room = availableRooms.find(r => r.id === id);
      return sum + (room?.capacity || 0);
    }, 0);

    if (people > 0 && totalCapacity !== people) {
      const diff = totalCapacity - people;
      const message = diff > 0
        ? `A seleção atual comporta mais pessoas do que o informado (${totalCapacity} vagas para ${people} pessoas).`
        : `A seleção atual não cobre todas as pessoas informadas — faltam ${Math.abs(diff)} vaga(s) (${totalCapacity} vagas para ${people} pessoas).`;
      setCapacityWarningMessage(message);
      setShowCapacityWarning(true);
      return;
    }

    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      // Criar reserva para cada quarto selecionado
      // Adiciona :00 para segundos e garante formato completo
      const start = checkInTime ? `${checkInDate}T${checkInTime}:00` : `${checkInDate}T00:00:00`;
      const end = checkOutTime ? `${checkOutDate}T${checkOutTime}:00` : `${checkOutDate}T00:00:00`;

      // Monta as notas incluindo número de pessoas
      const peopleNote = numberOfPeople && numberOfPeople !== '1' ? `${numberOfPeople} pessoas` : '';
      const finalNotes = [peopleNote, notes].filter(Boolean).join(' | ');

      // Valor e nº de pessoas são por evento (romaria/reserva); dividimos entre os quartos
      // selecionados para que a soma dos registros reflita o total correto na Controladoria.
      const roomCount = selectedRooms.length || 1;
      const parsedValue = totalValue ? parseFloat(totalValue) : null;
      const valuePerRoom = parsedValue != null && !isNaN(parsedValue) ? Math.round((parsedValue / roomCount) * 100) / 100 : null;
      const parsedPeople = numberOfPeople ? parseInt(numberOfPeople) : null;
      const peoplePerRoom = parsedPeople != null && !isNaN(parsedPeople) ? Math.round(parsedPeople / roomCount) : null;
      const busesCount = reservationType === 'romaria' && numberOfBuses ? parseInt(numberOfBuses) : null;

      // Resolve o vínculo com romaria: nome vazio = avulso; nome já existente = nova ocorrência
      // do mesmo grupo; nome novo = cria o grupo automaticamente (e passa a existir em Gestão de Romarias).
      // occurrence_id (não pilgrimage_id) é a referência que os quartos passam a usar — assim o
      // sistema distingue "vinda de julho" de "vinda de agosto" da mesma romaria, em vez de só
      // saber que o quarto pertence ao grupo (causa dos valores/quartos inconsistentes no calendário).
      let pilgrimageId: string | null = null;
      let occurrenceId: string | null = null;
      let pilgrimageDisplayName = '';
      const trimmedName = pilgrimageName.trim();
      if (reservationType === 'romaria' && trimmedName) {
        pilgrimageDisplayName = trimmedName;
        if (matchedPilgrimage) {
          pilgrimageId = matchedPilgrimage.id;
          occurrenceId = await addOccurrence(matchedPilgrimage.id, {
            arrivalDate: checkInDate,
            departureDate: checkOutDate,
            numberOfPeople: parsedPeople || 0,
            status: 'scheduled',
            notes: notes || undefined,
          });
        } else {
          const created = await createPilgrimage({
            name: trimmedName,
            busGroup: '—',
            contactPhone: '',
            defaultChannel: channel as any,
            status: 'active',
            arrivalDate: checkInDate,
            departureDate: checkOutDate,
            numberOfPeople: parsedPeople || 0,
          } as any);
          pilgrimageId = created?.pilgrimageId ?? null;
          occurrenceId = created?.occurrenceId ?? null;
        }
      }

      const promises = selectedRooms.map(roomId =>
        createRoomReservation({
          room_id: roomId,
          // Usar data+hora quando fornecido; caso contrário, apenas a data
          start,
          end,
          customer_name: reservationType === 'avulso' ? guestName : null,
          pilgrimage_id: pilgrimageId,
          occurrence_id: occurrenceId,
          status: 'confirmed',
          notes: finalNotes || undefined,
          channel: channel || null,
          total_value: valuePerRoom,
          number_of_people: peoplePerRoom,
          number_of_buses: busesCount,
        } as any)
      );

      const createdIds = await Promise.all(promises);

      // Nomes dos acompanhantes (avulso com mais de 1 pessoa) — vinculados à primeira reserva
      // criada, mesmo padrão usado para o faturamento por canal logo abaixo.
      const namedCompanions = companionNames.map(n => n.trim()).filter(Boolean);
      if (reservationType === 'avulso' && namedCompanions.length > 0 && createdIds[0]) {
        const { error: companionsError } = await supabase.from('reservation_companions').insert(
          namedCompanions.map(name => ({ room_reservation_id: createdIds[0], name }))
        );
        if (companionsError) {
          console.error('Erro ao salvar acompanhantes:', companionsError);
        }
      }

      // Registra o faturamento do evento (romaria/reserva) na Controladoria Financeira,
      // usando o valor total (não dividido por quarto) e vinculando à primeira reserva criada.
      if (parsedValue != null && !isNaN(parsedValue) && parsedValue > 0) {
        const description = reservationType === 'avulso'
          ? guestName
          : (pilgrimageDisplayName || 'Romaria');
        const { error: revenueError } = await supabase.from('finance_channel_revenue').insert([{
          event_date: checkInDate,
          description,
          channel: channel || 'direto',
          total_value: parsedValue,
          number_of_people: parsedPeople,
          number_of_buses: busesCount,
          source: 'reservation',
          reservation_id: createdIds[0] || null,
        }]);
        if (revenueError) {
          console.error('Erro ao registrar faturamento na Controladoria:', revenueError);
        }

        // Bloco financeiro: grava as parcelas e espelha no fluxo de caixa o que já foi
        // recebido (ou está agendado), vinculado à primeira reserva criada.
        const paymentDescription = reservationType === 'avulso'
          ? `Reserva - ${guestName}`
          : `Reserva - ${pilgrimageDisplayName || 'Romaria'}`;
        await applyReservationPaymentPlan(createdIds[0], paymentDescription, parsedValue, {
          method: paymentMethod,
          installments: parseInt(installmentsCount) || 1,
          alreadyPaid,
          receivingMode,
          receivedDate: receivedDate || null,
          dueDate: dueDate || null,
          occurrenceId,
        });
      }

      notifySuccess(
        selectedRooms.length === 1
          ? 'Reserva criada com sucesso!'
          : `${selectedRooms.length} reservas criadas com sucesso!`
      );

      // Reset form
      setGuestName('');
      setGuestDocument('');
      setPilgrimageName('');
      setMatchedPilgrimage(null);
      setSelectedRooms([]);
      setNotes('');
      setCheckInTime('');
      setCheckOutTime('');
      setReservationType('romaria');
      setChannel('direto');
      setTotalValue('');
      setNumberOfBuses('0');
      setPaymentMethod('pix');
      setInstallmentsCount('1');
      setAlreadyPaid(true);
      setReceivingMode('antecipado');
      setReceivedDate('');
      setDueDate('');
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
          <form onSubmit={handleNextStep} className="space-y-4 min-h-0">
            {/* Tipo de Reserva */}
            <div className="space-y-2">
              <Label>Tipo de Reserva</Label>
              <Select value={reservationType} onValueChange={(v: any) => setReservationType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="romaria">Romaria</SelectItem>
                  <SelectItem value="avulso">Avulso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Campos para Avulso */}
            {reservationType === 'avulso' && (
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
                {companionNames.length > 0 && (
                  <div className="space-y-2 pl-1 border-l-2 border-slate-100">
                    <Label className="text-sm text-slate-600">Acompanhantes</Label>
                    {companionNames.map((name, idx) => (
                      <Input
                        key={idx}
                        value={name}
                        onChange={(e) => {
                          const next = [...companionNames];
                          next[idx] = e.target.value;
                          setCompanionNames(next);
                        }}
                        placeholder={`Nome da ${idx + 2}ª pessoa`}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Campos para Romaria */}
            {reservationType === 'romaria' && (
              <>
                <div className="space-y-2">
                  <Label>Romaria</Label>
                  <PilgrimageNameCombobox
                    pilgrimages={pilgrimages}
                    value={pilgrimageName}
                    onValueChange={(name, matched) => {
                      setPilgrimageName(name);
                      setMatchedPilgrimage(matched);
                      if (matched?.defaultChannel) {
                        setChannel(matched.defaultChannel);
                      }
                    }}
                    placeholder="Busque pelo nome ou digite um nome novo..."
                  />
                  <p className="text-xs text-slate-500">
                    {pilgrimageName.trim()
                      ? (matchedPilgrimage
                          ? `Nova vinda de "${matchedPilgrimage.name}" — vai contar como mais uma ocorrência do mesmo grupo.`
                          : `"${pilgrimageName.trim()}" é um nome novo — um grupo será criado automaticamente em Gestão de Romarias.`)
                      : 'Opcional. Deixe em branco para tratar como reserva avulsa/pontual sem grupo vinculado.'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numberOfBuses">Número de Ônibus</Label>
                  <Input
                    id="numberOfBuses"
                    type="number"
                    min="0"
                    value={numberOfBuses}
                    onChange={(e) => setNumberOfBuses(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </>
            )}

            {/* Número de pessoas: compartilhado entre os dois tipos, editável a cada reserva
                mesmo que seja a mesma romaria de anos anteriores (o grupo pode variar de tamanho). */}
            <div className="space-y-2">
              <Label htmlFor="numberOfPeople">Número de Pessoas</Label>
              <Input
                id="numberOfPeople"
                type="number"
                min="1"
                value={numberOfPeople}
                onChange={(e) => setNumberOfPeople(e.target.value)}
                placeholder="Quantidade de pessoas"
              />
              <p className="text-xs text-slate-500">Usado para conferir se a capacidade dos quartos selecionados é suficiente</p>
            </div>

            {/* Canal de aquisição e valor — alimenta a Controladoria financeira */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="channel">Canal de Aquisição</Label>
                <Select value={channel} onValueChange={setChannel}>
                  <SelectTrigger id="channel">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="direto">Direto</SelectItem>
                    <SelectItem value="booking">Booking</SelectItem>
                    <SelectItem value="agenciador">Agenciador</SelectItem>
                    <SelectItem value="motorista">Indicação - Motorista de Ônibus</SelectItem>
                    <SelectItem value="chefe_romaria">Indicação - Chefe de Romaria</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalValue">Valor Total (R$)</Label>
                <Input
                  id="totalValue"
                  type="number"
                  min="0"
                  step="0.01"
                  value={totalValue}
                  onChange={(e) => setTotalValue(e.target.value)}
                  placeholder="0,00"
                />
              </div>
            </div>

            {/* Bloco financeiro: aparece assim que um valor é informado, no mesmo padrão do
                "Registrar movimentação" do fluxo de caixa. */}
            {!!totalValue && parseFloat(totalValue) > 0 && (
              <div className="border rounded-lg p-4 space-y-4 bg-slate-50">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Método de Pagamento *</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Número de Parcelas *</Label>
                    <Select value={installmentsCount} onValueChange={setInstallmentsCount}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
                          <SelectItem key={n} value={String(n)}>{n}x</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="alreadyPaid" checked={alreadyPaid} onCheckedChange={(c) => setAlreadyPaid(c as boolean)} />
                  <label htmlFor="alreadyPaid" className="text-sm font-medium cursor-pointer">O cliente já pagou</label>
                </div>

                {/* Aparece sempre que há mais de uma parcela, independente de já ter pago ou não —
                    mesmo uma reserva ainda não paga precisa dessa informação para projetar as
                    parcelas futuras no fluxo de caixa. */}
                {parseInt(installmentsCount) > 1 ? (
                  <>
                    <div className="space-y-2 pl-1">
                      <Label>Forma de Recebimento</Label>
                      <div className="space-y-2">
                        <label className={`flex items-start gap-2 p-2.5 rounded-md border cursor-pointer ${receivingMode === 'antecipado' ? 'border-blue-400 bg-blue-50' : 'border-slate-200'}`}>
                          <input type="radio" className="mt-1" checked={receivingMode === 'antecipado'} onChange={() => setReceivingMode('antecipado')} />
                          <span>
                            <span className="block text-sm font-medium">Recebimento antecipado</span>
                            <span className="block text-xs text-slate-500">Recebo o valor total de uma vez.</span>
                          </span>
                        </label>
                        <label className={`flex items-start gap-2 p-2.5 rounded-md border cursor-pointer ${receivingMode === 'parcela_a_parcela' ? 'border-blue-400 bg-blue-50' : 'border-slate-200'}`}>
                          <input type="radio" className="mt-1" checked={receivingMode === 'parcela_a_parcela'} onChange={() => setReceivingMode('parcela_a_parcela')} />
                          <span>
                            <span className="block text-sm font-medium">Recebimento parcela a parcela</span>
                            <span className="block text-xs text-slate-500">Recebo as parcelas mês a mês, conforme a operadora repassa.</span>
                          </span>
                        </label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="receivedDate">
                        {receivingMode === 'parcela_a_parcela' ? 'Data de Recebimento da 1ª Parcela *' : 'Data de Recebimento *'}
                      </Label>
                      <Input id="receivedDate" type="date" value={receivedDate} onChange={(e) => setReceivedDate(e.target.value)} />
                    </div>
                  </>
                ) : alreadyPaid ? (
                  <div className="space-y-2">
                    <Label htmlFor="receivedDate">Data de Recebimento *</Label>
                    <Input id="receivedDate" type="date" value={receivedDate} onChange={(e) => setReceivedDate(e.target.value)} />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Data de Vencimento *</Label>
                    <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                  </div>
                )}
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
                  {reservationType === 'romaria' && ' (pode selecionar múltiplos)'}
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

              {!loadingRooms && reservationType === 'avulso' && people > 0 && !showAllRoomsAvulso && displayedRooms.length < availableRooms.length && (
                <p className="text-xs text-slate-500 flex items-center justify-between">
                  <span>Mostrando quartos com capacidade para {people} {people === 1 ? 'pessoa' : 'pessoas'}.</span>
                  <button type="button" className="text-blue-600 hover:underline" onClick={() => setShowAllRoomsAvulso(true)}>
                    Mostrar todos os {availableRooms.length} quartos
                  </button>
                </p>
              )}

              {!loadingRooms && availableRooms.length > 0 && (
                <>
                  {showRoomSelector ? (
                    <RoomSelector
                      availableRooms={displayedRooms}
                      selectedRoomId={reservationType === 'avulso' ? selectedRooms[0] : undefined}
                      onSelectRoom={(roomId) => {
                        if (reservationType === 'avulso') {
                          setSelectedRooms([roomId]);
                        } else {
                          handleRoomToggle(roomId);
                        }
                      }}
                    />
                  ) : (
                    <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2" style={{ contain: 'layout' }}>
                      {displayedRooms.map(room => (
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

                  {selectedRooms.length > 0 && (() => {
                    const totalCapacity = selectedRooms.reduce((sum, id) => {
                      const room = availableRooms.find(r => r.id === id);
                      return sum + (room?.capacity || 0);
                    }, 0);
                    const people = parseInt(numberOfPeople) || 0;
                    const diff = totalCapacity - people;
                    return (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          {selectedRooms.length} quarto(s) selecionado(s)
                          {reservationType === 'romaria' && selectedRooms.length > 1 &&
                            `: ${selectedRooms.map(id => {
                              const room = availableRooms.find(r => r.id === id);
                              return room ? room.number : id;
                            }).join(', ')}`
                          }
                        </p>
                        <p className={`text-sm font-semibold ${people > 0 && diff !== 0 ? 'text-amber-600' : 'text-blue-600'}`}>
                          Total: {totalCapacity} vagas
                          {people > 0 && diff !== 0 && (
                            diff > 0 ? ` (${diff} a mais que as ${people} pessoas informadas)` : ` (faltam ${Math.abs(diff)} vagas para as ${people} pessoas informadas)`
                          )}
                        </p>
                      </div>
                    );
                  })()}
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

            {/* Aviso de capacidade x nº de pessoas — exige confirmação explícita para avançar */}
            {showCapacityWarning && (
              <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 space-y-3">
                <p className="text-sm text-amber-900">⚠️ {capacityWarningMessage} Deseja continuar mesmo assim?</p>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowCapacityWarning(false)}>
                    Ajustar seleção
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                    onClick={() => { setShowCapacityWarning(false); setStep(2); }}
                  >
                    Continuar mesmo assim
                  </Button>
                </div>
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-3 justify-end pt-4 border-t mt-6 pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="min-w-[120px] hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="min-w-[200px] bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition-all"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
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
                  {reservationType === 'avulso' ? (
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  ) : (
                    <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {reservationType === 'avulso' ? 'Hóspede Avulso' : 'Romaria/Grupo'}
                    </p>
                    <p className="text-base font-semibold">
                      {reservationType === 'avulso'
                        ? guestName
                        : (pilgrimageName.trim() || 'Sem grupo vinculado (avulso)')
                      }
                    </p>
                    {reservationType === 'romaria' && pilgrimageName.trim() && (
                      <p className="text-sm text-muted-foreground">
                        {matchedPilgrimage ? 'Romaria já cadastrada — nova ocorrência' : 'Romaria nova — será criada automaticamente'}
                      </p>
                    )}
                    {reservationType === 'avulso' && guestDocument && (
                      <p className="text-sm text-muted-foreground">Doc: {guestDocument}</p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Canal e valor */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Canal de Aquisição</p>
                      <p className="text-base font-semibold">{CHANNEL_LABELS[channel] || channel}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                      <p className="text-base font-semibold">{totalValue ? formatCurrency(parseFloat(totalValue)) : '—'}</p>
                    </div>
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
            <div className="flex gap-3 justify-end pt-4 border-t mt-6 pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setStep(1)}
                disabled={submitting}
                className="min-w-[120px] hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={submitting}
                className="min-w-[180px] bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
              >
                {submitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Criando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Confirmar Reserva
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default NewReservationDialog;
