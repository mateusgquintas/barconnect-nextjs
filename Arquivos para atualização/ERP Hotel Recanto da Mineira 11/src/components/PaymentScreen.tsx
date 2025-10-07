import { X, CreditCard, DollarSign, Smartphone, Check, Gift } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { OrderItem, PaymentMethod } from '../types';
import { useState } from 'react';
import { UserRole } from '../types/user';

interface PaymentScreenProps {
  title: string;
  items: OrderItem[];
  onBack: () => void;
  onConfirmPayment: (method: PaymentMethod) => void;
  userRole: UserRole;
  isDirectSale: boolean;
}

export function PaymentScreen({ title, items, onBack, onConfirmPayment, userRole, isDirectSale }: PaymentScreenProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const total = calculateTotal();

  const basePaymentMethods = [
    { id: 'cash' as PaymentMethod, name: 'Dinheiro', icon: DollarSign, color: 'bg-green-500' },
    { id: 'credit' as PaymentMethod, name: 'Crédito', icon: CreditCard, color: 'bg-blue-500' },
    { id: 'debit' as PaymentMethod, name: 'Débito', icon: CreditCard, color: 'bg-indigo-500' },
    { id: 'pix' as PaymentMethod, name: 'Pix', icon: Smartphone, color: 'bg-teal-500' },
  ];

  // Adicionar Cortesia se for admin e venda direta
  const paymentMethods = userRole === 'admin' && isDirectSale 
    ? [...basePaymentMethods, { id: 'courtesy' as PaymentMethod, name: 'Cortesia', icon: Gift, color: 'bg-purple-500' }]
    : basePaymentMethods;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h1 className="text-2xl text-slate-900">{title}</h1>
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

        <Card className="p-6">
          <h2 className="mb-4 text-slate-900">Resumo do Pedido</h2>
          <div className="space-y-2 mb-4">
            {items.map((item) => (
              <div key={item.product.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {item.quantity}x {item.product.name}
                </span>
                <span>R$ {(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 flex justify-between items-center">
            <h3 className="text-slate-900">Total</h3>
            <p className="text-3xl text-slate-900">R$ {total.toFixed(2)}</p>
          </div>
        </Card>

        <div>
          <h3 className="mb-4 text-slate-900">Forma de Pagamento</h3>
          <div className="grid grid-cols-1 gap-4">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              const isSelected = selectedMethod === method.id;
              return (
                <Card
                  key={method.id}
                  className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                    isSelected ? 'border-2 border-primary bg-primary/5' : 'hover:border-primary'
                  }`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-full ${method.color} flex items-center justify-center`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl">{method.name}</h4>
                    </div>
                    {isSelected && (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-5 h-5 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
        </div>

        <div className="p-6 border-t border-slate-200">
          <Button
            onClick={() => selectedMethod && onConfirmPayment(selectedMethod)}
            disabled={!selectedMethod}
            className="w-full h-14 bg-slate-900 hover:bg-slate-800"
          >
            Confirmar Pagamento
          </Button>
        </div>
      </div>
    </div>
  );
}