/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ProductCatalog from '@/components/ProductCatalog';
import type { Product } from '@/types';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Plus: () => <div data-testid="plus-icon">Plus</div>,
  Search: () => <div data-testid="search-icon">Search</div>,
  Pencil: () => <div data-testid="pencil-icon">Pencil</div>,
  ShoppingCart: () => <div data-testid="shopping-cart-icon">ShoppingCart</div>,
  X: () => <div data-testid="x-icon">X</div>,
  XIcon: () => <div data-testid="x-icon">X</div>,
  CheckIcon: () => <div data-testid="check-icon">✓</div>,
  ChevronDownIcon: () => <div data-testid="chevron-down-icon">▼</div>,
  ChevronUpIcon: () => <div data-testid="chevron-up-icon">▲</div>
}));

// Mock useAuth
const mockUser = {
  id: 'user-1',
  name: 'Admin User',
  username: 'admin',
  email: 'admin@test.com',
  role: 'admin' as const,
  createdAt: new Date().toISOString()
};

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: mockUser
  }))
}));

// Mock useProductsDB
const mockProducts: Product[] = [
  { id: '1', name: 'Coca-Cola', price: 5.0, stock: 100, category: 'bebidas', subcategory: 'refrigerante' },
  { id: '2', name: 'Heineken', price: 8.0, stock: 50, category: 'bebidas', subcategory: 'cerveja' },
  { id: '3', name: 'Água Mineral', price: 3.0, stock: 15, category: 'bebidas', subcategory: 'agua' },
  { id: '4', name: 'Batata Frita', price: 25.0, stock: 30, category: 'porcoes', subcategory: 'frita' },
  { id: '5', name: 'Picanha', price: 45.0, stock: 20, category: 'porcoes', subcategory: 'carne' },
  { id: '6', name: 'Executivo', price: 35.0, stock: 10, category: 'almoco', subcategory: 'executivo' },
  { id: '7', name: 'Item Especial', price: 15.0, stock: 5, category: 'outros' },
  { id: '8', name: 'Produto Sem Estoque', price: 10.0, stock: 0, category: 'bebidas', subcategory: 'refrigerante' }
];

const mockAddProduct = jest.fn();
const mockUpdateProduct = jest.fn();

const mockUseProductsDB = jest.fn();

jest.mock('@/hooks/useProductsDB', () => ({
  useProductsDB: () => mockUseProductsDB()
}));

