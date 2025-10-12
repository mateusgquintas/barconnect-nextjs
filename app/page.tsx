'use client'

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { Header, PageView } from "@/components/Header";
import { ComandaSidebar } from "@/components/ComandaSidebar";
import { ComandaDetail } from "@/components/ComandaDetail";
import ProductCatalog from "@/components/ProductCatalog";
import { PaymentScreen } from "@/components/PaymentScreen";
import { NewComandaDialog } from "@/components/NewComandaDialog";
import { Dashboard } from "@/components/Dashboard";
import { Hotel } from "@/components/Hotel";
import { HotelPilgrimages } from "@/components/HotelPilgrimages";
import { Inventory } from "@/components/Inventory";
import { Transactions } from "@/components/Transactions";
import { LoginScreen } from "@/components/LoginScreen";
import {
  OrderItem,
  PaymentMethod,
  SaleRecord,
} from "@/types";
import { User } from "@/types/user";
import { toast } from "sonner";
import { useProductsDB } from "@/hooks/useProductsDB";
import { useComandasDB } from "@/hooks/useComandasDB";
import { useTransactionsDB } from "@/hooks/useTransactionsDB";
import { useSalesDB } from "@/hooks/useSalesDB";
import { useStockManager } from "@/hooks/useStockManager";
import { useSalesProcessor } from "@/hooks/useSalesProcessor";
import { PAYMENT_METHOD_NAMES } from "@/utils/constants";
import { formatDate, formatTime } from "@/utils/calculations";
import { registerSale } from '@/lib/salesService';

