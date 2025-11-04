import '@testing-library/jest-dom';

// Mock global e seguro do cliente Supabase para evitar chamadas reais em testes
// Mantém a lógica dos hooks intacta. Testes podem sobrescrever com jest.mock local.

// Datasets padrão compartilhados
const __mockDB = {
  products: [
    { id: '1', name: 'Coca', price: '5', stock: 10 },
    { id: '2', name: 'Fanta', price: 4, stock: 2, category: null },
  ],
  transactions: [
    { id: 't2', type: 'income', description: 'Venda B', amount: 40, category: 'Vendas', created_at: new Date(Date.now()-2000).toISOString(), date: undefined, time: undefined },
    { id: 't1', type: 'income', description: 'Venda A', amount: 20, category: 'Vendas', created_at: new Date(Date.now()-4000).toISOString(), date: undefined, time: undefined },
  ],
  comandas: [
    { id: 'cmd-1', number: 123, customer_name: 'Test Customer', status: 'open', created_at: new Date('2025-10-09T14:30:00').toISOString(), comanda_items: [] },
  ],
};

const createSupabaseChainFor = (table?: string) => {
  let pendingUpdate: any = null;
  let pendingInsert: any = null;
  const chain: any = {
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockImplementation((..._args: any[]) => {
      let data: any[] = [];
      if (table === 'products') data = __mockDB.products;
      else if (table === 'transactions') data = __mockDB.transactions;
      else if (table === 'comandas') data = __mockDB.comandas;
      return Promise.resolve({ data, error: null });
    }),
    update: jest.fn().mockImplementation((payload: any) => { pendingUpdate = payload; return chain; }),
    insert: jest.fn().mockImplementation((payload: any) => { pendingInsert = payload; return chain; }),
    eq: jest.fn().mockImplementation((field: string, value: any) => {
      // Para products, não mutar dataset por padrão (testes unitários esperam coleção estável)
      pendingUpdate = null;
      return Promise.resolve({ error: null });
    }),
    single: jest.fn().mockImplementation(() => {
      if (table === 'comandas') {
        return Promise.resolve({ data: { id: 'new-cmd' }, error: null });
      }
      return Promise.resolve({ data: { id: 'new-id' }, error: null });
    }),
    maybeSingle: jest.fn().mockImplementation(() => {
      // Para testes de autenticação
      if (table === 'users') {
        // Retornar dados mockados de usuários
        return Promise.resolve({ 
          data: null, // Por padrão retorna null (usuário não encontrado)
          error: null 
        });
      }
      return Promise.resolve({ data: null, error: null });
    }),
  };

  // Implementar comportamento de insert por tabela (inclui caso de erro esperado em testes)
  chain.insert = jest.fn().mockImplementation((payload: any) => {
    const row = Array.isArray(payload) ? payload[0] : payload;
    if (table === 'products') {
      // Simular erro específico usado em testes quando name === 'Test'
      if (row && row.name === 'Test') {
        return Promise.resolve({ error: { message: 'Insert failed' } });
      }
      // Não mutar dataset global por padrão
      return Promise.resolve({ error: null });
    }
    if (table === 'transactions') {
      const id = row.id || `new_${Math.random().toString(36).slice(2, 8)}`;
      __mockDB.transactions.unshift({ id, ...row, created_at: new Date().toISOString() });
      return Promise.resolve({ error: null });
    }
    if (table === 'comandas') {
      const id = row.id || `cmd_${Math.random().toString(36).slice(2, 8)}`;
      __mockDB.comandas.unshift({ id, ...row, created_at: new Date().toISOString(), status: 'open' });
      // Compatível com select().single() encadeado
      return chain;
    }
    return Promise.resolve({ error: null });
  });

  return chain;
};

// Suporta importações com alias (@/lib/supabase) e relativas (../lib/supabase)
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn((table?: string) => createSupabaseChainFor(table)),
  },
}));

// Além disso, faça patch no módulo real resolvido por caminho relativo para compartilhar o mesmo mock
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const real = require('./lib/supabase');
  if (real && real.supabase) {
    real.supabase.from = jest.fn((table?: string) => createSupabaseChainFor(table));
  }
} catch {}

// Limpa o cache global entre testes para evitar poluição de estado
afterEach(() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { globalCache } = require('./lib/cache');
    globalCache.invalidate();
  } catch {}
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.navigator.serviceWorker
Object.defineProperty(window.navigator, 'serviceWorker', {
  writable: true,
  value: {
    register: jest.fn().mockResolvedValue({ 
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      update: jest.fn(),
      unregister: jest.fn()
    }),
    ready: Promise.resolve({ 
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    }),
    controller: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
});

// Mock window.screen
Object.defineProperty(window, 'screen', {
  writable: true,
  value: {
    width: 1024,
    height: 768,
  },
});

// Mock window.innerWidth and innerHeight
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 768,
});

