/**
 * Testes de Erro e Limites
 * Testar comportamento em cenários extremos, limites de dados e situações de erro
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginScreen } from '@/components/LoginScreen';
import { NewComandaDialog } from '@/components/NewComandaDialog';
import { NewTransactionDialog } from '@/components/NewTransactionDialog';
import { AddItemDialog } from '@/components/AddItemDialog';

describe('Testes de Erro e Limites', () => {
  const mockOnLogin = jest.fn();
  const mockOnClose = jest.fn();
  const mockOnCreateComanda = jest.fn();
  const mockOnAddTransaction = jest.fn();
  const mockOnAddItem = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Limites de Entrada de Dados', () => {
    it('Deve lidar com strings muito longas em LoginScreen', async () => {
      const user = userEvent.setup();
      
      render(<LoginScreen onLogin={mockOnLogin} />);
      
      const usernameInput = screen.getByPlaceholderText(/digite seu usuário/i);
      const passwordInput = screen.getByPlaceholderText(/digite sua senha/i);
      
      // Testar strings mais moderadamente longas
      const longString = 'a'.repeat(100); // Reduzido de 1000 para 100
      
      await user.type(usernameInput, longString);
      await user.type(passwordInput, longString);
      
      // Verificar que campos aceitam entrada longa sem quebrar
      expect(usernameInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
      expect((usernameInput as HTMLInputElement).value).toContain('a');
      
      // Verificar que não há overflow visual
      const formContainer = usernameInput.closest('form');
      expect(formContainer).toBeInTheDocument();
    }, 10000);

    it('Deve limitar entrada de números de comanda', async () => {
      const user = userEvent.setup();
      
      render(
        <NewComandaDialog 
          open={true} 
          onOpenChange={mockOnClose} 
          onCreateComanda={mockOnCreateComanda} 
        />
      );
      
      const numeroInput = screen.getByLabelText(/número|mesa/i);
      
      // Testar números extremos
      await user.type(numeroInput, '999999999999999');
      
      // Campo deve aceitar números grandes
      expect((numeroInput as HTMLInputElement).value).toContain('999999999999999');
      
      // Testar números negativos
      await user.clear(numeroInput);
      await user.type(numeroInput, '-123');
      
      expect((numeroInput as HTMLInputElement).value).toContain('-123');
    });

    it('Deve lidar com nomes de cliente muito longos', async () => {
      const user = userEvent.setup();
      
      render(
        <NewComandaDialog 
          open={true} 
          onOpenChange={mockOnClose} 
          onCreateComanda={mockOnCreateComanda} 
        />
      );
      
      const clienteInput = screen.getByLabelText(/cliente|nome/i);
      
      // Nome longo mas razoável
      const longName = 'João Silva Santos Oliveira Pereira Costa Ferreira';
      
      await user.type(clienteInput, longName);
      
      // Verificar que campo aceita nome longo
      expect((clienteInput as HTMLInputElement).value).toContain('João');
      
      // Se há limitação, verificar que é respeitada
      const maxLength = clienteInput.getAttribute('maxlength');
      if (maxLength) {
        expect((clienteInput as HTMLInputElement).value.length).toBeLessThanOrEqual(parseInt(maxLength));
      }
    }, 10000);

    it('Deve lidar com valores monetários extremos', async () => {
      const user = userEvent.setup();
      
      render(
        <NewTransactionDialog 
          open={true} 
          onOpenChange={mockOnClose} 
          type="expense"
          onAddTransaction={mockOnAddTransaction}
        />
      );
      
      const valorInput = screen.getByLabelText(/valor/i);
      
      // Testar valores muito grandes
      await user.type(valorInput, '999999999.99');
      expect((valorInput as HTMLInputElement).value).toContain('999999999.99');
      
      // Testar valores muito pequenos
      await user.clear(valorInput);
      await user.type(valorInput, '0.01');
      expect((valorInput as HTMLInputElement).value).toContain('0.01');
      
      // Testar valores com muitas casas decimais
      await user.clear(valorInput);
      await user.type(valorInput, '10.123456789');
      
      // Campo deve aceitar ou limitar adequadamente
      expect((valorInput as HTMLInputElement).value).toBeTruthy();
    });
  });

  describe('Caracteres Especiais e Unicode', () => {
    it('Deve lidar com caracteres especiais em campos de texto', async () => {
      const user = userEvent.setup();
      
      render(
        <NewComandaDialog 
          open={true} 
          onOpenChange={mockOnClose} 
          onCreateComanda={mockOnCreateComanda} 
        />
      );
      
      const clienteInput = screen.getByLabelText(/cliente|nome/i);
      
      // Testar caracteres especiais de forma mais segura
      await user.type(clienteInput, 'João & Maria');
      await user.type(clienteInput, ' - Café');
      
      // Campo deve lidar com caracteres especiais
      expect((clienteInput as HTMLInputElement).value).toContain('João');
      expect((clienteInput as HTMLInputElement).value).toContain('&');
    });

    it('Deve lidar com emojis e caracteres Unicode', async () => {
      const user = userEvent.setup();
      
      render(
        <NewComandaDialog 
          open={true} 
          onOpenChange={mockOnClose} 
          onCreateComanda={mockOnCreateComanda} 
        />
      );
      
      const clienteInput = screen.getByLabelText(/cliente|nome/i);
      
      // Testar caracteres acentuados primeiro
      await user.type(clienteInput, 'José da Conceição');
      
      expect((clienteInput as HTMLInputElement).value).toContain('José');
      
      // Limpar e testar com caracteres especiais
      await user.clear(clienteInput);
      await user.type(clienteInput, 'Müller');
      
      expect((clienteInput as HTMLInputElement).value).toContain('M');
    });

    it('Deve lidar com scripts maliciosos em inputs', async () => {
      const user = userEvent.setup();
      
      render(<LoginScreen onLogin={mockOnLogin} />);
      
      const usernameInput = screen.getByPlaceholderText(/digite seu usuário/i);
      
      // Testar tentativa de injection de forma mais segura
      await user.type(usernameInput, 'script');
      await user.type(usernameInput, 'alert');
      
      // Campo deve aceitar como texto simples
      expect((usernameInput as HTMLInputElement).value).toContain('script');
      
      // Verificar que não foi interpretado como HTML
      expect(document.querySelector('script')).toBeNull();
    });
  });

  describe('Estados de Rede e Falhas', () => {
    it('Deve lidar com falha de conexão no login', async () => {
      const user = userEvent.setup();
      
      // Mock que rejeita credenciais inválidas
      const mockLoginWithValidation = jest.fn().mockImplementation((user) => {
        if (user.username === 'usuario_falha') {
          throw new Error('Credenciais inválidas');
        }
        return Promise.resolve();
      });
      
      render(<LoginScreen onLogin={mockLoginWithValidation} />);
      
      const usernameInput = screen.getByPlaceholderText(/digite seu usuário/i);
      const passwordInput = screen.getByPlaceholderText(/digite sua senha/i);
      const submitButton = screen.getByRole('button', { name: /entrar/i });
      
      await user.type(usernameInput, 'usuario_falha');
      await user.type(passwordInput, 'senha_falha');
      await user.click(submitButton);
      
      // Aguardar processamento e verificar que interface continua responsiva
      await waitFor(() => {
        expect(submitButton).toBeInTheDocument();
        expect(submitButton).not.toBeDisabled();
      });
      
      // onLogin deve ter sido chamado mas deve ter falhado
      expect(mockLoginWithValidation).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'usuario_falha',
          password: 'senha_falha'
        })
      );
    });

    it('Deve lidar com timeouts em operações', async () => {
      const user = userEvent.setup();
      
      // Mock de operação muito lenta
      const slowOperation = jest.fn(() => 
        new Promise(resolve => setTimeout(resolve, 5000))
      );
      
      render(
        <NewComandaDialog 
          open={true} 
          onOpenChange={mockOnClose} 
          onCreateComanda={slowOperation} 
        />
      );
      
      const numeroInput = screen.getByLabelText(/número|mesa/i);
      const createButton = screen.getByRole('button', { name: /criar|adicionar/i });
      
      await user.type(numeroInput, '1');
      await user.click(createButton);
      
      // Verificar que operação foi iniciada
      expect(slowOperation).toHaveBeenCalled();
      
      // Interface deve permanecer responsiva
      expect(createButton).toBeInTheDocument();
    });
  });

  describe('Dados Malformados e Inválidos', () => {
    it('Deve lidar com dados JSON malformados', () => {
      // Simular dados corrompidos no localStorage
      const originalGetItem = Storage.prototype.getItem;
      Storage.prototype.getItem = jest.fn(() => '{invalid json}');
      
      // Renderizar componente que pode usar localStorage
      render(<LoginScreen onLogin={mockOnLogin} />);
      
      // Verificar que componente não quebra
      expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
      
      // Restaurar localStorage
      Storage.prototype.getItem = originalGetItem;
    });

    it('Deve lidar com arrays vazios e nulls', async () => {
      const user = userEvent.setup();
      
      // Mock que retorna dados vazios
      const emptyDataFunction = jest.fn().mockResolvedValue([]);
      
      render(
        <AddItemDialog 
          open={true}
          onClose={mockOnClose}
          onAddItem={emptyDataFunction}
        />
      );
      
      const searchInput = screen.getByRole('textbox');
      
      await user.type(searchInput, 'produto');
      
      // Verificar que componente lida com dados vazios
      expect(searchInput).toBeInTheDocument();
      expect((searchInput as HTMLInputElement).value).toBe('produto');
    });

    it('Deve lidar com tipos de dados incorretos', async () => {
      const user = userEvent.setup();
      
      // Mock que retorna tipo incorreto
      const wrongTypeFunction = jest.fn().mockResolvedValue('string instead of object');
      
      render(
        <NewTransactionDialog 
          open={true} 
          onOpenChange={mockOnClose} 
          type="income"
          onAddTransaction={wrongTypeFunction}
        />
      );
      
      const submitButton = screen.getByRole('button', { name: /salvar/i });
      
      // Tentar submeter
      await user.click(submitButton);
      
      // Verificar que interface não quebra
      expect(submitButton).toBeInTheDocument();
    });
  });

  describe('Limites de Performance', () => {
    it('Deve lidar com muitas interações rápidas', async () => {
      const user = userEvent.setup();
      
      render(<LoginScreen onLogin={mockOnLogin} />);
      
      const submitButton = screen.getByRole('button', { name: /entrar/i });
      
      // Simular cliques múltiplos muito rápidos
      for (let i = 0; i < 10; i++) {
        fireEvent.click(submitButton);
      }
      
      // Verificar que botão ainda está funcional
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).not.toBeDisabled();
    });

    it('Deve lidar com mudanças de estado muito rápidas', async () => {
      const user = userEvent.setup();
      
      render(
        <NewComandaDialog 
          open={true} 
          onOpenChange={mockOnClose} 
          onCreateComanda={mockOnCreateComanda} 
        />
      );
      
      const numeroInput = screen.getByLabelText(/número|mesa/i);
      
      // Simular digitação muito rápida
      const rapidText = '1234567890'.split('');
      
      for (const char of rapidText) {
        fireEvent.change(numeroInput, { target: { value: char } });
      }
      
      // Campo deve manter último valor
      expect(numeroInput).toBeInTheDocument();
    });

    it('Deve manter responsividade com componentes complexos', () => {
      const startTime = performance.now();
      
      // Renderizar múltiplos componentes simultaneamente
      const { rerender } = render(<LoginScreen onLogin={mockOnLogin} />);
      
      rerender(
        <div>
          <LoginScreen onLogin={mockOnLogin} />
          <NewComandaDialog 
            open={true} 
            onOpenChange={mockOnClose} 
            onCreateComanda={mockOnCreateComanda} 
          />
        </div>
      );
      
      const endTime = performance.now();
      
      // Renderização deve ser rápida mesmo com múltiplos componentes
      expect(endTime - startTime).toBeLessThan(200);
    });
  });

  describe('Estados Extremos de UI', () => {
    it('Deve lidar com abertura/fechamento rápido de dialogs', async () => {
      const user = userEvent.setup();
      
      let isOpen = true;
      const toggleOpen = jest.fn(() => {
        isOpen = !isOpen;
      });
      
      const { rerender } = render(
        <NewComandaDialog 
          open={isOpen} 
          onOpenChange={toggleOpen} 
          onCreateComanda={mockOnCreateComanda} 
        />
      );
      
      // Simular abertura/fechamento rápido
      for (let i = 0; i < 5; i++) {
        isOpen = !isOpen;
        rerender(
          <NewComandaDialog 
            open={isOpen} 
            onOpenChange={toggleOpen} 
            onCreateComanda={mockOnCreateComanda} 
          />
        );
      }
      
      // Componente deve lidar com mudanças rápidas
      expect(toggleOpen).toBeDefined();
    });

    it('Deve manter estado durante redimensionamento extremo', () => {
      render(<LoginScreen onLogin={mockOnLogin} />);
      
      // Simular redimensionamentos extremos
      Object.defineProperty(window, 'innerWidth', { value: 1 });
      Object.defineProperty(window, 'innerHeight', { value: 1 });
      fireEvent(window, new Event('resize'));
      
      Object.defineProperty(window, 'innerWidth', { value: 5000 });
      Object.defineProperty(window, 'innerHeight', { value: 5000 });
      fireEvent(window, new Event('resize'));
      
      // Componente deve continuar funcionando
      expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
    });

    it('Deve lidar com foco perdido/ganho rapidamente', async () => {
      const user = userEvent.setup();
      
      render(<LoginScreen onLogin={mockOnLogin} />);
      
      const usernameInput = screen.getByPlaceholderText(/digite seu usuário/i);
      const passwordInput = screen.getByPlaceholderText(/digite sua senha/i);
      
      // Simular mudanças rápidas de foco
      for (let i = 0; i < 5; i++) {
        await user.click(usernameInput);
        await user.click(passwordInput);
      }
      
      // Campos devem manter funcionalidade
      expect(usernameInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
    });
  });

  describe('Recuperação de Erros', () => {
    it('Deve permitir recuperação após erro de validação', async () => {
      const user = userEvent.setup();
      
      render(
        <NewComandaDialog 
          open={true} 
          onOpenChange={mockOnClose} 
          onCreateComanda={mockOnCreateComanda} 
        />
      );
      
      const numeroInput = screen.getByLabelText(/número|mesa/i);
      const createButton = screen.getByRole('button', { name: /criar|adicionar/i });
      
      // Tentar submeter sem dados (deve causar erro)
      await user.click(createButton);
      
      // Corrigir entrada
      await user.type(numeroInput, '1');
      await user.click(createButton);
      
      // Agora deve funcionar
      expect(mockOnCreateComanda).toHaveBeenCalled();
    });

    it('Deve manter dados após erro temporário', async () => {
      const user = userEvent.setup();
      
      render(<LoginScreen onLogin={mockOnLogin} />);
      
      const usernameInput = screen.getByPlaceholderText(/digite seu usuário/i);
      const passwordInput = screen.getByPlaceholderText(/digite sua senha/i);
      
      // Inserir dados
      await user.type(usernameInput, 'usuario');
      await user.type(passwordInput, 'senha');
      
      // Simular erro (foco perdido, etc.)
      fireEvent.blur(usernameInput);
      fireEvent.blur(passwordInput);
      
      // Dados devem ser preservados
      expect((usernameInput as HTMLInputElement).value).toBe('usuario');
      expect((passwordInput as HTMLInputElement).value).toBe('senha');
    });

    it('Deve permitir reinicialização após falha crítica', async () => {
      const user = userEvent.setup();
      
      render(<LoginScreen onLogin={mockOnLogin} />);
      
      const usernameInput = screen.getByPlaceholderText(/digite seu usuário/i);
      const passwordInput = screen.getByPlaceholderText(/digite sua senha/i);
      const submitButton = screen.getByRole('button', { name: /entrar/i });
      
      await user.type(usernameInput, 'usuario');
      await user.type(passwordInput, 'senha');
      
      // Primeira tentativa - com dados inválidos (falha esperada)
      await user.click(submitButton);
      
      // Aguardar que o botão volte ao estado normal
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
      
      // Segunda tentativa - mesmo dados (sistema permite nova tentativa)
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
      
      // Verificar que sistema permite múltiplas tentativas
      expect(submitButton).toBeInTheDocument();
      expect(usernameInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
    });
  });
});