export default function Home() {
  const { user: currentUser, setUser: setCurrentUser } = useAuth();
  const [currentView, setCurrentView] = useState<PageView>("pdv");
  const [dashboardView, setDashboardView] = useState<"bar" | "controladoria">("bar");
  
  // Hooks do Supabase
  const { comandas, loading: loadingComandas, createComanda, addItemToComanda, removeItem, closeComanda, deleteComanda, refetch: refetchComandas } = useComandasDB();
  const { products } = useProductsDB();
  const { transactions, addTransaction, refetch: refetchTransactions } = useTransactionsDB();
  const { decreaseStock } = useStockManager();
  
  // Vendas agora usam Supabase
  const { sales: salesRecords, addSale, loading: loadingSales, fetchSales } = useSalesDB();
  
  // Novo processador de vendas unificado
  const { processSale, closeComanda: closeComandaNew, processDirectSale, loading: processingSale } = useSalesProcessor();
  
  // Estados temporários
  const [selectedComandaId, setSelectedComandaId] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [showNewComandaDialog, setShowNewComandaDialog] = useState(false);
  const [directSaleItems, setDirectSaleItems] = useState<OrderItem[]>([]);
  const [isDirectSale, setIsDirectSale] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false); // Flag para evitar duplicação

  const selectedComanda = comandas.find((c) => c.id === selectedComandaId) || null;

  const handleNewComanda = () => {
    setShowNewComandaDialog(true);
  };

  const handleCreateComanda = async (
    comandaNumber: number,
    customerName?: string,
  ) => {
    const exists = comandas.some((c) => c.number === comandaNumber);
    if (exists) {
      toast.error(`Comanda #${comandaNumber} já existe`);
      return;
    }

  const comandaId = await createComanda(String(comandaNumber), customerName || "");
    if (comandaId) {
      setSelectedComandaId(comandaId);
      setIsDirectSale(false);
    }
  };

  const handleDirectSale = () => {
    setIsDirectSale(true);
    setSelectedComandaId(null);
    setDirectSaleItems([]);
    toast.success("Modo venda direta ativado");
  };

  const handleSelectComanda = (comanda: any) => {
    setSelectedComandaId(comanda.id);
    setIsDirectSale(false);
  };

  const handleCloseComanda = async (comandaId: string) => {
    const comanda = comandas.find((c) => c.id === comandaId);
    if (comanda && comanda.items.length > 0) {
      toast.error("Finalize o pagamento antes de fechar a comanda");
      return;
    }

    await deleteComanda(comandaId);
    if (selectedComandaId === comandaId) {
      setSelectedComandaId(null);
    }
  };

  const handleAddProduct = async (product: any) => {
    console.log('🛍️ handleAddProduct:', { 
      productName: product.name, 
      isDirectSale, 
      selectedComandaId 
    });

    if (isDirectSale) {
      const existingItemIndex = directSaleItems.findIndex(
        (item) => item.product.id === product.id,
      );
      if (existingItemIndex >= 0) {
        const newItems = [...directSaleItems];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + 1,
        };
        setDirectSaleItems(newItems);
      } else {
        setDirectSaleItems([...directSaleItems, { product, quantity: 1 }]);
      }
      toast.success(`${product.name} adicionado à venda direta`);
    } else if (selectedComandaId) {
      console.log('📋 Adicionando à comanda:', selectedComandaId);
      try {
        await addItemToComanda(
          selectedComandaId,
          product.id,
          product.name,
          product.price
        );
        toast.success(`${product.name} adicionado à comanda`);
      } catch (error) {
        console.error('❌ Erro ao adicionar à comanda:', error);
        toast.error('Erro ao adicionar item à comanda');
      }
    } else {
      toast.error("Selecione uma comanda ou ative venda direta");
    }
  };

  // Configurar event listeners para os botões PDV
  useEffect(() => {
    const handlePDVDirectSale = () => {
      handleDirectSale();
    };

    const handlePDVNewComanda = () => {
      handleNewComanda();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('pdv:directSale', handlePDVDirectSale);
      window.addEventListener('pdv:newComanda', handlePDVNewComanda);

      return () => {
        window.removeEventListener('pdv:directSale', handlePDVDirectSale);
        window.removeEventListener('pdv:newComanda', handlePDVNewComanda);
      };
    }
  }, []); // Empty dependency array para rodar apenas uma vez

  const handleRemoveItem = async (productId: string) => {
    if (isDirectSale) {
      setDirectSaleItems(
        directSaleItems.filter((item) => item.product.id !== productId),
      );
      toast.success("Item removido");
    } else if (selectedComandaId) {
      await removeItem(selectedComandaId, productId);
    }
  };

  const handleCheckout = () => {
    if (
      (isDirectSale && directSaleItems.length > 0) ||
      (selectedComanda && selectedComanda.items.length > 0)
    ) {
      setShowPayment(true);
    }
  };

  const handleConfirmPayment = async (method: PaymentMethod) => {
    // Evitar múltiplas execuções simultâneas
    if (isProcessingPayment || processingSale) {
      console.log('⚠️ Pagamento já está sendo processado, ignorando...');
      return;
    }

    setIsProcessingPayment(true);
    
    try {
      console.log('💳 Processando pagamento:', { method, isDirectSale, selectedComanda: !!selectedComanda });

      if (isDirectSale && directSaleItems.length > 0) {
        console.log('� Processando venda direta...');
        const success = await processDirectSale(
          directSaleItems,
          method,
          undefined // sem nome de cliente para venda direta
        );
        if (success) {
          setDirectSaleItems([]);
          setIsDirectSale(false);
          setShowPayment(false);
          // Atualizar dados
          await Promise.all([
            refetchTransactions(),
            refetchComandas(),
            fetchSales()
          ]);
          toast.success(`Venda direta finalizada - ${PAYMENT_METHOD_NAMES[method]}`);
        } else {
          toast.error('Erro ao processar venda direta');
        }
      } else if (selectedComanda && selectedComanda.items.length > 0) {
        console.log('� Processando fechamento de comanda...');
        const success = await closeComandaNew(selectedComanda, method);
        if (success) {
          setSelectedComandaId(null);
          setShowPayment(false);
          // Atualizar dados
          await Promise.all([
            refetchTransactions(),
            refetchComandas(),
            fetchSales()
          ]);
          toast.success(`Comanda #${selectedComanda.number} finalizada - ${PAYMENT_METHOD_NAMES[method]}`);
        } else {
          toast.error('Erro ao processar comanda');
        }
      } else {
        toast.error('Nenhum item para processar');
      }
    } catch (error) {
      console.error('❌ Erro ao processar pagamento:', error);
      toast.error('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const currentItems = isDirectSale
    ? directSaleItems
    : selectedComanda?.items || [];
  const paymentTitle = isDirectSale
    ? "Venda Direta"
    : `Comanda #${selectedComanda?.number}`;

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentView("pdv");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView("pdv");
    setSelectedComandaId(null);
    setDirectSaleItems([]);
    setIsDirectSale(false);
    toast.success("Logout realizado com sucesso");
  };

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (loadingComandas) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return (
          <ProtectedRoute allowedRoles={["admin"]}>
            <Dashboard
              activeView={dashboardView}
              transactions={transactions}
              comandas={comandas}
              salesRecords={salesRecords}
              products={products}
            />
          </ProtectedRoute>
        );
      case "hotel":
        return (
          <ProtectedRoute allowedRoles={["admin"]}>
            <Hotel />
          </ProtectedRoute>
        );
      case "hotel-pilgrimages":
        return (
          <ProtectedRoute allowedRoles={["admin"]}>
            <HotelPilgrimages />
          </ProtectedRoute>
        );
      case "inventory":
        return (
          <ProtectedRoute allowedRoles={["admin"]}>
            <Inventory />
          </ProtectedRoute>
        );
      case "transactions":
        return (
          <ProtectedRoute allowedRoles={["admin"]}>
            <Transactions
              transactions={transactions}
              salesRecords={salesRecords}
              onAddTransaction={addTransaction}
              startDate={new Date().toISOString().split('T')[0]}
              endDate={new Date().toISOString().split('T')[0]}
            />
          </ProtectedRoute>
        );
      case "pdv":
      default:
        return (
          <ProtectedRoute allowedRoles={["admin", "operator"]}>
            {/* ...existing code for PDV... */}
            <div className="flex-1 flex overflow-hidden min-h-0">
              <ComandaSidebar
                comandas={comandas}
                selectedComandaId={selectedComandaId}
                onSelectComanda={handleSelectComanda}
                onCloseComanda={handleCloseComanda}
                userRole={currentUser.role}
              />

              <div className="flex-1 flex overflow-hidden min-h-0">
                <div className="flex-1 bg-white overflow-hidden min-h-0">
                  <ProductCatalog onAddProduct={handleAddProduct} currentView={currentView} />
                </div>

                <div className="w-96 border-l border-slate-200 overflow-hidden min-h-0">
                  {isDirectSale ? (
                    <div className="flex flex-col h-full bg-white">
                      <div className="px-6 py-4 border-b border-slate-200">
                        <div className="flex items-baseline justify-between">
                          <div>
                            <h2 className="text-slate-900">Venda Direta</h2>
                            <p className="text-sm text-slate-500 mt-1">Sem comanda</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-500">Total</p>
                            <p className="text-2xl text-slate-900">
                              R${" "}
                              {directSaleItems
                                .reduce(
                                  (sum, item) =>
                                    sum + item.product.price * item.quantity,
                                  0,
                                )
                                .toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="px-6 py-4 border-b border-slate-200">
                        <h3 className="text-slate-700 mb-3">Itens</h3>
                      </div>

                      <div className="flex-1 overflow-y-auto px-6">
                        {directSaleItems.length === 0 ? (
                          <div className="py-12 text-center text-slate-400">
                            <p>Nenhum item adicionado</p>
                          </div>
                        ) : (
                          <div className="space-y-2 py-4">
                            {directSaleItems.map((item) => (
                              <div
                                key={item.product.id}
                                className="p-4 border border-slate-200 rounded-lg"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <p className="text-slate-600 text-sm mb-1">
                                      {item.quantity}x {item.product.name}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <p className="text-slate-900">
                                      R${" "}
                                      {(item.product.price * item.quantity).toFixed(
                                        2,
                                      )}
                                    </p>
                                    <button
                                      onClick={() =>
                                        handleRemoveItem(item.product.id)
                                      }
                                      className="text-slate-400 hover:text-red-600"
                                    >
                                      <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M6 18L18 6M6 6l12 12"
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

                      {directSaleItems.length > 0 && (
                        <div className="p-6 border-t border-slate-200">
                          <button
                            onClick={handleCheckout}
                            className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors"
                          >
                            Finalizar Venda - R${" "}
                            {directSaleItems
                              .reduce(
                                (sum, item) =>
                                  sum + item.product.price * item.quantity,
                                0,
                              )
                              .toFixed(2)}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <ComandaDetail
                      comanda={selectedComanda}
                      onRemoveItem={handleRemoveItem}
                      onCheckout={handleCheckout}
                    />
                  )}
                </div>
              </div>
            </div>
          </ProtectedRoute>
        );
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-100">
      <Header
        onNewComanda={handleNewComanda}
        onDirectSale={handleDirectSale}
        currentView={currentView}
        onViewChange={setCurrentView}
        dashboardView={dashboardView}
        onDashboardViewChange={setDashboardView}
        userRole={currentUser.role}
        userName={currentUser.name}
        onLogout={handleLogout}
      />

      {renderContent()}

      {showPayment && (
        <PaymentScreen
          title={paymentTitle}
          items={currentItems}
          onBack={() => setShowPayment(false)}
          onConfirmPayment={handleConfirmPayment}
          userRole={currentUser.role}
          isDirectSale={isDirectSale}
        />
      )}

      <NewComandaDialog
        open={showNewComandaDialog}
        onOpenChange={setShowNewComandaDialog}
        onCreateComanda={handleCreateComanda}
      />
      </div>
  );
}