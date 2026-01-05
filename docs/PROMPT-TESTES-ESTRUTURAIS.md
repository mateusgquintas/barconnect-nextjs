# 🧪 Prompt para Criação de Testes Estruturais - BarConnect

## 📋 Contexto do Projeto

Você está trabalhando no **BarConnect**, uma aplicação Next.js 15+ com TypeScript que gerencia operações de bar/restaurante incluindo:
- Comandas e transações
- Catálogo de produtos e estoque
- Romarias e eventos
- Dashboard de controladoria
- Agenda e reservas
- Sistema de autenticação

**Stack Tecnológica:**
- Next.js 15+ (App Router)
- TypeScript
- React 19+
- Tailwind CSS
- Radix UI
- Supabase (Banco de dados)
- Jest + React Testing Library
- Zustand (Estado global)

---

## 🎯 Objetivo dos Testes Estruturais

Os testes estruturais devem validar a **integridade arquitetural** do aplicativo, garantindo:

1. **Coerência estrutural** entre módulos
2. **Fluxos críticos** de ponta a ponta
3. **Contratos de API** e interfaces
4. **Integração entre camadas** (UI → Hooks → Services → Database)
5. **Padrões de código** e convenções
6. **Acessibilidade** (a11y) e **Performance**
7. **Responsividade** e compatibilidade

---

## 📁 Estrutura de Pastas de Teste

```
__tests__/
├── [ComponentName].test.tsx              # Testes unitários de componentes
├── [ComponentName].comprehensive.test.tsx # Testes abrangentes
├── [ComponentName].a11y.test.tsx         # Testes de acessibilidade
├── [ComponentName].integration.test.tsx  # Testes de integração
├── [flowName].flow.integration.test.tsx  # Testes de fluxo E2E
├── [hookName].test.ts                    # Testes de hooks
├── [serviceName].test.ts                 # Testes de serviços
├── utils/                                # Testes de utilitários
└── archive/                              # Testes arquivados
```

---

## 🏗️ Tipos de Testes Estruturais

### 1. **Testes de Componentes (Component Tests)**

**Quando criar:**
- Novo componente criado
- Componente com lógica complexa
- Componentes reutilizáveis (UI primitives)

**O que testar:**
```typescript
describe('[ComponentName]', () => {
  // ✅ Renderização básica
  it('should render without crashing', () => {})
  
  // ✅ Props obrigatórias
  it('should render with required props', () => {})
  
  // ✅ Estados visuais
  it('should render in loading state', () => {})
  it('should render in error state', () => {})
  it('should render in empty state', () => {})
  
  // ✅ Interações do usuário
  it('should handle user interactions correctly', () => {})
  
  // ✅ Eventos e callbacks
  it('should call callback on button click', () => {})
  
  // ✅ Renderização condicional
  it('should conditionally render elements based on props', () => {})
  
  // ✅ Integrações com hooks
  it('should integrate with custom hooks correctly', () => {})
});
```

**Padrões importantes:**
- Usar `screen.getByRole()` preferencialmente
- Usar `userEvent` ao invés de `fireEvent`
- Mock de dependências externas (Supabase, APIs)
- Limpar mocks com `jest.clearAllMocks()` no `beforeEach`

---

### 2. **Testes Abrangentes (Comprehensive Tests)**

**Quando criar:**
- Componentes críticos do sistema
- Componentes com múltiplas responsabilidades
- Componentes complexos (tabelas, formulários, dashboards)

**Estrutura de teste abrangente:**
```typescript
describe('[ComponentName] - Comprehensive Tests', () => {
  describe('Rendering & Structure', () => {
    it('should render all main sections', () => {})
    it('should apply correct CSS classes', () => {})
    it('should render with correct semantic HTML', () => {})
  });

  describe('Data Handling', () => {
    it('should handle empty data state', () => {})
    it('should handle loading state', () => {})
    it('should handle error state', () => {})
    it('should display data correctly', () => {})
  });

  describe('User Interactions', () => {
    it('should handle search/filter interactions', () => {})
    it('should handle sorting interactions', () => {})
    it('should handle CRUD operations', () => {})
    it('should handle keyboard navigation', () => {})
  });

  describe('Edge Cases', () => {
    it('should handle very large datasets', () => {})
    it('should handle special characters in input', () => {})
    it('should handle concurrent operations', () => {})
  });

  describe('Performance', () => {
    it('should not cause unnecessary re-renders', () => {})
    it('should debounce expensive operations', () => {})
  });
});
```

