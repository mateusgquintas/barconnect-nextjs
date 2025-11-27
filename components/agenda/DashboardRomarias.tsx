'use client'
import React from 'react';
import { Bus, Users, TrendingUp, Calendar, Percent } from 'lucide-react';
import { Pilgrimage as PilgrimageType } from '@/types';

interface RoomReservation {
  id: string;
  room_id: string;
  pilgrimage_id?: string;
  check_in_date: string;
  check_out_date: string;
  status: string;
}

interface Props {
  month: Date;
  reservations: RoomReservation[];
  pilgrimages: PilgrimageType[];
  totalRooms: number;
}

// Helper para pegar datas de uma romaria (compatível com occurrences)
const getPilgrimageDates = (p: PilgrimageType) => {
  const arrivalDate = p.arrivalDate || p.occurrences?.[0]?.arrivalDate;
  const departureDate = p.departureDate || p.occurrences?.[0]?.departureDate;
  return { arrivalDate, departureDate };
};

export function DashboardRomarias({ month, reservations, pilgrimages, totalRooms }: Props) {
  // Filtrar romarias ativas no mês
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
  const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59);
  
  const activePilgrimages = pilgrimages.filter(p => {
    const { arrivalDate, departureDate } = getPilgrimageDates(p);
    if (!arrivalDate || !departureDate) return false;
    if (p.status === 'cancelled') return false;
    const arrival = new Date(arrivalDate);
    const departure = new Date(departureDate);
    return arrival <= monthEnd && departure >= monthStart;
  });

  // Calcular estatísticas
  const totalPilgrimages = activePilgrimages.length;
  const totalPeople = activePilgrimages.reduce((sum, p) => sum + (p.numberOfPeople || 0), 0);
  
  // Contar quartos ocupados por romarias
  const pilgrimageRoomIds = new Set(
    reservations
      .filter(r => r.pilgrimage_id && r.status !== 'cancelled')
      .map(r => r.room_id)
  );
  const roomsOccupiedByPilgrimages = pilgrimageRoomIds.size;
  
  // Taxa média de ocupação no mês
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  let totalOccupancy = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const occupied = reservations.filter(r => {
      return r.status !== 'cancelled' && r.check_in_date <= dateStr && r.check_out_date > dateStr;
    }).length;
    totalOccupancy += (occupied / totalRooms) * 100;
  }
  const avgOccupancy = Math.round(totalOccupancy / daysInMonth);

  // Pico de ocupação (dia com maior ocupação)
  let peakDay = '';
  let peakOccupancy = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const occupied = reservations.filter(r => {
      return r.status !== 'cancelled' && r.check_in_date <= dateStr && r.check_out_date > dateStr;
    }).length;
    const occupancyPercent = (occupied / totalRooms) * 100;
    if (occupancyPercent > peakOccupancy) {
      peakOccupancy = occupancyPercent;
      peakDay = new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Card 1: Total de Romarias */}
      <div className="bg-white rounded-lg shadow-sm border-2 border-blue-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Bus className="w-6 h-6 text-blue-600" />
          </div>
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
            ROMARIAS
          </span>
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">{totalPilgrimages}</div>
        <div className="text-sm text-gray-600">Grupos de ônibus no mês</div>
      </div>

      {/* Card 2: Total de Pessoas */}
      <div className="bg-white rounded-lg shadow-sm border-2 border-emerald-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Users className="w-6 h-6 text-emerald-600" />
          </div>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
            PESSOAS
          </span>
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">{totalPeople}</div>
        <div className="text-sm text-gray-600">
          {totalPilgrimages > 0 ? `Média ${Math.round(totalPeople / totalPilgrimages)} por grupo` : 'Nenhum grupo'}
        </div>
      </div>

      {/* Card 3: Taxa Média de Ocupação */}
      <div className="bg-white rounded-lg shadow-sm border-2 border-amber-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Percent className="w-6 h-6 text-amber-600" />
          </div>
          <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded">
            OCUPAÇÃO
          </span>
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">{avgOccupancy}%</div>
        <div className="text-sm text-gray-600">Taxa média mensal</div>
      </div>

      {/* Card 4: Pico de Ocupação */}
      <div className="bg-white rounded-lg shadow-sm border-2 border-rose-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-rose-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-rose-600" />
          </div>
          <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-1 rounded">
            PICO
          </span>
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">{Math.round(peakOccupancy)}%</div>
        <div className="text-sm text-gray-600">
          {peakDay ? `Dia ${peakDay}` : 'Sem pico registrado'}
        </div>
      </div>
    </div>
  );
}
