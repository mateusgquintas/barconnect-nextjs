'use client'

import { useEffect } from 'react';
import { useSidePanels } from '@/contexts/SidePanelsContext';
import { ResponsiveDrawer } from '@/components/ResponsiveDrawer';
import { HoverZone, SidePanelHoverHandler } from '@/components/HoverZone';
import { MobileTrigger } from '@/components/MobileTrigger';
import { PanelIndicator } from '@/components/PanelIndicator';
import { ComandaSidebar } from '@/components/ComandaSidebar';
import { ComandaDetail } from '@/components/ComandaDetail';
import { Button } from '@/components/ui/button';
import ProductCatalog from '@/components/ProductCatalog';
import { Comanda, OrderItem } from '@/types';
import { UserRole } from '@/types/user';

interface PDVLayoutProps {
  // Comandas props
  comandas: Comanda[];
  selectedComandaId: string | null;
  onSelectComanda: (comanda: Comanda) => void;
  onCloseComanda: (comandaId: string) => void;
  userRole: UserRole;

  // Venda direta props  
  isDirectSale: boolean;
  directSaleItems: OrderItem[];
  onRemoveDirectSaleItem: (productId: string) => void;
  onUpdateDirectSaleQuantity: (productId: string, quantity: number) => void;
  onFinalizeSale: () => void;
  onCancelDirectSale: () => void;

  // Product catalog props
  onAddProduct: (product: any) => void;
  currentView: string;

  // Comanda detail props
  selectedComanda: Comanda | null;
  onRemoveItemFromComanda: (productId: string) => void;
  onCheckout: () => void;
}

export function PDVLayout({
  comandas,
  selectedComandaId,
  onSelectComanda,
  onCloseComanda,
  userRole,
  isDirectSale,
  directSaleItems,
  onRemoveDirectSaleItem,
  onUpdateDirectSaleQuantity,
  onFinalizeSale,
  onCancelDirectSale,
  onAddProduct,
  currentView,
  selectedComanda,
  onRemoveItemFromComanda,
  onCheckout,
}: PDVLayoutProps) {
  const { 
    setCanOpenRightPanel, 
    isRightPanelFixed, 
    setRightPanelFixed,
    isLeftPanelOpen,
    isRightPanelOpen 
  } = useSidePanels();

  // Atualizar se o painel direito pode abrir baseado no estado atual
  useEffect(() => {
    const canOpen = isDirectSale || selectedComandaId !== null;
    setCanOpenRightPanel(canOpen);
    
    // Abrir painel fixo automaticamente quando há comanda/venda
    if (canOpen) {
      setRightPanelFixed(true);
    }
  }, [isDirectSale, selectedComandaId, setCanOpenRightPanel, setRightPanelFixed]);

  const hasRightPanelContent = isDirectSale || selectedComandaId !== null;

  return (
    <div className="flex-1 flex overflow-hidden min-h-0 relative">
      {/* Indicadores visuais dos painéis */}
      <PanelIndicator 
        side="left" 
        isActive={isLeftPanelOpen} 
        isVisible={!isLeftPanelOpen && comandas.length > 0} 
      />
      <PanelIndicator 
        side="right" 
        isActive={isRightPanelOpen || isRightPanelFixed} 
        isVisible={!isRightPanelFixed && hasRightPanelContent && !isRightPanelOpen} 
      />

      {/* Hot zones para desktop - só esquerda se painel direito estiver fixo */}
      <HoverZone side="left" />
      {!isRightPanelFixed && <HoverZone side="right" />}

      {/* Triggers para mobile */}
      <MobileTrigger side="left" />
      {!isRightPanelFixed && <MobileTrigger side="right" />}

      {/* Painel esquerdo: Comandas */}
      <ResponsiveDrawer side="left" title="Comandas Abertas">
        <SidePanelHoverHandler side="left">
          <ComandaSidebar
            comandas={comandas}
            selectedComandaId={selectedComandaId}
            onSelectComanda={onSelectComanda}
            onCloseComanda={onCloseComanda}
            userRole={userRole}
          />
        </SidePanelHoverHandler>
      </ResponsiveDrawer>

      {/* Área central: Catálogo de produtos */}
      <div className="flex-1 bg-white overflow-hidden min-h-0">
        <ProductCatalog onAddProduct={onAddProduct} currentView={currentView} />
      </div>

      {/* Painel direito: Fixo quando há conteúdo */}
      {isRightPanelFixed && hasRightPanelContent ? (
  <div className="w-80 bg-white border-l border-slate-200 shadow-lg flex-shrink-0 flex flex-col relative">
          {/* Botão para esconder painel */}
          <div className="absolute top-2 left-2 z-10">
            <button
              onClick={() => setRightPanelFixed(false)}
              className="p-1 bg-white border border-slate-200 rounded-md shadow-sm hover:bg-slate-50"
              title="Esconder painel"
            >
              <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex-shrink-0">
            <h3 className="font-medium text-slate-900 pl-8">
              {isDirectSale ? "Venda Direta" : selectedComanda ? `Comanda #${selectedComanda.number}` : "Itens"}
            </h3>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-hidden min-h-0">
            {isDirectSale ? (
              <DirectSalePanel 
                items={directSaleItems}
                onRemoveItem={onRemoveDirectSaleItem}
                onUpdateQuantity={onUpdateDirectSaleQuantity}
                onFinalize={onFinalizeSale}
                onCancel={onCancelDirectSale}
              />
            ) : selectedComanda ? (
              <ComandaDetail
                comanda={selectedComanda}
                onRemoveItem={onRemoveItemFromComanda}
                onCheckout={onCheckout}
                userRole={userRole}
              />
            ) : (
              <EmptyPanel />
            )}
          </div>
        </div>
      ) : (
        // Painel direito responsivo (quando não fixo)
        <ResponsiveDrawer 
          side="right" 
          title={isDirectSale ? "Venda Direta" : selectedComanda ? `Comanda #${selectedComanda.number}` : "Itens"}
        >
          <SidePanelHoverHandler side="right">
            {isDirectSale ? (
              <DirectSalePanel 
                items={directSaleItems}
                onRemoveItem={onRemoveDirectSaleItem}
                onUpdateQuantity={onUpdateDirectSaleQuantity}
                onFinalize={onFinalizeSale}
                onCancel={onCancelDirectSale}
              />
            ) : selectedComanda ? (
              <ComandaDetail
                comanda={selectedComanda}
                onRemoveItem={onRemoveItemFromComanda}
                onCheckout={onCheckout}
                userRole={userRole}
              />
            ) : (
              <EmptyPanel />
            )}
          </SidePanelHoverHandler>
        </ResponsiveDrawer>
      )}
    </div>
  );
}

