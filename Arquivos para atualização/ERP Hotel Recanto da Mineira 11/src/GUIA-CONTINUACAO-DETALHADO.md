# 🚀 Continuação - Migração Next.js (A partir da Seção 7)

> **📌 VOCÊ ESTÁ AQUI:** Acabou de conectar ao Supabase com sucesso!  
> **🎯 PRÓXIMO PASSO:** Migrar componentes para usar Supabase ao invés de localStorage

---

## ✅ Checklist do Que Você Já Fez

- [x] Criou conta no Supabase
- [x] Criou banco de dados
- [x] Criou tabelas (SQL)
- [x] Criou projeto Next.js (`barconnect-nextjs/`)
- [x] Instalou dependências
- [x] Criou arquivo `.env.local`
- [x] Criou `lib/supabase.ts`
- [x] Testou conexão (página `/test-db` funcionou!)

---

## 📍 ONDE VOCÊ ESTÁ AGORA

```
📁 Seu Computador/
├── 📁 barconnect/           ← Projeto React ORIGINAL (não mexer!)
└── 📁 barconnect-nextjs/    ← Projeto Next.js NOVO (trabalhar aqui!)
    ├── app/
    │   ├── page.tsx         ← Vamos editar este arquivo
    │   ├── test-db/
    │   │   └── page.tsx     ← ✅ Funcionou!
    │   └── layout.tsx
    ├── lib/
    │   └── supabase.ts      ← ✅ Criado!
    ├── .env.local           ← ✅ Criado!
    └── ...
```

---

## 🎯 PRÓXIMOS PASSOS (Detalhados)

### Passo 1: Copiar Arquivos do Projeto React

**⏰ Tempo estimado:** 5 minutos

#### 1.1. Copiar Pasta `types/`

**📂 Origem:** `barconnect/types/`  
**📂 Destino:** `barconnect-nextjs/types/`

**Como fazer:**

1. Abra **DUAS** janelas do Windows Explorer/Finder
2. **Janela 1:** Navegue até `barconnect/`
3. **Janela 2:** Navegue até `barconnect-nextjs/`
4. Na Janela 1, **copie** a pasta `types/` (Ctrl+C ou Cmd+C)
5. Na Janela 2, **cole** (Ctrl+V ou Cmd+V)
6. ✅ Agora você tem `barconnect-nextjs/types/` com 2 arquivos dentro

#### 1.2. Copiar Pasta `utils/`

**📂 Origem:** `barconnect/utils/`  
**📂 Destino:** `barconnect-nextjs/utils/`

**Como fazer:**

1. Na Janela 1 (`barconnect/`), **copie** a pasta `utils/`
2. Na Janela 2 (`barconnect-nextjs/`), **cole**
3. ✅ Agora você tem `barconnect-nextjs/utils/` com 2 arquivos

#### 1.3. Copiar Pasta `data/`

**📂 Origem:** `barconnect/data/`  
**📂 Destino:** `barconnect-nextjs/data/`

**Como fazer:**

1. Na Janela 1, **copie** a pasta `data/`
2. Na Janela 2, **cole**
3. ✅ Agora você tem `barconnect-nextjs/data/products.ts`

#### 1.4. Copiar Pasta `hooks/`

**📂 Origem:** `barconnect/hooks/`  
**📂 Destino:** `barconnect-nextjs/hooks/`

**Como fazer:**

1. Na Janela 1, **copie** a pasta `hooks/`
2. Na Janela 2, **cole**
3. ✅ Agora você tem `barconnect-nextjs/hooks/` com 2 arquivos

#### 1.5. Copiar Pasta `components/`

**📂 Origem:** `barconnect/components/`  
**📂 Destino:** `barconnect-nextjs/components/`

**Como fazer:**

1. Na Janela 1, **copie** a pasta `components/` **INTEIRA**
2. Na Janela 2, **cole**
3. ✅ Agora você tem `barconnect-nextjs/components/` com TODOS os componentes

#### 1.6. Copiar Estilos Globais

**📂 Origem:** `barconnect/styles/globals.css`  
**📂 Destino:** `barconnect-nextjs/app/globals.css`

**Como fazer:**

