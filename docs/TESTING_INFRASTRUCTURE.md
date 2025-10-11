# Infraestrutura de Testes - Guia de Desenvolvimento

## Visão Geral

Esta documentação descreve a infraestrutura de testes robusta e sustentável implementada para garantir qualidade de código a longo prazo.

## Arquitetura de Testes

### 1. Organização
```
__tests__/
├── utils/
│   └── testUtils.tsx          # Utilitários centralizados
├── *.comprehensive.test.tsx   # Testes abrangentes por módulo
├── *.integration.test.tsx     # Testes de integração
└── *.a11y.test.tsx           # Testes de acessibilidade
```

### 2. Componentes da Infraestrutura

#### TestDataFactory
Cria dados de teste consistentes e reutilizáveis:
```typescript
const product = TestDataFactory.createProduct({ price: 10.0 });
const sale = TestDataFactory.createSaleRecord({ total: 100.0 });
```

#### MockHookFactory  
Gera mocks padronizados para hooks:
```typescript
mockUseSalesDB.mockReturnValue(MockHookFactory.createUseSalesDB({
  sales: [mockSale],
  addSale: mockAddSale
}));
```

#### FlowHelpers
Automatiza fluxos complexos de teste:
```typescript
await FlowHelpers.completeDirectSale(userEvent, screen, 'credit');
```

#### TestValidators
Validações especializadas para assertivas:
```typescript
TestValidators.validateSaleCreation(mockAddSale, expectedSale);
const totals = TestValidators.validateTotalsCalculation(transactions);
```

## Padrões de Teste

### 1. Naming Convention
- `*.comprehensive.test.tsx`: Cobertura completa de um módulo
- `*.integration.test.tsx`: Testes entre componentes 
- `*.a11y.test.tsx`: Testes de acessibilidade
- `*.e2e.test.tsx`: Testes end-to-end

### 2. Estrutura de Teste
```typescript
describe('Módulo - Testes Abrangentes', () => {
  // Setup usando factories
  const mockData = TestDataFactory.createSaleRecord();
  
  beforeEach(() => {
    // Reset mocks usando MockHookFactory
  });

  describe('1. Funcionalidade Principal', () => {
    it('deve comportar-se corretamente', async () => {
      // Arrange usando TestDataFactory
      // Act usando FlowHelpers
      // Assert usando TestValidators
    });
  });
});
```

### 3. Assertivas Robustas
```typescript
// ✅ Flexível para diferentes formatos
expect(screen.getByText(/R\$\s*13[.,]00/)).toBeInTheDocument();

// ✅ Usando helpers especializados
expect(screen.getByText(MoneyMatchers.toMatchCurrency(13.0))).toBeInTheDocument();
```

## Cenários de Teste Pré-definidos

### TestScenarios
Casos de uso comuns pré-configurados:
```typescript
TestScenarios.emptyOrder        // Lista vazia
TestScenarios.singleItem        // Um item
TestScenarios.multipleItems     // Múltiplos itens
TestScenarios.highValueOrder    // Pedido de alto valor
```

## Benefícios

### 1. Sustentabilidade
- **Reutilização**: Factories eliminam duplicação de código
- **Manutenção**: Mudanças centralizadas nos utilitários
- **Evolução**: Fácil adição de novos cenários

### 2. Robustez
- **Flexibilidade**: Testes adaptam-se a mudanças de formatação
- **Cobertura**: Cenários edge cases padronizados  
- **Isolamento**: Mocks controlados e previsíveis

### 3. Produtividade
- **Velocidade**: Helpers automatizam fluxos complexos
- **Consistência**: Padrões estabelecidos para toda equipe
- **Documentação**: Testes servem como especificação viva

## Checklist de QA Automatizado

### ✅ Cadastro e Edição de Produtos
- Adicionar/editar/atualizar produtos
- Feedback de sucesso/erro
- Atualização automática de listas

### ✅ Vendas e Transações  
- Vendas diretas e por comanda
- Geração automática de transações
- Entradas/saídas manuais
- Cálculo de totais e saldo

### 🚧 Em Andamento
- Exportação de dados
- Testes de acessibilidade
- Performance e cache
- Responsividade
- Validações e limites

## Comandos de Teste

```bash
# Executar todos os testes
npm test

# Executar testes específicos
npm test -- __tests__/SalesTransactions.comprehensive.test.tsx

# Executar com cobertura
npm run test:coverage

# Executar testes de acessibilidade
npm test -- __tests__/*.a11y.test.tsx
```

## Métricas de Qualidade

### Cobertura de Código
- **Alvo**: > 80% de cobertura
- **Crítico**: 100% para funções de negócio core

### Performance de Testes
- **Tempo médio**: < 3s por suíte
- **Paralelização**: Testes independentes executam em paralelo

### Manutenibilidade
- **Duplicação**: < 5% de código duplicado em testes
- **Complexidade**: Testes simples e legíveis

## Evolução e Roadmap

### Próximos Passos
1. **Testes E2E**: Playwright para fluxos completos
2. **Visual Regression**: Testes de UI automatizados  
3. **Performance Testing**: Métricas de velocidade
4. **API Contract Testing**: Validação de contratos Supabase

### Integração Contínua
- **Pre-commit**: Testes executados antes de commit
- **CI/CD**: Validação automática em PRs
- **Releases**: Sem deploy sem 100% dos testes passando

## Contribuição

Para adicionar novos testes:
1. Use `TestDataFactory` para dados
2. Use `MockHookFactory` para mocks
3. Use `FlowHelpers` para interações
4. Use `TestValidators` para assertivas
5. Documente novos padrões aqui

---

Esta infraestrutura garante que nossos testes sejam **maintíveis**, **confiáveis** e **escaláveis** a longo prazo.