# BarConnect - Sistema Completo de Gestão de Bar

## 📋 Visão Geral

O BarConnect é um sistema completo de gestão para bares e restaurantes, desenvolvido com Next.js, TypeScript e Supabase. O sistema oferece controle de comandas, vendas diretas, gestão de estoque, relatórios financeiros e muito mais.

## 🏗️ Arquitetura do Sistema

### Frontend
- **Next.js 15.5.4** - Framework React com App Router
- **React 19.1.0** - Biblioteca para interfaces
- **TypeScript** - Tipagem estática
- **TailwindCSS** - Estilização
- **Radix UI** - Componentes acessíveis
- **Sonner** - Notificações toast

### Backend
- **Supabase** - Banco PostgreSQL + Auth + Real-time
- **Custom Hooks** - Gerenciamento de estado e API
- **Jest** - Testes automatizados

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

#### 1. `users` - Sistema de Usuários
```sql
- id (UUID, PK)
- name (VARCHAR)
- email (VARCHAR, UNIQUE)
- password_hash (VARCHAR)
- role (ENUM: admin, operator, waiter)
- active (BOOLEAN)
- created_at, updated_at (TIMESTAMP)
```

#### 2. `products` - Catálogo de Produtos
```sql
- id (UUID, PK)
- name (VARCHAR)
- description (TEXT)
- price (DECIMAL)
- cost_price (DECIMAL)
- stock (INTEGER)
- min_stock (INTEGER)
- category (VARCHAR)
- barcode (VARCHAR)
- active (BOOLEAN)
- created_at, updated_at (TIMESTAMP)
```

#### 3. `comandas` - Comandas do Bar
```sql
- id (UUID, PK)
- customer_name (VARCHAR)
- table_number (INTEGER)
- status (ENUM: open, closed, cancelled)
- total (DECIMAL, GENERATED)
- opened_at (TIMESTAMP)
- closed_at (TIMESTAMP)
- created_by (UUID, FK)
```

#### 4. `comanda_items` - Itens das Comandas
```sql
- id (UUID, PK)
- comanda_id (UUID, FK)
- product_id (UUID, FK)
- quantity (INTEGER)
- unit_price (DECIMAL)
- subtotal (DECIMAL, GENERATED)
- added_at (TIMESTAMP)
```

#### 5. `sales` - Vendas Realizadas
```sql
- id (UUID, PK)
- type (ENUM: direct, comanda)
- total (DECIMAL, GENERATED)
- payment_method (ENUM: money, debit, credit, pix, other)
- status (ENUM: completed, cancelled, refunded)
- comanda_id (UUID, FK)
- created_by (UUID, FK)
- created_at (TIMESTAMP)
```

#### 6. `sale_items` - Itens das Vendas
```sql
- id (UUID, PK)
- sale_id (UUID, FK)
- product_id (UUID, FK)
- quantity (INTEGER)
- unit_price (DECIMAL)
- subtotal (DECIMAL, GENERATED)
```

#### 7. `transactions` - Transações Financeiras
```sql
- id (UUID, PK)
- type (ENUM: sale, expense, adjustment, refund)
- amount (DECIMAL)
- description (TEXT)
- payment_method (ENUM: money, debit, credit, pix, other)
- sale_id (UUID, FK)
- created_by (UUID, FK)
- created_at (TIMESTAMP)
```

#### 8. `stock_movements` - Movimentações de Estoque
```sql
- id (UUID, PK)
- product_id (UUID, FK)
- movement_type (ENUM: in, out, adjustment)
- quantity (INTEGER)
- previous_stock (INTEGER)
- new_stock (INTEGER)
- reason (TEXT)
- sale_id (UUID, FK)
- created_by (UUID, FK)
- created_at (TIMESTAMP)
```

### Views e Triggers

#### Views Otimizadas
- `products_critical_stock` - Produtos com estoque crítico/baixo
- `daily_sales_summary` - Resumo de vendas diárias
- `comanda_summaries` - Resumo das comandas com totais

