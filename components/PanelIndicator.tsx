'use client'

interface PanelIndicatorProps {
  side: 'left' | 'right';
  isActive: boolean;
  isVisible: boolean;
}

export function PanelIndicator({ side, isActive, isVisible }: PanelIndicatorProps) {
  if (!isVisible) return null;

  return (
    <div
      className={`
        fixed ${side === 'left' ? 'left-0' : 'right-0'} top-1/2 -translate-y-1/2 z-50
        w-1 h-12 rounded-r-lg transition-all duration-300
        ${isActive 
          ? 'bg-blue-500 shadow-lg' 
          : 'bg-blue-300 opacity-60 hover:opacity-80'
        }
        ${side === 'right' ? 'rounded-l-lg rounded-r-none' : ''}
      `}
    >
      {/* Pequena animação pulsante quando ativo */}
      {isActive && (
        <div 
          className={`
            absolute ${side === 'left' ? '-right-1' : '-left-1'} top-0 
            w-3 h-12 bg-blue-400 rounded-r-lg opacity-50 animate-pulse
            ${side === 'right' ? 'rounded-l-lg rounded-r-none' : ''}
          `}
        />
      )}
    </div>
  );
}