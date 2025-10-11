import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../hooks/useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('retorna valor inicial se localStorage vazio', () => {
    const { result } = renderHook(() => useLocalStorage('key', 'init'));
    expect(result.current[0]).toBe('init');
  });

  it('lê valor existente do localStorage', () => {
    window.localStorage.setItem('key', JSON.stringify('persistido'));
    const { result } = renderHook(() => useLocalStorage('key', 'init'));
    expect(result.current[0]).toBe('persistido');
  });

  it('atualiza valor e persiste no localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('key', 'init'));
    act(() => {
      result.current[1]('novo');
    });
    expect(result.current[0]).toBe('novo');
    expect(window.localStorage.getItem('key')).toBe(JSON.stringify('novo'));
  });

  it('remove valor do localStorage', () => {
    window.localStorage.setItem('key', JSON.stringify('persistido'));
    const { result } = renderHook(() => useLocalStorage('key', 'init'));
    act(() => {
      result.current[2]();
    });
    expect(result.current[0]).toBe('init');
    expect(window.localStorage.getItem('key')).toBeNull();
  });

  it('trata JSON inválido no localStorage', () => {
    window.localStorage.setItem('key', 'INVALID_JSON');
    const { result } = renderHook(() => useLocalStorage('key', 'init'));
    expect(result.current[0]).toBe('init');
  });
});