#### Triggers Automáticos
- **Cálculo de totais** - Atualiza automaticamente totais de comandas e vendas
- **Controle de estoque** - Reduz estoque automaticamente nas vendas
- **Auditoria** - Registra movimentações de estoque automaticamente

## 🔧 Hooks Customizados

### `useSalesV2.ts` - Gestão de Vendas
```typescript
// Principais funções:
- createSale() - Criar nova venda
- fetchSales() - Buscar vendas com filtros
- getSalesStats() - Estatísticas de vendas
- closeSaleFromComanda() - Fechar venda via comanda
```

### `useComandasV2.ts` - Gestão de Comandas
```typescript
// Principais funções:
- createComanda() - Criar nova comanda
- addItemToComanda() - Adicionar item à comanda
- removeItemFromComanda() - Remover item da comanda
- closeComanda() - Fechar comanda
- fetchComandasWithItems() - Buscar comandas com itens
```

### `useProductsV2.ts` - Gestão de Produtos
```typescript
// Principais funções:
- createProduct() - Criar novo produto
- updateProduct() - Atualizar produto
- adjustStock() - Ajustar estoque
- getCriticalStockProducts() - Produtos com estoque crítico
- getStockMovements() - Histórico de movimentações
```

### `useTransactionsV2.ts` - Gestão Financeira
```typescript
// Principais funções:
- createTransaction() - Registrar transação
- getTransactionStats() - Estatísticas financeiras
- getDailySalesStats() - Vendas diárias para gráficos
- recordExpense() - Registrar despesa
- processRefund() - Processar estorno
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- Conta no Supabase
- Git

### Instalação
```bash
# Clonar repositório
git clone <url-do-repositorio>
cd barconnect-nextjs

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com suas credenciais do Supabase
```

### Configuração do Banco
```bash
# Executar script de migração (Windows)
powershell -ExecutionPolicy Bypass -File scripts/migrate-database.ps1

# Ou manualmente:
# 1. Acesse https://supabase.com/dashboard
# 2. Vá para SQL Editor
# 3. Execute o conteúdo de database/schema_complete_v2.sql
```

### Execução
```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build
npm start

# Testes
npm test
```

## 📊 Funcionalidades

### 🎯 Gestão de Comandas
- ✅ Criar comandas com nome do cliente e mesa
- ✅ Adicionar/remover itens da comanda
- ✅ Controle de status (aberta/fechada/cancelada)
- ✅ Cálculo automático de totais
- ✅ Fechamento com geração de venda

### 💰 Vendas Diretas
- ✅ Venda sem comanda (balcão)
- ✅ Múltiplos métodos de pagamento
- ✅ Controle automático de estoque
- ✅ Geração de transação financeira

### 📦 Gestão de Estoque
- ✅ Catálogo de produtos completo
- ✅ Controle de estoque mínimo
- ✅ Alertas de estoque crítico
- ✅ Histórico de movimentações
- ✅ Ajustes manuais de estoque

### 💳 Controle Financeiro
- ✅ Registro automático de transações
- ✅ Relatórios de vendas por período
- ✅ Controle de despesas
- ✅ Processamento de estornos
- ✅ Estatísticas por método de pagamento

### 👥 Sistema de Usuários
- ✅ Autenticação segura
- ✅ Controle de permissões por função
- ✅ Auditoria de operações
- ✅ Gestão de operadores

### 📈 Relatórios e Dashboard
- ✅ Dashboard com métricas principais
- ✅ Gráficos de vendas diárias
- ✅ Relatórios de produtos mais vendidos
- ✅ Análise de performance financeira

## 🔐 Segurança

### Autenticação
- Senhas com hash seguro
- Tokens JWT via Supabase
- Controle de sessões

### Autorização
- Roles baseadas em função (admin, operator, waiter)
- Controle de acesso por tela
- Auditoria de operações críticas

### Validação
- Validação no frontend e backend
- Sanitização de inputs
- Prevenção de SQL injection via Supabase

## 🧪 Testes

O sistema possui 425 testes automatizados cobrindo:
- ✅ Hooks customizados
- ✅ Componentes React
- ✅ Funções utilitárias
- ✅ Integração com API
- ✅ Fluxos de negócio

```bash
# Executar todos os testes
npm test

