# 🚀 ERP Hotelaria - Next.js + Supabase

> Sistema completo de gestão hoteleira com PDV, Hotel, Estoque, Dashboard e Financeiro

---

## 📖 Para Começar

### 🎯 Escolha seu caminho:

<table>
<tr>
<th>Se você quer...</th>
<th>Leia este arquivo</th>
<th>Tempo</th>
</tr>
<tr>
<td>✨ Setup automático (mais rápido)</td>
<td><code>GUIA-SETUP-AUTOMATICO.md</code></td>
<td>30 min</td>
</tr>
<tr>
<td>📚 Entender tudo passo a passo</td>
<td><code>INICIO-DO-ZERO-COMPLETO.md</code></td>
<td>60 min</td>
</tr>
<tr>
<td>🔧 Setup manual detalhado</td>
<td><code>SETUP-NEXTJS-COMPLETO.md</code></td>
<td>45 min</td>
</tr>
<tr>
<td>🐛 Só corrigir imports</td>
<td><code>COMO-CORRIGIR-IMPORTS-NEXTJS.md</code></td>
<td>10 min</td>
</tr>
</table>

---

## 🎬 Quick Start (3 Comandos)

```bash
# 1. Clone ou baixe os scripts
# 2. Execute o setup automático

# Windows:
.\setup-automatico.ps1

# Mac/Linux:
chmod +x setup-automatico.sh && ./setup-automatico.sh

# 3. Configure Supabase (copie credenciais para .env.local)
# 4. Rode:
npm run dev
```

---

## 🏗️ O Que Você Vai Criar

```
ERP Hotelaria (Next.js)
├── 🏪 PDV
│   ├── Comandas
│   ├── Venda Direta
│   └── Categorias com Cores
│
├── 🏨 Hotel
│   ├── Gestão de Quartos
│   ├── Check-in Completo
│   └── Sistema de Romarias
│
├── 📦 Estoque
│   ├── Catálogo de Produtos
│   ├── Edição Completa
│   └── Gráficos de Vendas
│
├── 📊 Dashboard
│   ├── Métricas do Bar
│   └── Controladoria
│
└── 💰 Financeiro
    ├── Entradas
    ├── Saídas
    └── Categorias
```

---

## 📦 Tecnologias

- **Next.js 15** - React Framework
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **Supabase** - Backend & Database
- **shadcn/ui** - Component Library
- **Recharts** - Charts & Graphs

---

## 🎯 Funcionalidades

### ✅ PDV (Ponto de Venda)
- [x] Sistema de comandas numeradas
- [x] Venda direta sem comanda
- [x] Categorias de produtos com cores
- [x] Registro de quem criou cada comanda
- [x] Pagamento (Dinheiro, Crédito, Débito, Pix, Cortesia)

### ✅ Hotel
- [x] Gestão de quartos (status, tipos)
- [x] Check-in com dados pessoais completos
- [x] Sistema de romarias (grupos de ônibus)
- [x] Filtros por status e romaria
- [x] Check-out e limpeza de quartos

### ✅ Estoque
- [x] Catálogo completo de produtos
- [x] Edição de nome, preço, categoria
- [x] Adicionar novos produtos
- [x] Gráficos de vendas mensais
- [x] Controle de estoque crítico

### ✅ Dashboard
- [x] Métricas do Bar (vendas, ticket médio)
- [x] Produtos mais vendidos
- [x] Formas de pagamento
- [x] Controladoria (entradas/saídas)

### ✅ Financeiro
- [x] Registro de transações
- [x] Categorização (Vendas, Fornecedores, etc.)
- [x] Filtros por período
- [x] Cálculos automáticos

---

## 📂 Estrutura do Projeto

```
erp-hotelaria/
├── app/                    # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
├── components/             # React Components
│   ├── App.tsx            # Main app logic
│   ├── Header.tsx
│   ├── ProductCatalog.tsx
│   ├── Hotel.tsx
│   ├── Inventory.tsx
│   ├── Dashboard.tsx
│   ├── Transactions.tsx
│   └── ui/                # shadcn/ui components
│
├── lib/
│   ├── utils.ts           # Utility functions
│   └── supabase/
│       ├── client.ts      # Browser client
│       └── server.ts      # Server client
│
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript definitions
├── utils/                 # Helper functions
│
├── .env.local            # Environment variables
├── next.config.js
├── tsconfig.json
└── package.json
```

---

## 🗄️ Banco de Dados (Supabase)

### Tabelas Criadas:

1. **users** - Usuários do sistema
2. **products** - Catálogo de produtos
3. **comandas** - Comandas abertas/fechadas
4. **comanda_items** - Itens de cada comanda
5. **sales_records** - Histórico de vendas
6. **sale_items** - Itens de cada venda
7. **transactions** - Lançamentos financeiros
8. **rooms** - Quartos do hotel
9. **guests** - Cadastro de hóspedes
10. **reservations** - Reservas/check-ins
11. **pilgrimages** - Romarias (grupos)

---

## 🔐 Variáveis de Ambiente

