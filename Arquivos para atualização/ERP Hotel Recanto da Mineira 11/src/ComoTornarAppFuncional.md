# 🚀 Guia COMPLETO para Iniciantes: BarConnect em Produção

> **📌 IMPORTANTE:** Este guia é para quem NUNCA fez deploy de uma aplicação React/Next.js.  
> Vamos explicar cada passo em detalhes, incluindo onde executar comandos e qual pasta criar.

---

## 📚 Índice

1. [Entendendo Onde Você Está Agora](#1-entendendo-onde-você-está-agora)
2. [Por Que Migrar para Next.js?](#2-por-que-migrar-para-nextjs)
3. [Configurar Banco de Dados Supabase](#3-configurar-banco-de-dados-supabase)
4. [Criar Novo Projeto Next.js](#4-criar-novo-projeto-nextjs)
5. [Migrar Código do React para Next.js](#5-migrar-código-do-react-para-nextjs)
6. [Conectar Next.js ao Supabase](#6-conectar-nextjs-ao-supabase)
7. [Substituir localStorage por Supabase](#7-substituir-localstorage-por-supabase)
8. [Fazer Deploy na Vercel](#8-fazer-deploy-na-vercel)
9. [Troubleshooting - Problemas Comuns](#9-troubleshooting---problemas-comuns)

---

## 1. Entendendo Onde Você Está Agora

### 📂 Seu Projeto Atual (React)

Você tem um projeto React que roda localmente usando:
- **Vite** como build tool
- **localStorage** para guardar dados (perde tudo ao limpar cache)
- **Nenhum banco de dados** (tudo é temporário)

```
📁 barconnect/              ← Pasta atual do projeto
├── App.tsx
├── components/
├── hooks/
├── utils/
└── package.json
```

### 🎯 Onde Você Quer Chegar

Um aplicativo **profissional** com:
- ✅ Banco de dados real (dados persistem)
- ✅ URL pública (qualquer um pode acessar)
- ✅ Atualizações automáticas
- ✅ Segurança de dados

---

## 2. Por Que Migrar para Next.js?

### ❌ Problema com React Puro

```
React (navegador) → Supabase (banco de dados)
     ↑
  Expõe credenciais do banco no navegador!
  Qualquer pessoa pode roubar suas chaves! 🚨
```

### ✅ Solução com Next.js

```
React (navegador) → Next.js API (servidor) → Supabase (banco)
                         ↑
                   Chaves ficam seguras aqui!
```

**Resumo:** Next.js adiciona uma camada de servidor que protege suas credenciais.

---

## 3. Configurar Banco de Dados Supabase

### 📍 ONDE FAZER: No navegador (site do Supabase)

### Passo 1: Criar Conta

1. Abra seu navegador
2. Vá para: **https://supabase.com**
3. Clique em **"Start your project"**
4. Escolha uma opção:
   - **GitHub** (recomendado)
   - **Google**
   - **Email**

### Passo 2: Criar Projeto

1. Após login, você verá a tela inicial
2. Clique no botão verde **"New Project"**
3. Preencha:

```
Organization: Deixe a padrão ou crie uma nova
Name: barconnect
Database Password: [CRIE UMA SENHA FORTE E ANOTE!]
Region: South America (São Paulo)
Pricing Plan: Free
```

4. Clique em **"Create new project"**
5. ⏰ **AGUARDE 2-3 MINUTOS** (barra de progresso aparecerá)

### Passo 3: Criar Tabelas do Banco

Agora vamos criar as tabelas que o BarConnect precisa.

#### 3.1. Abrir o Editor SQL

1. No menu lateral esquerdo, procure e clique em **"SQL Editor"** (ícone de banco de dados)
2. Clique no botão **"+ New query"** (canto superior direito)
3. Uma tela de código SQL aparecerá

#### 3.2. Copiar e Colar o Schema

**Copie TODO o código abaixo** e cole no editor SQL:

```sql
-- ============================================
-- BARCONNECT - SCHEMA DO BANCO DE DADOS
-- ============================================
-- Copie e cole TUDO isso no SQL Editor do Supabase
-- Depois clique em "Run" (botão verde)

-- HABILITAR UUID (necessário para IDs únicos)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. TABELA: users (Usuários do Sistema)
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'operator')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. TABELA: products (Produtos/Estoque)
-- ============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  category TEXT,
  subcategory TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. TABELA: comandas (Comandas/Pedidos)
-- ============================================
CREATE TABLE comandas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  number INTEGER NOT NULL UNIQUE,
  customer_name TEXT,
  status TEXT NOT NULL CHECK (status IN ('open', 'closed')) DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

-- ============================================
-- 4. TABELA: comanda_items (Itens das Comandas)
-- ============================================
CREATE TABLE comanda_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comanda_id UUID REFERENCES comandas(id) ON DELETE CASCADE,
  product_id UUID,
  product_name TEXT NOT NULL,
  product_price NUMERIC(10, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. TABELA: transactions (Transações Financeiras)
-- ============================================
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  description TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. TABELA: sales_records (Registro de Vendas)
-- ============================================
CREATE TABLE sales_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comanda_number INTEGER,
  customer_name TEXT,
  total NUMERIC(10, 2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (
    payment_method IN ('cash', 'credit', 'debit', 'pix', 'courtesy')
  ),
  is_direct_sale BOOLEAN NOT NULL DEFAULT FALSE,
  is_courtesy BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. TABELA: sale_items (Itens das Vendas)
-- ============================================
CREATE TABLE sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID REFERENCES sales_records(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  product_price NUMERIC(10, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. TABELA: rooms (Quartos do Hotel)
-- ============================================
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  number TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL CHECK (
    status IN ('available', 'occupied', 'maintenance', 'cleaning')
  ) DEFAULT 'available',
  guest_name TEXT,
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  daily_rate NUMERIC(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================
CREATE INDEX idx_comandas_status ON comandas(status);
CREATE INDEX idx_comandas_number ON comandas(number);
CREATE INDEX idx_comanda_items_comanda ON comanda_items(comanda_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);
CREATE INDEX idx_sales_created ON sales_records(created_at DESC);
CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX idx_rooms_status ON rooms(status);

-- ============================================
-- DADOS INICIAIS (EXEMPLOS)
-- ============================================

-- Inserir produtos de exemplo
INSERT INTO products (name, price, stock, category, subcategory) VALUES
('Cerveja Lata', 5.00, 100, 'bebidas', 'beer'),
('Refrigerante Lata', 4.00, 80, 'bebidas', 'soft-drink'),
('Água Mineral 500ml', 3.00, 120, 'bebidas', 'water'),
('Suco Natural', 8.00, 50, 'bebidas', 'juice'),
('Caipirinha', 15.00, 30, 'bebidas', 'drink'),
('Mojito', 18.00, 25, 'bebidas', 'drink'),
('Porção de Batata Frita', 25.00, 50, 'porcoes', null),
('Porção de Frango à Passarinho', 30.00, 40, 'porcoes', null),
('Porção de Calabresa', 28.00, 35, 'porcoes', null),
('Porção de Mandioca', 20.00, 45, 'porcoes', null),
('Almoço Executivo', 20.00, 30, 'almoco', null),
('Prato Feito', 18.00, 40, 'almoco', null);

-- Inserir quartos de exemplo
INSERT INTO rooms (number, status) VALUES
('101', 'available'),
('102', 'available'),
('103', 'available'),
('201', 'available'),
('202', 'available'),
('203', 'available');

-- ============================================
-- CONFIGURAR ROW LEVEL SECURITY (RLS)
-- ============================================
-- Por enquanto, vamos DESABILITAR RLS para facilitar desenvolvimento
-- ⚠️ EM PRODUÇÃO, você deve configurar políticas de segurança!

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE comandas ENABLE ROW LEVEL SECURITY;
ALTER TABLE comanda_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- Criar política que permite TUDO (temporário para desenvolvimento)
-- ⚠️ ATENÇÃO: Isso é apenas para desenvolvimento! 
-- Em produção, configure políticas específicas!

CREATE POLICY "Allow all for development" ON users FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON products FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON comandas FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON comanda_items FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON transactions FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON sales_records FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON sale_items FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON rooms FOR ALL USING (true);

-- ============================================
-- PRONTO! ✅
-- ============================================
-- Agora clique no botão "Run" (canto inferior direito)
```

#### 3.3. Executar o SQL

1. Após colar o código, clique no botão **"Run"** (botão verde, canto inferior direito)
2. Você verá uma mensagem: **"Success. No rows returned"**
3. ✅ Significa que funcionou!

#### 3.4. Verificar se Deu Certo

1. No menu lateral, clique em **"Table Editor"**
2. Você deve ver 8 tabelas:
   - ✅ users
   - ✅ products
   - ✅ comandas
   - ✅ comanda_items
   - ✅ transactions
   - ✅ sales_records
   - ✅ sale_items
   - ✅ rooms

3. Clique em **"products"** - você deve ver 12 produtos já inseridos!

### Passo 4: Copiar Suas Credenciais

**MUITO IMPORTANTE!** Você vai precisar dessas chaves no Next.js.

1. No menu lateral, clique no ícone de **⚙️ Settings** (engrenagem)
2. Clique em **"API"**
3. Você verá uma tela com várias informações

**Copie e salve em um arquivo de texto:**

```
Project URL: https://xxxxx.supabase.co
anon/public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (diferente)
```

⚠️ **NÃO COMPARTILHE ESSAS CHAVES COM NINGUÉM!**

---

## 4. Criar Novo Projeto Next.js

### 📍 ONDE FAZER: No terminal do seu computador

### Por Que Criar um Novo Projeto?

- React (Vite) e Next.js têm estruturas diferentes
- É mais seguro criar novo e copiar componentes
- Evita conflitos de configuração

### Passo 1: Escolher Onde Criar o Projeto

Vamos criar o projeto Next.js **FORA** da pasta do React atual.

```
📁 Meus Projetos/
├── 📁 barconnect/           ← Projeto React atual (NÃO mexer)
└── 📁 barconnect-nextjs/    ← Novo projeto (vamos criar agora)
```

### Passo 2: Abrir Terminal

**Windows:**
1. Aperte `Win + R`
2. Digite `cmd` e Enter
3. Navegue até onde quer criar o projeto:
   ```bash
   cd C:\Users\SeuNome\MeusProjetos
   ```

**Mac/Linux:**
1. Abra o Terminal
2. Navegue até onde quer criar o projeto:
   ```bash
   cd ~/MeusProjetos
   ```

### Passo 3: Criar Projeto Next.js

**Cole este comando no terminal e pressione Enter:**

```bash
npx create-next-app@latest barconnect-nextjs
```

**Você verá várias perguntas. Responda assim:**

```
✔ Would you like to use TypeScript? › Yes
✔ Would you like to use ESLint? › Yes
✔ Would you like to use Tailwind CSS? › Yes
✔ Would you like your code inside a `src/` directory? › No
✔ Would you like to use App Router? › Yes
✔ Would you like to use Turbopack for `next dev`? › No
✔ Would you like to customize the import alias (@/* by default)? › No
```

⏰ **Aguarde 1-2 minutos** enquanto instala tudo.

### Passo 4: Entrar na Pasta do Projeto

```bash
cd barconnect-nextjs
```

### Passo 5: Instalar Dependências do BarConnect

Agora vamos instalar as bibliotecas que o BarConnect usa.

**Cole cada linha UMA POR VEZ no terminal:**

```bash
npm install @supabase/supabase-js
```

```bash
npm install lucide-react sonner@2.0.3 recharts
```

```bash
npm install @radix-ui/react-dialog @radix-ui/react-tabs @radix-ui/react-select @radix-ui/react-scroll-area @radix-ui/react-label @radix-ui/react-slot
```

```bash
npm install class-variance-authority clsx tailwind-merge
```

### Passo 6: Estrutura de Pastas do Next.js

Seu projeto agora está assim:

```
📁 barconnect-nextjs/
├── 📁 app/              ← Páginas e rotas
│   ├── page.tsx         ← Página inicial (substitui App.tsx)
│   ├── layout.tsx       ← Layout global
│   └── globals.css      ← CSS global
├── 📁 public/           ← Imagens e assets
├── 📄 package.json
├── 📄 next.config.ts
└── 📄 tsconfig.json
```

**Vamos criar pastas que estão faltando:**

```bash
mkdir components hooks utils types data lib
```

Agora está assim:

```
📁 barconnect-nextjs/
├── 📁 app/
├── 📁 components/       ← ✨ Criada
├── 📁 hooks/           ← ✨ Criada
├── 📁 utils/           ← ✨ Criada
├── 📁 types/           ← ✨ Criada
├── 📁 data/            ← ✨ Criada
├── 📁 lib/             ← ✨ Criada (para config Supabase)
└── ...
```

---

## 5. Migrar Código do React para Next.js

### 📍 ONDE FAZER: Copiando arquivos entre pastas

### Passo 1: Copiar Arquivos Simples

**Abra DUAS janelas do explorador de arquivos:**
- Janela 1: Projeto React antigo (`barconnect/`)
- Janela 2: Projeto Next.js novo (`barconnect-nextjs/`)

**Copie essas pastas inteiras:**

```
De: barconnect/types/
Para: barconnect-nextjs/types/

De: barconnect/data/
Para: barconnect-nextjs/data/

De: barconnect/utils/
Para: barconnect-nextjs/utils/

De: barconnect/hooks/
Para: barconnect-nextjs/hooks/
```

### Passo 2: Copiar Components

**Copie a pasta components inteira:**

```
De: barconnect/components/
Para: barconnect-nextjs/components/
```

### Passo 3: Copiar Estilos Tailwind

**Substitua o arquivo CSS:**

1. Abra: `barconnect/styles/globals.css`
2. Copie TODO o conteúdo
3. Abra: `barconnect-nextjs/app/globals.css`
4. Cole substituindo tudo

### Passo 4: Adicionar 'use client' nos Componentes

Next.js usa Server Components por padrão. Componentes com estado precisam da diretiva `'use client'`.

**Abra cada arquivo EM `barconnect-nextjs/components/` e adicione na PRIMEIRA LINHA:**

```tsx
'use client'

import { useState } from 'react';
// resto do código...
```

**Arquivos que precisam de 'use client':**
- ✅ ComandaSidebar.tsx
- ✅ ComandaDetail.tsx
- ✅ ProductCatalog.tsx
- ✅ PaymentScreen.tsx
- ✅ NewComandaDialog.tsx
- ✅ Dashboard.tsx
- ✅ Hotel.tsx
- ✅ Inventory.tsx
- ✅ Transactions.tsx
- ✅ LoginScreen.tsx
- ✅ Header.tsx
- ✅ DashboardBar.tsx
- ✅ DashboardControladoria.tsx
- ❌ Componentes em `components/ui/` (a maioria já tem)

**Como saber se precisa?**
- ❓ Usa `useState`, `useEffect`, etc? → Precisa
- ❓ Tem `onClick`, `onChange`, etc? → Precisa
- ❓ É só apresentação/estático? → Não precisa

### Passo 5: Ajustar Imports

Em Next.js, imports usam `@/` para indicar a raiz do projeto.

**ANTES (React):**
```tsx
import { Button } from './components/ui/button';
import { useLocalStorage } from './hooks/useLocalStorage';
```

**DEPOIS (Next.js):**
```tsx
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/useLocalStorage';
```

**Você precisa fazer isso em TODOS os arquivos copiados.**

**Atalho no VS Code:**
1. Aperte `Ctrl + Shift + H` (Find and Replace em todos arquivos)
2. Find: `from './components`
3. Replace: `from '@/components`
4. Clique em "Replace All"

Repita para:
- `'./hooks` → `'@/hooks`
- `'./utils` → `'@/utils`
- `'./types` → `'@/types`
- `'./data` → `'@/data`

---

## 6. Conectar Next.js ao Supabase

### Passo 1: Criar Arquivo de Variáveis de Ambiente

**📍 ONDE:** Na raiz do projeto Next.js (`barconnect-nextjs/`)

1. Crie um arquivo chamado: `.env.local`
2. Cole isso dentro (substitua pelas SUAS credenciais do Passo 3.4):

```env
# SUPABASE CREDENTIALS
# Substitua pelos valores que você copiou do Supabase!

NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Não use esta chave no frontend! Só em API Routes
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **IMPORTANTE:**
- Não pode ter espaços antes ou depois do `=`
- Não pode ter aspas `"` ou `'`
- Salve o arquivo e feche

### Passo 2: Adicionar .env.local no .gitignore

Isso impede que suas credenciais sejam enviadas para o GitHub.

1. Abra: `barconnect-nextjs/.gitignore`
2. Verifique se existe a linha: `.env*.local`
3. Se não existir, adicione no final do arquivo

### Passo 3: Criar Cliente Supabase

**📍 ONDE:** Criar arquivo `barconnect-nextjs/lib/supabase.ts`

1. Crie a pasta `lib` se não existir
2. Dentro dela, crie o arquivo `supabase.ts`
3. Cole este código:

```typescript
import { createClient } from '@supabase/supabase-js';

// Validar que as variáveis existem
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables!');
}

// Criar cliente Supabase (usado em todo o app)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Passo 4: Testar Conexão

Vamos criar uma página de teste para verificar se conectou.

**📍 ONDE:** Criar arquivo `barconnect-nextjs/app/test-db/page.tsx`

1. Dentro de `app/`, crie pasta `test-db`
2. Dentro dela, crie `page.tsx`
3. Cole este código:

```tsx
'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestDB() {
  const [products, setProducts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .limit(5);

        if (error) throw error;
        setProducts(data || []);
      } catch (err: any) {
        setError(err.message);
      }
    }

    fetchProducts();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Teste de Conexão - Supabase</h1>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          ❌ Erro: {error}
        </div>
      )}

      {products.length > 0 ? (
        <div className="bg-green-100 text-green-700 p-4 rounded">
          ✅ Conexão funcionando! {products.length} produtos encontrados:
          <ul className="mt-2">
            {products.map(p => (
              <li key={p.id}>{p.name} - R$ {p.price}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-gray-500">Carregando...</div>
      )}
    </div>
  );
}
```

### Passo 5: Rodar e Testar

**No terminal (ainda em `barconnect-nextjs/`):**

```bash
npm run dev
```

Aguarde aparecer:
```
✓ Ready in 2s
○ Local: http://localhost:3000
```

**Abra no navegador:** `http://localhost:3000/test-db`

**Resultado esperado:**
- ✅ Verde: "Conexão funcionando! 12 produtos encontrados: Cerveja Lata..."
- ❌ Vermelho: Erro (veja seção Troubleshooting)

**Se funcionou, PARABÉNS! 🎉 Seu Next.js está conectado ao Supabase!**

---

## 7. Substituir localStorage por Supabase

Agora vamos fazer os dados persistirem no banco ao invés do localStorage.

### 📋 Visão Geral do Que Vamos Fazer

Vamos criar **3 hooks customizados** que substituem o localStorage:

1. **`hooks/useComandasDB.ts`** - Gerencia comandas no Supabase
2. **`hooks/useProductsDB.ts`** - Gerencia produtos no Supabase  
3. **`hooks/useTransactionsDB.ts`** - Gerencia transações no Supabase

**Tempo estimado:** 30-40 minutos  
**Arquivos a criar:** 3 arquivos novos

---

### 🔧 Hook 1: Comandas (useComandasDB)

#### ANTES (com localStorage):

```tsx
const [comandas, setComandas] = useLocalStorage<Comanda[]>('comandas', []);
```

#### DEPOIS (com Supabase):

**📍 CRIAR ARQUIVO:** `barconnect-nextjs/hooks/useComandasDB.ts`

1. No VS Code, abra a pasta `barconnect-nextjs/hooks/`
2. Clique com botão direito → **"New File"**
3. Digite: `useComandasDB.ts`
4. Pressione Enter
5. **Cole o código abaixo:**

```typescript
'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Comanda } from '@/types';
import { toast } from 'sonner@2.0.3';

export function useComandasDB() {
  const [comandas, setComandas] = useState<Comanda[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar comandas do banco
  const fetchComandas = async () => {
    try {
      const { data, error } = await supabase
        .from('comandas')
        .select(`
          *,
          comanda_items (*)
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transformar dados do banco para formato do app
      const formatted = (data || []).map((comanda: any) => ({
        id: comanda.id,
        number: comanda.number,
        customerName: comanda.customer_name,
        items: comanda.comanda_items.map((item: any) => ({
          product: {
            id: item.product_id || item.id,
            name: item.product_name,
            price: parseFloat(item.product_price),
            stock: 999, // Placeholder
            category: 'unknown',
          },
          quantity: item.quantity,
        })),
        createdAt: new Date(comanda.created_at),
        status: comanda.status as 'open' | 'closed',
      }));

      setComandas(formatted);
      setLoading(false);
    } catch (error: any) {
      console.error('Erro ao buscar comandas:', error);
      toast.error('Erro ao carregar comandas');
      setLoading(false);
    }
  };

  // Criar nova comanda
  const createComanda = async (number: number, customerName?: string) => {
    try {
      const { data, error } = await supabase
        .from('comandas')
        .insert({
          number,
          customer_name: customerName,
          status: 'open'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success(`Comanda #${number} criada`);
      await fetchComandas(); // Recarregar lista
      return data.id;
    } catch (error: any) {
      console.error('Erro ao criar comanda:', error);
      toast.error('Erro ao criar comanda');
      return null;
    }
  };

  // Adicionar item na comanda
  const addItemToComanda = async (
    comandaId: string,
    productId: string,
    productName: string,
    productPrice: number
  ) => {
    try {
      // Verificar se item já existe
      const { data: existing } = await supabase
        .from('comanda_items')
        .select('*')
        .eq('comanda_id', comandaId)
        .eq('product_id', productId)
        .single();

      if (existing) {
        // Incrementar quantidade
        const { error } = await supabase
          .from('comanda_items')
          .update({ quantity: existing.quantity + 1 })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Criar novo item
        const { error } = await supabase
          .from('comanda_items')
          .insert({
            comanda_id: comandaId,
            product_id: productId,
            product_name: productName,
            product_price: productPrice,
            quantity: 1
          });

        if (error) throw error;
      }

      toast.success(`${productName} adicionado`);
      await fetchComandas();
    } catch (error: any) {
      console.error('Erro ao adicionar item:', error);
      toast.error('Erro ao adicionar item');
    }
  };

  // Remover item da comanda
  const removeItem = async (comandaId: string, productId: string) => {
    try {
      const { error } = await supabase
        .from('comanda_items')
        .delete()
        .eq('comanda_id', comandaId)
        .eq('product_id', productId);

      if (error) throw error;

      toast.success('Item removido');
      await fetchComandas();
    } catch (error: any) {
      console.error('Erro ao remover item:', error);
      toast.error('Erro ao remover item');
    }
  };

  // Fechar comanda
  const closeComanda = async (comandaId: string) => {
    try {
      const { error } = await supabase
        .from('comandas')
        .update({
          status: 'closed',
          closed_at: new Date().toISOString()
        })
        .eq('id', comandaId);

      if (error) throw error;

      toast.success('Comanda finalizada');
      await fetchComandas();
    } catch (error: any) {
      console.error('Erro ao fechar comanda:', error);
      toast.error('Erro ao fechar comanda');
    }
  };

  // Deletar comanda (apenas admin)
  const deleteComanda = async (comandaId: string) => {
    try {
      const { error } = await supabase
        .from('comandas')
        .delete()
        .eq('id', comandaId);

      if (error) throw error;

      toast.success('Comanda removida');
      await fetchComandas();
    } catch (error: any) {
      console.error('Erro ao deletar comanda:', error);
      toast.error('Erro ao deletar comanda');
    }
  };

  // Carregar comandas ao montar
  useEffect(() => {
    fetchComandas();
  }, []);

  return {
    comandas,
    loading,
    createComanda,
    addItemToComanda,
    removeItem,
    closeComanda,
    deleteComanda,
    refetch: fetchComandas,
  };
}
```

6. **💾 SALVE O ARQUIVO!** (`Ctrl+S` ou `Cmd+S`)
7. ✅ **Verifique:** Não deve ter nenhum erro vermelho no VS Code

---

### 🔧 Hook 2: Produtos (useProductsDB)

**📍 CRIAR ARQUIVO:** `barconnect-nextjs/hooks/useProductsDB.ts`

1. Na pasta `barconnect-nextjs/hooks/`
2. Clique com botão direito → **"New File"**
3. Digite: `useProductsDB.ts`
4. Pressione Enter
5. **Cole o código abaixo:**

```typescript
'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import { toast } from 'sonner@2.0.3';

export function useProductsDB() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;

      const formatted = (data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        price: parseFloat(p.price),
        stock: p.stock,
        category: p.category,
        subcategory: p.subcategory,
      }));

      setProducts(formatted);
      setLoading(false);
    } catch (error: any) {
      console.error('Erro ao buscar produtos:', error);
      toast.error('Erro ao carregar produtos');
      setLoading(false);
    }
  };

  const updateStock = async (productId: string, newStock: number) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', productId);

      if (error) throw error;

      toast.success('Estoque atualizado');
      await fetchProducts();
    } catch (error: any) {
      console.error('Erro ao atualizar estoque:', error);
      toast.error('Erro ao atualizar estoque');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return { products, loading, updateStock, refetch: fetchProducts };
}
```

6. **💾 SALVE O ARQUIVO!** (`Ctrl+S` ou `Cmd+S`)
7. ✅ **Verifique:** Não deve ter nenhum erro vermelho no VS Code

---

### 🔧 Hook 3: Transações (useTransactionsDB)

**📍 CRIAR ARQUIVO:** `barconnect-nextjs/hooks/useTransactionsDB.ts`

1. Na pasta `barconnect-nextjs/hooks/`
2. Clique com botão direito → **"New File"**
3. Digite: `useTransactionsDB.ts`
4. Pressione Enter
5. **Cole o código abaixo:**

```typescript
'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Transaction } from '@/types';
import { toast } from 'sonner@2.0.3';
import { formatDate, formatTime } from '@/utils/calculations';

export function useTransactionsDB() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formatted = (data || []).map((t: any) => ({
        id: t.id,
        type: t.type,
        description: t.description,
        amount: parseFloat(t.amount),
        category: t.category,
        date: formatDate(new Date(t.created_at)),
        time: formatTime(new Date(t.created_at)),
      }));

      setTransactions(formatted);
      setLoading(false);
    } catch (error: any) {
      console.error('Erro ao buscar transações:', error);
      toast.error('Erro ao carregar transações');
      setLoading(false);
    }
  };

  const addTransaction = async (
    transaction: Omit<Transaction, 'id' | 'date' | 'time'>
  ) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .insert({
          type: transaction.type,
          description: transaction.description,
          amount: transaction.amount,
          category: transaction.category,
        });

      if (error) throw error;

      toast.success('Transação adicionada');
      await fetchTransactions();
    } catch (error: any) {
      console.error('Erro ao adicionar transação:', error);
      toast.error('Erro ao adicionar transação');
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return {
    transactions,
    loading,
    addTransaction,
    refetch: fetchTransactions,
  };
}
```

6. **💾 SALVE O ARQUIVO!** (`Ctrl+S` ou `Cmd+S`)
7. ✅ **Verifique:** Você deve ter 3 arquivos novos em `hooks/`:
   - ✅ useComandasDB.ts
   - ✅ useProductsDB.ts
   - ✅ useTransactionsDB.ts

---

### 📄 Migrar App.tsx para page.tsx

**Agora vamos criar a página principal do Next.js!**

**📍 EDITAR ARQUIVO:** `barconnect-nextjs/app/page.tsx`

1. Abra o arquivo `barconnect-nextjs/app/page.tsx`
2. **DELETE TODO o conteúdo atual**
3. **Cole o código abaixo:**

Copie todo o conteúdo de `App.tsx` para `app/page.tsx`, mas:
1. Adicione `'use client'` na primeira linha
2. Substitua `useLocalStorage` por hooks do Supabase
3. Ajuste imports para usar `@/`

Exemplo simplificado:

```tsx
'use client'

