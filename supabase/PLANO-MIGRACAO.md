# 🏗️ PLANO DE MIGRAÇÃO E ORGANIZAÇÃO - BarConnect

> **Data:** 31 de Outubro de 2025  
> **Objetivo:** Consolidar e organizar o banco de dados para sustentabilidade de longo prazo  
> **Abordagem:** Incremental e segura, sem quebrar funcionalidades existentes

---

## 📋 FASES DA MIGRAÇÃO

### **FASE 1: DIAGNÓSTICO E BACKUP** ⏱️ 15 minutos

#### 1.1 - Executar Verificação
```bash
1. Abrir Supabase SQL Editor
2. Executar: supabase/verificar-tabelas.sql
3. Anotar resultados (quais tabelas existem e quantos registros)
```

#### 1.2 - Backup Completo
```bash
# No Supabase Dashboard:
1. Settings > Database > Backups
2. Create manual backup
3. Download backup (opcional, para segurança local)
```

#### 1.3 - Exportar Dados de Produção
```sql
-- Se houver dados importantes, exportar para CSV
COPY (SELECT * FROM rooms) TO '/tmp/rooms_backup.csv' CSV HEADER;
COPY (SELECT * FROM pilgrimages) TO '/tmp/pilgrimages_backup.csv' CSV HEADER;
```

---

### **FASE 2: LIMPEZA DE TABELAS NÃO UTILIZADAS** ⏱️ 10 minutos

**Objetivo:** Remover apenas tabelas que comprovadamente não são usadas no código

#### 2.1 - Tabelas para Remoção (SE estiverem vazias)
```sql
-- IMPORTANTE: Executar APENAS se a verificação mostrar 0 registros

-- Verificar primeiro
SELECT COUNT(*) FROM hotel_rooms;
SELECT COUNT(*) FROM hotel_guests;
SELECT COUNT(*) FROM hotel_reservations;
SELECT COUNT(*) FROM hotel_room_charges;

-- Se todos retornarem 0, então executar:
DROP TABLE IF EXISTS hotel_room_charges CASCADE;
DROP TABLE IF EXISTS hotel_reservations CASCADE;
DROP TABLE IF EXISTS hotel_guests CASCADE;
DROP TABLE IF EXISTS hotel_rooms CASCADE;
```

#### 2.2 - Tabela GUESTS (Análise Especial)
```sql
-- Verificar se está sendo usada
SELECT COUNT(*) FROM guests;

-- Se estiver vazia E não for usada em room_reservations:
SELECT COUNT(*) FROM room_reservations WHERE guest_id IS NOT NULL;

-- Se ambas estiverem zeradas, pode remover:
-- DROP TABLE IF EXISTS guests CASCADE;
```

---

### **FASE 3: CONSOLIDAÇÃO DA ESTRUTURA HOTEL** ⏱️ 30 minutos

**Objetivo:** Criar estrutura normalizada e escalável para o módulo Hotel/Romarias

#### 3.1 - Nova Estrutura Proposta