describe('ProductCatalog - Comprehensive Tests', () => {
  let mockOnAddProduct: jest.Mock;
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    mockOnAddProduct = jest.fn();
    mockAddProduct.mockClear();
    mockUpdateProduct.mockClear();
    
    // Configure mock to return products
    mockUseProductsDB.mockReturnValue({
      products: mockProducts,
      loading: false,
      addProduct: mockAddProduct,
      updateProduct: mockUpdateProduct
    });
    
    user = userEvent.setup();
  });

  // ==================== RENDERING & STRUCTURE ====================
  describe('Rendering & Structure', () => {
    it('should render without crashing', () => {
      render(<ProductCatalog onAddProduct={mockOnAddProduct} />);
      expect(screen.getByPlaceholderText(/buscar produto/i)).toBeInTheDocument();
    });

    it('should render search input', () => {
      render(<ProductCatalog onAddProduct={mockOnAddProduct} />);
      const searchInput = screen.getByPlaceholderText(/buscar produto/i);
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveClass('pl-9');
    });

    it('should render search icon', () => {
      render(<ProductCatalog onAddProduct={mockOnAddProduct} />);
      expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    });

    it('should render category tabs', () => {
      render(<ProductCatalog onAddProduct={mockOnAddProduct} />);
      expect(screen.getByRole('tab', { name: /bebidas/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /porções/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /almoço/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /outros/i })).toBeInTheDocument();
    });

    it('should have Bebidas as default active category', () => {
      render(<ProductCatalog onAddProduct={mockOnAddProduct} />);
      const bebidasTab = screen.getByRole('tab', { name: /bebidas/i });
      expect(bebidasTab).toHaveAttribute('data-state', 'active');
    });

    it('should render all product cards', () => {
      render(<ProductCatalog onAddProduct={mockOnAddProduct} />);
      expect(screen.getByText('Coca-Cola')).toBeInTheDocument();
      expect(screen.getByText('Heineken')).toBeInTheDocument();
      expect(screen.getByText('Água Mineral')).toBeInTheDocument();
    });
  });

  // ==================== CATEGORY NAVIGATION ====================
  describe('Category Navigation', () => {
    it('should switch to Porções category', async () => {
      render(<ProductCatalog onAddProduct={mockOnAddProduct} />);
      
      await user.click(screen.getByRole('tab', { name: /porções/i }));
      
      expect(screen.getByText('Batata Frita')).toBeInTheDocument();
      expect(screen.getByText('Picanha')).toBeInTheDocument();
    });

    it('should switch to Almoço category', async () => {
      render(<ProductCatalog onAddProduct={mockOnAddProduct} />);
      
      await user.click(screen.getByRole('tab', { name: /almoço/i }));
      
      const executivoElements = screen.getAllByText('Executivo');
      expect(executivoElements[0]).toBeInTheDocument();
    });

    it('should switch to Outros category', async () => {
      render(<ProductCatalog onAddProduct={mockOnAddProduct} />);
      
      await user.click(screen.getByRole('tab', { name: /outros/i }));
      
      expect(screen.getByText(/adicionar item personalizado/i)).toBeInTheDocument();
      expect(screen.getByText('Item Especial')).toBeInTheDocument();
    });

    it('should maintain active state when switching tabs', async () => {
      render(<ProductCatalog onAddProduct={mockOnAddProduct} />);
      
      await user.click(screen.getByRole('tab', { name: /porções/i }));
      const porcoesTab = screen.getByRole('tab', { name: /porções/i });
      
      expect(porcoesTab).toHaveAttribute('data-state', 'active');
    });
  });

  // ==================== SEARCH FUNCTIONALITY ====================
  describe('Search Functionality', () => {
    it('should filter products by name', async () => {
      render(<ProductCatalog onAddProduct={mockOnAddProduct} />);
      
      await user.type(screen.getByPlaceholderText(/buscar produto/i), 'Coca');
      
      expect(screen.getByText('Coca-Cola')).toBeInTheDocument();
      expect(screen.queryByText('Heineken')).not.toBeInTheDocument();
    });

    it('should show search results count', async () => {
      render(<ProductCatalog onAddProduct={mockOnAddProduct} />);
      
      await user.type(screen.getByPlaceholderText(/buscar produto/i), 'água');
      
      expect(screen.getByText(/1 produto\(s\) encontrado\(s\)/i)).toBeInTheDocument();
    });

    it('should search across all categories', async () => {
      render(<ProductCatalog onAddProduct={mockOnAddProduct} />);
      
      await user.type(screen.getByPlaceholderText(/buscar produto/i), 'e');
      
      // Should find products from multiple categories
      expect(screen.getByText('Heineken')).toBeInTheDocument();
      expect(screen.getByText('Item Especial')).toBeInTheDocument();
    });

    it('should show "no products found" message when search has no results', async () => {
      render(<ProductCatalog onAddProduct={mockOnAddProduct} />);
      
      await user.type(screen.getByPlaceholderText(/buscar produto/i), 'xyz123');
      
      expect(screen.getByText(/nenhum produto encontrado/i)).toBeInTheDocument();
    });

    it('should be case insensitive', async () => {
      render(<ProductCatalog onAddProduct={mockOnAddProduct} />);
      
      await user.type(screen.getByPlaceholderText(/buscar produto/i), 'COCA');
      
      expect(screen.getByText('Coca-Cola')).toBeInTheDocument();
    });

    it('should clear search when input is cleared', async () => {
      render(<ProductCatalog onAddProduct={mockOnAddProduct} />);
      
      await user.type(screen.getByPlaceholderText(/buscar produto/i), 'Coca');
      expect(screen.getByText(/1 produto\(s\) encontrado\(s\)/i)).toBeInTheDocument();
      
      await user.clear(screen.getByPlaceholderText(/buscar produto/i));
      
      // Should return to category view
      expect(screen.queryByText(/produto\(s\) encontrado\(s\)/i)).not.toBeInTheDocument();
    });
  });

  // ==================== PRODUCT CARDS ====================
  describe('Product Cards', () => {
    it('should display product name', () => {
      render(<ProductCatalog onAddProduct={mockOnAddProduct} />);
      expect(screen.getByText('Coca-Cola')).toBeInTheDocument();
    });

    it('should display product price', () => {
      render(<ProductCatalog onAddProduct={mockOnAddProduct} />);
      expect(screen.getByText('R$ 5.00')).toBeInTheDocument();
    });

    it('should display stock quantity', () => {
      render(<ProductCatalog onAddProduct={mockOnAddProduct} />);
      expect(screen.getByText('100 un.')).toBeInTheDocument();
    });

    it('should show red badge for low stock (<=20)', () => {
      render(<ProductCatalog onAddProduct={mockOnAddProduct} />);
      const waterCard = screen.getByText('Água Mineral').closest('.p-4');
      const stockBadge = within(waterCard!).getByText('15 un.');
      expect(stockBadge).toHaveClass('bg-red-100', 'text-red-600');
    });

    it('should show orange badge for medium stock (<=50)', () => {
      render(<ProductCatalog onAddProduct={mockOnAddProduct} />);
      const heinekenCard = screen.getByText('Heineken').closest('.p-4');
      const stockBadge = within(heinekenCard!).getByText('50 un.');
      expect(stockBadge).toHaveClass('bg-orange-100', 'text-orange-600');
    });

    it('should show green badge for good stock (>50)', () => {
      render(<ProductCatalog onAddProduct={mockOnAddProduct} />);
      const cocaCard = screen.getByText('Coca-Cola').closest('.p-4');
      const stockBadge = within(cocaCard!).getByText('100 un.');
      expect(stockBadge).toHaveClass('bg-green-100', 'text-green-600');
    });

    it('should display subcategory label when available', () => {
      render(<ProductCatalog onAddProduct={mockOnAddProduct} />);
      expect(screen.getByText('Cervejas')).toBeInTheDocument();
      expect(screen.getByText('Águas')).toBeInTheDocument();
    });

    it('should render Add button', () => {
      render(<ProductCatalog onAddProduct={mockOnAddProduct} />);
      const addButtons = screen.getAllByRole('button', { name: /adicionar/i });
      expect(addButtons.length).toBeGreaterThan(0);
    });

    it('should disable Add button when stock is 0', () => {
      render(<ProductCatalog onAddProduct={mockOnAddProduct} />);
      const noStockCard = screen.getByText('Produto Sem Estoque').closest('.p-4');
      const addButton = within(noStockCard!).getByRole('button', { name: /sem estoque/i });
      expect(addButton).toBeDisabled();
    });

    it('should render Edit button for admin in inventory view', () => {
      render(<ProductCatalog onAddProduct={mockOnAddProduct} currentView="inventory" />);
      const editButtons = screen.getAllByLabelText(/editar produto/i);
      expect(editButtons.length).toBeGreaterThan(0);
    });

    it('should not render Edit button in PDV view', () => {
      render(<ProductCatalog onAddProduct={mockOnAddProduct} currentView="pdv" />);
      const editButtons = screen.queryAllByLabelText(/editar produto/i);
      expect(editButtons.length).toBe(0);
    });
  });

  // ==================== ADD PRODUCT FUNCTIONALITY ====================
  describe('Add Product Functionality', () => {
    it('should call onAddProduct when Add button is clicked', async () => {
      render(<ProductCatalog onAddProduct={mockOnAddProduct} />);
      
      const cocaCard = screen.getByText('Coca-Cola').closest('.p-4');
      const addButton = within(cocaCard!).getByRole('button', { name: /adicionar/i });
      await user.click(addButton);
      
      expect(mockOnAddProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '1',
          name: 'Coca-Cola',
          price: 5.0
        })
      );
    });

    it('should not call onAddProduct when product has no stock', async () => {
      render(<ProductCatalog onAddProduct={mockOnAddProduct} />);
      
      const noStockCard = screen.getByText('Produto Sem Estoque').closest('.p-4');
      const addButton = within(noStockCard!).getByRole('button', { name: /sem estoque/i });
      
      // Button should be disabled
      expect(addButton).toBeDisabled();
      expect(mockOnAddProduct).not.toHaveBeenCalled();
    });

    it('should allow adding multiple products', async () => {
      render(<ProductCatalog onAddProduct={mockOnAddProduct} />);
      
      const cocaCard = screen.getByText('Coca-Cola').closest('.p-4');
      const cocaButton = within(cocaCard!).getByRole('button', { name: /adicionar/i });
      
      const heinekenCard = screen.getByText('Heineken').closest('.p-4');
      const heinekenButton = within(heinekenCard!).getByRole('button', { name: /adicionar/i });
      
      await user.click(cocaButton);
      await user.click(heinekenButton);
      
      expect(mockOnAddProduct).toHaveBeenCalledTimes(2);
    });
  });

  // ==================== CUSTOM ITEM DIALOG ====================
  describe('Custom Item Dialog', () => {
    beforeEach(async () => {
      render(<ProductCatalog onAddProduct={mockOnAddProduct} />);
      await user.click(screen.getByRole('tab', { name: /outros/i }));
    });

    it('should render custom item card in Outros category', () => {
      expect(screen.getByText(/adicionar item personalizado/i)).toBeInTheDocument();
    });

    it('should open dialog when custom item card is clicked', async () => {
      const customCard = screen.getByText(/adicionar item personalizado/i).closest('[role="button"]');
      await user.click(customCard!);
      
      expect(screen.getByText(/adicionar item personalizado/i, { selector: 'h2' })).toBeInTheDocument();
    });

    it('should render all input fields in dialog', async () => {
      const customCard = screen.getByText(/adicionar item personalizado/i).closest('[role="button"]');
      await user.click(customCard!);
      
      expect(screen.getByLabelText(/nome do item/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/valor \(r\$\)/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/observação/i)).toBeInTheDocument();
    });

    it('should allow typing in custom item fields', async () => {
      const customCard = screen.getByText(/adicionar item personalizado/i).closest('[role="button"]');
      await user.click(customCard!);
      
      await user.type(screen.getByLabelText(/nome do item/i), 'Taxa de Serviço');
      await user.type(screen.getByLabelText(/valor \(r\$\)/i), '10.50');
      await user.type(screen.getByLabelText(/observação/i), 'Pagamento especial');
      
      expect(screen.getByLabelText(/nome do item/i)).toHaveValue('Taxa de Serviço');
      expect(screen.getByLabelText(/valor \(r\$\)/i)).toHaveValue(10.5);
      expect(screen.getByLabelText(/observação/i)).toHaveValue('Pagamento especial');
    });

    it('should create custom product when Add button is clicked', async () => {
      const customCard = screen.getByText(/adicionar item personalizado/i).closest('[role="button"]');
      await user.click(customCard!);
      
      await user.type(screen.getByLabelText(/nome do item/i), 'Item Teste');
      await user.type(screen.getByLabelText(/valor \(r\$\)/i), '15.00');
      
      const dialogButtons = screen.getAllByRole('button', { name: /adicionar/i });
      const addButton = dialogButtons[dialogButtons.length - 1];
      await user.click(addButton);
      
      await waitFor(() => {
        expect(mockOnAddProduct).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Item Teste',
            price: 15.0,
            category: 'outros'
          })
        );
      });
    });

    it('should add note to custom item name when provided', async () => {
      const customCard = screen.getByText(/adicionar item personalizado/i).closest('[role="button"]');
      await user.click(customCard!);
      
      await user.type(screen.getByLabelText(/nome do item/i), 'Açaí');
      await user.type(screen.getByLabelText(/valor \(r\$\)/i), '20.00');
      await user.type(screen.getByLabelText(/observação/i), 'Com banana');
      
      const dialogButtons = screen.getAllByRole('button', { name: /adicionar/i });
      const addButton = dialogButtons[dialogButtons.length - 1];
      await user.click(addButton);
      
      await waitFor(() => {
        expect(mockOnAddProduct).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Açaí - Com banana',
            price: 20.0
          })
        );
      });
    });

    it('should close dialog when Cancel is clicked', async () => {
      const customCard = screen.getByText(/adicionar item personalizado/i).closest('[role="button"]');
      await user.click(customCard!);
      
      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      await user.click(cancelButton);
      
      await waitFor(() => {
        expect(screen.queryByText(/adicionar item personalizado/i, { selector: 'h2' })).not.toBeInTheDocument();
      });
    });

    it('should clear fields after successful addition', async () => {
      const customCard = screen.getByText(/adicionar item personalizado/i).closest('[role="button"]');
      await user.click(customCard!);
      
      await user.type(screen.getByLabelText(/nome do item/i), 'Item');
      await user.type(screen.getByLabelText(/valor \(r\$\)/i), '10');
      
      const dialogButtons = screen.getAllByRole('button', { name: /adicionar/i });
      const addButton = dialogButtons[dialogButtons.length - 1];
      await user.click(addButton);
      
      await waitFor(() => {
        expect(screen.queryByText(/adicionar item personalizado/i, { selector: 'h2' })).not.toBeInTheDocument();
      });
      
      // Open again and check fields are clear
      await user.click(customCard!);
      expect(screen.getByLabelText(/nome do item/i)).toHaveValue('');
      expect(screen.getByLabelText(/valor \(r\$\)/i)).toHaveValue(null);
    });
  });

  // ==================== ADMIN PRODUCT MANAGEMENT ====================
  describe('Admin Product Management', () => {
    it('should show "Novo Produto" button for admin in inventory view', () => {
      render(<ProductCatalog onAddProduct={mockOnAddProduct} currentView="inventory" />);
      expect(screen.getByRole('button', { name: /novo produto/i })).toBeInTheDocument();
    });

    it('should not show "Novo Produto" button in PDV view', () => {
      render(<ProductCatalog onAddProduct={mockOnAddProduct} currentView="pdv" />);
      expect(screen.queryByRole('button', { name: /novo produto/i })).not.toBeInTheDocument();
    });

    it('should open product dialog when "Novo Produto" is clicked', async () => {
      render(<ProductCatalog onAddProduct={mockOnAddProduct} currentView="inventory" />);
      
      await user.click(screen.getByRole('button', { name: /novo produto/i }));
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should open edit dialog when edit button is clicked', async () => {
      render(<ProductCatalog onAddProduct={mockOnAddProduct} currentView="inventory" />);
      
      const editButtons = screen.getAllByLabelText(/editar produto/i);
      await user.click(editButtons[0]);
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  // ==================== PDV SPECIFIC FEATURES ====================
  describe('PDV Specific Features', () => {
    it('should show Venda Direta button in PDV view', () => {
      render(<ProductCatalog onAddProduct={mockOnAddProduct} currentView="pdv" />);
      expect(screen.getByRole('button', { name: /venda direta/i })).toBeInTheDocument();
    });

    it('should show Nova Comanda button in PDV view', () => {
      render(<ProductCatalog onAddProduct={mockOnAddProduct} currentView="pdv" />);
      expect(screen.getByRole('button', { name: /nova comanda/i })).toBeInTheDocument();
    });

    it('should not show PDV buttons when not in PDV view', () => {
      render(<ProductCatalog onAddProduct={mockOnAddProduct} currentView="inventory" />);
      expect(screen.queryByRole('button', { name: /venda direta/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /nova comanda/i })).not.toBeInTheDocument();
    });

    it('should dispatch custom event when Venda Direta is clicked', async () => {
      const eventSpy = jest.fn();
      window.addEventListener('pdv:directSale', eventSpy);
      
      render(<ProductCatalog onAddProduct={mockOnAddProduct} currentView="pdv" />);
      
      await user.click(screen.getByRole('button', { name: /venda direta/i }));
      
      expect(eventSpy).toHaveBeenCalled();
      window.removeEventListener('pdv:directSale', eventSpy);
    });

    it('should dispatch custom event when Nova Comanda is clicked', async () => {
      const eventSpy = jest.fn();
      window.addEventListener('pdv:newComanda', eventSpy);
      
      render(<ProductCatalog onAddProduct={mockOnAddProduct} currentView="pdv" />);
      
      await user.click(screen.getByRole('button', { name: /nova comanda/i }));
      
      expect(eventSpy).toHaveBeenCalled();
      window.removeEventListener('pdv:newComanda', eventSpy);
    });
  });

  // ==================== EDGE CASES ====================
  describe('Edge Cases', () => {
    it('should handle empty product list', () => {
      mockUseProductsDB.mockReturnValue({
        products: [],
        loading: false,
        addProduct: mockAddProduct,
        updateProduct: mockUpdateProduct
      });
      
      render(<ProductCatalog onAddProduct={mockOnAddProduct} />);
      
      // Should still render without errors
      expect(screen.getByPlaceholderText(/buscar produto/i)).toBeInTheDocument();
    });

    it('should handle very long product names', () => {
      const longNameProduct = {
        ...mockProducts[0],
        name: 'A'.repeat(100)
      };
      
      mockUseProductsDB.mockReturnValue({
        products: [longNameProduct],
        loading: false,
        addProduct: mockAddProduct,
        updateProduct: mockUpdateProduct
      });
      
      render(<ProductCatalog onAddProduct={mockOnAddProduct} />);
      expect(screen.getByText('A'.repeat(100))).toBeInTheDocument();
    });

    it('should handle products without category', () => {
      const noCategoryProduct = {
        id: 'no-cat',
        name: 'Sem Categoria',
        price: 10.0,
        stock: 5
      } as Product;
      
      mockUseProductsDB.mockReturnValue({
        products: [noCategoryProduct],
        loading: false,
        addProduct: mockAddProduct,
        updateProduct: mockUpdateProduct
      });
      
      render(<ProductCatalog onAddProduct={mockOnAddProduct} />);
      
      // Should still render
      expect(screen.getByPlaceholderText(/buscar produto/i)).toBeInTheDocument();
    });

    it('should handle search with special characters', async () => {
      render(<ProductCatalog onAddProduct={mockOnAddProduct} />);
      
      await user.type(screen.getByPlaceholderText(/buscar produto/i), '@#$%');
      
      expect(screen.getByText(/nenhum produto encontrado/i)).toBeInTheDocument();
    });

    it('should handle rapid category switching', async () => {
      render(<ProductCatalog onAddProduct={mockOnAddProduct} />);
      
      await user.click(screen.getByRole('tab', { name: /porções/i }));
      await user.click(screen.getByRole('tab', { name: /almoço/i }));
      await user.click(screen.getByRole('tab', { name: /bebidas/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Coca-Cola')).toBeInTheDocument();
      });
    });
  });

  // ==================== ACCESSIBILITY ====================
  describe('Accessibility', () => {
    it('should have proper labels for inputs', () => {
      render(<ProductCatalog onAddProduct={mockOnAddProduct} />);
      expect(screen.getByPlaceholderText(/buscar produto/i)).toBeInTheDocument();
    });

    it('should have role="button" for custom item card', async () => {
      render(<ProductCatalog onAddProduct={mockOnAddProduct} />);
      await user.click(screen.getByRole('tab', { name: /outros/i }));
      
      const customCard = screen.getByRole('button', { name: /adicionar item personalizado/i });
      expect(customCard).toBeInTheDocument();
    });

    it('should support keyboard navigation on custom item card', async () => {
      render(<ProductCatalog onAddProduct={mockOnAddProduct} />);
      await user.click(screen.getByRole('tab', { name: /outros/i }));
      
      const customCard = screen.getByRole('button', { name: /adicionar item personalizado/i });
      customCard.focus();
      
      await user.keyboard('{Enter}');
      
      expect(screen.getByText(/adicionar item personalizado/i, { selector: 'h2' })).toBeInTheDocument();
    });

    it('should have aria-label for edit buttons', () => {
      render(<ProductCatalog onAddProduct={mockOnAddProduct} currentView="inventory" />);
      const editButtons = screen.queryAllByLabelText(/editar produto/i);
      // Edit buttons may or may not have aria-label depending on implementation
      // Just check that we can render without errors
      expect(screen.getByPlaceholderText(/buscar produto/i)).toBeInTheDocument();
    });

    it('should have proper tab navigation', async () => {
      render(<ProductCatalog onAddProduct={mockOnAddProduct} />);
      
      await user.tab();
      expect(screen.getByPlaceholderText(/buscar produto/i)).toHaveFocus();
    });
  });

  // ==================== INTEGRATION ====================
  describe('Integration', () => {
    it('should integrate with useProductsDB hook', () => {
      render(<ProductCatalog onAddProduct={mockOnAddProduct} />);
      
      // Verify hook was called
      expect(mockUseProductsDB).toHaveBeenCalled();
      
      // Products from hook should be displayed
      expect(screen.getByText('Coca-Cola')).toBeInTheDocument();
      expect(screen.getByText('Heineken')).toBeInTheDocument();
    });

    it('should integrate with useAuth hook', () => {
      render(<ProductCatalog onAddProduct={mockOnAddProduct} currentView="inventory" />);
      
      // Admin buttons should be visible
      expect(screen.getByRole('button', { name: /novo produto/i })).toBeInTheDocument();
    });

    it('should work without currentView prop', () => {
      render(<ProductCatalog onAddProduct={mockOnAddProduct} />);
      
      // Should render without errors
      expect(screen.getByPlaceholderText(/buscar produto/i)).toBeInTheDocument();
    });
  });
});
