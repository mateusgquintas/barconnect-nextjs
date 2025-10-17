'use client'

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { SidePanelsProvider, useSidePanels } from "@/contexts/SidePanelsContext";
import { Header, PageView } from "@/components/Header";
import { ComandaSidebar } from "@/components/ComandaSidebar";
import { ComandaDetail } from "@/components/ComandaDetail";
import ProductCatalog from "@/components/ProductCatalog";
import { PaymentScreen } from "@/components/PaymentScreen";
import { NewComandaDialog } from "@/components/NewComandaDialog";
import { Dashboard } from "@/components/Dashboard";
import { Hotel } from "@/components/Hotel";
import { HotelPilgrimages } from "@/components/HotelPilgrimages";
import AgendaPage from "@/app/hotel/agenda/page";
import { Inventory } from "@/components/Inventory";
import { Transactions } from "@/components/Transactions";
import { LoginScreen } from "@/components/LoginScreen";
import { ResponsiveDrawer } from "@/components/ResponsiveDrawer";
import { HoverZone, SidePanelHoverHandler } from "@/components/HoverZone";
import { MobileTrigger } from "@/components/MobileTrigger";
import { PDVLayout } from "@/components/PDVLayout";
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
    // Verificar se já existe uma comanda com esse número
    const existingComanda = comandas.find((c) => c.number === comandaNumber && c.status === 'open');
    
    if (existingComanda) {
      // Auto-selecionar a comanda existente ao invés de dar erro
      setSelectedComandaId(existingComanda.id);
      setIsDirectSale(false);
      toast.info(`Comanda #${comandaNumber} já existe. Selecionada automaticamente para adicionar itens.`);
      return;
    }

    // Criar nova comanda
    const comandaId = await createComanda(String(comandaNumber), customerName || "");
    if (comandaId) {
      // Auto-selecionar a comanda recém-criada
      setSelectedComandaId(comandaId);
      setIsDirectSale(false);
      toast.success(`Comanda #${comandaNumber} criada e selecionada automaticamente.`);
    }
  };

  const handleQuickComanda = async () => {
    // Gerar próximo número disponível
    const maxNumber = comandas.reduce((max, comanda) => Math.max(max, comanda.number), 0);
    const nextNumber = maxNumber + 1;
    
    await handleCreateComanda(nextNumber);
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
    if (!currentUser || currentUser.role !== 'admin') {
      toast.error('Apenas administradores podem fechar comandas.');
      return;
    }
    await closeComanda(comandaId);
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
      case "hotel-agenda":
        return (
          <ProtectedRoute allowedRoles={["admin"]}>
            <AgendaPage />
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
            <PDVLayout
              comandas={comandas}
              selectedComandaId={selectedComandaId}
              onSelectComanda={handleSelectComanda}
              onCloseComanda={handleCloseComanda}
              onAddProduct={handleAddProduct}
              isDirectSale={isDirectSale}
              directSaleItems={directSaleItems}
              onRemoveDirectSaleItem={handleRemoveItem}
              onUpdateDirectSaleQuantity={() => {}} // TODO: implementar
              onFinalizeSale={handleCheckout}
              onCancelDirectSale={() => {}} // TODO: implementar
              selectedComanda={selectedComanda}
              onRemoveItemFromComanda={handleRemoveItem}
              onCheckout={handleCheckout}
              currentView={currentView}
              userRole={currentUser.role}
            />
          </ProtectedRoute>
        );
    }
  };

  return (
    <SidePanelsProvider>
      <div className="h-screen flex flex-col bg-slate-100">
      <Header
        onNewComanda={handleNewComanda}
        onDirectSale={handleDirectSale}
        onQuickComanda={handleQuickComanda}
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
    </SidePanelsProvider>
  );
}