---

### 3. **Testes de Acessibilidade (a11y Tests)**

**Quando criar:**
- Todo componente interativo
- Formulários e dialogs
- Componentes de navegação

**O que testar:**
```typescript
describe('[ComponentName] - Accessibility', () => {
  it('should have proper ARIA labels', () => {
    // Verificar aria-label, aria-labelledby, aria-describedby
  });

  it('should be keyboard navigable', () => {
    // Testar Tab, Enter, Escape, Arrow keys
  });

  it('should have proper focus management', () => {
    // Verificar focus trapping em modals
  });

  it('should have sufficient color contrast', () => {
    // Validar contraste de cores (WCAG AA/AAA)
  });

  it('should announce dynamic content changes', () => {
    // Usar aria-live, role="status"
  });

  it('should support screen readers', () => {
    // Usar getByRole, getByLabelText
  });

  it('should have proper heading hierarchy', () => {
    // h1 > h2 > h3 (sem pular níveis)
  });
});
```

---

### 4. **Testes de Integração (Integration Tests)**

**Quando criar:**
- Integração entre componentes
- Fluxos que envolvem múltiplas camadas
- Operações com banco de dados

**Estrutura:**
```typescript
describe('[Feature] - Integration', () => {
  beforeEach(() => {
    // Setup completo do ambiente
  });

  it('should complete end-to-end user flow', async () => {
    // 1. Renderizar
    render(<Feature />);
    
    // 2. Interagir (múltiplas etapas)
    await userEvent.click(screen.getByRole('button', { name: /adicionar/i }));
    await userEvent.type(screen.getByLabelText(/nome/i), 'Produto Teste');
    
    // 3. Submeter
    await userEvent.click(screen.getByRole('button', { name: /salvar/i }));
    
    // 4. Validar resultado
    expect(await screen.findByText(/produto adicionado/i)).toBeInTheDocument();
  });

  it('should handle error scenarios gracefully', async () => {
    // Simular erro no serviço
    // Validar feedback ao usuário
  });
});
```

---

### 5. **Testes de Fluxo (Flow Tests)**

**Quando criar:**
- Jornadas críticas do usuário
- Processos multi-step
- Fluxos de pagamento, checkout, etc.

**Exemplo:**
```typescript
describe('Sales -> Transactions Flow', () => {
  it('should convert sales to transactions correctly', () => {
    // Dado: Vendas mistas (direta, comanda, cortesia)
    const sales = [...];
    
    // Quando: Converter para transações
    const transactions = salesToTransactions(sales);
    
    // Então: Validar estrutura e dados
    expect(transactions).toHaveLength(4);
    expect(transactions[0].type).toBe('income');
    expect(transactions[0].description).toMatch(/Venda Direta/);
  });

  it('should maintain data integrity across operations', () => {
    // Testar consistência de dados através do fluxo completo
  });
});
```

---

### 6. **Testes de Hooks**

**Quando criar:**
- Custom hooks criados
- Hooks com lógica complexa
- Hooks que gerenciam estado global

**Estrutura:**
```typescript
import { renderHook, act, waitFor } from '@testing-library/react';

describe('useProductsDB', () => {
  it('should initialize with empty products', () => {
    const { result } = renderHook(() => useProductsDB());
    expect(result.current.products).toEqual([]);
  });

  it('should add product successfully', async () => {
    const { result } = renderHook(() => useProductsDB());
    
    await act(async () => {
      await result.current.addProduct(mockProduct);
    });

    expect(result.current.products).toHaveLength(1);
  });

  it('should handle concurrent operations', async () => {
    // Testar race conditions
  });

  it('should handle errors gracefully', async () => {
    // Mock erro do Supabase
    // Validar estado de erro
  });
});
```

---

### 7. **Testes de Serviços (Service Tests)**

**Quando criar:**
- Camada de serviços (API calls)
- Lógica de negócio isolada
- Utilitários de transformação de dados

**Estrutura:**
```typescript
describe('salesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateTotal', () => {
    it('should calculate total correctly', () => {
      const items = [
        { price: 10, quantity: 2 },
        { price: 5, quantity: 3 }
      ];
      expect(calculateTotal(items)).toBe(35);
    });

    it('should handle empty items', () => {
      expect(calculateTotal([])).toBe(0);
    });

    it('should handle decimal prices', () => {
      const items = [{ price: 10.99, quantity: 2 }];
      expect(calculateTotal(items)).toBeCloseTo(21.98, 2);
    });
  });
});
```

