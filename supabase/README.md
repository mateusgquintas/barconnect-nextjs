# 📊 Supabase - Estrutura do Banco de Dados BarConnect

> AVISO IMPORTANTE: Este documento descreve a análise inicial. A fonte única de verdade agora é o arquivo `supabase/schema-unificado.sql` com guia `supabase/COMO-APLICAR.md` e políticas `supabase/rls-policies*.sql`. Para autenticação e RLS de longo prazo, consulte `supabase/AUTH-ARQUITETURA.md`.

> **Data da Análise:** 31 de Outubro de 2025  
> **Objetivo:** Organizar e consolidar o schema do banco de dados de forma eficiente

---

## 🎯 **SITUAÇÃO ATUAL**

Após análise detalhada do código e dos schemas existentes, identificamos:

### ✅ **O que ESTÁ sendo usado ativamente:**

#### **Sistema PDV (Comandas & Vendas) - 100% Funcional**
```
✅ users                  → Autenticação (admin/operador)
✅ products               → Catálogo de produtos
✅ comandas               → Comandas abertas/fechadas
✅ comanda_items          → Itens das comandas
✅ sales                  → Vendas finalizadas
✅ sale_items             → Itens das vendas
✅ transactions           → Transações financeiras
✅ stock_movements        → Movimentação de estoque
✅ sales_detailed (view)  → Relatórios
✅ products_critical_stock (view) → Alertas de estoque
```

**Arquivos que usam:** 
- `hooks/useComandasDB.ts`
- `hooks/useProductsDB.ts`
- `hooks/useSalesDB.ts`
- `hooks/useTransactionsDB.ts`
- `components/*` (todos os componentes PDV)

---

#### **Sistema Hotel/Romarias - PARCIALMENTE Funcional**

##### **USADO ATIVAMENTE:**
```
✅ pilgrimages            → Romarias/grupos
✅ rooms                  → Quartos (com dados de hóspedes misturados)
```

**Arquivos que usam:**
- `hooks/usePilgrimagesDB.ts` → CRUD de romarias
- `hooks/useRoomsDB.ts` → CRUD de quartos
- `components/HotelPilgrimages.tsx` → Interface de romarias
- `components/Hotel.tsx` → Interface de quartos
- `lib/agendaService.ts` → Reservas e agenda

##### **NÃO ESTÁ SENDO USADO:**
```
❌ hotel_rooms            → Criado mas NÃO usado no código
❌ hotel_guests           → Criado mas NÃO usado no código
❌ hotel_reservations     → Criado mas NÃO usado no código
❌ hotel_room_charges     → Criado mas NÃO usado no código
❌ guests                 → Apenas usado em clean-transactional-data.js
❌ room_reservations      → Usado no agendaService.ts mas não tem CRUD
```

---

## 🚨 **PROBLEMAS IDENTIFICADOS**

### **1. Duplicação de Tabelas (Não Usadas)**

O arquivo `schema_hotel.sql` criou tabelas que **nunca foram integradas** no código:
- `hotel_rooms`, `hotel_guests`, `hotel_reservations`, `hotel_room_charges`

Enquanto isso, o código usa:
- `rooms`, `guests`, `room_reservations` (do `schema_hotel_romarias.sql`)

**Resultado:** Existem **2 estruturas paralelas** no banco, mas apenas **1 é usada**.

---

### **2. Tabela `rooms` com Design Problemático**

A tabela `rooms` está **desnormalizada** (mistura dados de quartos com dados de hóspedes):

```typescript
// hooks/useRoomsDB.ts - Interface Room
export interface Room {
  id: string;
  number: number;
  type?: string;
  status?: string;
  
  // ❌ PROBLEMA: Dados de hóspede misturados com dados de quarto
  pilgrimage_id?: string;    // Romaria associada
  guest_name?: string;        // Nome do hóspede
  guest_cpf?: string;         // CPF do hóspede
  guest_phone?: string;       // Telefone
  guest_email?: string;       // Email
  check_in_date?: string;     // Datas
  check_out_date?: string;
  observations?: string;
}
```