Crie arquivo `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🧪 Comandos Disponíveis

```bash
# Desenvolvimento
npm run dev          # Roda em http://localhost:3000

# Build
npm run build        # Cria build de produção
npm start            # Roda build em produção

# Outros
npm run lint         # Verifica código
npm run setup        # Setup automático (futuro)
```

---

## 🚀 Deploy

### Vercel (Recomendado)

```bash
# 1. Instalar CLI
npm install -g vercel

# 2. Deploy
vercel

# 3. Adicionar variáveis de ambiente no dashboard
```

### Outras Plataformas

- **Netlify:** `npm run build` e faça upload da pasta `.next`
- **AWS/DigitalOcean:** Use Docker ou PM2

---

## 📚 Documentação Completa

### Guias de Setup

| Arquivo | Descrição | Tempo |
|---------|-----------|-------|
| `INICIO-DO-ZERO-COMPLETO.md` | Guia completo do zero | 60 min |
| `GUIA-SETUP-AUTOMATICO.md` | Scripts automáticos | 30 min |
| `SETUP-NEXTJS-COMPLETO.md` | Setup manual detalhado | 45 min |

### Resolução de Problemas

| Arquivo | Descrição |
|---------|-----------|
| `COMO-CORRIGIR-IMPORTS-NEXTJS.md` | Corrigir erros de import |
| `CORRECAO-AUTOMATICA.ps1` | Script Windows |
| `SCRIPT-CORRECAO-AUTOMATICA.sh` | Script Mac/Linux |

### Referência

| Arquivo | Descrição |
|---------|-----------|
| `MUDANCAS-EM-ANDAMENTO.md` | Lista de funcionalidades |
| `RESUMO-FINAL-MUDANCAS.md` | Changelog completo |
| `Guidelines.md` | Boas práticas de código |

---

## 🐛 Troubleshooting

### "Module not found: @/utils"

**Solução:**
```bash
# Verifique tsconfig.json tem:
"paths": { "@/*": ["./*"] }

# Rode script de correção:
.\CORRECAO-AUTOMATICA.ps1
```

### "use client is missing"

**Solução:** Adicione `'use client'` no topo do componente

### Build falha

```bash
# Limpe e reinstale
rm -rf .next node_modules
npm install
npm run build
```

### Supabase não conecta

1. Verifique `.env.local` na raiz
2. Verifique credenciais
3. Reinicie dev server

---

## 📖 Aprendizados

### Por Que Este Erro Aconteceu?

```tsx
// ❌ ERRADO (projeto React)
import { cn } from "@/utils"  // Procura em /utils

// ✅ CORRETO (Next.js)
import { cn } from "@/lib/utils"  // Path alias configurado
```

### Diferenças React vs Next.js

| React | Next.js |
|-------|---------|
| `import from "./file"` | `import from "@/path/file"` |
| Client-side rendering | Server + Client components |
| Vite bundler | Next.js compiler |
| React Router | File-based routing |

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'feat: adiciona nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

---

## 📝 Licença

MIT © 2025

---

## 🎯 Próximos Passos

Depois do setup inicial:

1. [ ] Configurar Supabase
2. [ ] Copiar componentes do React
3. [ ] Adaptar para Next.js
4. [ ] Testar funcionalidades
5. [ ] Fazer deploy
6. [ ] Treinar equipe

---

## 💡 Dicas

- **Sempre teste localmente** antes de fazer deploy
- **Faça backup** do banco Supabase regularmente
- **Use .env.example** como template, nunca commite .env.local
- **Leia Guidelines.md** para boas práticas

---

## 🆘 Precisa de Ajuda?

1. Leia a documentação completa em `/INICIO-DO-ZERO-COMPLETO.md`
2. Verifique troubleshooting acima
3. Abra uma issue no GitHub
4. Contate o suporte

---

## ✨ Funcionalidades Destacadas

### 🎨 Categorias com Cores no PDV
Cada tipo de produto tem sua cor própria: drinks roxos, cervejas âmbar, etc.

### 🚌 Sistema de Romarias
Gerencie grupos de hóspedes que chegam em ônibus de viagem.

### 📊 Gráficos Interativos
Visualize vendas e movimentação de estoque em tempo real.

### 👤 Registro de Usuário
Todo registro sabe quem criou/modificou.

### 💳 Múltiplas Formas de Pagamento
Dinheiro, crédito, débito, Pix e cortesia.

---

## 🚀 Status do Projeto

- [x] ✅ Setup inicial documentado
- [x] ✅ Scripts automáticos criados
- [x] ✅ Estrutura Next.js definida
- [x] ✅ Schema Supabase completo
- [x] ✅ Componentes React prontos
- [ ] 🔄 Migração para Next.js (você vai fazer!)
- [ ] 🔄 Deploy em produção
- [ ] 🔄 Treinamento de equipe

---

**Versão:** 2.0  
**Última atualização:** Outubro 2025  
**Status:** Pronto para migração! 🎉

---

<div align="center">

**⭐ Se este projeto te ajudou, deixe uma estrela!**

Made with ❤️ by Figma Make

</div>