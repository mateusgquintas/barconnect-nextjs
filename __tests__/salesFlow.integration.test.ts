import { salesToTransactions } from '../utils/format';

// We simulate a minimal end-to-end logical flow: given sale records (direct & comanda, courtesy)
// they must convert into income transactions with expected description patterns & ordering.

describe('Sales -> Transactions flow', () => {
  it('converts mixed sales into consistent income transactions', () => {
    const sales = [
      { id: '10', total: 80, date: '08/10/2025', time: '10:00', isDirectSale: true, paymentMethod: 'pix' },
      { id: '11', total: 40, date: '08/10/2025', time: '11:00', comandaNumber: 7, paymentMethod: 'cartao' },
      { id: '12', total: 0,  date: '08/10/2025', time: '11:30', isCourtesy: true, isDirectSale: true, paymentMethod: 'pix' },
  { id: '13', total: 25, date: '08/10/2025', time: '12:00', isCourtesy: true, comandaNumber: 9, paymentMethod: 'cash' },
    ] as any;

    const txs = salesToTransactions(sales);
    expect(txs).toHaveLength(4);
    // IDs are prefixed
    expect(txs[0].id).toBe('sale_tx_10');
    // All income
    txs.forEach(t => expect(t.type).toBe('income'));
    // Descriptions patterns
    expect(txs[0].description).toMatch(/Venda Direta/);
    expect(txs[1].description).toMatch(/Comanda #7/);
    expect(txs[2].description).toMatch(/Cortesia/);
    expect(txs[3].description).toMatch(/Cortesia/);
    // Amount mapping
    expect(txs.map(t => t.amount)).toEqual([80,40,0,25]);
  });
});
