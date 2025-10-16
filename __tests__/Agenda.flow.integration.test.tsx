import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AgendaPage from '@/app/hotel/agenda/page';

// Utils
const qsa = (root: ParentNode, sel: string) => Array.from(root.querySelectorAll(sel)) as HTMLElement[];

describe('AgendaPage flow (in-memory)', () => {
  it('cria reserva e mostra badge; bloqueia duplicata no mesmo dia', async () => {
    const user = userEvent.setup();
    const { container } = render(<AgendaPage />);

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
    const cellAfter = container.querySelector(`[data-date="${target}"]`) as HTMLElement;
    expect(cellAfter).toHaveTextContent(/1\s*res\./i);

    // Tentar duplicar no mesmo dia
    await user.click(cellAfter);
    const createBtn2 = await screen.findByRole('button', { name: /criar/i });
    await user.click(createBtn2);

    // Continua com 1
    const cellFinal = container.querySelector(`[data-date="${target}"]`) as HTMLElement;
    expect(cellFinal).toHaveTextContent(/1\s*res\./i);
  });
});
