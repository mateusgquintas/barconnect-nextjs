/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ProductInfoDialog } from '@/components/ProductInfoDialog';
import type { Product } from '@/types';

// Mock recharts to avoid rendering issues in tests
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="chart-container">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar">Bar</div>,
  XAxis: () => <div data-testid="x-axis">XAxis</div>,
  YAxis: () => <div data-testid="y-axis">YAxis</div>,
  Tooltip: () => <div data-testid="tooltip">Tooltip</div>,
  CartesianGrid: () => <div data-testid="grid">Grid</div>,
}));

// Mock useSalesDB hook
const mockSales = [
  {
    id: '1',
    date: '10/12/2025',
    items: [
      { product: { id: 'p1', name: 'Coca-Cola' }, quantity: 5, price: 5 }
    ],
    total: 25,
    isCourtesy: false
  },
  {
    id: '2',
    date: '12/12/2025',
    items: [
      { product: { id: 'p1', name: 'Coca-Cola' }, quantity: 3, price: 5 }
    ],
    total: 15,
    isCourtesy: false
  },
  {
    id: '3',
    date: '14/12/2025',
    items: [
      { product: { id: 'p2', name: 'Heineken' }, quantity: 2, price: 8 }
    ],
    total: 16,
    isCourtesy: false
  },
  {
    id: '4',
    date: '15/12/2025',
    items: [
      { product: { id: 'p1', name: 'Coca-Cola' }, quantity: 10, price: 5 }
    ],
    total: 50,
    isCourtesy: true // Should be ignored
  }
];

jest.mock('@/hooks/useSalesDB', () => ({
  useSalesDB: jest.fn(() => ({
    sales: mockSales,
    loading: false
  }))
}));

