'use client'

import { ReactNode, useEffect, useState } from 'react';
import { Drawer } from 'vaul';
import { useSidePanels } from '@/contexts/SidePanelsContext';

interface ResponsiveDrawerProps {
  side: 'left' | 'right';
  children: ReactNode;
  title?: string;
}

export function ResponsiveDrawer({ side, children, title }: ResponsiveDrawerProps) {
  const {
    isLeftPanelOpen,
    isRightPanelOpen,
    closeLeftPanel,
    closeRightPanel,
    leftPanelHover,
    rightPanelHover,
    canOpenRightPanel,
  } = useSidePanels();

  const isOpen = side === 'left' ? isLeftPanelOpen : isRightPanelOpen;
  const onClose = side === 'left' ? closeLeftPanel : closeRightPanel;
  const isHovered = side === 'left' ? leftPanelHover : rightPanelHover;

  // Detect desktop to avoid mounting mobile drawer simultaneously
  const [isDesktop, setIsDesktop] = useState(() => (typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)').matches : false));
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)');
    const handler = () => setIsDesktop(mql.matches);
    handler();
    mql.addEventListener?.('change', handler);
    return () => mql.removeEventListener?.('change', handler);
  }, []);

  // Fechar painel direito automaticamente se não pode mais abrir
  useEffect(() => {
    if (side === 'right' && !canOpenRightPanel && isRightPanelOpen) {
      closeRightPanel();
    }
  }, [side, canOpenRightPanel, isRightPanelOpen, closeRightPanel]);

  return (
    <>
      {/* Desktop: CSS-based hover sidebar */}
      {isDesktop && (
      <div>
        <div
          className={`
            fixed ${side === 'left' ? 'left-0' : 'right-0'} top-16 z-40
            transition-transform duration-200 ease-out
            ${isHovered || isOpen
              ? 'translate-x-0'
              : side === 'left'
                ? '-translate-x-[308px]'
                : 'translate-x-[308px]'
            }
            ${side === 'right' && !canOpenRightPanel ? 'pointer-events-none opacity-50' : ''}
          `}
          style={{ width: '320px', height: 'calc(100vh - 64px)' }}
        >
          <div className="h-full bg-white shadow-lg flex flex-col">
            {/* Header */}
            {title && (
              <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex-shrink-0">
                <h3 className="font-medium text-slate-900">{title}</h3>
              </div>
            )}
            
            {/* Content */}
            <div className="flex-1 overflow-hidden min-h-0">
              {children}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Mobile/Tablet: Vaul Drawer */}
      {!isDesktop && (
      <div>
        <Drawer.Root
          direction={side}
          open={isOpen}
          onOpenChange={(open) => !open && onClose()}
          shouldScaleBackground={false}
        >
          <Drawer.Portal>
            <Drawer.Overlay className="fixed left-0 right-0 top-16 bottom-0 bg-black/60 z-40" />
            <Drawer.Content
              className={`
                fixed ${side === 'left' ? 'left-0' : 'right-0'} top-16 bottom-0 z-50
                w-80 max-w-[85vw] bg-white flex flex-col outline-none
                ${side === 'right' && !canOpenRightPanel ? 'pointer-events-none opacity-50' : ''}
              `}
            >
              {/* Header com handle para mobile */}
              <div className="p-4 border-b border-slate-200 flex-shrink-0">
                <div className="flex items-center justify-between">
                  {title && (
                    <Drawer.Title className="font-medium text-slate-900">
                      {title}
                    </Drawer.Title>
                  )}
                  <Drawer.Close className="p-2 text-slate-500 hover:text-slate-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Drawer.Close>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden min-h-0">
                {children}
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      </div>
      )}
    </>
  );
}