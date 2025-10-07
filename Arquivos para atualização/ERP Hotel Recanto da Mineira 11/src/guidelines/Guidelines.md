# 📘 BarConnect - Guia de Desenvolvimento

## 🎯 Visão Geral

O **BarConnect** é um ERP completo para hotéis de pequeno porte com design moderno e minimalista. Este documento serve como guia de boas práticas e padrões de código.

---

## 🏗️ Arquitetura do Projeto

### Estrutura de Pastas

```
/
├── components/          # Componentes React reutilizáveis
│   ├── ui/             # Componentes do shadcn/ui
│   └── figma/          # Componentes específicos do Figma
├── hooks/              # Custom React Hooks
├── utils/              # Funções utilitárias
├── data/               # Dados mockados/estáticos
├── types/              # TypeScript type definitions
├── styles/             # Estilos globais (Tailwind v4)
└── guidelines/         # Documentação do projeto
```

### Tecnologias Utilizadas

- **React 18** - Framework UI
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Estilização
- **shadcn/ui** - Biblioteca de componentes
- **Lucide React** - Ícones
- **Recharts** - Gráficos
- **Sonner** - Notificações toast

---

## 📋 Padrões de Código

### 1. Componentes React

**✅ BOM:**
```tsx
'use client' // Se usar Next.js e tiver estado

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  const [state, setState] = useState<string>('');

  return (
    <div className="p-4">
      <h2>{title}</h2>
      <Button onClick={onAction}>Click me</Button>
    </div>
  );
}
```

**❌ RUIM:**
```tsx
// Sem tipos
export function MyComponent({ title, onAction }) {
  // ...
}

// Componente padrão ao invés de named export
export default function MyComponent() {
  // ...
}
```

### 2. Imports

**Ordem recomendada:**
```tsx
// 1. React e bibliotecas externas
import { useState, useEffect } from 'react';
import { toast } from 'sonner@2.0.3';

// 2. Componentes
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';

// 3. Hooks customizados
import { useLocalStorage } from '@/hooks/useLocalStorage';

// 4. Utils e constantes
import { PAYMENT_METHOD_NAMES } from '@/utils/constants';
import { formatCurrency } from '@/utils/calculations';

// 5. Types
import { Product, Comanda } from '@/types';
```

### 3. State Management

**Use hooks customizados para lógica complexa:**

```tsx
// hooks/useComandas.ts
export function useComandas() {
  const [comandas, setComandas] = useLocalStorage<Comanda[]>('comandas', []);

  const addComanda = (comanda: Comanda) => {
    setComandas([...comandas, comanda]);
  };

  const removeComanda = (id: string) => {
    setComandas(comandas.filter(c => c.id !== id));
  };

  return { comandas, addComanda, removeComanda };
}
```

### 4. Funções Utilitárias

**Extraia lógica reutilizável:**

```tsx
// utils/calculations.ts
export function calculateTotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => 
    sum + item.product.price * item.quantity, 0
  );
}

export function formatCurrency(value: number): string {
  return `R$ ${value.toFixed(2)}`;
}
```

### 5. Constantes

**Centralize valores fixos:**

```tsx
// utils/constants.ts
export const PAYMENT_METHOD_NAMES = {
  cash: 'Dinheiro',
  credit: 'Crédito',
  debit: 'Débito',
  pix: 'Pix',
  courtesy: 'Cortesia',
} as const;

export const STOCK_THRESHOLDS = {
  LOW: 20,
  MEDIUM: 50,
} as const;
```

---

## 🎨 Estilização com Tailwind

### Classes Permitidas

**✅ Use livremente:**
- Layout: `flex`, `grid`, `p-*`, `m-*`, `w-*`, `h-*`
- Cores: `bg-*`, `text-*`, `border-*`
- Spacing: `gap-*`, `space-*`
- Borders: `border`, `rounded-*`
- Effects: `shadow-*`, `hover:*`, `transition-*`

**❌ EVITE (já definidos no globals.css):**
- `text-xl`, `text-2xl` (tamanho de fonte)
- `font-bold`, `font-medium` (peso de fonte)
- `leading-*` (line-height)

### Exemplo Correto

```tsx
<div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-md">
  <h2 className="text-slate-900">Título</h2>
  <p className="text-slate-600">Descrição</p>
</div>
```

---

## 🔐 Segurança e Boas Práticas

### Dados Sensíveis

**❌ NUNCA faça isso:**
```tsx
const API_KEY = 'sk_live_1234567890'; // Exposto no código
```

**✅ Sempre faça isso:**
```tsx
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
```

### Validação de Dados

**Sempre valide inputs do usuário:**

```tsx
function createComanda(number: number, customerName?: string) {
  // Validação
  if (number <= 0) {
    toast.error('Número da comanda inválido');
    return;
  }

  if (comandas.some(c => c.number === number)) {
    toast.error('Comanda já existe');
    return;
  }

  // Criar comanda...
}
```

### Tratamento de Erros

**Use try/catch em operações assíncronas:**

```tsx
async function fetchData() {
  try {
    const response = await fetch('/api/comandas');
    const data = await response.json();
    setComandas(data);
  } catch (error) {
    console.error('Erro ao buscar comandas:', error);
    toast.error('Erro ao carregar comandas');
  }
}
```

---

## 📱 Responsividade

### Breakpoints Tailwind

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Padrão Mobile-First

```tsx
<div className="
  grid grid-cols-1      // Mobile: 1 coluna
  sm:grid-cols-2        // Small: 2 colunas
  lg:grid-cols-3        // Large: 3 colunas
  xl:grid-cols-4        // Extra large: 4 colunas
  gap-4
">
  {/* conteúdo */}
</div>
```