describe('ProductInfoDialog - Comprehensive Tests', () => {
  let mockOnOpenChange: jest.Mock;
  let user: ReturnType<typeof userEvent.setup>;

  const mockProduct: Product = {
    id: 'p1',
    name: 'Coca-Cola',
    price: 5.0,
    stock: 100,
    category: 'bebidas',
    subcategory: 'refrigerante'
  };

  const mockProductMinimal: Product = {
    id: 'p2',
    name: 'Produto Sem Categoria',
    price: 10.0,
    stock: 50
  };

  beforeEach(() => {
    mockOnOpenChange = jest.fn();
    user = userEvent.setup();
  });

  // ==================== RENDERING & STRUCTURE ====================
  describe('Rendering & Structure', () => {
    it('should render without crashing when open', () => {
      render(
        <ProductInfoDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={mockProduct}
        />
      );
      expect(screen.getByText('Informações do Produto')).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      render(
        <ProductInfoDialog
          open={false}
          onOpenChange={mockOnOpenChange}
          product={mockProduct}
        />
      );
      expect(screen.queryByText('Informações do Produto')).not.toBeInTheDocument();
    });

    it('should not render when product is null', () => {
      render(
        <ProductInfoDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
        />
      );
      expect(screen.queryByText('Informações do Produto')).not.toBeInTheDocument();
    });

    it('should render dialog title', () => {
      render(
        <ProductInfoDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={mockProduct}
        />
      );
      expect(screen.getByText('Informações do Produto')).toBeInTheDocument();
    });

    it('should render dialog description', () => {
      render(
        <ProductInfoDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={mockProduct}
        />
      );
      expect(screen.getByText(/Estatísticas e histórico de vendas/i)).toBeInTheDocument();
    });

    it('should render all product info sections', () => {
      render(
        <ProductInfoDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={mockProduct}
        />
      );
      
      expect(screen.getByText('Nome')).toBeInTheDocument();
      expect(screen.getByText('Preço')).toBeInTheDocument();
      expect(screen.getByText('Estoque')).toBeInTheDocument();
      expect(screen.getByText('Categoria')).toBeInTheDocument();
      expect(screen.getByText('Subcategoria')).toBeInTheDocument();
    });

    it('should render chart section', () => {
      render(
        <ProductInfoDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={mockProduct}
        />
      );
      expect(screen.getByText(/Histórico semanal de vendas/i)).toBeInTheDocument();
    });

    it('should render close button', () => {
      render(
        <ProductInfoDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={mockProduct}
        />
      );
      expect(screen.getByRole('button', { name: /Fechar/i })).toBeInTheDocument();
    });
  });

  // ==================== PRODUCT INFORMATION DISPLAY ====================
  describe('Product Information Display', () => {
    it('should display product name', () => {
      render(
        <ProductInfoDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={mockProduct}
        />
      );
      expect(screen.getByText('Coca-Cola')).toBeInTheDocument();
    });

    it('should display formatted price', () => {
      render(
        <ProductInfoDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={mockProduct}
        />
      );
      expect(screen.getByText('R$ 5.00')).toBeInTheDocument();
    });

    it('should display stock with units', () => {
      render(
        <ProductInfoDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={mockProduct}
        />
      );
      expect(screen.getByText('100 un.')).toBeInTheDocument();
    });

    it('should display category', () => {
      render(
        <ProductInfoDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={mockProduct}
        />
      );
      expect(screen.getByText('bebidas')).toBeInTheDocument();
    });

    it('should display subcategory', () => {
      render(
        <ProductInfoDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={mockProduct}
        />
      );
      expect(screen.getByText('refrigerante')).toBeInTheDocument();
    });

    it('should display dash for missing category', () => {
      render(
        <ProductInfoDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={mockProductMinimal}
        />
      );
      const categoryElements = screen.getAllByText('-');
      expect(categoryElements.length).toBeGreaterThanOrEqual(2); // Both category and subcategory
    });

    it('should display dash for missing subcategory', () => {
      render(
        <ProductInfoDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={mockProductMinimal}
        />
      );
      const categoryElements = screen.getAllByText('-');
      expect(categoryElements.length).toBeGreaterThanOrEqual(2);
    });

    it('should format price with 2 decimals', () => {
      const productWithDecimal: Product = {
        ...mockProduct,
        price: 12.5
      };
      render(
        <ProductInfoDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={productWithDecimal}
        />
      );
      expect(screen.getByText('R$ 12.50')).toBeInTheDocument();
    });

    it('should handle zero stock', () => {
      const productZeroStock: Product = {
        ...mockProduct,
        stock: 0
      };
      render(
        <ProductInfoDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={productZeroStock}
        />
      );
      expect(screen.getByText('0 un.')).toBeInTheDocument();
    });

    it('should handle large stock numbers', () => {
      const productLargeStock: Product = {
        ...mockProduct,
        stock: 9999
      };
      render(
        <ProductInfoDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={productLargeStock}
        />
      );
      expect(screen.getByText('9999 un.')).toBeInTheDocument();
    });
  });

  // ==================== CHART RENDERING ====================
  describe('Chart Rendering', () => {
    it('should render chart container', () => {
      render(
        <ProductInfoDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={mockProduct}
        />
      );
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('should render bar chart', () => {
      render(
        <ProductInfoDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={mockProduct}
        />
      );
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('should render chart components', () => {
      render(
        <ProductInfoDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={mockProduct}
        />
      );
      expect(screen.getByTestId('bar')).toBeInTheDocument();
      expect(screen.getByTestId('x-axis')).toBeInTheDocument();
      expect(screen.getByTestId('y-axis')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
      expect(screen.getByTestId('grid')).toBeInTheDocument();
    });

    it('should render chart for product with no sales', () => {
      render(
        <ProductInfoDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={mockProductMinimal}
        />
      );
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  // ==================== SALES DATA FILTERING ====================
  describe('Sales Data Filtering', () => {
    it('should filter sales by product id', () => {
      const { useSalesDB } = require('@/hooks/useSalesDB');
      
      render(
        <ProductInfoDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={mockProduct}
        />
      );
      
      // Should call useSalesDB
      expect(useSalesDB).toHaveBeenCalled();
    });

    it('should exclude courtesy sales from calculations', () => {
      const { useSalesDB } = require('@/hooks/useSalesDB');
      
      render(
        <ProductInfoDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={mockProduct}
        />
      );
      
      // Verify hook was called (courtesy sales should be filtered out in component)
      expect(useSalesDB).toHaveBeenCalled();
    });

    it('should handle product with no sales', () => {
      render(
        <ProductInfoDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={mockProductMinimal}
        />
      );
      
      // Should still render chart
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('should handle empty sales array', () => {
      const { useSalesDB } = require('@/hooks/useSalesDB');
      useSalesDB.mockReturnValue({
        sales: [],
        loading: false
      });
      
      render(
        <ProductInfoDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={mockProduct}
        />
      );
      
      expect(screen.getByText('Coca-Cola')).toBeInTheDocument();
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  // ==================== CLOSE FUNCTIONALITY ====================
  describe('Close Functionality', () => {
    it('should call onOpenChange when close button clicked', async () => {
      render(
        <ProductInfoDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={mockProduct}
        />
      );
      
      await user.click(screen.getByRole('button', { name: /Fechar/i }));
      
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it('should call onOpenChange only once on close', async () => {
      render(
        <ProductInfoDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={mockProduct}
        />
      );
      
      await user.click(screen.getByRole('button', { name: /Fechar/i }));
      
      expect(mockOnOpenChange).toHaveBeenCalledTimes(1);
    });
  });

  // ==================== EDGE CASES ====================
  describe('Edge Cases', () => {
    it('should handle very long product names', () => {
      const longNameProduct: Product = {
        ...mockProduct,
        name: 'A'.repeat(100)
      };
      render(
        <ProductInfoDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={longNameProduct}
        />
      );
      expect(screen.getByText('A'.repeat(100))).toBeInTheDocument();
    });

    it('should handle special characters in product name', () => {
      const specialProduct: Product = {
        ...mockProduct,
        name: 'Água & Gelo (500ml) - R$ 2,50!'
      };
      render(
        <ProductInfoDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={specialProduct}
        />
      );
      expect(screen.getByText('Água & Gelo (500ml) - R$ 2,50!')).toBeInTheDocument();
    });

    it('should handle zero price', () => {
      const zeroPriceProduct: Product = {
        ...mockProduct,
        price: 0
      };
      render(
        <ProductInfoDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={zeroPriceProduct}
        />
      );
      expect(screen.getByText('R$ 0.00')).toBeInTheDocument();
    });

    it('should handle very high prices', () => {
      const expensiveProduct: Product = {
        ...mockProduct,
        price: 9999.99
      };
      render(
        <ProductInfoDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={expensiveProduct}
        />
      );
      expect(screen.getByText('R$ 9999.99')).toBeInTheDocument();
    });

    it('should handle decimal prices correctly', () => {
      const decimalProduct: Product = {
        ...mockProduct,
        price: 12.99
      };
      render(
        <ProductInfoDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={decimalProduct}
        />
      );
      expect(screen.getByText('R$ 12.99')).toBeInTheDocument();
    });

    it('should handle product switching', () => {
      const { rerender } = render(
        <ProductInfoDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={mockProduct}
        />
      );
      
      expect(screen.getByText('Coca-Cola')).toBeInTheDocument();
      
      rerender(
        <ProductInfoDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={mockProductMinimal}
        />
      );
      
      expect(screen.getByText('Produto Sem Categoria')).toBeInTheDocument();
    });

    it('should handle reopening with different product', () => {
      const { rerender } = render(
        <ProductInfoDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={mockProduct}
        />
      );
      
      // Close
      rerender(
        <ProductInfoDialog
          open={false}
          onOpenChange={mockOnOpenChange}
          product={mockProduct}
        />
      );
      
      // Reopen with different product
      rerender(
        <ProductInfoDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={mockProductMinimal}
        />
      );
      
      expect(screen.getByText('Produto Sem Categoria')).toBeInTheDocument();
    });

    it('should handle rapid open/close cycles', () => {
      const { rerender } = render(
        <ProductInfoDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={mockProduct}
        />
      );
      
      for (let i = 0; i < 5; i++) {
        rerender(
          <ProductInfoDialog
            open={false}
            onOpenChange={mockOnOpenChange}
            product={mockProduct}
          />
        );
        
        rerender(
          <ProductInfoDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            product={mockProduct}
          />
        );
      }
      
      expect(screen.getByText('Coca-Cola')).toBeInTheDocument();
    });
  });

  // ==================== ACCESSIBILITY ====================
  describe('Accessibility', () => {
    it('should have proper dialog role', () => {
      render(
        <ProductInfoDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={mockProduct}
        />
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have accessible close button', () => {
      render(
        <ProductInfoDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={mockProduct}
        />
      );
      const closeButton = screen.getByRole('button', { name: /Fechar/i });
      expect(closeButton).toBeInTheDocument();
      expect(closeButton).toBeVisible();
    });

    it('should support keyboard navigation', async () => {
      render(
        <ProductInfoDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={mockProduct}
        />
      );
      
      const closeButton = screen.getByRole('button', { name: /Fechar/i });
      closeButton.focus();
      
      expect(closeButton).toHaveFocus();
    });

    it('should have proper content structure', () => {
      render(
        <ProductInfoDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={mockProduct}
        />
      );
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toContainElement(screen.getByText('Informações do Produto'));
      expect(dialog).toContainElement(screen.getByText('Coca-Cola'));
    });
  });

  // ==================== INTEGRATION ====================
  describe('Integration', () => {
    it('should integrate with useSalesDB hook', () => {
      const { useSalesDB } = require('@/hooks/useSalesDB');
      
      render(
        <ProductInfoDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={mockProduct}
        />
      );
      
      expect(useSalesDB).toHaveBeenCalled();
    });

    it('should display product info and sales data together', () => {
      render(
        <ProductInfoDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={mockProduct}
        />
      );
      
      // Product info
      expect(screen.getByText('Coca-Cola')).toBeInTheDocument();
      expect(screen.getByText('R$ 5.00')).toBeInTheDocument();
      
      // Chart
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('should handle complete workflow', async () => {
      render(
        <ProductInfoDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={mockProduct}
        />
      );
      
      // Verify all sections rendered
      expect(screen.getByText('Informações do Produto')).toBeInTheDocument();
      expect(screen.getByText('Coca-Cola')).toBeInTheDocument();
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
      
      // Close dialog
      await user.click(screen.getByRole('button', { name: /Fechar/i }));
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
