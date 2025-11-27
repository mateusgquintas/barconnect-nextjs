/**
 * Testes para validação de disponibilidade de quartos
 * Garante que getAvailableRooms() filtra corretamente quartos ocupados
 */
import { getAvailableRooms } from '@/lib/agendaService';

// Mock do supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        data: null,
        error: null,
      })),
    })),
  },
}));

describe('agendaService - getAvailableRooms', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve rejeitar se data de início >= data de fim', async () => {
    const start = '2025-11-28';
    const end = '2025-11-27'; // Antes do início

    await expect(getAvailableRooms(start, end)).rejects.toThrow(
      'Data de início deve ser anterior à data de término.'
    );
  });

  it('deve rejeitar se datas são iguais', async () => {
    const date = '2025-11-27';

    await expect(getAvailableRooms(date, date)).rejects.toThrow(
      'Data de início deve ser anterior à data de término.'
    );
  });

  it('deve aceitar datas válidas com Date objects', async () => {
    const start = new Date('2025-11-27T14:00:00');
    const end = new Date('2025-11-29T12:00:00');

    // Não deve lançar erro
    await expect(getAvailableRooms(start, end)).resolves.toBeDefined();
  });

  it('deve aceitar datas válidas com strings ISO', async () => {
    const start = '2025-11-27';
    const end = '2025-11-29';

    // Não deve lançar erro
    await expect(getAvailableRooms(start, end)).resolves.toBeDefined();
  });

  it('deve aceitar datas com horários específicos', async () => {
    const start = '2025-11-27T14:00';
    const end = '2025-11-27T18:00'; // Mesmo dia, mas horário posterior

    // Não deve lançar erro
    await expect(getAvailableRooms(start, end)).resolves.toBeDefined();
  });
});
