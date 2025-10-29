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
    <div className="w-full space-y-0.5">
      <div className="relative w-full h-3 rounded-full bg-gray-200 overflow-hidden shadow-inner">
        <div
          className={`${color} h-full rounded-full transition-all duration-300 ease-in-out`}
          style={{ width: `${percent}%` }}
          aria-label={`Ocupação: ${percent}%`}
        />
      </div>
      <div className={`text-[10px] font-semibold text-center ${textColor}`}>
        {percent}%
      </div>
    </div>
  );
});