1. Abra `barconnect/styles/globals.css` no VS Code
2. Selecione TODO o conteúdo (`Ctrl+A` ou `Cmd+A`)
3. Copie (`Ctrl+C` ou `Cmd+C`)
4. Abra `barconnect-nextjs/app/globals.css`
5. Selecione TODO o conteúdo (`Ctrl+A` ou `Cmd+A`)
6. Cole, substituindo (`Ctrl+V` ou `Cmd+V`)
7. **💾 SALVE!** (`Ctrl+S` ou `Cmd+S`)

---

### ✅ Verificação: O Que Você Deve Ter Agora

Abra o terminal e navegue até `barconnect-nextjs/`:

```bash
cd barconnect-nextjs
ls
```

**Você deve ver:**

```
📁 barconnect-nextjs/
├── 📁 app/
├── 📁 components/      ← ✅ NOVA (copiada)
├── 📁 data/            ← ✅ NOVA (copiada)
├── 📁 hooks/           ← ✅ NOVA (copiada)
├── 📁 lib/             ← ✅ Criada antes
├── 📁 public/
├── 📁 types/           ← ✅ NOVA (copiada)
├── 📁 utils/           ← ✅ NOVA (copiada)
├── .env.local          ← ✅ Criado antes
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

### Passo 2: Ajustar Imports nos Arquivos Copiados

**⏰ Tempo estimado:** 3 minutos

Agora vamos trocar todos os imports de `'./`  para `'@/` automaticamente!

#### 2.1. Abrir Find and Replace Global

1. No VS Code, certifique-se que está na pasta `barconnect-nextjs`
2. Aperte `Ctrl+Shift+H` (Windows) ou `Cmd+Shift+H` (Mac)
3. Uma barra lateral aparecerá com **"Find in Files"**

#### 2.2. Substituir: `from './components`

1. **Campo "Find"**: `from './components`
2. **Campo "Replace"**: `from '@/components`
3. Clique no ícone de pasta em "files to include"
4. Digite: `**/*.tsx,**/*.ts` (para buscar em todos os arquivos)
5. Clique em **"Replace All"** (botão no lado direito)
6. Confirme quando pedir

#### 2.3. Substituir: `from './hooks`

1. **Campo "Find"**: `from './hooks`
2. **Campo "Replace"**: `from '@/hooks`
3. Clique em **"Replace All"**

#### 2.4. Substituir: `from './utils`

1. **Campo "Find"**: `from './utils`
2. **Campo "Replace"**: `from '@/utils`
3. Clique em **"Replace All"**

#### 2.5. Substituir: `from './types`

1. **Campo "Find"**: `from './types`
2. **Campo "Replace"**: `from '@/types`
3. Clique em **"Replace All"**

#### 2.6. Substituir: `from './data`

1. **Campo "Find"**: `from './data`
2. **Campo "Replace"**: `from '@/data`
3. Clique em **"Replace All"**

#### 2.7. Substituir: `from "../`

Alguns arquivos podem ter `import from "../components"`.

1. **Campo "Find"**: `from "../components`
2. **Campo "Replace"**: `from "@/components`
3. Clique em **"Replace All"**

Repita para:
- `from "../hooks` → `from "@/hooks`
- `from "../utils` → `from "@/utils`
- `from "../types` → `from "@/types`
- `from "../data` → `from "@/data`

---

### Passo 3: Adicionar 'use client' nos Componentes

**⏰ Tempo estimado:** 10 minutos

Next.js usa Server Components por padrão. Componentes com **estado** ou **interatividade** precisam da diretiva `'use client'`.

#### 3.1. Identificar Quais Arquivos Precisam

**✅ Precisam de 'use client':**

Navegue até `barconnect-nextjs/components/` e abra cada arquivo abaixo:

1. **Header.tsx**
2. **ComandaSidebar.tsx**
3. **ComandaDetail.tsx**
4. **ProductCatalog.tsx**
5. **PaymentScreen.tsx**
6. **NewComandaDialog.tsx**
7. **Dashboard.tsx**
8. **DashboardBar.tsx**
9. **DashboardControladoria.tsx**
10. **Hotel.tsx**
11. **Inventory.tsx**
12. **Transactions.tsx**
13. **LoginScreen.tsx**
14. **EditStockDialog.tsx**
15. **NewTransactionDialog.tsx**

**❌ NÃO precisam:**
- Arquivos em `components/ui/` (maioria já tem)

#### 3.2. Adicionar 'use client' em Cada Arquivo

Para CADA arquivo da lista acima:

