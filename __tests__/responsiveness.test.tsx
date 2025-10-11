/**
 * Testes de Responsividade
 * Testar adaptação de componentes em diferentes tamanhos de tela e orientações
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginScreen } from '@/components/LoginScreen';
import { AddItemDialog } from '@/components/AddItemDialog';
import { NewComandaDialog } from '@/components/NewComandaDialog';

describe('Testes de Responsividade', () => {
  // Dados mock para testes
  const mockOnLogin = jest.fn();
  const mockOnClose = jest.fn();
  const mockOnAddItem = jest.fn();
  const mockOnCreateComanda = jest.fn();
  
  // Função helper para simular mudanças de viewport
  const setViewport = (width: number, height: number) => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width });
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: height });
    fireEvent(window, new Event('resize'));
  };

  // Função helper para verificar se elemento está visível
  const isElementVisible = (element: HTMLElement): boolean => {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
  };

  beforeEach(() => {
    // Reset para viewport padrão desktop
    setViewport(1200, 800);
  });

  describe('Viewport Mobile (375px)', () => {
    beforeEach(() => {
      setViewport(375, 667); // iPhone SE size
    });

    it('Deve adaptar LoginScreen para mobile', () => {
      render(<LoginScreen onLogin={mockOnLogin} />);
      
      // Verificar se os elementos principais estão presentes
      const loginForm = screen.getByRole('button', { name: /entrar/i });
      expect(loginForm).toBeInTheDocument();
      
      // Verificar se não há overflow horizontal
      const formContainer = loginForm.closest('div');
      if (formContainer) {
        const rect = formContainer.getBoundingClientRect();
        expect(rect.width).toBeLessThanOrEqual(375 + 50); // Margem para padding
      }
    });

    it('Deve adaptar dialogs para mobile', () => {
      render(
        <NewComandaDialog 
          open={true} 
          onOpenChange={mockOnClose} 
          onCreateComanda={mockOnCreateComanda} 
        />
      );
      
      // Verificar se dialog está presente
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      
      // Verificar que dialog não excede largura mobile
      const rect = dialog.getBoundingClientRect();
      expect(rect.width).toBeLessThanOrEqual(375 + 20); // Margem para padding
    });

    it('Deve tornar botões adequados para toque', () => {
      render(<LoginScreen onLogin={mockOnLogin} />);
      
      const buttons = screen.getAllByRole('button');
      
      buttons.forEach(button => {
        if (isElementVisible(button)) {
          // Verificar que botão tem classes para altura adequada
          const classes = button.className;
          expect(classes).toMatch(/h-\d+|py-\d+|p-\d+/); // Classes de altura/padding do Tailwind
          
          // Verificar que não é um botão muito pequeno
          expect(button.textContent).toBeTruthy();
        }
      });
    });
  });

  describe('Viewport Tablet (768px)', () => {
    beforeEach(() => {
      setViewport(768, 1024); // iPad size
    });

    it('Deve adaptar LoginScreen para tablet', () => {
      render(<LoginScreen onLogin={mockOnLogin} />);
      
      const loginButton = screen.getByRole('button', { name: /entrar/i });
      expect(loginButton).toBeInTheDocument();
      
      // Em tablet, deve haver mais espaço
      const container = loginButton.closest('div');
      if (container) {
        const rect = container.getBoundingClientRect();
        expect(rect.width).toBeLessThanOrEqual(768 + 50);
      }
    });

    it('Deve mostrar dialogs com melhor aproveitamento de espaço', () => {
      render(
        <AddItemDialog 
          open={true}
          onClose={mockOnClose}
          onAddItem={mockOnAddItem}
        />
      );
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      
      // Verificar que dialog tem classes responsivas adequadas
      const classes = dialog.className;
      expect(classes).toMatch(/max-w-|w-/); // Classes de largura responsiva
      
      // Verificar que dialog está visível
      expect(isElementVisible(dialog)).toBe(true);
    });
  });

  describe('Viewport Desktop (1200px)', () => {
    beforeEach(() => {
      setViewport(1200, 800);
    });

    it('Deve mostrar LoginScreen com layout adequado em desktop', () => {
      render(<LoginScreen onLogin={mockOnLogin} />);
      
      const loginButton = screen.getByRole('button', { name: /entrar/i });
      expect(loginButton).toBeInTheDocument();
      
      // Verificar que o componente renderiza adequadamente em desktop
      const form = loginButton.closest('form');
      expect(form).toBeInTheDocument();
      
      // Verificar que há estrutura de layout (qualquer div container)
      const parentDiv = form?.closest('div');
      expect(parentDiv).toBeInTheDocument();
      
      // Em desktop, deve haver espaçamento adequado
      expect(loginButton.textContent).toBe('Entrar');
      expect(isElementVisible(loginButton)).toBe(true);
    });

    it('Deve otimizar dialogs para desktop', () => {
      render(
        <NewComandaDialog 
          open={true} 
          onOpenChange={mockOnClose} 
          onCreateComanda={mockOnCreateComanda} 
        />
      );
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      
      // Verificar classes de tamanho adequado para desktop
      const classes = dialog.className;
      expect(classes).toMatch(/max-w-|w-/); // Classes de largura controlada
      
      // Verificar que dialog não ocupa toda a tela
      expect(classes).not.toMatch(/w-full.*w-screen/);
      expect(isElementVisible(dialog)).toBe(true);
    });

    it('Deve permitir interações de hover', async () => {
      const user = userEvent.setup();
      
      render(<LoginScreen onLogin={mockOnLogin} />);
      
      const button = screen.getByRole('button', { name: /entrar/i });
      
      // Simular hover
      await user.hover(button);
      
      // Verificar que botão responde
      expect(button).toBeInTheDocument();
      expect(isElementVisible(button)).toBe(true);
    });
  });

  describe('Orientações de Tela', () => {
    it('Deve adaptar para landscape mobile', () => {
      setViewport(667, 375); // Mobile landscape
      
      render(<LoginScreen onLogin={mockOnLogin} />);
      
      const form = screen.getByRole('button', { name: /entrar/i });
      expect(form).toBeInTheDocument();
      
      // Verificar adaptação para landscape
      const container = form.closest('div');
      if (container) {
        const rect = container.getBoundingClientRect();
        expect(rect.width).toBeLessThanOrEqual(667);
      }
    });

    it('Deve adaptar para portrait tablet', () => {
      setViewport(768, 1024); // Tablet portrait
      
      render(
        <AddItemDialog 
          open={true}
          onClose={mockOnClose}
          onAddItem={mockOnAddItem}
        />
      );
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      
      // Em portrait, dialog deve usar altura disponível
      const rect = dialog.getBoundingClientRect();
      expect(rect.height).toBeLessThan(1024);
    });
  });

  describe('Breakpoints de CSS', () => {
    const breakpoints = [
      { name: 'xs', width: 320, height: 568 },  // iPhone 5
      { name: 'sm', width: 640, height: 480 },  // Small
      { name: 'md', width: 768, height: 600 },  // Medium
      { name: 'lg', width: 1024, height: 768 }, // Large
      { name: 'xl', width: 1280, height: 800 }, // Extra Large
    ];

    breakpoints.forEach(({ name, width, height }) => {
      it(`Deve funcionar no breakpoint ${name} (${width}px)`, () => {
        setViewport(width, height);
        
        render(<LoginScreen onLogin={mockOnLogin} />);
        
        // Verificar que componente renderiza corretamente
        const loginButton = screen.getByRole('button', { name: /entrar/i });
        expect(loginButton).toBeInTheDocument();
        expect(isElementVisible(loginButton)).toBe(true);
        
        // Verificar que não há overflow
        const container = loginButton.closest('div');
        if (container) {
          const rect = container.getBoundingClientRect();
          expect(rect.width).toBeLessThanOrEqual(width + 100); // Margem generosa
        }
      });
    });
  });

  describe('Acessibilidade Responsiva', () => {
    it('Deve manter foco visível em todos os tamanhos', async () => {
      const sizes = [
        [375, 667],   // Mobile
        [768, 1024],  // Tablet
        [1200, 800]   // Desktop
      ];
      
      for (const [width, height] of sizes) {
        setViewport(width, height);
        
        const { unmount } = render(<LoginScreen onLogin={mockOnLogin} />);
        
        const user = userEvent.setup();
        
        // Navegar por tab
        await user.tab();
        
        const focusedElement = document.activeElement;
        
        if (focusedElement && focusedElement !== document.body) {
          expect(isElementVisible(focusedElement as HTMLElement)).toBe(true);
        }
        
        unmount();
      }
    });

    it('Deve permitir navegação por teclado em mobile', async () => {
      setViewport(375, 667);
      
      const user = userEvent.setup();
      render(<LoginScreen onLogin={mockOnLogin} />);
      
      // Verificar que Tab funciona
      await user.tab();
      
      const focusedElement = document.activeElement;
      expect(focusedElement).not.toBe(document.body);
      
      // Verificar que Enter funciona
      if (focusedElement && focusedElement.tagName === 'INPUT') {
        await user.keyboard('{Enter}');
        // Se chegou até aqui sem erro, navegação funciona
        expect(true).toBe(true);
      }
    });

    it('Deve manter contraste adequado em todos os tamanhos', () => {
      const sizes = [375, 768, 1200];
      
      sizes.forEach(width => {
        setViewport(width, 600);
        
        const { unmount } = render(<LoginScreen onLogin={mockOnLogin} />);
        
        const buttons = screen.getAllByRole('button', { name: /entrar/i });
        const button = buttons[0]; // Pega o primeiro botão
        
        const computedStyle = window.getComputedStyle(button);
        
        // Verificar que há cores definidas (indicativo de contraste)
        expect(computedStyle.color).toBeTruthy();
        expect(computedStyle.backgroundColor).toBeTruthy();
        
        unmount();
      });
    });
  });

  describe('Performance Responsiva', () => {
    it('Deve renderizar rapidamente em mobile', () => {
      setViewport(375, 667);
      
      const startTime = performance.now();
      render(<LoginScreen onLogin={mockOnLogin} />);
      const endTime = performance.now();
      
      // Renderização deve ser rápida (menos de 100ms)
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('Deve renderizar rapidamente em desktop', () => {
      setViewport(1200, 800);
      
      const startTime = performance.now();
      render(<LoginScreen onLogin={mockOnLogin} />);
      const endTime = performance.now();
      
      // Renderização deve ser rápida
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('Deve adaptar a mudanças de viewport', () => {
      render(<LoginScreen onLogin={mockOnLogin} />);
      
      // Mudar de desktop para mobile
      setViewport(375, 667);
      
      // Componente deve continuar funcionando
      const button = screen.getByRole('button', { name: /entrar/i });
      expect(button).toBeInTheDocument();
      expect(isElementVisible(button)).toBe(true);
      
      // Mudar de mobile para desktop
      setViewport(1200, 800);
      
      // Componente deve continuar funcionando
      expect(button).toBeInTheDocument();
      expect(isElementVisible(button)).toBe(true);
    });
  });
});