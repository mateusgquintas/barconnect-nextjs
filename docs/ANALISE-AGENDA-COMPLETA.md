# 📋 ANÁLISE COMPLETA - AGENDA INTEGRADA

## 🔍 SITUAÇÃO ATUAL DO PROJETO

### 1. SCHEMAS EXISTENTES NO SUPABASE

#### A. Schema Hotel-Romarias (schema_hotel_romarias.sql) - **PRINCIPAL ATIVO**
```sql
- pilgrimages (romarias/grupos)
  ├── id, name, arrival_date, departure_date
  ├── number_of_people, bus_group, contact_phone
  └── status, notes, created_at

- rooms (quartos integrados)
  ├── id, number, type, status, description
  ├── pilgrimage_id (FK → pilgrimages) ⭐ VÍNCULO COM ROMARIA
  ├── guest_name, guest_cpf, guest_phone, guest_email
  ├── check_in_date, check_out_date
  └── observations, created_at

- guests (hóspedes individuais - opcional)
  ├── id, name, cpf, phone, email
  └── notes, created_at

- room_reservations (reservas detalhadas)
  ├── id, room_id (FK), guest_id (FK), pilgrimage_id (FK)
  ├── check_in_date, check_out_date
  ├── status (reserved, checked_in, checked_out, cancelled, no_show)
  └── notes, created_at
```

#### B. Schema Hotel Simples (schema_hotel.sql) - **ALTERNATIVO**
```sql
- hotel_rooms (quartos simples)
- hotel_guests (hóspedes)
- hotel_reservations (reservas)
- hotel_room_charges (extras/consumos)
```

#### C. Schema Agenda Novo (scripts/create-agenda-tables.sql) - **⚠️ CONFLITO DETECTADO**
```sql
- rooms ❌ DUPLICA a tabela rooms do schema_hotel_romarias
- bookings (nova estrutura simplificada)
```

### 2. COMPONENTES EXISTENTES

#### A. Hotel.tsx
- **Função**: Gestão visual de quartos
- **Features**:
  - Grid de quartos com status (available, occupied, cleaning, maintenance)
  - Filtros por status e romaria
  - Stats: total, disponíveis, ocupados, taxa de ocupação
  - Vincula quartos com romarias (pilgrimage_id)
- **Hook**: `useRoomsDB()` → conecta na tabela `rooms` do schema_hotel_romarias

#### B. HotelPilgrimages.tsx
- **Função**: Gestão de romarias/grupos
- **Features**:
  - CRUD completo de romarias
  - Visualização de quartos por romaria
  - Status: active, completed, cancelled
  - Stats: total, ativas, pessoas, concluídas
- **Hook**: `usePilgrimagesDB()` → conecta na tabela `pilgrimages`

#### C. AgendaPage (app/hotel/agenda/page.tsx) - **NOVO, CONFLITANTE**
- **Função**: Calendário mensal de reservas
- **Features**:
  - Grid 6x7 (semanas × dias)
  - Badge com contagem de reservas por dia
  - Dialog para criar reservas
- **Service**: `agendaService.ts` → tenta usar tabelas `rooms` e `bookings`
- **⚠️ PROBLEMA**: Usa estrutura diferente das tabelas existentes

### 3. HOOKS E SERVIÇOS

#### A. useRoomsDB.ts (ATIVO)
```typescript
interface Room {
  id, number, type, status, description
  pilgrimage_id ⭐ // Vínculo com romaria
  guest_name, guest_cpf, guest_phone, guest_email
  check_in_date, check_out_date, observations
}
```
- **Tabela**: `rooms` (schema_hotel_romarias)
- **Usado por**: Hotel.tsx, HotelPilgrimages.tsx

#### B. agendaService.ts (NOVO, CONFLITANTE)
```typescript
- Tenta usar tabelas: rooms, bookings, hotel_rooms, hotel_reservations
- Tem lógica de fallback entre múltiplos schemas
- ⚠️ Não aproveita estrutura existente room_reservations
```

## 🎯 PROBLEMAS IDENTIFICADOS

### 1. **DUPLICAÇÃO DE SCHEMA**
- ❌ Script `create-agenda-tables.sql` cria tabela `rooms` que já existe
- ❌ Nova tabela `bookings` ignora `room_reservations` existente
- ❌ Perde vínculo com `pilgrimages` (romarias)

### 2. **DESALINHAMENTO DE DADOS**
- Agenda não usa `pilgrimage_id` (essencial para o negócio)
- Não aproveita campos `check_in_date`, `check_out_date` já presentes em `rooms`
- Estrutura `room_reservations` (completa) não é usada