---

### 8. **Testes de Responsividade**

**Quando criar:**
- Componentes com layouts adaptativos
- Componentes mobile-first

**Estrutura:**
```typescript
describe('[ComponentName] - Responsiveness', () => {
  const sizes = {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1920, height: 1080 }
  };

  Object.entries(sizes).forEach(([device, dimensions]) => {
    describe(`${device} (${dimensions.width}x${dimensions.height})`, () => {
      beforeEach(() => {
        global.innerWidth = dimensions.width;
        global.innerHeight = dimensions.height;
        global.dispatchEvent(new Event('resize'));
      });

      it('should render correctly', () => {
        // Validar layout específico do dispositivo
      });
    });
  });
});
```

---

### 9. **Testes de Performance**

**Quando criar:**
- Componentes com grandes datasets
- Operações computacionalmente intensivas

**Estrutura:**
```typescript
describe('[ComponentName] - Performance', () => {
  it('should render large list efficiently', () => {
    const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`
    }));

    const startTime = performance.now();
    render(<ComponentName data={largeDataset} />);
    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(1000); // < 1 segundo
  });

  it('should not cause memory leaks', () => {
    const { unmount } = render(<ComponentName />);
    unmount();
    // Verificar limpeza de event listeners, timers, etc.
  });
});
```

---

## 🎨 Padrões e Convenções

### Nomenclatura de Arquivos
```
✅ CORRETO:
- Dashboard.test.tsx                      # Teste unitário
- Dashboard.comprehensive.test.tsx        # Teste abrangente
- Dashboard.a11y.test.tsx                 # Teste de acessibilidade
- salesFlow.integration.test.ts           # Teste de integração/fluxo
- useProductsDB.test.ts                   # Teste de hook
- calculations.test.ts                    # Teste de utilitário

❌ INCORRETO:
- dashboard.spec.tsx
- DashboardTest.tsx
- test-dashboard.tsx
```

### Nomenclatura de Testes
```typescript
// ✅ BOM: Descritivo e claro
it('should display error message when form submission fails', () => {})

// ❌ RUIM: Vago
it('should work', () => {})
it('test 1', () => {})
```

### Organização de Describes
```typescript
describe('[ComponentName]', () => {
  describe('[Funcionalidade/Aspecto]', () => {
    it('should [comportamento esperado]', () => {})
  });
});
```

---

## 🛠️ Mocks e Stubs Padrão

### Mock de useProductsDB
```typescript
jest.mock('@/hooks/useProductsDB', () => ({
  useProductsDB: jest.fn(),
}));

const mockUseProductsDB = require('@/hooks/useProductsDB').useProductsDB as jest.Mock;

beforeEach(() => {
  mockUseProductsDB.mockReturnValue({
    products: [],
    loading: false,
    error: null,
    addProduct: jest.fn(),
    updateProduct: jest.fn(),
    deleteProduct: jest.fn(),
  });
});
```

### Mock de Supabase
```typescript
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => Promise.resolve({ data: [], error: null })),
      insert: jest.fn(() => Promise.resolve({ data: [], error: null })),
      update: jest.fn(() => Promise.resolve({ data: [], error: null })),
      delete: jest.fn(() => Promise.resolve({ data: [], error: null })),
    })),
  },
}));
```

### Mock de ResizeObserver
```typescript
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
```

### Mock de Next Router
```typescript
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/test-path',
  useSearchParams: () => new URLSearchParams(),
}));
```

---

## ✅ Checklist de Teste Completo

Ao criar testes estruturais, certifique-se de:

### Cobertura Básica
- [ ] Renderização sem erros
- [ ] Props obrigatórias validadas
- [ ] Estados visuais (loading, error, empty, success)
- [ ] Interações básicas do usuário

### Cobertura Avançada
- [ ] Testes de acessibilidade (ARIA, keyboard, focus)
- [ ] Testes de responsividade (mobile, tablet, desktop)
- [ ] Testes de edge cases (dados vazios, valores extremos)
- [ ] Testes de performance (grandes datasets, renderizações)

### Integração
- [ ] Fluxos end-to-end críticos
- [ ] Integração entre componentes
- [ ] Integração com serviços/APIs
- [ ] Integração com banco de dados

### Qualidade do Código de Teste
- [ ] Nomes descritivos e claros
- [ ] Arrange-Act-Assert bem definido
- [ ] Mocks apropriados e limpos
- [ ] Sem flakiness (testes instáveis)
- [ ] Comentários explicativos quando necessário

---

## 🚨 Anti-Padrões (Evite!)

### ❌ Testar implementação ao invés de comportamento
```typescript
// RUIM
it('should call useState', () => {
  // Testar detalhes de implementação
});

