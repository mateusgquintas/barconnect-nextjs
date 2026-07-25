'use client'

import { useEffect, useState } from 'react';
import { useRoomsDB, Room } from './useRoomsDB';
import { listBookingsInRange } from '@/lib/agendaService';
import { Booking } from '@/types/agenda';

export type OperationalStatus = 'available' | 'reserved' | 'occupied' | 'cleaning' | 'maintenance';

/**
 * Fonte única de status operacional dos quartos, compartilhada entre a Agenda, o Mapa de
 * Reservas e o Quadro de Situação dos Quartos — todos lêem a mesma tabela `rooms` +
 * `room_reservations`, então uma mudança em qualquer tela aparece nas outras ao recarregar.
 */
export function useRoomOperationalStatus() {
  const { rooms, loading: roomsLoading, error, updateRoom, addRoom } = useRoomsDB();
  const [bookingOccupiedTodayIds, setBookingOccupiedTodayIds] = useState<Set<string>>(new Set());
  const [reservedRoomIds, setReservedRoomIds] = useState<Set<string>>(new Set());
  const [nextCheckInByRoom, setNextCheckInByRoom] = useState<Record<string, string>>({});
  // Reserva que está ocupando o quarto agora (para o check-out saber qual room_reservations
  // encerrar), indexado por room_id.
  const [activeBookingByRoom, setActiveBookingByRoom] = useState<Record<string, string>>({});
  // Próxima reserva futura do quarto (para "Cancelar Reserva" saber qual room_reservations
  // encerrar), indexado por room_id.
  const [reservedBookingByRoom, setReservedBookingByRoom] = useState<Record<string, string>>({});
  // A reserva "vencedora" (ativa agora, ou a próxima futura) de cada quarto, para exibir
  // direto na listagem quem é o hóspede/romaria sem precisar abrir detalhes.
  const [bookingInfoByRoom, setBookingInfoByRoom] = useState<Record<string, Booking>>({});
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    async function calculate() {
      if (rooms.length === 0) return;
      setLoadingBookings(true);
      try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const farFuture = new Date(todayStart);
        farFuture.setFullYear(farFuture.getFullYear() + 2);
        // Busca também para trás: uma reserva cujo check-out previsto já passou mas que
        // ainda não teve o check-out real registrado continua ocupando o quarto.
        const farPast = new Date(todayStart);
        farPast.setFullYear(farPast.getFullYear() - 1);

        const bookings = await listBookingsInRange({ start: farPast, end: farFuture });

        const occupiedToday = new Set<string>();
        const upcomingReserved = new Set<string>();
        const nextCheckIn: Record<string, string> = {};
        const activeBooking: Record<string, string> = {};
        const reservedBooking: Record<string, string> = {};
        const bookingInfo: Record<string, Booking> = {};

        rooms.forEach(room => {
          const roomBookings = bookings.filter(b => b.room_id === room.id);
          if (roomBookings.length === 0) return;

          // Uma reserva ocupa o quarto "hoje" desde o check-in até ser efetivamente encerrada
          // (status checked_out/cancelled/no_show), independente da data de check-out prevista
          // já ter passado — hóspede pode sair antes ou depois do previsto, e o botão de
          // check-out precisa continuar disponível até esse encerramento real acontecer.
          const closedStatuses = ['checked_out', 'cancelled', 'no_show'];
          const startedBookings = roomBookings.filter(b =>
            new Date(b.start).getTime() <= todayStart.getTime() && !closedStatuses.includes(String(b.status))
          );
          const isOccupiedToday = startedBookings.length > 0;
          if (isOccupiedToday) {
            occupiedToday.add(room.id);
            // Se houver mais de uma (não deveria), usa a mais recente como a "ativa".
            const active = startedBookings.reduce((latest, b) => (new Date(b.start) > new Date(latest.start) ? b : latest));
            activeBooking[room.id] = active.id;
            bookingInfo[room.id] = active;
          }

          const futureBookings = roomBookings.filter(b =>
            new Date(b.start).getTime() > todayStart.getTime() && !closedStatuses.includes(String(b.status))
          );
          if (futureBookings.length > 0) {
            const earliest = futureBookings.reduce((min, b) => (new Date(b.start) < new Date(min.start) ? b : min));
            nextCheckIn[room.id] = earliest.start;
            if (!isOccupiedToday) {
              upcomingReserved.add(room.id);
              reservedBooking[room.id] = earliest.id;
              bookingInfo[room.id] = earliest;
            }
          }
        });

        setBookingOccupiedTodayIds(occupiedToday);
        setReservedRoomIds(upcomingReserved);
        setNextCheckInByRoom(nextCheckIn);
        setActiveBookingByRoom(activeBooking);
        setReservedBookingByRoom(reservedBooking);
        setBookingInfoByRoom(bookingInfo);
      } catch (err) {
        console.error('Erro ao calcular status operacional dos quartos:', err);
      } finally {
        setLoadingBookings(false);
      }
    }
    calculate();
  }, [rooms]);

  const getEffectiveStatus = (room: Room): OperationalStatus => {
    if (room.status === 'cleaning' || room.status === 'maintenance' || room.status === 'occupied') {
      return room.status as OperationalStatus;
    }
    if (bookingOccupiedTodayIds.has(room.id)) return 'occupied';
    if (reservedRoomIds.has(room.id)) return 'reserved';
    return (room.status as OperationalStatus) || 'available';
  };

  return {
    rooms,
    loading: roomsLoading || loadingBookings,
    error,
    updateRoom,
    addRoom,
    getEffectiveStatus,
    nextCheckInByRoom,
    activeBookingByRoom,
    reservedBookingByRoom,
    bookingInfoByRoom,
  };
}