```
┌─────────────────────────────────────────────────────────────┐
│                    ESTRUTURA MELHORADA                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐                                           │
│  │ pilgrimages  │  ✅ Mantém como está                      │
│  │──────────────│     (nome, datas, pessoas, ônibus)        │
│  │ • id         │                                           │
│  │ • name       │                                           │
│  │ • dates      │                                           │
│  │ • people     │                                           │
│  └───────┬──────┘                                           │
│          │                                                   │
│          │ ┌─────────────────┐                              │
│          └─│ pilgrimage_rooms│ ✨ NOVA TABELA               │
│            │─────────────────│    (liga romaria a quartos)  │
│            │ • id            │                              │
│            │ • pilgrimage_id │ → FK pilgrimages(id)         │
│            │ • room_number   │ → Number do quarto           │
│            │ • guest_name    │                              │
│            │ • guest_document│                              │
│            │ • guest_phone   │                              │
│            │ • check_in      │                              │
│            │ • check_out     │                              │
│            │ • status        │                              │
│            │ • notes         │                              │
│            └─────────────────┘                              │
│                                                              │
│  ┌──────────────┐                                           │
│  │ rooms_master │  ✨ NOVA TABELA                           │
│  │──────────────│     (catálogo de quartos)                │
│  │ • number     │  → PK (101, 102, etc)                    │
│  │ • type       │     (single, double, suite)              │
│  │ • capacity   │     (1, 2, 3 pessoas)                    │
│  │ • daily_rate │                                           │
│  │ • floor      │                                           │
│  │ • active     │                                           │
│  └──────────────┘                                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### 3.2 - Vantagens da Nova Estrutura

| Recurso | Antes | Depois |
|---------|-------|--------|
| Múltiplos quartos por romaria | ❌ Não | ✅ Sim |
| Múltiplos hóspedes por quarto | ❌ Não | ✅ Sim (múltiplos registros) |
| Histórico de ocupação | ❌ Não | ✅ Sim (com status) |
| Catálogo de quartos limpo | ❌ Misturado | ✅ Separado |
| Consultas "quais quartos da romaria X?" | ❌ Difícil | ✅ Simples JOIN |
| Consultas "qual romaria no quarto Y?" | ❌ Difícil | ✅ Simples WHERE |

---

### **FASE 4: MIGRAÇÃO DE DADOS** ⏱️ 20 minutos

#### 4.1 - Criar Novas Tabelas
```sql
-- Executar: supabase/migration-001-hotel-restructure.sql
```

#### 4.2 - Migrar Dados da Tabela ROOMS Antiga
```sql
-- 1. Extrair catálogo de quartos únicos
INSERT INTO rooms_master (number, type, description)
SELECT DISTINCT 
  number,
  COALESCE(type, 'standard') as type,
  description
FROM rooms
WHERE number IS NOT NULL;

-- 2. Migrar ocupações atuais para pilgrimage_rooms
INSERT INTO pilgrimage_rooms (
  pilgrimage_id, room_number, guest_name, guest_document,
  guest_phone, guest_email, check_in, check_out, status, notes
)
SELECT 
  pilgrimage_id,
  number,
  guest_name,
  guest_cpf,
  guest_phone,
  guest_email,
  check_in_date,
  check_out_date,
  CASE 
    WHEN status = 'occupied' THEN 'checked_in'
    WHEN status = 'reserved' THEN 'reserved'
    ELSE 'available'
  END,
  observations
FROM rooms
WHERE pilgrimage_id IS NOT NULL;
```

#### 4.3 - Criar View de Compatibilidade
```sql
-- Manter código antigo funcionando durante transição
CREATE OR REPLACE VIEW rooms AS
SELECT 
  rm.number,
  rm.type,
  rm.description,
  CASE 
    WHEN pr.id IS NOT NULL THEN 
      CASE pr.status
        WHEN 'checked_in' THEN 'occupied'
        WHEN 'reserved' THEN 'reserved'
        ELSE 'available'
      END
    ELSE 'available'
  END as status,
  pr.pilgrimage_id,
  pr.guest_name,
  pr.guest_document as guest_cpf,
  pr.guest_phone,
  pr.guest_email,
  pr.check_in as check_in_date,
  pr.check_out as check_out_date,
  pr.notes as observations,
  rm.created_at
FROM rooms_master rm
LEFT JOIN pilgrimage_rooms pr ON rm.number = pr.room_number
  AND pr.status IN ('reserved', 'checked_in');