// BOM
it('should update counter when button is clicked', () => {
  // Testar comportamento do usuário
});
```

### ❌ Testes muito acoplados
```typescript
// RUIM: Depende de estrutura interna
expect(wrapper.find('.internal-class')).toHaveLength(1);

// BOM: Usa API pública
expect(screen.getByRole('button', { name: /adicionar/i })).toBeInTheDocument();
```

### ❌ Testes que fazem múltiplas coisas
```typescript
// RUIM
it('should do everything', () => {
  // 50 linhas de código testando 10 coisas diferentes
});

// BOM: Um teste = um comportamento
it('should add product to cart', () => {})
it('should remove product from cart', () => {})
```

### ❌ Não limpar estado entre testes
```typescript
// RUIM: Estado vazando entre testes
describe('Tests', () => {
  let sharedState = {};
  it('test 1', () => { sharedState.value = 1; })
  it('test 2', () => { expect(sharedState.value).toBe(1); }) // FLAKY!
});

// BOM: Cada teste é independente
describe('Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset estado
  });
});
```

---

## 📊 Metas de Cobertura

### Níveis de Cobertura Atuais
```javascript
coverageThreshold: {
  global: {
    statements: 30,
    branches: 20,
    functions: 25,
    lines: 30,
  }
}
```

### Metas Progressivas
- **Fase 1** (Atual): 30% statements, 20% branches
- **Fase 2** (3 meses): 50% statements, 35% branches
- **Fase 3** (6 meses): 70% statements, 50% branches
- **Fase 4** (9 meses): 80% statements, 65% branches

### Áreas Prioritárias para Cobertura
1. **Crítico** (80%+): Autenticação, Transações financeiras, CRUD de comandas
2. **Alto** (70%+): Dashboard, Estoque, Agenda
3. **Médio** (50%+): Componentes UI reutilizáveis
4. **Baixo** (30%+): Páginas estáticas, componentes de layout

---

## 🔄 Workflow de Criação de Testes

### 1. Análise
- Identificar componente/funcionalidade a testar
- Mapear casos de uso e fluxos
- Identificar dependências externas

### 2. Planejamento
- Definir tipo de teste (unitário, integração, E2E)
- Listar cenários a cobrir
- Preparar mocks necessários

### 3. Implementação
- Criar arquivo de teste seguindo nomenclatura
- Implementar setup (beforeEach, mocks)
- Escrever testes seguindo AAA pattern
- Validar com `npm test`

### 4. Validação
- Executar `npm run test:coverage`
- Verificar se cobertura aumentou
- Revisar qualidade dos testes
- Refatorar se necessário

### 5. Documentação
- Adicionar comentários explicativos
- Documentar casos de edge conhecidos
- Atualizar README se aplicável

---

## 🎯 Prompt de Execução

**Quando precisar criar testes, use este prompt:**

```
Crie testes estruturais completos para [COMPONENTE/FUNCIONALIDADE].

Contexto:
- Arquivo principal: [PATH_TO_FILE]
- Tipo de teste: [unitário/integração/E2E/abrangente]
- Dependências: [listar hooks, services, components usados]

Requisitos:
1. Siga a estrutura de pastas __tests__/
2. Nomeie o arquivo como [Nome].test.tsx ou [Nome].comprehensive.test.tsx
3. Inclua:
   - Testes de renderização básica
   - Testes de interação do usuário
   - Testes de estados (loading, error, empty, success)
   - Testes de edge cases
   - Testes de acessibilidade (se aplicável)
4. Mock todas as dependências externas (Supabase, hooks, APIs)
5. Use React Testing Library (screen, userEvent, waitFor)
6. Siga o padrão AAA (Arrange-Act-Assert)
7. Garanta que os testes sejam:
   - Determinísticos (não flaky)
   - Independentes (não compartilham estado)
   - Rápidos (< 5s cada)
   - Legíveis (nomes descritivos)

Cobertura esperada:
- Mínimo 80% do código do componente
- Todos os handlers e callbacks
- Todos os estados visuais
- Principais fluxos de interação

