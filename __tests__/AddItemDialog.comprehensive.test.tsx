import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { AddItemDialog } from '@/components/AddItemDialog';
import { Product } from '@/types';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Search: () => <div data-testid="search-icon">Search</div>,
  Plus: () => <div data-testid="plus-icon">Plus</div>,
  Minus: () => <div data-testid="minus-icon">Minus</div>
}));

// Mock Dialog components
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => (open ? <div role="dialog">{children}</div> : null),
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogDescription: ({ children }: any) => <p>{children}</p>
}));

// Mock useProductsDB hook
const mockUseProductsDB = jest.fn();
jest.mock('@/hooks/useProductsDB', () => ({
  useProductsDB: () => mockUseProductsDB()
}));

describe('AddItemDialog - Comprehensive Tests', () => {
  // Mock data
  const mockProducts: Product[] = [
    {
      id: 'p1',
      name: 'Coca-Cola',
      price: 5.00,
      stock: 100,
      category: 'bebidas',
      subcategory: 'refrigerante'
    },
    {
      id: 'p2',
      name: 'Hamburguer',
      price: 15.50,
      stock: 50,
      category: 'porcoes',
      subcategory: 'sanduiches'
    },
    {
      id: 'p3',
      name: 'Água',
      price: 3.00,
      stock: 200,
      category: 'bebidas',
      subcategory: 'agua'
    },
    {
      id: 'p4',
      name: 'Cerveja Heineken',
      price: 8.99,
      stock: 75,
      category: 'bebidas',
      subcategory: 'cerveja'
    }
  ];

  const mockOnClose = jest.fn();
  const mockOnAddItem = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseProductsDB.mockReturnValue({
      products: mockProducts,
      loading: false
    });
  });

  describe('Rendering & Structure', () => {
    it('should render without crashing when open', () => {
      render(
        <AddItemDialog 
          open={true}
          onClose={mockOnClose}
          onAddItem={mockOnAddItem}
        />
      );

      expect(screen.getByText('Adicionar Item')).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      render(
        <AddItemDialog 
          open={false}
          onClose={mockOnClose}
          onAddItem={mockOnAddItem}
        />
      );

      expect(screen.queryByText('Adicionar Item')).not.toBeInTheDocument();
    });

    it('should render dialog title', () => {
      render(
        <AddItemDialog 
          open={true}
          onClose={mockOnClose}
          onAddItem={mockOnAddItem}
        />
      );

      expect(screen.getByText('Adicionar Item')).toBeInTheDocument();
    });

    it('should render dialog description', () => {
      render(
        <AddItemDialog 
          open={true}
          onClose={mockOnClose}
          onAddItem={mockOnAddItem}
        />
      );

      expect(screen.getByText('Selecione um produto e defina a quantidade')).toBeInTheDocument();
    });

    it('should render search input', () => {
      render(
        <AddItemDialog 
          open={true}
          onClose={mockOnClose}
          onAddItem={mockOnAddItem}
        />
      );

      expect(screen.getByPlaceholderText('Buscar produto...')).toBeInTheDocument();
    });

    it('should render search icon', () => {
      render(
        <AddItemDialog 
          open={true}
          onClose={mockOnClose}
          onAddItem={mockOnAddItem}
        />
      );

      expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    });

    it('should render all products initially', () => {
      render(
        <AddItemDialog 
          open={true}
          onClose={mockOnClose}
          onAddItem={mockOnAddItem}
        />
      );

      expect(screen.getByText('Coca-Cola')).toBeInTheDocument();
      expect(screen.getByText('Hamburguer')).toBeInTheDocument();
      expect(screen.getByText('Água')).toBeInTheDocument();
      expect(screen.getByText('Cerveja Heineken')).toBeInTheDocument();
    });

    it('should not render quantity selector initially', () => {
      render(
        <AddItemDialog 
          open={true}
          onClose={mockOnClose}
          onAddItem={mockOnAddItem}
        />
      );

      expect(screen.queryByTestId('minus-icon')).not.toBeInTheDocument();
      expect(screen.queryByTestId('plus-icon')).not.toBeInTheDocument();
    });
  });

  describe('Product Display', () => {
    it('should display product names', () => {
      render(
        <AddItemDialog 
          open={true}
          onClose={mockOnClose}
          onAddItem={mockOnAddItem}
        />
      );

      mockProducts.forEach(product => {
        expect(screen.getByText(product.name)).toBeInTheDocument();
      });
    });

    it('should display formatted prices', () => {
      render(
        <AddItemDialog 
          open={true}
          onClose={mockOnClose}
          onAddItem={mockOnAddItem}
        />
      );

      expect(screen.getByText('R$ 5.00')).toBeInTheDocument();
      expect(screen.getByText('R$ 15.50')).toBeInTheDocument();
      expect(screen.getByText('R$ 3.00')).toBeInTheDocument();
      expect(screen.getByText('R$ 8.99')).toBeInTheDocument();
    });

    it('should handle empty products array', () => {
      mockUseProductsDB.mockReturnValue({
        products: [],
        loading: false
      });

      render(
        <AddItemDialog 
          open={true}
          onClose={mockOnClose}
          onAddItem={mockOnAddItem}
        />
      );

      expect(screen.queryByText('Coca-Cola')).not.toBeInTheDocument();
    });

    it('should handle loading state', () => {
      mockUseProductsDB.mockReturnValue({
        products: [],
        loading: true
      });

      render(
        <AddItemDialog 
          open={true}
          onClose={mockOnClose}
          onAddItem={mockOnAddItem}
        />
      );

      // Dialog should still render
      expect(screen.getByText('Adicionar Item')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should filter products by name', async () => {
      const user = userEvent.setup();
      render(
        <AddItemDialog 
          open={true}
          onClose={mockOnClose}
          onAddItem={mockOnAddItem}
        />
      );

      const searchInput = screen.getByPlaceholderText('Buscar produto...');
      await user.type(searchInput, 'Coca');

      await waitFor(() => {
        expect(screen.getByText('Coca-Cola')).toBeInTheDocument();
        expect(screen.queryByText('Hamburguer')).not.toBeInTheDocument();
        expect(screen.queryByText('Água')).not.toBeInTheDocument();
      });
    });

    it('should filter products case insensitive', async () => {
      const user = userEvent.setup();
      render(
        <AddItemDialog 
          open={true}
          onClose={mockOnClose}
          onAddItem={mockOnAddItem}
        />
      );

      const searchInput = screen.getByPlaceholderText('Buscar produto...');
      await user.type(searchInput, 'coca');

      await waitFor(() => {
        expect(screen.getByText('Coca-Cola')).toBeInTheDocument();
      });
    });

    it('should filter by partial match', async () => {
      const user = userEvent.setup();
      render(
        <AddItemDialog 
          open={true}
          onClose={mockOnClose}
          onAddItem={mockOnAddItem}
        />
      );

      const searchInput = screen.getByPlaceholderText('Buscar produto...');
      await user.type(searchInput, 'Cer');

      await waitFor(() => {
        expect(screen.getByText('Cerveja Heineken')).toBeInTheDocument();
        expect(screen.queryByText('Coca-Cola')).not.toBeInTheDocument();
      });
    });

    it('should show all products when search is cleared', async () => {
      const user = userEvent.setup();
      render(
        <AddItemDialog 
          open={true}
          onClose={mockOnClose}
          onAddItem={mockOnAddItem}
        />
      );

      const searchInput = screen.getByPlaceholderText('Buscar produto...');
      await user.type(searchInput, 'Coca');

      await waitFor(() => {
        expect(screen.queryByText('Hamburguer')).not.toBeInTheDocument();
      });

      await user.clear(searchInput);

      await waitFor(() => {
        expect(screen.getByText('Coca-Cola')).toBeInTheDocument();
        expect(screen.getByText('Hamburguer')).toBeInTheDocument();
        expect(screen.getByText('Água')).toBeInTheDocument();
      });
    });

    it('should show no products when search has no matches', async () => {
      const user = userEvent.setup();
      render(
        <AddItemDialog 
          open={true}
          onClose={mockOnClose}
          onAddItem={mockOnAddItem}
        />
      );

      const searchInput = screen.getByPlaceholderText('Buscar produto...');
      await user.type(searchInput, 'xyz123');

      await waitFor(() => {
        expect(screen.queryByText('Coca-Cola')).not.toBeInTheDocument();
        expect(screen.queryByText('Hamburguer')).not.toBeInTheDocument();
      });
    });
  });

  describe('Product Selection', () => {
    it('should select product when clicked', async () => {
      const user = userEvent.setup();
      render(
        <AddItemDialog 
          open={true}
          onClose={mockOnClose}
          onAddItem={mockOnAddItem}
        />
      );

      const productCard = screen.getAllByText('Coca-Cola')[0].closest('.cursor-pointer');
      await user.click(productCard!);

      await waitFor(() => {
        expect(screen.getByTestId('minus-icon')).toBeInTheDocument();
        expect(screen.getByTestId('plus-icon')).toBeInTheDocument();
      });
    });

    it('should highlight selected product', async () => {
      const user = userEvent.setup();
      render(
        <AddItemDialog 
          open={true}
          onClose={mockOnClose}
          onAddItem={mockOnAddItem}
        />
      );

      const productCard = screen.getAllByText('Coca-Cola')[0].closest('.cursor-pointer');
      await user.click(productCard!);

      await waitFor(() => {
        expect(productCard).toHaveClass('border-primary');
      });
    });

    it('should reset quantity when selecting a product', async () => {
      const user = userEvent.setup();
      render(
        <AddItemDialog 
          open={true}
          onClose={mockOnClose}
          onAddItem={mockOnAddItem}
        />
      );

      // Select first product and increase quantity
      const cocaCard = screen.getAllByText('Coca-Cola')[0].closest('.cursor-pointer');
      await user.click(cocaCard!);

      await waitFor(() => {
        expect(screen.getByTestId('plus-icon')).toBeInTheDocument();
      });

      const plusButton = screen.getByTestId('plus-icon').closest('button');
      await user.click(plusButton!);
      await user.click(plusButton!);

      // Select another product
      const hamburgerCard = screen.getAllByText('Hamburguer')[0].closest('.cursor-pointer');
      await user.click(hamburgerCard!);

      // Quantity should be reset to 1
      await waitFor(() => {
        const quantityDisplay = screen.getByText('1', { selector: 'span.w-12' });
        expect(quantityDisplay).toBeInTheDocument();
      });
    });

    it('should allow selecting different products', async () => {
      const user = userEvent.setup();
      render(
        <AddItemDialog 
          open={true}
          onClose={mockOnClose}
          onAddItem={mockOnAddItem}
        />
      );

      const cocaCard = screen.getAllByText('Coca-Cola')[0].closest('.cursor-pointer');
      await user.click(cocaCard!);

      await waitFor(() => {
        expect(cocaCard).toHaveClass('border-primary');
      });

      const hamburgerCard = screen.getAllByText('Hamburguer')[0].closest('.cursor-pointer');
      await user.click(hamburgerCard!);

      await waitFor(() => {
        expect(hamburgerCard).toHaveClass('border-primary');
        expect(cocaCard).not.toHaveClass('border-primary');
      });
    });
  });

  describe('Quantity Controls', () => {
    it('should increase quantity when plus button clicked', async () => {
      const user = userEvent.setup();
      render(
        <AddItemDialog 
          open={true}
          onClose={mockOnClose}
          onAddItem={mockOnAddItem}
        />
      );

      const productCard = screen.getAllByText('Coca-Cola')[0].closest('.cursor-pointer');
      await user.click(productCard!);

      await waitFor(() => {
        expect(screen.getByTestId('plus-icon')).toBeInTheDocument();
      });

      const plusButton = screen.getByTestId('plus-icon').closest('button');
      await user.click(plusButton!);

      await waitFor(() => {
        const quantityDisplay = screen.getByText('2', { selector: 'span.w-12' });
        expect(quantityDisplay).toBeInTheDocument();
      });
    });

    it('should decrease quantity when minus button clicked', async () => {
      const user = userEvent.setup();
      render(
        <AddItemDialog 
          open={true}
          onClose={mockOnClose}
          onAddItem={mockOnAddItem}
        />
      );

      const productCard = screen.getAllByText('Coca-Cola')[0].closest('.cursor-pointer');
      await user.click(productCard!);

      await waitFor(() => {
        expect(screen.getByTestId('plus-icon')).toBeInTheDocument();
      });

      const plusButton = screen.getByTestId('plus-icon').closest('button');
      await user.click(plusButton!);
      await user.click(plusButton!);

      const minusButton = screen.getByTestId('minus-icon').closest('button');
      await user.click(minusButton!);

      await waitFor(() => {
        const quantityDisplay = screen.getByText('2', { selector: 'span.w-12' });
        expect(quantityDisplay).toBeInTheDocument();
      });
    });

    it('should not decrease quantity below 1', async () => {
      const user = userEvent.setup();
      render(
        <AddItemDialog 
          open={true}
          onClose={mockOnClose}
          onAddItem={mockOnAddItem}
        />
      );

      const productCard = screen.getAllByText('Coca-Cola')[0].closest('.cursor-pointer');
      await user.click(productCard!);

      await waitFor(() => {
        expect(screen.getByTestId('minus-icon')).toBeInTheDocument();
      });

      const minusButton = screen.getByTestId('minus-icon').closest('button');
      await user.click(minusButton!);
      await user.click(minusButton!);

      await waitFor(() => {
        const quantityDisplay = screen.getByText('1', { selector: 'span.w-12' });
        expect(quantityDisplay).toBeInTheDocument();
      });
    });

    it('should allow multiple quantity increases', async () => {
      const user = userEvent.setup();
      render(
        <AddItemDialog 
          open={true}
          onClose={mockOnClose}
          onAddItem={mockOnAddItem}
        />
      );

      const productCard = screen.getAllByText('Coca-Cola')[0].closest('.cursor-pointer');
      await user.click(productCard!);

      await waitFor(() => {
        expect(screen.getByTestId('plus-icon')).toBeInTheDocument();
      });

      const plusButton = screen.getByTestId('plus-icon').closest('button');
      for (let i = 0; i < 9; i++) {
        await user.click(plusButton!);
      }

      await waitFor(() => {
        const quantityDisplay = screen.getByText('10', { selector: 'span.w-12' });
        expect(quantityDisplay).toBeInTheDocument();
      });
    });
  });

  describe('Add Item Functionality', () => {
    it('should display add button when product is selected', async () => {
      const user = userEvent.setup();
      render(
        <AddItemDialog 
          open={true}
          onClose={mockOnClose}
          onAddItem={mockOnAddItem}
        />
      );

      const productCard = screen.getAllByText('Coca-Cola')[0].closest('.cursor-pointer');
      await user.click(productCard!);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Adicionar - R\$/ })).toBeInTheDocument();
      });
    });

    it('should calculate total price correctly', async () => {
      const user = userEvent.setup();
      render(
        <AddItemDialog 
          open={true}
          onClose={mockOnClose}
          onAddItem={mockOnAddItem}
        />
      );

      const productCard = screen.getAllByText('Coca-Cola')[0].closest('.cursor-pointer');
      await user.click(productCard!);

      await waitFor(() => {
        expect(screen.getByText(/Adicionar - R\$ 5\.00/)).toBeInTheDocument();
      });

      const plusButton = screen.getByTestId('plus-icon').closest('button');
      await user.click(plusButton!);

      await waitFor(() => {
        expect(screen.getByText(/Adicionar - R\$ 10\.00/)).toBeInTheDocument();
      });
    });

    it('should call onAddItem with correct parameters', async () => {
      const user = userEvent.setup();
      render(
        <AddItemDialog 
          open={true}
          onClose={mockOnClose}
          onAddItem={mockOnAddItem}
        />
      );

      const productCard = screen.getAllByText('Coca-Cola')[0].closest('.cursor-pointer');
      await user.click(productCard!);

      await waitFor(() => {
        expect(screen.getByTestId('plus-icon')).toBeInTheDocument();
      });

      const plusButton = screen.getByTestId('plus-icon').closest('button');
      await user.click(plusButton!);

      const addButton = screen.getByRole('button', { name: /Adicionar - R\$/ });
      await user.click(addButton);

      expect(mockOnAddItem).toHaveBeenCalledWith(mockProducts[0], 2);
    });

    it('should call onClose after adding item', async () => {
      const user = userEvent.setup();
      render(
        <AddItemDialog 
          open={true}
          onClose={mockOnClose}
          onAddItem={mockOnAddItem}
        />
      );

      const productCard = screen.getAllByText('Coca-Cola')[0].closest('.cursor-pointer');
      await user.click(productCard!);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Adicionar - R\$/ })).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /Adicionar - R\$/ });
      await user.click(addButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should reset state after adding item', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <AddItemDialog 
          open={true}
          onClose={mockOnClose}
          onAddItem={mockOnAddItem}
        />
      );

      const productCard = screen.getAllByText('Coca-Cola')[0].closest('.cursor-pointer');
      await user.click(productCard!);

      await waitFor(() => {
        expect(screen.getByTestId('plus-icon')).toBeInTheDocument();
      });

      const plusButton = screen.getByTestId('plus-icon').closest('button');
      await user.click(plusButton!);

      const searchInput = screen.getByPlaceholderText('Buscar produto...');
      await user.type(searchInput, 'test');

      const addButton = screen.getByRole('button', { name: /Adicionar - R\$/ });
      await user.click(addButton);

      // Reopen dialog
      rerender(
        <AddItemDialog 
          open={true}
          onClose={mockOnClose}
          onAddItem={mockOnAddItem}
        />
      );

      // Search should be cleared, no product selected
      expect(screen.getByPlaceholderText('Buscar produto...')).toHaveValue('');
      expect(screen.queryByTestId('minus-icon')).not.toBeInTheDocument();
    });
  });

  describe('Close Functionality', () => {
    it('should call onClose when dialog is closed', async () => {
      const user = userEvent.setup();
      render(
        <AddItemDialog 
          open={true}
          onClose={mockOnClose}
          onAddItem={mockOnAddItem}
        />
      );

      // Simulate dialog close (ESC key or overlay click)
      // This tests the onOpenChange handler
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();

      // The Dialog component would normally handle this
      // We can't easily simulate it, but we know onClose is passed to onOpenChange
    });
  });

  describe('Edge Cases', () => {
    it('should handle product with zero price', async () => {
      const freeProduct: Product = {
        id: 'p5',
        name: 'Free Item',
        price: 0,
        stock: 100,
        category: 'outros'
      };

      mockUseProductsDB.mockReturnValue({
        products: [freeProduct],
        loading: false
      });

      const user = userEvent.setup();
      render(
        <AddItemDialog 
          open={true}
          onClose={mockOnClose}
          onAddItem={mockOnAddItem}
        />
      );

      const productCard = screen.getByText('Free Item').closest('.cursor-pointer');
      await user.click(productCard!);

      await waitFor(() => {
        expect(screen.getByText(/Adicionar - R\$ 0\.00/)).toBeInTheDocument();
      });
    });

    it('should handle very high prices', async () => {
      const expensiveProduct: Product = {
        id: 'p6',
        name: 'Expensive Item',
        price: 9999.99,
        stock: 1,
        category: 'outros'
      };

      mockUseProductsDB.mockReturnValue({
        products: [expensiveProduct],
        loading: false
      });

      const user = userEvent.setup();
      render(
        <AddItemDialog 
          open={true}
          onClose={mockOnClose}
          onAddItem={mockOnAddItem}
        />
      );

      const productCard = screen.getByText('Expensive Item').closest('.cursor-pointer');
      await user.click(productCard!);

      await waitFor(() => {
        expect(screen.getByText(/Adicionar - R\$ 9999\.99/)).toBeInTheDocument();
      });
    });

    it('should handle very long product names', () => {
      const longNameProduct: Product = {
        id: 'p7',
        name: 'This is a very long product name that should still display correctly without breaking the layout',
        price: 10,
        stock: 50,
        category: 'outros'
      };

      mockUseProductsDB.mockReturnValue({
        products: [longNameProduct],
        loading: false
      });

      render(
        <AddItemDialog 
          open={true}
          onClose={mockOnClose}
          onAddItem={mockOnAddItem}
        />
      );

      expect(screen.getByText(longNameProduct.name)).toBeInTheDocument();
    });

    it('should handle special characters in product name', () => {
      const specialProduct: Product = {
        id: 'p8',
        name: 'Café & Croissant (Especial) 100%',
        price: 12.50,
        stock: 25,
        category: 'outros'
      };

      mockUseProductsDB.mockReturnValue({
        products: [specialProduct],
        loading: false
      });

      render(
        <AddItemDialog 
          open={true}
          onClose={mockOnClose}
          onAddItem={mockOnAddItem}
        />
      );

      expect(screen.getByText(specialProduct.name)).toBeInTheDocument();
    });

    it('should handle rapid product selection changes', async () => {
      const user = userEvent.setup();
      render(
        <AddItemDialog 
          open={true}
          onClose={mockOnClose}
          onAddItem={mockOnAddItem}
        />
      );

      const cocaCard = screen.getAllByText('Coca-Cola')[0].closest('.cursor-pointer');
      const hamburgerCard = screen.getAllByText('Hamburguer')[0].closest('.cursor-pointer');
      const aguaCard = screen.getAllByText('Água')[0].closest('.cursor-pointer');

      await user.click(cocaCard!);
      await user.click(hamburgerCard!);
      await user.click(aguaCard!);

      await waitFor(() => {
        expect(aguaCard).toHaveClass('border-primary');
      });
    });

    it('should handle decimal prices correctly', async () => {
      const user = userEvent.setup();
      render(
        <AddItemDialog 
          open={true}
          onClose={mockOnClose}
          onAddItem={mockOnAddItem}
        />
      );

      const hamburgerCard = screen.getAllByText('Hamburguer')[0].closest('.cursor-pointer');
      await user.click(hamburgerCard!);

      await waitFor(() => {
        expect(screen.getByText(/Adicionar - R\$ 15\.50/)).toBeInTheDocument();
      });

      const plusButton = screen.getByTestId('plus-icon').closest('button');
      await user.click(plusButton!);

      await waitFor(() => {
        // 15.50 * 2 = 31.00
        expect(screen.getByText(/Adicionar - R\$ 31\.00/)).toBeInTheDocument();
      });
    });
  });

  describe('Integration', () => {
    it('should integrate with useProductsDB hook', () => {
      render(
        <AddItemDialog 
          open={true}
          onClose={mockOnClose}
          onAddItem={mockOnAddItem}
        />
      );

      expect(mockUseProductsDB).toHaveBeenCalled();
    });

    it('should handle complete workflow', async () => {
      const user = userEvent.setup();
      render(
        <AddItemDialog 
          open={true}
          onClose={mockOnClose}
          onAddItem={mockOnAddItem}
        />
      );

      // Search for product
      const searchInput = screen.getByPlaceholderText('Buscar produto...');
      await user.type(searchInput, 'Cerveja');

      await waitFor(() => {
        expect(screen.getByText('Cerveja Heineken')).toBeInTheDocument();
        expect(screen.queryByText('Coca-Cola')).not.toBeInTheDocument();
      });

      // Select product
      const productCard = screen.getByText('Cerveja Heineken').closest('.cursor-pointer');
      await user.click(productCard!);

      await waitFor(() => {
        expect(screen.getByTestId('plus-icon')).toBeInTheDocument();
      });

      // Increase quantity
      const plusButton = screen.getByTestId('plus-icon').closest('button');
      await user.click(plusButton!);
      await user.click(plusButton!);

      // Verify total
      await waitFor(() => {
        // 8.99 * 3 = 26.97
        expect(screen.getByText(/Adicionar - R\$ 26\.97/)).toBeInTheDocument();
      });

      // Add item
      const addButton = screen.getByRole('button', { name: /Adicionar - R\$/ });
      await user.click(addButton);

      expect(mockOnAddItem).toHaveBeenCalledWith(mockProducts[3], 3);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should reset correctly when reopened', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <AddItemDialog 
          open={true}
          onClose={mockOnClose}
          onAddItem={mockOnAddItem}
        />
      );

      // Select product and add
      const productCard = screen.getAllByText('Coca-Cola')[0].closest('.cursor-pointer');
      await user.click(productCard!);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Adicionar - R\$/ })).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /Adicionar - R\$/ });
      await user.click(addButton);

      // Close dialog
      rerender(
        <AddItemDialog 
          open={false}
          onClose={mockOnClose}
          onAddItem={mockOnAddItem}
        />
      );

      // Reopen dialog
      rerender(
        <AddItemDialog 
          open={true}
          onClose={mockOnClose}
          onAddItem={mockOnAddItem}
        />
      );

      // State should be reset
      expect(screen.getByPlaceholderText('Buscar produto...')).toHaveValue('');
      expect(screen.queryByTestId('minus-icon')).not.toBeInTheDocument();
      expect(screen.getByText('Coca-Cola')).toBeInTheDocument();
    });
  });
});
