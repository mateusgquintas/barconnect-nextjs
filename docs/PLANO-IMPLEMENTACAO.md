# 🎯 PLANO DE IMPLEMENTAÇÃO - AGENDA INTEGRADA

## 📋 CHECKLIST INCREMENTAL (14 Etapas Seguras)

### 🔍 FASE 1: DIAGNÓSTICO (Sem tocar no código)

#### ✅ 1. Análise do schema atual
**Status**: ✅ CONCLUÍDO
- [x] Revisei `schema_hotel_romarias.sql`
- [x] Identifiquei tabelas existentes:
  - `pilgrimages` (romarias)
  - `rooms` (quartos com pilgrimage_id)
  - `guests` (hóspedes opcionais)
  - `room_reservations` (reservas detalhadas) ⭐ **USAR ESTA**
- [x] Confirmei conflito com `create-agenda-tables.sql`

#### 🔄 2. Validar schema no Supabase
**Status**: ⏳ AGUARDANDO SUA VALIDAÇÃO

**Ação necessária (VOCÊ executa no Supabase SQL Editor):**
```sql
-- Copie e cole este script no Supabase SQL Editor:
-- scripts/validate-schema.sql (acabei de criar)
```

**Resultados esperados:**
- ✅ Se retornar 4 tabelas → Schema OK, seguimos para Fase 2
- ❌ Se faltar alguma tabela → Execute `schema_hotel_romarias.sql` primeiro
- ⚠️ Se houver dados → Faremos migração cuidadosa (sem deletar)

---

### 🗑️ FASE 2: LIMPEZA (Remover código conflitante)

#### 3. Remover código conflitante
**O que vou fazer:**
- [ ] Deletar `scripts/create-agenda-tables.sql` ❌ (duplica `rooms`)
- [ ] Reverter mudanças recentes em `lib/agendaService.ts` que tentam usar `bookings`
- [ ] Manter `useRoomsDB.ts` e `usePilgrimagesDB.ts` intactos
- [ ] **GARANTIR**: Hotel.tsx e HotelPilgrimages.tsx continuam funcionando

**Commits:** Pequeno, fácil de reverter se der problema

---

### 🔧 FASE 3: NOVA FUNDAÇÃO (Criar base segura)

#### 4. Criar hook useAgendaDB (seguro)
**O que vou criar:**
```typescript
// hooks/useAgendaDB.ts (NOVO, não mexe nos existentes)
export function useAgendaDB() {
  // Usa room_reservations (NÃO bookings)
  // Integra com rooms e pilgrimages existentes
  return {
    reservations,          // room_reservations
    loading,
    error,
    fetchReservations,     // Por range de datas
    createReservation,     // Individual ou romaria
    updateReservation,
    cancelReservation,
  };
}
```

**Teste:** Hook isolado, não afeta componentes existentes

#### 5. Implementar cálculo de ocupação
**O que vou adicionar:**
```typescript
// lib/agendaService.ts (refatorado)
export async function getOccupancyByDay(date: Date): Promise<{
  total: number;
  occupied: number;
  percentage: number;
  byPilgrimage: Record<string, number>;
}> {
  // 1. Buscar todas as room_reservations ativas neste dia
  // 2. Contar rooms únicos ocupados
  // 3. Calcular % vs total de rooms
  // 4. Agrupar por pilgrimage_id (romaria)
}
```

**Teste:** Função pura, fácil de testar isoladamente

---

### 🎨 FASE 4: COMPONENTES VISUAIS (Sem quebrar nada)

#### 6. Criar barra de ocupação visual
**O que vou criar:**
```typescript
// components/agenda/DayOccupancyBar.tsx (NOVO)
export function DayOccupancyBar({ 
  percentage,
  showLabel = true 
}: Props) {
  const color = 
    percentage <= 40 ? 'bg-green-500' :
    percentage <= 80 ? 'bg-yellow-500' :
    'bg-red-500';
  
  return (
    <div className="w-full">
      <div className="h-1 bg-gray-200 rounded-full">
        <div className={`h-full ${color}`} style={{width: `${percentage}%`}} />
      </div>
      {showLabel && <span className="text-[9px]">{percentage}%</span>}
    </div>
  );
}
```

**Teste:** Componente isolado, pode testar visualmente no Storybook ou página de teste