### 3. **INCONSISTÊNCIA DE INTERFACE**
- `useRoomsDB` tem interface completa com romarias
- `agendaService` ignora essas informações
- Componentes Hotel/HotelPilgrimages não integram com Agenda

## ✅ SOLUÇÃO PROPOSTA - AGENDA INTEGRADA ESTILO GOOGLE CALENDAR

### 1. MANTER SCHEMA EXISTENTE (schema_hotel_romarias.sql)
**NÃO criar novas tabelas. Usar:**
- ✅ `rooms` (já tem tudo que precisamos)
- ✅ `room_reservations` (reservas detalhadas)
- ✅ `pilgrimages` (vínculo com romarias)

### 2. REFATORAR agendaService.ts
**Adaptar para usar estrutura existente:**
```typescript
// EM VEZ DE:
createBooking({ room_id, start, end, customer_name })

// USAR:
createReservation({
  room_id,
  pilgrimage_id?,      // Opcional: vínculo com romaria
  guest_id?,           // Opcional: hóspede individual
  check_in_date,
  check_out_date,
  status: 'reserved'
})
```

### 3. FEATURES DA AGENDA (ESTILO GOOGLE CALENDAR)

#### A. VISUALIZAÇÃO MENSAL
```
┌─────────────────────────────────────────┐
│  Outubro 2025                    [≡]    │
├─────────────────────────────────────────┤
│ Dom  Seg  Ter  Qua  Qui  Sex  Sáb      │
├─────────────────────────────────────────┤
│      1    2    3    4    5    6         │
│      ▓▓   ░░   ░░   ██   ░░   ░░        │
│     80%  20%  30%  95%  15%  25%        │
│                                          │
│  7    8    9   10   11   12   13        │
│ ░░   ██   ▓▓   ░░   ░░   ░░   ▓▓        │
│ 40% 100%  85%  35%  20%  10%  70%       │
└─────────────────────────────────────────┘

Legenda:
░░ = 0-40% ocupação (verde)
▓▓ = 41-80% ocupação (amarelo)
██ = 81-100% ocupação (vermelho)
```

#### B. BARRA DE OCUPAÇÃO POR DIA
```typescript
function renderDayOccupancy(date: Date) {
  // 1. Buscar todas as reservas ativas neste dia
  const reservations = getReservationsForDay(date);
  
  // 2. Contar quartos ocupados
  const occupiedRooms = reservations.length;
  const totalRooms = rooms.length;
  const percentage = (occupiedRooms / totalRooms) * 100;
  
  // 3. Renderizar barra
  return (
    <div className="w-full h-1 bg-gray-200 rounded-full">
      <div 
        className={`h-full rounded-full ${getColorByPercentage(percentage)}`}
        style={{ width: `${percentage}%` }}
      />
      <span className="text-[10px]">{percentage.toFixed(0)}%</span>
    </div>
  );
}
```

#### C. CLICK NO DIA → PAINEL LATERAL (ESTILO GOOGLE)
```typescript
<DaySidebar>
  <h3>15 de Outubro, 2025</h3>
  
  <section>
    <h4>Romarias Ativas ({pilgrimagesCount})</h4>
    {pilgrimages.map(p => (
      <PilgrimageCard pilgrimage={p} />
    ))}
  </section>
  
  <section>
    <h4>Quartos Ocupados ({occupiedCount}/{totalRooms})</h4>
    {reservations.map(r => (
      <ReservationCard 
        room={r.room}
        guest={r.guest}
        pilgrimage={r.pilgrimage}
        checkIn={r.check_in_date}
        checkOut={r.check_out_date}
      />
    ))}
  </section>
  
  <Button onClick={() => setShowNewReservation(true)}>
    + Nova Reserva
  </Button>
</DaySidebar>
```

#### D. FILTROS INTEGRADOS
```typescript
<AgendaFilters>
  {/* Filtro de Romaria */}
  <Select value={filterPilgrimage}>
    <option value="all">Todas as Romarias</option>
    {pilgrimages.map(p => (
      <option value={p.id}>{p.name} ({p.busGroup})</option>
    ))}
  </Select>
  
  {/* Filtro de Status */}
  <Select value={filterStatus}>
    <option value="all">Todos os Status</option>
    <option value="reserved">Reservado</option>
    <option value="checked_in">Check-in Feito</option>
    <option value="checked_out">Check-out Feito</option>
  </Select>
  
  {/* Range de Datas */}
  <DateRangePicker 
    start={filterStart}
    end={filterEnd}
    onChange={handleDateRangeChange}
  />
</AgendaFilters>
```

### 4. NOVO DIALOG DE RESERVA (INTEGRADO)

