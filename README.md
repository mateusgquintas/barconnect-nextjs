# BarConnect - Sistema de Gestão para Bar e Hotel

Sistema completo de PDV, gestão de comandas, vendas, estoque, transações financeiras e administração hoteleira com agenda integrada.

## 🚀 Stack Tecnológica

- **Framework:** Next.js 15 (App Router)
- **React:** 19.x com Server Components
- **TypeScript:** 5.x com strict mode
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS + shadcn/ui
- **State Management:** React Context API
- **Testing:** Jest + Testing Library
- **CI/CD:** GitHub Actions + Vercel

## ✨ Funcionalidades Principais

### 🍺 PDV e Vendas
- Sistema de comandas com abertura/fechamento
- Vendas diretas com múltiplos métodos de pagamento
- Controle de estoque em tempo real
- Histórico detalhado de transações
- Exportação para Excel

### 🏨 Gestão Hoteleira
- Agenda visual de reservas
- Gestão de quartos e ocupação
- Controle de romarias/grupos
- Dashboard de controladoria
- Relatórios personalizados

### 📊 Dashboard e Relatórios
- Visão geral financeira
- Gráficos de vendas e transações
- Métricas de desempenho
- Filtros por período
- Exportação de dados

### 🛡️ Qualidade e Confiabilidade
- ✅ Global error boundary (app/error.tsx)
- ✅ Página 404 customizada (app/not-found.tsx)
- ✅ Validação de variáveis de ambiente (lib/env.ts)
- ✅ Testes automatizados (43 test suites, 423+ testes)
- ✅ Coverage thresholds (30% statements, 20% branches)
- ✅ CI/CD com GitHub Actions
- ✅ Proteção de rotas debug/test
- ✅ Otimizações de performance (React.memo, dynamic imports)

## 🏗️ Estrutura do Projeto

```
barconnect-nextjs/
├── app/                      # App Router (Next.js 15)
│   ├── layout.tsx           # Layout raiz com providers
│   ├── page.tsx             # Home/Dashboard principal
│   ├── error.tsx            # Global error boundary
│   ├── not-found.tsx        # Página 404 customizada
│   ├── hotel/               # Módulo de hotel
│   │   └── agenda/         # Agenda com otimizações de performance
│   ├── hotel-pilgrimages/   # Gestão de romarias
│   ├── admin/               # Páginas administrativas
│   ├── debug-*/             # Páginas de debug (protegidas)
│   └── test-*/              # Páginas de teste (protegidas)
├── components/              # Componentes React reutilizáveis
│   ├── ui/                 # Componentes de UI (shadcn/ui)
│   ├── agenda/             # Componentes da agenda/calendário
│   │   ├── MonthlyCalendar.tsx  # Otimizado com memoization
│   │   └── DayOccupancyBar.tsx  # React.memo
│   └── DebugPageWrapper.tsx # Wrapper de proteção para debug
├── contexts/                # React Contexts (Auth, DateFilter, etc)
├── hooks/                   # Custom React Hooks
│   ├── useProductsDB.ts    # Gestão de produtos
│   ├── useSalesDB.ts       # Gestão de vendas
│   ├── useComandasDB.ts    # Gestão de comandas
│   └── useTransactionsDB.ts # Gestão de transações
├── lib/                     # Bibliotecas e utilitários
│   ├── supabase.ts         # Cliente Supabase com mock
│   ├── env.ts              # Validação de env vars
│   ├── salesService.ts     # Serviço de vendas
│   └── utils.ts            # Utilitários gerais
├── utils/                   # Utilitários auxiliares
│   ├── logger.ts           # Sistema de logging
│   ├── format.ts           # Formatação de dados
│   └── exportToExcel.ts    # Exportação de planilhas
├── types/                   # Definições TypeScript
├── database/                # Scripts e schemas SQL
│   └── clean-transactional-data.js # Limpeza de dados
├── scripts/                 # Scripts de automação
│   ├── supabase-orchestrator.js # Orquestrador Supabase
│   └── maintenance/        # Scripts de manutenção
├── docs/                    # Documentação técnica
│   └── archive/            # Docs históricos
└── __tests__/              # Testes automatizados
    └── utils/              # Test factories e helpers
```

