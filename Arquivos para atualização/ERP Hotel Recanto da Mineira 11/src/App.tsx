import { useState, useEffect } from "react";
import { Header, PageView } from "./components/Header";
import { ComandaSidebar } from "./components/ComandaSidebar";
import { ComandaDetail } from "./components/ComandaDetail";
import { ProductCatalog } from "./components/ProductCatalog";
import { PaymentScreen } from "./components/PaymentScreen";
import { NewComandaDialog } from "./components/NewComandaDialog";
import { Dashboard } from "./components/Dashboard";
import { Hotel, HotelView } from "./components/Hotel";
import { Inventory } from "./components/Inventory";
import { Transactions } from "./components/Transactions";
import { LoginScreen } from "./components/LoginScreen";
import {
  Comanda,
  OrderItem,
  Product,
  PaymentMethod,
  Transaction,
  SaleRecord,
} from "./types";
import { User } from "./types/user";
import { toast } from "sonner";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { PAYMENT_METHOD_NAMES } from "./utils/constants";
import { formatDate, formatTime } from "./utils/calculations";

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    type: "income",
    description: "Venda Comanda #001",
    amount: 85.0,
    category: "Vendas",
    date: "01/10/2025",
    time: "14:35",
  },
  {
    id: "2",
    type: "expense",
    description: "Compra de Bebidas",
    amount: 450.0,
    category: "Fornecedores",
    date: "01/10/2025",
    time: "10:20",
  },
  {
    id: "3",
    type: "income",
    description: "Hospedagem - Quarto 101",
    amount: 350.0,
    category: "Hospedagens",
    date: "01/10/2025",
    time: "13:40",
  },
  {
    id: "4",
    type: "expense",
    description: "Conta de Luz",
    amount: 320.0,
    category: "Luz",
    date: "30/09/2025",
    time: "15:00",
  },
  {
    id: "5",
    type: "income",
    description: "Venda Comanda #005",
    amount: 120.0,
    category: "Vendas",
    date: "01/10/2025",
    time: "14:20",
  },
  {
    id: "6",
    type: "expense",
    description: "Salários",
    amount: 3200.0,
    category: "Salários",
    date: "28/09/2025",
    time: "09:00",
  },
  {
    id: "7",
    type: "income",
    description: "Evento - Aniversário",
    amount: 1200.0,
    category: "Eventos",
    date: "01/10/2025",
    time: "13:55",
  },
  {
    id: "8",
    type: "expense",
    description: "Manutenção",
    amount: 180.0,
    category: "Manutenção",
    date: "29/09/2025",
    time: "16:30",
  },
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<PageView>("pdv");
  const [dashboardView, setDashboardView] = useState<"bar" | "controladoria">("bar");
  const [hotelView, setHotelView] = useState<HotelView>("rooms");
  
  // Estados com persistência no localStorage
  const [comandas, setComandas] = useLocalStorage<Comanda[]>("barconnect_comandas", []);
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>("barconnect_transactions", INITIAL_TRANSACTIONS);
  const [salesRecords, setSalesRecords] = useLocalStorage<SaleRecord[]>("barconnect_sales", []);
  
  // Estados temporários (não persistem)
  const [selectedComandaId, setSelectedComandaId] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [showNewComandaDialog, setShowNewComandaDialog] = useState(false);
  const [directSaleItems, setDirectSaleItems] = useState<OrderItem[]>([]);
  const [isDirectSale, setIsDirectSale] = useState(false);

  const selectedComanda =
    comandas.find((c) => c.id === selectedComandaId) || null;

  const handleNewComanda = () => {
    setShowNewComandaDialog(true);
  };

  const handleCreateComanda = (
    comandaNumber: number,
    customerName?: string,
  ) => {
    // Check if comanda number already exists
    const exists = comandas.some(
      (c) => c.number === comandaNumber,
    );
    if (exists) {
      toast.error(`Comanda #${comandaNumber} já existe`);
      return;
    }

    const newComanda: Comanda = {
      id: Date.now().toString(),
      number: comandaNumber,
      customerName,
      items: [],
      createdAt: new Date(),
      status: "open",
      createdBy: currentUser?.name, // Registrar quem criou
    };
    setComandas([...comandas, newComanda]);
    setSelectedComandaId(newComanda.id);
    setIsDirectSale(false);
    toast.success(`Comanda #${comandaNumber} criada`);
  };

  const handleDirectSale = () => {
    setIsDirectSale(true);
    setSelectedComandaId(null);
    setDirectSaleItems([]);
    toast.success("Modo venda direta ativado");
  };

  const handleSelectComanda = (comanda: Comanda) => {
    setSelectedComandaId(comanda.id);
    setIsDirectSale(false);
  };

  const handleCloseComanda = (comandaId: string) => {
    const comanda = comandas.find((c) => c.id === comandaId);
    if (comanda && comanda.items.length > 0) {
      toast.error(
        "Finalize o pagamento antes de fechar a comanda",
      );
      return;
    }

    setComandas(comandas.filter((c) => c.id !== comandaId));
    if (selectedComandaId === comandaId) {
      setSelectedComandaId(null);
    }
    toast.success("Comanda removida");
  };

  const handleAddProduct = (product: Product) => {
    if (isDirectSale) {
      // Add to direct sale
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
        setDirectSaleItems([
          ...directSaleItems,
          { product, quantity: 1 },
        ]);
      }
      toast.success(`${product.name} adicionado`);
    } else if (selectedComandaId) {
      // Add to selected comanda
      setComandas(
        comandas.map((c) => {
          if (c.id === selectedComandaId) {
            const existingItemIndex = c.items.findIndex(
              (item) => item.product.id === product.id,
            );
            if (existingItemIndex >= 0) {
              const newItems = [...c.items];
              newItems[existingItemIndex] = {
                ...newItems[existingItemIndex],
                quantity:
                  newItems[existingItemIndex].quantity + 1,
              };
              return { ...c, items: newItems };
            } else {
              return {
                ...c,
                items: [...c.items, { product, quantity: 1 }],
              };
            }
          }
          return c;
        }),
      );
      toast.success(`${product.name} adicionado`);
    } else {
      toast.error(
        "Selecione uma comanda ou ative venda direta",
      );
    }
  };

  const handleRemoveItem = (productId: string) => {
    if (isDirectSale) {
      setDirectSaleItems(
        directSaleItems.filter(
          (item) => item.product.id !== productId,
        ),
      );
      toast.success("Item removido");
    } else if (selectedComandaId) {
      setComandas(
        comandas.map((c) => {
          if (c.id === selectedComandaId) {
            return {
              ...c,
              items: c.items.filter(
                (item) => item.product.id !== productId,
              ),
            };
          }
          return c;
        }),
      );
      toast.success("Item removido");
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

  const handleAddTransaction = (
    transaction: Omit<Transaction, "id" | "date" | "time">,
  ) => {
    const now = new Date();
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      date: formatDate(now),
      time: formatTime(now),
    };

    setTransactions([newTransaction, ...transactions]);
  };

  const handleConfirmPayment = (method: PaymentMethod) => {
    const now = new Date();
    const isCourtesy = method === "courtesy";

    if (isDirectSale) {
      // Registrar venda direta
      const total = directSaleItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0,
      );

      // Criar registro de venda
      const saleRecord: SaleRecord = {
        id: Date.now().toString(),
        items: [...directSaleItems],
        total,
        paymentMethod: method,
        date: formatDate(now),
        time: formatTime(now),
        isDirectSale: true,
        isCourtesy,
        createdBy: currentUser?.name, // Registrar quem vendeu
      };
      setSalesRecords([saleRecord, ...salesRecords]);

      // Registrar no financeiro apenas se NÃO for cortesia
      if (!isCourtesy) {
        handleAddTransaction({
          type: "income",
          description: "Venda Direta",
          amount: total,
          category: "Vendas",
        });
      }

      setDirectSaleItems([]);
      setIsDirectSale(false);
      toast.success(
        `Venda direta finalizada - ${PAYMENT_METHOD_NAMES[method]}`,
      );
    } else if (selectedComandaId && selectedComanda) {
      // Registrar comanda
      const total = selectedComanda.items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0,
      );

      // Criar registro de venda
      const saleRecord: SaleRecord = {
        id: Date.now().toString(),
        comandaNumber: selectedComanda.number,
        customerName: selectedComanda.customerName,
        items: [...selectedComanda.items],
        total,
        paymentMethod: method,
        date: formatDate(now),
        time: formatTime(now),
        isDirectSale: false,
        isCourtesy,
        createdBy: selectedComanda.createdBy || currentUser?.name, // Quem criou a comanda
      };
      setSalesRecords([saleRecord, ...salesRecords]);

      // Registrar no financeiro (cortesia não pode acontecer em comanda)
      handleAddTransaction({
        type: "income",
        description: `Venda Comanda #${String(selectedComanda.number).padStart(3, "0")}`,
        amount: total,
        category: "Vendas",
      });

      setComandas(
        comandas.map((c) =>
          c.id === selectedComandaId
            ? { ...c, status: "closed" as const }
            : c,
        ),
      );
      const comandaNumber = selectedComanda?.number;
      setComandas(
        comandas.filter((c) => c.id !== selectedComandaId),
      );
      setSelectedComandaId(null);
      toast.success(
        `Comanda #${comandaNumber} finalizada - ${PAYMENT_METHOD_NAMES[method]}`,
      );
    }
    setShowPayment(false);
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
    setComandas([]);
    setSelectedComandaId(null);
    setDirectSaleItems([]);
    setIsDirectSale(false);
    toast.success("Logout realizado com sucesso");
  };

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return (
          <Dashboard
            activeView={dashboardView}
            transactions={transactions}
            comandas={comandas}
            salesRecords={salesRecords}
          />
        );
      case "hotel":
        return <Hotel activeView={hotelView} />;
      case "inventory":
        return <Inventory />;
      case "transactions":
        return (
          <Transactions
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
          />
        );
      case "pdv":
      default:
        return (
          <div className="flex-1 flex overflow-hidden">
            <ComandaSidebar
              comandas={comandas}
              selectedComandaId={selectedComandaId}
              onSelectComanda={handleSelectComanda}
              onCloseComanda={handleCloseComanda}
              userRole={currentUser.role}
            />

            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 bg-white overflow-hidden">
                <ProductCatalog
                  onAddProduct={handleAddProduct}
                />
              </div>

              <div className="w-96 border-l border-slate-200 overflow-hidden">
                {isDirectSale ? (
                  <div className="flex flex-col h-full bg-white">
                    <div className="px-6 py-4 border-b border-slate-200">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <h2 className="text-slate-900">
                            Venda Direta
                          </h2>
                          <p className="text-sm text-slate-500 mt-1">
                            Sem comanda
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500">
                            Total
                          </p>
                          <p className="text-2xl text-slate-900">
                            R${" "}
                            {directSaleItems
                              .reduce(
                                (sum, item) =>
                                  sum +
                                  item.product.price *
                                    item.quantity,
                                0,
                              )
                              .toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="px-6 py-4 border-b border-slate-200">
                      <h3 className="text-slate-700 mb-3">
                        Itens
                      </h3>
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
                                    {item.quantity}x{" "}
                                    {item.product.name}
                                  </p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <p className="text-slate-900">
                                    R${" "}
                                    {(
                                      item.product.price *
                                      item.quantity
                                    ).toFixed(2)}
                                  </p>
                                  <button
                                    onClick={() =>
                                      handleRemoveItem(
                                        item.product.id,
                                      )
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
                                sum +
                                item.product.price *
                                  item.quantity,
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
        hotelView={hotelView}
        onHotelViewChange={setHotelView}
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