**Consequências:**
- ✅ Um quarto pode ter **1 romaria** (pilgrimage_id)
- ✅ Um quarto pode ter **1 hóspede** (guest_name, guest_cpf, etc.)
- ❌ **Não permite** múltiplos quartos para uma romaria
- ❌ **Não permite** múltiplos hóspedes em um quarto
- ❌ **Não tem** histórico de check-ins anteriores

---

### **3. Tabela `room_reservations` Existe mas Não Tem Interface**

```typescript
// lib/agendaService.ts usa room_reservations:
const { data: reservations } = await supabase
  .from('room_reservations')
  .select('room_id, check_in_date, check_out_date')
```

**Mas:**
- ❌ Não existe `useReservationsDB.ts`
- ❌ Não existe componente de gestão de reservas
- ❌ Não aparece em nenhuma interface do sistema

---

## 💡 **ANÁLISE: O QUE REALMENTE PRECISA SER FEITO?**

### **Opção A: Manter Como Está (Mais Seguro)**

**SE o sistema está funcionando bem:**
1. **NÃO mexer** nas tabelas do PDV (comandas, products, sales, etc.)
2. **NÃO mexer** nas tabelas usadas (pilgrimages, rooms)
3. **APENAS documentar** o que existe
4. **LIMPAR** apenas as tabelas não usadas: `hotel_*` (se não tiverem dados)

**Vantagens:**
- ✅ Zero risco de quebrar algo que funciona
- ✅ Rápido de fazer
- ✅ Mantém histórico

**Desvantagens:**
- ❌ Estrutura continua confusa
- ❌ Tabelas duplicadas no banco
- ❌ Limitações de design permanecem

---

### **Opção B: Consolidação Gradual (Recomendado)**

**Melhorar sem quebrar:**

#### **Fase 1: Limpeza de Tabelas Não Usadas**
```sql
-- APENAS se essas tabelas estiverem VAZIAS
DROP TABLE IF EXISTS hotel_room_charges CASCADE;
DROP TABLE IF EXISTS hotel_reservations CASCADE;
DROP TABLE IF EXISTS hotel_guests CASCADE;
DROP TABLE IF EXISTS hotel_rooms CASCADE;
```

#### **Fase 2: Documentar o Que Existe**
- Criar `supabase/schema-atual.sql` com estrutura real
- Criar `supabase/dados-exemplo.sql` com inserts
- Criar `supabase/migrations/` para futuras mudanças

#### **Fase 3: Melhorias Futuras (Opcional)**
- Criar tabela de junção `pilgrimage_rooms` (apenas se necessário)
- Migrar dados de `rooms.guest_*` para tabela separada (apenas se necessário)
- Criar interface de reservas (apenas se solicitado)

---

### **Opção C: Migração Completa (Mais Arriscado)**

**Reestruturar tudo:**
- Criar nova estrutura normalizada
- Migrar todos os dados
- Atualizar todo o código

**⚠️ NÃO RECOMENDADO porque:**
- Código já funciona
- Risco alto de bugs
- Tempo de desenvolvimento grande
- Usuário já está usando o sistema

---

## 🎯 **RECOMENDAÇÃO FINAL**

### **Plano de Ação Eficiente:**

#### **1. ANÁLISE INICIAL (10 min)**
```bash
# Verificar quais tabelas têm dados
```
- Conectar no Supabase
- Rodar `SELECT COUNT(*) FROM hotel_rooms;`
- Rodar `SELECT COUNT(*) FROM hotel_guests;`
- Rodar `SELECT COUNT(*) FROM hotel_reservations;`

**SE todas estiverem VAZIAS (0 registros):**
→ Seguir para Passo 2

**SE alguma tiver dados:**
→ PARAR e analisar o que tem antes de deletar

---

