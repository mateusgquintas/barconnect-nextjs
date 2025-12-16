import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ComandaSidebar } from '@/components/ComandaSidebar';
import { Comanda } from '@/types';
import { UserRole } from '@/types/user';

// Mock lucide-react
jest.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon">X</div>
}));

describe('ComandaSidebar - Comprehensive Tests', () => {
  // Mock data
  const mockComandas: Comanda[] = [
    {
      id: '1',
      number: 101,
      status: 'open',
      customerName: 'João Silva',
      items: [
        { 
          id: '1', 
          product: { id: 'p1', name: 'Coca-Cola', price: 5, stock: 100, category: 'bebidas' }, 
          quantity: 2, 
          price: 5 
        },
        { 
          id: '2', 
          product: { id: 'p2', name: 'Hamburguer', price: 15, stock: 50, category: 'porcoes' }, 
          quantity: 1, 
          price: 15 
        }
      ],
      createdAt: '2025-12-15T10:00:00Z',
      updatedAt: '2025-12-15T10:00:00Z',
      userId: 'u1'
    },
    {
      id: '2',
      number: 102,
      status: 'open',
      customerName: 'Maria Santos',
      items: [
        { 
          id: '3', 
          product: { id: 'p3', name: 'Água', price: 3, stock: 200, category: 'bebidas' }, 
          quantity: 3, 
          price: 3 
        }
      ],
      createdAt: '2025-12-15T10:05:00Z',
      updatedAt: '2025-12-15T10:05:00Z',
      userId: 'u1'
    },
    {
      id: '3',
      number: 103,
      status: 'open',
      customerName: undefined,
      items: [],
      createdAt: '2025-12-15T10:10:00Z',
      updatedAt: '2025-12-15T10:10:00Z',
      userId: 'u1'
    },
    {
      id: '4',
      number: 104,
      status: 'closed',
      customerName: 'Pedro Costa',
      items: [
        { 
          id: '4', 
          product: { id: 'p4', name: 'Cerveja', price: 8, stock: 150, category: 'bebidas' }, 
          quantity: 5, 
          price: 8 
        }
      ],
      createdAt: '2025-12-15T09:00:00Z',
      updatedAt: '2025-12-15T11:00:00Z',
      userId: 'u1'
    }
  ];

  const mockOnSelectComanda = jest.fn();
  const mockOnCloseComanda = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering & Structure', () => {
    it('should render without crashing', () => {
      render(
        <ComandaSidebar 
          comandas={mockComandas}
          selectedComandaId={null}
          onSelectComanda={mockOnSelectComanda}
          onCloseComanda={mockOnCloseComanda}
          userRole="user"
        />
      );

      expect(screen.getByText('Comandas Abertas')).toBeInTheDocument();
    });

    it('should render header with title', () => {
      render(
        <ComandaSidebar 
          comandas={mockComandas}
          selectedComandaId={null}
          onSelectComanda={mockOnSelectComanda}
          onCloseComanda={mockOnCloseComanda}
          userRole="user"
        />
      );

      expect(screen.getByText('Comandas Abertas')).toBeInTheDocument();
    });

    it('should render search input', () => {
      render(
        <ComandaSidebar 
          comandas={mockComandas}
          selectedComandaId={null}
          onSelectComanda={mockOnSelectComanda}
          onCloseComanda={mockOnCloseComanda}
          userRole="user"
        />
      );

      const searchInput = screen.getByPlaceholderText('Buscar por número ou cliente...');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute('aria-label', 'Buscar comanda');
    });

    it('should render comandas list', () => {
      render(
        <ComandaSidebar 
          comandas={mockComandas}
          selectedComandaId={null}
          onSelectComanda={mockOnSelectComanda}
          onCloseComanda={mockOnCloseComanda}
          userRole="user"
        />
      );

      expect(screen.getByText('#101')).toBeInTheDocument();
      expect(screen.getByText('#102')).toBeInTheDocument();
      expect(screen.getByText('#103')).toBeInTheDocument();
    });

    it('should not render closed comandas', () => {
      render(
        <ComandaSidebar 
          comandas={mockComandas}
          selectedComandaId={null}
          onSelectComanda={mockOnSelectComanda}
          onCloseComanda={mockOnCloseComanda}
          userRole="user"
        />
      );

      expect(screen.queryByText('#104')).not.toBeInTheDocument();
      expect(screen.queryByText('Pedro Costa')).not.toBeInTheDocument();
    });
  });

  describe('Comandas Count Display', () => {
    it('should display correct count of open comandas', () => {
      render(
        <ComandaSidebar 
          comandas={mockComandas}
          selectedComandaId={null}
          onSelectComanda={mockOnSelectComanda}
          onCloseComanda={mockOnCloseComanda}
          userRole="user"
        />
      );

      expect(screen.getByText('3 ativa(s)')).toBeInTheDocument();
    });

    it('should update count after filtering', async () => {
      const user = userEvent.setup();
      render(
        <ComandaSidebar 
          comandas={mockComandas}
          selectedComandaId={null}
          onSelectComanda={mockOnSelectComanda}
          onCloseComanda={mockOnCloseComanda}
          userRole="user"
        />
      );

      const searchInput = screen.getByPlaceholderText('Buscar por número ou cliente...');
      await user.type(searchInput, 'João');

      await waitFor(() => {
        expect(screen.getByText('1 ativa(s)')).toBeInTheDocument();
      });
    });

    it('should show zero count when no comandas', () => {
      render(
        <ComandaSidebar 
          comandas={[]}
          selectedComandaId={null}
          onSelectComanda={mockOnSelectComanda}
          onCloseComanda={mockOnCloseComanda}
          userRole="user"
        />
      );

      expect(screen.getByText('0 ativa(s)')).toBeInTheDocument();
    });
  });

  describe('Comanda Information Display', () => {
    it('should display comanda number', () => {
      render(
        <ComandaSidebar 
          comandas={mockComandas}
          selectedComandaId={null}
          onSelectComanda={mockOnSelectComanda}
          onCloseComanda={mockOnCloseComanda}
          userRole="user"
        />
      );

      expect(screen.getByText('#101')).toBeInTheDocument();
    });

    it('should display customer name when available', () => {
      render(
        <ComandaSidebar 
          comandas={mockComandas}
          selectedComandaId={null}
          onSelectComanda={mockOnSelectComanda}
          onCloseComanda={mockOnCloseComanda}
          userRole="user"
        />
      );

      expect(screen.getByText('João Silva')).toBeInTheDocument();
      expect(screen.getByText('Maria Santos')).toBeInTheDocument();
    });

    it('should not display customer name when undefined', () => {
      render(
        <ComandaSidebar 
          comandas={mockComandas}
          selectedComandaId={null}
          onSelectComanda={mockOnSelectComanda}
          onCloseComanda={mockOnCloseComanda}
          userRole="user"
        />
      );

      const comanda103Card = screen.getByLabelText('Selecionar comanda #103');
      expect(comanda103Card).toBeInTheDocument();
      // Should not have customer name text
      expect(comanda103Card).not.toHaveTextContent(/^[A-Z][a-z]+ [A-Z][a-z]+$/);
    });

    it('should display status badge', () => {
      render(
        <ComandaSidebar 
          comandas={mockComandas}
          selectedComandaId={null}
          onSelectComanda={mockOnSelectComanda}
          onCloseComanda={mockOnCloseComanda}
          userRole="user"
        />
      );

      const badges = screen.getAllByText('Aberta');
      expect(badges).toHaveLength(3); // 3 open comandas
    });

    it('should display total items count', () => {
      render(
        <ComandaSidebar 
          comandas={mockComandas}
          selectedComandaId={null}
          onSelectComanda={mockOnSelectComanda}
          onCloseComanda={mockOnCloseComanda}
          userRole="user"
        />
      );

      const itemCounts = screen.getAllByText(/\d+ item\(ns\)/);
      expect(itemCounts).toHaveLength(3); // 3 comandas
      expect(screen.getByText('0 item(ns)')).toBeInTheDocument(); // Comanda 103: empty
    });

    it('should display first product name', () => {
      render(
        <ComandaSidebar 
          comandas={mockComandas}
          selectedComandaId={null}
          onSelectComanda={mockOnSelectComanda}
          onCloseComanda={mockOnCloseComanda}
          userRole="user"
        />
      );

      expect(screen.getByText(/Coca-Cola/)).toBeInTheDocument();
      expect(screen.getByText('Água')).toBeInTheDocument();
    });

    it('should display additional items count when multiple products', () => {
      render(
        <ComandaSidebar 
          comandas={mockComandas}
          selectedComandaId={null}
          onSelectComanda={mockOnSelectComanda}
          onCloseComanda={mockOnCloseComanda}
          userRole="user"
        />
      );

      // Comanda 101 has 2 items total
      expect(screen.getByText('Coca-Cola +1')).toBeInTheDocument();
    });

    it('should calculate and display total correctly', () => {
      render(
        <ComandaSidebar 
          comandas={mockComandas}
          selectedComandaId={null}
          onSelectComanda={mockOnSelectComanda}
          onCloseComanda={mockOnCloseComanda}
          userRole="user"
        />
      );

      // Comanda 101: 2*5 + 1*15 = 25
      expect(screen.getByText('R$ 25.00')).toBeInTheDocument();
      // Comanda 102: 3*3 = 9
      expect(screen.getByText('R$ 9.00')).toBeInTheDocument();
      // Comanda 103: empty = 0
      expect(screen.getByText('R$ 0.00')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should filter comandas by number', async () => {
      const user = userEvent.setup();
      render(
        <ComandaSidebar 
          comandas={mockComandas}
          selectedComandaId={null}
          onSelectComanda={mockOnSelectComanda}
          onCloseComanda={mockOnCloseComanda}
          userRole="user"
        />
      );

      const searchInput = screen.getByPlaceholderText('Buscar por número ou cliente...');
      await user.type(searchInput, '101');

      await waitFor(() => {
        expect(screen.getByText('#101')).toBeInTheDocument();
        expect(screen.queryByText('#102')).not.toBeInTheDocument();
        expect(screen.queryByText('#103')).not.toBeInTheDocument();
      });
    });

    it('should filter comandas by customer name (case insensitive)', async () => {
      const user = userEvent.setup();
      render(
        <ComandaSidebar 
          comandas={mockComandas}
          selectedComandaId={null}
          onSelectComanda={mockOnSelectComanda}
          onCloseComanda={mockOnCloseComanda}
          userRole="user"
        />
      );

      const searchInput = screen.getByPlaceholderText('Buscar por número ou cliente...');
      await user.type(searchInput, 'maria');

      await waitFor(() => {
        expect(screen.getByText('Maria Santos')).toBeInTheDocument();
        expect(screen.queryByText('João Silva')).not.toBeInTheDocument();
      });
    });

    it('should filter comandas by partial customer name', async () => {
      const user = userEvent.setup();
      render(
        <ComandaSidebar 
          comandas={mockComandas}
          selectedComandaId={null}
          onSelectComanda={mockOnSelectComanda}
          onCloseComanda={mockOnCloseComanda}
          userRole="user"
        />
      );

      const searchInput = screen.getByPlaceholderText('Buscar por número ou cliente...');
      await user.type(searchInput, 'Silva');

      await waitFor(() => {
        expect(screen.getByText('João Silva')).toBeInTheDocument();
        expect(screen.queryByText('Maria Santos')).not.toBeInTheDocument();
      });
    });

    it('should show all comandas when search is empty', async () => {
      const user = userEvent.setup();
      render(
        <ComandaSidebar 
          comandas={mockComandas}
          selectedComandaId={null}
          onSelectComanda={mockOnSelectComanda}
          onCloseComanda={mockOnCloseComanda}
          userRole="user"
        />
      );

      const searchInput = screen.getByPlaceholderText('Buscar por número ou cliente...');
      await user.type(searchInput, 'test');
      
      await waitFor(() => {
        expect(screen.queryByText('#101')).not.toBeInTheDocument();
      });

      await user.clear(searchInput);

      await waitFor(() => {
        expect(screen.getByText('#101')).toBeInTheDocument();
        expect(screen.getByText('#102')).toBeInTheDocument();
        expect(screen.getByText('#103')).toBeInTheDocument();
      });
    });

    it('should show empty state when no comandas match search', async () => {
      const user = userEvent.setup();
      render(
        <ComandaSidebar 
          comandas={mockComandas}
          selectedComandaId={null}
          onSelectComanda={mockOnSelectComanda}
          onCloseComanda={mockOnCloseComanda}
          userRole="user"
        />
      );

      const searchInput = screen.getByPlaceholderText('Buscar por número ou cliente...');
      await user.type(searchInput, 'nonexistent');

      await waitFor(() => {
        expect(screen.getByText('Nenhuma comanda aberta')).toBeInTheDocument();
      });
    });

    it('should ignore whitespace-only search', async () => {
      const user = userEvent.setup();
      render(
        <ComandaSidebar 
          comandas={mockComandas}
          selectedComandaId={null}
          onSelectComanda={mockOnSelectComanda}
          onCloseComanda={mockOnCloseComanda}
          userRole="user"
        />
      );

      const searchInput = screen.getByPlaceholderText('Buscar por número ou cliente...');
      await user.type(searchInput, '   ');

      // Should show all comandas
      expect(screen.getByText('#101')).toBeInTheDocument();
      expect(screen.getByText('#102')).toBeInTheDocument();
      expect(screen.getByText('#103')).toBeInTheDocument();
    });
  });

  describe('Selection Functionality', () => {
    it('should call onSelectComanda when clicking on comanda card', async () => {
      const user = userEvent.setup();
      render(
        <ComandaSidebar 
          comandas={mockComandas}
          selectedComandaId={null}
          onSelectComanda={mockOnSelectComanda}
          onCloseComanda={mockOnCloseComanda}
          userRole="user"
        />
      );

      const comanda101 = screen.getByLabelText('Selecionar comanda #101');
      await user.click(comanda101);

      expect(mockOnSelectComanda).toHaveBeenCalledWith(mockComandas[0]);
      expect(mockOnSelectComanda).toHaveBeenCalledTimes(1);
    });

    it('should highlight selected comanda', () => {
      render(
        <ComandaSidebar 
          comandas={mockComandas}
          selectedComandaId="1"
          onSelectComanda={mockOnSelectComanda}
          onCloseComanda={mockOnCloseComanda}
          userRole="user"
        />
      );

      const comanda101 = screen.getByLabelText('Selecionar comanda #101');
      expect(comanda101).toHaveClass('border-blue-700', 'bg-blue-50');
    });

    it('should not highlight non-selected comandas', () => {
      render(
        <ComandaSidebar 
          comandas={mockComandas}
          selectedComandaId="1"
          onSelectComanda={mockOnSelectComanda}
          onCloseComanda={mockOnCloseComanda}
          userRole="user"
        />
      );

      const comanda102 = screen.getByLabelText('Selecionar comanda #102');
      expect(comanda102).not.toHaveClass('border-blue-700', 'bg-blue-50');
    });

    it('should allow selecting different comanda', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <ComandaSidebar 
          comandas={mockComandas}
          selectedComandaId="1"
          onSelectComanda={mockOnSelectComanda}
          onCloseComanda={mockOnCloseComanda}
          userRole="user"
        />
      );

      const comanda102 = screen.getByLabelText('Selecionar comanda #102');
      await user.click(comanda102);

      expect(mockOnSelectComanda).toHaveBeenCalledWith(mockComandas[1]);

      rerender(
        <ComandaSidebar 
          comandas={mockComandas}
          selectedComandaId="2"
          onSelectComanda={mockOnSelectComanda}
          onCloseComanda={mockOnCloseComanda}
          userRole="user"
        />
      );

      expect(screen.getByLabelText('Selecionar comanda #102')).toHaveClass('border-blue-700', 'bg-blue-50');
    });

    it('should support keyboard navigation with Enter', async () => {
      const user = userEvent.setup();
      render(
        <ComandaSidebar 
          comandas={mockComandas}
          selectedComandaId={null}
          onSelectComanda={mockOnSelectComanda}
          onCloseComanda={mockOnCloseComanda}
          userRole="user"
        />
      );

      const comanda101 = screen.getByLabelText('Selecionar comanda #101');
      comanda101.focus();
      await user.keyboard('{Enter}');

      expect(mockOnSelectComanda).toHaveBeenCalledWith(mockComandas[0]);
    });

    it('should support keyboard navigation with Space', async () => {
      const user = userEvent.setup();
      render(
        <ComandaSidebar 
          comandas={mockComandas}
          selectedComandaId={null}
          onSelectComanda={mockOnSelectComanda}
          onCloseComanda={mockOnCloseComanda}
          userRole="user"
        />
      );

      const comanda101 = screen.getByLabelText('Selecionar comanda #101');
      comanda101.focus();
      await user.keyboard(' ');

      expect(mockOnSelectComanda).toHaveBeenCalledWith(mockComandas[0]);
    });
  });

  describe('Close Functionality (Admin Only)', () => {
    it('should display close button for admin users', () => {
      render(
        <ComandaSidebar 
          comandas={mockComandas}
          selectedComandaId={null}
          onSelectComanda={mockOnSelectComanda}
          onCloseComanda={mockOnCloseComanda}
          userRole="admin"
        />
      );

      expect(screen.getByLabelText('Fechar comanda #101')).toBeInTheDocument();
      expect(screen.getByLabelText('Fechar comanda #102')).toBeInTheDocument();
    });

    it('should not display close button for non-admin users', () => {
      render(
        <ComandaSidebar 
          comandas={mockComandas}
          selectedComandaId={null}
          onSelectComanda={mockOnSelectComanda}
          onCloseComanda={mockOnCloseComanda}
          userRole="user"
        />
      );

      expect(screen.queryByLabelText('Fechar comanda #101')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Fechar comanda #102')).not.toBeInTheDocument();
    });

    it('should call onCloseComanda when clicking close button', async () => {
      const user = userEvent.setup();
      render(
        <ComandaSidebar 
          comandas={mockComandas}
          selectedComandaId={null}
          onSelectComanda={mockOnSelectComanda}
          onCloseComanda={mockOnCloseComanda}
          userRole="admin"
        />
      );

      const closeButton = screen.getByLabelText('Fechar comanda #101');
      await user.click(closeButton);

      expect(mockOnCloseComanda).toHaveBeenCalledWith('1');
      expect(mockOnCloseComanda).toHaveBeenCalledTimes(1);
    });

    it('should not call onSelectComanda when clicking close button', async () => {
      const user = userEvent.setup();
      render(
        <ComandaSidebar 
          comandas={mockComandas}
          selectedComandaId={null}
          onSelectComanda={mockOnSelectComanda}
          onCloseComanda={mockOnCloseComanda}
          userRole="admin"
        />
      );

      const closeButton = screen.getByLabelText('Fechar comanda #101');
      await user.click(closeButton);

      expect(mockOnCloseComanda).toHaveBeenCalledWith('1');
      expect(mockOnSelectComanda).not.toHaveBeenCalled();
    });

    it('should display close icon', () => {
      render(
        <ComandaSidebar 
          comandas={mockComandas}
          selectedComandaId={null}
          onSelectComanda={mockOnSelectComanda}
          onCloseComanda={mockOnCloseComanda}
          userRole="admin"
        />
      );

      const xIcons = screen.getAllByTestId('x-icon');
      expect(xIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no comandas', () => {
      render(
        <ComandaSidebar 
          comandas={[]}
          selectedComandaId={null}
          onSelectComanda={mockOnSelectComanda}
          onCloseComanda={mockOnCloseComanda}
          userRole="user"
        />
      );

      expect(screen.getByText('Nenhuma comanda aberta')).toBeInTheDocument();
    });

    it('should display empty state when all comandas are closed', () => {
      const closedComandas = mockComandas.map(c => ({ ...c, status: 'closed' as const }));
      render(
        <ComandaSidebar 
          comandas={closedComandas}
          selectedComandaId={null}
          onSelectComanda={mockOnSelectComanda}
          onCloseComanda={mockOnCloseComanda}
          userRole="user"
        />
      );

      expect(screen.getByText('Nenhuma comanda aberta')).toBeInTheDocument();
      expect(screen.getByText('0 ativa(s)')).toBeInTheDocument();
    });

    it('should not call onSelectComanda in empty state', () => {
      render(
        <ComandaSidebar 
          comandas={[]}
          selectedComandaId={null}
          onSelectComanda={mockOnSelectComanda}
          onCloseComanda={mockOnCloseComanda}
          userRole="user"
        />
      );

      expect(mockOnSelectComanda).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle comanda with very long customer name', () => {
      const longNameComanda: Comanda = {
        ...mockComandas[0],
        customerName: 'João Pedro Francisco da Silva Santos de Oliveira Rodrigues'
      };

      render(
        <ComandaSidebar 
          comandas={[longNameComanda]}
          selectedComandaId={null}
          onSelectComanda={mockOnSelectComanda}
          onCloseComanda={mockOnCloseComanda}
          userRole="user"
        />
      );

      expect(screen.getByText('João Pedro Francisco da Silva Santos de Oliveira Rodrigues')).toBeInTheDocument();
    });

    it('should handle comanda with special characters in name', () => {
      const specialCharComanda: Comanda = {
        ...mockComandas[0],
        customerName: 'José María Ñoño & Co.'
      };

      render(
        <ComandaSidebar 
          comandas={[specialCharComanda]}
          selectedComandaId={null}
          onSelectComanda={mockOnSelectComanda}
          onCloseComanda={mockOnCloseComanda}
          userRole="user"
        />
      );

      expect(screen.getByText('José María Ñoño & Co.')).toBeInTheDocument();
    });

    it('should handle large number of comandas', () => {
      const manyComandas: Comanda[] = Array.from({ length: 50 }, (_, i) => ({
        id: `c${i}`,
        number: 100 + i,
        status: 'open' as const,
        customerName: `Cliente ${i}`,
        items: [],
        createdAt: '2025-12-15T10:00:00Z',
        updatedAt: '2025-12-15T10:00:00Z',
        userId: 'u1'
      }));

      render(
        <ComandaSidebar 
          comandas={manyComandas}
          selectedComandaId={null}
          onSelectComanda={mockOnSelectComanda}
          onCloseComanda={mockOnCloseComanda}
          userRole="user"
        />
      );

      expect(screen.getByText('50 ativa(s)')).toBeInTheDocument();
      expect(screen.getByText('#100')).toBeInTheDocument();
    });

    it('should handle comanda with very high total', () => {
      const highTotalComanda: Comanda = {
        ...mockComandas[0],
        items: [
          { 
            id: '1', 
            product: { id: 'p1', name: 'Item Caro', price: 999.99, stock: 10, category: 'outros' }, 
            quantity: 100, 
            price: 999.99 
          }
        ]
      };

      render(
        <ComandaSidebar 
          comandas={[highTotalComanda]}
          selectedComandaId={null}
          onSelectComanda={mockOnSelectComanda}
          onCloseComanda={mockOnCloseComanda}
          userRole="user"
        />
      );

      expect(screen.getByText('R$ 99999.00')).toBeInTheDocument();
    });

    it('should handle rapid comanda selection', async () => {
      const user = userEvent.setup();
      render(
        <ComandaSidebar 
          comandas={mockComandas}
          selectedComandaId={null}
          onSelectComanda={mockOnSelectComanda}
          onCloseComanda={mockOnCloseComanda}
          userRole="user"
        />
      );

      const comanda101 = screen.getByLabelText('Selecionar comanda #101');
      const comanda102 = screen.getByLabelText('Selecionar comanda #102');
      const comanda103 = screen.getByLabelText('Selecionar comanda #103');

      await user.click(comanda101);
      await user.click(comanda102);
      await user.click(comanda103);

      expect(mockOnSelectComanda).toHaveBeenCalledTimes(3);
    });

    it('should handle comandas with decimal prices', () => {
      const decimalComanda: Comanda = {
        ...mockComandas[0],
        items: [
          { 
            id: '1', 
            product: { id: 'p1', name: 'Item', price: 10.99, stock: 10, category: 'bebidas' }, 
            quantity: 3, 
            price: 10.99 
          }
        ]
      };

      render(
        <ComandaSidebar 
          comandas={[decimalComanda]}
          selectedComandaId={null}
          onSelectComanda={mockOnSelectComanda}
          onCloseComanda={mockOnCloseComanda}
          userRole="user"
        />
      );

      // 3 * 10.99 = 32.97
      expect(screen.getByText('R$ 32.97')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label on search input', () => {
      render(
        <ComandaSidebar 
          comandas={mockComandas}
          selectedComandaId={null}
          onSelectComanda={mockOnSelectComanda}
          onCloseComanda={mockOnCloseComanda}
          userRole="user"
        />
      );

      const searchInput = screen.getByLabelText('Buscar comanda');
      expect(searchInput).toBeInTheDocument();
    });

    it('should have proper aria-label on comanda cards', () => {
      render(
        <ComandaSidebar 
          comandas={mockComandas}
          selectedComandaId={null}
          onSelectComanda={mockOnSelectComanda}
          onCloseComanda={mockOnCloseComanda}
          userRole="user"
        />
      );

      expect(screen.getByLabelText('Selecionar comanda #101')).toBeInTheDocument();
      expect(screen.getByLabelText('Selecionar comanda #102')).toBeInTheDocument();
      expect(screen.getByLabelText('Selecionar comanda #103')).toBeInTheDocument();
    });

    it('should have proper aria-label on close buttons', () => {
      render(
        <ComandaSidebar 
          comandas={mockComandas}
          selectedComandaId={null}
          onSelectComanda={mockOnSelectComanda}
          onCloseComanda={mockOnCloseComanda}
          userRole="admin"
        />
      );

      expect(screen.getByLabelText('Fechar comanda #101')).toBeInTheDocument();
    });

    it('should allow keyboard focus on comanda cards', () => {
      render(
        <ComandaSidebar 
          comandas={mockComandas}
          selectedComandaId={null}
          onSelectComanda={mockOnSelectComanda}
          onCloseComanda={mockOnCloseComanda}
          userRole="user"
        />
      );

      const comanda101 = screen.getByLabelText('Selecionar comanda #101');
      expect(comanda101).toHaveAttribute('tabIndex', '0');
    });

    it('should have focus ring on comanda cards', () => {
      render(
        <ComandaSidebar 
          comandas={mockComandas}
          selectedComandaId={null}
          onSelectComanda={mockOnSelectComanda}
          onCloseComanda={mockOnCloseComanda}
          userRole="user"
        />
      );

      const comanda101 = screen.getByLabelText('Selecionar comanda #101');
      expect(comanda101).toHaveClass('focus:ring-2', 'focus:ring-blue-500');
    });
  });

  describe('Integration', () => {
    it('should handle complete workflow', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <ComandaSidebar 
          comandas={mockComandas}
          selectedComandaId={null}
          onSelectComanda={mockOnSelectComanda}
          onCloseComanda={mockOnCloseComanda}
          userRole="admin"
        />
      );

      // Search for comanda
      const searchInput = screen.getByPlaceholderText('Buscar por número ou cliente...');
      await user.type(searchInput, '101');

      await waitFor(() => {
        expect(screen.getByText('#101')).toBeInTheDocument();
        expect(screen.queryByText('#102')).not.toBeInTheDocument();
      });

      // Select comanda
      const comanda101 = screen.getByLabelText('Selecionar comanda #101');
      await user.click(comanda101);
      expect(mockOnSelectComanda).toHaveBeenCalledWith(mockComandas[0]);

      // Update to show selected state
      rerender(
        <ComandaSidebar 
          comandas={mockComandas}
          selectedComandaId="1"
          onSelectComanda={mockOnSelectComanda}
          onCloseComanda={mockOnCloseComanda}
          userRole="admin"
        />
      );

      expect(screen.getByLabelText('Selecionar comanda #101')).toHaveClass('border-blue-700');
    });

    it('should work with all user roles', () => {
      const roles: UserRole[] = ['admin', 'user', 'barman'];
      
      roles.forEach(role => {
        const { unmount } = render(
          <ComandaSidebar 
            comandas={mockComandas}
            selectedComandaId={null}
            onSelectComanda={mockOnSelectComanda}
            onCloseComanda={mockOnCloseComanda}
            userRole={role}
          />
        );

        expect(screen.getByText('Comandas Abertas')).toBeInTheDocument();
        
        if (role === 'admin') {
          expect(screen.getByLabelText('Fechar comanda #101')).toBeInTheDocument();
        } else {
          expect(screen.queryByLabelText('Fechar comanda #101')).not.toBeInTheDocument();
        }

        unmount();
      });
    });

    it('should maintain search state when comandas update', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <ComandaSidebar 
          comandas={mockComandas}
          selectedComandaId={null}
          onSelectComanda={mockOnSelectComanda}
          onCloseComanda={mockOnCloseComanda}
          userRole="user"
        />
      );

      const searchInput = screen.getByPlaceholderText('Buscar por número ou cliente...');
      await user.type(searchInput, 'João');

      const updatedComandas = [...mockComandas, {
        id: '5',
        number: 105,
        status: 'open' as const,
        customerName: 'João Pedro',
        items: [],
        createdAt: '2025-12-15T10:15:00Z',
        updatedAt: '2025-12-15T10:15:00Z',
        userId: 'u1'
      }];

      rerender(
        <ComandaSidebar 
          comandas={updatedComandas}
          selectedComandaId={null}
          onSelectComanda={mockOnSelectComanda}
          onCloseComanda={mockOnCloseComanda}
          userRole="user"
        />
      );

      // Search should still be active
      expect(searchInput).toHaveValue('João');
      expect(screen.getByText('João Silva')).toBeInTheDocument();
      expect(screen.getByText('João Pedro')).toBeInTheDocument();
      expect(screen.queryByText('Maria Santos')).not.toBeInTheDocument();
    });
  });
});
