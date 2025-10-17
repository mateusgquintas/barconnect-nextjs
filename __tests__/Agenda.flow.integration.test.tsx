import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AgendaPage from '@/app/hotel/agenda/page';
import * as agendaService from '@/lib/agendaService';

// Mock the service to return test data
jest.mock('@/lib/agendaService', () => ({
  listRooms: jest.fn().mockResolvedValue([
    { id: 'room-1', name: 'Quarto 101', capacity: 2, status: 'active' }
  ]),
  listBookingsInRange: jest.fn().mockResolvedValue([]),
  createBooking: jest.fn().mockImplementation(async (payload) => {
    // Check for conflict by inspecting previously created bookings
    const mockCreateBooking = agendaService.createBooking as jest.Mock;
    const calls = mockCreateBooking.mock.calls;
    if (calls.length > 1) {
      // Second call should fail (duplicate)
      throw new Error('Conflito: já existe uma reserva neste período para o quarto selecionado.');
    }
    return 'booking-1';
  }),
}));

// Utils
const qsa = (root: ParentNode, sel: string) => Array.from(root.querySelectorAll(sel)) as HTMLElement[];

describe('AgendaPage flow (with service)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('cria reserva e mostra badge; bloqueia duplicata no mesmo dia', async () => {
    const user = userEvent.setup();
    const { container } = render(<AgendaPage />);

    // Wait for rooms to load
    await waitFor(() => {
      expect(agendaService.listRooms).toHaveBeenCalled();
    });

    // Descobre o mês atual pelo heading do calendário
    const heading = await screen.findByRole('heading', { level: 2 });
    const monthLabel = heading.textContent || '';

    // Seleciona uma célula que pertence ao mês atual (aria-label contém o monthLabel)
    const allCells = qsa(container, '[role="gridcell"]');
    const currentMonthCells = allCells.filter(c => (c.getAttribute('aria-label') || '').includes(monthLabel));
    if (currentMonthCells.length === 0) throw new Error('No cells for current month');
    const cell = currentMonthCells[Math.min(9, currentMonthCells.length - 1)]; // pegue uma do meio (ex: ~dia 10)
    const target = cell.getAttribute('data-date')!;

    // Cria primeira reserva
    await user.click(cell);
    const createBtn = await screen.findByRole('button', { name: /criar/i });
    await user.click(createBtn);

    // Badge deve aparecer como "1 res."
    await waitFor(() => {
      const cellAfter = container.querySelector(`[data-date="${target}"]`) as HTMLElement;
      expect(cellAfter).toHaveTextContent(/1\s*res\./i);
    });

    // Tentar duplicar no mesmo dia
    const cellAfter = container.querySelector(`[data-date="${target}"]`) as HTMLElement;
    await user.click(cellAfter);
    const createBtn2 = await screen.findByRole('button', { name: /criar/i });
    await user.click(createBtn2);

    // Deve continuar com 1 (não duplica)
    await waitFor(() => {
      const cellFinal = container.querySelector(`[data-date="${target}"]`) as HTMLElement;
      expect(cellFinal).toHaveTextContent(/1\s*res\./i);
    });
  });
});
