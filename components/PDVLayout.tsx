'use client'

import { useEffect } from 'react';
import { useSidePanels } from '@/contexts/SidePanelsContext';
import { ResponsiveDrawer } from '@/components/ResponsiveDrawer';
import { HoverZone, SidePanelHoverHandler } from '@/components/HoverZone';
import { MobileTrigger } from '@/components/MobileTrigger';
import { ComandaSidebar } from '@/components/ComandaSidebar';
import { ComandaDetail } from '@/components/ComandaDetail';
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
  const { setCanOpenRightPanel } = useSidePanels();

  // Atualizar se o painel direito pode abrir baseado no estado atual
  useEffect(() => {
    const canOpen = isDirectSale || selectedComandaId !== null;
    setCanOpenRightPanel(canOpen);
  }, [isDirectSale, selectedComandaId, setCanOpenRightPanel]);

  return (
    <div className="flex-1 flex overflow-hidden min-h-0 relative">
      {/* Hot zones para desktop */}
      <HoverZone side="left" />
      <HoverZone side="right" />

      {/* Triggers para mobile */}
      <MobileTrigger side="left" />
      <MobileTrigger side="right" />

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

      {/* Painel direito: Detalhes da comanda/venda direta */}
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
            />
          ) : (
            <EmptyPanel />
          )}
        </SidePanelHoverHandler>
      </ResponsiveDrawer>
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
    <div className="flex flex-col h-full bg-white">
      {/* Header com total */}
      <div className="px-6 py-4 border-b border-slate-200 flex-shrink-0">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="text-slate-900">Venda Direta</h2>
            <p className="text-sm text-slate-500 mt-1">Sem comanda</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Total</p>
            <p className="text-2xl text-slate-900">R$ {total.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Lista de itens */}
      <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
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

      {/* Actions */}
      <div className="px-6 py-4 border-t border-slate-200 space-y-3 flex-shrink-0">
        <button
          onClick={onFinalize}
          disabled={items.length === 0}
          className="w-full h-12 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:text-slate-400 text-white rounded-lg font-medium transition-colors"
        >
          Finalizar Venda
        </button>
        <button
          onClick={onCancel}
          className="w-full h-10 text-slate-600 hover:text-slate-800 transition-colors"
        >
          Cancelar
        </button>
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