import React from 'react';

interface DayOccupancyBarProps {
  percent: number;
  occupied?: number;
  total?: number;
}

// Barra de ocupação INLINE (para usar no header junto com outras infos)
export const DayOccupancyBar = React.memo(function DayOccupancyBar({ percent, occupied, total }: DayOccupancyBarProps) {
  let barColor = 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-green-500';
  let bgColor = 'bg-gradient-to-r from-emerald-50 to-green-50';
  let textColor = 'text-emerald-700';
  let shadowColor = 'shadow-sm shadow-emerald-300/50';
  
  if (percent >= 80) {
    barColor = 'bg-gradient-to-r from-rose-500 via-red-500 to-red-600';
    bgColor = 'bg-gradient-to-r from-rose-50 to-red-50';
    textColor = 'text-red-700';
    shadowColor = 'shadow-sm shadow-red-300/50';
  } else if (percent >= 50) {
    barColor = 'bg-gradient-to-r from-amber-400 via-yellow-400 to-yellow-500';
    bgColor = 'bg-gradient-to-r from-amber-50 to-yellow-50';
    textColor = 'text-yellow-700';
    shadowColor = 'shadow-sm shadow-yellow-300/50';
  }

  // Não mostra se 0%
  if (percent === 0) return null;
  
  return (
    <div className="flex items-center gap-1.5 flex-1 min-w-0">
      {/* Barra de progresso VIBRANTE */}
      <div className={`relative h-2.5 flex-1 rounded-full ${bgColor} overflow-hidden border-2 border-white/80 ${shadowColor}`}>
        <div
          className={`absolute inset-y-0 left-0 ${barColor} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${percent}%` }}
          title={`Ocupação: ${percent}%`}
        >
          {/* Efeito de brilho 3D superior */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/20 to-transparent" />
          {/* Pulso sutil para mais destaque */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
        </div>
      </div>
      
      {/* Porcentagem após a barra */}
      <div className={`text-[10px] font-extrabold ${textColor} tabular-nums whitespace-nowrap`}>
        {percent}%
      </div>
    </div>
  );
});
