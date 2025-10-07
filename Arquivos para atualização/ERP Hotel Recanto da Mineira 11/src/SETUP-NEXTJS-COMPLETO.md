# 🚀 Setup Completo - Next.js + Supabase

> **Guia definitivo para criar o projeto do zero!**

---

## 📋 Pré-requisitos

- Node.js 18+ instalado
- VS Code instalado
- Git instalado (opcional)

---

## 🎯 PASSO 1: Criar Projeto Next.js

### Opção A: Criação Automática (RECOMENDADO)

```bash
# 1. Navegue até a pasta onde quer criar o projeto
cd ~/projetos

# 2. Rode este comando
npx create-next-app@latest erp-hotelaria --typescript --tailwind --app --no-src-dir --import-alias "@/*"

# 3. Quando perguntar, responda:
# ✓ Would you like to use TypeScript? → Yes
# ✓ Would you like to use ESLint? → Yes
# ✓ Would you like to use Tailwind CSS? → Yes
# ✓ Would you like your code inside a `src/` directory? → No
# ✓ Would you like to use App Router? → Yes
# ✓ Would you like to use Turbopack? → No
# ✓ Would you like to customize the import alias? → No

# 4. Entre na pasta
cd erp-hotelaria
```

### Opção B: Criação Manual

```bash
# 1. Crie a pasta
mkdir erp-hotelaria
cd erp-hotelaria

# 2. Inicialize o projeto
npm init -y

# 3. Instale Next.js
npm install next@latest react@latest react-dom@latest

# 4. Instale TypeScript
npm install -D typescript @types/react @types/node

# 5. Instale Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## 📦 PASSO 2: Instalar Dependências

```bash
# Componentes UI
npm install @radix-ui/react-accordion
npm install @radix-ui/react-alert-dialog
npm install @radix-ui/react-avatar
npm install @radix-ui/react-checkbox
npm install @radix-ui/react-dialog
npm install @radix-ui/react-dropdown-menu
npm install @radix-ui/react-label
npm install @radix-ui/react-popover
npm install @radix-ui/react-progress
npm install @radix-ui/react-radio-group
npm install @radix-ui/react-scroll-area
npm install @radix-ui/react-select
npm install @radix-ui/react-separator
npm install @radix-ui/react-slider
npm install @radix-ui/react-switch
npm install @radix-ui/react-tabs
npm install @radix-ui/react-toast
npm install @radix-ui/react-tooltip
npm install @radix-ui/react-slot

# Utilitários UI
npm install class-variance-authority
npm install clsx
npm install tailwind-merge
npm install lucide-react
npm install sonner

# Gráficos
npm install recharts

# Formulários
npm install react-hook-form@7.55.0
npm install zod
npm install @hookform/resolvers

# Datas
npm install date-fns

# Supabase
npm install @supabase/supabase-js
npm install @supabase/ssr

