'use client'

import { useEffect } from 'react';
import { useSidePanels } from '@/contexts/SidePanelsContext';
import { ResponsiveDrawer } from '@/components/ResponsiveDrawer';
import { HoverZone, SidePanelHoverHandler } from '@/components/HoverZone';
import { MobileTrigger } from '@/components/MobileTrigger';
import { PanelIndicator } from '@/components/PanelIndicator';
import { ComandaDetail } from '@/components/ComandaDetail';
import ProductCatalog from '@/components/ProductCatalog';
import { Comanda, OrderItem } from '@/types';
import { UserRole } from '@/types/user';
import { Minus, Plus, ShoppingCart, CheckCircle2, X, Trash2 } from 'lucide-react';

// Helper para formatação de moeda
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

interface PDVLayoutProps {
  // Comandas props
  selectedComandaId: string | null;
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
  selectedComandaId,
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
        side="right"
        isActive={isRightPanelOpen || isRightPanelFixed}
        isVisible={!isRightPanelFixed && hasRightPanelContent && !isRightPanelOpen}
      />

      {/* Hot zone para desktop, quando painel direito não estiver fixo */}
      {!isRightPanelFixed && <HoverZone side="right" />}

      {/* Trigger para mobile, quando painel direito não estiver fixo */}
      {!isRightPanelFixed && <MobileTrigger side="right" />}

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
    <div className="flex flex-col h-full w-full">
      {/* Header com gradiente */}
      <div className="px-4 py-4 border-b-2 border-green-500 bg-gradient-to-br from-green-50 to-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Venda Direta</h2>
            <p className="text-sm text-slate-600 font-medium">{items.length} {items.length === 1 ? 'item' : 'itens'}</p>
          </div>
        </div>
      </div>

      {/* Lista de itens */}
      <div className="flex-1 overflow-y-auto px-3 py-4 min-h-0">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingCart className="w-10 h-10 text-slate-400" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Carrinho vazio</h3>
            <p className="text-sm text-slate-500 mb-4 max-w-xs">
              Adicione produtos do catálogo para iniciar uma venda direta
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div 
                key={item.product.id} 
                className="p-4 border border-slate-200 rounded-lg bg-white hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 mb-1 truncate">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-slate-600 font-medium mb-3">
                      {formatCurrency(item.product.price)} cada
                    </p>
                    
                    {/* Controles de quantidade */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                        disabled={item.quantity <= 1}
                        className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
                        aria-label="Diminuir quantidade"
                      >
                        <Minus className="w-4 h-4 text-slate-700" aria-hidden="true" />
                      </button>
                      <span className="w-10 text-center font-bold text-slate-900">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                        aria-label="Aumentar quantidade"
                      >
                        <Plus className="w-4 h-4 text-slate-700" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <p className="text-base font-bold text-slate-900">
                      {formatCurrency(item.product.price * item.quantity)}
                    </p>
                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                      aria-label={`Remover ${item.product.name}`}
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer com total e ações */}
      <div className="border-t-2 border-slate-200 bg-gradient-to-b from-white to-slate-50 flex-shrink-0">
        {items.length > 0 && (
          <>
            <div className="px-4 py-4 border-b border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-600 uppercase tracking-wide">Total da Venda</span>
                <span className="text-xs text-slate-500">{items.length} {items.length === 1 ? 'item' : 'itens'}</span>
              </div>
              <p className="text-3xl font-bold text-slate-900">{formatCurrency(total)}</p>
            </div>
            <div className="px-4 py-3">
              <button
                onClick={onFinalize}
                className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                aria-label={`Finalizar venda de ${formatCurrency(total)}`}
              >
                <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                Finalizar - {formatCurrency(total)}
              </button>
            </div>
          </>
        )}
        <div className="px-4 pb-4">
          <button
            onClick={onCancel}
            className="w-full h-10 text-slate-600 hover:text-slate-900 font-medium transition-colors flex items-center justify-center gap-2"
            aria-label="Cancelar venda direta"
          >
            <X className="w-4 h-4" aria-hidden="true" />
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
    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gradient-to-br from-slate-50 to-white">
      <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mb-6 shadow-inner">
        <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">Nenhuma comanda selecionada</h3>
      <p className="text-sm text-slate-600 max-w-xs mb-6 leading-relaxed">
        Adicione produtos do catálogo ao carrinho para iniciar uma nova venda direta.
      </p>
      <div className="flex flex-col gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Produtos podem ser adicionados ao centro</span>
        </div>
      </div>
    </div>
  );
}