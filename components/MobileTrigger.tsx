'use client'

import { useSidePanels } from '@/contexts/SidePanelsContext';

interface MobileTriggerProps {
  side: 'left' | 'right';
}

export function MobileTrigger({ side }: MobileTriggerProps) {
  const {
    openLeftPanel,
    openRightPanel,
    canOpenRightPanel,
  } = useSidePanels();

  const handleTouchStart = (e: React.TouchEvent) => {
    // Detectar swipe da borda
    const touch = e.touches[0];
    const screenWidth = window.innerWidth;
      const edgeThreshold = 40; // 40px da borda

    if (side === 'left' && touch.clientX <= edgeThreshold) {
      openLeftPanel();
    } else if (side === 'right' && canOpenRightPanel && touch.clientX >= screenWidth - edgeThreshold) {
      openRightPanel();
    }
  };

  return (
    <div
      className={`
        lg:hidden fixed top-16 z-20 touch-none
        ${side === 'left' ? 'left-0' : 'right-0'}
        ${side === 'right' && !canOpenRightPanel ? 'pointer-events-none' : ''}
      `}
      style={{ width: '40px', height: 'calc(100vh - 64px)' }}
      onTouchStart={handleTouchStart}
    />
  );
}