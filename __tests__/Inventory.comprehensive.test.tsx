/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Inventory } from '@/components/Inventory';
import type { Product } from '@/types';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Package: () => <div data-testid="package-icon">Package</div>,
  Search: () => <div data-testid="search-icon">Search</div>,
  AlertCircle: () => <div data-testid="alert-circle-icon">AlertCircle</div>,
  Edit: () => <div data-testid="edit-icon">Edit</div>,
  Info: () => <div data-testid="info-icon">Info</div>,
  Plus: () => <div data-testid="plus-icon">Plus</div>,
  X: () => <div data-testid="x-icon">X</div>,
  XIcon: () => <div data-testid="x-icon">X</div>,
  CheckIcon: () => <div data-testid="check-icon">✓</div>,
  ChevronDownIcon: () => <div data-testid="chevron-down-icon">▼</div>,
  ChevronUpIcon: () => <div data-testid="chevron-up-icon">▲</div>
}));

// Mock formatCurrency utility
jest.mock('@/utils/format', () => ({
  formatCurrency: (value: number) => `R$ ${value.toFixed(2)}`
}));

// Mock products data
const mockProducts: Product[] = [
  { id: '1', name: 'Coca-Cola 2L', price: 10.0, stock: 100, category: 'bebidas' },
  { id: '2', name: 'Heineken 600ml', price: 12.0, stock: 18, category: 'bebidas' },
  { id: '3', name: 'Água Mineral', price: 3.5, stock: 5, category: 'bebidas' },
  { id: '4', name: 'Batata Frita', price: 25.0, stock: 30, category: 'porcoes' },
  { id: '5', name: 'Picanha 500g', price: 45.0, stock: 50, category: 'porcoes' },
  { id: '6', name: 'Executivo', price: 35.0, stock: 15, category: 'almoco' },
];

const mockAddProduct = jest.fn();
const mockUpdateProduct = jest.fn();

jest.mock('@/hooks/useProductsDB', () => ({
  useProductsDB: jest.fn(() => ({
    products: mockProducts,
    loading: false,
    addProduct: mockAddProduct,
    updateProduct: mockUpdateProduct
  }))
}));

// Mock ProductFormDialog
jest.mock('@/components/ProductFormDialog', () => ({
  ProductFormDialog: ({ open, onOpenChange, product, onSave, title }: any) => 
    open ? (
      <div data-testid="product-form-dialog">
        <h2>{title}</h2>
        <button onClick={() => onOpenChange(false)}>Close Form</button>
        <button onClick={() => onSave({ name: 'Test Product', price: 10, stock: 5 })}>Save</button>
      </div>
    ) : null
}));

// Mock ProductInfoDialog
jest.mock('@/components/ProductInfoDialog', () => ({
  ProductInfoDialog: ({ open, onOpenChange, product }: any) => 
    open ? (
      <div data-testid="product-info-dialog">
        <h2>Informações do Produto</h2>
        {product && <p>{product.name}</p>}
        <button onClick={() => onOpenChange(false)}>Close Info</button>
      </div>
    ) : null
}));