// Provide deterministic computed style metrics for tests
const originalGetComputedStyle = window.getComputedStyle.bind(window);
window.getComputedStyle = ((elt: Element) => {
  const style = originalGetComputedStyle(elt) as any;
  // Clone into a simple object so we can override fields safely
  const computed: any = { ...style };
  const tag = (elt as HTMLElement).tagName ? (elt as HTMLElement).tagName.toLowerCase() : '';

  // Ensure height/width resolve to pixels for interactive elements
  const heightStr = String(style.height || '');
  if (!heightStr || heightStr === 'auto' || heightStr === 'normal') {
    if (elt instanceof HTMLElement && elt.style?.height) {
      computed.height = elt.style.height;
    } else {
      computed.height = '40px';
    }
  } else {
    computed.height = heightStr;
  }
  const widthStr = String(style.width || '');
  if (!widthStr || widthStr === 'auto' || widthStr === 'normal') {
    if (elt instanceof HTMLElement && elt.style?.width) {
      computed.width = elt.style.width;
    } else {
      computed.width = '80px';
    }
  } else {
    computed.width = widthStr;
  }

  // Ensure line-height is numeric in px
  const lh = parseFloat(style.lineHeight as any);
  if (isNaN(lh) || style.lineHeight === 'normal' || !style.lineHeight) {
    const fs = parseFloat(style.fontSize as any) || 16;
    computed.lineHeight = `${Math.round(fs * 1.5)}px`;
  } else {
    computed.lineHeight = `${lh}px`;
  }

  // Provide a non-transparent color fallback to avoid equality with background
  computed.color = style.color || 'rgb(0, 0, 0)';
  computed.backgroundColor = style.backgroundColor || 'rgb(255, 255, 255)';
  
  // Add getPropertyValue method that accessibility libraries expect
  computed.getPropertyValue = (property: string) => {
    // Map CSS property names to object properties
    const propMap: Record<string, string> = {
      'color': computed.color,
      'background-color': computed.backgroundColor,
      'height': computed.height,
      'width': computed.width,
      'line-height': computed.lineHeight,
      'font-size': computed.fontSize || '16px',
      'display': computed.display || 'block',
      'visibility': computed.visibility || 'visible'
    };
    return propMap[property] || computed[property] || '';
  };

  return computed;
}) as any;

// Mock getBoundingClientRect to use computed dimensions for interactive elements
const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
Element.prototype.getBoundingClientRect = function (): DOMRect {
  try {
    const style = window.getComputedStyle(this as Element) as any;
    const height = parseFloat(style.height as any) || 44;
    const width = parseFloat(style.width as any) || 80;
    return {
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      bottom: height,
      right: width,
      height,
      width,
      toJSON() { return {}; }
    } as DOMRect;
  } catch {
    return originalGetBoundingClientRect.call(this);
  }
};

// Reduce noisy logs during test runs. Opt-out by setting VERBOSE_TEST_LOGS=true
const shouldSilence = !process.env.VERBOSE_TEST_LOGS;
if (shouldSilence) {
  const noop = () => {};
  // Keep warnings and errors, silence info/log by default
  // You can temporarily re-enable in a specific test by spying and restoring
  // e.g., const spy = jest.spyOn(console, 'log').mockImplementation(() => {})
  // and later spy.mockRestore()
  // eslint-disable-next-line no-console
  console.log = noop as any;
  // eslint-disable-next-line no-console
  console.info = noop as any;

  // Filter known, harmless Radix Dialog a11y dev warnings that trigger before children mount in JSDOM
  // We still ensure proper ARIA wiring in components; this avoids noisy test output only.
  const originalWarn = console.warn.bind(console);
  const originalError = console.error.bind(console);
  // eslint-disable-next-line no-console
  console.warn = ((...args: any[]) => {
    const first = String(args?.[0] ?? '');
    if (first.includes('Missing `Description`') && first.includes('{DialogContent}')) {
      return;
    }
    return originalWarn(...(args as any));
  }) as any;
  // eslint-disable-next-line no-console
  console.error = ((...args: any[]) => {
    const first = String(args?.[0] ?? '');
    if (first.includes('`DialogContent` requires a `DialogTitle`')) {
      return;
    }
    return originalError(...(args as any));
  }) as any;
}
