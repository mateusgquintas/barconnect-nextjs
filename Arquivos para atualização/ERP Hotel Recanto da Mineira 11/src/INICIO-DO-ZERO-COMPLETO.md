# 🎯 Início do Zero - Guia Definitivo

> **De zero a deploy em 1 hora!**

---

## 📖 Índice

1. [Entendendo o Erro Atual](#1-entendendo-o-erro-atual)
2. [Por Que Recomeçar do Zero](#2-por-que-recomeçar-do-zero)
3. [Passo a Passo Completo](#3-passo-a-passo-completo)
4. [Estrutura Final](#4-estrutura-final)
5. [Deploy](#5-deploy)

---

## 1. 🔍 Entendendo o Erro Atual

### O Erro

```
Module not found: Can't resolve '@/utils'
./components/ui/button.tsx:8:1
> import { cn } from "@/utils";
```

### Por Que Acontece?

```
components/ui/button.tsx:
├─ import { cn } from "@/utils"  ← Procura em: /utils
│  
└─ Mas o arquivo está em:
   components/ui/utils.ts  ← Deveria ser: "./utils"
```

### Como Você Poderia Corrigir (Não Recomendado)

**Opção 1:** Mudar o import
```tsx
// De:
import { cn } from "@/utils";

// Para:
import { cn } from "./utils";
```

**Opção 2:** Mover o arquivo
```bash
# Mover de:
components/ui/utils.ts

# Para:
utils/cn.ts  # E renomear função

# Ou:
lib/utils.ts  # Melhor opção!
```

### Por Que Não Vamos Fazer Isso?

1. ❌ São **MUITOS** arquivos para corrigir
2. ❌ Vai dar outros erros depois
3. ❌ Projeto React ≠ Projeto Next.js
4. ✅ **Melhor:** Criar projeto Next.js do ZERO!

---

## 2. 💡 Por Que Recomeçar do Zero

### Diferenças React vs Next.js

| Aspecto | React (Figma Make) | Next.js |
|---------|-------------------|---------|
| **Estrutura** | Livre | App Router obrigatório |
| **Imports** | Relativos (`./`) | Path aliases (`@/`) |
| **Componentes** | Client-side | Server/Client Components |
| **Routing** | React Router | File-based routing |
| **API** | Fetch externo | Route Handlers |
| **Build** | Vite | Next.js Compiler |

### O Que Vamos Fazer

```
React (atual)               Next.js (novo)
     ↓                           ↓
  Figma Make              Projeto do Zero
  localhost:3000      →   localhost:3000
  
  Pegar código      →     Adaptar e copiar
  que funciona            para Next.js
```

---

## 3. 🚀 Passo a Passo Completo

### FASE 1: Setup Inicial (15 min)

#### 1.1 - Criar Projeto

**Opção A: Automático (Recomendado)**

```bash
# Windows PowerShell
.\setup-automatico.ps1

# Mac/Linux
./setup-automatico.sh
```

**Opção B: Manual**

```bash
# 1. Criar projeto
npx create-next-app@latest erp-hotelaria \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*"

# 2. Entrar na pasta
cd erp-hotelaria

# 3. Instalar dependências (copie TUDO de uma vez!)
npm install @radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-popover @radix-ui/react-progress @radix-ui/react-radio-group @radix-ui/react-scroll-area @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slider @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-toast @radix-ui/react-tooltip @radix-ui/react-slot class-variance-authority clsx tailwind-merge lucide-react sonner recharts react-hook-form@7.55.0 zod @hookform/resolvers date-fns @supabase/supabase-js @supabase/ssr
```

#### 1.2 - Criar Estrutura

```bash
# Criar pastas
mkdir -p components/{ui,pdv,hotel,estoque,dashboard,financeiro}
mkdir -p lib/supabase hooks types utils public
```

#### 1.3 - Arquivos Base

**`lib/utils.ts`:**
```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**`lib/supabase/client.ts`:**
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**`lib/supabase/server.ts`:**
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {}
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {}
        },
      },
    }
  )
}
```

---

### FASE 2: Configurar Supabase (15 min)

#### 2.1 - Criar Conta e Projeto

1. Acesse: https://supabase.com
2. Faça login (GitHub recomendado)
3. Clique em "New Project"
4. Preencha:
   - **Name:** `erp-hotelaria`
   - **Database Password:** [ANOTE ISSO!]
   - **Region:** `South America (São Paulo)`
5. Clique em "Create new project"
6. ⏳ Aguarde 2-3 minutos

#### 2.2 - Pegar Credenciais

1. No Supabase, vá em **Settings** > **API**
2. Copie:
   - **Project URL** → Para `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → Para `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### 2.3 - Configurar `.env.local`

Crie arquivo `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### 2.4 - Criar Tabelas

No Supabase:
1. Vá em **SQL Editor**
2. Clique em **+ New Query**
3. Cole o SQL (está no arquivo `SETUP-NEXTJS-COMPLETO.md`)
4. Clique em **Run**

Ou copie daqui (resumido):

```sql
-- Enable UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'operator')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  category TEXT,
  subcategory TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- [Cole o resto do SQL completo]
```

---

### FASE 3: Copiar Componentes (15 min)

#### 3.1 - Identificar Componentes para Copiar

Do projeto React, copie:

```bash
# Componentes principais
components/
├── Header.tsx              ← Copiar
├── ProductCatalog.tsx      ← Copiar
├── ComandaSidebar.tsx      ← Copiar
├── ComandaDetail.tsx       ← Copiar
├── PaymentScreen.tsx       ← Copiar
├── Hotel.tsx               ← Copiar
├── Inventory.tsx           ← Copiar
├── Dashboard.tsx           ← Copiar
├── Transactions.tsx        ← Copiar
└── ui/                     ← Copiar TUDO

# Utils
hooks/
types/
utils/
```

#### 3.2 - Copiar Manualmente

```bash
# No terminal, na pasta do projeto Next.js:

# Copiar componentes
cp -r ../figma-make/components/* ./components/

# Copiar hooks
cp -r ../figma-make/hooks/* ./hooks/

# Copiar types
cp -r ../figma-make/types/* ./types/

# Copiar utils
cp -r ../figma-make/utils/* ./utils/
```

#### 3.3 - Corrigir Imports

**Automático (Recomendado):**

```bash
# Windows
.\CORRECAO-AUTOMATICA.ps1

# Mac/Linux
./SCRIPT-CORRECAO-AUTOMATICA.sh
```

**Manual:**

Use Find & Replace no VS Code (`Ctrl+Shift+H`):

1. **Ativar Regex** (ícone `.*`)

2. **Corrigir Radix:**
   ```
   Find: @radix-ui/react-([a-z-]+)@[\d.]+
   Replace: @radix-ui/react-$1
   ```

3. **Corrigir lucide:**
   ```
   Find: lucide-react@[\d.]+
   Replace: lucide-react
   ```

4. **Corrigir class-variance-authority:**
   ```
   Find: class-variance-authority@[\d.]+
   Replace: class-variance-authority
   ```

---

### FASE 4: Adaptar para Next.js (10 min)

#### 4.1 - Adicionar 'use client'

Em componentes que usam hooks (`useState`, `useEffect`, etc.):

```tsx
'use client'  // ← Adicione no topo!

import { useState } from 'react'
// ...resto do código
```

**Onde adicionar:**
- `Header.tsx`
- `ProductCatalog.tsx`
- `ComandaSidebar.tsx`
- `Hotel.tsx`
- `Inventory.tsx`
- Todos em `components/ui/` que usam estado

#### 4.2 - Atualizar App Router

**`app/page.tsx`:**

```tsx
'use client'

import App from '@/components/App'

export default function Home() {
  return <App />
}
```

**`app/layout.tsx`:**

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ERP Hotelaria',
  description: 'Sistema completo de gestão hoteleira',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
```

**`app/globals.css`:**

Copie do projeto React (arquivo `styles/globals.css`)

#### 4.3 - Criar Componente Principal

**`components/App.tsx`:**

Copie o conteúdo do `App.tsx` do projeto React, mas:

1. Adicione `'use client'` no topo
2. Remova o export default
3. Adicione como named export:

```tsx
'use client'

import { useState } from 'react'
// ... resto dos imports

export function App() {  // ← Era "export default function App()"
  // ... resto do código igual
}
```

---

### FASE 5: Testar (5 min)

```bash
# 1. Rodar dev server
npm run dev

# 2. Abrir navegador
# http://localhost:3000

# 3. Testar funcionalidades:
# ✓ Login funciona?
# ✓ Criar comanda funciona?
# ✓ Adicionar produtos funciona?
# ✓ Finalizar venda funciona?
# ✓ Hotel funciona?
# ✓ Estoque funciona?

# 4. Testar build
npm run build

# Se der tudo certo:
# ✓ Compiled successfully
```

---

## 4. 📁 Estrutura Final

```
erp-hotelaria/
├── app/
│   ├── layout.tsx          ← Layout principal
│   ├── page.tsx            ← Chama <App />
│   ├── globals.css         ← Estilos Tailwind
│   └── api/                ← Futuras APIs
│
├── components/
│   ├── App.tsx             ← Componente principal
│   ├── Header.tsx
│   ├── ProductCatalog.tsx
│   ├── ComandaSidebar.tsx
│   ├── Hotel.tsx
│   ├── Inventory.tsx
│   ├── Dashboard.tsx
│   └── ui/                 ← Componentes shadcn
│
├── lib/
│   ├── utils.ts            ← cn() function
│   └── supabase/
│       ├── client.ts       ← Cliente browser
│       └── server.ts       ← Cliente server
│
├── hooks/
│   ├── useLocalStorage.ts
│   └── useDateFilter.ts
│
├── types/
│   ├── index.ts
│   └── database.types.ts
│
├── utils/
│   ├── calculations.ts
│   └── constants.ts
│
├── .env.local              ← Suas credenciais
├── .env.example            ← Template
├── next.config.js
├── tsconfig.json
├── tailwind.config.ts
└── package.json
```

---

## 5. 🚀 Deploy

### Vercel (Recomendado)

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Adicionar variáveis de ambiente
# No dashboard da Vercel:
# Settings > Environment Variables
# Adicione as mesmas de .env.local
```

### Deploy Manual

```bash
# 1. Build
npm run build

# 2. Upload pasta .next/ para servidor
# 3. Rodar:
npm start
```

---

## ✅ Checklist Final

### Setup
- [ ] Node.js instalado
- [ ] Projeto Next.js criado
- [ ] Dependências instaladas
- [ ] Estrutura de pastas criada
- [ ] Arquivos base criados

### Supabase
- [ ] Conta criada
- [ ] Projeto criado
- [ ] Credenciais copiadas
- [ ] `.env.local` configurado
- [ ] Tabelas criadas

### Componentes
- [ ] Componentes copiados
- [ ] Imports corrigidos
- [ ] 'use client' adicionado onde necessário
- [ ] App Router configurado

### Testes
- [ ] `npm run dev` funciona
- [ ] http://localhost:3000 abre
- [ ] Login funciona
- [ ] PDV funciona
- [ ] Hotel funciona
- [ ] Estoque funciona
- [ ] `npm run build` sem erros

### Deploy
- [ ] Build local com sucesso
- [ ] Deploy na Vercel feito
- [ ] Variáveis de ambiente configuradas
- [ ] App online funcionando

---

## 🆘 Se Algo Der Errado

### Erro: "Module not found"

1. Verifique `tsconfig.json` tem `"@/*": ["./*"]`
2. Reinicie VS Code
3. Delete `.next/` e rode `npm run dev` novamente

### Erro: "use client missing"

Adicione `'use client'` no topo do componente com erro

### Erro: Supabase não conecta

1. Verifique `.env.local` está na raiz do projeto
2. Verifique URLs e keys estão corretas
3. Reinicie dev server: `Ctrl+C` e `npm run dev`

### Build falha

```bash
# 1. Limpar cache
rm -rf .next node_modules package-lock.json

# 2. Reinstalar
npm install

# 3. Build novamente
npm run build
```

---

## 📚 Arquivos de Referência

1. **SETUP-NEXTJS-COMPLETO.md** - Guia detalhado passo a passo
2. **GUIA-SETUP-AUTOMATICO.md** - Scripts automáticos
3. **CORRECAO-AUTOMATICA.ps1** - Script Windows para imports
4. **SCRIPT-CORRECAO-AUTOMATICA.sh** - Script Mac/Linux para imports
5. **MUDANCAS-EM-ANDAMENTO.md** - Lista de funcionalidades implementadas

---

## 🎯 Resumo Visual

```
┌─────────────────────────────────────────────────────┐
│ 1. CRIAR PROJETO                                     │
│    npx create-next-app@latest                        │
│    └─ ✓ Next.js + TypeScript + Tailwind            │
├─────────────────────────────────────────────────────┤
│ 2. INSTALAR DEPS                                     │
│    npm install (Radix + Supabase + Utils)           │
│    └─ ✓ Todas bibliotecas                          │
├─────────────────────────────────────────────────────┤
│ 3. CONFIGURAR SUPABASE                               │
│    - Criar conta                                     │
│    - Criar projeto                                   │
│    - Copiar credenciais                              │
│    - Criar tabelas (SQL)                             │
│    └─ ✓ Banco de dados pronto                      │
├─────────────────────────────────────────────────────┤
│ 4. COPIAR COMPONENTES                                │
│    - Copiar do React                                 │
│    - Corrigir imports                                │
│    - Adicionar 'use client'                          │
│    └─ ✓ Código adaptado                            │
├─────────────────────────────────────────────────────┤
│ 5. TESTAR                                            │
│    npm run dev                                       │
│    npm run build                                     │
│    └─ ✓ Tudo funcionando                           │
├─────────────────────────────────────────────────────┤
│ 6. DEPLOY                                            │
│    vercel                                            │
│    └─ ✓ Online!                                     │
└─────────────────────────────────────────────────────┘
```

---

## 💪 Você Consegue!

Este guia foi feito para ser **simples** e **direto ao ponto**.

**Tempo total:** 60 minutos  
**Dificuldade:** Iniciante/Intermediário  

**Siga os passos na ordem e vai dar certo!** 🚀

---

**Precisa de ajuda?** Abra um issue ou me chame!

**Boa sorte!** 🎉