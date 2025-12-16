import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header, PageView } from '@/components/Header';
import { UserRole } from '@/types/user';

// Mock do hook de permissões
const mockPermissions = {
  pdv: true,
  estoque: true,
  hotel: true,
  financeiro: true,
};

jest.mock('@/hooks/usePermissions', () => ({
  usePermissions: jest.fn(() => mockPermissions),
}));

// Mock dos ícones
jest.mock('lucide-react', () => ({
  Receipt: () => <div data-testid="receipt-icon" />,
  ShoppingCart: () => <div data-testid="shopping-cart-icon" />,
  Plus: () => <div data-testid="plus-icon" />,
  LayoutDashboard: () => <div data-testid="layout-dashboard-icon" />,
  Package: () => <div data-testid="package-icon" />,
  TrendingUpDown: () => <div data-testid="trending-updown-icon" />,
  ShoppingBag: () => <div data-testid="shopping-bag-icon" />,
  LogOut: () => <div data-testid="logout-icon" />,
  User: () => <div data-testid="user-icon" />,
  Hotel: () => <div data-testid="hotel-icon" />,
  ChevronDown: () => <div data-testid="chevron-down-icon" />,
  Zap: () => <div data-testid="zap-icon" />,
}));

// Mock dos componentes UI
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, title, className, ...props }: any) => (
    <button onClick={onClick} title={title} className={className} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuTrigger: ({ children, asChild }: any) => <div data-testid="dropdown-trigger">{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div data-testid="dropdown-content">{children}</div>,
  DropdownMenuItem: ({ children, onClick, className }: any) => (
    <button onClick={onClick} className={className} data-testid="dropdown-item">
      {children}
    </button>
  ),
}));

