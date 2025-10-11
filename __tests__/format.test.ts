import { formatCurrency, parseNumber, parseBRDateToISO, combineDateTimeBR, sortTransactionsDesc, salesToTransactions } from '../utils/format';

describe('formatCurrency', () => {
  it('formats BRL correctly', () => {
    expect(formatCurrency(1234.56)).toBe('R$ 1.234,56');
  });
  it('formats USD if specified', () => {
    expect(formatCurrency(100, 'en-US', 'USD')).toBe('$100.00');
  });
});

describe('parseNumber', () => {
  it('parses string with comma', () => {
    expect(parseNumber('12,5')).toBe(12.5);
  });
  it('parses string with dot', () => {
    expect(parseNumber('7.2')).toBe(7.2);
  });
  it('returns 0 for invalid', () => {
    expect(parseNumber('abc')).toBe(0);
  });
});

describe('parseBRDateToISO', () => {
  it('converts dd/mm/yyyy to ISO', () => {
    expect(parseBRDateToISO('08/10/2025')).toBe('2025-10-08');
  });
  it('returns null for invalid', () => {
    expect(parseBRDateToISO('2025-10-08')).toBeNull();
  });
});

describe('combineDateTimeBR', () => {
  it('combines date and time', () => {
    const d = combineDateTimeBR('08/10/2025', '14:30');
    expect(d).toBeInstanceOf(Date);
    expect(d?.getFullYear()).toBe(2025);
    expect(d?.getMonth()).toBe(9); // October is 9
    expect(d?.getDate()).toBe(8);
    expect(d?.getHours()).toBe(14);
    expect(d?.getMinutes()).toBe(30);
  });
  it('returns null for invalid', () => {
    expect(combineDateTimeBR('2025-10-08', '14:30')).toBeNull();
  });
});

describe('sortTransactionsDesc', () => {
  it('sorts by date and time descending', () => {
    const arr = [
      { date: '07/10/2025', time: '10:00' },
      { date: '08/10/2025', time: '09:00' },
      { date: '08/10/2025', time: '15:00' },
    ];
    const sorted = sortTransactionsDesc(arr);
    expect(sorted[0].time).toBe('15:00');
    expect(sorted[1].time).toBe('09:00');
    expect(sorted[2].date).toBe('07/10/2025');
  });
});

describe('salesToTransactions', () => {
  it('converts sales to transactions', () => {
    const sales = [
      { id: '1', total: 50, date: '08/10/2025', time: '12:00', isDirectSale: true },
      { id: '2', total: 30, date: '08/10/2025', time: '13:00', comandaNumber: 5 },
    ];
    const txs = salesToTransactions(sales as any);
    expect(txs[0].id).toBe('sale_tx_1');
    expect(txs[0].type).toBe('income');
    expect(txs[1].description).toContain('Comanda #5');
  });
});