---

## 🧪 Testes (Futuro)

### Estrutura Recomendada

```
__tests__/
├── components/
│   ├── Header.test.tsx
│   └── ComandaSidebar.test.tsx
├── hooks/
│   └── useLocalStorage.test.ts
└── utils/
    └── calculations.test.ts
```

### Exemplo de Teste

```tsx
import { render, screen } from '@testing-library/react';
import { Header } from '@/components/Header';

describe('Header', () => {
  it('renders user name', () => {
    render(
      <Header 
        userName="João Silva" 
        userRole="admin"
        {...otherProps}
      />
    );
    
    expect(screen.getByText('João Silva')).toBeInTheDocument();
  });
});
```

---

## 🚀 Performance

### Otimizações Recomendadas

1. **Lazy Loading de Componentes**
```tsx
import dynamic from 'next/dynamic';

const Dashboard = dynamic(() => import('@/components/Dashboard'), {
  loading: () => <div>Carregando...</div>
});
```

2. **Memoização**
```tsx
import { useMemo } from 'react';

const totalRevenue = useMemo(() => {
  return sales.reduce((sum, sale) => sum + sale.total, 0);
}, [sales]);
```

3. **useCallback para Funções**
```tsx
import { useCallback } from 'react';

const handleAddProduct = useCallback((product: Product) => {
  setComandas(prev => {
    // lógica...
  });
}, []);
```

---

## 📊 Convenções de Nomenclatura

### Variáveis e Funções

```tsx
// camelCase para variáveis e funções
const totalAmount = 100;
const userName = 'João';

function calculateTotal() { }
function handleAddProduct() { }
```

### Componentes

```tsx
// PascalCase para componentes
function ComandaSidebar() { }
function PaymentScreen() { }
```

### Constantes

```tsx
// UPPER_SNAKE_CASE para constantes globais
const MAX_ITEMS = 100;
const DEFAULT_TIMEOUT = 5000;

// Objetos podem usar camelCase
const paymentMethods = {
  cash: 'Dinheiro',
  credit: 'Crédito',
};
```

### Arquivos

```
# Componentes: PascalCase
Header.tsx
ComandaSidebar.tsx

# Hooks: camelCase com prefixo "use"
useLocalStorage.ts
useDateFilter.ts

# Utils: camelCase
calculations.ts
constants.ts

# Types: camelCase
index.ts
user.ts
```

---

## 🔄 Git Workflow

### Commits

**Use mensagens claras:**

```bash
# ✅ BOM
git commit -m "feat: adiciona filtro de data no dashboard"
git commit -m "fix: corrige cálculo de total na comanda"
git commit -m "refactor: extrai lógica de pagamento para hook"

# ❌ RUIM
git commit -m "alterações"
git commit -m "fix"
git commit -m "wip"
```

### Branches

```bash
main          # Produção
develop       # Desenvolvimento
feature/*     # Novas funcionalidades
fix/*         # Correções
hotfix/*      # Correções urgentes
```

---

## 📝 Documentação de Código

### JSDoc para Funções Complexas

```tsx
/**
 * Calcula o total de uma comanda incluindo taxas
 * @param items - Array de itens da comanda
 * @param serviceFee - Taxa de serviço (padrão: 10%)
 * @returns Total calculado em reais
 */
export function calculateComandaTotal(
  items: OrderItem[],
  serviceFee: number = 0.10
): number {
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  return subtotal * (1 + serviceFee);
}
```

### README em Componentes Complexos

Para componentes muito complexos, crie um README na mesma pasta:

```
components/
├── Dashboard/
│   ├── index.tsx
│   ├── DashboardBar.tsx
│   ├── DashboardControladoria.tsx
│   └── README.md
```

---

## 🎯 Checklist de Code Review

Antes de commitar, verifique:

- [ ] Código segue padrões do projeto
- [ ] Não há console.logs esquecidos
- [ ] Tipos TypeScript estão corretos
- [ ] Componentes são reutilizáveis
- [ ] Não há código duplicado
- [ ] Imports estão organizados
- [ ] Nomes de variáveis são descritivos
- [ ] Erros são tratados apropriadamente
- [ ] Responsividade funciona
- [ ] Performance está otimizada

---

## 🆘 Troubleshooting

### Problema: Componente não re-renderiza

**Solução:** Verifique se está mutando estado diretamente

```tsx
// ❌ ERRADO
comandas[0].items.push(newItem);
setComandas(comandas);

// ✅ CORRETO
setComandas(comandas.map(c => 
  c.id === selectedId 
    ? { ...c, items: [...c.items, newItem] }
    : c
));
```

### Problema: Build falha no Vercel

**Solução:** Rode `npm run build` localmente para ver erros

```bash
npm run build
```

### Problema: Types TypeScript não encontrados

**Solução:** Reinicie o TypeScript server no VS Code

```
Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

---

## 📚 Recursos de Aprendizado

### Documentação Oficial
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)

### Tutoriais Recomendados
- [React Patterns](https://reactpatterns.com)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)

---

## 🎉 Conclusão

Seguir esses padrões garante:
- ✅ Código limpo e manutenível
- ✅ Menos bugs
- ✅ Melhor performance
- ✅ Facilita trabalho em equipe
- ✅ Onboarding mais rápido

**Lembre-se:** Boas práticas são um processo contínuo de aprendizado!

---

**Última atualização:** Outubro 2025  
**Versão:** 2.0