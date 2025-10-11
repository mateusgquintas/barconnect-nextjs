import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Inventory } from '@/components/Inventory';

// Mock do hook de produtos para controlar cenários
jest.mock('@/hooks/useProductsDB', () => ({
  useProductsDB: jest.fn(),
}));

const mockUseProductsDB = require('@/hooks/useProductsDB').useProductsDB as jest.Mock;

function setupMock({ products = [], loading = false }: { products?: any[]; loading?: boolean }) {
  mockUseProductsDB.mockReturnValue({
    products,
    loading,
    updateStock: jest.fn(),
    addProduct: jest.fn(),
    updateProduct: jest.fn(),
    refetch: jest.fn(),
  });
}

describe('Inventory accessibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza heading principal e busca acessível', () => {
    setupMock({ products: [], loading: false });
    render(<Inventory />);
    const heading = screen.getByRole('heading', { name: /estoque/i });
    expect(heading).toBeInTheDocument();
    const search = screen.getByRole('textbox', { name: /buscar produtos/i });
    expect(search).toBeInTheDocument();
    const addButton = screen.getByRole('button', { name: /adicionar novo produto/i });
    expect(addButton).toBeInTheDocument();
  });

  it('exibe estado vazio acessível quando não há produtos', () => {
    setupMock({ products: [], loading: false });
    render(<Inventory />);
    const region = screen.getByRole('region', { name: /tabela de produtos/i });
    expect(region).toBeInTheDocument();
    const status = within(region).getByRole('status');
    expect(status).toHaveTextContent(/nenhum produto encontrado/i);
  });

  it('exibe estado de carregamento acessível', () => {
    setupMock({ products: [], loading: true });
    render(<Inventory />);
    const region = screen.getByRole('region', { name: /tabela de produtos/i });
    const status = within(region).getByRole('status');
    expect(status).toHaveTextContent(/carregando produtos/i);
  });

  it('renderiza tabela com linhas e botões de ação acessíveis', () => {
    setupMock({
      products: [
        { id: '1', name: 'Cerveja', price: 10, stock: 5, category: 'bebidas' },
        { id: '2', name: 'Suco', price: 8, stock: 100, category: 'bebidas' },
      ],
      loading: false,
    });
    render(<Inventory />);
    const region = screen.getByRole('region', { name: /tabela de produtos/i });
    const rows = within(region).getAllByRole('row');
    // 1 header + 2 produtos
    expect(rows.length).toBeGreaterThanOrEqual(3);
    // Checa botões de ação de primeira linha de dados
    const infoButton = screen.getByRole('button', { name: /informações do produto cerveja/i });
    const editButton = screen.getByRole('button', { name: /editar produto cerveja/i });
    expect(infoButton).toBeInTheDocument();
    expect(editButton).toBeInTheDocument();
  });

  it('mostra alerta de estoque crítico quando há produtos críticos', () => {
    setupMock({
      products: [
        { id: '1', name: 'Cerveja', price: 10, stock: 5, category: 'bebidas' },
        { id: '2', name: 'Suco', price: 8, stock: 100, category: 'bebidas' },
      ],
      loading: false,
    });
    render(<Inventory />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(/estoque crítico/i);
  });
});
