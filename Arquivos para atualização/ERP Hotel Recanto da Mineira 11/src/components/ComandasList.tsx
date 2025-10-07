import { ArrowLeft, Plus, Receipt } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Comanda } from '../types';

interface ComandasListProps {
  comandas: Comanda[];
  onBack: () => void;
  onNewComanda: () => void;
  onSelectComanda: (comanda: Comanda) => void;
}

export function ComandasList({ comandas, onBack, onNewComanda, onSelectComanda }: ComandasListProps) {
  const openComandas = comandas.filter(c => c.status === 'open');

  const calculateTotal = (comanda: Comanda) => {
    return comanda.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex flex-col">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl">Comandas Abertas</h1>
            <p className="text-muted-foreground">{openComandas.length} comanda(s) ativa(s)</p>
          </div>
        </div>

        <div className="mb-6">
          <Button 
            onClick={onNewComanda}
            className="w-full h-14 gap-2"
          >
            <Plus className="w-5 h-5" />
            Nova Comanda
          </Button>
        </div>

        <div className="flex-1 space-y-4 pb-6">
          {openComandas.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <Receipt className="w-16 h-16 opacity-30" />
                <p>Nenhuma comanda aberta</p>
              </div>
            </Card>
          ) : (
            openComandas.map((comanda) => (
              <Card
                key={comanda.id}
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary"
                onClick={() => onSelectComanda(comanda)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                      <Receipt className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3>Comanda #{comanda.number}</h3>
                      <p className="text-muted-foreground">{comanda.items.length} item(ns)</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl">R$ {calculateTotal(comanda).toFixed(2)}</p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}