import { useState } from "react";
import { Header, PageView } from "@/components/Header";
import { useComandasDB } from "@/hooks/useComandasDB";
import { useProductsDB } from "@/hooks/useProductsDB";
// ... outros imports

export default function Home() {
  const { comandas, createComanda, addItemToComanda } = useComandasDB();
  const { products } = useProductsDB();
  
  // ... resto do código
}
```

---

## 8. Fazer Deploy na Vercel

### Passo 1: Subir Código no GitHub

**Se você ainda não tem Git instalado:**
1. Baixe em: https://git-scm.com/downloads
2. Instale com configurações padrão

**No terminal (em `barconnect-nextjs/`):**

```bash
git init
git add .
git commit -m "Initial commit - BarConnect Next.js"
```

**Criar repositório no GitHub:**
1. Vá para: https://github.com
2. Clique em **"New repository"**
3. Nome: `barconnect-nextjs`
4. Deixe **Public** ou **Private** (sua escolha)
5. **NÃO** marque "Initialize with README"
6. Clique em **"Create repository"**

**Copie os comandos que aparecem (parecidos com isso):**

```bash
git remote add origin https://github.com/seu-usuario/barconnect-nextjs.git
git branch -M main
git push -u origin main
```

Cole no terminal e pressione Enter.

### Passo 2: Conectar Vercel

1. Vá para: **https://vercel.com**
2. Clique em **"Sign Up"**
3. Escolha **"Continue with GitHub"**
4. Autorize a Vercel a acessar seus repositórios

### Passo 3: Importar Projeto

1. Clique em **"Add New..."** → **"Project"**
2. Você verá uma lista de repositórios
3. Encontre **barconnect-nextjs** e clique em **"Import"**

### Passo 4: Configurar Variáveis de Ambiente

**MUITO IMPORTANTE!**

Na tela de configuração:

1. Expanda **"Environment Variables"**
2. Adicione as 3 variáveis:

```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://xxxxx.supabase.co
```

```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Passo 5: Deploy!

