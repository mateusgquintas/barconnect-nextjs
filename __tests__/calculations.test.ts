import {
  calculateTotal,
  calculateComandaTotal,
  getTotalItems,
  formatCurrency,
  formatDate,
  formatTime,
} from '../utils/calculations';

describe('utils/calculations', () => {
  it('calculateTotal soma corretamente', () => {
    const items = [
      { product: { id: '1', name: 'A', price: 10, stock: 10 }, quantity: 2 },
      { product: { id: '2', name: 'B', price: 5, stock: 5 }, quantity: 3 },
    ];
    expect(calculateTotal(items)).toBe(10 * 2 + 5 * 3);
    expect(calculateTotal([])).toBe(0);
  });

  it('calculateComandaTotal soma itens da comanda', () => {
    const comanda = {
      id: 'c1',
      number: 1,
      items: [
        { product: { id: '1', name: 'A', price: 7, stock: 10 }, quantity: 1 },
        { product: { id: '2', name: 'B', price: 3, stock: 5 }, quantity: 4 },
      ],
      createdAt: new Date(),
  status: 'open' as const,
    };
    expect(calculateComandaTotal(comanda)).toBe(7 * 1 + 3 * 4);
  });

  it('getTotalItems soma quantidades', () => {
    const items = [
      { product: { id: '1', name: 'A', price: 1, stock: 1 }, quantity: 2 },
      { product: { id: '2', name: 'B', price: 1, stock: 1 }, quantity: 5 },
    ];
    expect(getTotalItems(items)).toBe(7);
    expect(getTotalItems([])).toBe(0);
  });

  it('formatCurrency retorna string formatada', () => {
    expect(formatCurrency(1234.56)).toMatch(/1.234,56/);
    expect(formatCurrency(0)).toMatch(/0,00/);
  expect(formatCurrency(-10)).toMatch(/-R\$\s?10,00/);
  });

  it('formatDate retorna data pt-BR', () => {
    const d = new Date('2025-10-08T12:34:00');
    expect(formatDate(d)).toMatch(/08\/10\/2025/);
  });

  it('formatTime retorna hora e minuto', () => {
    const d = new Date('2025-10-08T09:07:00');
    expect(formatTime(d)).toMatch(/09:07/);
  });
});
