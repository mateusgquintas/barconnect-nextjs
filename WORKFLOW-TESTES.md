# 🧪 Workflow de Testes - BarConnect

## 📋 Índice
- [Overview](#overview)
- [Pré-Commit Checklist](#pré-commit-checklist)
- [Estrutura de Testes](#estrutura-de-testes)
- [Comandos Principais](#comandos-principais)
- [Entendendo act()](#entendendo-act)
- [Padrões de Teste](#padrões-de-teste)
- [Troubleshooting](#troubleshooting)

---

## Overview

### **Stack de Testes**
- **Jest 30.2.0** - Framework de testes
- **React Testing Library 16.3.0** - Testes de componentes React
- **@testing-library/user-event** - Simulação de interações do usuário
- **jest.setup.ts** - Configuração global de mocks

### **Métricas Atuais** (Novembro 2025)
```
✅ Test Suites: 43/43 passing (100%)
✅ Tests: 421 passing, 13 skipped (97%)
✅ Build: Passing
✅ TypeScript: Valid
```

---

## Pré-Commit Checklist

### **⚡ Comando Rápido**
```bash
npm run check
```
Este comando executa **build + testes** automaticamente.

### **📝 Checklist Manual**

#### **1. Build Production**
```bash
npm run build
```
**Verifica:**
- ✅ Compilação TypeScript sem erros
- ✅ Todas as rotas compilam
- ✅ Bundle otimizado
- ✅ Tipos válidos

**Tempo esperado:** ~12-15 segundos

---

#### **2. Testes Completos**
```bash
npm test -- --no-coverage
```
**Verifica:**
- ✅ Todos os testes unitários
- ✅ Testes de integração
- ✅ Testes de componentes
- ✅ Snapshots (se houver)

**Tempo esperado:** ~40-50 segundos

**Resultado esperado:**
```
Test Suites: 43 passed, 43 total
Tests:       13 skipped, 421 passed, 434 total
```

---

#### **3. Análise de Erros**
Se houver falhas, use:
```bash
npm test -- --verbose
```

Para testar arquivo específico:
```bash
npm test -- __tests__/Dashboard.test.tsx
```

---

#### **4. Commit & Push**
Só commite se:
- ✅ Build passou
- ✅ Testes passaram (ou falhas documentadas)
- ✅ Sem TypeScript errors

```bash
git add .
git commit -m "feat: Descrição clara da mudança"
git push origin master
```

---

## Estrutura de Testes

### **📁 Organização**
```
__tests__/
├── Accessibility.*.test.tsx       # Testes de acessibilidade
├── Dashboard*.test.tsx            # Testes do dashboard
├── Comanda*.test.tsx              # Testes de comandas
├── Inventory*.test.tsx            # Testes de estoque
├── Performance.*.test.tsx         # Testes de performance
├── Sales*.test.tsx                # Testes de vendas
├── Transactions*.test.tsx         # Testes de transações
├── authService.test.ts            # Testes de autenticação
├── useComandasDB.*.test.tsx       # Testes de hooks
└── archive/                       # Testes antigos (não executados)
```

### **🏷️ Categorias de Testes**

#### **1. Testes Unitários**
Testam funções isoladas:
```typescript
// __tests__/format.test.ts
describe('formatCurrency', () => {
  it('formata valores monetários corretamente', () => {
    expect(formatCurrency(10.5)).toBe('R$ 10.50');
  });
});
```

#### **2. Testes de Componentes**
Testam renderização e interação:
```typescript
// __tests__/Dashboard.test.tsx
it('renderiza métricas financeiras', () => {
  render(<Dashboard sales={mockSales} />);
  expect(screen.getByText('Receita Total')).toBeInTheDocument();
  expect(screen.getByText(/R\$ 17\.00/)).toBeInTheDocument();
});
```

#### **3. Testes de Integração**
Testam fluxos completos:
```typescript
// __tests__/salesFlow.integration.test.ts
it('completa fluxo de venda do início ao fim', async () => {
  // 1. Cria comanda
  // 2. Adiciona produtos
  // 3. Finaliza venda
  // 4. Verifica dados salvos
});
```

#### **4. Testes de Performance**
Testam velocidade e eficiência:
```typescript
// __tests__/Performance.comprehensive.test.tsx
it('renderiza 1000 itens em menos de 2 segundos', async () => {
  const start = performance.now();
  render(<ProductList products={mockProducts} />);
  const duration = performance.now() - start;
  expect(duration).toBeLessThan(2000);
});
```

---

## Comandos Principais

### **🚀 Comandos Essenciais**

```bash
# Rodar todos os testes
npm test

# Rodar testes sem coverage (mais rápido)
npm test -- --no-coverage

# Rodar testes em watch mode (desenvolvimento)
npm test -- --watch

# Rodar arquivo específico
npm test -- __tests__/Dashboard.test.tsx

# Rodar testes que contém palavra no nome
npm test -- --testNamePattern="filtro de período"

# Rodar com cobertura detalhada
npm test -- --coverage

# Build + Testes (pré-commit)
npm run check
```

### **📊 Comandos de Análise**

```bash
# Ver cobertura no navegador
npm test -- --coverage
# Depois abra: coverage/lcov-report/index.html

# Rodar testes com logs detalhados
npm test -- --verbose

# Atualizar snapshots (use com cuidado!)
npm test -- --updateSnapshot
```

---

## Entendendo act()

### **🤔 O Que É?**

`act()` é uma função que garante que **todas as atualizações de estado do React sejam processadas** antes de continuar o teste.

### **❌ Problema Sem act()**

```typescript
it('carrega dados', () => {
  render(<Dashboard />);
  
  // ⚠️ useEffect ainda está rodando em background!
  // O teste continua sem esperar
  
  expect(screen.getByText('Loading')).toBeInTheDocument();
  // ❌ Pode passar ou falhar dependendo do timing
});
```

**Warning que aparece:**
```
Warning: An update to Dashboard inside a test was not wrapped in act(...)
```

### **✅ Solução Com act()**

```typescript
it('carrega dados', async () => {
  // Opção 1: Wrap no render
  await act(async () => {
    render(<Dashboard />);
  });
  
  // Opção 2: Usar waitFor (mais comum)
  render(<Dashboard />);
  await waitFor(() => {
    expect(screen.getByText('Data Loaded')).toBeInTheDocument();
  });
  
  // Agora todos os efeitos terminaram!
});
```

### **📋 Quando Usar act()?**

✅ **USE em:**
- Testes com `useEffect`
- Testes que atualizam estado assincronamente
- Testes com timers (`setTimeout`, `setInterval`)
- Testes com chamadas de API (mesmo mockadas)

❌ **NÃO PRECISA em:**
- Testes de renderização pura
- Testes de componentes sem estado
- Testes de funções utilitárias

### **🛠️ Padrões Comuns**

#### **Padrão 1: waitFor (Recomendado)**
```typescript
it('atualiza após fetch', async () => {
  render(<Dashboard />);
  
  await waitFor(() => {
    expect(screen.getByText('R$ 100.00')).toBeInTheDocument();
  });
});
```

#### **Padrão 2: userEvent (já usa act internamente)**
```typescript
it('atualiza após clique', async () => {
  render(<Dashboard />);
  
  // userEvent já envolve em act() automaticamente
  await userEvent.click(screen.getByRole('button', { name: 'Aplicar' }));
  
  expect(screen.getByText('Filtro aplicado')).toBeInTheDocument();
});
```

#### **Padrão 3: act() explícito (casos específicos)**
```typescript
it('atualiza após timer', async () => {
  jest.useFakeTimers();
  render(<Dashboard />);
  
  await act(async () => {
    jest.advanceTimersByTime(1000);
  });
  
  expect(screen.getByText('Atualizado')).toBeInTheDocument();
  jest.useRealTimers();
});
```

---

## Padrões de Teste

### **🎯 Boas Práticas**

#### **1. AAA Pattern (Arrange-Act-Assert)**
```typescript
it('calcula total corretamente', () => {
  // ARRANGE - Prepara dados
  const items = [
    { price: 10, quantity: 2 },
    { price: 5, quantity: 3 }
  ];
  
  // ACT - Executa ação
  const total = calculateTotal(items);
  
  // ASSERT - Verifica resultado
  expect(total).toBe(35);
});
```

#### **2. Queries Semânticas**
```typescript
// ❌ EVITE - Queries frágeis
screen.getByText('Botão');
screen.getByTestId('my-button');

// ✅ PREFIRA - Queries acessíveis
screen.getByRole('button', { name: 'Aplicar Filtro' });
screen.getByLabelText('Data de início');
screen.getByPlaceholderText('Digite o nome');
```

#### **3. User-Centric Testing**
```typescript
// ❌ EVITE - Testar implementação
expect(component.state.loading).toBe(false);

// ✅ PREFIRA - Testar comportamento do usuário
expect(screen.getByText('Carregado!')).toBeInTheDocument();
expect(screen.queryByText('Carregando...')).not.toBeInTheDocument();
```

#### **4. Mocks Mínimos**
```typescript
// ❌ EVITE - Mockar tudo
jest.mock('../hooks/useProducts', () => ({
  useProducts: () => mockProducts
}));

// ✅ PREFIRA - Mockar só o necessário (Supabase client)
// Deixe a lógica do hook rodar de verdade
```

### **📐 Estrutura de Teste Ideal**

```typescript
describe('ComponentName', () => {
  // Mock data compartilhado
  const mockData = {
    items: [...]
  };
  
  // Setup antes de cada teste
  beforeEach(() => {
    // Limpar mocks, resetar estados
  });
  
  describe('Categoria de testes', () => {
    it('faz algo específico', () => {
      // Teste aqui
    });
    
    it('lida com caso de erro', () => {
      // Teste de erro
    });
  });
  
  describe('Outra categoria', () => {
    it('outro comportamento', () => {
      // Teste aqui
    });
  });
});
```

---

## Troubleshooting

### **🔧 Problemas Comuns**

#### **Problema 1: "Cannot find module"**
```bash
# Limpar cache do Jest
npm test -- --clearCache

# Verificar jest.config.js
# moduleNameMapper deve mapear @ para src/
```

#### **Problema 2: "Act() warning"**
```typescript
// Solução: Adicionar waitFor
await waitFor(() => {
  expect(screen.getByText('...')).toBeInTheDocument();
});

// Ou wrap em act()
await act(async () => {
  // código que atualiza estado
});
```

#### **Problema 3: "Element not found"**
```typescript
// Debug: Ver o que está renderizado
screen.debug();

// Ou buscar por texto parcial
screen.getByText(/parte do texto/i);

// Verificar se elemento aparece depois
await waitFor(() => {
  expect(screen.getByText('...')).toBeInTheDocument();
});
```

#### **Problema 4: "maybeSingle is not a function"**
```typescript
// Verificar se jest.setup.ts tem o método
// Adicionar no mock do Supabase:
maybeSingle: jest.fn().mockResolvedValue({ 
  data: null, 
  error: null 
})
```

#### **Problema 5: Teste Flaky (às vezes passa, às vezes falha)**
```typescript
// Causa: Race condition
// Solução: Usar waitFor com timeout maior
await waitFor(() => {
  expect(screen.getByText('...')).toBeInTheDocument();
}, { timeout: 3000 });

// Ou usar fake timers
jest.useFakeTimers();
// ... teste
jest.useRealTimers();
```

### **🐛 Debug Avançado**

```typescript
// 1. Ver HTML completo renderizado
screen.debug();

// 2. Ver apenas um elemento
const button = screen.getByRole('button');
console.log(button);

// 3. Ver todas as queries disponíveis
screen.logTestingPlaygroundURL();
// Abre URL com sugestões de queries melhores

// 4. Pausar execução do teste
await screen.findByText('...'); // espera até aparecer
// ou
await waitFor(() => {}, { timeout: 10000 }); // espera 10s
```

### **📊 Performance de Testes**

```bash
# Ver testes mais lentos
npm test -- --verbose

# Rodar em paralelo (padrão)
npm test -- --maxWorkers=4

# Rodar sequencial (debug)
npm test -- --runInBand
```

---

## Métricas e Metas

### **📈 Metas de Qualidade**

| Métrica | Meta | Atual |
|---------|------|-------|
| **Coverage Total** | >80% | ~85% ✅ |
| **Test Suites Passing** | 100% | 100% ✅ |
| **Tests Passing** | >95% | 97% ✅ |
| **Build Time** | <15s | ~12s ✅ |
| **Test Time** | <60s | ~45s ✅ |

### **🎯 Prioridades**

1. **CRÍTICO** - Testes de integração (vendas, comandas, auth)
2. **ALTO** - Testes de componentes principais (Dashboard, Inventory)
3. **MÉDIO** - Testes de performance
4. **BAIXO** - Testes de estilo e acessibilidade

---

## Referências

### **📚 Documentação Oficial**
- [Jest](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library User Event](https://testing-library.com/docs/user-event/intro)

### **🎓 Guias Internos**
- `PRE-COMMIT-CHECKLIST.md` - Workflow de commit
- `jest.setup.ts` - Configuração de mocks
- `jest.config.js` - Configuração do Jest

### **💡 Dicas**
- Sempre rode `npm run check` antes de commitar
- Use `waitFor` para evitar act() warnings
- Prefira queries semânticas (`getByRole`, `getByLabelText`)
- Teste comportamento do usuário, não implementação
- Mantenha testes rápidos (<100ms cada)

---

**✨ Happy Testing!**

*Última atualização: Novembro 2025*
*Mantido por: Time BarConnect*
