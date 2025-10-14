'use client'

import { useSidePanels } from '@/contexts/SidePanelsContext';

interface HoverZoneProps {
  side: 'left' | 'right';
}

export function HoverZone({ side }: HoverZoneProps) {
  const {
    setLeftPanelHover,
    setRightPanelHover,
    openLeftPanel,
    openRightPanel,
    canOpenRightPanel,
  } = useSidePanels();

  const handleMouseEnter = () => {
    if (side === 'left') {
      setLeftPanelHover(true);
      // Pequeno delay antes de abrir completamente
      setTimeout(() => openLeftPanel(), 100);
    } else if (side === 'right' && canOpenRightPanel) {
      setRightPanelHover(true);
      setTimeout(() => openRightPanel(), 100);
    }
  };

  const handleMouseLeave = () => {
    if (side === 'left') {
      // Delay para permitir mover o mouse para o painel
      setTimeout(() => setLeftPanelHover(false), 200);
    } else if (side === 'right') {
      setTimeout(() => setRightPanelHover(false), 200);
    }
  };

  return (
    <div
      className={`
        hidden lg:block fixed top-16 z-30
        ${side === 'left' ? 'left-0' : 'right-0'}
        ${side === 'right' && !canOpenRightPanel ? 'pointer-events-none' : ''}
      `}
        style={{ width: '80px', height: 'calc(100vh - 64px)' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Visual indicator on hover */}
      <div
        className={`
          h-full w-full transition-all duration-200
          ${side === 'left' 
            ? 'bg-gradient-to-r from-blue-500/20 to-transparent' 
            : 'bg-gradient-to-l from-blue-500/20 to-transparent'
          }
          opacity-0 hover:opacity-100
        `}
      />
    </div>
  );
}

interface SidePanelHoverHandlerProps {
  side: 'left' | 'right';
  children: React.ReactNode;
}

export function SidePanelHoverHandler({ side, children }: SidePanelHoverHandlerProps) {
  const {
    setLeftPanelHover,
    setRightPanelHover,
    closeLeftPanel,
    closeRightPanel,
  } = useSidePanels();

  const handleMouseEnter = () => {
    if (side === 'left') {
      setLeftPanelHover(true);
    } else {
      setRightPanelHover(true);
    }
  };

  const handleMouseLeave = () => {
    // Delay para permitir movimento entre elementos
    setTimeout(() => {
      if (side === 'left') {
        setLeftPanelHover(false);
        setTimeout(() => closeLeftPanel(), 200);
      } else {
        setRightPanelHover(false);
        setTimeout(() => closeRightPanel(), 200);
      }
    }, 100);
  };

  return (
    <div 
      className="hidden lg:block h-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}