import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MonthlyCalendar } from '@/components/agenda/MonthlyCalendar';

describe('MonthlyCalendar skeleton', () => {
  it('renderiza 42 células do mês (6x7)', () => {
    render(<MonthlyCalendar month={new Date('2025-10-01')} />);
    const cells = screen.getAllByRole('gridcell');
    expect(cells).toHaveLength(42);
  });

  it('mostra título do mês', () => {
    render(<MonthlyCalendar month={new Date(2025, 9, 1)} />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/outubro|october/i);
  });

  it('chama onDayClick ao clicar num dia', async () => {
    const user = userEvent.setup();
    const onDayClick = jest.fn();
    render(<MonthlyCalendar month={new Date('2025-10-01')} onDayClick={onDayClick} />);
    const cells = screen.getAllByRole('gridcell');
    await user.click(cells[10]);
    expect(onDayClick).toHaveBeenCalled();
  });
});
