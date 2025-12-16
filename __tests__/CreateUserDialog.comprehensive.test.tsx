/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { CreateUserDialog } from '@/components/CreateUserDialog';
import type { UserRole } from '@/types/user';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  User: () => <div data-testid="user-icon">User</div>,
  Lock: () => <div data-testid="lock-icon">Lock</div>,
  Shield: () => <div data-testid="shield-icon">Shield</div>,
  Mail: () => <div data-testid="mail-icon">Mail</div>,
  X: () => <div data-testid="x-icon">X</div>,
  XIcon: () => <div data-testid="x-icon">X</div>,
  CheckIcon: () => <div data-testid="check-icon">✓</div>,
  ChevronDownIcon: () => <div data-testid="chevron-down-icon">▼</div>,
  ChevronUpIcon: () => <div data-testid="chevron-up-icon">▲</div>
}));

// Mock getToast utility with persistent mocks
const mockError = jest.fn();
const mockSuccess = jest.fn();

jest.mock('@/utils/notify', () => ({
  getToast: jest.fn(() => ({
    error: mockError,
    success: mockSuccess
  }))
}));

describe('CreateUserDialog - Comprehensive Tests', () => {
  let mockOnOpenChange: jest.Mock;
  let mockOnCreateUser: jest.Mock;
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    mockError.mockClear();
    mockSuccess.mockClear();
    mockOnOpenChange = jest.fn();
    mockOnCreateUser = jest.fn(async () => true);
    user = userEvent.setup();
  });

  // ==================== RENDERING & STRUCTURE ====================
  describe('Rendering & Structure', () => {
    it('should not render dialog when open is false', () => {
      render(
        <CreateUserDialog
          open={false}
          onOpenChange={mockOnOpenChange}
          onCreateUser={mockOnCreateUser}
        />
      );

      expect(screen.queryByText('Criar Novo Usuário')).not.toBeInTheDocument();
    });

    it('should render dialog when open is true', () => {
      render(
        <CreateUserDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onCreateUser={mockOnCreateUser}
        />
      );

      expect(screen.getByText('Criar Novo Usuário')).toBeInTheDocument();
    });

    it('should render dialog description', () => {
      render(
        <CreateUserDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onCreateUser={mockOnCreateUser}
        />
      );

      expect(screen.getByText(/preencha os dados do novo usuário e confirme/i)).toBeInTheDocument();
    });

    it('should render two main sections', () => {
      render(
        <CreateUserDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onCreateUser={mockOnCreateUser}
        />
      );

      expect(screen.getByText('Dados do Novo Usuário')).toBeInTheDocument();
      expect(screen.getByText('Confirmação de Administrador')).toBeInTheDocument();
    });

    it('should render all required icons', () => {
      render(
        <CreateUserDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onCreateUser={mockOnCreateUser}
        />
      );

      const userIcons = screen.getAllByTestId('user-icon');
      const lockIcons = screen.getAllByTestId('lock-icon');
      const shieldIcon = screen.getByTestId('shield-icon');
      const mailIcon = screen.getByTestId('mail-icon');

      expect(userIcons.length).toBeGreaterThan(0);
      expect(lockIcons.length).toBeGreaterThan(0);
      expect(shieldIcon).toBeInTheDocument();
      expect(mailIcon).toBeInTheDocument();
    });
  });

  // ==================== USER DATA FIELDS ====================
  describe('User Data Fields', () => {
    it('should render name input field with label and placeholder', () => {
      render(
        <CreateUserDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onCreateUser={mockOnCreateUser}
        />
      );

      const nameLabel = screen.getByText('Nome Completo');
      const nameInput = screen.getByPlaceholderText('Ex: João Silva');

      expect(nameLabel).toBeInTheDocument();
      expect(nameInput).toBeInTheDocument();
      expect(nameInput).toHaveAttribute('type', 'text');
      expect(nameInput).toHaveAttribute('required');
    });

    it('should render username input field with label, placeholder and helper text', () => {
      render(
        <CreateUserDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onCreateUser={mockOnCreateUser}
        />
      );

      const usernameLabel = screen.getByText('Nome de Usuário');
      const usernameInput = screen.getByPlaceholderText('Ex: joao.silva');
      const helperText = screen.getByText('Identificador único para login (sem espaços ou caracteres especiais)');

      expect(usernameLabel).toBeInTheDocument();
      expect(usernameInput).toBeInTheDocument();
      expect(usernameInput).toHaveAttribute('type', 'text');
      expect(usernameInput).toHaveAttribute('required');
      expect(helperText).toBeInTheDocument();
    });

    it('should render email input field with label, placeholder and helper text', () => {
      render(
        <CreateUserDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onCreateUser={mockOnCreateUser}
        />
      );

      const emailLabel = screen.getByText('Email Pessoal');
      const emailInput = screen.getByPlaceholderText('Ex: joao@gmail.com');
      const helperText = screen.getByText('Email real para autenticação e recuperação de senha');

      expect(emailLabel).toBeInTheDocument();
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('required');
      expect(helperText).toBeInTheDocument();
    });

    it('should render password input field with label and placeholder', () => {
      render(
        <CreateUserDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onCreateUser={mockOnCreateUser}
        />
      );

      const passwordLabel = screen.getByText('Senha');
      const passwordInput = screen.getByPlaceholderText('Senha do novo usuário');

      expect(passwordLabel).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('required');
    });

    it('should allow typing in name field', async () => {
      render(
        <CreateUserDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onCreateUser={mockOnCreateUser}
        />
      );

      const nameInput = screen.getByPlaceholderText('Ex: João Silva');
      await user.type(nameInput, 'Maria Santos');

      expect(nameInput).toHaveValue('Maria Santos');
    });

    it('should allow typing in username field', async () => {
      render(
        <CreateUserDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onCreateUser={mockOnCreateUser}
        />
      );

      const usernameInput = screen.getByPlaceholderText('Ex: joao.silva');
      await user.type(usernameInput, 'maria.santos');

      expect(usernameInput).toHaveValue('maria.santos');
    });

    it('should allow typing in email field', async () => {
      render(
        <CreateUserDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onCreateUser={mockOnCreateUser}
        />
      );

      const emailInput = screen.getByPlaceholderText('Ex: joao@gmail.com');
      await user.type(emailInput, 'maria@gmail.com');

      expect(emailInput).toHaveValue('maria@gmail.com');
    });

    it('should allow typing in password field', async () => {
      render(
        <CreateUserDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onCreateUser={mockOnCreateUser}
        />
      );

      const passwordInput = screen.getByPlaceholderText('Senha do novo usuário');
      await user.type(passwordInput, 'senha123');

      expect(passwordInput).toHaveValue('senha123');
    });
  });

  // ==================== ROLE SELECTION ====================
  describe('Role Selection', () => {
    it('should render role selection field with label', () => {
      render(
        <CreateUserDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onCreateUser={mockOnCreateUser}
        />
      );

      expect(screen.getByText('Permissão')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should display "Operador" option when role selector is opened', async () => {
      render(
        <CreateUserDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onCreateUser={mockOnCreateUser}
        />
      );

      const roleSelector = screen.getByRole('combobox');
      await user.click(roleSelector);

      await waitFor(() => {
        const options = screen.queryAllByText('Operador');
        expect(options.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });

    it('should display "Administrador" option when role selector is opened', async () => {
      render(
        <CreateUserDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onCreateUser={mockOnCreateUser}
        />
      );

      const roleSelector = screen.getByRole('combobox');
      await user.click(roleSelector);

      await waitFor(() => {
        const options = screen.queryAllByText('Administrador');
        expect(options.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });

    it('should allow selecting "Operador" role', async () => {
      render(
        <CreateUserDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onCreateUser={mockOnCreateUser}
        />
      );

      const roleSelector = screen.getByRole('combobox');
      await user.click(roleSelector);

      await waitFor(async () => {
        const options = screen.queryAllByText('Operador');
        if (options.length > 0) {
          await user.click(options[0]);
        }
        expect(options.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });

    it('should allow selecting "Administrador" role', async () => {
      render(
        <CreateUserDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onCreateUser={mockOnCreateUser}
        />
      );

      const roleSelector = screen.getByRole('combobox');
      await user.click(roleSelector);

      await waitFor(async () => {
        const options = screen.queryAllByText('Administrador');
        if (options.length > 0) {
          await user.click(options[0]);
        }
        expect(options.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });
  });

  // ==================== ADMIN CREDENTIALS SECTION ====================
  describe('Admin Credentials Section', () => {
    it('should render admin section with shield icon', () => {
      render(
        <CreateUserDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onCreateUser={mockOnCreateUser}
        />
      );

      expect(screen.getByTestId('shield-icon')).toBeInTheDocument();
      expect(screen.getByText('Confirmação de Administrador')).toBeInTheDocument();
    });

    it('should render admin username field with label and placeholder', () => {
      render(
        <CreateUserDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onCreateUser={mockOnCreateUser}
        />
      );

      const adminUsernameLabel = screen.getByText('Seu Usuário (Admin)');
      const adminUsernameInput = screen.getByPlaceholderText('Digite seu usuário');

      expect(adminUsernameLabel).toBeInTheDocument();
      expect(adminUsernameInput).toBeInTheDocument();
      expect(adminUsernameInput).toHaveAttribute('type', 'text');
      expect(adminUsernameInput).toHaveAttribute('required');
    });

    it('should render admin password field with label and placeholder', () => {
      render(
        <CreateUserDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onCreateUser={mockOnCreateUser}
        />
      );

      const adminPasswordLabel = screen.getByText('Sua Senha (Admin)');
      const adminPasswordInput = screen.getByPlaceholderText('Digite sua senha');

      expect(adminPasswordLabel).toBeInTheDocument();
      expect(adminPasswordInput).toBeInTheDocument();
      expect(adminPasswordInput).toHaveAttribute('type', 'password');
      expect(adminPasswordInput).toHaveAttribute('required');
    });

    it('should allow typing in admin username field', async () => {
      render(
        <CreateUserDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onCreateUser={mockOnCreateUser}
        />
      );

      const adminUsernameInput = screen.getByPlaceholderText('Digite seu usuário');
      await user.type(adminUsernameInput, 'admin.user');

      expect(adminUsernameInput).toHaveValue('admin.user');
    });

    it('should allow typing in admin password field', async () => {
      render(
        <CreateUserDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onCreateUser={mockOnCreateUser}
        />
      );

      const adminPasswordInput = screen.getByPlaceholderText('Digite sua senha');
      await user.type(adminPasswordInput, 'adminpass123');

      expect(adminPasswordInput).toHaveValue('adminpass123');
    });
  });

  // ==================== FORM SUBMISSION ====================
  describe('Form Submission', () => {
    it('should show loading state when submitting form', async () => {
      const slowMockOnCreateUser = jest.fn(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      render(
        <CreateUserDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onCreateUser={slowMockOnCreateUser}
        />
      );

      // Fill all required fields
      await user.type(screen.getByPlaceholderText('Ex: João Silva'), 'Maria Santos');
      await user.type(screen.getByPlaceholderText('Ex: joao.silva'), 'maria.santos');
      await user.type(screen.getByPlaceholderText('Ex: joao@gmail.com'), 'maria@gmail.com');
      await user.type(screen.getByPlaceholderText('Senha do novo usuário'), 'senha123');
      await user.type(screen.getByPlaceholderText('Digite seu usuário'), 'admin');
      await user.type(screen.getByPlaceholderText('Digite sua senha'), 'adminpass');

      const submitButton = screen.getByRole('button', { name: /criar usuário/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Criando...')).toBeInTheDocument();
      });
    });

    it('should call onCreateUser with correct parameters when form is valid', async () => {
      render(
        <CreateUserDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onCreateUser={mockOnCreateUser}
        />
      );

      // Fill all required fields
      await user.type(screen.getByPlaceholderText('Ex: João Silva'), 'Maria Santos');
      await user.type(screen.getByPlaceholderText('Ex: joao.silva'), 'maria.santos');
      await user.type(screen.getByPlaceholderText('Ex: joao@gmail.com'), 'maria@gmail.com');
      await user.type(screen.getByPlaceholderText('Senha do novo usuário'), 'senha123');
      await user.type(screen.getByPlaceholderText('Digite seu usuário'), 'admin');
      await user.type(screen.getByPlaceholderText('Digite sua senha'), 'adminpass');

      const submitButton = screen.getByRole('button', { name: /criar usuário/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnCreateUser).toHaveBeenCalledWith(
          {
            name: 'Maria Santos',
            username: 'maria.santos',
            email: 'maria@gmail.com',
            password: 'senha123',
            role: 'operator'
          },
          {
            username: 'admin',
            password: 'adminpass'
          }
        );
      });
    });

    it('should close dialog after successful submission', async () => {
      render(
        <CreateUserDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onCreateUser={mockOnCreateUser}
        />
      );

      // Fill all required fields
      await user.type(screen.getByPlaceholderText('Ex: João Silva'), 'Maria Santos');
      await user.type(screen.getByPlaceholderText('Ex: joao.silva'), 'maria.santos');
      await user.type(screen.getByPlaceholderText('Ex: joao@gmail.com'), 'maria@gmail.com');
      await user.type(screen.getByPlaceholderText('Senha do novo usuário'), 'senha123');
      await user.type(screen.getByPlaceholderText('Digite seu usuário'), 'admin');
      await user.type(screen.getByPlaceholderText('Digite sua senha'), 'adminpass');

      const submitButton = screen.getByRole('button', { name: /criar usuário/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnCreateUser).toHaveBeenCalled();
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      }, { timeout: 5000 });
    });

    it('should reset form fields after successful submission', async () => {
      render(
        <CreateUserDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onCreateUser={mockOnCreateUser}
        />
      );

      const nameInput = screen.getByPlaceholderText('Ex: João Silva');
      const usernameInput = screen.getByPlaceholderText('Ex: joao.silva');

      await user.type(nameInput, 'Maria Santos');
      await user.type(usernameInput, 'maria.santos');
      await user.type(screen.getByPlaceholderText('Ex: joao@gmail.com'), 'maria@gmail.com');
      await user.type(screen.getByPlaceholderText('Senha do novo usuário'), 'senha123');
      await user.type(screen.getByPlaceholderText('Digite seu usuário'), 'admin');
      await user.type(screen.getByPlaceholderText('Digite sua senha'), 'adminpass');

      const submitButton = screen.getByRole('button', { name: /criar usuário/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnCreateUser).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(nameInput).toHaveValue('');
        expect(usernameInput).toHaveValue('');
      }, { timeout: 5000 });
    });

    it('should submit form with default operator role', async () => {
      render(
        <CreateUserDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onCreateUser={mockOnCreateUser}
        />
      );

      // Fill all fields with default operator role
      await user.type(screen.getByPlaceholderText('Ex: João Silva'), 'Admin User');
      await user.type(screen.getByPlaceholderText('Ex: joao.silva'), 'admin.user');
      await user.type(screen.getByPlaceholderText('Ex: joao@gmail.com'), 'admin@gmail.com');
      await user.type(screen.getByPlaceholderText('Senha do novo usuário'), 'senha123');
      await user.type(screen.getByPlaceholderText('Digite seu usuário'), 'admin');
      await user.type(screen.getByPlaceholderText('Digite sua senha'), 'adminpass');

      const submitButton = screen.getByRole('button', { name: /criar usuário/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnCreateUser).toHaveBeenCalledWith(
          expect.objectContaining({
            role: 'operator'
          }),
          expect.objectContaining({
            username: 'admin',
            password: 'adminpass'
          })
        );
      }, { timeout: 5000 });
    });
  });

  // ==================== EMAIL & FORM VALIDATION ====================
  describe('Email & Form Validation', () => {
    it('should accept valid email format and submit form', async () => {
      render(
        <CreateUserDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onCreateUser={mockOnCreateUser}
        />
      );

      await user.type(screen.getByPlaceholderText('Ex: João Silva'), 'Test User');
      await user.type(screen.getByPlaceholderText('Ex: joao.silva'), 'test.user');
      await user.type(screen.getByPlaceholderText('Ex: joao@gmail.com'), 'valid@email.com');
      await user.type(screen.getByPlaceholderText('Senha do novo usuário'), 'senha123');
      await user.type(screen.getByPlaceholderText('Digite seu usuário'), 'admin');
      await user.type(screen.getByPlaceholderText('Digite sua senha'), 'adminpass');

      const submitButton = screen.getByRole('button', { name: /criar usuário/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnCreateUser).toHaveBeenCalled();
      });
    });

    it('should not submit with invalid email (missing @)', async () => {
      render(
        <CreateUserDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onCreateUser={mockOnCreateUser}
        />
      );

      await user.type(screen.getByPlaceholderText('Ex: João Silva'), 'Test User');
      await user.type(screen.getByPlaceholderText('Ex: joao.silva'), 'test.user');
      await user.type(screen.getByPlaceholderText('Ex: joao@gmail.com'), 'invalidemail.com');
      await user.type(screen.getByPlaceholderText('Senha do novo usuário'), 'senha123');
      await user.type(screen.getByPlaceholderText('Digite seu usuário'), 'admin');
      await user.type(screen.getByPlaceholderText('Digite sua senha'), 'adminpass');

      const submitButton = screen.getByRole('button', { name: /criar usuário/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnCreateUser).not.toHaveBeenCalled();
      });
    });

    it('should not submit when required fields are empty', async () => {
      render(
        <CreateUserDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onCreateUser={mockOnCreateUser}
        />
      );

      const submitButton = screen.getByRole('button', { name: /criar usuário/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnCreateUser).not.toHaveBeenCalled();
      });
    });
  });

  // ==================== CANCEL BUTTON ====================
  describe('Cancel Button', () => {
    it('should render cancel button', () => {
      render(
        <CreateUserDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onCreateUser={mockOnCreateUser}
        />
      );

      expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
    });

    it('should close dialog when cancel button is clicked', async () => {
      render(
        <CreateUserDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onCreateUser={mockOnCreateUser}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      await user.click(cancelButton);

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it('should not call onCreateUser when cancel button is clicked', async () => {
      render(
        <CreateUserDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onCreateUser={mockOnCreateUser}
        />
      );

      // Fill some fields
      await user.type(screen.getByPlaceholderText('Ex: João Silva'), 'Test User');
      await user.type(screen.getByPlaceholderText('Ex: joao.silva'), 'test.user');

      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      await user.click(cancelButton);

      expect(mockOnCreateUser).not.toHaveBeenCalled();
    });
  });

  // ==================== LOADING STATE ====================
  describe('Loading State', () => {
    it('should disable submit button during submission', async () => {
      const slowMockOnCreateUser = jest.fn(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      render(
        <CreateUserDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onCreateUser={slowMockOnCreateUser}
        />
      );

      await user.type(screen.getByPlaceholderText('Ex: João Silva'), 'Test User');
      await user.type(screen.getByPlaceholderText('Ex: joao.silva'), 'test.user');
      await user.type(screen.getByPlaceholderText('Ex: joao@gmail.com'), 'test@email.com');
      await user.type(screen.getByPlaceholderText('Senha do novo usuário'), 'senha123');
      await user.type(screen.getByPlaceholderText('Digite seu usuário'), 'admin');
      await user.type(screen.getByPlaceholderText('Digite sua senha'), 'adminpass');

      const submitButton = screen.getByRole('button', { name: /criar usuário/i });
      await user.click(submitButton);

      await waitFor(() => {
        const loadingButton = screen.getByRole('button', { name: /criando/i });
        expect(loadingButton).toBeDisabled();
      });
    });

    it('should disable cancel button during submission', async () => {
      const slowMockOnCreateUser = jest.fn(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      render(
        <CreateUserDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onCreateUser={slowMockOnCreateUser}
        />
      );

      await user.type(screen.getByPlaceholderText('Ex: João Silva'), 'Test User');
      await user.type(screen.getByPlaceholderText('Ex: joao.silva'), 'test.user');
      await user.type(screen.getByPlaceholderText('Ex: joao@gmail.com'), 'test@email.com');
      await user.type(screen.getByPlaceholderText('Senha do novo usuário'), 'senha123');
      await user.type(screen.getByPlaceholderText('Digite seu usuário'), 'admin');
      await user.type(screen.getByPlaceholderText('Digite sua senha'), 'adminpass');

      const submitButton = screen.getByRole('button', { name: /criar usuário/i });
      await user.click(submitButton);

      await waitFor(() => {
        const cancelButton = screen.getByRole('button', { name: /cancelar/i });
        expect(cancelButton).toBeDisabled();
      });
    });
  });

  // ==================== ACCESSIBILITY ====================
  describe('Accessibility', () => {
    it('should have proper labels for all form inputs', () => {
      render(
        <CreateUserDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onCreateUser={mockOnCreateUser}
        />
      );

      expect(screen.getByLabelText('Nome Completo')).toBeInTheDocument();
      expect(screen.getByLabelText('Nome de Usuário')).toBeInTheDocument();
      expect(screen.getByLabelText('Email Pessoal')).toBeInTheDocument();
      expect(screen.getByLabelText('Senha')).toBeInTheDocument();
      expect(screen.getByLabelText('Permissão')).toBeInTheDocument();
      expect(screen.getByLabelText('Seu Usuário (Admin)')).toBeInTheDocument();
      expect(screen.getByLabelText('Sua Senha (Admin)')).toBeInTheDocument();
    });

    it('should have required attributes on mandatory fields', () => {
      render(
        <CreateUserDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onCreateUser={mockOnCreateUser}
        />
      );

      expect(screen.getByPlaceholderText('Ex: João Silva')).toHaveAttribute('required');
      expect(screen.getByPlaceholderText('Ex: joao.silva')).toHaveAttribute('required');
      expect(screen.getByPlaceholderText('Ex: joao@gmail.com')).toHaveAttribute('required');
      expect(screen.getByPlaceholderText('Senha do novo usuário')).toHaveAttribute('required');
      expect(screen.getByPlaceholderText('Digite seu usuário')).toHaveAttribute('required');
      expect(screen.getByPlaceholderText('Digite sua senha')).toHaveAttribute('required');
    });

    it('should have proper input types for security', () => {
      render(
        <CreateUserDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onCreateUser={mockOnCreateUser}
        />
      );

      expect(screen.getByPlaceholderText('Senha do novo usuário')).toHaveAttribute('type', 'password');
      expect(screen.getByPlaceholderText('Digite sua senha')).toHaveAttribute('type', 'password');
      expect(screen.getByPlaceholderText('Ex: joao@gmail.com')).toHaveAttribute('type', 'email');
    });

    it('should support keyboard navigation to all interactive elements', async () => {
      render(
        <CreateUserDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onCreateUser={mockOnCreateUser}
        />
      );

      const nameInput = screen.getByPlaceholderText('Ex: João Silva');
      nameInput.focus();

      expect(document.activeElement).toBe(nameInput);

      await user.tab();
      expect(document.activeElement).toBe(screen.getByPlaceholderText('Ex: joao.silva'));

      await user.tab();
      expect(document.activeElement).toBe(screen.getByPlaceholderText('Ex: joao@gmail.com'));
    });
  });

  // ==================== EDGE CASES ====================
  describe('Edge Cases', () => {
    it('should handle very long input values', async () => {
      render(
        <CreateUserDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onCreateUser={mockOnCreateUser}
        />
      );

      const longName = 'A'.repeat(100);
      const nameInput = screen.getByPlaceholderText('Ex: João Silva');
      
      await user.type(nameInput, longName);
      expect(nameInput).toHaveValue(longName);
    });

    it('should handle special characters in input fields', async () => {
      render(
        <CreateUserDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onCreateUser={mockOnCreateUser}
        />
      );

      const nameInput = screen.getByPlaceholderText('Ex: João Silva');
      await user.type(nameInput, 'José da Silva Öztürk');

      expect(nameInput).toHaveValue('José da Silva Öztürk');
    });

    it('should handle rapid button clicks', async () => {
      const slowMockOnCreateUser = jest.fn(
        () => new Promise(resolve => setTimeout(() => resolve(true), 100))
      );

      render(
        <CreateUserDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onCreateUser={slowMockOnCreateUser}
        />
      );

      await user.type(screen.getByPlaceholderText('Ex: João Silva'), 'Test User');
      await user.type(screen.getByPlaceholderText('Ex: joao.silva'), 'test.user');
      await user.type(screen.getByPlaceholderText('Ex: joao@gmail.com'), 'test@email.com');
      await user.type(screen.getByPlaceholderText('Senha do novo usuário'), 'senha123');
      await user.type(screen.getByPlaceholderText('Digite seu usuário'), 'admin');
      await user.type(screen.getByPlaceholderText('Digite sua senha'), 'adminpass');

      const submitButton = screen.getByRole('button', { name: /criar usuário/i });
      
      // Try to click multiple times
      await user.click(submitButton);
      await user.click(submitButton);
      await user.click(submitButton);

      // Should only be called once due to loading state
      await waitFor(() => {
        expect(slowMockOnCreateUser).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle empty spaces in fields', async () => {
      render(
        <CreateUserDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onCreateUser={mockOnCreateUser}
        />
      );

      const nameInput = screen.getByPlaceholderText('Ex: João Silva');
      await user.type(nameInput, '   ');

      expect(nameInput).toHaveValue('   ');
    });
  });

  // ==================== DATA INTEGRITY ====================
  describe('Data Integrity', () => {
    it('should not mutate props when form is submitted', async () => {
      const originalOnCreateUser = mockOnCreateUser;
      const originalOnOpenChange = mockOnOpenChange;

      render(
        <CreateUserDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onCreateUser={mockOnCreateUser}
        />
      );

      await user.type(screen.getByPlaceholderText('Ex: João Silva'), 'Test User');
      await user.type(screen.getByPlaceholderText('Ex: joao.silva'), 'test.user');
      await user.type(screen.getByPlaceholderText('Ex: joao@gmail.com'), 'test@email.com');
      await user.type(screen.getByPlaceholderText('Senha do novo usuário'), 'senha123');
      await user.type(screen.getByPlaceholderText('Digite seu usuário'), 'admin');
      await user.type(screen.getByPlaceholderText('Digite sua senha'), 'adminpass');

      const submitButton = screen.getByRole('button', { name: /criar usuário/i });
      await user.click(submitButton);

      expect(mockOnCreateUser).toBe(originalOnCreateUser);
      expect(mockOnOpenChange).toBe(originalOnOpenChange);
    });

    it('should pass user data with correct role type', async () => {
      render(
        <CreateUserDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onCreateUser={mockOnCreateUser}
        />
      );

      await user.type(screen.getByPlaceholderText('Ex: João Silva'), 'Test User');
      await user.type(screen.getByPlaceholderText('Ex: joao.silva'), 'test.user');
      await user.type(screen.getByPlaceholderText('Ex: joao@gmail.com'), 'test@email.com');
      await user.type(screen.getByPlaceholderText('Senha do novo usuário'), 'senha123');
      await user.type(screen.getByPlaceholderText('Digite seu usuário'), 'admin');
      await user.type(screen.getByPlaceholderText('Digite sua senha'), 'adminpass');

      const submitButton = screen.getByRole('button', { name: /criar usuário/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnCreateUser).toHaveBeenCalledWith(
          expect.objectContaining({
            role: expect.stringMatching(/^(operator|admin)$/)
          }),
          expect.objectContaining({
            username: expect.any(String),
            password: expect.any(String)
          })
        );
      });
    });
  });
});