1. Clique em **"Deploy"**
2. ⏰ Aguarde 2-3 minutos
3. ✅ Você verá confetes e **"Congratulations!"**

**Seu app está no ar em:** `https://barconnect-nextjs.vercel.app`

### Passo 6: Deploy Automático

Agora, sempre que você fizer push no GitHub:

```bash
git add .
git commit -m "nova funcionalidade"
git push
```

A Vercel automaticamente:
1. Detecta mudança
2. Faz novo build
3. Publica atualização
4. Você recebe email confirmando

---

## 9. Troubleshooting - Problemas Comuns

### ❌ Erro: "Missing Supabase environment variables"

**Causa:** Arquivo `.env.local` não foi criado ou tem nome errado

**Solução:**
1. Verifique se arquivo se chama exatamente `.env.local` (com ponto no início)
2. Verifique se está na raiz do projeto (não dentro de pasta)
3. Reinicie o servidor: `Ctrl+C` e `npm run dev` novamente

### ❌ Erro: "relation 'products' does not exist"

**Causa:** Tabelas não foram criadas no Supabase

**Solução:**
1. Volte ao Supabase → SQL Editor
2. Rode o script SQL novamente (Passo 3.2)
3. Verifique em Table Editor se tabelas existem

### ❌ Erro: "Failed to fetch" ou "Network error"