1. **Abra o arquivo** (ex: `Header.tsx`)
2. **Vá para a primeira linha** do arquivo
3. **ANTES de qualquer import**, adicione:

```tsx
'use client'
```

**Exemplo ANTES:**

```tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
// ...resto do código
```

**Exemplo DEPOIS:**

```tsx
'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
// ...resto do código
```

4. **💾 SALVE O ARQUIVO!** (`Ctrl+S` ou `Cmd+S`)
5. Repita para os próximos 14 arquivos

---

### ⏸️ PAUSA PARA SALVAR TUDO!

**ANTES DE CONTINUAR:**

1. No VS Code, vá em **File → Save All** (ou `Ctrl+K S` / `Cmd+K S`)
2. Isso garante que todos os arquivos estão salvos
3. ✅ Você não deve ver mais nenhum ponto branco ao lado dos nomes dos arquivos

---

### Passo 4: Criar Hooks Customizados para Supabase

Agora vamos criar os hooks que substituem o localStorage!

#### 4.1. Hook: useComandasDB.ts

**📂 Local:** `barconnect-nextjs/hooks/useComandasDB.ts`

1. No VS Code, navegue até `hooks/`
2. Clique com botão direito → **"New File"**
3. Digite: `useComandasDB.ts` e pressione Enter
4. **Cole o código abaixo:**

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
            stock: 999,
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
      await fetchComandas();
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
      const { data: existing } = await supabase
        .from('comanda_items')
        .select('*')
        .eq('comanda_id', comandaId)
        .eq('product_id', productId)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('comanda_items')
          .update({ quantity: existing.quantity + 1 })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
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

  // Remover item
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

  // Deletar comanda
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

5. **💾 SALVE!** (`Ctrl+S` ou `Cmd+S`)
6. ✅ Verifique: Arquivo criado em `hooks/useComandasDB.ts`

---

#### 4.2. Hook: useProductsDB.ts

**📂 Local:** `barconnect-nextjs/hooks/useProductsDB.ts`

1. No VS Code, em `hooks/`
2. Clique com botão direito → **"New File"**
3. Digite: `useProductsDB.ts` e pressione Enter
4. **Cole o código abaixo:**

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

5. **💾 SALVE!** (`Ctrl+S` ou `Cmd+S`)
6. ✅ Verifique: Arquivo criado em `hooks/useProductsDB.ts`

---

#### 4.3. Hook: useTransactionsDB.ts

**📂 Local:** `barconnect-nextjs/hooks/useTransactionsDB.ts`

1. No VS Code, em `hooks/`
2. Clique com botão direito → **"New File"**
3. Digite: `useTransactionsDB.ts` e pressione Enter
4. **Cole o código abaixo:**

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

5. **💾 SALVE!** (`Ctrl+S` ou `Cmd+S`)
6. ✅ Verifique: Você tem 5 arquivos em `hooks/`:
   - useLocalStorage.ts (do React)
   - useDateFilter.ts (do React)
   - useComandasDB.ts ← ✅ NOVO
   - useProductsDB.ts ← ✅ NOVO
   - useTransactionsDB.ts ← ✅ NOVO

---

### ⏸️ PAUSA PARA SALVAR TUDO NOVAMENTE!

1. **File → Save All** (`Ctrl+K S` ou `Cmd+K S`)
2. ✅ Certifique-se que não há pontos brancos nos nomes dos arquivos

---

### Passo 5: Criar Página Principal (page.tsx)

Agora vamos criar a página que substitui o `App.tsx`!

**📂 Local:** `barconnect-nextjs/app/page.tsx`

1. No VS Code, abra `barconnect-nextjs/app/page.tsx`
2. **DELETE TODO o conteúdo atual**
3. **Cole o código abaixo:**

