import React from 'react';

interface DayOccupancyBarProps {
  percent: number;
}

// Barra visual de ocupação: verde (<50%), amarelo (50-80%), vermelho (>80%)
export const DayOccupancyBar = React.memo(function DayOccupancyBar({ percent }: DayOccupancyBarProps) {
  let color = 'bg-green-500';
  let textColor = 'text-green-700';
  if (percent >= 80) {
    color = 'bg-red-500';
    textColor = 'text-red-700';
  } else if (percent >= 50) {
    color = 'bg-yellow-400';
    textColor = 'text-yellow-700';
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`${color} h-full rounded-full transition-all duration-300 ease-in-out`}
          style={{ width: `${percent}%` }}
          aria-label={`Ocupação: ${percent}%`}
        />
      </div>
      <div className={`text-xs font-bold ${textColor} min-w-[32px] text-right tabular-nums`}>
        {percent}%
      </div>
    </div>
  );
});