**Causa:** URL do Supabase está errado

**Solução:**
1. Volte ao Supabase → Settings → API
2. Copie a URL exata (sem espaços)
3. Atualize `.env.local`
4. Reinicie servidor

### ❌ Erro: "Invalid API key"

**Causa:** Chave anon/public está errada

**Solução:**
1. Volte ao Supabase → Settings → API
2. Role até "Project API keys"
3. Copie a chave **"anon public"** (não a service_role)
4. Atualize `.env.local`

### ❌ Erro: "Permission denied" ao fazer query

**Causa:** Row Level Security (RLS) está bloqueando

**Solução:**
1. Supabase → Table Editor
2. Clique na tabela com problema
3. Clique em "RLS disabled" (botão verde)
4. OU rode as políticas do script SQL (final do Passo 3.2)

### ❌ Build falha na Vercel

**Solução 1: Verificar variáveis de ambiente**
1. Vercel Dashboard → Seu projeto
2. Settings → Environment Variables
3. Confirme que todas as 3 variáveis estão lá
4. Clique em "Redeploy"

**Solução 2: Testar build local**
```bash
npm run build
```

Se der erro, conserte localmente primeiro, depois faça push.

### ❌ "Module not found: Can't resolve '@/components'"

**Causa:** TypeScript não reconhece o alias `@`

