/**
 * Testes de Acessibilidade - Versão Simplificada
 * Cobertura essencial para acessibilidade usando jest-axe
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { HomeScreen } from '@/components/HomeScreen';
import { Dashboard } from '@/components/Dashboard';
import { LoginScreen } from '@/components/LoginScreen';
import type { Product, Transaction, SaleRecord, Comanda } from '@/types';

expect.extend(toHaveNoViolations);

describe('Testes de Acessibilidade com jest-axe', () => {
  // Mocks com tipos corretos
  const mockProducts: Product[] = [
    { id: '1', name: 'Cerveja', price: 5.0, stock: 10 },
    { id: '2', name: 'Refrigerante', price: 3.0, stock: 20 },
  ];

  const mockTransactions: Transaction[] = [
    { 
      id: 't1', 
      type: 'income', 
      description: 'Venda teste', 
      amount: 50, 
      category: 'Bar', 
      date: '2025-10-01', 
      time: '12:00' 
    },
  ];

  const mockSalesRecords: SaleRecord[] = [
    { 
      id: 's1', 
      comandaNumber: 123, 
      customerName: 'Cliente', 
      items: [], 
      total: 25, 
      paymentMethod: 'cash', 
      date: '2025-10-01', 
      time: '12:00', 
      isDirectSale: false, 
      isCourtesy: false 
    },
  ];

  const mockComandas: Comanda[] = [
    { 
      id: 'c1', 
      number: 1, 
      items: [], 
      createdAt: new Date(), 
      status: 'open' 
    },
  ];

  const mockOnOpenComanda = jest.fn();
  const mockOnDirectOrder = jest.fn();
  const mockOnLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('HomeScreen deve passar em testes de acessibilidade', async () => {
    const { container } = render(
      <HomeScreen 
        onOpenComanda={mockOnOpenComanda}
        onDirectOrder={mockOnDirectOrder}
      />
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Dashboard deve passar em testes de acessibilidade', async () => {
    const { container } = render(
      <Dashboard 
        activeView="bar"
        products={mockProducts}
        transactions={mockTransactions}
        salesRecords={mockSalesRecords}
        comandas={mockComandas}
      />
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('LoginScreen deve passar em testes de acessibilidade', async () => {
    const { container } = render(
      <LoginScreen onLogin={mockOnLogin} />
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Deve ter títulos semânticos adequados', () => {
    render(
      <Dashboard 
        activeView="bar"
        products={mockProducts}
        transactions={mockTransactions}
        salesRecords={mockSalesRecords}
        comandas={mockComandas}
      />
    );

    const headings = screen.queryAllByRole('heading');
    headings.forEach(heading => {
      expect(heading).toHaveTextContent(/\w+/);
      expect(heading.tagName).toMatch(/^H[1-6]$/);
    });
  });

  it('Botões devem ter labels acessíveis', () => {
    render(
      <HomeScreen 
        onOpenComanda={mockOnOpenComanda}
        onDirectOrder={mockOnDirectOrder}
      />
    );

    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      const accessibleText = button.getAttribute('aria-label') || 
                           button.getAttribute('title') || 
                           button.textContent || '';
      expect(accessibleText.length).toBeGreaterThan(0);
    });
  });

  it('Campos de formulário devem ter labels associados', () => {
    render(<LoginScreen onLogin={mockOnLogin} />);

    const inputs = screen.queryAllByRole('textbox');
    inputs.forEach(input => {
      const hasLabel = input.getAttribute('aria-label') ||
                      input.getAttribute('aria-labelledby') ||
                      input.getAttribute('placeholder');
      expect(hasLabel).toBeTruthy();
    });
  });
});