# Testes com coverage
npm run test:coverage

# Testes em modo watch
npm run test:watch
```

## 🔄 Migração de Dados

### Nova Arquitetura
A versão V2 do sistema introduz uma arquitetura completamente nova e otimizada:

#### Antes (V1)
- Estrutura simples com poucos relacionamentos
- Cálculos manuais de totais
- Controle de estoque manual
- Poucas validações

#### Depois (V2)
- Estrutura normalizada com relacionamentos adequados
- Triggers automáticos para cálculos
- Controle automático de estoque
- Validações robustas
- Views otimizadas para performance

### Como Migrar
1. **Backup**: Faça backup dos dados importantes
2. **Schema**: Execute `database/schema_complete_v2.sql`
3. **Hooks**: Substitua hooks antigos pelos novos (V2)
4. **Testes**: Execute todos os testes para validar
5. **Deploy**: Faça deploy da nova versão

## 📱 Interfaces

### Desktop/Web
- Dashboard responsivo
- Gestão completa via web
- Atalhos de teclado
- Interface otimizada para tablets

### Mobile (Futuro)
- App nativo React Native
- Funcionalidades offline
- Sincronização automática

## 🛠️ Desenvolvimento

### Estrutura de Pastas
```
barconnect-nextjs/
├── app/                    # Next.js App Router
├── components/             # Componentes React
│   ├── ui/                # Componentes base (Radix UI)
│   └── figma/             # Componentes específicos
├── hooks/                 # Hooks customizados
├── lib/                   # Utilitários e configurações
├── types/                 # Definições TypeScript
├── data/                  # Dados estáticos
├── utils/                 # Funções utilitárias
├── database/              # Scripts SQL
├── scripts/               # Scripts de automação
└── __tests__/             # Testes automatizados
```

### Padrões de Código
- **TypeScript**: Tipagem forte obrigatória
- **ESLint**: Linting automático
- **Prettier**: Formatação de código
- **Husky**: Git hooks para qualidade
- **Conventional Commits**: Padrão de commits

### Contribuição
1. Fork do repositório
2. Criar branch para feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit das mudanças (`git commit -m 'feat: adiciona nova funcionalidade'`)
4. Push para branch (`git push origin feature/nova-funcionalidade`)
5. Abrir Pull Request

## 📞 Suporte

### Problemas Conhecidos
- ✅ Login com operador/operador123 - **CORRIGIDO**
- ✅ Criação de comandas falhando - **CORRIGIDO**
- ✅ Botão de pagamento sem formatação - **CORRIGIDO**
- ✅ Filtros de data não sincronizados - **CORRIGIDO**
- ✅ Vendas diretas não salvando - **CORRIGIDO**

### Como Reportar Bugs
1. Verificar se já existe issue similar
2. Incluir steps para reproduzir
3. Adicionar screenshots se aplicável
4. Especificar ambiente (SO, browser, etc.)

## 📄 Licença

Este projeto está sob licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🎯 Roadmap

### Versão Atual (2.0)
- ✅ Nova arquitetura de banco
- ✅ Hooks otimizados V2
- ✅ Sistema de autenticação robusto
- ✅ Controle automático de estoque
- ✅ Relatórios avançados

### Próximas Versões
- 🔄 Interface mobile responsiva
- 🔄 Relatórios em PDF
- 🔄 Integração com impressoras térmicas
- 🔄 Sistema de delivery
- 🔄 Programa de fidelidade
- 🔄 Integração com sistemas de pagamento

---

**Desenvolvido com ❤️ para a gestão eficiente de bares e restaurantes**