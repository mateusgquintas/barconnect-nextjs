'use client'

import { createContext, useContext, useState, ReactNode } from 'react';

interface SidePanelsContextType {
  // Estados dos painéis
  isLeftPanelOpen: boolean;
  isRightPanelOpen: boolean;
  
  // Controles dos painéis
  openLeftPanel: () => void;
  closeLeftPanel: () => void;
  toggleLeftPanel: () => void;
  
  openRightPanel: () => void;
  closeRightPanel: () => void;
  toggleRightPanel: () => void;
  
  // Estado para decidir se o painel direito pode abrir
  canOpenRightPanel: boolean;
  setCanOpenRightPanel: (canOpen: boolean) => void;
  
  // Controle de hover (desktop)
  leftPanelHover: boolean;
  setLeftPanelHover: (hover: boolean) => void;
  rightPanelHover: boolean;
  setRightPanelHover: (hover: boolean) => void;
}

const SidePanelsContext = createContext<SidePanelsContextType | null>(null);

export function SidePanelsProvider({ children }: { children: ReactNode }) {
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [canOpenRightPanel, setCanOpenRightPanel] = useState(false);
  const [leftPanelHover, setLeftPanelHover] = useState(false);
  const [rightPanelHover, setRightPanelHover] = useState(false);

  const openLeftPanel = () => setIsLeftPanelOpen(true);
  const closeLeftPanel = () => setIsLeftPanelOpen(false);
  const toggleLeftPanel = () => setIsLeftPanelOpen(prev => !prev);

  const openRightPanel = () => {
    if (canOpenRightPanel) {
      setIsRightPanelOpen(true);
    }
  };
  const closeRightPanel = () => setIsRightPanelOpen(false);
  const toggleRightPanel = () => {
    if (canOpenRightPanel) {
      setIsRightPanelOpen(prev => !prev);
    }
  };

  return (
    <SidePanelsContext.Provider
      value={{
        isLeftPanelOpen,
        isRightPanelOpen,
        openLeftPanel,
        closeLeftPanel,
        toggleLeftPanel,
        openRightPanel,
        closeRightPanel,
        toggleRightPanel,
        canOpenRightPanel,
        setCanOpenRightPanel,
        leftPanelHover,
        setLeftPanelHover,
        rightPanelHover,
        setRightPanelHover,
      }}
    >
      {children}
    </SidePanelsContext.Provider>
  );
}

export function useSidePanels() {
  const context = useContext(SidePanelsContext);
  if (!context) {
    throw new Error('useSidePanels must be used within a SidePanelsProvider');
  }
  return context;
}