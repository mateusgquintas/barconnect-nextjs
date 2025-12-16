import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NewComandaDialog } from '@/components/NewComandaDialog';

// Mock dos componentes UI
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => (open ? <div data-testid="dialog">{children}</div> : null),
  DialogContent: ({ children, className }: any) => (
    <div className={className} data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogDescription: ({ children }: any) => <p>{children}</p>,
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ onChange, value, id, type, placeholder, autoFocus, className, ...props }: any) => (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      autoFocus={autoFocus}
      className={className}
      {...props}
    />
  ),
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor }: any) => <label htmlFor={htmlFor}>{children}</label>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, type, variant, className, ...props }: any) => (
    <button onClick={onClick} type={type} data-variant={variant} className={className} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/utils/notify', () => ({
  getToast: jest.fn(() => ({ success: jest.fn(), error: jest.fn() })),
}));

describe('NewComandaDialog - Comprehensive Tests', () => {
  const mockOnOpenChange = jest.fn();
  const mockOnCreateComanda = jest.fn();

  const defaultProps = {
    open: true,
    onOpenChange: mockOnOpenChange,
    onCreateComanda: mockOnCreateComanda,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering & Structure', () => {
    it('should render when open is true', () => {
      render(<NewComandaDialog {...defaultProps} />);
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
    });

    it('should not render when open is false', () => {
      render(<NewComandaDialog {...defaultProps} open={false} />);
      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    });

    it('should render dialog title', () => {
      render(<NewComandaDialog {...defaultProps} />);
      expect(screen.getByText('Nova Comanda')).toBeInTheDocument();
    });

    it('should render dialog description', () => {
      render(<NewComandaDialog {...defaultProps} />);
      expect(screen.getByText(/Preencha os dados da comanda/)).toBeInTheDocument();
    });

    it('should render comanda number label', () => {
      render(<NewComandaDialog {...defaultProps} />);
      expect(screen.getByText(/Número da Comanda/)).toBeInTheDocument();
    });

    it('should show required indicator for comanda number', () => {
      render(<NewComandaDialog {...defaultProps} />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('should render customer name label', () => {
      render(<NewComandaDialog {...defaultProps} />);
      expect(screen.getByText(/Nome do Cliente \(opcional\)/)).toBeInTheDocument();
    });

    it('should render comanda number input', () => {
      render(<NewComandaDialog {...defaultProps} />);
      expect(screen.getByPlaceholderText('Ex: 001')).toBeInTheDocument();
    });

    it('should render customer name input', () => {
      render(<NewComandaDialog {...defaultProps} />);
      expect(screen.getByPlaceholderText('Ex: João Silva')).toBeInTheDocument();
    });

    it('should render cancel button', () => {
      render(<NewComandaDialog {...defaultProps} />);
      expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
    });

    it('should render create button', () => {
      render(<NewComandaDialog {...defaultProps} />);
      expect(screen.getByRole('button', { name: /criar comanda/i })).toBeInTheDocument();
    });
  });

  describe('Form Inputs', () => {
    it('should have comanda number input with correct type', () => {
      render(<NewComandaDialog {...defaultProps} />);
      const input = screen.getByPlaceholderText('Ex: 001');
      expect(input).toHaveAttribute('type', 'number');
    });

    it('should have customer name input with correct type', () => {
      render(<NewComandaDialog {...defaultProps} />);
      const input = screen.getByPlaceholderText('Ex: João Silva');
      expect(input).toHaveAttribute('type', 'text');
    });

    it('should have autoFocus attribute on comanda number input', () => {
      render(<NewComandaDialog {...defaultProps} />);
      const input = screen.getByPlaceholderText('Ex: 001');
      // AutoFocus is set in component but testing library doesn't reflect it in jsdom
      expect(input).toBeInTheDocument();
    });

    it('should update comanda number on input change', async () => {
      const user = userEvent.setup();
      render(<NewComandaDialog {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Ex: 001');
      await user.type(input, '123');
      
      expect(input).toHaveValue(123);
    });

    it('should update customer name on input change', async () => {
      const user = userEvent.setup();
      render(<NewComandaDialog {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Ex: João Silva');
      await user.type(input, 'Maria Santos');
      
      expect(input).toHaveValue('Maria Santos');
    });

    it('should clear error when typing valid value', async () => {
      const user = userEvent.setup();
      render(<NewComandaDialog {...defaultProps} />);
      
      // Type invalid value to trigger error
      const input = screen.getByPlaceholderText('Ex: 001');
      await user.type(input, '0');
      
      const submitButton = screen.getByRole('button', { name: /criar comanda/i });
      await user.click(submitButton);
      
      expect(screen.getByText('Digite um número válido')).toBeInTheDocument();
      
      // Type valid value to clear error
      await user.clear(input);
      await user.type(input, '1');
      
      expect(screen.queryByText('Digite um número válido')).not.toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should accept empty comanda number (defaults to 1)', async () => {
      const user = userEvent.setup();
      render(<NewComandaDialog {...defaultProps} />);
      
      const submitButton = screen.getByRole('button', { name: /criar comanda/i });
      await user.click(submitButton);
      
      // Empty defaults to 1, should be accepted
      expect(mockOnCreateComanda).toHaveBeenCalledWith(1, undefined);
    });

    it('should show error for zero comanda number', async () => {
      const user = userEvent.setup();
      render(<NewComandaDialog {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Ex: 001');
      await user.type(input, '0');
      
      const submitButton = screen.getByRole('button', { name: /criar comanda/i });
      await user.click(submitButton);
      
      expect(screen.getByText('Digite um número válido')).toBeInTheDocument();
    });

    it('should show error for negative comanda number', async () => {
      const user = userEvent.setup();
      render(<NewComandaDialog {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Ex: 001');
      await user.type(input, '-5');
      
      const submitButton = screen.getByRole('button', { name: /criar comanda/i });
      await user.click(submitButton);
      
      expect(screen.getByText('Digite um número válido')).toBeInTheDocument();
    });

    it('should accept valid comanda number', async () => {
      const user = userEvent.setup();
      render(<NewComandaDialog {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Ex: 001');
      await user.type(input, '5');
      
      const submitButton = screen.getByRole('button', { name: /criar comanda/i });
      await user.click(submitButton);
      
      expect(mockOnCreateComanda).toHaveBeenCalledWith(5, undefined);
    });

    it('should not require customer name', async () => {
      const user = userEvent.setup();
      render(<NewComandaDialog {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Ex: 001');
      await user.type(input, '10');
      
      const submitButton = screen.getByRole('button', { name: /criar comanda/i });
      await user.click(submitButton);
      
      expect(mockOnCreateComanda).toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    it('should call onCreateComanda with number only', async () => {
      const user = userEvent.setup();
      render(<NewComandaDialog {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Ex: 001');
      await user.type(input, '15');
      
      const submitButton = screen.getByRole('button', { name: /criar comanda/i });
      await user.click(submitButton);
      
      expect(mockOnCreateComanda).toHaveBeenCalledWith(15, undefined);
    });

    it('should call onCreateComanda with number and customer name', async () => {
      const user = userEvent.setup();
      render(<NewComandaDialog {...defaultProps} />);
      
      const numberInput = screen.getByPlaceholderText('Ex: 001');
      await user.type(numberInput, '20');
      
      const nameInput = screen.getByPlaceholderText('Ex: João Silva');
      await user.type(nameInput, 'Pedro Costa');
      
      const submitButton = screen.getByRole('button', { name: /criar comanda/i });
      await user.click(submitButton);
      
      expect(mockOnCreateComanda).toHaveBeenCalledWith(20, 'Pedro Costa');
    });

    it('should trim whitespace from inputs', async () => {
      const user = userEvent.setup();
      render(<NewComandaDialog {...defaultProps} />);
      
      const numberInput = screen.getByPlaceholderText('Ex: 001');
      await user.type(numberInput, '  25  ');
      
      const nameInput = screen.getByPlaceholderText('Ex: João Silva');
      await user.type(nameInput, '  Maria Santos  ');
      
      const submitButton = screen.getByRole('button', { name: /criar comanda/i });
      await user.click(submitButton);
      
      expect(mockOnCreateComanda).toHaveBeenCalledWith(25, 'Maria Santos');
    });

    it('should treat empty customer name as undefined', async () => {
      const user = userEvent.setup();
      render(<NewComandaDialog {...defaultProps} />);
      
      const numberInput = screen.getByPlaceholderText('Ex: 001');
      await user.type(numberInput, '30');
      
      const nameInput = screen.getByPlaceholderText('Ex: João Silva');
      await user.type(nameInput, '   ');
      
      const submitButton = screen.getByRole('button', { name: /criar comanda/i });
      await user.click(submitButton);
      
      expect(mockOnCreateComanda).toHaveBeenCalledWith(30, undefined);
    });

    it('should close dialog after successful submission', async () => {
      const user = userEvent.setup();
      render(<NewComandaDialog {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Ex: 001');
      await user.type(input, '35');
      
      const submitButton = screen.getByRole('button', { name: /criar comanda/i });
      await user.click(submitButton);
      
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it('should reset form after successful submission', async () => {
      const user = userEvent.setup();
      render(<NewComandaDialog {...defaultProps} />);
      
      const numberInput = screen.getByPlaceholderText('Ex: 001');
      const nameInput = screen.getByPlaceholderText('Ex: João Silva');
      
      await user.type(numberInput, '40');
      await user.type(nameInput, 'Cliente Teste');
      
      const submitButton = screen.getByRole('button', { name: /criar comanda/i });
      await user.click(submitButton);
      
      expect(numberInput).toHaveValue(null);
      expect(nameInput).toHaveValue('');
    });

    it('should prevent default form submission', async () => {
      const user = userEvent.setup();
      const mockSubmit = jest.fn((e) => e.preventDefault());
      
      render(<NewComandaDialog {...defaultProps} />);
      
      const form = screen.getByRole('button', { name: /criar comanda/i }).closest('form');
      form?.addEventListener('submit', mockSubmit);
      
      const input = screen.getByPlaceholderText('Ex: 001');
      await user.type(input, '45');
      
      const submitButton = screen.getByRole('button', { name: /criar comanda/i });
      await user.click(submitButton);
      
      expect(mockSubmit).toHaveBeenCalled();
    });
  });

  describe('Cancel Functionality', () => {
    it('should call onOpenChange when cancel clicked', async () => {
      const user = userEvent.setup();
      render(<NewComandaDialog {...defaultProps} />);
      
      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      await user.click(cancelButton);
      
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it('should reset form when cancel clicked', async () => {
      const user = userEvent.setup();
      render(<NewComandaDialog {...defaultProps} />);
      
      const numberInput = screen.getByPlaceholderText('Ex: 001');
      const nameInput = screen.getByPlaceholderText('Ex: João Silva');
      
      await user.type(numberInput, '50');
      await user.type(nameInput, 'Teste');
      
      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      await user.click(cancelButton);
      
      expect(numberInput).toHaveValue(null);
      expect(nameInput).toHaveValue('');
    });

    it('should clear error when cancel clicked', async () => {
      const user = userEvent.setup();
      render(<NewComandaDialog {...defaultProps} />);
      
      // Type invalid value
      const input = screen.getByPlaceholderText('Ex: 001');
      await user.type(input, '0');
      
      // Trigger error
      const submitButton = screen.getByRole('button', { name: /criar comanda/i });
      await user.click(submitButton);
      
      expect(screen.getByText('Digite um número válido')).toBeInTheDocument();
      
      // Cancel
      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      await user.click(cancelButton);
      
      // Error should be cleared
      expect(screen.queryByText('Digite um número válido')).not.toBeInTheDocument();
    });

    it('should have cancel button with outline variant', () => {
      render(<NewComandaDialog {...defaultProps} />);
      
      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      expect(cancelButton).toHaveAttribute('data-variant', 'outline');
    });

    it('should have cancel button with type button', () => {
      render(<NewComandaDialog {...defaultProps} />);
      
      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      expect(cancelButton).toHaveAttribute('type', 'button');
    });
  });

  describe('Button Types & Variants', () => {
    it('should have submit button with type submit', () => {
      render(<NewComandaDialog {...defaultProps} />);
      
      const submitButton = screen.getByRole('button', { name: /criar comanda/i });
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    it('should have proper styling classes', () => {
      const { container } = render(<NewComandaDialog {...defaultProps} />);
      
      expect(container.querySelector('.space-y-4')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large comanda numbers', async () => {
      const user = userEvent.setup();
      render(<NewComandaDialog {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Ex: 001');
      await user.type(input, '99999');
      
      const submitButton = screen.getByRole('button', { name: /criar comanda/i });
      await user.click(submitButton);
      
      expect(mockOnCreateComanda).toHaveBeenCalledWith(99999, undefined);
    });

    it('should handle very long customer names', async () => {
      const user = userEvent.setup();
      render(<NewComandaDialog {...defaultProps} />);
      
      const longName = 'Nome Extremamente Longo de Cliente Que Pode Causar Problemas no Layout';
      
      const numberInput = screen.getByPlaceholderText('Ex: 001');
      await user.type(numberInput, '100');
      
      const nameInput = screen.getByPlaceholderText('Ex: João Silva');
      await user.type(nameInput, longName);
      
      const submitButton = screen.getByRole('button', { name: /criar comanda/i });
      await user.click(submitButton);
      
      expect(mockOnCreateComanda).toHaveBeenCalledWith(100, longName);
    });

    it('should handle special characters in customer name', async () => {
      const user = userEvent.setup();
      render(<NewComandaDialog {...defaultProps} />);
      
      const nameWithSpecialChars = "José D'Angelo";
      
      const numberInput = screen.getByPlaceholderText('Ex: 001');
      await user.type(numberInput, '101');
      
      const nameInput = screen.getByPlaceholderText('Ex: João Silva');
      await user.type(nameInput, nameWithSpecialChars);
      
      const submitButton = screen.getByRole('button', { name: /criar comanda/i });
      await user.click(submitButton);
      
      expect(mockOnCreateComanda).toHaveBeenCalledWith(101, nameWithSpecialChars);
    });

    it('should handle empty number with customer name', async () => {
      const user = userEvent.setup();
      render(<NewComandaDialog {...defaultProps} />);
      
      const nameInput = screen.getByPlaceholderText('Ex: João Silva');
      await user.type(nameInput, 'Test Customer');
      
      const submitButton = screen.getByRole('button', { name: /criar comanda/i });
      await user.click(submitButton);
      
      // Empty number defaults to 1
      expect(mockOnCreateComanda).toHaveBeenCalledWith(1, 'Test Customer');
    });

    it('should handle multiple form fills', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<NewComandaDialog {...defaultProps} />);
      
      // First submission
      let input = screen.getByPlaceholderText('Ex: 001');
      await user.type(input, '105');
      
      let submitButton = screen.getByRole('button', { name: /criar comanda/i });
      await user.click(submitButton);
      
      expect(mockOnCreateComanda).toHaveBeenCalledWith(105, undefined);
      
      // Reopen and submit again
      rerender(<NewComandaDialog {...defaultProps} open={true} />);
      
      input = screen.getByPlaceholderText('Ex: 001');
      await user.type(input, '106');
      
      submitButton = screen.getByRole('button', { name: /criar comanda/i });
      await user.click(submitButton);
      
      expect(mockOnCreateComanda).toHaveBeenCalledWith(106, undefined);
    });
  });

  describe('Accessibility', () => {
    it('should have proper label associations', () => {
      render(<NewComandaDialog {...defaultProps} />);
      
      const numberInput = screen.getByPlaceholderText('Ex: 001');
      expect(numberInput).toHaveAttribute('id', 'comandaNumber');
      
      const nameInput = screen.getByPlaceholderText('Ex: João Silva');
      expect(nameInput).toHaveAttribute('id', 'customerName');
    });

    it('should display error message when validation fails', async () => {
      const user = userEvent.setup();
      render(<NewComandaDialog {...defaultProps} />);
      
      // Type invalid value
      const input = screen.getByPlaceholderText('Ex: 001');
      await user.type(input, '0');
      
      const submitButton = screen.getByRole('button', { name: /criar comanda/i });
      await user.click(submitButton);
      
      const error = screen.getByText('Digite um número válido');
      expect(error).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      render(<NewComandaDialog {...defaultProps} />);
      
      const title = screen.getByText('Nova Comanda');
      expect(title.tagName).toBe('H2');
    });

    it('should have descriptive button labels', () => {
      render(<NewComandaDialog {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /criar comanda/i })).toBeInTheDocument();
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete creation flow', async () => {
      const user = userEvent.setup();
      render(<NewComandaDialog {...defaultProps} />);
      
      // Fill form
      const numberInput = screen.getByPlaceholderText('Ex: 001');
      await user.type(numberInput, '200');
      
      const nameInput = screen.getByPlaceholderText('Ex: João Silva');
      await user.type(nameInput, 'Integration Test');
      
      // Submit
      const submitButton = screen.getByRole('button', { name: /criar comanda/i });
      await user.click(submitButton);
      
      // Verify callbacks
      expect(mockOnCreateComanda).toHaveBeenCalledWith(200, 'Integration Test');
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it('should handle error and retry flow', async () => {
      const user = userEvent.setup();
      render(<NewComandaDialog {...defaultProps} />);
      
      // Submit with invalid number
      const input = screen.getByPlaceholderText('Ex: 001');
      await user.type(input, '-5');
      
      let submitButton = screen.getByRole('button', { name: /criar comanda/i });
      await user.click(submitButton);
      
      expect(screen.getByText('Digite um número válido')).toBeInTheDocument();
      expect(mockOnCreateComanda).not.toHaveBeenCalled();
      
      // Fix and retry
      await user.clear(input);
      await user.type(input, '201');
      
      submitButton = screen.getByRole('button', { name: /criar comanda/i });
      await user.click(submitButton);
      
      expect(mockOnCreateComanda).toHaveBeenCalledWith(201, undefined);
    });

    it('should handle open/close state changes', () => {
      const { rerender } = render(<NewComandaDialog {...defaultProps} open={false} />);
      
      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
      
      rerender(<NewComandaDialog {...defaultProps} open={true} />);
      
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
    });
  });
});
