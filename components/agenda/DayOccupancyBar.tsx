import React from 'react';

interface DayOccupancyBarProps {
  percent: number;
}

// Componente compacto de ocupação: mostra apenas % com cor
export const DayOccupancyBar = React.memo(function DayOccupancyBar({ percent }: DayOccupancyBarProps) {
  let textColor = 'text-green-600';
  let bgColor = 'bg-green-50';
  if (percent >= 80) {
    textColor = 'text-red-600';
    bgColor = 'bg-red-50';
  } else if (percent >= 50) {
    textColor = 'text-yellow-600';
    bgColor = 'bg-yellow-50';
  }

  // Versão compacta para header do calendário: só mostra % se > 0
  if (percent === 0) return null;
  
  return (
    <div className={`${bgColor} ${textColor} px-1.5 py-0.5 rounded text-[10px] font-bold tabular-nums`}>
      {percent}%
    </div>
  );
});
