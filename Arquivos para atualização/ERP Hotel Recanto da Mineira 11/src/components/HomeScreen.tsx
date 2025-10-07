import { Receipt, ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface HomeScreenProps {
  onOpenComanda: () => void;
  onDirectOrder: () => void;
}

export function HomeScreen({ onOpenComanda, onDirectOrder }: HomeScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex flex-col">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">
        <div className="text-center mb-12 mt-8">
          <h1 className="text-4xl mb-2">PDV Bar</h1>
          <p className="text-muted-foreground">Sistema de Ponto de Venda</p>
        </div>

        <div className="flex-1 flex flex-col gap-6 justify-center pb-20">
          <Card 
            className="p-8 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary"
            onClick={onOpenComanda}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center">
                <Receipt className="w-10 h-10 text-primary-foreground" />
              </div>
              <div className="text-center">
                <h2 className="mb-2">Abrir Comanda</h2>
                <p className="text-muted-foreground">Criar uma nova comanda para o cliente</p>
              </div>
            </div>
          </Card>

          <Card 
            className="p-8 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary"
            onClick={onDirectOrder}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
                <ShoppingCart className="w-10 h-10 text-secondary-foreground" />
              </div>
              <div className="text-center">
                <h2 className="mb-2">Pedido Direto</h2>
                <p className="text-muted-foreground">Registrar um pedido sem comanda</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}