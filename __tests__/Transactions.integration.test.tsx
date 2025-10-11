import { render, screen } from '@testing-library/react';
import { Transactions } from '../components/Transactions';
import React from 'react';

describe('Transactions integração', () => {
  // Mock global Date para garantir range correto
  const MOCK_NOW = new Date('2025-10-08T12:00:00Z');
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(MOCK_NOW);
  });
  afterAll(() => {
    jest.useRealTimers();
  });
  const transactions = [
    {
      id: 't1',
      type: 'income' as const,
      description: 'Pix recebido',
      amount: 100,
      category: 'Pix',
      date: '07/10/2025',
      time: '10:00',
    },
    {
      id: 't2',
      type: 'expense' as const,
      description: 'Compra estoque',
      amount: 50,
      category: 'Estoque',
      date: '06/10/2025',
      time: '09:00',
    },
  ];
  const salesRecords = [
    {
      id: 's1',
      comandaNumber: 1,
      customerName: 'João',
      items: [],
      total: 80,
      paymentMethod: 'cash' as const,
      date: '08/10/2025',
      time: '12:00',
      isDirectSale: true,
      isCourtesy: false,
      createdBy: 'admin',
    },
  ];
  const onAddTransaction = jest.fn();

  it('exibe apenas transações reais', () => {
    const { container } = render(
      <Transactions
        transactions={transactions}
        salesRecords={[]}
        onAddTransaction={onAddTransaction}
        startDate="2025-10-01"
        endDate="2025-10-08"
      />
    );
    const items = container.querySelectorAll('[role="listitem"]');
    const texts = Array.from(items).map(el => el.textContent || '');
    expect(texts.some(t => /pix recebido/i.test(t))).toBe(true);
    expect(texts.some(t => /compra estoque/i.test(t))).toBe(true);
    expect(texts.some(t => t.toLowerCase().includes('joão'))).toBe(false);
  });

  it('exibe apenas vendas', () => {
    const { container } = render(
      <Transactions
        transactions={[]}
        salesRecords={salesRecords}
        onAddTransaction={onAddTransaction}
        startDate="2025-10-01"
        endDate="2025-10-08"
      />
    );
    const items = container.querySelectorAll('[role="listitem"]');
    const texts = Array.from(items).map(el => el.textContent || '');
    expect(texts.some(t => /pix recebido/i.test(t))).toBe(false);
    expect(texts.some(t => /compra estoque/i.test(t))).toBe(false);
    expect(texts.some(t => t.toLowerCase().includes('joão'))).toBe(true);
  });

  it('exibe transações e vendas juntas', () => {
    const { container } = render(
      <Transactions
        transactions={transactions}
        salesRecords={salesRecords}
        onAddTransaction={onAddTransaction}
        startDate="2025-10-01"
        endDate="2025-10-08"
      />
    );
    const items = container.querySelectorAll('[role="listitem"]');
    const texts = Array.from(items).map(el => el.textContent || '');
    expect(texts.some(t => /pix recebido/i.test(t))).toBe(true);
    expect(texts.some(t => /compra estoque/i.test(t))).toBe(true);
    expect(texts.some(t => t.toLowerCase().includes('joão'))).toBe(true);
    // Ordem: venda (08/10), pix (07/10), saída (06/10)
    const vendaIdx = texts.findIndex(t => /joão/i.test(t));
    const pixIdx = texts.findIndex(t => /pix recebido/i.test(t));
    expect(vendaIdx).toBeLessThan(pixIdx);
  });

  it('deve exibir todas as transações dentro do intervalo de datas', () => {
    render(<Transactions transactions={transactions} salesRecords={salesRecords} onAddTransaction={onAddTransaction} startDate="2025-10-01" endDate="2025-10-08" />);
    expect(screen.getByText('Pix recebido')).toBeInTheDocument();
    expect(screen.getByText('Compra estoque')).toBeInTheDocument();
  });

  it('não deve exibir transações fora do intervalo de datas', () => {
    render(<Transactions transactions={transactions} salesRecords={salesRecords} onAddTransaction={onAddTransaction} startDate="2025-10-08" endDate="2025-10-10" />);
    expect(screen.queryByText('Pix recebido')).not.toBeInTheDocument();
    expect(screen.queryByText('Compra estoque')).not.toBeInTheDocument();
  });

  it('deve exibir vendas corretamente', () => {
    render(<Transactions transactions={transactions} salesRecords={salesRecords} onAddTransaction={onAddTransaction} startDate="2025-10-01" endDate="2025-10-08" />);
    expect(screen.getByText(/João/)).toBeInTheDocument();
  });

  it('should display all transactions and sales correctly', () => {
    render(<Transactions 
      transactions={transactions} 
      salesRecords={salesRecords} 
      onAddTransaction={onAddTransaction}
      startDate="2025-10-01"
      endDate="2025-10-08"
    />);

    // Check if income transaction is displayed
    expect(screen.getByText('Pix recebido')).toBeInTheDocument();
    expect(screen.getByText('Compra estoque')).toBeInTheDocument();

    // Check if sales records are displayed
    expect(screen.getByText(/João/)).toBeInTheDocument();
  });
});
