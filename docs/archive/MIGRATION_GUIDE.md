# BarConnect - Guia de Migração para Hooks V2

## 🎯 Objetivo
Este guia ajuda na migração dos hooks antigos para a nova arquitetura V2, que oferece melhor performance, tipagem e funcionalidades.

## 📋 Checklist de Migração

### 1. ✅ Banco de Dados
- [ ] Executar `database/schema_complete_v2.sql` no Supabase
- [ ] Verificar se todas as tabelas foram criadas
- [ ] Testar conexão com novo schema
- [ ] Validar dados de exemplo

### 2. 🔄 Hooks - Mapeamento de Substituição

#### `useComandasDB.ts` → `useComandasV2.ts`
```typescript
// ANTES (V1)
import { useComandasDB } from '@/hooks/useComandasDB';
const { comandas, createComanda, addItem } = useComandasDB();

// DEPOIS (V2)
import { useComandasV2 } from '@/hooks/useComandasV2';
const { comandas, createComanda, addItemToComanda } = useComandasV2();
```

#### `useProductsDB.ts` → `useProductsV2.ts`
```typescript
// ANTES (V1)
import { useProductsDB } from '@/hooks/useProductsDB';
const { products, updateStock } = useProductsDB();

// DEPOIS (V2)
import { useProductsV2 } from '@/hooks/useProductsV2';
const { products, adjustStock } = useProductsV2();
```

#### `useTransactionsDB.ts` → `useTransactionsV2.ts`
```typescript
// ANTES (V1)
import { useTransactionsDB } from '@/hooks/useTransactionsDB';
const { transactions, addTransaction } = useTransactionsDB();

// DEPOIS (V2)
import { useTransactionsV2 } from '@/hooks/useTransactionsV2';
const { transactions, createTransaction } = useTransactionsV2();
```

#### Novo Hook: `useSalesV2.ts`
```typescript
// NOVO (V2) - Centraliza toda lógica de vendas
import { useSalesV2 } from '@/hooks/useSalesV2';
const { sales, createSale, getSalesStats } = useSalesV2();
```

### 3. 🔧 Componentes a Atualizar

#### Dashboard.tsx
```typescript
// Substituir hooks antigos
- import { useComandasDB } from '@/hooks/useComandasDB';
- import { useTransactionsDB } from '@/hooks/useTransactionsDB';

+ import { useComandasV2 } from '@/hooks/useComandasV2';
+ import { useSalesV2 } from '@/hooks/useSalesV2';
+ import { useTransactionsV2 } from '@/hooks/useTransactionsV2';
```

#### ComandaDetail.tsx
```typescript
// Atualizar função de adicionar item
- addItem(comandaId, product, quantity)
+ addItemToComanda(comandaId, product.id, quantity)

// Atualizar função de fechar comanda
- closeComanda(comandaId, paymentMethod)
+ closeComanda(comandaId) // Será integrado com useSalesV2
```

#### PaymentScreen.tsx
```typescript
// Nova integração com vendas
- // Lógica de pagamento manual
+ const { createSale } = useSalesV2();
+ await createSale({
+   type: 'comanda',
+   comanda_id: comandaId,
+   payment_method: selectedMethod,
+   items: comandaItems
+ });
```

#### OrderScreen.tsx (Vendas Diretas)
```typescript
// Substituir lógica antiga
- // Múltiplos hooks para venda direta
+ const { createSale } = useSalesV2();
+ await createSale({
+   type: 'direct',
+   items: cartItems,
+   payment_method: paymentMethod
+ });
```

#### Inventory.tsx
```typescript
// Novo controle de estoque
- updateStock(productId, newStock)
+ adjustStock({
+   product_id: productId,
+   new_stock: newStock,
+   reason: 'Ajuste manual'
+ })
```

### 4. 📊 Novos Recursos Disponíveis

#### Estatísticas Avançadas
```typescript
const { getSalesStats } = useSalesV2();
const stats = await getSalesStats({
  start_date: '2024-01-01',
  end_date: '2024-01-31'
});

// Retorna: totalSales, totalProfit, itemsSold, etc.
```

