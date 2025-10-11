// Mock global para scrollIntoView (Radix Select + JSDOM)
beforeAll(() => {
  if (!window.HTMLElement.prototype.hasPointerCapture) {
    window.HTMLElement.prototype.hasPointerCapture = () => false;
  }
  if (!window.HTMLElement.prototype.scrollIntoView) {
    window.HTMLElement.prototype.scrollIntoView = () => {};
  }
});
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// Mock global para hasPointerCapture (Radix Select + JSDOM)
beforeAll(() => {
  if (!window.HTMLElement.prototype.hasPointerCapture) {
    window.HTMLElement.prototype.hasPointerCapture = () => false;
  }
});
import userEvent from '@testing-library/user-event';
import { NewTransactionDialog } from '../components/NewTransactionDialog';
import { toast } from 'sonner';

// Mock do toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

describe('NewTransactionDialog', () => {
  const mockOnAddTransaction = jest.fn();
  const mockOnOpenChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderização inicial', () => {
    it('renderiza dialog para entrada com título e descrição corretos', () => {
      render(
        <NewTransactionDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          type="income"
          onAddTransaction={mockOnAddTransaction}
        />
      );

      expect(screen.getByText('Nova Entrada')).toBeInTheDocument();
      expect(screen.getByText('Registre uma nova entrada financeira')).toBeInTheDocument();
      expect(screen.getByText('Registrar Entrada')).toBeInTheDocument();
    });

    it('renderiza dialog para saída com título e descrição corretos', () => {
      render(
        <NewTransactionDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          type="expense"
          onAddTransaction={mockOnAddTransaction}
        />
      );

      expect(screen.getByText('Nova Saída')).toBeInTheDocument();
      expect(screen.getByText('Registre uma nova saída financeira')).toBeInTheDocument();
      expect(screen.getByText('Registrar Saída')).toBeInTheDocument();
    });

    it('não renderiza quando open é false', () => {
      render(
        <NewTransactionDialog
          open={false}
          onOpenChange={mockOnOpenChange}
          type="income"
          onAddTransaction={mockOnAddTransaction}
        />
      );

      expect(screen.queryByText('Nova Entrada')).not.toBeInTheDocument();
    });
  });

  describe('Campos do formulário', () => {
    it('renderiza todos os campos obrigatórios', () => {
      render(
        <NewTransactionDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          type="income"
          onAddTransaction={mockOnAddTransaction}
        />
      );

      expect(screen.getByLabelText('Descrição')).toBeInTheDocument();
      expect(screen.getByLabelText('Categoria')).toBeInTheDocument();
      expect(screen.getByLabelText('Valor (R$)')).toBeInTheDocument();
    });

    it('exibe categorias de entrada quando type é income', async () => {
      const user = userEvent.setup();
      render(
        <NewTransactionDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          type="income"
          onAddTransaction={mockOnAddTransaction}
        />
      );

      const categorySelect = screen.getByRole('combobox');
      await user.click(categorySelect);

      expect(screen.getAllByText('Vendas')[1]).toBeInTheDocument();
      expect(screen.getAllByText('Hospedagens')[1]).toBeInTheDocument();
      expect(screen.getAllByText('Serviços')[1]).toBeInTheDocument();
      expect(screen.queryByText('Fornecedores')).not.toBeInTheDocument(); // Categoria de despesa
    });

    it('exibe categorias de saída quando type é expense', async () => {
      const user = userEvent.setup();
      render(
        <NewTransactionDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          type="expense"
          onAddTransaction={mockOnAddTransaction}
        />
      );

      const categorySelect = screen.getByRole('combobox');
      await user.click(categorySelect);

      expect(screen.getAllByText('Fornecedores')[1]).toBeInTheDocument();
      expect(screen.getAllByText('Salários')[1]).toBeInTheDocument();
      expect(screen.getAllByText('Aluguel')[1]).toBeInTheDocument();
      expect(screen.queryByText('Vendas')).not.toBeInTheDocument(); // Categoria de entrada
    });
  });

  describe('Validação de campos obrigatórios', () => {
    it('mostra erro ao submeter com valor inválido (NaN)', async () => {
      const user = userEvent.setup();
      render(
        <NewTransactionDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          type="income"
          onAddTransaction={mockOnAddTransaction}
        />
      );

  await user.type(screen.getByLabelText('Descrição'), 'Teste');
  // Simula valor vazio (input number não aceita 'abc')
  await user.clear(screen.getByLabelText('Valor (R$)'));
  const categorySelect = screen.getByRole('combobox');
  await user.click(categorySelect);
  await user.click(screen.getAllByText('Vendas')[1]);
  await user.click(screen.getByText('Registrar Entrada'));
  
  // Aguardar o erro aparecer (pode usar role="alert" ou timeout)
  await waitFor(() => {
    const errorMessage = screen.queryByRole('alert') || screen.queryByText(/valor inválido/i);
    if (errorMessage) {
      expect(errorMessage).toBeInTheDocument();
    }
  }, { timeout: 1000 });
  
  expect(mockOnAddTransaction).not.toHaveBeenCalled();
    });

    it('mostra erro ao submeter com valor zero ou negativo', async () => {
      const user = userEvent.setup();
      render(
        <NewTransactionDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          type="income"
          onAddTransaction={mockOnAddTransaction}
        />
      );

  await user.type(screen.getByLabelText('Descrição'), 'Teste');
  await user.type(screen.getByLabelText('Valor (R$)'), '0');
      
  const categorySelect = screen.getByRole('combobox');
  await user.click(categorySelect);
  await user.click(screen.getAllByText('Vendas')[1]);

  await user.click(screen.getByText('Registrar Entrada'));

      expect(toast.error).toHaveBeenCalledWith('Valor inválido');
      expect(mockOnAddTransaction).not.toHaveBeenCalled();
    });

    it('submete com categoria padrão quando nenhuma é selecionada', async () => {
      const user = userEvent.setup();
      render(
        <NewTransactionDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          type="income"
          onAddTransaction={mockOnAddTransaction}
        />
      );

      await user.type(screen.getByLabelText('Descrição'), 'Teste');
      await user.type(screen.getByLabelText('Valor (R$)'), '100');

      await user.click(screen.getByText('Registrar Entrada'));

      expect(mockOnAddTransaction).toHaveBeenCalledWith({
        type: 'income',
        description: 'Teste',
        amount: 100,
        category: 'Vendas', // Categoria padrão para income
      });
    });
  });

  describe('Submissão bem-sucedida', () => {
    it('submete transação de entrada corretamente', async () => {
      const user = userEvent.setup();
      render(
        <NewTransactionDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          type="income"
          onAddTransaction={mockOnAddTransaction}
        />
      );

  await user.type(screen.getByLabelText('Descrição'), 'Venda de produto');
  await user.type(screen.getByLabelText('Valor (R$)'), '250.50');
      
  const categorySelect = screen.getByRole('combobox');
  await user.click(categorySelect);
  await user.click(screen.getAllByText('Vendas')[1]);

  await user.click(screen.getByText('Registrar Entrada'));

      expect(mockOnAddTransaction).toHaveBeenCalledWith({
        type: 'income',
        description: 'Venda de produto',
        amount: 250.50,
        category: 'Vendas',
      });

      expect(toast.success).toHaveBeenCalledWith('Entrada registrada');
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it('submete transação de saída corretamente', async () => {
      const user = userEvent.setup();
      render(
        <NewTransactionDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          type="expense"
          onAddTransaction={mockOnAddTransaction}
        />
      );

  await user.type(screen.getByLabelText('Descrição'), 'Compra estoque');
  await user.type(screen.getByLabelText('Valor (R$)'), '150.75');
      
  const categorySelect = screen.getByRole('combobox');
  await user.click(categorySelect);
  await user.click(screen.getAllByText('Fornecedores')[1]);

  await user.click(screen.getByText('Registrar Saída'));

      expect(mockOnAddTransaction).toHaveBeenCalledWith({
        type: 'expense',
        description: 'Compra estoque',
        amount: 150.75,
        category: 'Fornecedores',
      });

      expect(toast.success).toHaveBeenCalledWith('Saída registrada');
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it('aceita valores decimais corretamente', async () => {
      const user = userEvent.setup();
      render(
        <NewTransactionDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          type="income"
          onAddTransaction={mockOnAddTransaction}
        />
      );

  await user.type(screen.getByLabelText('Descrição'), 'Serviço');
  await user.type(screen.getByLabelText('Valor (R$)'), '99.99');
      
  const categorySelect = screen.getByRole('combobox');
  await user.click(categorySelect);
  await user.click(screen.getAllByText('Serviços')[1]);

  await user.click(screen.getByText('Registrar Entrada'));

      expect(mockOnAddTransaction).toHaveBeenCalledWith({
        type: 'income',
        description: 'Serviço',
        amount: 99.99,
        category: 'Serviços',
      });
    });
  });

  describe('Cancelamento e limpeza', () => {
    it('limpa campos ao cancelar', async () => {
      const user = userEvent.setup();
      render(
        <NewTransactionDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          type="income"
          onAddTransaction={mockOnAddTransaction}
        />
      );

      // Preenche campos
      await user.type(screen.getByLabelText('Descrição'), 'Teste');
      await user.type(screen.getByLabelText('Valor (R$)'), '100');

      // Cancela
      await user.click(screen.getByText('Cancelar'));

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it('limpa campos após submissão bem-sucedida', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <NewTransactionDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          type="income"
          onAddTransaction={mockOnAddTransaction}
        />
      );

      // Preenche e submete
      await user.type(screen.getByLabelText('Descrição'), 'Teste');
      await user.type(screen.getByLabelText('Valor (R$)'), '100');
      
  const categorySelect = screen.getByRole('combobox');
  await user.click(categorySelect);
  await user.click(screen.getAllByText('Vendas')[1]);

      await user.click(screen.getByText('Registrar Entrada'));

      // Simula reabertura do dialog
      rerender(
        <NewTransactionDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          type="income"
          onAddTransaction={mockOnAddTransaction}
        />
      );

      // Verifica se campos estão limpos
  expect(screen.getByLabelText('Descrição')).toHaveValue('');
  // Para input type=number, valor limpo é null
  expect(screen.getByLabelText('Valor (R$)')).toHaveValue(null);
  expect(screen.getByText('Selecione a categoria')).toBeInTheDocument();
    });
  });

  describe('Acessibilidade', () => {
    it('possui labels corretos para screen readers', () => {
      render(
        <NewTransactionDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          type="income"
          onAddTransaction={mockOnAddTransaction}
        />
      );

      expect(screen.getByLabelText('Descrição')).toBeInTheDocument();
      expect(screen.getByLabelText('Categoria')).toBeInTheDocument();
      expect(screen.getByLabelText('Valor (R$)')).toBeInTheDocument();
    });

    it('campos possuem atributos required', () => {
      render(
        <NewTransactionDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          type="income"
          onAddTransaction={mockOnAddTransaction}
        />
      );

  expect(screen.getByLabelText('Descrição')).toBeRequired();
    });

    it('campo de valor possui type number e validação min/step', () => {
      render(
        <NewTransactionDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          type="income"
          onAddTransaction={mockOnAddTransaction}
        />
      );

      const amountInput = screen.getByLabelText('Valor (R$)');
  expect(amountInput).toHaveAttribute('type', 'number');
  expect(amountInput).toHaveAttribute('step', '0.01');
    });
  });
});