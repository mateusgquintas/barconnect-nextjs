import React from 'react';

interface DayOccupancyBarProps {
  percent: number;
}

// Barra visual de ocupação: verde (<50%), amarelo (50-80%), vermelho (>80%)
export function DayOccupancyBar({ percent }: DayOccupancyBarProps) {
  let color = 'bg-green-500';
  if (percent >= 80) color = 'bg-red-500';
  else if (percent >= 50) color = 'bg-yellow-400';

  return (
    <div className="w-full h-2 rounded bg-gray-200">
      <div
        className={color + ' h-2 rounded'}
        style={{ width: `${percent}%`, transition: 'width 0.3s' }}
        aria-label={`Ocupação: ${percent}%`}
      />
    </div>
  );
}