## 🚀 Getting Started

### Pré-requisitos
- Node.js 20+
- npm ou yarn
- Conta no Supabase (opcional para desenvolvimento)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/mateusgquintas/barconnect-nextjs.git

# Entre na pasta
cd barconnect-nextjs

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais Supabase
```

### Desenvolvimento

```bash
# Modo desenvolvimento
npm run dev

# Testes
npm test

# Testes com coverage
npm run test:coverage

# Typecheck
npm run typecheck

# Lint
npm run lint

# Build
npm run build
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## 🧪 Testes

O projeto possui uma suíte completa de testes:

```bash
# Todos os testes
npm test

# Com coverage
npm run test:coverage

# Modo watch
npm test -- --watch

# Teste específico
npm test -- ProductCatalog
```

**Status atual:**
- ✅ 43 test suites
- ✅ 423+ testes passando
- ✅ Coverage: 40% statements, 25% branches, 34% functions, 40% lines
- ✅ Thresholds: 30/20/25/30 (statements/branches/functions/lines)

## 🔐 Variáveis de Ambiente

### Desenvolvimento (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
```

### Produção (Vercel)
Configure no Vercel Dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### CI (GitHub Actions - opcional)
Os testes usam mock do Supabase por padrão. Para builds reais na CI, configure os secrets:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 📦 Deploy

### Vercel (Recomendado)

1. Conecte o repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push no `master`

**Configuração:**
- Build Command: `npm run build`
- Output Directory: `.next`
- Node.js Version: 20
- Root Directory: `./`

### Outras Plataformas
O projeto é compatível com qualquer plataforma que suporte Next.js 15:
- Netlify
- AWS Amplify
- Railway
- Render

## 🔧 CI/CD

### GitHub Actions

Workflow automatizado (`.github/workflows/ci.yml`):
1. ✅ Lint (non-blocking)
2. ✅ Typecheck (TypeScript)
3. ✅ Tests com coverage
4. ✅ Build

Triggers:
- Push em `master` ou `main`
- Pull requests

## 🗄️ Manutenção do Banco de Dados (Supabase)

Scripts unificados para manutenção:

### Menu Interativo
```bash
npm run supabase:menu
```

### Comandos Diretos

**Limpeza de vendas de teste:**
```bash
npm run supabase:clean
```

**Diagnóstico completo:**
```bash
npm run supabase:diagnostic
```

**Correção de Foreign Keys:**
```bash
npm run supabase:fix-fk
```

**Migração simplificada (Windows):**
```bash
npm run supabase:migrate-simple
```

## 🎨 Componentes UI

Baseado em [shadcn/ui](https://ui.shadcn.com/):
- Dialog, Button, Input, Select
- Card, Badge, Tabs
- Table, Toast, Tooltip
- E muito mais...

## 📝 Convenções de Código

- **TypeScript:** Strict mode ativado
- **Estilo:** Prettier + ESLint
- **Commits:** Mensagens descritivas em português
- **Branches:** `master` como principal
- **Testes:** Co-localizados em `__tests__/`

## 🐛 Debugging

Páginas protegidas para debugging (apenas em desenvolvimento):
- `/debug-sales` - Debug de vendas
- `/debug-schema` - Debug de schema
- `/debug-supabase` - Debug de conexão Supabase
- `/test-dashboard` - Dashboard de teste
- `/test-db` - Test de banco de dados

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é privado e proprietário.

## 🙏 Agradecimentos

- [Next.js](https://nextjs.org)
- [Supabase](https://supabase.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)

---

**Versão:** 0.1.0  
**Última atualização:** Outubro 2025  
**Status:** ✅ Produção
