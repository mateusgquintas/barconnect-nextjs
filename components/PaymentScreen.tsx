'use client'

import { useState } from 'react';
import { X, CreditCard, DollarSign, Smartphone, Check, Gift, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { OrderItem, PaymentMethod } from '@/types';
import { UserRole } from '@/types/user';

// Helper para formatação de moeda
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

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
    { id: 'credit' as PaymentMethod, name: 'Cartão de Crédito', icon: CreditCard, color: 'bg-blue-500' },
    { id: 'debit' as PaymentMethod, name: 'Débito', icon: CreditCard, color: 'bg-indigo-500' },
    { id: 'pix' as PaymentMethod, name: 'Pix', icon: Smartphone, color: 'bg-teal-500' },
  ];

  // Adicionar Cortesia se for admin e venda direta
  const paymentMethods = userRole === 'admin' && isDirectSale 
  ? [...basePaymentMethods, { id: 'courtesy' as PaymentMethod, name: 'Cortesia', icon: Gift, color: 'bg-purple-500' }]
    : basePaymentMethods;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 md:p-6">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 md:p-6 border-b-2 border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">{title}</h1>
            <p className="text-sm text-slate-600 mt-0.5">{items.length} {items.length === 1 ? 'item' : 'itens'}</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack} 
            className="rounded-full hover:bg-slate-100"
            aria-label="Voltar"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

        <Card className="p-5 md:p-6 border-l-4 border-l-blue-500 shadow-md">
          <h2 className="mb-4 text-base font-bold text-slate-900 uppercase tracking-wide">Resumo do Pedido</h2>
          <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
            {items.map((item) => (
              <div key={item.product.id} className="flex justify-between items-start text-sm gap-3">
                <span className="text-slate-700 flex-1">
                  <span className="font-bold text-blue-600">{item.quantity}x</span> {item.product.name}
                </span>
                <span className="font-semibold text-slate-900 flex-shrink-0">{formatCurrency(item.product.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t-2 border-slate-200 pt-4 flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide">Total</h3>
            <p className="text-3xl md:text-4xl font-bold text-slate-900">{formatCurrency(total)}</p>
          </div>
        </Card>

        <div>
          <h3 className="mb-4 text-base font-bold text-slate-900 uppercase tracking-wide">Forma de Pagamento</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              const isSelected = selectedMethod === method.id;
              return (
                <Card
                  key={method.id}
                  className={`p-4 md:p-5 cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-2 border-blue-600 bg-gradient-to-br from-blue-50 to-blue-50/30 shadow-lg scale-105' 
                      : 'border-2 border-slate-200 hover:border-blue-400 hover:shadow-md hover:scale-102'
                  }`}
                  onClick={() => setSelectedMethod(method.id)}
                  data-testid={`payment-${method.id}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`Selecionar ${method.name} como forma de pagamento`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedMethod(method.id);
                    }
                  }}
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full ${method.color} flex items-center justify-center shadow-md flex-shrink-0`}>
                      <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base md:text-lg font-bold text-slate-900 truncate">{method.name}</h4>
                    </div>
                    {isSelected && (
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-md flex-shrink-0">
                        <Check className="w-5 h-5 text-white" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
        </div>

        <div className="p-5 md:p-6 border-t-2 border-slate-200 bg-gradient-to-b from-white to-slate-50">
          <button
            onClick={() => selectedMethod && onConfirmPayment(selectedMethod)}
            disabled={!selectedMethod}
            aria-label={selectedMethod ? `Confirmar pagamento de ${formatCurrency(total)} via ${paymentMethods.find(m => m.id === selectedMethod)?.name}` : 'Selecione uma forma de pagamento para continuar'}
            className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed shadow-md hover:shadow-lg disabled:shadow-none flex items-center justify-center gap-3 text-base md:text-lg"
          >
            <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
            <span>{selectedMethod ? `Confirmar - ${formatCurrency(total)}` : 'Selecione a forma de pagamento'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}