```typescript
<NewReservationDialog date={selectedDate}>
  {/* Opção 1: Reserva Individual */}
  <RadioGroup value={reservationType}>
    <Radio value="individual">Reserva Individual</Radio>
    <Radio value="pilgrimage">Reserva para Romaria</Radio>
  </RadioGroup>
  
  {reservationType === 'individual' && (
    <>
      <Input label="Nome do Hóspede" {...guestName} />
      <Input label="CPF" {...guestCPF} />
      <Input label="Telefone" {...guestPhone} />
      <Select label="Quarto" {...selectedRoom}>
        {availableRooms.map(r => (
          <option value={r.id}>Quarto {r.number} - {r.type}</option>
        ))}
      </Select>
    </>
  )}
  
  {reservationType === 'pilgrimage' && (
    <>
      <Select label="Romaria" {...selectedPilgrimage}>
        {pilgrimages.map(p => (
          <option value={p.id}>
            {p.name} - {p.busGroup} ({p.numberOfPeople} pessoas)
          </option>
        ))}
      </Select>
      <MultiSelect label="Quartos" {...selectedRooms}>
        {availableRooms.map(r => (
          <option value={r.id}>Quarto {r.number}</option>
        ))}
      </MultiSelect>
      <p>Quartos necessários: {Math.ceil(selectedPilgrimage.numberOfPeople / 2)}</p>
    </>
  )}
  
  <DatePicker label="Check-in" {...checkInDate} />
  <DatePicker label="Check-out" {...checkOutDate} />
  <Textarea label="Observações" {...notes} />
</NewReservationDialog>
```

## 📦 ESTRUTURA DE ARQUIVOS PROPOSTA

```
app/hotel/agenda/
├── page.tsx                    # Calendário principal (refatorado)
└── components/
    ├── MonthlyCalendar.tsx     # Grid mensal com % ocupação
    ├── DayOccupancyBar.tsx     # Barra de % por dia
    ├── DaySidebar.tsx          # Painel lateral ao clicar no dia
    ├── ReservationCard.tsx     # Card de reserva individual
    ├── PilgrimageCard.tsx      # Card de romaria
    ├── NewReservationDialog.tsx # Dialog novo (individual/romaria)
    └── AgendaFilters.tsx       # Filtros integrados

lib/
└── agendaService.ts (REFATORADO)
    ├── listRooms() → usa rooms (schema existente)
    ├── listPilgrimages() → usa pilgrimages
    ├── listReservationsInRange() → usa room_reservations ⭐
    ├── createReservation() → cria em room_reservations
    ├── updateReservation()
    ├── cancelReservation()
    └── getOccupancyByDay() → calcula % ocupação

hooks/
├── useRoomsDB.ts (MANTER)
├── usePilgrimagesDB.ts (MANTER)
└── useAgenda.ts (NOVO)
    └── Integra rooms + pilgrimages + room_reservations
```

## 🚀 PLANO DE IMPLEMENTAÇÃO

### FASE 1: CORRIGIR FOUNDATION (URGENTE)
1. ❌ **DELETAR** `scripts/create-agenda-tables.sql` (conflitante)
2. ✅ **VALIDAR** schema_hotel_romarias.sql está deployado no Supabase
3. ✅ **REFATORAR** agendaService.ts para usar `room_reservations`

### FASE 2: AGENDA BÁSICA
1. ✅ Calendário mensal com grid 6x7
2. ✅ Barra de % ocupação por dia
3. ✅ Click no dia → listar reservas
4. ✅ Badge com count de reservas

### FASE 3: INTEGRAÇÃO ROMARIAS
1. ✅ Filtro por romaria
2. ✅ Dialog: opção individual vs romaria
3. ✅ Alocação múltipla de quartos para romaria
4. ✅ Visualização de romarias no dia selecionado

### FASE 4: UX ESTILO GOOGLE CALENDAR
1. ✅ Sidebar deslizante ao clicar no dia
2. ✅ Drag & drop para realocar reservas (fase futura)
3. ✅ Cores por tipo de reserva (individual/romaria)
4. ✅ Timeline de check-in/check-out no dia

## ⚠️ AÇÕES IMEDIATAS

1. **NÃO EXECUTAR** `scripts/create-agenda-tables.sql`
2. **USAR** estrutura existente: rooms + room_reservations + pilgrimages
3. **REFATORAR** agendaService para integração real
4. **TESTAR** com dados reais do schema_hotel_romarias

---

**Data da Análise**: 17/10/2025  
**Status**: ⚠️ CONFLITO DETECTADO - AGUARDANDO APROVAÇÃO PARA REFATORAÇÃO