# Dev tools
npm install -D @types/react @types/node
```

---

## 🗂️ PASSO 3: Estrutura de Pastas

Crie esta estrutura:

```
erp-hotelaria/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── api/
├── components/
│   ├── ui/
│   ├── pdv/
│   ├── hotel/
│   ├── estoque/
│   ├── dashboard/
│   └── financeiro/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   └── utils.ts
├── hooks/
│   ├── useLocalStorage.ts
│   └── useDateFilter.ts
├── types/
│   ├── index.ts
│   └── database.types.ts
├── utils/
│   ├── calculations.ts
│   └── constants.ts
├── public/
├── .env.local
├── .env.example
├── next.config.js
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
└── package.json
```

---

## ⚙️ PASSO 4: Arquivos de Configuração

### `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['unsplash.com', 'images.unsplash.com'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

module.exports = nextConfig
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
```

### `.env.example`

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🔐 PASSO 5: Configurar Supabase

### 5.1 Criar Conta no Supabase

1. Acesse: https://supabase.com
2. Clique em "Start your project"
3. Crie uma conta (GitHub recomendado)
4. Crie um novo projeto:
   - Nome: `erp-hotelaria`
   - Database Password: **GUARDE BEM!**
   - Region: `South America (São Paulo)`

### 5.2 Pegar Credenciais

1. No dashboard do Supabase, vá em **Settings > API**
2. Copie:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ NUNCA exponha!)

### 5.3 Criar arquivo `.env.local`

```bash
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🗄️ PASSO 6: Criar Tabelas no Supabase

### Opção A: Via Interface (Iniciantes)

1. No Supabase, vá em **SQL Editor**
2. Clique em **New Query**
3. Cole o SQL abaixo
4. Clique em **Run**

### Opção B: Via Script (Avançado)

Crie arquivo `supabase/migrations/001_initial_schema.sql`

### SQL Completo:

```sql
-- Enable UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users (Usuários do sistema)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'operator')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products (Produtos)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  category TEXT,
  subcategory TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comandas
CREATE TABLE comandas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  number INTEGER NOT NULL UNIQUE,
  customer_name TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE
);

-- Comanda Items
CREATE TABLE comanda_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comanda_id UUID REFERENCES comandas(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price_at_time DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales Records (Histórico de vendas)
CREATE TABLE sales_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comanda_number INTEGER,
  customer_name TEXT,
  total DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  is_direct_sale BOOLEAN DEFAULT FALSE,
  is_courtesy BOOLEAN DEFAULT FALSE,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date TEXT NOT NULL,
  time TEXT NOT NULL
);

-- Sale Items
CREATE TABLE sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID REFERENCES sales_records(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  product_price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions (Financeiro)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rooms (Quartos do hotel)
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  number TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('single', 'double', 'suite')),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'cleaning', 'maintenance')),
  daily_rate DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Guests (Hóspedes)
CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  cpf TEXT,
  phone TEXT,
  email TEXT,
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reservations (Reservas/Check-ins)
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
  pilgrimage_id UUID REFERENCES pilgrimages(id),
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pilgrimages (Romarias)
CREATE TABLE pilgrimages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  arrival_date DATE NOT NULL,
  departure_date DATE NOT NULL,
  number_of_people INTEGER NOT NULL,
  bus_group TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes para performance
CREATE INDEX idx_comandas_number ON comandas(number);
CREATE INDEX idx_comanda_items_comanda_id ON comanda_items(comanda_id);
CREATE INDEX idx_sales_records_date ON sales_records(date);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_reservations_room_id ON reservations(room_id);
CREATE INDEX idx_reservations_dates ON reservations(check_in_date, check_out_date);

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE comandas ENABLE ROW LEVEL SECURITY;
ALTER TABLE comanda_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pilgrimages ENABLE ROW LEVEL SECURITY;

-- Policies (permitir tudo por enquanto)
CREATE POLICY "Allow all" ON users FOR ALL USING (true);
CREATE POLICY "Allow all" ON products FOR ALL USING (true);
CREATE POLICY "Allow all" ON comandas FOR ALL USING (true);
CREATE POLICY "Allow all" ON comanda_items FOR ALL USING (true);
CREATE POLICY "Allow all" ON sales_records FOR ALL USING (true);
CREATE POLICY "Allow all" ON sale_items FOR ALL USING (true);
CREATE POLICY "Allow all" ON transactions FOR ALL USING (true);
CREATE POLICY "Allow all" ON rooms FOR ALL USING (true);
CREATE POLICY "Allow all" ON guests FOR ALL USING (true);
CREATE POLICY "Allow all" ON reservations FOR ALL USING (true);
CREATE POLICY "Allow all" ON pilgrimages FOR ALL USING (true);

-- Dados iniciais
INSERT INTO users (name, role) VALUES 
  ('Admin', 'admin'),
  ('Operador', 'operator');

INSERT INTO products (name, price, stock, category, subcategory) VALUES
  ('Caipirinha', 15.00, 100, 'bebidas', 'drink'),
  ('Cerveja Lata', 8.00, 200, 'bebidas', 'cerveja'),
  ('Refrigerante', 5.00, 150, 'bebidas', 'refrigerante'),
  ('Batata Frita', 18.00, 80, 'porcoes', 'frita'),
  ('Calabresa', 25.00, 60, 'porcoes', 'carne'),
  ('Almoço Executivo', 35.00, 30, 'almoco', 'executivo');

INSERT INTO rooms (number, type, status, daily_rate) VALUES
  ('101', 'single', 'available', 150.00),
  ('102', 'single', 'cleaning', 150.00),
  ('103', 'double', 'available', 200.00),
  ('201', 'suite', 'available', 350.00);

INSERT INTO pilgrimages (name, arrival_date, departure_date, number_of_people, bus_group) VALUES
  ('Romaria Aparecida 2025', '2025-10-01', '2025-10-05', 45, 'Ônibus 1 - Aparecida'),
  ('Grupo Nossa Senhora', '2025-09-28', '2025-10-10', 30, 'Ônibus 2 - Fátima');
```

---

## 🔌 PASSO 7: Configurar Cliente Supabase

### `lib/supabase/client.ts`

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### `lib/supabase/server.ts`

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
          } catch (error) {
            // Server Component
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Server Component
          }
        },
      },
    }
  )
}
```

---

## ✅ PASSO 8: Testar Setup

```bash
# 1. Instalar dependências
npm install

# 2. Rodar em desenvolvimento
npm run dev

# 3. Abrir no navegador
# http://localhost:3000

# 4. Testar build
npm run build

# 5. Se der tudo certo:
# ✓ Compiled successfully
```

---

## 🚨 Troubleshooting

### Erro: "Module not found"

**Solução:** Verifique `tsconfig.json` tem:
```json
"paths": {
  "@/*": ["./*"]
}
```

### Erro: "Supabase client not found"

**Solução:** Verifique `.env.local` existe e tem as variáveis corretas

### Erro: "Failed to connect to database"

**Solução:** 
1. Verifique se o projeto Supabase está ativo
2. Verifique se as credenciais estão corretas
3. Teste no SQL Editor do Supabase se as tabelas existem

---

## 📝 Próximos Passos

Depois deste setup:

1. [ ] Copiar componentes do projeto React
2. [ ] Adaptar para usar Supabase
3. [ ] Testar cada funcionalidade
4. [ ] Deploy no Vercel

---

**Tempo estimado:** 30-60 minutos  
**Dificuldade:** Iniciante/Intermediário

**Precisa de ajuda?** Me chame! 🚀