```

---

### **FASE 5: ATUALIZAÇÃO DO CÓDIGO** ⏱️ 1-2 horas

#### 5.1 - Criar Novo Hook: `useRoomsMasterDB.ts`
```typescript
// Gerencia catálogo de quartos (não ocupação)
export function useRoomsMasterDB() {
  // CRUD de quartos (apenas estrutura física)
  const addRoom = async (room: RoomMaster) => { }
  const updateRoom = async (number: number, updates) => { }
  const deleteRoom = async (number: number) => { }
}
```

#### 5.2 - Criar Novo Hook: `usePilgrimageRoomsDB.ts`
```typescript
// Gerencia alocação de quartos para romarias
export function usePilgrimageRoomsDB() {
  // Alocar quarto para romaria
  const allocateRoom = async (allocation: PilgrimageRoom) => { }
  
  // Listar quartos de uma romaria
  const getRoomsByPilgrimage = async (pilgrimageId: string) => { }
  
  // Check-in / Check-out
  const checkIn = async (id: string) => { }
  const checkOut = async (id: string) => { }
}
```

#### 5.3 - Manter Hook Antigo por Compatibilidade
```typescript
// hooks/useRoomsDB.ts
// Mantém API antiga, mas usa view de compatibilidade
// Pode ser descontinuado em versão futura
```

---

### **FASE 6: NOVOS COMPONENTES** ⏱️ 2-3 horas

#### 6.1 - Componente: `RoomsMasterManager.tsx`
- Interface para cadastrar quartos (estrutura física)
- CRUD simples: número, tipo, capacidade, diária

#### 6.2 - Componente: `PilgrimageRoomAllocation.tsx`
- Alocar múltiplos quartos para uma romaria
- Drag & drop de quartos disponíveis
- Formulário de hóspede por quarto

#### 6.3 - Melhorar: `HotelPilgrimages.tsx`
- Adicionar aba "Quartos Alocados"
- Mostrar lista de quartos da romaria
- Botões de check-in/check-out

---

### **FASE 7: TESTES E VALIDAÇÃO** ⏱️ 1 hora

#### 7.1 - Testes Manuais
```
✅ Criar nova romaria
✅ Alocar 3 quartos para romaria
✅ Fazer check-in de 1 quarto
✅ Fazer check-out de 1 quarto
✅ Editar dados de hóspede
✅ Remover alocação de quarto
✅ Consultar histórico de ocupação
```

#### 7.2 - Testes de Integridade
```sql
-- Verificar se todos os pilgrimage_id são válidos
SELECT * FROM pilgrimage_rooms pr
WHERE NOT EXISTS (
  SELECT 1 FROM pilgrimages p WHERE p.id = pr.pilgrimage_id
);

-- Verificar se todos os room_number são válidos
SELECT * FROM pilgrimage_rooms pr
WHERE NOT EXISTS (
  SELECT 1 FROM rooms_master rm WHERE rm.number = pr.room_number
);
```

---

### **FASE 8: LIMPEZA FINAL** ⏱️ 30 minutos

#### 8.1 - Após 1 Semana de Funcionamento Estável
```sql
-- Remover tabela antiga (se a view funciona)
DROP TABLE IF EXISTS rooms_old CASCADE;

-- Remover view de compatibilidade (se hooks novos funcionam)
DROP VIEW IF EXISTS rooms;
```

#### 8.2 - Documentação Final
```
✅ Atualizar README.md
✅ Documentar novos hooks
✅ Criar guia de uso para novos componentes
✅ Atualizar diagramas
```

---

## 🎯 CRONOGRAMA SUGERIDO

| Fase | Duração | Quando Executar |
|------|---------|-----------------|
| 1 - Diagnóstico | 15 min | Agora |
| 2 - Limpeza | 10 min | Hoje |
| 3 - Consolidação | 30 min | Hoje |
| 4 - Migração Dados | 20 min | Hoje |
| 5 - Código | 1-2h | Amanhã |
| 6 - Componentes | 2-3h | Amanhã/Depois |
| 7 - Testes | 1h | Após Fase 6 |
| 8 - Limpeza | 30 min | 1 semana depois |

**Total:** ~6-8 horas distribuídas em 2-3 dias

---

## 📊 RESULTADOS ESPERADOS

### Antes
```
❌ Tabelas duplicadas (hotel_* não usadas)
❌ Estrutura desnormalizada (rooms com guest_*)
❌ Limitação: 1 quarto por romaria
❌ Sem histórico de ocupação
❌ Consultas complexas
```

### Depois
```
✅ Estrutura normalizada e limpa
✅ Múltiplos quartos por romaria
✅ Histórico completo de ocupações
✅ Consultas simples e rápidas
✅ Código organizado em hooks específicos
✅ Componentes especializados
✅ Escalável para futuro
```

---

## ⚠️ RISCOS E MITIGAÇÕES

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Perda de dados | Baixa | Alto | Backup antes de cada fase |
| Código quebrado | Média | Médio | View de compatibilidade |
| Downtime | Baixa | Médio | Migração fora do horário |
| Bugs novos | Média | Baixo | Testes extensivos |

---

## 🚀 PRÓXIMO PASSO

**Executar FASE 1 agora:**
1. Abrir Supabase SQL Editor
2. Executar `supabase/verificar-tabelas.sql`
3. Compartilhar resultados aqui
4. Eu analiso e criamos os scripts de migração específicos

**Pronto para começar?** 🎯