#### Controle de Estoque Crítico
```typescript
const { getCriticalStockProducts } = useProductsV2();
const criticalProducts = await getCriticalStockProducts();
// Produtos com estoque baixo/crítico
```

#### Relatórios Financeiros
```typescript
const { getTransactionStats } = useTransactionsV2();
const financialStats = await getTransactionStats({
  start_date: startDate,
  end_date: endDate
});
```

#### Histórico de Movimentações
```typescript
const { getStockMovements } = useProductsV2();
const movements = await getStockMovements(productId);
// Histórico completo de movimentações
```

### 5. 🔒 Autenticação Atualizada

#### lib/authService.ts
```typescript
// Nova autenticação com banco
const { validateCredentials } = useAuth();
const user = await validateCredentials(username, password);
// Consulta o banco primeiro, fallback para credenciais fixas
```

### 6. ⚠️ Breaking Changes

#### Estrutura de Dados
- `comandas.items` agora é uma tabela separada (`comanda_items`)
- `sales` agora possui `sale_items` detalhados
- Todos os IDs são UUID ao invés de números
- Timestamps agora incluem timezone

#### Nomes de Funções
- `addItem` → `addItemToComanda`
- `updateStock` → `adjustStock`
- `addTransaction` → `createTransaction`
- `closeComanda` agora integra com `createSale`

#### Tipos TypeScript
- Novos interfaces para todas as entidades
- Campos calculados disponíveis
- Validação de enums mais rigorosa

### 7. 🧪 Validação Pós-Migração

#### Testes Obrigatórios
```bash
# Executar todos os testes
npm test

# Verificar cobertura
npm run test:coverage

# Testes específicos dos hooks
npm test -- --testPathPattern=hooks
```

#### Checklist Funcional
- [ ] Login com operador/operador123 funciona
- [ ] Criação de comandas funciona
- [ ] Adição de itens à comanda funciona
- [ ] Fechamento de comanda com pagamento funciona
- [ ] Vendas diretas salvam no banco
- [ ] Controle de estoque automático funciona
- [ ] Relatórios carregam corretamente
- [ ] Filtros de data aplicam em todas as telas

### 8. 🚀 Deploy

#### Ordem de Deploy
1. **Banco**: Executar schema no Supabase
2. **Backend**: Atualizar variáveis de ambiente se necessário
3. **Frontend**: Deploy da nova versão com hooks V2
4. **Validação**: Testes em produção

#### Rollback (se necessário)
- Manter backup do schema anterior
- Ter versão anterior do código pronta
- Plano de restauração de dados

### 9. 📈 Monitoramento

#### Métricas a Acompanhar
- Performance das consultas
- Erros de TypeScript em runtime
- Funcionalidades críticas (vendas, comandas)
- Integridade dos dados

#### Logs Importantes
```typescript
// Logs automáticos nos hooks V2
console.log('📦 Criando comanda:', input);
console.log('💰 Processando venda:', saleData);
console.log('📊 Ajustando estoque:', adjustment);
```

### 10. 🎯 Benefícios da Migração

#### Performance
- ✅ Consultas otimizadas com joins
- ✅ Índices adequados no banco
- ✅ Views para relatórios rápidos
- ✅ Triggers automáticos para cálculos

#### Confiabilidade
- ✅ Validações rigorosas
- ✅ Transações atômicas
- ✅ Controle automático de estoque
- ✅ Auditoria completa

#### Manutenibilidade
- ✅ Código mais limpo e organizado
- ✅ Tipagem TypeScript completa
- ✅ Separação clara de responsabilidades
- ✅ Documentação abrangente

#### Funcionalidades
- ✅ Relatórios avançados
- ✅ Estatísticas em tempo real
- ✅ Controle de estoque crítico
- ✅ Histórico detalhado

---

## 🆘 Suporte

Se encontrar problemas durante a migração:

1. **Verificar logs**: Console do navegador e terminal
2. **Testar isoladamente**: Um hook por vez
3. **Validar dados**: Estrutura do banco vs. código
4. **Consultar documentação**: `ARCHITECTURE.md`

**Em caso de emergência**: Fazer rollback para versão anterior e reportar issue detalhada.

---

**✨ Boa migração! A nova arquitetura V2 oferece muito mais poder e flexibilidade para o BarConnect.**