// Componente para venda direta
function DirectSalePanel({
  items,
  onRemoveItem,
  onUpdateQuantity,
  onFinalize,
  onCancel,
}: {
  items: OrderItem[];
  onRemoveItem: (productId: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onFinalize: () => void;
  onCancel: () => void;
}) {
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="flex flex-col h-full w-full px-2">
      <div className="w-full flex flex-col h-full">
        {/* Header simples */}
        <div className="px-2 py-4 border-b border-slate-200 flex-shrink-0">
          <div>
            <h2 className="text-slate-900">Venda Direta</h2>
            <p className="text-sm text-slate-500 mt-1">{items.length} item(ns)</p>
          </div>
        </div>

        {/* Lista de itens */}
        <div className="flex-1 overflow-y-auto px-2 py-4 min-h-0">
          {items.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p>Nenhum item adicionado</p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.product.id} className="p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-slate-600 text-sm mb-1">
                        {item.quantity}x {item.product.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-slate-900">R$ {(item.product.price * item.quantity).toFixed(2)}</p>
                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions - igual ao botão da comanda */}
        {items.length > 0 && (
          <div className="border-t bg-white/80 backdrop-blur pt-4 space-y-4 pb-4">
            <div className="flex items-center justify-between px-2">
              <h3>Total</h3>
              <p className="text-3xl">R$ {total.toFixed(2)}</p>
            </div>
            <button
              onClick={onFinalize}
              className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors"
            >
              Finalizar Venda - R$ {total.toFixed(2)}
            </button>
          </div>
        )}
        {/* Botão cancelar sempre visível */}
        <div className="px-2 pb-4">
          <button
            onClick={onCancel}
            className="w-full h-10 text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// Componente para quando nenhuma comanda está selecionada
function EmptyPanel() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <div className="text-slate-400 mb-4">
        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhuma comanda selecionada</h3>
      <p className="text-sm text-slate-500">
        Selecione uma comanda ou inicie uma venda direta para ver os itens aqui.
      </p>
    </div>
  );
}