**Solução:**
Verifique `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

Reinicie o editor (VS Code) e o servidor.

### ❌ Dados não aparecem após deploy

**Causa:** Você está olhando produção, mas dados estão em desenvolvimento

**Solução:**
- Supabase tem APENAS UM banco (mesmos dados localmente e em produção)
- Se funcionou localmente, deve funcionar em produção
- Verifique Console do navegador (F12) para erros
- Verifique se RLS está desabilitado

---

## 🎉 Parabéns!

Se você chegou até aqui, você agora tem:

✅ Banco de dados funcional no Supabase  
✅ Aplicação Next.js rodando localmente  
✅ Conexão entre Next.js e Supabase  
✅ Deploy na Vercel com URL pública  
✅ Atualizações automáticas via GitHub  

### 📚 Próximos Passos Recomendados

1. **Implementar autenticação real** (Supabase Auth)
2. **Configurar Row Level Security** (políticas de segurança)
3. **Adicionar mais funcionalidades** (relatórios, etc)
4. **Testar em dispositivos móveis**
5. **Configurar domínio personalizado** na Vercel

---

## 📞 Precisa de Ajuda?

Se você seguiu todos os passos e ainda está com problemas:

1. **Verifique logs de erro**: Console do navegador (F12)
2. **Verifique terminal**: Erros aparecem ali
3. **Pesquise o erro**: Google/StackOverflow
4. **Documente o problema**: 
   - Qual passo você está?
   - Qual erro exato aparece?
   - Que comandos você rodou?

**Recursos úteis:**
- [Documentação Supabase](https://supabase.com/docs)
- [Documentação Next.js](https://nextjs.org/docs)
- [Documentação Vercel](https://vercel.com/docs)

---

**Boa sorte com seu projeto! 🚀**

*Última atualização: Outubro 2025*  
*Versão: 3.0 - Guia Detalhado para Iniciantes*