Forneça o código completo do teste, pronto para ser salvo e executado.
```

---

## 📚 Recursos e Referências

### Documentação Oficial
- [Jest](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library User Event](https://testing-library.com/docs/user-event/intro)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)

### Padrões do Projeto
- Configuração Jest: `/jest.config.js`
- Setup de testes: `/jest.setup.ts`
- Exemplos de testes: `/__tests__/`

### Comandos Úteis
```bash
# Executar todos os testes
npm test

# Executar com cobertura
npm run test:coverage

# Executar teste específico
npm test Dashboard.test.tsx

# Executar em modo watch
npm test -- --watch

# Executar com output verbose
npm test -- --verbose
```

---

## 🎓 Exemplos Práticos

### Exemplo 1: Teste Unitário Simples
```typescript
import { render, screen } from '@testing-library/react';
import { formatCurrency } from '@/utils/format';

describe('formatCurrency', () => {
  it('should format number as BRL currency', () => {
    expect(formatCurrency(10.5)).toBe('R$ 10,50');
  });

  it('should handle zero', () => {
    expect(formatCurrency(0)).toBe('R$ 0,00');
  });

  it('should handle negative values', () => {
    expect(formatCurrency(-5)).toBe('-R$ 5,00');
  });
});
```

### Exemplo 2: Teste de Componente com Interação
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NewComandaDialog } from '@/components/NewComandaDialog';

describe('NewComandaDialog', () => {
  it('should create comanda when form is submitted', async () => {
    const onAdd = jest.fn();
    render(<NewComandaDialog open={true} onAdd={onAdd} />);

    const input = screen.getByLabelText(/número da comanda/i);
    await userEvent.type(input, '123');

    const submitButton = screen.getByRole('button', { name: /criar/i });
    await userEvent.click(submitButton);

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ number: 123 })
    );
  });
});
```

### Exemplo 3: Teste de Hook com Estado Assíncrono
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useProductsDB } from '@/hooks/useProductsDB';

describe('useProductsDB', () => {
  it('should load products on mount', async () => {
    const { result } = renderHook(() => useProductsDB());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.products.length).toBeGreaterThan(0);
  });
});
```

---

## 🔍 Debugging de Testes

### Técnicas Úteis
```typescript
// Ver HTML renderizado
screen.debug();

// Ver elemento específico
screen.debug(screen.getByRole('button'));

// Logs detalhados
console.log(screen.getByRole('button').outerHTML);

// Queries disponíveis
screen.logTestingPlaygroundURL();

// Pausar execução
await new Promise(r => setTimeout(r, 1000));
```

### Resolver Problemas Comuns

**Problema: "Unable to find role"**
```typescript
// Use screen.debug() para ver estrutura HTML
screen.debug();

// Ou use query menos específica temporariamente
screen.getByText(/texto/i);
```

**Problema: "Test timeout"**
```typescript
// Aumentar timeout específico do teste
it('slow test', async () => {
  // ...
}, 10000); // 10 segundos

// Ou usar waitFor com timeout customizado
await waitFor(() => expect(...).toBe(...), { timeout: 5000 });
```

**Problema: "Act warnings"**
```typescript
// Sempre use act() ou waitFor() para operações assíncronas
import { act, waitFor } from '@testing-library/react';

await act(async () => {
  await result.current.someAsyncFunction();
});

// Ou
await waitFor(() => {
  expect(result.current.data).toBeDefined();
});
```

---

## 📈 Métricas de Sucesso

Um bom conjunto de testes estruturais deve:

✅ **Ter alta cobertura** (>70% nos módulos críticos)  
✅ **Executar rapidamente** (< 30s para suite completa)  
✅ **Ser determinístico** (0% de flakiness)  
✅ **Ser legível** (qualquer dev entende o teste)  
✅ **Ser mantível** (fácil de atualizar quando código muda)  
✅ **Detectar regressões** (falha quando bug é introduzido)  
✅ **Documentar comportamento** (testes servem como documentação)

---

## 🚀 Próximos Passos

1. **Auditoria de Cobertura**: Identificar gaps de cobertura críticos
2. **Priorização**: Criar testes para áreas de maior risco
3. **Automação**: Integrar testes no CI/CD pipeline
4. **Refatoração**: Melhorar qualidade dos testes existentes
5. **Educação**: Treinar time em boas práticas de teste

---

**Última atualização**: 11 de Dezembro de 2025  
**Versão**: 1.0.0  
**Autor**: BarConnect Team
