# 🛠️ Guia de Manutenção e Atualizações Futuras - BarConnect

> **📌 Guia detalhado para fazer modificações, adicionar funcionalidades e manter o projeto**

---

## 📚 Índice

1. [Entendendo a Estrutura do Projeto](#entendendo-a-estrutura-do-projeto)
2. [Adicionar Nova Funcionalidade](#adicionar-nova-funcionalidade)
3. [Modificar Funcionalidade Existente](#modificar-funcionalidade-existente)
4. [Adicionar Novo Componente](#adicionar-novo-componente)
5. [Atualizar Dados Mockados](#atualizar-dados-mockados)
6. [Adicionar Nova Página/Aba](#adicionar-nova-páginaaba)
7. [Modificar Estilos](#modificar-estilos)
8. [Troubleshooting](#troubleshooting)

---

## 1. Entendendo a Estrutura do Projeto

### 📂 Mapa de Pastas

```
barconnect/
├── App.tsx                  # ⭐ Arquivo principal - gerencia estado global
├── components/              # 📦 Todos os componentes visuais
│   ├── Header.tsx          # Barra superior com navegação
│   ├── LoginScreen.tsx     # Tela de login
│   ├── ComandaSidebar.tsx  # Lista de comandas (lateral esquerda)
│   ├── ComandaDetail.tsx   # Detalhes da comanda selecionada
│   ├── ProductCatalog.tsx  # Catálogo de produtos (PDV)
│   ├── PaymentScreen.tsx   # Tela de pagamento
│   ├── Dashboard.tsx       # Dashboard principal
│   ├── Hotel.tsx           # Gestão de quartos
│   ├── Inventory.tsx       # Controle de estoque
│   ├── Transactions.tsx    # Transações financeiras
│   └── ui/                 # Componentes do shadcn/ui
├── hooks/                   # 🪝 Custom hooks
│   ├── useLocalStorage.ts  # Persistência em localStorage
│   └── useDateFilter.ts    # Filtro de datas
├── utils/                   # 🔧 Funções utilitárias
│   ├── calculations.ts     # Cálculos (totais, médias, etc)
│   └── constants.ts        # Constantes do projeto
├── data/                    # 📊 Dados mockados
│   └── products.ts         # Lista de produtos
├── types/                   # 📝 TypeScript types
│   ├── index.ts            # Types principais (Comanda, Product, etc)
│   └── user.ts             # Type de usuário
└── styles/                  # 🎨 Estilos globais
    └── globals.css         # Tailwind e tokens de design
```

### 🔄 Fluxo de Dados

```
App.tsx (Estado Global)
    ↓
Header / Componentes de Página
    ↓
Componentes Filhos
    ↓
localStorage (Persistência)
```

---

## 2. Adicionar Nova Funcionalidade

### 📝 Exemplo: Adicionar "Desconto" em Comandas

#### Passo 1: Atualizar Types

**📂 Arquivo:** `types/index.ts`

```tsx
// Encontre a interface Comanda
export interface Comanda {
  id: string;
  number: number;
  customerName?: string;
  items: OrderItem[];
  createdAt: Date;
  status: "open" | "closed";
  discount?: number;  // ← ADICIONAR AQUI
}
```

**💾 Salve** (`Ctrl+S`)

---

#### Passo 2: Atualizar Estado no App.tsx

**📂 Arquivo:** `App.tsx`

Encontre a função `handleCreateComanda` e adicione:

```tsx
const handleCreateComanda = (
  comandaNumber: number,
  customerName?: string,
  discount?: number  // ← NOVO PARÂMETRO
) => {
  // ... código existente ...

  const newComanda: Comanda = {
    id: Date.now().toString(),
    number: comandaNumber,
    customerName,
    items: [],
    createdAt: new Date(),
    status: "open",
    discount: discount || 0,  // ← ADICIONAR AQUI
  };

  // ... resto do código ...
};
```

**💾 Salve**

---

#### Passo 3: Adicionar Input no Componente

**📂 Arquivo:** `components/NewComandaDialog.tsx`

```tsx
export function NewComandaDialog({ ... }) {
  const [comandaNumber, setComandaNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [discount, setDiscount] = useState("");  // ← NOVO STATE

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onCreateComanda(
      parseInt(comandaNumber), 
      customerName || undefined,
      parseFloat(discount) || 0  // ← PASSAR DESCONTO
    );
    
    // ... reset ...
    setDiscount("");  // ← LIMPAR
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* ... código existente ... */}
      
      <div className="space-y-4">
        {/* ... inputs existentes ... */}
        
        {/* ← NOVO CAMPO */}
        <div>
          <label htmlFor="discount" className="text-slate-700">
            Desconto (%)
          </label>
          <input
            id="discount"
            type="number"
            min="0"
            max="100"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            className="w-full mt-2 h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg"
            placeholder="0"
          />
        </div>
      </div>
      
      {/* ... botões ... */}
    </Dialog>
  );
}
```

**💾 Salve**

---

#### Passo 4: Exibir Desconto

**📂 Arquivo:** `components/ComandaDetail.tsx`

```tsx
export function ComandaDetail({ comanda, ... }) {
  if (!comanda) {
    return <div>...</div>;
  }

  const subtotal = comanda.items.reduce(...);
  const discount = (subtotal * (comanda.discount || 0)) / 100;  // ← CALCULAR
  const total = subtotal - discount;  // ← APLICAR DESCONTO

  return (
    <div className="...">
      {/* ... itens ... */}
      
      <div className="px-6 py-4 border-t">
        <div className="flex justify-between text-slate-600">
          <span>Subtotal</span>
          <span>R$ {subtotal.toFixed(2)}</span>
        </div>
        
        {/* ← MOSTRAR DESCONTO */}
        {comanda.discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Desconto ({comanda.discount}%)</span>
            <span>- R$ {discount.toFixed(2)}</span>
          </div>
        )}
        
        <div className="flex justify-between text-slate-900 font-medium">
          <span>Total</span>
          <span>R$ {total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
```

**💾 Salve**

---

#### Passo 5: Testar

1. Rode `npm run dev`
2. Crie uma nova comanda
3. Adicione um desconto (ex: 10%)
4. Verifique se o total está correto

**✅ Pronto! Funcionalidade adicionada!**

---

## 3. Modificar Funcionalidade Existente

### 📝 Exemplo: Mudar Cálculo de Total

#### Identificar Onde Está o Código

Use a busca do VS Code:

1. `Ctrl+Shift+F` (ou `Cmd+Shift+F`)
2. Procure por: `reduce`
3. Encontre onde calcula o total

#### Modificar

**📂 Arquivo:** `utils/calculations.ts`

```tsx
// ANTES
export function calculateTotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => 
    sum + item.product.price * item.quantity, 0
  );
}

// DEPOIS (com taxa de serviço)
export function calculateTotal(
  items: OrderItem[], 
  serviceFee: number = 0
): number {
  const subtotal = items.reduce((sum, item) => 
    sum + item.product.price * item.quantity, 0
  );
  
  return subtotal * (1 + serviceFee);
}
```

**💾 Salve**

#### Atualizar Quem Usa

Procure todos os lugares que chamam `calculateTotal`:

```tsx
// ANTES
const total = calculateTotal(items);

// DEPOIS
const total = calculateTotal(items, 0.10); // 10% de taxa
```

**💾 Salve tudo** (`Ctrl+K S`)

---

## 4. Adicionar Novo Componente

### 📝 Exemplo: Criar Componente "RelatórioVendas"

#### Passo 1: Criar Arquivo

**📂 Local:** `components/RelatórioVendas.tsx`

1. Clique com botão direito em `components/`
2. **"New File"**
3. Digite: `RelatorioVendas.tsx`
4. Pressione Enter

#### Passo 2: Estrutura Básica

```tsx
import { SaleRecord } from "../types";
import { formatCurrency } from "../utils/calculations";

interface RelatorioVendasProps {
  sales: SaleRecord[];
}

export function RelatorioVendas({ sales }: RelatorioVendasProps) {
  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);

  return (
    <div className="p-6 bg-white rounded-lg">
      <h2 className="text-slate-900 mb-4">Relatório de Vendas</h2>
      
      <div className="space-y-4">
        <div>
          <p className="text-slate-600">Total de Vendas</p>
          <p className="text-2xl text-slate-900">
            {formatCurrency(totalSales)}
          </p>
        </div>
        
        <div>
          <p className="text-slate-600">Número de Vendas</p>
          <p className="text-2xl text-slate-900">{sales.length}</p>
        </div>
      </div>
    </div>
  );
}
```

**💾 Salve**

#### Passo 3: Usar no App

**📂 Arquivo:** `App.tsx`

```tsx
// No topo, com outros imports
import { RelatorioVendas } from "./components/RelatorioVendas";

// ...

// Dentro do renderContent(), na seção de dashboard
case "dashboard":
  return (
    <div>
      <Dashboard {...props} />
      <RelatorioVendas sales={salesRecords} />  {/* ← NOVO */}
    </div>
  );
```

**💾 Salve**

---

## 5. Atualizar Dados Mockados

### 📝 Exemplo: Adicionar Novos Produtos

**📂 Arquivo:** `data/products.ts`

```tsx
export const INITIAL_PRODUCTS: Product[] = [
  // ... produtos existentes ...
  
  // ← ADICIONAR NOVOS
  {
    id: "13",
    name: "Caipirinha de Morango",
    price: 18.00,
    stock: 25,
    category: "bebidas",
    subcategory: "drink",
  },
  {
    id: "14",
    name: "Suco de Laranja",
    price: 7.00,
    stock: 40,
    category: "bebidas",
    subcategory: "juice",
  },
];
```

**💾 Salve**

**Como testar:**

1. Abra o app
2. Limpe o localStorage (F12 → Application → Storage → Clear)
3. Recarregue a página (F5)
4. Os novos produtos devem aparecer

---

## 6. Adicionar Nova Página/Aba

### 📝 Exemplo: Adicionar Aba "Relatórios"

#### Passo 1: Atualizar Type PageView

**📂 Arquivo:** `components/Header.tsx`

```tsx
export type PageView = 
  | "pdv" 
  | "dashboard" 
  | "hotel" 
  | "inventory" 
  | "transactions"
  | "relatorios";  // ← ADICIONAR
```

**💾 Salve**

#### Passo 2: Adicionar Botão no Header

**📂 Arquivo:** `components/Header.tsx`

Na seção dos botões de navegação:

```tsx
<div className="flex gap-2">
  {/* ... botões existentes ... */}
  
  {/* ← NOVO BOTÃO */}
  <button
    onClick={() => onViewChange("relatorios")}
    className={`px-4 py-2 rounded-lg transition-colors ${
      currentView === "relatorios"
        ? "bg-white text-slate-900"
        : "text-slate-600 hover:bg-white/50"
    }`}
  >
    Relatórios
  </button>
</div>
```

**💾 Salve**

#### Passo 3: Criar Componente da Página

**📂 Arquivo:** `components/Relatorios.tsx`

```tsx
export function Relatorios() {
  return (
    <div className="p-6">
      <h1 className="text-slate-900 mb-6">Relatórios</h1>
      
      <div className="bg-white rounded-lg p-6">
        <p className="text-slate-600">
          Página de relatórios em construção...
        </p>
      </div>
    </div>
  );
}
```

**💾 Salve**

#### Passo 4: Adicionar Rota no App.tsx

**📂 Arquivo:** `App.tsx`

```tsx
// Importar
import { Relatorios } from "./components/Relatorios";

// ...

// Dentro de renderContent()
const renderContent = () => {
  switch (currentView) {
    // ... casos existentes ...
    
    // ← NOVO CASO
    case "relatorios":
      return <Relatorios />;
    
    case "pdv":
    default:
      return /* PDV */;
  }
};
```

**💾 Salve**

#### Passo 5: Testar

1. Rode o app
2. Clique no botão "Relatórios"
3. A nova página deve aparecer

**✅ Nova aba adicionada!**

---

## 7. Modificar Estilos

### 🎨 Mudando Cores do Sistema

**📂 Arquivo:** `styles/globals.css`

#### Exemplo: Mudar Cor Primária

```css
:root {
  /* ... outras variáveis ... */
  
  /* ANTES */
  --primary: #030213;
  
  /* DEPOIS (azul) */
  --primary: #2563eb;
}
```

**💾 Salve**

**Resultado:** Todos os elementos que usam `bg-primary` ficam azuis!

#### Exemplo: Mudar Fonte Base

```css
:root {
  /* ANTES */
  --font-size: 16px;
  
  /* DEPOIS (maior) */
  --font-size: 18px;
}
```

**💾 Salve**

**Resultado:** Todo o app fica com textos maiores!

---

### 🎨 Mudando Estilos de Componente Específico

**📂 Arquivo:** `components/ComandaSidebar.tsx`

```tsx
// ANTES
<div className="bg-white p-4">

// DEPOIS
<div className="bg-slate-50 p-6 rounded-lg shadow-sm">
```

**Classes Tailwind comuns:**

- **Padding:** `p-4`, `px-6`, `py-2`
- **Margin:** `m-4`, `mx-auto`, `my-2`
- **Cores:** `bg-slate-50`, `text-slate-900`
- **Bordas:** `border`, `border-slate-200`, `rounded-lg`
- **Sombras:** `shadow-sm`, `shadow-md`, `shadow-lg`
- **Flexbox:** `flex`, `items-center`, `justify-between`
- **Grid:** `grid`, `grid-cols-3`, `gap-4`

**💾 Salve e veja o resultado!**

---

## 8. Troubleshooting

### ❌ Erro: "Cannot find module"

**Causa:** Import incorreto ou arquivo não existe

**Solução:**

1. Verifique se o caminho do import está correto
2. Verifique se o arquivo existe
3. Verifique se o nome do arquivo está correto (case-sensitive)

```tsx
// ❌ ERRADO
import { Header } from "./Components/Header";  // C maiúsculo

// ✅ CORRETO
import { Header } from "./components/Header";  // c minúsculo
```

---

### ❌ Erro: "Property 'xxx' does not exist"

**Causa:** TypeScript não reconhece a propriedade

**Solução:** Atualizar o type

**📂 Arquivo:** `types/index.ts`

```tsx
export interface Comanda {
  // ... propriedades existentes ...
  novaPropriedade?: string;  // ← ADICIONAR
}
```

---

### ❌ Componente não re-renderiza

**Causa:** Mutação direta do estado

**Solução:**

```tsx
// ❌ ERRADO (muta diretamente)
comandas[0].items.push(newItem);
setComandas(comandas);

// ✅ CORRETO (cria novo array)
setComandas(comandas.map(c => 
  c.id === selectedId 
    ? { ...c, items: [...c.items, newItem] }
    : c
));
```

---

### ❌ localStorage não persiste

**Causa:** Chave diferente ou storage limpo

**Solução:** Verifique a chave

```tsx
// Todas as chaves do projeto:
// "barconnect_comandas"
// "barconnect_transactions"
// "barconnect_sales"
// "barconnect_products"

// Verificar no console:
console.log(localStorage.getItem("barconnect_comandas"));
```

---

### ❌ Estilos não aplicam

**Causa:** Especificidade CSS ou Tailwind não compilou

**Solução:**

1. **Salve o arquivo** (`Ctrl+S`)
2. **Reinicie o servidor:** `Ctrl+C` e `npm run dev`
3. **Limpe o cache:** `Ctrl+Shift+R` (hard reload)

---

## 📋 Checklist de Manutenção

Antes de fazer qualquer modificação:

- [ ] Entendo qual arquivo preciso modificar
- [ ] Li o código existente
- [ ] Tenho backup (Git commit)
- [ ] Testei localmente antes

Após fazer modificações:

- [ ] Salvei todos os arquivos (`Ctrl+K S`)
- [ ] Não há erros no VS Code (sublinhados vermelhos)
- [ ] Testei a funcionalidade
- [ ] Documentei mudança importante

---

## 🎯 Dicas Importantes

### 1. Sempre Salve Antes de Testar

```
Modificou código → Salvar (Ctrl+S) → Testar (navegador)
```

### 2. Use Git para Backup

```bash
git add .
git commit -m "feat: adiciona desconto em comandas"
```

### 3. Teste em Pequenos Passos

Não faça 10 mudanças de uma vez. Teste cada mudança individualmente.

### 4. Consulte a Documentação

- [React Docs](https://react.dev)
- [Tailwind Docs](https://tailwindcss.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

---

## 📚 Próximos Passos

Agora que você sabe manter o projeto, pode:

1. ✅ Adicionar novas funcionalidades
2. ✅ Customizar visual
3. ✅ Adicionar páginas
4. ✅ Modificar lógica de negócio
5. ✅ Integrar com backend (Next.js + Supabase)

---

**Última atualização:** Outubro 2025  
**Versão:** 1.0  
**Nível de detalhamento:** ⭐⭐⭐⭐⭐ Máximo
