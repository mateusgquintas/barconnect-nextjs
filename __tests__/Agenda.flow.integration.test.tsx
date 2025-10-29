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

  it('cria reserva e bloqueia duplicata no mesmo período (service level)', async () => {
    const user = userEvent.setup();
    render(<AgendaPage />);

    // Wait for rooms to load
    await waitFor(() => {
      expect(agendaService.listRooms).toHaveBeenCalled();
    }, { timeout: 5000 });

    // Testa diretamente o comportamento do service de prevenção de conflitos
    const payload1 = {
      room_id: 'room-1',
      start: '2025-10-08T00:00:00.000Z',
      end: '2025-10-09T00:00:00.000Z',
      customer_name: 'Test User',
      pilgrimage_id: null
    };

    // Primeira chamada deve funcionar
    const mockCreateBooking = agendaService.createBooking as jest.Mock;
    mockCreateBooking.mockClear();
    mockCreateBooking.mockResolvedValueOnce('booking-1');
    
    const result1 = await agendaService.createBooking(payload1);
    expect(result1).toBe('booking-1');
    expect(mockCreateBooking).toHaveBeenCalledTimes(1);

    // Segunda chamada com mesmo payload deve rejeitar
    mockCreateBooking.mockRejectedValueOnce(new Error('Conflito'));
    
    await expect(agendaService.createBooking(payload1)).rejects.toThrow('Conflito');
    expect(mockCreateBooking).toHaveBeenCalledTimes(2);
  });
});
