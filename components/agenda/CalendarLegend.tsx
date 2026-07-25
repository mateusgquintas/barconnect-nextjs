'use client'
import React from 'react';
import { Hotel, Bus } from 'lucide-react';

// Mesmo padrão de cores usado nos chips do calendário (ver getChipStyle em MonthlyCalendar):
// pendente é sempre âmbar e cancelada é sempre vermelha, independente do tipo; confirmada é
// quem carrega a distinção de tipo (verde = romaria, azul = avulso).
const statusInfo = [
  { label: 'Pendente', bgColor: 'bg-amber-50', borderColor: 'border-amber-400', textColor: 'text-amber-900' },
  { label: 'Confirmada (Romaria)', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-500', textColor: 'text-emerald-900' },
  { label: 'Confirmada (Avulso)', bgColor: 'bg-blue-50', borderColor: 'border-blue-500', textColor: 'text-blue-900' },
  { label: 'Cancelada', bgColor: 'bg-red-50', borderColor: 'border-red-400', textColor: 'text-red-900' },
];

export function CalendarLegend() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex flex-wrap gap-6 items-center">
        <span className="font-semibold text-gray-700 text-sm">Status das Reservas:</span>

        <div className="flex flex-wrap gap-4">
          {statusInfo.map(({ label, bgColor, borderColor, textColor }) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${bgColor} border-l-2 ${borderColor} shadow-sm`}></div>
              <span className={`text-sm font-medium ${textColor}`}>{label}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 ml-auto border-l border-gray-300 pl-6">
          <div className="flex items-center gap-1.5">
            <Hotel className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Avulso</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bus className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Romaria/Ônibus</span>
          </div>
        </div>
      </div>
    </div>
  );
}
