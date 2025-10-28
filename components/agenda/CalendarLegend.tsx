'use client'
import React from 'react';
import { Hotel, Bus } from 'lucide-react';

const statusInfo = [
  { status: 'pending', label: 'Pendente', bgColor: 'bg-amber-50', borderColor: 'border-amber-400', textColor: 'text-amber-900' },
  { status: 'confirmed', label: 'Confirmada', bgColor: 'bg-blue-50', borderColor: 'border-blue-500', textColor: 'text-blue-900' },
  { status: 'checked_in', label: 'Check-in', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-500', textColor: 'text-emerald-900' },
  { status: 'checked_out', label: 'Check-out', bgColor: 'bg-slate-100', borderColor: 'border-slate-400', textColor: 'text-slate-700' },
  { status: 'cancelled', label: 'Cancelada', bgColor: 'bg-rose-50', borderColor: 'border-rose-400', textColor: 'text-rose-900' },
];

export function CalendarLegend() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex flex-wrap gap-6 items-center">
        <span className="font-semibold text-gray-700 text-sm">Status das Reservas:</span>
        
        <div className="flex flex-wrap gap-4">
          {statusInfo.map(({ status, label, bgColor, borderColor, textColor }) => (
            <div key={status} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${bgColor} border-l-2 ${borderColor} shadow-sm`}></div>
              <span className={`text-sm font-medium ${textColor}`}>{label}</span>
            </div>
          ))}
        </div>
        
        <div className="flex items-center gap-4 ml-auto border-l border-gray-300 pl-6">
          <div className="flex items-center gap-1.5">
            <Hotel className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Individual</span>
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