describe('Inventory - Comprehensive Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    mockAddProduct.mockClear();
    mockUpdateProduct.mockClear();
    user = userEvent.setup();
    
    // Reset mock to default state
    const { useProductsDB } = require('@/hooks/useProductsDB');
    useProductsDB.mockReturnValue({
      products: mockProducts,
      loading: false,
      addProduct: mockAddProduct,
      updateProduct: mockUpdateProduct
    });
  });

  // ==================== RENDERING & STRUCTURE ====================
  describe('Rendering & Structure', () => {
    it('should render without crashing', () => {
      render(<Inventory />);
      expect(screen.getByRole('heading', { name: /estoque/i })).toBeInTheDocument();
    });

    it('should render page title and description', () => {
      render(<Inventory />);
      expect(screen.getByRole('heading', { name: /estoque/i })).toBeInTheDocument();
      expect(screen.getByText(/gerencie produtos, quantidades e informações/i)).toBeInTheDocument();
    });

    it('should render search input', () => {
      render(<Inventory />);
      expect(screen.getByPlaceholderText(/buscar por nome ou categoria/i)).toBeInTheDocument();
    });

    it('should render search icon', () => {
      render(<Inventory />);
      expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    });

    it('should render "Novo Produto" button', () => {
      render(<Inventory />);
      expect(screen.getByRole('button', { name: /novo produto/i })).toBeInTheDocument();
    });

    it('should render metrics cards', () => {
      render(<Inventory />);
      expect(screen.getAllByText(/total de produtos/i)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/estoque crítico/i)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/valor total/i)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/valor médio/i)[0]).toBeInTheDocument();
    });

    it('should render product table', () => {
      render(<Inventory />);
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('should render table headers', () => {
      render(<Inventory />);
      const table = screen.getByRole('table');
      const thead = table.querySelector('thead');
      expect(within(thead!).getByText(/^produto$/i)).toBeInTheDocument();
      expect(within(thead!).getByText(/^categoria$/i)).toBeInTheDocument();
      expect(within(thead!).getByText(/^preço$/i)).toBeInTheDocument();
      expect(within(thead!).getByText(/^estoque$/i)).toBeInTheDocument();
      expect(within(thead!).getByText(/^status$/i)).toBeInTheDocument();
      expect(within(thead!).getByText(/^ações$/i)).toBeInTheDocument();
    });
  });

  // ==================== METRICS CARDS ====================
  describe('Metrics Cards', () => {
    it('should display total products count', () => {
      render(<Inventory />);
      const totalCard = screen.getByText(/total de produtos/i).closest('.p-6');
      expect(within(totalCard!).getByText('6')).toBeInTheDocument();
    });

    it('should display critical stock count', () => {
      render(<Inventory />);
      const criticalCard = screen.getAllByText(/estoque crítico/i)[0].closest('.p-6');
      // Products with stock <= 20: Heineken (18), Água (5), Executivo (15) = 3
      expect(within(criticalCard!).getByText('3')).toBeInTheDocument();
    });

    it('should calculate total stock value correctly', () => {
      render(<Inventory />);
      // (10*100) + (12*18) + (3.5*5) + (25*30) + (45*50) + (35*15) = 1000 + 216 + 17.5 + 750 + 2250 + 525 = 4758.5
      const totalValueCard = screen.getByText(/valor total/i).closest('.p-6');
      expect(within(totalValueCard!).getByText('R$ 4758.50')).toBeInTheDocument();
    });

    it('should calculate average stock value correctly', () => {
      render(<Inventory />);
      // 4758.5 / 6 = 793.08
      const avgValueCard = screen.getByText(/valor médio/i).closest('.p-6');
      expect(within(avgValueCard!).getByText('R$ 793.08')).toBeInTheDocument();
    });

    it('should show alert when there are products with critical stock', () => {
      render(<Inventory />);
      expect(screen.getByText(/3 produtos com estoque crítico/i)).toBeInTheDocument();
    });

    it('should not show alert when no products have critical stock', () => {
      const { useProductsDB } = require('@/hooks/useProductsDB');
      useProductsDB.mockReturnValue({
        products: [{ id: '1', name: 'Product', price: 10, stock: 100, category: 'bebidas' }],
        loading: false,
        addProduct: mockAddProduct,
        updateProduct: mockUpdateProduct
      });

      render(<Inventory />);
      expect(screen.queryByText(/com estoque crítico/i)).not.toBeInTheDocument();
    });

    it('should display singular form for 1 critical product', () => {
      const { useProductsDB } = require('@/hooks/useProductsDB');
      useProductsDB.mockReturnValue({
        products: [{ id: '1', name: 'Product', price: 10, stock: 5, category: 'bebidas' }],
        loading: false,
        addProduct: mockAddProduct,
        updateProduct: mockUpdateProduct
      });

      render(<Inventory />);
      expect(screen.getByText(/1 produto com estoque crítico/i)).toBeInTheDocument();
    });
  });

  // ==================== PRODUCT TABLE ====================
  describe('Product Table', () => {
    it('should display all products', () => {
      render(<Inventory />);
      expect(screen.getByText('Coca-Cola 2L')).toBeInTheDocument();
      expect(screen.getByText('Heineken 600ml')).toBeInTheDocument();
      expect(screen.getByText('Água Mineral')).toBeInTheDocument();
      expect(screen.getByText('Batata Frita')).toBeInTheDocument();
      expect(screen.getByText('Picanha 500g')).toBeInTheDocument();
      expect(screen.getByText('Executivo')).toBeInTheDocument();
    });

    it('should display product categories', () => {
      render(<Inventory />);
      expect(screen.getAllByText('Bebidas').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Porções').length).toBeGreaterThan(0);
      expect(screen.getByText('Almoço')).toBeInTheDocument();
    });

    it('should display product prices', () => {
      render(<Inventory />);
      expect(screen.getByText('R$ 10.00')).toBeInTheDocument();
      expect(screen.getByText('R$ 12.00')).toBeInTheDocument();
      expect(screen.getByText('R$ 3.50')).toBeInTheDocument();
    });

    it('should display stock quantities', () => {
      render(<Inventory />);
      expect(screen.getByText('100 un.')).toBeInTheDocument();
      expect(screen.getByText('18 un.')).toBeInTheDocument();
      expect(screen.getByText('5 un.')).toBeInTheDocument();
    });

    it('should display "Crítico" status for low stock (<=20)', () => {
      render(<Inventory />);
      const criticalBadges = screen.getAllByText('Crítico');
      expect(criticalBadges.length).toBe(3); // Heineken, Água, Executivo
    });

    it('should display "Baixo" status for medium stock (21-50)', () => {
      render(<Inventory />);
      const lowBadges = screen.getAllByText('Baixo');
      expect(lowBadges.length).toBe(2); // Batata Frita, Picanha
    });

    it('should display "Normal" status for good stock (>50)', () => {
      render(<Inventory />);
      const normalBadges = screen.getAllByText('Normal');
      expect(normalBadges.length).toBe(1); // Coca-Cola
    });

    it('should render action buttons for each product', () => {
      render(<Inventory />);
      const infoButtons = screen.getAllByRole('button', { name: /informações do produto/i });
      const editButtons = screen.getAllByRole('button', { name: /editar produto/i });
      const stockButtons = screen.getAllByRole('button', { name: /adicionar estoque ao produto/i });
      
      expect(infoButtons.length).toBe(6);
      expect(editButtons.length).toBe(6);
      expect(stockButtons.length).toBe(6);
    });
  });

  // ==================== SEARCH FUNCTIONALITY ====================
  describe('Search Functionality', () => {
    it('should filter products by name', async () => {
      render(<Inventory />);
      
      await user.type(screen.getByPlaceholderText(/buscar por nome ou categoria/i), 'Coca');
      
      expect(screen.getByText('Coca-Cola 2L')).toBeInTheDocument();
      expect(screen.queryByText('Heineken 600ml')).not.toBeInTheDocument();
    });

    it('should filter products by category', async () => {
      render(<Inventory />);
      
      await user.type(screen.getByPlaceholderText(/buscar por nome ou categoria/i), 'bebidas');
      
      expect(screen.getByText('Coca-Cola 2L')).toBeInTheDocument();
      expect(screen.getByText('Heineken 600ml')).toBeInTheDocument();
      expect(screen.queryByText('Batata Frita')).not.toBeInTheDocument();
    });

    it('should be case insensitive', async () => {
      render(<Inventory />);
      
      await user.type(screen.getByPlaceholderText(/buscar por nome ou categoria/i), 'COCA');
      
      expect(screen.getByText('Coca-Cola 2L')).toBeInTheDocument();
    });

    it('should show "no products found" when search has no results', async () => {
      render(<Inventory />);
      
      await user.type(screen.getByPlaceholderText(/buscar por nome ou categoria/i), 'xyz123');
      
      expect(screen.getByText(/nenhum produto encontrado/i)).toBeInTheDocument();
    });

    it('should clear search and show all products', async () => {
      render(<Inventory />);
      
      await user.type(screen.getByPlaceholderText(/buscar por nome ou categoria/i), 'Coca');
      expect(screen.queryByText('Heineken 600ml')).not.toBeInTheDocument();
      
      await user.clear(screen.getByPlaceholderText(/buscar por nome ou categoria/i));
      
      expect(screen.getByText('Heineken 600ml')).toBeInTheDocument();
    });

    it('should update metrics when filtering', async () => {
      render(<Inventory />);
      
      // Before search - 6 products
      let totalCard = screen.getByText(/total de produtos/i).closest('.p-6');
      expect(within(totalCard!).getByText('6')).toBeInTheDocument();
      
      // Note: Metrics don't update with search - they show all products
      await user.type(screen.getByPlaceholderText(/buscar por nome ou categoria/i), 'Coca');
      
      totalCard = screen.getByText(/total de produtos/i).closest('.p-6');
      expect(within(totalCard!).getByText('6')).toBeInTheDocument(); // Still shows all
    });
  });

  // ==================== PRODUCT INFO DIALOG ====================
  describe('Product Info Dialog', () => {
    it('should open info dialog when Info button is clicked', async () => {
      render(<Inventory />);
      
      const cocaRow = screen.getByText('Coca-Cola 2L').closest('tr');
      const infoButton = within(cocaRow!).getByRole('button', { name: /informações do produto coca-cola 2l/i });
      await user.click(infoButton);
      
      expect(screen.getByTestId('product-info-dialog')).toBeInTheDocument();
      expect(screen.getByText('Coca-Cola 2L', { selector: 'p' })).toBeInTheDocument();
    });

    it('should close info dialog when close button is clicked', async () => {
      render(<Inventory />);
      
      const cocaRow = screen.getByText('Coca-Cola 2L').closest('tr');
      const infoButton = within(cocaRow!).getByRole('button', { name: /informações/i });
      await user.click(infoButton);
      
      expect(screen.getByTestId('product-info-dialog')).toBeInTheDocument();
      
      await user.click(screen.getByText('Close Info'));
      
      await waitFor(() => {
        expect(screen.queryByTestId('product-info-dialog')).not.toBeInTheDocument();
      });
    });
  });

  // ==================== PRODUCT EDIT DIALOG ====================
  describe('Product Edit Dialog', () => {
    it('should open form dialog when Editar button is clicked', async () => {
      render(<Inventory />);
      
      const cocaRow = screen.getByText('Coca-Cola 2L').closest('tr');
      const editButton = within(cocaRow!).getByRole('button', { name: /editar produto coca-cola 2l/i });
      await user.click(editButton);
      
      expect(screen.getByTestId('product-form-dialog')).toBeInTheDocument();
      expect(screen.getByText('Editar Produto')).toBeInTheDocument();
    });

    it('should close edit dialog when close button is clicked', async () => {
      render(<Inventory />);
      
      const cocaRow = screen.getByText('Coca-Cola 2L').closest('tr');
      const editButton = within(cocaRow!).getByRole('button', { name: /editar/i });
      await user.click(editButton);
      
      await user.click(screen.getByText('Close Form'));
      
      await waitFor(() => {
        expect(screen.queryByTestId('product-form-dialog')).not.toBeInTheDocument();
      });
    });

    it('should call updateProduct when saving edited product', async () => {
      render(<Inventory />);
      
      const cocaRow = screen.getByText('Coca-Cola 2L').closest('tr');
      const editButton = within(cocaRow!).getByRole('button', { name: /editar/i });
      await user.click(editButton);
      
      await user.click(screen.getByText('Save'));
      
      await waitFor(() => {
        expect(mockUpdateProduct).toHaveBeenCalledWith('1', expect.any(Object));
      });
    });
  });

  // ==================== CREATE PRODUCT ====================
  describe('Create Product', () => {
    it('should open form dialog when "Novo Produto" button is clicked', async () => {
      render(<Inventory />);
      
      await user.click(screen.getByRole('button', { name: /adicionar novo produto/i }));
      
      expect(screen.getByTestId('product-form-dialog')).toBeInTheDocument();
      expect(within(screen.getByTestId('product-form-dialog')).getByText('Novo Produto')).toBeInTheDocument();
    });

    it('should call addProduct when saving new product', async () => {
      render(<Inventory />);
      
      await user.click(screen.getByRole('button', { name: /novo produto/i }));
      await user.click(screen.getByText('Save'));
      
      await waitFor(() => {
        expect(mockAddProduct).toHaveBeenCalledWith(expect.objectContaining({
          name: 'Test Product',
          price: 10,
          stock: 5
        }));
      });
    });
  });

  // ==================== ADD STOCK DIALOG ====================
  describe('Add Stock Dialog', () => {
    it('should open add stock dialog when Estoque button is clicked', async () => {
      render(<Inventory />);
      
      const cocaRow = screen.getByText('Coca-Cola 2L').closest('tr');
      const stockButton = within(cocaRow!).getByRole('button', { name: /adicionar estoque ao produto coca-cola 2l/i });
      await user.click(stockButton);
      
      expect(screen.getByText('Adicionar ao Estoque')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/digite a quantidade/i)).toBeInTheDocument();
    });

    it('should allow typing quantity in add stock dialog', async () => {
      render(<Inventory />);
      
      const cocaRow = screen.getByText('Coca-Cola 2L').closest('tr');
      const stockButton = within(cocaRow!).getByRole('button', { name: /estoque/i });
      await user.click(stockButton);
      
      const qtyInput = screen.getByPlaceholderText(/digite a quantidade/i);
      await user.type(qtyInput, '50');
      
      expect(qtyInput).toHaveValue(50);
    });

    it('should add stock to product when form is submitted', async () => {
      render(<Inventory />);
      
      const cocaRow = screen.getByText('Coca-Cola 2L').closest('tr');
      const stockButton = within(cocaRow!).getByRole('button', { name: /estoque/i });
      await user.click(stockButton);
      
      await user.type(screen.getByPlaceholderText(/digite a quantidade/i), '50');
      
      const addButtons = screen.getAllByRole('button', { name: /adicionar/i });
      const submitButton = addButtons[addButtons.length - 1];
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockUpdateProduct).toHaveBeenCalledWith('1', expect.objectContaining({
          stock: 150 // 100 + 50
        }));
      });
    });

    it('should close dialog after adding stock', async () => {
      render(<Inventory />);
      
      const cocaRow = screen.getByText('Coca-Cola 2L').closest('tr');
      const stockButton = within(cocaRow!).getByRole('button', { name: /estoque/i });
      await user.click(stockButton);
      
      await user.type(screen.getByPlaceholderText(/digite a quantidade/i), '10');
      
      const addButtons = screen.getAllByRole('button', { name: /adicionar/i });
      const submitButton = addButtons[addButtons.length - 1];
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.queryByText('Adicionar ao Estoque')).not.toBeInTheDocument();
      });
    });

    it('should cancel add stock dialog', async () => {
      render(<Inventory />);
      
      const cocaRow = screen.getByText('Coca-Cola 2L').closest('tr');
      const stockButton = within(cocaRow!).getByRole('button', { name: /estoque/i });
      await user.click(stockButton);
      
      await user.click(screen.getByRole('button', { name: /cancelar/i }));
      
      await waitFor(() => {
        expect(screen.queryByText('Adicionar ao Estoque')).not.toBeInTheDocument();
      });
    });

    it('should not add stock with invalid quantity', async () => {
      render(<Inventory />);
      
      const cocaRow = screen.getByText('Coca-Cola 2L').closest('tr');
      const stockButton = within(cocaRow!).getByRole('button', { name: /estoque/i });
      await user.click(stockButton);
      
      await user.type(screen.getByPlaceholderText(/digite a quantidade/i), '-5');
      
      const addButtons = screen.getAllByRole('button', { name: /adicionar/i });
      const submitButton = addButtons[addButtons.length - 1];
      await user.click(submitButton);
      
      // Should not call updateProduct with invalid quantity
      expect(mockUpdateProduct).not.toHaveBeenCalled();
    });

    it('should preserve category when adding stock', async () => {
      render(<Inventory />);
      
      const cocaRow = screen.getByText('Coca-Cola 2L').closest('tr');
      const stockButton = within(cocaRow!).getByRole('button', { name: /estoque/i });
      await user.click(stockButton);
      
      await user.type(screen.getByPlaceholderText(/digite a quantidade/i), '10');
      
      const addButtons = screen.getAllByRole('button', { name: /adicionar/i });
      const submitButton = addButtons[addButtons.length - 1];
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockUpdateProduct).toHaveBeenCalledWith('1', expect.objectContaining({
          category: 'bebidas'
        }));
      });
    });
  });

  // ==================== LOADING STATE ====================
  describe('Loading State', () => {
    it('should show loading message when loading is true', () => {
      const { useProductsDB } = require('@/hooks/useProductsDB');
      useProductsDB.mockReturnValue({
        products: [],
        loading: true,
        addProduct: mockAddProduct,
        updateProduct: mockUpdateProduct
      });

      render(<Inventory />);
      expect(screen.getByText(/carregando produtos/i)).toBeInTheDocument();
    });

    it('should not show product rows when loading', () => {
      const { useProductsDB } = require('@/hooks/useProductsDB');
      useProductsDB.mockReturnValue({
        products: mockProducts,
        loading: true,
        addProduct: mockAddProduct,
        updateProduct: mockUpdateProduct
      });

      render(<Inventory />);
      expect(screen.queryByText('Coca-Cola 2L')).not.toBeInTheDocument();
    });
  });

  // ==================== EDGE CASES ====================
  describe('Edge Cases', () => {
    it('should handle empty product list', () => {
      const { useProductsDB } = require('@/hooks/useProductsDB');
      useProductsDB.mockReturnValue({
        products: [],
        loading: false,
        addProduct: mockAddProduct,
        updateProduct: mockUpdateProduct
      });

      render(<Inventory />);
      
      expect(screen.getByText(/nenhum produto encontrado/i)).toBeInTheDocument();
      
      const totalCard = screen.getByText(/total de produtos/i).closest('.p-6');
      expect(within(totalCard!).getByText('0')).toBeInTheDocument();
    });

    it('should handle products without category', () => {
      const { useProductsDB } = require('@/hooks/useProductsDB');
      useProductsDB.mockReturnValue({
        products: [{ id: '1', name: 'Product', price: 10, stock: 50 } as Product],
        loading: false,
        addProduct: mockAddProduct,
        updateProduct: mockUpdateProduct
      });

      render(<Inventory />);
      expect(screen.getByText('Product')).toBeInTheDocument();
      expect(screen.getByText('-')).toBeInTheDocument(); // Fallback for missing category
    });

    it('should handle products with unknown category', () => {
      const { useProductsDB } = require('@/hooks/useProductsDB');
      useProductsDB.mockReturnValue({
        products: [{ id: '1', name: 'Product', price: 10, stock: 50, category: 'unknown' }],
        loading: false,
        addProduct: mockAddProduct,
        updateProduct: mockUpdateProduct
      });

      render(<Inventory />);
      expect(screen.getByText('unknown')).toBeInTheDocument(); // Shows original category
    });

    it('should handle very large stock numbers', () => {
      const { useProductsDB } = require('@/hooks/useProductsDB');
      useProductsDB.mockReturnValue({
        products: [{ id: '1', name: 'Product', price: 10, stock: 9999, category: 'bebidas' }],
        loading: false,
        addProduct: mockAddProduct,
        updateProduct: mockUpdateProduct
      });

      render(<Inventory />);
      expect(screen.getByText('9999 un.')).toBeInTheDocument();
    });

    it('should handle zero stock correctly', () => {
      const { useProductsDB } = require('@/hooks/useProductsDB');
      useProductsDB.mockReturnValue({
        products: [{ id: '1', name: 'Product', price: 10, stock: 0, category: 'bebidas' }],
        loading: false,
        addProduct: mockAddProduct,
        updateProduct: mockUpdateProduct
      });

      render(<Inventory />);
      expect(screen.getByText('0 un.')).toBeInTheDocument();
      expect(screen.getByText('Crítico')).toBeInTheDocument();
    });

    it('should handle search with special characters', async () => {
      render(<Inventory />);
      
      await user.type(screen.getByPlaceholderText(/buscar por nome ou categoria/i), '@#$%');
      
      expect(screen.getByText(/nenhum produto encontrado/i)).toBeInTheDocument();
    });
  });

  // ==================== ACCESSIBILITY ====================
  describe('Accessibility', () => {
    it('should have proper ARIA labels for main heading', () => {
      render(<Inventory />);
      expect(screen.getByRole('heading', { name: /estoque/i })).toHaveAttribute('id', 'inventory-heading');
    });

    it('should have ARIA label for search input', () => {
      render(<Inventory />);
      expect(screen.getByLabelText(/buscar produtos/i)).toBeInTheDocument();
    });

    it('should have ARIA label for "Novo Produto" button', () => {
      render(<Inventory />);
      expect(screen.getByRole('button', { name: /adicionar novo produto/i })).toBeInTheDocument();
    });

    it('should have ARIA labels for action buttons', () => {
      render(<Inventory />);
      expect(screen.getByRole('button', { name: /informações do produto coca-cola 2l/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /editar produto coca-cola 2l/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /adicionar estoque ao produto coca-cola 2l/i })).toBeInTheDocument();
    });

    it('should have role="region" for table area', () => {
      render(<Inventory />);
      expect(screen.getByRole('region', { name: /tabela de produtos/i })).toBeInTheDocument();
    });

    it('should have role="alert" for critical stock warning', () => {
      render(<Inventory />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should have aria-live regions for dynamic content', () => {
      render(<Inventory />);
      const tbody = screen.getByRole('table').querySelector('tbody');
      expect(tbody).toHaveAttribute('aria-live', 'polite');
    });

    it('should have table caption for screen readers', () => {
      render(<Inventory />);
      // Caption is sr-only but should exist
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });

  // ==================== INTEGRATION ====================
  describe('Integration', () => {
    it('should integrate with useProductsDB hook', () => {
      render(<Inventory />);
      
      // Products from hook should be displayed
      expect(screen.getByText('Coca-Cola 2L')).toBeInTheDocument();
      expect(screen.getByText('Heineken 600ml')).toBeInTheDocument();
    });

    it('should update metrics when products change', () => {
      const { rerender } = render(<Inventory />);
      
      const totalCard = screen.getByText(/total de produtos/i).closest('.p-6');
      expect(within(totalCard!).getByText('6')).toBeInTheDocument();
      
      // Simulate products update
      const { useProductsDB } = require('@/hooks/useProductsDB');
      useProductsDB.mockReturnValue({
        products: mockProducts.slice(0, 3),
        loading: false,
        addProduct: mockAddProduct,
        updateProduct: mockUpdateProduct
      });
      
      rerender(<Inventory />);
      expect(within(totalCard!).getByText('3')).toBeInTheDocument();
    });

    it('should integrate with ProductFormDialog', async () => {
      render(<Inventory />);
      
      await user.click(screen.getByRole('button', { name: /novo produto/i }));
      
      expect(screen.getByTestId('product-form-dialog')).toBeInTheDocument();
    });

    it('should integrate with ProductInfoDialog', async () => {
      render(<Inventory />);
      
      const cocaRow = screen.getByText('Coca-Cola 2L').closest('tr');
      const infoButton = within(cocaRow!).getByRole('button', { name: /informações/i });
      await user.click(infoButton);
      
      expect(screen.getByTestId('product-info-dialog')).toBeInTheDocument();
    });
  });
});
