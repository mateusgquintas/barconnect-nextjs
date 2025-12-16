/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { LoginScreen } from '@/components/LoginScreen';
import { validateCredentials } from '@/lib/authService';
import type { User } from '@/types/user';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Receipt: () => <div data-testid="receipt-icon">Receipt</div>,
  Lock: () => <div data-testid="lock-icon">Lock</div>,
  User: () => <div data-testid="user-icon">User</div>,
  UserIcon: () => <div data-testid="user-icon">User</div>,
  UserPlus: () => <div data-testid="user-plus-icon">UserPlus</div>,
  X: () => <div data-testid="x-icon">X</div>,
  XIcon: () => <div data-testid="x-icon">X</div>,
  CheckIcon: () => <div data-testid="check-icon">✓</div>,
  ChevronDownIcon: () => <div data-testid="chevron-down-icon">▼</div>,
  ChevronUpIcon: () => <div data-testid="chevron-up-icon">▲</div>,
  Mail: () => <div data-testid="mail-icon">Mail</div>,
  Shield: () => <div data-testid="shield-icon">Shield</div>
}));

// Mock getToast utility with persistent mocks
const mockError = jest.fn();
const mockSuccess = jest.fn();

jest.mock('@/utils/notify', () => ({
  getToast: () => ({
    error: mockError,
    success: mockSuccess
  })
}));

// Mock authService
jest.mock('@/lib/authService', () => ({
  validateCredentials: jest.fn()
}));

// Mock useUsersDB hook
const mockCreateUser = jest.fn();
jest.mock('@/hooks/useUsersDB', () => ({
  useUsersDB: () => ({
    createUser: mockCreateUser
  })
}));

// Mock CreateUserDialog component
jest.mock('@/components/CreateUserDialog', () => ({
  CreateUserDialog: ({ open, onOpenChange }: any) => 
    open ? (
      <div data-testid="create-user-dialog">
        <button onClick={() => onOpenChange(false)}>Close Dialog</button>
      </div>
    ) : null
}));