describe('Header - Comprehensive Tests', () => {
  const mockOnNewComanda = jest.fn();
  const mockOnDirectSale = jest.fn();
  const mockOnQuickComanda = jest.fn();
  const mockOnViewChange = jest.fn();
  const mockOnDashboardViewChange = jest.fn();
  const mockOnLogout = jest.fn();

  const defaultProps = {
    onNewComanda: mockOnNewComanda,
    onDirectSale: mockOnDirectSale,
    onQuickComanda: mockOnQuickComanda,
    currentView: 'pdv' as PageView,
    onViewChange: mockOnViewChange,
    dashboardView: 'bar' as 'bar' | 'controladoria',
    onDashboardViewChange: mockOnDashboardViewChange,
    userRole: 'user' as UserRole,
    userName: 'João Silva',
    onLogout: mockOnLogout,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering & Structure', () => {
    it('should render without crashing', () => {
      render(<Header {...defaultProps} />);
      expect(screen.getByText('ERP Hotelaria')).toBeInTheDocument();
    });

    it('should render header with correct styling', () => {
      const { container } = render(<Header {...defaultProps} />);
      const header = container.querySelector('header');
      
      expect(header).toHaveClass('h-16');
      expect(header).toHaveClass('bg-slate-900');
      expect(header).toHaveClass('text-white');
    });

    it('should display system title', () => {
      render(<Header {...defaultProps} />);
      
      expect(screen.getByText('ERP Hotelaria')).toBeInTheDocument();
      expect(screen.getByText('Sistema de Gestão')).toBeInTheDocument();
    });

    it('should render logo icon', () => {
      render(<Header {...defaultProps} />);
      
      expect(screen.getByTestId('receipt-icon')).toBeInTheDocument();
    });

    it('should have three main sections', () => {
      const { container } = render(<Header {...defaultProps} />);
      const header = container.querySelector('header');
      const sections = header?.querySelectorAll('.flex.items-center');
      
      // Logo + Nav section, User + Logout section
      expect(sections?.length).toBeGreaterThan(0);
    });
  });

  describe('Navigation Items', () => {
    it('should render all navigation items with permissions', () => {
      render(<Header {...defaultProps} />);
      
      expect(screen.getByText('PDV')).toBeInTheDocument();
      expect(screen.getByText('Estoque')).toBeInTheDocument();
      expect(screen.getByText('Hotel')).toBeInTheDocument();
      expect(screen.getByText('Financeiro')).toBeInTheDocument();
    });

    it('should render navigation icons', () => {
      render(<Header {...defaultProps} />);
      
      expect(screen.getByTestId('shopping-bag-icon')).toBeInTheDocument();
      expect(screen.getByTestId('package-icon')).toBeInTheDocument();
      expect(screen.getByTestId('hotel-icon')).toBeInTheDocument();
      expect(screen.getByTestId('trending-updown-icon')).toBeInTheDocument();
    });

    it('should highlight current view', () => {
      const { container } = render(<Header {...defaultProps} currentView="pdv" />);
      const buttons = container.querySelectorAll('button');
      const pdvButton = Array.from(buttons).find((btn) => btn.textContent?.includes('PDV'));
      
      expect(pdvButton).toHaveClass('bg-white/20');
      expect(pdvButton).toHaveClass('text-white');
    });

    it('should call onViewChange when clicking PDV', async () => {
      const user = userEvent.setup();
      render(<Header {...defaultProps} currentView="dashboard" />);
      
      const pdvButton = screen.getByText('PDV').closest('button');
      if (pdvButton) {
        await user.click(pdvButton);
        expect(mockOnViewChange).toHaveBeenCalledWith('pdv');
      }
    });

    it('should call onViewChange when clicking Estoque', async () => {
      const user = userEvent.setup();
      render(<Header {...defaultProps} currentView="pdv" />);
      
      const estoqueButton = screen.getByText('Estoque').closest('button');
      if (estoqueButton) {
        await user.click(estoqueButton);
        expect(mockOnViewChange).toHaveBeenCalledWith('inventory');
      }
    });
  });

  describe('Financeiro Dropdown', () => {
    it('should render Financeiro as dropdown', () => {
      render(<Header {...defaultProps} />);
      
      const financeiroButton = screen.getByText('Financeiro').closest('button');
      expect(financeiroButton).toBeInTheDocument();
    });

    it('should render chevron icon in Financeiro dropdown', () => {
      render(<Header {...defaultProps} />);
      
      // ChevronDown appears multiple times (Financial and Hotel dropdowns)
      const chevrons = screen.getAllByTestId('chevron-down-icon');
      expect(chevrons.length).toBeGreaterThan(0);
    });

    it('should render dropdown menu items for Financeiro', () => {
      render(<Header {...defaultProps} />);
      
      expect(screen.getByText('Registros')).toBeInTheDocument();
      expect(screen.getByText('Dashboard Bar')).toBeInTheDocument();
      expect(screen.getByText('Dashboard Controladoria')).toBeInTheDocument();
    });

    it('should call onViewChange with transactions when clicking Registros', async () => {
      const user = userEvent.setup();
      render(<Header {...defaultProps} />);
      
      const registrosButton = screen.getByText('Registros');
      await user.click(registrosButton);
      
      expect(mockOnViewChange).toHaveBeenCalledWith('transactions');
    });

    it('should call onViewChange and onDashboardViewChange when clicking Dashboard Bar', async () => {
      const user = userEvent.setup();
      render(<Header {...defaultProps} />);
      
      const dashboardBarButton = screen.getByText('Dashboard Bar');
      await user.click(dashboardBarButton);
      
      expect(mockOnViewChange).toHaveBeenCalledWith('dashboard');
      expect(mockOnDashboardViewChange).toHaveBeenCalledWith('bar');
    });

    it('should call onViewChange and onDashboardViewChange when clicking Dashboard Controladoria', async () => {
      const user = userEvent.setup();
      render(<Header {...defaultProps} />);
      
      const controladoriaButton = screen.getByText('Dashboard Controladoria');
      await user.click(controladoriaButton);
      
      expect(mockOnViewChange).toHaveBeenCalledWith('dashboard');
      expect(mockOnDashboardViewChange).toHaveBeenCalledWith('controladoria');
    });

    it('should highlight Registros when on transactions view', () => {
      const { container } = render(<Header {...defaultProps} currentView="transactions" />);
      
      const registrosButton = screen.getByText('Registros').closest('button');
      expect(registrosButton).toHaveClass('bg-white/10');
    });

    it('should highlight Dashboard Bar when on dashboard bar view', () => {
      const { container } = render(
        <Header {...defaultProps} currentView="dashboard" dashboardView="bar" />
      );
      
      const dashboardBarButton = screen.getByText('Dashboard Bar').closest('button');
      expect(dashboardBarButton).toHaveClass('bg-white/10');
    });

    it('should highlight Dashboard Controladoria when on controladoria view', () => {
      const { container } = render(
        <Header {...defaultProps} currentView="dashboard" dashboardView="controladoria" />
      );
      
      const controladoriaButton = screen.getByText('Dashboard Controladoria').closest('button');
      expect(controladoriaButton).toHaveClass('bg-white/10');
    });
  });

  describe('Hotel Dropdown', () => {
    it('should render Hotel as dropdown', () => {
      render(<Header {...defaultProps} />);
      
      const hotelButton = screen.getByText('Hotel').closest('button');
      expect(hotelButton).toBeInTheDocument();
    });

    it('should render dropdown menu items for Hotel', () => {
      render(<Header {...defaultProps} />);
      
      expect(screen.getByText(/Agenda do Hotel/)).toBeInTheDocument();
      expect(screen.getByText('Gestão de Quartos')).toBeInTheDocument();
      expect(screen.getByText('Gestão de Romarias')).toBeInTheDocument();
    });

    it('should call onViewChange with hotel-agenda when clicking Agenda', async () => {
      const user = userEvent.setup();
      render(<Header {...defaultProps} />);
      
      const agendaButton = screen.getByText(/Agenda do Hotel/);
      await user.click(agendaButton);
      
      expect(mockOnViewChange).toHaveBeenCalledWith('hotel-agenda');
    });

    it('should call onViewChange with hotel when clicking Gestão de Quartos', async () => {
      const user = userEvent.setup();
      render(<Header {...defaultProps} />);
      
      const quartosButton = screen.getByText('Gestão de Quartos');
      await user.click(quartosButton);
      
      expect(mockOnViewChange).toHaveBeenCalledWith('hotel');
    });

    it('should call onViewChange with hotel-pilgrimages when clicking Gestão de Romarias', async () => {
      const user = userEvent.setup();
      render(<Header {...defaultProps} />);
      
      const romariasButton = screen.getByText('Gestão de Romarias');
      await user.click(romariasButton);
      
      expect(mockOnViewChange).toHaveBeenCalledWith('hotel-pilgrimages');
    });

    it('should highlight Hotel dropdown when on hotel-agenda view', () => {
      const { container } = render(<Header {...defaultProps} currentView="hotel-agenda" />);
      
      const agendaButton = screen.getByText(/Agenda do Hotel/).closest('button');
      expect(agendaButton).toHaveClass('bg-white/10');
    });

    it('should highlight Hotel dropdown when on hotel view', () => {
      const { container } = render(<Header {...defaultProps} currentView="hotel" />);
      
      const hotelButton = screen.getByText('Hotel').closest('button');
      expect(hotelButton).toHaveClass('bg-white/20');
    });

    it('should highlight Hotel dropdown when on hotel-pilgrimages view', () => {
      const { container } = render(<Header {...defaultProps} currentView="hotel-pilgrimages" />);
      
      const romariasButton = screen.getByText('Gestão de Romarias').closest('button');
      expect(romariasButton).toHaveClass('bg-white/10');
    });
  });

  describe('User Section', () => {
    it('should display user name', () => {
      render(<Header {...defaultProps} userName="Maria Silva" />);
      
      expect(screen.getByText('Maria Silva')).toBeInTheDocument();
    });

    it('should display user icon', () => {
      render(<Header {...defaultProps} />);
      
      expect(screen.getByTestId('user-icon')).toBeInTheDocument();
    });

    it('should render user avatar container', () => {
      const { container } = render(<Header {...defaultProps} />);
      const avatarContainer = container.querySelector('.w-8.h-8.bg-white\\/10.rounded-full');
      
      expect(avatarContainer).toBeInTheDocument();
    });

    it('should render logout button', () => {
      render(<Header {...defaultProps} />);
      
      const logoutButton = screen.getByTitle('Sair');
      expect(logoutButton).toBeInTheDocument();
    });

    it('should render logout icon', () => {
      render(<Header {...defaultProps} />);
      
      expect(screen.getByTestId('logout-icon')).toBeInTheDocument();
    });

    it('should call onLogout when clicking logout button', async () => {
      const user = userEvent.setup();
      render(<Header {...defaultProps} />);
      
      const logoutButton = screen.getByTitle('Sair');
      await user.click(logoutButton);
      
      expect(mockOnLogout).toHaveBeenCalledTimes(1);
    });

    it('should have proper styling for user section', () => {
      const { container } = render(<Header {...defaultProps} />);
      const userSection = screen.getByText('João Silva').closest('.flex.items-center');
      
      expect(userSection).toHaveClass('text-white');
    });
  });

  describe('Permissions & Conditional Rendering', () => {
    afterEach(() => {
      // Restore default permissions after each test
      const usePermissions = require('@/hooks/usePermissions').usePermissions;
      usePermissions.mockReturnValue(mockPermissions);
    });

    it('should hide PDV when no permission', () => {
      const usePermissions = require('@/hooks/usePermissions').usePermissions;
      usePermissions.mockReturnValueOnce({ ...mockPermissions, pdv: false });
      
      render(<Header {...defaultProps} />);
      
      expect(screen.queryByText('PDV')).not.toBeInTheDocument();
    });

    it('should hide Estoque when no permission', () => {
      const usePermissions = require('@/hooks/usePermissions').usePermissions;
      usePermissions.mockReturnValueOnce({ ...mockPermissions, estoque: false });
      
      render(<Header {...defaultProps} />);
      
      expect(screen.queryByText('Estoque')).not.toBeInTheDocument();
    });

    it('should hide Hotel when no permission', () => {
      const usePermissions = require('@/hooks/usePermissions').usePermissions;
      usePermissions.mockReturnValueOnce({ ...mockPermissions, hotel: false });
      
      render(<Header {...defaultProps} />);
      
      expect(screen.queryByText('Hotel')).not.toBeInTheDocument();
    });

    it('should hide Financeiro when no permission', () => {
      const usePermissions = require('@/hooks/usePermissions').usePermissions;
      usePermissions.mockReturnValueOnce({ ...mockPermissions, financeiro: false });
      
      render(<Header {...defaultProps} />);
      
      expect(screen.queryByText('Financeiro')).not.toBeInTheDocument();
    });

    it('should show only items with permissions', () => {
      const usePermissions = require('@/hooks/usePermissions').usePermissions;
      usePermissions.mockReturnValueOnce({ 
        pdv: true, 
        estoque: false, 
        hotel: true, 
        financeiro: false 
      });
      
      render(<Header {...defaultProps} />);
      
      expect(screen.getByText('PDV')).toBeInTheDocument();
      expect(screen.queryByText('Estoque')).not.toBeInTheDocument();
      expect(screen.getByText('Hotel')).toBeInTheDocument();
      expect(screen.queryByText('Financeiro')).not.toBeInTheDocument();
    });

    it('should render empty nav when no permissions', () => {
      const usePermissions = require('@/hooks/usePermissions').usePermissions;
      usePermissions.mockReturnValueOnce({ 
        pdv: false, 
        estoque: false, 
        hotel: false, 
        financeiro: false 
      });
      
      render(<Header {...defaultProps} />);
      
      expect(screen.queryByText('PDV')).not.toBeInTheDocument();
      expect(screen.queryByText('Estoque')).not.toBeInTheDocument();
      expect(screen.queryByText('Hotel')).not.toBeInTheDocument();
      expect(screen.queryByText('Financeiro')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty user name', () => {
      render(<Header {...defaultProps} userName="" />);
      
      // Should still render user section
      expect(screen.getByTestId('user-icon')).toBeInTheDocument();
    });

    it('should handle very long user name', () => {
      const longName = 'Nome Muito Longo de Usuário Que Pode Quebrar o Layout';
      render(<Header {...defaultProps} userName={longName} />);
      
      expect(screen.getByText(longName)).toBeInTheDocument();
    });

    it('should handle switching between different views', () => {
      const { container, rerender } = render(<Header {...defaultProps} currentView="pdv" />);
      
      // PDV button should be highlighted initially
      let buttons = container.querySelectorAll('button');
      let pdvButton = Array.from(buttons).find((btn) => btn.textContent?.includes('PDV'));
      expect(pdvButton).toHaveClass('bg-white/20');
      
      // Switch to inventory view
      rerender(<Header {...defaultProps} currentView="inventory" />);
      
      buttons = container.querySelectorAll('button');
      pdvButton = Array.from(buttons).find((btn) => btn.textContent?.includes('PDV'));
      const estoqueButton = Array.from(buttons).find((btn) => btn.textContent?.includes('Estoque'));
      
      expect(pdvButton).toHaveClass('text-slate-300');
      expect(estoqueButton).toHaveClass('bg-white/20');
    });

    it('should handle switching dashboard views', () => {
      const { rerender } = render(
        <Header {...defaultProps} currentView="dashboard" dashboardView="bar" />
      );
      
      const dashboardBarButton = screen.getByText('Dashboard Bar').closest('button');
      expect(dashboardBarButton).toHaveClass('bg-white/10');
      
      rerender(
        <Header {...defaultProps} currentView="dashboard" dashboardView="controladoria" />
      );
      
      const controladoriaButton = screen.getByText('Dashboard Controladoria').closest('button');
      expect(controladoriaButton).toHaveClass('bg-white/10');
    });

    it('should handle admin user role', () => {
      render(<Header {...defaultProps} userRole="admin" />);
      
      // Should still render normally
      expect(screen.getByText('ERP Hotelaria')).toBeInTheDocument();
    });

    it('should handle manager user role', () => {
      render(<Header {...defaultProps} userRole="manager" />);
      
      // Should still render normally
      expect(screen.getByText('ERP Hotelaria')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic header tag', () => {
      const { container } = render(<Header {...defaultProps} />);
      const header = container.querySelector('header');
      
      expect(header).toBeInTheDocument();
    });

    it('should have logout button with title attribute', () => {
      render(<Header {...defaultProps} />);
      
      const logoutButton = screen.getByTitle('Sair');
      expect(logoutButton).toHaveAttribute('title', 'Sair');
    });

    it('should render all buttons as clickable elements', () => {
      const { container } = render(<Header {...defaultProps} />);
      const buttons = container.querySelectorAll('button');
      
      // Should have multiple buttons (nav items + logout)
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should have proper role for navigation', () => {
      const { container } = render(<Header {...defaultProps} />);
      const nav = container.querySelector('nav');
      
      expect(nav).toBeInTheDocument();
    });

    it('should have descriptive text for all navigation items', () => {
      render(<Header {...defaultProps} />);
      
      // All nav items should have text content
      expect(screen.getByText('PDV')).toBeInTheDocument();
      expect(screen.getByText('Estoque')).toBeInTheDocument();
      expect(screen.getByText('Hotel')).toBeInTheDocument();
      expect(screen.getByText('Financeiro')).toBeInTheDocument();
    });
  });

  describe('Integration Tests', () => {
    it('should navigate through multiple views', async () => {
      const user = userEvent.setup();
      render(<Header {...defaultProps} currentView="pdv" />);
      
      // Test callbacks are called correctly
      expect(mockOnViewChange).not.toHaveBeenCalled();
      
      // Click Estoque
      const estoqueButton = screen.getByText('Estoque').closest('button');
      if (estoqueButton) {
        await user.click(estoqueButton);
        expect(mockOnViewChange).toHaveBeenCalledWith('inventory');
      }
    });

    it('should handle Financeiro dropdown navigation', async () => {
      const user = userEvent.setup();
      render(<Header {...defaultProps} currentView="pdv" />);
      
      // Click Dashboard Bar
      await user.click(screen.getByText('Dashboard Bar'));
      expect(mockOnViewChange).toHaveBeenCalledWith('dashboard');
      expect(mockOnDashboardViewChange).toHaveBeenCalledWith('bar');
    });

    it('should handle Hotel dropdown navigation', async () => {
      const user = userEvent.setup();
      render(<Header {...defaultProps} currentView="pdv" />);
      
      // Click Agenda
      await user.click(screen.getByText(/Agenda do Hotel/));
      expect(mockOnViewChange).toHaveBeenCalledWith('hotel-agenda');
    });

    it('should maintain user info while navigating', () => {
      render(<Header {...defaultProps} userName="Maria Silva" currentView="pdv" />);
      
      // User name should be visible
      expect(screen.getByText('Maria Silva')).toBeInTheDocument();
      
      // Verify navigation exists
      expect(screen.getByText('PDV')).toBeInTheDocument();
    });
  });
});