#### 7. Integrar barra no calendário
**O que vou modificar:**
```typescript
// components/agenda/MonthlyCalendar.tsx
// Adicionar DayOccupancyBar abaixo do número do dia
// Manter renderDayBadge existente para compatibilidade
```

**Teste:** Calendário ainda funciona, apenas com barra extra

---

### 🔄 FASE 5: MIGRAÇÃO DA AGENDA (Incremental)

#### 8. Migrar AgendaPage para schema correto
**O que vou modificar:**
```typescript
// app/hotel/agenda/page.tsx
// ANTES: usa createBooking com 'bookings' table
// DEPOIS: usa createReservation com 'room_reservations' table
// Mantém mesma UI, apenas muda backend
```

**Teste:** Validar que página carrega sem erro

#### 9. Criar sidebar de detalhes do dia
**O que vou criar:**
```typescript
// components/agenda/DaySidebar.tsx (NOVO)
// Abre ao clicar no dia
// Mostra:
// - Romarias ativas
// - Reservas individuais
// - % ocupação
// - Botão "+ Nova Reserva"
```

**Teste:** Componente pode ser testado isoladamente

---

### 🎯 FASE 6: FEATURES AVANÇADAS

#### 10. Dialog de reserva integrado
**Modificar:** `NewBookingDialog.tsx`
- [ ] Radio: Individual vs Romaria
- [ ] Se individual: guest fields + 1 room
- [ ] Se romaria: select pilgrimage + multi-select rooms
- [ ] Validação de check-in/check-out

#### 11. Implementar filtros integrados
**Adicionar na:** `AgendaPage`
- [ ] Filtro por romaria (usa usePilgrimagesDB)
- [ ] Filtro por status (reserved/checked_in/checked_out)
- [ ] Range de datas

---

### ✅ FASE 7: VALIDAÇÃO FINAL

#### 12. Validar todos os testes
```bash
npm run typecheck
npm test
npm run build
```

**Checklist:**
- [ ] Hotel.tsx funciona
- [ ] HotelPilgrimages.tsx funciona
- [ ] AgendaPage funciona
- [ ] Nenhum teste quebrou

#### 13. Teste de integração completo
**Fluxo manual:**
1. Criar romaria em HotelPilgrimages
2. Ir para Agenda
3. Criar reserva para essa romaria
4. Ver % ocupação atualizar
5. Ver badge de reservas
6. Click no dia → ver detalhes

#### 14. Commit seguro e incremental
**Estratégia:**
- 1 commit por fase
- Mensagem clara
- Fácil de reverter

---

## 🚨 RECOMENDAÇÕES IMPORTANTES

### ✅ O QUE FAZER AGORA:

1. **VOCÊ executa** `scripts/validate-schema.sql` no Supabase
2. **Me passa** o resultado (print ou texto)
3. **Eu começo** Fase 2 (remover conflitante) se schema estiver OK
4. **Vamos devagar**: 1-2 fases por vez, validando sempre

### ❌ O QUE NÃO FAZER:

- ❌ NÃO executar `create-agenda-tables.sql` (eu vou deletar ele)
- ❌ NÃO deletar dados existentes de rooms/pilgrimages
- ❌ NÃO fazer tudo de uma vez (risco de quebrar)

### 🎯 PRIORIDADE:

**Mínimo Viável (MVP):**
- Fases 1-8: Agenda funcional com schema correto + % ocupação
- Sem quebrar Hotel.tsx e HotelPilgrimages.tsx

**Melhorias (depois do MVP):**
- Fases 9-11: Sidebar, filtros, dialog avançado

---

## 📊 ESTRUTURA FINAL

```
app/hotel/agenda/
├── page.tsx                    # Usa room_reservations
└── components/
    ├── MonthlyCalendar.tsx     # Com DayOccupancyBar
    ├── DayOccupancyBar.tsx     # Barra de %
    ├── DaySidebar.tsx          # Detalhes do dia
    └── NewReservationDialog.tsx # Individual/Romaria

hooks/
├── useRoomsDB.ts              # MANTER (intacto)
├── usePilgrimagesDB.ts        # MANTER (intacto)
└── useAgendaDB.ts             # NOVO (room_reservations)

lib/
└── agendaService.ts           # REFATORAR (room_reservations)
```

---

**Próximo Passo**: Você executa `validate-schema.sql` e me passa o resultado. Aí eu começo a Fase 2! 🚀
