import { renderHook, act } from '@testing-library/react';
import { useDateFilter } from '../hooks/useDateFilter';

describe('useDateFilter', () => {
  const MOCK_TODAY = new Date('2025-10-08T12:00:00');
  let RealDate: DateConstructor;

  beforeAll(() => {
    RealDate = Date;
    global.Date = class extends RealDate {
      constructor(...args: any[]) {
        if (args.length === 0) {
          super(MOCK_TODAY.getTime());
        } else if (args.length === 1) {
          super(args[0]);
        } else if (args.length === 2) {
          super(args[0], args[1]);
        } else if (args.length === 3) {
          super(args[0], args[1], args[2]);
        } else if (args.length === 4) {
          super(args[0], args[1], args[2], args[3]);
        } else if (args.length === 5) {
          super(args[0], args[1], args[2], args[3], args[4]);
        } else if (args.length === 6) {
          super(args[0], args[1], args[2], args[3], args[4], args[5]);
        } else if (args.length === 7) {
          super(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
        } else {
          super();
        }
      }
      static now() { return MOCK_TODAY.getTime(); }
      static parse = RealDate.parse;
      static UTC = RealDate.UTC;
    } as any;
  });

  afterAll(() => {
    global.Date = RealDate;
  });
  it('inicializa datas padrão corretamente', () => {
    const { result } = renderHook(() => useDateFilter());
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    expect(result.current.startDate).toBe(firstDay.toISOString().split('T')[0]);
    expect(result.current.endDate).toBe(today.toISOString().split('T')[0]);
  });

  it('isInPeriod retorna true para datas dentro do intervalo', () => {
    const { result } = renderHook(() => useDateFilter());
    act(() => {
      result.current.setStartDate('2025-10-01'); // ISO
      result.current.setEndDate('2025-10-08');   // ISO
    });
    expect(result.current.isInPeriod('05/10/2025')).toBe(true); // dd/mm/yyyy
  });

  it('isInPeriod retorna true para limites inclusivos', () => {
    const { result } = renderHook(() => useDateFilter());
    act(() => {
      result.current.setStartDate('2025-10-01');
      result.current.setEndDate('2025-10-08');
    });
    expect(result.current.isInPeriod('01/10/2025')).toBe(true);
    expect(result.current.isInPeriod('08/10/2025')).toBe(true);
  });

  it('isInPeriod retorna false para fora do intervalo', () => {
    const { result } = renderHook(() => useDateFilter());
    act(() => {
      result.current.setStartDate('2025-10-01');
      result.current.setEndDate('2025-10-08');
    });
    expect(result.current.isInPeriod('30/09/2025')).toBe(false);
    expect(result.current.isInPeriod('09/10/2025')).toBe(false);
  });

  it('isInPeriod lida com formato inválido', () => {
    const { result } = renderHook(() => useDateFilter());
    act(() => {
      result.current.setStartDate('2025-10-01');
      result.current.setEndDate('2025-10-08');
    });
    expect(result.current.isInPeriod('2025-10-05')).toBe(false); // formato errado
    expect(result.current.isInPeriod('')).toBe(false);
  });
});
