import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductCatalog from '../components/ProductCatalog';
import { Product } from '@/types';

// Mock do AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1', email: 'test@test.com' }
  })
}));

// Mock do useProductsDB
const mockProducts: Product[] = [
  { id: '1', name: 'Cerveja Heineken', price: 8.50, stock: 50, category: 'bebidas', subcategory: 'cerveja' },
  { id: '2', name: 'Coca-Cola', price: 5.00, stock: 30, category: 'bebidas', subcategory: 'refrigerante' },
  { id: '3', name: 'Batata Frita', price: 15.90, stock: 20, category: 'porcoes', subcategory: 'frita' },
  { id: '4', name: 'Prato Executivo', price: 25.00, stock: 15, category: 'almoco', subcategory: 'executivo' },
  { id: '5', name: 'Whisky Premium', price: 45.00, stock: 10, category: 'bebidas', subcategory: 'drink' }
];

const mockUseProductsDB = {
  products: mockProducts,
  loading: false,
  addProduct: jest.fn(),
  updateProduct: jest.fn()
};

jest.mock('@/hooks/useProductsDB', () => ({
  useProductsDB: () => mockUseProductsDB
}));

describe('ProductCatalog', () => {
  const defaultProps = {
    onAddProduct: jest.fn(),
    currentView: 'catalog'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderização básica', () => {
    it('renderiza tabs de categorias corretamente', () => {
      render(<ProductCatalog {...defaultProps} />);
      
      expect(screen.getByRole('tab', { name: /bebidas/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /porções/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /almoço/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /outros/i })).toBeInTheDocument();
    });

    it('renderiza campo de busca', () => {
      render(<ProductCatalog {...defaultProps} />);
      
      expect(screen.getByPlaceholderText(/buscar produto\.\.\./i)).toBeInTheDocument();
    });
  });

  describe('Funcionalidade de busca', () => {
    it('filtra produtos por nome', async () => {
      render(<ProductCatalog {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText(/buscar produto\.\.\./i);
      await userEvent.type(searchInput, 'cerveja');
      
      expect(screen.getByText('Cerveja Heineken')).toBeInTheDocument();
      expect(screen.queryByText('Coca-Cola')).not.toBeInTheDocument();
    });

    it('busca é case-insensitive', async () => {
      render(<ProductCatalog {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText(/buscar produto\.\.\./i);
      await userEvent.type(searchInput, 'CERVEJA');
      
      expect(screen.getByText('Cerveja Heineken')).toBeInTheDocument();
    });

    it('mostra todos produtos de todas categorias na busca', async () => {
      render(<ProductCatalog {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText(/buscar produto\.\.\./i);
      await userEvent.type(searchInput, 'a'); // Letra que aparece em vários produtos
      
      // Deveria mostrar produtos de diferentes categorias
      expect(screen.getByText('Batata Frita')).toBeInTheDocument();
      expect(screen.getByText('Prato Executivo')).toBeInTheDocument();
    });

    it('limpa busca quando input é limpo', async () => {
      render(<ProductCatalog {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText(/buscar produto\.\.\./i);
      await userEvent.type(searchInput, 'cerveja');
      await userEvent.clear(searchInput);
      
      // Volta para a categoria padrão (bebidas)
      expect(screen.getByText('Cerveja Heineken')).toBeInTheDocument();
      expect(screen.getByText('Coca-Cola')).toBeInTheDocument();
    });
  });

  describe('Categorização por tabs', () => {
    it('filtra produtos por categoria bebidas', async () => {
      render(<ProductCatalog {...defaultProps} />);
      
      await userEvent.click(screen.getByRole('tab', { name: /bebidas/i }));
      
      expect(screen.getByText('Cerveja Heineken')).toBeInTheDocument();
      expect(screen.getByText('Coca-Cola')).toBeInTheDocument();
      expect(screen.getByText('Whisky Premium')).toBeInTheDocument();
      expect(screen.queryByText('Batata Frita')).not.toBeInTheDocument();
    });

    it('filtra produtos por categoria porções', async () => {
      render(<ProductCatalog {...defaultProps} />);
      
      await userEvent.click(screen.getByRole('tab', { name: /porções/i }));
      
      expect(screen.getByText('Batata Frita')).toBeInTheDocument();
      expect(screen.queryByText('Cerveja Heineken')).not.toBeInTheDocument();
    });

    it('filtra produtos por categoria almoço', async () => {
      render(<ProductCatalog {...defaultProps} />);
      
      await userEvent.click(screen.getByRole('tab', { name: /almoço/i }));
      
      expect(screen.getByText('Prato Executivo')).toBeInTheDocument();
      expect(screen.queryByText('Cerveja Heineken')).not.toBeInTheDocument();
    });
  });

  describe('Exibição de produtos', () => {
    it('exibe informações do produto corretamente', () => {
      render(<ProductCatalog {...defaultProps} />);
      
      expect(screen.getByText('Cerveja Heineken')).toBeInTheDocument();
      expect(screen.getByText('R$ 8.50')).toBeInTheDocument();
    });

    it('exibe mensagem adequada quando categoria está vazia', async () => {
      render(<ProductCatalog {...defaultProps} />);
      
      await userEvent.click(screen.getByRole('tab', { name: /outros/i }));
      
      // Categoria "outros" está vazia por padrão (produtos customizados)
      expect(screen.queryByText('Cerveja Heineken')).not.toBeInTheDocument();
    });
  });

  describe('Interações do usuário', () => {
    it('chama onAddProduct ao clicar no botão adicionar', async () => {
      const onAddProduct = jest.fn();
      render(<ProductCatalog {...defaultProps} onAddProduct={onAddProduct} />);
      
      // Busca o primeiro botão "Adicionar" (da Cerveja Heineken)
      const addButtons = screen.getAllByRole('button', { name: /adicionar/i });
      await userEvent.click(addButtons[0]);
      
      expect(onAddProduct).toHaveBeenCalledWith(mockProducts[0]);
    });

    it('durante busca, exibe resultados de todas as categorias', async () => {
      render(<ProductCatalog {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText(/buscar produto\.\.\./i);
      await userEvent.type(searchInput, 'a'); // Letra que aparece em vários produtos
      
      // Durante busca, as tabs ficam ocultas e mostra resultados globais
      expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
      expect(screen.getByText('Batata Frita')).toBeInTheDocument();
      expect(screen.getByText('Prato Executivo')).toBeInTheDocument();
    });
  });

  describe('Acessibilidade', () => {
    it('possui estrutura de tabs acessível', () => {
      render(<ProductCatalog {...defaultProps} />);
      
      const tabList = screen.getByRole('tablist');
      expect(tabList).toBeInTheDocument();
      
      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(4);
      expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    });

    it('input de busca possui label adequado', () => {
      render(<ProductCatalog {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText(/buscar produto\.\.\./i);
      expect(searchInput).toHaveAttribute('type', 'text');
      expect(searchInput).toHaveAttribute('placeholder', 'Buscar produto...');
    });

    it('produtos são clicáveis e identificáveis', () => {
      render(<ProductCatalog {...defaultProps} />);
      
      const cerveja = screen.getByText('Cerveja Heineken');
      expect(cerveja.closest('[data-slot="card"]')).toBeInTheDocument();
    });
  });

  describe('Performance e casos extremos', () => {
    it('renderiza muitos produtos eficientemente', () => {
      const muitosProdutos = Array.from({ length: 100 }, (_, i) => ({
        id: `prod-${i}`,
        name: `Produto ${i}`,
        price: 10 + i,
        stock: 50,
        category: 'bebidas' as const,
        subcategory: 'cerveja'
      }));
      
      mockUseProductsDB.products = muitosProdutos;
      
      render(<ProductCatalog {...defaultProps} />);
      
      expect(screen.getByText('Produto 0')).toBeInTheDocument();
      expect(screen.getByText('Produto 99')).toBeInTheDocument();
    });

    it('funciona com produtos sem subcategoria', () => {
      const produtoSemSubcat = {
        id: 'sem-sub',
        name: 'Produto Sem Subcategoria',
        price: 15.00,
        stock: 10,
        category: 'bebidas' as const
      };
      
      mockUseProductsDB.products = [produtoSemSubcat];
      
      render(<ProductCatalog {...defaultProps} />);
      
      expect(screen.getByText('Produto Sem Subcategoria')).toBeInTheDocument();
      expect(screen.getByText('R$ 15.00')).toBeInTheDocument();
    });

    it('busca funciona com caracteres especiais', async () => {
      const produtoEspecial = {
        id: 'especial',
        name: 'Açaí & Café',
        price: 12.50,
        stock: 20,
        category: 'bebidas' as const
      };
      
      mockUseProductsDB.products = [produtoEspecial];
      
      render(<ProductCatalog {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText(/buscar produto\.\.\./i);
      await userEvent.type(searchInput, 'açaí');
      
      expect(screen.getByText('Açaí & Café')).toBeInTheDocument();
    });

    it('busca com texto vazio retorna à visualização por categoria', async () => {
      mockUseProductsDB.products = mockProducts;
      
      render(<ProductCatalog {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText(/buscar produto\.\.\./i);
      await userEvent.type(searchInput, 'test');
      await userEvent.clear(searchInput);
      
      // Volta para categoria bebidas (padrão)
      expect(screen.getByText('Cerveja Heineken')).toBeInTheDocument();
      expect(screen.getByText('Coca-Cola')).toBeInTheDocument();
      expect(screen.queryByText('Batata Frita')).not.toBeInTheDocument();
    });
  });

  afterEach(() => {
    // Reset mock data após cada teste
    mockUseProductsDB.products = mockProducts;
  });
});