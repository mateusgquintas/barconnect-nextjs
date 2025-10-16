# Agenda (Hotel) – Plano de Iteração

## Objetivo
Calendário mensal com marcação de reservas integradas a Quartos e Romarias.

## Domínio mínimo
- rooms: id, name, capacity, status
- pilgrimages: id, groupName, contact, size, notes
- bookings: id, room_id, start, end, status, customer_name, pilgrimage_id

Status: pending | confirmed | cancelled | checked_in | checked_out

## Regras iniciais
- Proibir sobreposição no mesmo quarto
- Reservas podem vincular a uma romaria (opcional)
- Status padronizados e toasts consistentes

## API (stubs) – lib/agendaService.ts
- listRooms(): Room[]
- listBookingsInRange(range): Booking[]
- createBooking(payload): string (id)
- cancelBooking(id): boolean

## UI
- components/agenda/MonthlyCalendar.tsx: grade 6x7 (42 dias), clique por dia
- app/hotel/agenda/page.tsx: prev/next mês, seleção de dia

## Testes
- __tests__/Agenda.skeleton.test.tsx: 42 células, título, clique
- Futuro: conflitos, integração com Supabase, e2e

## Próximas iterações
- Modal de criação/edição de reserva
- Visual de ocupação por quarto + filtro
- Drag-and-drop de reservas
- Integração completa Supabase (tabelas e policies)