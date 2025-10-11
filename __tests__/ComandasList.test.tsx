import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComandasList } from '../components/ComandasList';
import { Comanda } from '@/types';

// Mock data para testes
const mockProduct = {
  id: '1',
  name: 'Produto Teste',
  price: 10.50,
  stock: 100,
  category: 'Bebidas'
};

const mockComandaAberta: Comanda = {
  id: '1',
  number: 101,
  customerName: 'João Silva',
  items: [
    { product: mockProduct, quantity: 2 },
    { product: { ...mockProduct, id: '2', name: 'Produto 2', price: 5.00 }, quantity: 1 }
  ],
  createdAt: new Date('2025-10-08T10:00:00Z'),
  status: 'open'
};

const mockComandaFechada: Comanda = {
  id: '2',
  number: 102,
  customerName: 'Maria Santos',
  items: [{ product: mockProduct, quantity: 1 }],
  createdAt: new Date('2025-10-08T09:00:00Z'),
  status: 'closed'
};

describe('ComandasList', () => {
  const defaultProps = {
    comandas: [],
    onBack: jest.fn(),
    onNewComanda: jest.fn(),
    onSelectComanda: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderização básica', () => {
    it('renderiza título e contador de comandas', () => {
      render(<ComandasList {...defaultProps} comandas={[mockComandaAberta]} />);
      
      expect(screen.getByText('Comandas Abertas')).toBeInTheDocument();
      expect(screen.getByText('1 comanda(s) ativa(s)')).toBeInTheDocument();
    });

    it('renderiza botões de navegação e ação', () => {
      render(<ComandasList {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /voltar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /nova comanda/i })).toBeInTheDocument();
    });
  });

  describe('Estado vazio', () => {
    it('exibe mensagem quando não há comandas', () => {
      render(<ComandasList {...defaultProps} comandas={[]} />);
      
      expect(screen.getByText('Nenhuma comanda aberta')).toBeInTheDocument();
      expect(screen.getByText('0 comanda(s) ativa(s)')).toBeInTheDocument();
    });

    it('exibe estado vazio quando só há comandas fechadas', () => {
      render(<ComandasList {...defaultProps} comandas={[mockComandaFechada]} />);
      
      expect(screen.getByText('Nenhuma comanda aberta')).toBeInTheDocument();
      expect(screen.getByText('0 comanda(s) ativa(s)')).toBeInTheDocument();
    });
  });

  describe('Filtros e lógica de negócio', () => {
    it('filtra apenas comandas abertas', () => {
      const comandas = [mockComandaAberta, mockComandaFechada];
      render(<ComandasList {...defaultProps} comandas={comandas} />);
      
      expect(screen.getByText('Comanda #101')).toBeInTheDocument();
      expect(screen.queryByText('Comanda #102')).not.toBeInTheDocument();
      expect(screen.getByText('1 comanda(s) ativa(s)')).toBeInTheDocument();
    });

    it('calcula total corretamente', () => {
      render(<ComandasList {...defaultProps} comandas={[mockComandaAberta]} />);
      
      // Total: (10.50 * 2) + (5.00 * 1) = 26.00
      expect(screen.getByText('R$ 26.00')).toBeInTheDocument();
    });

    it('exibe quantidade de itens correta', () => {
      render(<ComandasList {...defaultProps} comandas={[mockComandaAberta]} />);
      
      expect(screen.getByText('2 item(ns)')).toBeInTheDocument();
    });
  });

  describe('Interações do usuário', () => {
    it('chama onBack ao clicar no botão voltar', async () => {
      const onBack = jest.fn();
      render(<ComandasList {...defaultProps} onBack={onBack} />);
      
      await userEvent.click(screen.getByRole('button', { name: /voltar/i }));
      expect(onBack).toHaveBeenCalledTimes(1);
    });

    it('chama onNewComanda ao clicar em nova comanda', async () => {
      const onNewComanda = jest.fn();
      render(<ComandasList {...defaultProps} onNewComanda={onNewComanda} />);
      
      await userEvent.click(screen.getByRole('button', { name: /nova comanda/i }));
      expect(onNewComanda).toHaveBeenCalledTimes(1);
    });

    it('chama onSelectComanda ao clicar em uma comanda', async () => {
      const onSelectComanda = jest.fn();
      render(<ComandasList {...defaultProps} comandas={[mockComandaAberta]} onSelectComanda={onSelectComanda} />);
      
      await userEvent.click(screen.getByText('Comanda #101'));
      expect(onSelectComanda).toHaveBeenCalledWith(mockComandaAberta);
    });
  });

  describe('Acessibilidade', () => {
    it('possui estrutura semântica adequada', () => {
      render(<ComandasList {...defaultProps} comandas={[mockComandaAberta]} />);
      
      expect(screen.getByRole('heading', { name: 'Comandas Abertas' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /voltar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /nova comanda/i })).toBeInTheDocument();
    });

    it('cards de comanda são clicáveis e identificáveis', () => {
      render(<ComandasList {...defaultProps} comandas={[mockComandaAberta]} />);
      
      const comandaCard = screen.getByText('Comanda #101').closest('[data-slot="card"]');
      expect(comandaCard).toHaveClass('cursor-pointer');
      expect(comandaCard).toHaveClass('hover:border-primary');
    });
  });

  describe('Performance e casos extremos', () => {
    it('renderiza múltiplas comandas eficientemente', () => {
      const muitasComandas = Array.from({ length: 50 }, (_, i) => ({
        ...mockComandaAberta,
        id: `comanda-${i}`,
        number: 100 + i
      }));
      
      render(<ComandasList {...defaultProps} comandas={muitasComandas} />);
      
      expect(screen.getByText('50 comanda(s) ativa(s)')).toBeInTheDocument();
      expect(screen.getByText('Comanda #100')).toBeInTheDocument();
      expect(screen.getByText('Comanda #149')).toBeInTheDocument();
    });

    it('funciona com comandas sem itens', () => {
      const comandaSemItens: Comanda = {
        ...mockComandaAberta,
        items: []
      };
      
      render(<ComandasList {...defaultProps} comandas={[comandaSemItens]} />);
      
      expect(screen.getByText('0 item(ns)')).toBeInTheDocument();
      expect(screen.getByText('R$ 0.00')).toBeInTheDocument();
    });

    it('calcula total com valores decimais complexos', () => {
      const comandaComplexа: Comanda = {
        ...mockComandaAberta,
        items: [
          { product: { ...mockProduct, price: 12.99 }, quantity: 3 },
          { product: { ...mockProduct, price: 7.33 }, quantity: 2 }
        ]
      };
      
      render(<ComandasList {...defaultProps} comandas={[comandaComplexа]} />);
      
      // Total: (12.99 * 3) + (7.33 * 2) = 38.97 + 14.66 = 53.63
      expect(screen.getByText('R$ 53.63')).toBeInTheDocument();
    });
  });
});