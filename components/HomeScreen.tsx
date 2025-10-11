'use client'

import React, { memo, useCallback } from 'react';
import { Receipt, ShoppingCart } from 'lucide-react';
import PWAStatusCard from './PWAStatusCard';

interface ActionButtonProps {
  icon: React.ElementType;
  title: string;
  description: string;
  onClick: () => void;
  ariaLabel: string;
  variant: 'primary' | 'secondary';
}

const ActionButton = memo<ActionButtonProps>(({ 
  icon: Icon, 
  title, 
  description, 
  onClick, 
  ariaLabel, 
  variant 
}) => {
  const bgClass = variant === 'primary' ? 'bg-primary' : 'bg-secondary';
  
  return (
    <button 
      className="bg-card text-card-foreground rounded-xl border p-8 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
      onClick={onClick}
      aria-label={ariaLabel}
      type="button"
      style={{ minHeight: 60, minWidth: 120, width: 160 }}
    >
      <div className="flex flex-col items-center gap-4">
        <div className={`w-20 h-20 rounded-full ${bgClass} flex items-center justify-center`}>
          <Icon className="w-10 h-10 text-primary-foreground" />
        </div>
        <div className="text-center">
          <h2 className="mb-2">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
    </button>
  );
});

ActionButton.displayName = 'ActionButton';

interface HomeScreenProps {
  onOpenComanda: () => void;
  onDirectOrder: () => void;
}

export const HomeScreen = memo<HomeScreenProps>(({ onOpenComanda, onDirectOrder }) => {
  // Memoize callbacks to prevent unnecessary re-renders
  const handleOpenComanda = useCallback(() => {
    onOpenComanda();
  }, [onOpenComanda]);
  
  const handleDirectOrder = useCallback(() => {
    onDirectOrder();
  }, [onDirectOrder]);

  return (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex flex-col" data-testid="main-container">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">
        <header className="text-center mb-12 mt-8">
          <h1 className="text-4xl mb-2">PDV Bar</h1>
          <p className="text-muted-foreground">Sistema de Ponto de Venda</p>
        </header>

        <main className="flex-1 flex flex-col gap-6 justify-center pb-20">
          <ActionButton
            icon={Receipt}
            title="Abrir Comanda"
            description="Criar uma nova comanda para o cliente"
            onClick={handleOpenComanda}
            ariaLabel="Abrir nova comanda para cliente"
            variant="primary"
          />

          <ActionButton
            icon={ShoppingCart}
            title="Pedido Direto"
            description="Registrar um pedido sem comanda"
            onClick={handleDirectOrder}
            ariaLabel="Registrar pedido direto sem comanda"
            variant="secondary"
          />

          {/* PWA Status Card */}
          <div className="mt-8">
            <PWAStatusCard />
          </div>
        </main>
      </div>
    </div>
  );
});

HomeScreen.displayName = 'HomeScreen';