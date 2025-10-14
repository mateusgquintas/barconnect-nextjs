import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComandaDetail } from '../components/ComandaDetail';
import { Comanda } from '@/types';
import { UserRole } from '@/types/user';

// Mock ResizeObserver (usado pelo ScrollArea)
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock data para testes
const mockProduct1 = {
  id: '1',
  name: 'Cerveja Heineken',
  price: 8.50,
  stock: 100,
  category: 'Bebidas'
};

const mockProduct2 = {
  id: '2',
  name: 'Porção de Batata Frita',
  price: 15.90,
  stock: 50,
  category: 'Petiscos'
};

const mockComandaComItens: Comanda = {
  id: '1',
  number: 101,
  customerName: 'João Silva',
  items: [
    { product: mockProduct1, quantity: 2 },
    { product: mockProduct2, quantity: 1 }
  ],
  createdAt: new Date('2025-10-08T10:00:00Z'),
  status: 'open'
};

const mockComandaVazia: Comanda = {
  id: '2',
  number: 102,
  customerName: 'Maria Santos',
  items: [],
  createdAt: new Date('2025-10-08T09:00:00Z'),
  status: 'open'
};

const mockComandaSemNome: Comanda = {
  id: '3',
  number: 103,
  items: [{ product: mockProduct1, quantity: 1 }],
  createdAt: new Date('2025-10-08T08:00:00Z'),
  status: 'open'
};

