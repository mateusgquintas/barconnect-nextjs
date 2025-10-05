import { OrderItem, Comanda } from '@/types';

export function calculateTotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
}

export function calculateComandaTotal(comanda: Comanda): number {
  return calculateTotal(comanda.items);
}

export function getTotalItems(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function formatCurrency(value: number): string {
  return `R$ ${value.toFixed(2)}`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR');
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}