#### **2. LIMPEZA SEGURA (5 min)**
```sql
-- APENAS se estiverem VAZIAS
DROP TABLE IF EXISTS hotel_room_charges CASCADE;
DROP TABLE IF EXISTS hotel_reservations CASCADE;
DROP TABLE IF EXISTS hotel_guests CASCADE;
DROP TABLE IF EXISTS hotel_rooms CASCADE;
```

---

#### **3. DOCUMENTAÇÃO (20 min)**
- ✅ Criar `supabase/schema-pdv.sql` → Sistema PDV completo
- ✅ Criar `supabase/schema-hotel.sql` → Sistema Hotel/Romarias atual
- ✅ Criar `supabase/README.md` → Este arquivo
- ✅ Criar `supabase/GUIA-USO.md` → Como usar cada tabela

---

#### **4. MELHORIAS FUTURAS (Apenas se Necessário)**

**ANTES de fazer qualquer mudança:**
1. ❓ O sistema está com problemas?
2. ❓ Usuários pediram novas funcionalidades?
3. ❓ Há bugs relacionados à estrutura?

**SE SIM:**
→ Planejar migração específica para resolver o problema

**SE NÃO:**
→ **DEIXAR COMO ESTÁ** e focar em funcionalidades novas

---

## 📁 **ESTRUTURA PROPOSTA DESTA PASTA**

```
supabase/
├── README.md                    → Este arquivo (visão geral)
├── GUIA-USO.md                  → Como usar cada tabela
├── schema-pdv.sql               → Sistema PDV (comandas, vendas)
├── schema-hotel.sql             → Sistema Hotel (romarias, quartos)
├── dados-exemplo.sql            → Inserts para testes
├── queries-uteis.sql            → Queries prontas para relatórios
└── migrations/                  → Futuras migrações (se necessário)
    └── .gitkeep
```

---

## ❓ **PRÓXIMOS PASSOS**

**Antes de continuarmos, preciso que você me diga:**

1. **O sistema está funcionando bem?** Há algum bug ou problema?
2. **Você quer apenas organizar** ou quer **melhorar a estrutura**?
3. **As tabelas `hotel_*` têm dados?** (vamos verificar juntos)
4. **Há alguma funcionalidade faltando?** (ex: histórico de check-ins, reservas futuras)

**Com essas respostas, vou criar um plano específico e eficiente para o seu caso.**

---

## � **ARQUIVOS NESTA PASTA**

```
supabase/
├── README.md                           → Este arquivo (análise e visão geral)
├── GUIA-USO.md                         → Como usar cada tabela, queries úteis
├── PLANO-MIGRACAO.md                   → Plano completo de migração em 8 fases
├── verificar-tabelas.sql               → Script para diagnóstico do banco
├── queries-uteis.sql                   → Queries prontas para copiar/colar
└── migrations/
    ├── 000-cleanup-unused-tables.sql   → Limpeza de tabelas não usadas
    └── 001-hotel-restructure.sql       → Reestruturação do módulo Hotel
```

---

## 🚀 **EXECUÇÃO RÁPIDA**

### **Passo 1: Diagnóstico** (5 min)
```bash
1. Abrir Supabase SQL Editor
2. Executar: verificar-tabelas.sql
3. Anotar resultados
```

### **Passo 2: Limpeza** (SE tabelas hotel_* estiverem vazias) (10 min)
```bash
1. Criar backup manual no Supabase
2. Executar: migrations/000-cleanup-unused-tables.sql
3. Verificar logs
```

### **Passo 3: Migração** (30 min)
```bash
1. Confirmar backup
2. Executar: migrations/001-hotel-restructure.sql
3. Testar aplicação
```

### **Passo 4: Desenvolvimento** (2-3 horas)
```bash
1. Criar hooks: useRoomsMasterDB.ts, usePilgrimageRoomsDB.ts
2. Criar componentes: RoomsMasterManager.tsx, PilgrimageRoomAllocation.tsx
3. Testar funcionalidades
```

---

## �📞 **CONTATO**

Se tiver dúvidas sobre qualquer parte desta análise, me avise que explico com mais detalhes.
