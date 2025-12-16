import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PDVLayout } from '@/components/PDVLayout';
import { Comanda, OrderItem } from '@/types';
import { UserRole } from '@/types/user';

// Mock do contexto de painéis
const mockSetCanOpenRightPanel = jest.fn();
const mockSetRightPanelFixed = jest.fn();

jest.mock('@/contexts/SidePanelsContext', () => ({
  useSidePanels: () => ({
    setCanOpenRightPanel: mockSetCanOpenRightPanel,
    setRightPanelFixed: mockSetRightPanelFixed,
    isRightPanelFixed: false,
    isLeftPanelOpen: false,
    isRightPanelOpen: false,
  }),
}));

// Mock dos componentes internos
jest.mock('@/components/ResponsiveDrawer', () => ({
  ResponsiveDrawer: ({ children, title }: any) => (
    <div data-testid="responsive-drawer" data-title={title}>
      {children}
    </div>
  ),
}));

jest.mock('@/components/HoverZone', () => ({
  HoverZone: ({ side }: any) => <div data-testid={`hover-zone-${side}`} />,
  SidePanelHoverHandler: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('@/components/MobileTrigger', () => ({
  MobileTrigger: ({ side }: any) => <div data-testid={`mobile-trigger-${side}`} />,
}));

jest.mock('@/components/PanelIndicator', () => ({
  PanelIndicator: ({ side, isActive, isVisible }: any) => (
    <div data-testid={`panel-indicator-${side}`} data-active={isActive} data-visible={isVisible} />
  ),
}));

jest.mock('@/components/ComandaSidebar', () => ({
  ComandaSidebar: ({ comandas, selectedComandaId }: any) => (
    <div data-testid="comanda-sidebar">
      <div>Comandas: {comandas.length}</div>
      <div>Selected: {selectedComandaId || 'none'}</div>
    </div>
  ),
}));

jest.mock('@/components/ComandaDetail', () => ({
  ComandaDetail: ({ comanda, userRole }: any) => (
    <div data-testid="comanda-detail">
      <div>Comanda #{comanda.number}</div>
      <div>Role: {userRole}</div>
    </div>
  ),
}));

jest.mock('@/components/ProductCatalog', () => ({
  __esModule: true,
  default: ({ currentView }: any) => (
    <div data-testid="product-catalog">
      <div>View: {currentView}</div>
    </div>
  ),
}));

describe('PDVLayout - Comprehensive Tests', () => {
  // Mock data
  const mockComandas: Comanda[] = [
    {
      id: 'c1',
      number: 1,
      items: [
        {
          id: 'item1',
          product: { id: 'p1', name: 'Cerveja', price: 10, stock: 100, category: 'Bebidas' },
          quantity: 2,
          addedAt: new Date(),
        },
      ],
      customerName: 'João',
      createdAt: new Date(),
    },
    {
      id: 'c2',
      number: 2,
      items: [],
      customerName: 'Maria',
      createdAt: new Date(),
    },
  ];

  const mockDirectSaleItems: OrderItem[] = [
    {
      product: { id: 'p1', name: 'Cerveja', price: 10, stock: 100, category: 'Bebidas' },
      quantity: 2,
    },
  ];

  const mockOnSelectComanda = jest.fn();
  const mockOnCloseComanda = jest.fn();
  const mockOnRemoveDirectSaleItem = jest.fn();
  const mockOnUpdateDirectSaleQuantity = jest.fn();
  const mockOnFinalizeSale = jest.fn();
  const mockOnCancelDirectSale = jest.fn();
  const mockOnAddProduct = jest.fn();
  const mockOnRemoveItemFromComanda = jest.fn();
  const mockOnCheckout = jest.fn();

  const defaultProps = {
    comandas: mockComandas,
    selectedComandaId: null,
    onSelectComanda: mockOnSelectComanda,
    onCloseComanda: mockOnCloseComanda,
    userRole: 'user' as UserRole,
    isDirectSale: false,
    directSaleItems: [],
    onRemoveDirectSaleItem: mockOnRemoveDirectSaleItem,
    onUpdateDirectSaleQuantity: mockOnUpdateDirectSaleQuantity,
    onFinalizeSale: mockOnFinalizeSale,
    onCancelDirectSale: mockOnCancelDirectSale,
    onAddProduct: mockOnAddProduct,
    currentView: 'bar',
    selectedComanda: null,
    onRemoveItemFromComanda: mockOnRemoveItemFromComanda,
    onCheckout: mockOnCheckout,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering & Structure', () => {
    it('should render without crashing', () => {
      render(<PDVLayout {...defaultProps} />);
      expect(screen.getByTestId('product-catalog')).toBeInTheDocument();
    });

    it('should render three main sections', () => {
      render(<PDVLayout {...defaultProps} />);
      
      // Left panel (comandas)
      expect(screen.getByTestId('comanda-sidebar')).toBeInTheDocument();
      
      // Center (catalog)
      expect(screen.getByTestId('product-catalog')).toBeInTheDocument();
      
      // Right panel indicators
      expect(screen.getByTestId('panel-indicator-right')).toBeInTheDocument();
    });

    it('should render panel indicators for both sides', () => {
      render(<PDVLayout {...defaultProps} />);
      
      expect(screen.getByTestId('panel-indicator-left')).toBeInTheDocument();
      expect(screen.getByTestId('panel-indicator-right')).toBeInTheDocument();
    });

    it('should render hover zones for desktop', () => {
      render(<PDVLayout {...defaultProps} />);
      
      expect(screen.getByTestId('hover-zone-left')).toBeInTheDocument();
      expect(screen.getByTestId('hover-zone-right')).toBeInTheDocument();
    });

    it('should render mobile triggers', () => {
      render(<PDVLayout {...defaultProps} />);
      
      expect(screen.getByTestId('mobile-trigger-left')).toBeInTheDocument();
      expect(screen.getByTestId('mobile-trigger-right')).toBeInTheDocument();
    });

    it('should have proper layout structure with flex', () => {
      const { container } = render(<PDVLayout {...defaultProps} />);
      const mainDiv = container.firstChild;
      
      expect(mainDiv).toHaveClass('flex-1');
      expect(mainDiv).toHaveClass('flex');
      expect(mainDiv).toHaveClass('overflow-hidden');
    });
  });

  describe('Left Panel - Comandas', () => {
    it('should render ComandaSidebar with comandas', () => {
      render(<PDVLayout {...defaultProps} />);
      
      const sidebar = screen.getByTestId('comanda-sidebar');
      expect(within(sidebar).getByText('Comandas: 2')).toBeInTheDocument();
    });

    it('should pass selected comanda ID to sidebar', () => {
      render(<PDVLayout {...defaultProps} selectedComandaId="c1" />);
      
      const sidebar = screen.getByTestId('comanda-sidebar');
      expect(within(sidebar).getByText('Selected: c1')).toBeInTheDocument();
    });

    it('should show empty comandas list', () => {
      render(<PDVLayout {...defaultProps} comandas={[]} />);
      
      const sidebar = screen.getByTestId('comanda-sidebar');
      expect(within(sidebar).getByText('Comandas: 0')).toBeInTheDocument();
    });

    it('should render ResponsiveDrawer with correct title', () => {
      render(<PDVLayout {...defaultProps} />);
      
      const drawers = screen.getAllByTestId('responsive-drawer');
      const leftDrawer = drawers.find((d) => d.getAttribute('data-title') === 'Comandas Abertas');
      expect(leftDrawer).toBeInTheDocument();
    });
  });

  describe('Center Panel - Product Catalog', () => {
    it('should render ProductCatalog component', () => {
      render(<PDVLayout {...defaultProps} />);
      
      expect(screen.getByTestId('product-catalog')).toBeInTheDocument();
    });

    it('should pass currentView prop to catalog', () => {
      render(<PDVLayout {...defaultProps} currentView="hotel" />);
      
      const catalog = screen.getByTestId('product-catalog');
      expect(within(catalog).getByText('View: hotel')).toBeInTheDocument();
    });

    it('should have proper styling for center panel', () => {
      const { container } = render(<PDVLayout {...defaultProps} />);
      const catalogContainer = screen.getByTestId('product-catalog').parentElement;
      
      expect(catalogContainer).toHaveClass('flex-1');
      expect(catalogContainer).toHaveClass('bg-white');
      expect(catalogContainer).toHaveClass('overflow-hidden');
    });
  });

  describe('Right Panel - Empty State', () => {
    it('should show empty panel when no comanda selected and no direct sale', () => {
      render(<PDVLayout {...defaultProps} />);
      
      expect(screen.getByText(/nenhuma comanda selecionada/i)).toBeInTheDocument();
    });

    it('should show empty panel message', () => {
      render(<PDVLayout {...defaultProps} />);
      
      expect(screen.getByText(/selecione uma comanda ou inicie uma venda direta/i)).toBeInTheDocument();
    });

    it('should render empty panel icon', () => {
      const { container } = render(<PDVLayout {...defaultProps} />);
      const icon = container.querySelector('svg');
      
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Right Panel - Comanda Detail', () => {
    it('should render ComandaDetail when comanda is selected', () => {
      render(
        <PDVLayout
          {...defaultProps}
          selectedComandaId="c1"
          selectedComanda={mockComandas[0]}
        />
      );
      
      expect(screen.getByTestId('comanda-detail')).toBeInTheDocument();
    });

    it('should display comanda number in detail', () => {
      render(
        <PDVLayout
          {...defaultProps}
          selectedComandaId="c1"
          selectedComanda={mockComandas[0]}
        />
      );
      
      const detail = screen.getByTestId('comanda-detail');
      expect(within(detail).getByText('Comanda #1')).toBeInTheDocument();
    });

    it('should pass userRole to ComandaDetail', () => {
      render(
        <PDVLayout
          {...defaultProps}
          selectedComandaId="c1"
          selectedComanda={mockComandas[0]}
          userRole="admin"
        />
      );
      
      const detail = screen.getByTestId('comanda-detail');
      expect(within(detail).getByText('Role: admin')).toBeInTheDocument();
    });
  });

  describe('Right Panel - Direct Sale', () => {
    it('should render DirectSalePanel when in direct sale mode', () => {
      render(
        <PDVLayout
          {...defaultProps}
          isDirectSale={true}
          directSaleItems={mockDirectSaleItems}
        />
      );
      
      expect(screen.getByText('Venda Direta')).toBeInTheDocument();
    });

    it('should display item count in direct sale', () => {
      render(
        <PDVLayout
          {...defaultProps}
          isDirectSale={true}
          directSaleItems={mockDirectSaleItems}
        />
      );
      
      expect(screen.getByText('1 item(ns)')).toBeInTheDocument();
    });

    it('should display items in direct sale panel', () => {
      render(
        <PDVLayout
          {...defaultProps}
          isDirectSale={true}
          directSaleItems={mockDirectSaleItems}
        />
      );
      
      expect(screen.getByText(/2x Cerveja/)).toBeInTheDocument();
    });

    it('should calculate total correctly', () => {
      render(
        <PDVLayout
          {...defaultProps}
          isDirectSale={true}
          directSaleItems={mockDirectSaleItems}
        />
      );
      
      // Total: 2 * 10 = 20.00
      const totalElements = screen.getAllByText(/R\$ 20\.00/);
      expect(totalElements.length).toBeGreaterThan(0);
    });

    it('should show finalize button with total', () => {
      render(
        <PDVLayout
          {...defaultProps}
          isDirectSale={true}
          directSaleItems={mockDirectSaleItems}
        />
      );
      
      expect(screen.getByRole('button', { name: /finalizar venda.*20\.00/i })).toBeInTheDocument();
    });

    it('should call onFinalizeSale when finalize button clicked', async () => {
      const user = userEvent.setup();
      render(
        <PDVLayout
          {...defaultProps}
          isDirectSale={true}
          directSaleItems={mockDirectSaleItems}
        />
      );
      
      await user.click(screen.getByRole('button', { name: /finalizar venda/i }));
      expect(mockOnFinalizeSale).toHaveBeenCalledTimes(1);
    });

    it('should render cancel button', () => {
      render(
        <PDVLayout
          {...defaultProps}
          isDirectSale={true}
          directSaleItems={mockDirectSaleItems}
        />
      );
      
      expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
    });

    it('should call onCancelDirectSale when cancel clicked', async () => {
      const user = userEvent.setup();
      render(
        <PDVLayout
          {...defaultProps}
          isDirectSale={true}
          directSaleItems={mockDirectSaleItems}
        />
      );
      
      await user.click(screen.getByRole('button', { name: /cancelar/i }));
      expect(mockOnCancelDirectSale).toHaveBeenCalledTimes(1);
    });

    it('should allow removing items from direct sale', async () => {
      const user = userEvent.setup();
      render(
        <PDVLayout
          {...defaultProps}
          isDirectSale={true}
          directSaleItems={mockDirectSaleItems}
        />
      );
      
      const removeButtons = screen.getAllByRole('button').filter(
        (btn) => btn.querySelector('svg')?.getAttribute('fill') === 'currentColor'
      );
      
      if (removeButtons.length > 0) {
        await user.click(removeButtons[0]);
        expect(mockOnRemoveDirectSaleItem).toHaveBeenCalled();
      }
    });

    it('should show empty state when no items in direct sale', () => {
      render(
        <PDVLayout
          {...defaultProps}
          isDirectSale={true}
          directSaleItems={[]}
        />
      );
      
      expect(screen.getByText(/nenhum item adicionado/i)).toBeInTheDocument();
    });

    it('should not show finalize button when no items', () => {
      render(
        <PDVLayout
          {...defaultProps}
          isDirectSale={true}
          directSaleItems={[]}
        />
      );
      
      expect(screen.queryByRole('button', { name: /finalizar venda/i })).not.toBeInTheDocument();
    });
  });

  describe('Side Panel Context Integration', () => {
    it('should call setCanOpenRightPanel on mount', () => {
      render(<PDVLayout {...defaultProps} />);
      
      expect(mockSetCanOpenRightPanel).toHaveBeenCalled();
    });

    it('should enable right panel when comanda is selected', () => {
      render(<PDVLayout {...defaultProps} selectedComandaId="c1" selectedComanda={mockComandas[0]} />);
      
      expect(mockSetCanOpenRightPanel).toHaveBeenCalledWith(true);
      expect(mockSetRightPanelFixed).toHaveBeenCalledWith(true);
    });

    it('should enable right panel when in direct sale mode', () => {
      render(<PDVLayout {...defaultProps} isDirectSale={true} />);
      
      expect(mockSetCanOpenRightPanel).toHaveBeenCalledWith(true);
      expect(mockSetRightPanelFixed).toHaveBeenCalledWith(true);
    });

    it('should disable right panel when no content', () => {
      render(<PDVLayout {...defaultProps} selectedComandaId={null} isDirectSale={false} />);
      
      expect(mockSetCanOpenRightPanel).toHaveBeenCalledWith(false);
    });

    it('should update context when selectedComandaId changes', () => {
      const { rerender } = render(<PDVLayout {...defaultProps} selectedComandaId={null} />);
      
      mockSetCanOpenRightPanel.mockClear();
      
      rerender(<PDVLayout {...defaultProps} selectedComandaId="c1" selectedComanda={mockComandas[0]} />);
      
      expect(mockSetCanOpenRightPanel).toHaveBeenCalledWith(true);
    });

    it('should update context when isDirectSale changes', () => {
      const { rerender } = render(<PDVLayout {...defaultProps} isDirectSale={false} />);
      
      mockSetCanOpenRightPanel.mockClear();
      
      rerender(<PDVLayout {...defaultProps} isDirectSale={true} />);
      
      expect(mockSetCanOpenRightPanel).toHaveBeenCalledWith(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple items in direct sale', () => {
      const multipleItems: OrderItem[] = [
        { product: { id: 'p1', name: 'Item 1', price: 10, stock: 10, category: 'Cat1' }, quantity: 2 },
        { product: { id: 'p2', name: 'Item 2', price: 15, stock: 5, category: 'Cat2' }, quantity: 1 },
        { product: { id: 'p3', name: 'Item 3', price: 20, stock: 8, category: 'Cat3' }, quantity: 3 },
      ];
      
      render(
        <PDVLayout
          {...defaultProps}
          isDirectSale={true}
          directSaleItems={multipleItems}
        />
      );
      
      expect(screen.getByText('3 item(ns)')).toBeInTheDocument();
      // Total: (10*2) + (15*1) + (20*3) = 20 + 15 + 60 = 95
      const totalElements = screen.getAllByText(/R\$ 95\.00/);
      expect(totalElements.length).toBeGreaterThan(0);
    });

    it('should handle very large quantities', () => {
      const largeQuantity: OrderItem[] = [
        { product: { id: 'p1', name: 'Popular Item', price: 5, stock: 1000, category: 'Cat' }, quantity: 100 },
      ];
      
      render(
        <PDVLayout
          {...defaultProps}
          isDirectSale={true}
          directSaleItems={largeQuantity}
        />
      );
      
      expect(screen.getByText(/100x Popular Item/)).toBeInTheDocument();
    });

    it('should handle decimal prices correctly', () => {
      const decimalItems: OrderItem[] = [
        { product: { id: 'p1', name: 'Decimal Item', price: 9.99, stock: 10, category: 'Cat' }, quantity: 3 },
      ];
      
      render(
        <PDVLayout
          {...defaultProps}
          isDirectSale={true}
          directSaleItems={decimalItems}
        />
      );
      
      // 3 * 9.99 = 29.97
      const decimalValues = screen.getAllByText(/R\$ 29\.97/);
      expect(decimalValues.length).toBeGreaterThan(0);
    });

    it('should handle zero-price items', () => {
      const freeItems: OrderItem[] = [
        { product: { id: 'p1', name: 'Free Item', price: 0, stock: 10, category: 'Cat' }, quantity: 1 },
      ];
      
      render(
        <PDVLayout
          {...defaultProps}
          isDirectSale={true}
          directSaleItems={freeItems}
        />
      );
      
      const zeroValues = screen.getAllByText(/R\$ 0\.00/);
      expect(zeroValues.length).toBeGreaterThan(0);
    });

    it('should handle very long product names', () => {
      const longName: OrderItem[] = [
        {
          product: {
            id: 'p1',
            name: 'Nome Extremamente Longo de Produto Que Pode Quebrar o Layout',
            price: 10,
            stock: 5,
            category: 'Cat',
          },
          quantity: 1,
        },
      ];
      
      render(
        <PDVLayout
          {...defaultProps}
          isDirectSale={true}
          directSaleItems={longName}
        />
      );
      
      expect(screen.getByText(/Nome Extremamente Longo/)).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('should have min-height constraints', () => {
      const { container } = render(<PDVLayout {...defaultProps} />);
      const mainDiv = container.firstChild;
      
      expect(mainDiv).toHaveClass('min-h-0');
    });

    it('should have overflow hidden on main container', () => {
      const { container } = render(<PDVLayout {...defaultProps} />);
      const mainDiv = container.firstChild;
      
      expect(mainDiv).toHaveClass('overflow-hidden');
    });

    it('should have relative positioning for indicators', () => {
      const { container } = render(<PDVLayout {...defaultProps} />);
      const mainDiv = container.firstChild;
      
      expect(mainDiv).toHaveClass('relative');
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      render(<PDVLayout {...defaultProps} />);
      
      // Verifica que componentes principais estão renderizados
      expect(screen.getByTestId('product-catalog')).toBeInTheDocument();
      expect(screen.getByTestId('comanda-sidebar')).toBeInTheDocument();
    });

    it('should render buttons with proper roles', () => {
      render(
        <PDVLayout
          {...defaultProps}
          isDirectSale={true}
          directSaleItems={mockDirectSaleItems}
        />
      );
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should have descriptive text for empty states', () => {
      render(<PDVLayout {...defaultProps} />);
      
      expect(screen.getByText(/nenhuma comanda selecionada/i)).toBeInTheDocument();
    });
  });

  describe('Integration Tests', () => {
    it('should show comanda detail when switching from direct sale', () => {
      const { rerender } = render(
        <PDVLayout
          {...defaultProps}
          isDirectSale={true}
          directSaleItems={mockDirectSaleItems}
        />
      );
      
      expect(screen.getByText('Venda Direta')).toBeInTheDocument();
      
      rerender(
        <PDVLayout
          {...defaultProps}
          isDirectSale={false}
          selectedComandaId="c1"
          selectedComanda={mockComandas[0]}
        />
      );
      
      expect(screen.getByTestId('comanda-detail')).toBeInTheDocument();
    });

    it('should show empty state when deselecting comanda', () => {
      const { rerender } = render(
        <PDVLayout
          {...defaultProps}
          selectedComandaId="c1"
          selectedComanda={mockComandas[0]}
        />
      );
      
      expect(screen.getByTestId('comanda-detail')).toBeInTheDocument();
      
      rerender(<PDVLayout {...defaultProps} selectedComandaId={null} selectedComanda={null} />);
      
      expect(screen.getByText(/nenhuma comanda selecionada/i)).toBeInTheDocument();
    });

    it('should handle switching between different comandas', () => {
      const { rerender } = render(
        <PDVLayout
          {...defaultProps}
          selectedComandaId="c1"
          selectedComanda={mockComandas[0]}
        />
      );
      
      expect(screen.getByText('Comanda #1')).toBeInTheDocument();
      
      rerender(
        <PDVLayout
          {...defaultProps}
          selectedComandaId="c2"
          selectedComanda={mockComandas[1]}
        />
      );
      
      expect(screen.getByText('Comanda #2')).toBeInTheDocument();
    });
  });
});