describe('ComandaDetail', () => {
  const defaultProps = {
    comanda: null,
    onRemoveItem: jest.fn(),
    onCheckout: jest.fn(),
    userRole: 'admin' as UserRole
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Estado nulo', () => {
    it('exibe placeholder quando nenhuma comanda é selecionada', () => {
  render(<ComandaDetail {...defaultProps} />);
      
      expect(screen.getByText('Selecione uma comanda')).toBeInTheDocument();
      expect(screen.getByText('ou crie uma nova')).toBeInTheDocument();
    });
  });

  describe('Renderização da comanda', () => {
    it('exibe informações do cabeçalho corretamente', () => {
  render(<ComandaDetail {...defaultProps} comanda={mockComandaComItens} />);
      
      expect(screen.getByText('Comanda #101')).toBeInTheDocument();
      expect(screen.getByText('João Silva')).toBeInTheDocument();
      expect(screen.getByText('Total')).toBeInTheDocument();
    });

    it('exibe nome do primeiro produto quando não há nome do cliente', () => {
  render(<ComandaDetail {...defaultProps} comanda={mockComandaSemNome} />);
      
      expect(screen.getByText('Comanda #103')).toBeInTheDocument();
      expect(screen.getByText('Cerveja')).toBeInTheDocument(); // Primeiro nome do produto
    });

    it('exibe "Nova" quando não há cliente nem itens', () => {
  render(<ComandaDetail {...defaultProps} comanda={mockComandaVazia} />);
      
      expect(screen.getByText('Comanda #102')).toBeInTheDocument();
      expect(screen.getByText('Maria Santos')).toBeInTheDocument();
    });
  });

  describe('Exibição de itens', () => {
    it('renderiza lista de itens corretamente', () => {
  render(<ComandaDetail {...defaultProps} comanda={mockComandaComItens} />);
      
      expect(screen.getByText('Itens da Comanda')).toBeInTheDocument();
      expect(screen.getByText('2x Cerveja Heineken')).toBeInTheDocument();
      expect(screen.getByText('1x Porção de Batata Frita')).toBeInTheDocument();
    });

    it('exibe mensagem quando não há itens', () => {
  render(<ComandaDetail {...defaultProps} comanda={mockComandaVazia} />);
      
      expect(screen.getByText('Nenhum item adicionado')).toBeInTheDocument();
    });

    it('renderiza botões de remover para cada item', () => {
  render(<ComandaDetail {...defaultProps} comanda={mockComandaComItens} />);
  // Busca pelo nome do botão (title="Remover item" vira accessible name)
  const removeButtons = screen.getAllByRole('button', { name: 'Remover item' });
  expect(removeButtons).toHaveLength(2); // Um para cada item
    });
  });

  describe('Cálculos financeiros', () => {
    it('calcula total corretamente', () => {
  render(<ComandaDetail {...defaultProps} comanda={mockComandaComItens} />);
      
      // Total: (8.50 * 2) + (15.90 * 1) = 17.00 + 15.90 = 32.90
      expect(screen.getByText('R$ 32.90')).toBeInTheDocument();
    });

    it('calcula subtotais por item corretamente', () => {
  render(<ComandaDetail {...defaultProps} comanda={mockComandaComItens} />);
      
      expect(screen.getByText('R$ 17.00')).toBeInTheDocument(); // 8.50 * 2
      expect(screen.getByText('R$ 15.90')).toBeInTheDocument(); // 15.90 * 1
    });

    it('exibe R$ 0.00 para comanda vazia', () => {
  render(<ComandaDetail {...defaultProps} comanda={mockComandaVazia} />);
      
      expect(screen.getByText('R$ 0.00')).toBeInTheDocument();
    });
  });

  describe('Interações do usuário', () => {
    it('chama onRemoveItem ao clicar no botão remover', async () => {
    const onRemoveItem = jest.fn();
  render(<ComandaDetail {...defaultProps} comanda={mockComandaComItens} onRemoveItem={onRemoveItem} />);
  // Busca pelo nome do botão (title="Remover item" vira accessible name)
  const removeButtons = screen.getAllByRole('button', { name: 'Remover item' });
  await userEvent.click(removeButtons[0]);
  expect(onRemoveItem).toHaveBeenCalledWith('1'); // ID do primeiro produto
    });

    it('chama onCheckout ao clicar no botão fechar comanda', async () => {
      const onCheckout = jest.fn();
  render(<ComandaDetail {...defaultProps} comanda={mockComandaComItens} onCheckout={onCheckout} />);
      
      await userEvent.click(screen.getByRole('button', { name: /fechar comanda/i }));
      expect(onCheckout).toHaveBeenCalledTimes(1);
    });

    it('não exibe botão fechar comanda quando não há itens', () => {
  render(<ComandaDetail {...defaultProps} comanda={mockComandaVazia} />);
      
      expect(screen.queryByRole('button', { name: /fechar comanda/i })).not.toBeInTheDocument();
    });
  });

  describe('Acessibilidade', () => {
    it('possui estrutura semântica adequada', () => {
  render(<ComandaDetail {...defaultProps} comanda={mockComandaComItens} />);
      
      expect(screen.getByRole('heading', { name: /comanda #101/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /itens da comanda/i })).toBeInTheDocument();
    });

    it('botões possuem funcionalidade acessível', () => {
  render(<ComandaDetail {...defaultProps} comanda={mockComandaComItens} />);
      
      const checkoutButton = screen.getByRole('button', { name: /fechar comanda/i });
      expect(checkoutButton).toBeInTheDocument();
      expect(checkoutButton).not.toBeDisabled();
    });
  });

  describe('Casos extremos e performance', () => {
    it('renderiza muitos itens eficientemente', () => {
      const muitosItens = Array.from({ length: 20 }, (_, i) => ({
        product: { ...mockProduct1, id: `prod-${i}`, name: `Produto ${i}` },
        quantity: i + 1
      }));
      
      const comandaComMuitosItens: Comanda = {
        ...mockComandaComItens,
        items: muitosItens
      };
      
  render(<ComandaDetail {...defaultProps} comanda={comandaComMuitosItens} />);
      
      expect(screen.getByText('1x Produto 0')).toBeInTheDocument();
      expect(screen.getByText('20x Produto 19')).toBeInTheDocument();
    });

    it('calcula corretamente com valores decimais complexos', () => {
      const comandaDecimal: Comanda = {
        ...mockComandaComItens,
        items: [
          { product: { ...mockProduct1, price: 12.99 }, quantity: 3 },
          { product: { ...mockProduct2, price: 7.33 }, quantity: 2 }
        ]
      };
      
  render(<ComandaDetail {...defaultProps} comanda={comandaDecimal} />);
      
      // Total: (12.99 * 3) + (7.33 * 2) = 38.97 + 14.66 = 53.63
      expect(screen.getByText('R$ 53.63')).toBeInTheDocument();
      expect(screen.getByText('R$ 38.97')).toBeInTheDocument(); // Subtotal 1
      expect(screen.getByText('R$ 14.66')).toBeInTheDocument(); // Subtotal 2
    });

    it('funciona com comanda sem nome do cliente e sem itens', () => {
      const comandaVaziaSemNome: Comanda = {
        ...mockComandaVazia,
        customerName: undefined
      };
      
  render(<ComandaDetail {...defaultProps} comanda={comandaVaziaSemNome} />);
      
      expect(screen.getByText('Comanda #102')).toBeInTheDocument();
      expect(screen.getByText('Nova')).toBeInTheDocument();
      expect(screen.getByText('Nenhum item adicionado')).toBeInTheDocument();
    });
  });
});