```tsx
'use client'

import { useState } from "react";
import { Header, PageView } from "@/components/Header";
import { ComandaSidebar } from "@/components/ComandaSidebar";
import { ComandaDetail } from "@/components/ComandaDetail";
import { ProductCatalog } from "@/components/ProductCatalog";
import { PaymentScreen } from "@/components/PaymentScreen";
import { NewComandaDialog } from "@/components/NewComandaDialog";
import { Dashboard } from "@/components/Dashboard";
import { Hotel } from "@/components/Hotel";
import { Inventory } from "@/components/Inventory";
import { Transactions } from "@/components/Transactions";
import { LoginScreen } from "@/components/LoginScreen";
import {
  OrderItem,
  PaymentMethod,
  SaleRecord,
} from "@/types";
import { User } from "@/types/user";
import { toast } from "sonner@2.0.3";
import { useComandasDB } from "@/hooks/useComandasDB";
import { useProductsDB } from "@/hooks/useProductsDB";
import { useTransactionsDB } from "@/hooks/useTransactionsDB";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { PAYMENT_METHOD_NAMES } from "@/utils/constants";
import { formatDate, formatTime } from "@/utils/calculations";

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<PageView>("pdv");
  const [dashboardView, setDashboardView] = useState<"bar" | "controladoria">("bar");
  
  // Hooks do Supabase
  const { comandas, loading: loadingComandas, createComanda, addItemToComanda, removeItem, closeComanda, deleteComanda } = useComandasDB();
  const { products } = useProductsDB();
  const { transactions, addTransaction } = useTransactionsDB();
  
  // Sales ainda usa localStorage (você pode migrar depois)
  const [salesRecords, setSalesRecords] = useLocalStorage<SaleRecord[]>("barconnect_sales", []);
  
  // Estados temporários
  const [selectedComandaId, setSelectedComandaId] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [showNewComandaDialog, setShowNewComandaDialog] = useState(false);
  const [directSaleItems, setDirectSaleItems] = useState<OrderItem[]>([]);
  const [isDirectSale, setIsDirectSale] = useState(false);

  const selectedComanda = comandas.find((c) => c.id === selectedComandaId) || null;

  const handleNewComanda = () => {
    setShowNewComandaDialog(true);
  };

  const handleCreateComanda = async (
    comandaNumber: number,
    customerName?: string,
  ) => {
    const exists = comandas.some((c) => c.number === comandaNumber);
    if (exists) {
      toast.error(`Comanda #${comandaNumber} já existe`);
      return;
    }

    const comandaId = await createComanda(comandaNumber, customerName);
    if (comandaId) {
      setSelectedComandaId(comandaId);
      setIsDirectSale(false);
    }
  };

  const handleDirectSale = () => {
    setIsDirectSale(true);
    setSelectedComandaId(null);
    setDirectSaleItems([]);
    toast.success("Modo venda direta ativado");
  };

  const handleSelectComanda = (comanda: any) => {
    setSelectedComandaId(comanda.id);
    setIsDirectSale(false);
  };

  const handleCloseComanda = async (comandaId: string) => {
    const comanda = comandas.find((c) => c.id === comandaId);
    if (comanda && comanda.items.length > 0) {
      toast.error("Finalize o pagamento antes de fechar a comanda");
      return;
    }

    await deleteComanda(comandaId);
    if (selectedComandaId === comandaId) {
      setSelectedComandaId(null);
    }
  };

  const handleAddProduct = async (product: any) => {
    if (isDirectSale) {
      const existingItemIndex = directSaleItems.findIndex(
        (item) => item.product.id === product.id,
      );
      if (existingItemIndex >= 0) {
        const newItems = [...directSaleItems];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + 1,
        };
        setDirectSaleItems(newItems);
      } else {
        setDirectSaleItems([...directSaleItems, { product, quantity: 1 }]);
      }
      toast.success(`${product.name} adicionado`);
    } else if (selectedComandaId) {
      await addItemToComanda(
        selectedComandaId,
        product.id,
        product.name,
        product.price
      );
    } else {
      toast.error("Selecione uma comanda ou ative venda direta");
    }
  };

  const handleRemoveItem = async (productId: string) => {
    if (isDirectSale) {
      setDirectSaleItems(
        directSaleItems.filter((item) => item.product.id !== productId),
      );
      toast.success("Item removido");
    } else if (selectedComandaId) {
      await removeItem(selectedComandaId, productId);
    }
  };

  const handleCheckout = () => {
    if (
      (isDirectSale && directSaleItems.length > 0) ||
      (selectedComanda && selectedComanda.items.length > 0)
    ) {
      setShowPayment(true);
    }
  };

  const handleConfirmPayment = async (method: PaymentMethod) => {
    const now = new Date();
    const isCourtesy = method === "courtesy";

    if (isDirectSale) {
      const total = directSaleItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0,
      );

      const saleRecord: SaleRecord = {
        id: Date.now().toString(),
        items: [...directSaleItems],
        total,
        paymentMethod: method,
        date: formatDate(now),
        time: formatTime(now),
        isDirectSale: true,
        isCourtesy,
      };
      setSalesRecords([saleRecord, ...salesRecords]);

      if (!isCourtesy) {
        await addTransaction({
          type: "income",
          description: "Venda Direta",
          amount: total,
          category: "Vendas",
        });
      }

      setDirectSaleItems([]);
      setIsDirectSale(false);
      toast.success(`Venda direta finalizada - ${PAYMENT_METHOD_NAMES[method]}`);
    } else if (selectedComandaId && selectedComanda) {
      const total = selectedComanda.items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0,
      );

      const saleRecord: SaleRecord = {
        id: Date.now().toString(),
        comandaNumber: selectedComanda.number,
        customerName: selectedComanda.customerName,
        items: [...selectedComanda.items],
        total,
        paymentMethod: method,
        date: formatDate(now),
        time: formatTime(now),
        isDirectSale: false,
        isCourtesy,
      };
      setSalesRecords([saleRecord, ...salesRecords]);

      await addTransaction({
        type: "income",
        description: `Venda Comanda #${String(selectedComanda.number).padStart(3, "0")}`,
        amount: total,
        category: "Vendas",
      });

      await closeComanda(selectedComandaId);
      setSelectedComandaId(null);
      toast.success(`Comanda #${selectedComanda.number} finalizada - ${PAYMENT_METHOD_NAMES[method]}`);
    }
    setShowPayment(false);
  };

  const currentItems = isDirectSale
    ? directSaleItems
    : selectedComanda?.items || [];
  const paymentTitle = isDirectSale
    ? "Venda Direta"
    : `Comanda #${selectedComanda?.number}`;

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentView("pdv");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView("pdv");
    setSelectedComandaId(null);
    setDirectSaleItems([]);
    setIsDirectSale(false);
    toast.success("Logout realizado com sucesso");
  };

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (loadingComandas) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return (
          <Dashboard
            activeView={dashboardView}
            transactions={transactions}
            comandas={comandas}
            salesRecords={salesRecords}
          />
        );
      case "hotel":
        return <Hotel />;
      case "inventory":
        return <Inventory />;
      case "transactions":
        return (
          <Transactions
            transactions={transactions}
            onAddTransaction={addTransaction}
          />
        );
      case "pdv":
      default:
        return (
          <div className="flex-1 flex overflow-hidden">
            <ComandaSidebar
              comandas={comandas}
              selectedComandaId={selectedComandaId}
              onSelectComanda={handleSelectComanda}
              onCloseComanda={handleCloseComanda}
              userRole={currentUser.role}
            />

            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 bg-white overflow-hidden">
                <ProductCatalog onAddProduct={handleAddProduct} />
              </div>

              <div className="w-96 border-l border-slate-200 overflow-hidden">
                {isDirectSale ? (
                  <div className="flex flex-col h-full bg-white">
                    <div className="px-6 py-4 border-b border-slate-200">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <h2 className="text-slate-900">Venda Direta</h2>
                          <p className="text-sm text-slate-500 mt-1">Sem comanda</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500">Total</p>
                          <p className="text-2xl text-slate-900">
                            R${" "}
                            {directSaleItems
                              .reduce(
                                (sum, item) =>
                                  sum + item.product.price * item.quantity,
                                0,
                              )
                              .toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="px-6 py-4 border-b border-slate-200">
                      <h3 className="text-slate-700 mb-3">Itens</h3>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6">
                      {directSaleItems.length === 0 ? (
                        <div className="py-12 text-center text-slate-400">
                          <p>Nenhum item adicionado</p>
                        </div>
                      ) : (
                        <div className="space-y-2 py-4">
                          {directSaleItems.map((item) => (
                            <div
                              key={item.product.id}
                              className="p-4 border border-slate-200 rounded-lg"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <p className="text-slate-600 text-sm mb-1">
                                    {item.quantity}x {item.product.name}
                                  </p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <p className="text-slate-900">
                                    R${" "}
                                    {(item.product.price * item.quantity).toFixed(
                                      2,
                                    )}
                                  </p>
                                  <button
                                    onClick={() =>
                                      handleRemoveItem(item.product.id)
                                    }
                                    className="text-slate-400 hover:text-red-600"
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {directSaleItems.length > 0 && (
                      <div className="p-6 border-t border-slate-200">
                        <button
                          onClick={handleCheckout}
                          className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors"
                        >
                          Finalizar Venda - R${" "}
                          {directSaleItems
                            .reduce(
                              (sum, item) =>
                                sum + item.product.price * item.quantity,
                              0,
                            )
                            .toFixed(2)}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <ComandaDetail
                    comanda={selectedComanda}
                    onRemoveItem={handleRemoveItem}
                    onCheckout={handleCheckout}
                  />
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-100">
      <Header
        onNewComanda={handleNewComanda}
        onDirectSale={handleDirectSale}
        currentView={currentView}
        onViewChange={setCurrentView}
        dashboardView={dashboardView}
        onDashboardViewChange={setDashboardView}
        userRole={currentUser.role}
        userName={currentUser.name}
        onLogout={handleLogout}
      />

      {renderContent()}

      {showPayment && (
        <PaymentScreen
          title={paymentTitle}
          items={currentItems}
          onBack={() => setShowPayment(false)}
          onConfirmPayment={handleConfirmPayment}
          userRole={currentUser.role}
          isDirectSale={isDirectSale}
        />
      )}

      <NewComandaDialog
        open={showNewComandaDialog}
        onOpenChange={setShowNewComandaDialog}
        onCreateComanda={handleCreateComanda}
      />
    </div>
  );
}
```

4. **💾 SALVE!** (`Ctrl+S` ou `Cmd+S`)

---

### ⏸️ ÚLTIMA PAUSA - SALVAR TUDO!

1. **File → Save All**
2. Aguarde alguns segundos
3. ✅ Certifique-se que salvou tudo

---

### Passo 6: Testar a Aplicação!

**Agora vamos rodar e ver se funciona!**

1. No terminal (dentro de `barconnect-nextjs/`), execute:

```bash
npm run dev
```

2. Aguarde aparecer:
```
✓ Ready in 3s
○ Local: http://localhost:3000
```

3. **Abra no navegador:** http://localhost:3000

4. **Faça login:**
   - Usuário: `admin`
   - Senha: `admin123`

5. **Teste:**
   - ✅ Criar uma nova comanda
   - ✅ Adicionar produtos
   - ✅ Fazer checkout
   - ✅ Ver no dashboard

---

### ✅ Resultado Esperado

- ✅ Login funciona
- ✅ Comandas criadas aparecem
- ✅ Produtos são adicionados
- ✅ Dados persistem no Supabase
- ✅ Se atualizar a página (F5), dados continuam lá!

---

### ❌ Se Aparecer Erro

**Erro: "Cannot find module '@/types'"**

**Solução:**
1. Verifique se copiou a pasta `types/`
2. Reinicie o servidor (`Ctrl+C` e `npm run dev` novamente)

**Erro: "Missing Supabase environment variables"**

**Solução:**
1. Verifique se criou `.env.local`
2. Reinicie o servidor

**Erro: "relation 'comandas' does not exist"**

**Solução:**
1. Volte ao Supabase → SQL Editor
2. Rode o script SQL novamente

---

## 🎉 PARABÉNS!

Se chegou até aqui e está funcionando, você:
- ✅ Migrou de React para Next.js
- ✅ Conectou ao Supabase
- ✅ Substituiu localStorage por banco de dados real
- ✅ Tem um ERP funcional com dados persistentes!

---

## 📝 Próximos Passos Opcionais

1. **Deletar pasta test-db**
   - Agora que tudo funciona, pode deletar `app/test-db/`

2. **Deploy na Vercel**
   - Siga a seção 8 do guia principal

3. **Adicionar autenticação real**
   - Usar Supabase Auth ao invés de login hardcoded

---

## 💡 Dicas Importantes

### Sempre Salve Antes de Testar!

**⚠️ LEMBRE-SE:**
- Salvar arquivo: `Ctrl+S` / `Cmd+S`
- Salvar todos: `Ctrl+K S` / `Cmd+K S`
- **SE NÃO SALVAR, MUDANÇAS NÃO APARECEM!**

### Reiniciar Servidor Após Mudanças

Se mudou `.env.local` ou arquivos de configuração:
```bash
# No terminal, aperte Ctrl+C
# Depois rode novamente:
npm run dev
```

---

**Versão:** 1.0 - Guia Ultra Detalhado  
**Última atualização:** Outubro 2025