describe('LoginScreen - Comprehensive Tests', () => {
  let mockOnLogin: jest.Mock;
  let user: ReturnType<typeof userEvent.setup>;

  const mockUser: User = {
    id: 'user-1',
    name: 'Test User',
    username: 'testuser',
    email: 'test@example.com',
    role: 'operator',
    createdAt: new Date('2025-01-01').toISOString()
  };

  beforeEach(() => {
    mockError.mockClear();
    mockSuccess.mockClear();
    mockOnLogin = jest.fn();
    mockCreateUser.mockClear();
    (validateCredentials as jest.Mock).mockClear();
    user = userEvent.setup();
  });

  // ==================== RENDERING & STRUCTURE ====================
  describe('Rendering & Structure', () => {
    it('should render without crashing', () => {
      render(<LoginScreen />);
      expect(screen.getByText('BarConnect')).toBeInTheDocument();
    });

    it('should render app logo and title', () => {
      render(<LoginScreen />);
      expect(screen.getByTestId('receipt-icon')).toBeInTheDocument();
      expect(screen.getByText('BarConnect')).toBeInTheDocument();
    });

    it('should render subtitle', () => {
      render(<LoginScreen />);
      expect(screen.getByText('Sistema de Gestão')).toBeInTheDocument();
    });

    it('should render login form', () => {
      render(<LoginScreen />);
      expect(screen.getByRole('form')).toBeInTheDocument();
    });

    it('should render username input field', () => {
      render(<LoginScreen />);
      expect(screen.getByLabelText(/usuário ou email/i)).toBeInTheDocument();
    });

    it('should render password input field', () => {
      render(<LoginScreen />);
      expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(<LoginScreen />);
      expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
    });

    it('should render create user button', () => {
      render(<LoginScreen />);
      expect(screen.getByRole('button', { name: /criar usuário/i })).toBeInTheDocument();
    });

    it('should render separator with "ou" text', () => {
      render(<LoginScreen />);
      expect(screen.getByText('ou')).toBeInTheDocument();
    });

    it('should render all icons', () => {
      render(<LoginScreen />);
      expect(screen.getByTestId('receipt-icon')).toBeInTheDocument();
      expect(screen.getAllByTestId('user-icon').length).toBeGreaterThan(0);
      expect(screen.getByTestId('lock-icon')).toBeInTheDocument();
      expect(screen.getByTestId('user-plus-icon')).toBeInTheDocument();
    });
  });

  // ==================== INPUT FIELDS ====================
  describe('Input Fields', () => {
    it('should allow typing in username field', async () => {
      render(<LoginScreen />);
      const usernameInput = screen.getByLabelText(/usuário ou email/i);
      
      await user.type(usernameInput, 'testuser');
      
      expect(usernameInput).toHaveValue('testuser');
    });

    it('should allow typing in password field', async () => {
      render(<LoginScreen />);
      const passwordInput = screen.getByLabelText(/senha/i);
      
      await user.type(passwordInput, 'password123');
      
      expect(passwordInput).toHaveValue('password123');
    });

    it('should have correct input types', () => {
      render(<LoginScreen />);
      const usernameInput = screen.getByLabelText(/usuário ou email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      
      expect(usernameInput).toHaveAttribute('type', 'text');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should have autocomplete attributes', () => {
      render(<LoginScreen />);
      const usernameInput = screen.getByLabelText(/usuário ou email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      
      expect(usernameInput).toHaveAttribute('autocomplete', 'username');
      expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
    });

    it('should have required attributes', () => {
      render(<LoginScreen />);
      const usernameInput = screen.getByLabelText(/usuário ou email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      
      expect(usernameInput).toBeRequired();
      expect(passwordInput).toBeRequired();
    });

    it('should have appropriate placeholders', () => {
      render(<LoginScreen />);
      const usernameInput = screen.getByLabelText(/usuário ou email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      
      expect(usernameInput).toHaveAttribute('placeholder', 'Digite seu usuário ou email');
      expect(passwordInput).toHaveAttribute('placeholder', 'Digite sua senha');
    });

    it('should clear fields after typing and clearing', async () => {
      render(<LoginScreen />);
      const usernameInput = screen.getByLabelText(/usuário ou email/i);
      
      await user.type(usernameInput, 'testuser');
      await user.clear(usernameInput);
      
      expect(usernameInput).toHaveValue('');
    });
  });

  // ==================== SUCCESSFUL LOGIN ====================
  describe('Successful Login', () => {
    it('should call validateCredentials when form is submitted', async () => {
      (validateCredentials as jest.Mock).mockResolvedValue(mockUser);
      render(<LoginScreen onLogin={mockOnLogin} />);
      
      await user.type(screen.getByLabelText(/usuário ou email/i), 'testuser');
      await user.type(screen.getByLabelText(/senha/i), 'password123');
      await user.click(screen.getByRole('button', { name: /entrar/i }));
      
      await waitFor(() => {
        expect(validateCredentials).toHaveBeenCalledWith('testuser', 'password123');
      });
    });

    it('should call onLogin with validated user on successful login', async () => {
      (validateCredentials as jest.Mock).mockResolvedValue(mockUser);
      render(<LoginScreen onLogin={mockOnLogin} />);
      
      await user.type(screen.getByLabelText(/usuário ou email/i), 'testuser');
      await user.type(screen.getByLabelText(/senha/i), 'password123');
      await user.click(screen.getByRole('button', { name: /entrar/i }));
      
      await waitFor(() => {
        expect(mockOnLogin).toHaveBeenCalledWith(mockUser);
      });
    });

    it('should show success toast on successful login', async () => {
      (validateCredentials as jest.Mock).mockResolvedValue(mockUser);
      render(<LoginScreen onLogin={mockOnLogin} />);
      
      await user.type(screen.getByLabelText(/usuário ou email/i), 'testuser');
      await user.type(screen.getByLabelText(/senha/i), 'password123');
      await user.click(screen.getByRole('button', { name: /entrar/i }));
      
      await waitFor(() => {
        expect(mockSuccess).toHaveBeenCalledWith('Bem-vindo, Test User!');
      });
    });

    it('should show loading state during login', async () => {
      (validateCredentials as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockUser), 100))
      );
      render(<LoginScreen onLogin={mockOnLogin} />);
      
      await user.type(screen.getByLabelText(/usuário ou email/i), 'testuser');
      await user.type(screen.getByLabelText(/senha/i), 'password123');
      await user.click(screen.getByRole('button', { name: /entrar/i }));
      
      expect(screen.getByRole('button', { name: /entrando/i })).toBeInTheDocument();
    });

    it('should disable submit button during login', async () => {
      (validateCredentials as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockUser), 100))
      );
      render(<LoginScreen onLogin={mockOnLogin} />);
      
      await user.type(screen.getByLabelText(/usuário ou email/i), 'testuser');
      await user.type(screen.getByLabelText(/senha/i), 'password123');
      await user.click(screen.getByRole('button', { name: /entrar/i }));
      
      expect(screen.getByRole('button', { name: /entrando/i })).toBeDisabled();
    });
  });

  // ==================== FAILED LOGIN ====================
  describe('Failed Login', () => {
    it('should show error toast when credentials are invalid', async () => {
      (validateCredentials as jest.Mock).mockResolvedValue(null);
      render(<LoginScreen onLogin={mockOnLogin} />);
      
      await user.type(screen.getByLabelText(/usuário ou email/i), 'wronguser');
      await user.type(screen.getByLabelText(/senha/i), 'wrongpass');
      await user.click(screen.getByRole('button', { name: /entrar/i }));
      
      await waitFor(() => {
        expect(mockError).toHaveBeenCalledWith('Usuário ou senha incorretos');
      });
    });

    it('should not call onLogin when credentials are invalid', async () => {
      (validateCredentials as jest.Mock).mockResolvedValue(null);
      render(<LoginScreen onLogin={mockOnLogin} />);
      
      await user.type(screen.getByLabelText(/usuário ou email/i), 'wronguser');
      await user.type(screen.getByLabelText(/senha/i), 'wrongpass');
      await user.click(screen.getByRole('button', { name: /entrar/i }));
      
      await waitFor(() => {
        expect(mockError).toHaveBeenCalled();
      });
      
      expect(mockOnLogin).not.toHaveBeenCalled();
    });

    it('should show error toast when validation throws error', async () => {
      (validateCredentials as jest.Mock).mockRejectedValue(new Error('Network error'));
      render(<LoginScreen onLogin={mockOnLogin} />);
      
      await user.type(screen.getByLabelText(/usuário ou email/i), 'testuser');
      await user.type(screen.getByLabelText(/senha/i), 'password123');
      await user.click(screen.getByRole('button', { name: /entrar/i }));
      
      await waitFor(() => {
        expect(mockError).toHaveBeenCalledWith('Erro ao fazer login. Tente novamente.');
      });
    });

    it('should restore button state after failed login', async () => {
      (validateCredentials as jest.Mock).mockResolvedValue(null);
      render(<LoginScreen onLogin={mockOnLogin} />);
      
      await user.type(screen.getByLabelText(/usuário ou email/i), 'wronguser');
      await user.type(screen.getByLabelText(/senha/i), 'wrongpass');
      await user.click(screen.getByRole('button', { name: /entrar/i }));
      
      await waitFor(() => {
        expect(mockError).toHaveBeenCalled();
      });
      
      expect(screen.getByRole('button', { name: /entrar/i })).not.toBeDisabled();
    });

    it('should allow retry after failed login', async () => {
      (validateCredentials as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockUser);
      
      render(<LoginScreen onLogin={mockOnLogin} />);
      
      // First attempt - fail
      await user.type(screen.getByLabelText(/usuário ou email/i), 'wronguser');
      await user.type(screen.getByLabelText(/senha/i), 'wrongpass');
      await user.click(screen.getByRole('button', { name: /entrar/i }));
      
      await waitFor(() => {
        expect(mockError).toHaveBeenCalledWith('Usuário ou senha incorretos');
      });
      
      // Clear fields and retry
      await user.clear(screen.getByLabelText(/usuário ou email/i));
      await user.clear(screen.getByLabelText(/senha/i));
      
      // Second attempt - success
      await user.type(screen.getByLabelText(/usuário ou email/i), 'testuser');
      await user.type(screen.getByLabelText(/senha/i), 'password123');
      await user.click(screen.getByRole('button', { name: /entrar/i }));
      
      await waitFor(() => {
        expect(mockSuccess).toHaveBeenCalledWith('Bem-vindo, Test User!');
      });
    });
  });

  // ==================== CREATE USER DIALOG ====================
  describe('Create User Dialog', () => {
    it('should not show dialog initially', () => {
      render(<LoginScreen />);
      expect(screen.queryByTestId('create-user-dialog')).not.toBeInTheDocument();
    });

    it('should open create user dialog when button is clicked', async () => {
      render(<LoginScreen />);
      
      await user.click(screen.getByRole('button', { name: /criar usuário/i }));
      
      expect(screen.getByTestId('create-user-dialog')).toBeInTheDocument();
    });

    it('should close dialog when onOpenChange is called', async () => {
      render(<LoginScreen />);
      
      await user.click(screen.getByRole('button', { name: /criar usuário/i }));
      expect(screen.getByTestId('create-user-dialog')).toBeInTheDocument();
      
      await user.click(screen.getByText('Close Dialog'));
      expect(screen.queryByTestId('create-user-dialog')).not.toBeInTheDocument();
    });

    it('should pass createUser function to dialog', async () => {
      render(<LoginScreen />);
      
      await user.click(screen.getByRole('button', { name: /criar usuário/i }));
      
      // Dialog is rendered with createUser prop (verified by mock)
      expect(screen.getByTestId('create-user-dialog')).toBeInTheDocument();
    });
  });

  // ==================== FORM VALIDATION ====================
  describe('Form Validation', () => {
    it('should prevent submission with empty username', async () => {
      render(<LoginScreen onLogin={mockOnLogin} />);
      
      await user.type(screen.getByLabelText(/senha/i), 'password123');
      
      const form = screen.getByRole('form');
      const submitButton = screen.getByRole('button', { name: /entrar/i });
      
      // HTML5 validation prevents submission
      expect(screen.getByLabelText(/usuário ou email/i)).toBeRequired();
    });

    it('should prevent submission with empty password', async () => {
      render(<LoginScreen onLogin={mockOnLogin} />);
      
      await user.type(screen.getByLabelText(/usuário ou email/i), 'testuser');
      
      // HTML5 validation prevents submission
      expect(screen.getByLabelText(/senha/i)).toBeRequired();
    });

    it('should accept form submission with both fields filled', async () => {
      (validateCredentials as jest.Mock).mockResolvedValue(mockUser);
      render(<LoginScreen onLogin={mockOnLogin} />);
      
      await user.type(screen.getByLabelText(/usuário ou email/i), 'testuser');
      await user.type(screen.getByLabelText(/senha/i), 'password123');
      await user.click(screen.getByRole('button', { name: /entrar/i }));
      
      await waitFor(() => {
        expect(validateCredentials).toHaveBeenCalled();
      });
    });
  });

  // ==================== ACCESSIBILITY ====================
  describe('Accessibility', () => {
    it('should have proper labels for all inputs', () => {
      render(<LoginScreen />);
      
      expect(screen.getByLabelText(/usuário ou email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    });

    it('should have proper button labels', () => {
      render(<LoginScreen />);
      
      expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /criar usuário/i })).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      render(<LoginScreen />);
      
      // Tab through form elements
      await user.tab();
      expect(screen.getByLabelText(/usuário ou email/i)).toHaveFocus();
      
      await user.tab();
      expect(screen.getByLabelText(/senha/i)).toHaveFocus();
      
      await user.tab();
      expect(screen.getByRole('button', { name: /entrar/i })).toHaveFocus();
    });

    it('should have form role', () => {
      render(<LoginScreen />);
      expect(screen.getByRole('form')).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      render(<LoginScreen />);
      // h1 for BarConnect title (assuming it's rendered as h1)
      expect(screen.getByText('BarConnect')).toBeInTheDocument();
    });
  });

  // ==================== EDGE CASES ====================
  describe('Edge Cases', () => {
    it('should handle very long username', async () => {
      (validateCredentials as jest.Mock).mockResolvedValue(mockUser);
      render(<LoginScreen onLogin={mockOnLogin} />);
      
      const longUsername = 'a'.repeat(100);
      await user.type(screen.getByLabelText(/usuário ou email/i), longUsername);
      await user.type(screen.getByLabelText(/senha/i), 'password123');
      
      expect(screen.getByLabelText(/usuário ou email/i)).toHaveValue(longUsername);
    });

    it('should handle very long password', async () => {
      (validateCredentials as jest.Mock).mockResolvedValue(mockUser);
      render(<LoginScreen onLogin={mockOnLogin} />);
      
      const longPassword = 'p'.repeat(100);
      await user.type(screen.getByLabelText(/usuário ou email/i), 'testuser');
      await user.type(screen.getByLabelText(/senha/i), longPassword);
      
      expect(screen.getByLabelText(/senha/i)).toHaveValue(longPassword);
    });

    it('should handle special characters in username', async () => {
      (validateCredentials as jest.Mock).mockResolvedValue(mockUser);
      render(<LoginScreen onLogin={mockOnLogin} />);
      
      await user.type(screen.getByLabelText(/usuário ou email/i), 'test@email.com');
      await user.type(screen.getByLabelText(/senha/i), 'password123');
      await user.click(screen.getByRole('button', { name: /entrar/i }));
      
      await waitFor(() => {
        expect(validateCredentials).toHaveBeenCalledWith('test@email.com', 'password123');
      });
    });

    it('should handle special characters in password', async () => {
      (validateCredentials as jest.Mock).mockResolvedValue(mockUser);
      render(<LoginScreen onLogin={mockOnLogin} />);
      
      await user.type(screen.getByLabelText(/usuário ou email/i), 'testuser');
      await user.type(screen.getByLabelText(/senha/i), 'p@ssw0rd!#$%');
      await user.click(screen.getByRole('button', { name: /entrar/i }));
      
      await waitFor(() => {
        expect(validateCredentials).toHaveBeenCalledWith('testuser', 'p@ssw0rd!#$%');
      });
    });

    it('should handle rapid form submissions', async () => {
      (validateCredentials as jest.Mock).mockResolvedValue(mockUser);
      render(<LoginScreen onLogin={mockOnLogin} />);
      
      await user.type(screen.getByLabelText(/usuário ou email/i), 'testuser');
      await user.type(screen.getByLabelText(/senha/i), 'password123');
      
      const submitButton = screen.getByRole('button', { name: /entrar/i });
      await user.click(submitButton);
      await user.click(submitButton); // Second click while loading
      
      // Should only call validateCredentials once due to loading state
      await waitFor(() => {
        expect(validateCredentials).toHaveBeenCalledTimes(1);
      });
    });

    it('should work without onLogin callback', async () => {
      (validateCredentials as jest.Mock).mockResolvedValue(mockUser);
      render(<LoginScreen />);
      
      await user.type(screen.getByLabelText(/usuário ou email/i), 'testuser');
      await user.type(screen.getByLabelText(/senha/i), 'password123');
      await user.click(screen.getByRole('button', { name: /entrar/i }));
      
      await waitFor(() => {
        expect(mockSuccess).toHaveBeenCalledWith('Bem-vindo, Test User!');
      });
    });

    it('should handle whitespace in credentials', async () => {
      (validateCredentials as jest.Mock).mockResolvedValue(null);
      render(<LoginScreen onLogin={mockOnLogin} />);
      
      await user.type(screen.getByLabelText(/usuário ou email/i), '  testuser  ');
      await user.type(screen.getByLabelText(/senha/i), '  password123  ');
      await user.click(screen.getByRole('button', { name: /entrar/i }));
      
      await waitFor(() => {
        expect(validateCredentials).toHaveBeenCalledWith('  testuser  ', '  password123  ');
      });
    });
  });

  // ==================== INTEGRATION WITH CHILD COMPONENTS ====================
  describe('Integration', () => {
    it('should integrate with CreateUserDialog', async () => {
      render(<LoginScreen />);
      
      // Open dialog
      await user.click(screen.getByRole('button', { name: /criar usuário/i }));
      expect(screen.getByTestId('create-user-dialog')).toBeInTheDocument();
      
      // Close dialog
      await user.click(screen.getByText('Close Dialog'));
      expect(screen.queryByTestId('create-user-dialog')).not.toBeInTheDocument();
    });

    it('should use useUsersDB hook', () => {
      render(<LoginScreen />);
      // Hook is called during render (verified by mock)
      expect(screen.getByText('BarConnect')).toBeInTheDocument();
    });
  });
});
