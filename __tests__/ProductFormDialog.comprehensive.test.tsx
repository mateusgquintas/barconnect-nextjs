/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ProductFormDialog } from '@/components/ProductFormDialog';
import type { Product } from '@/types';

describe('ProductFormDialog - Comprehensive Tests', () => {
  let mockOnSave: jest.Mock;
  let mockOnOpenChange: jest.Mock;
  let user: ReturnType<typeof userEvent.setup>;

  const mockProduct: Product = {
    id: '1',
    name: 'Coca-Cola',
    price: 5.0,
    stock: 100,
    category: 'bebidas',
    subcategory: 'refrigerante'
  };

  beforeEach(() => {
    mockOnSave = jest.fn();
    mockOnOpenChange = jest.fn();
    user = userEvent.setup();
  });

  // ==================== RENDERING & STRUCTURE ====================
  describe('Rendering & Structure', () => {
    it('should render without crashing when open', () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      expect(screen.getByText('Novo Produto')).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      render(
        <ProductFormDialog
          open={false}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      expect(screen.queryByText('Novo Produto')).not.toBeInTheDocument();
    });

    it('should render with custom title', () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
          title="Produto Customizado"
        />
      );
      expect(screen.getByText('Produto Customizado')).toBeInTheDocument();
    });

    it('should render all form fields', () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      
      expect(screen.getByLabelText(/Nome/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Preço/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Estoque/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Categoria Principal/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Subcategoria/i)).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      
      expect(screen.getByRole('button', { name: /Cancelar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Salvar/i })).toBeInTheDocument();
    });

    it('should show correct title for new product', () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      expect(screen.getByText('Novo Produto')).toBeInTheDocument();
    });

    it('should show correct title for editing product', () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={mockProduct}
          onSave={mockOnSave}
        />
      );
      expect(screen.getByText('Editar Produto')).toBeInTheDocument();
    });

    it('should show correct description for new product', () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      expect(screen.getByText(/cadastrar o produto/i)).toBeInTheDocument();
    });

    it('should show correct description for editing product', () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={mockProduct}
          onSave={mockOnSave}
        />
      );
      expect(screen.getByText(/atualizar o produto/i)).toBeInTheDocument();
    });
  });

  // ==================== FORM INITIALIZATION ====================
  describe('Form Initialization', () => {
    it('should initialize with empty fields for new product', () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      
      const nameInput = screen.getByLabelText(/Nome/i) as HTMLInputElement;
      const priceInput = screen.getByLabelText(/Preço/i) as HTMLInputElement;
      const stockInput = screen.getByLabelText(/Estoque/i) as HTMLInputElement;
      
      expect(nameInput.value).toBe('');
      expect(priceInput.value).toBe('');
      expect(stockInput.value).toBe('');
    });

    it('should populate fields when editing product', () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={mockProduct}
          onSave={mockOnSave}
        />
      );
      
      const nameInput = screen.getByLabelText(/Nome/i) as HTMLInputElement;
      const priceInput = screen.getByLabelText(/Preço/i) as HTMLInputElement;
      const stockInput = screen.getByLabelText(/Estoque/i) as HTMLInputElement;
      const categorySelect = screen.getByLabelText(/Categoria Principal/i) as HTMLSelectElement;
      const subcategorySelect = screen.getByLabelText(/Subcategoria/i) as HTMLSelectElement;
      
      expect(nameInput.value).toBe('Coca-Cola');
      expect(priceInput.value).toBe('5');
      expect(stockInput.value).toBe('100');
      expect(categorySelect.value).toBe('bebidas');
      expect(subcategorySelect.value).toBe('refrigerante');
    });

    it('should clear form when opening for new product after editing', () => {
      const { rerender } = render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={mockProduct}
          onSave={mockOnSave}
        />
      );
      
      rerender(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      
      const nameInput = screen.getByLabelText(/Nome/i) as HTMLInputElement;
      expect(nameInput.value).toBe('');
    });

    it('should handle reopening with same product', () => {
      const { rerender } = render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={mockProduct}
          onSave={mockOnSave}
        />
      );
      
      // Close
      rerender(
        <ProductFormDialog
          open={false}
          onOpenChange={mockOnOpenChange}
          product={mockProduct}
          onSave={mockOnSave}
        />
      );
      
      // Reopen
      rerender(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={mockProduct}
          onSave={mockOnSave}
        />
      );
      
      const nameInput = screen.getByLabelText(/Nome/i) as HTMLInputElement;
      expect(nameInput.value).toBe('Coca-Cola');
    });
  });

  // ==================== FIELD INTERACTIONS ====================
  describe('Field Interactions', () => {
    it('should allow typing in name field', async () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      
      const nameInput = screen.getByLabelText(/Nome/i);
      await user.type(nameInput, 'Água Mineral');
      
      expect(nameInput).toHaveValue('Água Mineral');
    });

    it('should allow typing in price field', async () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      
      const priceInput = screen.getByLabelText(/Preço/i);
      await user.type(priceInput, '12.50');
      
      expect(priceInput).toHaveValue(12.5);
    });

    it('should allow typing in stock field', async () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      
      const stockInput = screen.getByLabelText(/Estoque/i);
      await user.type(stockInput, '50');
      
      expect(stockInput).toHaveValue(50);
    });

    it('should allow selecting category', async () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      
      const categorySelect = screen.getByLabelText(/Categoria Principal/i);
      await user.selectOptions(categorySelect, 'bebidas');
      
      expect(categorySelect).toHaveValue('bebidas');
    });

    it('should enable subcategory when category is selected', async () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      
      const subcategorySelect = screen.getByLabelText(/Subcategoria/i) as HTMLSelectElement;
      expect(subcategorySelect.disabled).toBe(true);
      
      const categorySelect = screen.getByLabelText(/Categoria Principal/i);
      await user.selectOptions(categorySelect, 'bebidas');
      
      expect(subcategorySelect.disabled).toBe(false);
    });

    it('should allow selecting subcategory after category', async () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      
      const categorySelect = screen.getByLabelText(/Categoria Principal/i);
      await user.selectOptions(categorySelect, 'bebidas');
      
      const subcategorySelect = screen.getByLabelText(/Subcategoria/i);
      await user.selectOptions(subcategorySelect, 'cerveja');
      
      expect(subcategorySelect).toHaveValue('cerveja');
    });

    it('should handle clearing name field', async () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={mockProduct}
          onSave={mockOnSave}
        />
      );
      
      const nameInput = screen.getByLabelText(/Nome/i);
      await user.clear(nameInput);
      
      expect(nameInput).toHaveValue('');
    });

    it('should handle updating existing values', async () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={mockProduct}
          onSave={mockOnSave}
        />
      );
      
      const priceInput = screen.getByLabelText(/Preço/i);
      await user.clear(priceInput);
      await user.type(priceInput, '7.50');
      
      expect(priceInput).toHaveValue(7.5);
    });
  });

  // ==================== CATEGORY & SUBCATEGORY ====================
  describe('Category & Subcategory', () => {
    it('should show all category options', () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      
      const categorySelect = screen.getByLabelText(/Categoria Principal/i);
      const options = Array.from(categorySelect.querySelectorAll('option')).map(o => o.textContent);
      
      expect(options).toContain('Bebidas');
      expect(options).toContain('Porções');
      expect(options).toContain('Almoço');
      expect(options).toContain('Outros');
    });

    it('should show bebidas subcategories when bebidas category selected', async () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      
      const categorySelect = screen.getByLabelText(/Categoria Principal/i);
      await user.selectOptions(categorySelect, 'bebidas');
      
      const subcategorySelect = screen.getByLabelText(/Subcategoria/i);
      const options = Array.from(subcategorySelect.querySelectorAll('option')).map(o => o.textContent);
      
      expect(options).toContain('Água');
      expect(options).toContain('Refrigerante');
      expect(options).toContain('Cerveja');
      expect(options).toContain('Drink');
      expect(options).toContain('Garrafa');
    });

    it('should show porcoes subcategories when porcoes category selected', async () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      
      const categorySelect = screen.getByLabelText(/Categoria Principal/i);
      await user.selectOptions(categorySelect, 'porcoes');
      
      const subcategorySelect = screen.getByLabelText(/Subcategoria/i);
      const options = Array.from(subcategorySelect.querySelectorAll('option')).map(o => o.textContent);
      
      expect(options).toContain('Fritas');
      expect(options).toContain('Carnes');
      expect(options).toContain('Mistas');
    });

    it('should show almoco subcategories when almoco category selected', async () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      
      const categorySelect = screen.getByLabelText(/Categoria Principal/i);
      await user.selectOptions(categorySelect, 'almoco');
      
      const subcategorySelect = screen.getByLabelText(/Subcategoria/i);
      const options = Array.from(subcategorySelect.querySelectorAll('option')).map(o => o.textContent);
      
      expect(options).toContain('Executivo');
    });

    it('should show no subcategories for outros category', async () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      
      const categorySelect = screen.getByLabelText(/Categoria Principal/i);
      await user.selectOptions(categorySelect, 'outros');
      
      const subcategorySelect = screen.getByLabelText(/Subcategoria/i);
      const options = Array.from(subcategorySelect.querySelectorAll('option')).map(o => o.textContent);
      
      // Should only have "Sem subcategoria" option
      expect(options.length).toBe(1);
      expect(options[0]).toBe('Sem subcategoria');
    });

    it('should update subcategory options when category changes', async () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      
      const categorySelect = screen.getByLabelText(/Categoria Principal/i);
      
      // Select bebidas first
      await user.selectOptions(categorySelect, 'bebidas');
      let subcategorySelect = screen.getByLabelText(/Subcategoria/i);
      await user.selectOptions(subcategorySelect, 'cerveja');
      expect(subcategorySelect).toHaveValue('cerveja');
      
      // Change to porcoes
      await user.selectOptions(categorySelect, 'porcoes');
      subcategorySelect = screen.getByLabelText(/Subcategoria/i);
      const options = Array.from(subcategorySelect.querySelectorAll('option')).map(o => o.textContent);
      
      expect(options).not.toContain('Cerveja');
      expect(options).toContain('Fritas');
    });

    it('should allow "Sem categoria" option', async () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      
      const categorySelect = screen.getByLabelText(/Categoria Principal/i);
      await user.selectOptions(categorySelect, '');
      
      expect(categorySelect).toHaveValue('');
    });

    it('should disable subcategory when no category selected', () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      
      const subcategorySelect = screen.getByLabelText(/Subcategoria/i) as HTMLSelectElement;
      expect(subcategorySelect.disabled).toBe(true);
    });
  });

  // ==================== FORM VALIDATION ====================
  describe('Form Validation', () => {
    it('should require name field', () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      
      const nameInput = screen.getByLabelText(/Nome/i) as HTMLInputElement;
      expect(nameInput.required).toBe(true);
    });

    it('should require price field', () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      
      const priceInput = screen.getByLabelText(/Preço/i) as HTMLInputElement;
      expect(priceInput.required).toBe(true);
    });

    it('should require stock field', () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      
      const stockInput = screen.getByLabelText(/Estoque/i) as HTMLInputElement;
      expect(stockInput.required).toBe(true);
    });

    it('should have correct input types', () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      
      const priceInput = screen.getByLabelText(/Preço/i) as HTMLInputElement;
      const stockInput = screen.getByLabelText(/Estoque/i) as HTMLInputElement;
      
      expect(priceInput.type).toBe('number');
      expect(stockInput.type).toBe('number');
    });

    it('should have min value 0 for price', () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      
      const priceInput = screen.getByLabelText(/Preço/i) as HTMLInputElement;
      expect(priceInput.min).toBe('0');
    });

    it('should have step 0.01 for price', () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      
      const priceInput = screen.getByLabelText(/Preço/i) as HTMLInputElement;
      expect(priceInput.step).toBe('0.01');
    });

    it('should have min value 0 for stock', () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      
      const stockInput = screen.getByLabelText(/Estoque/i) as HTMLInputElement;
      expect(stockInput.min).toBe('0');
    });

    it('should have placeholder for name field', () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      
      const nameInput = screen.getByLabelText(/Nome/i) as HTMLInputElement;
      expect(nameInput.placeholder).toBe('Ex: Suco de Laranja');
    });
  });

  // ==================== SAVE FUNCTIONALITY ====================
  describe('Save Functionality', () => {
    it('should call onSave with form data when submitted', async () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      
      await user.type(screen.getByLabelText(/Nome/i), 'Água Mineral');
      await user.type(screen.getByLabelText(/Preço/i), '3.50');
      await user.type(screen.getByLabelText(/Estoque/i), '200');
      await user.selectOptions(screen.getByLabelText(/Categoria Principal/i), 'bebidas');
      await user.selectOptions(screen.getByLabelText(/Subcategoria/i), 'agua');
      
      await user.click(screen.getByRole('button', { name: /Salvar/i }));
      
      expect(mockOnSave).toHaveBeenCalledWith({
        name: 'Água Mineral',
        price: 3.5,
        stock: 200,
        category: 'bebidas',
        subcategory: 'agua'
      });
    });

    it('should close dialog after successful save', async () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      
      await user.type(screen.getByLabelText(/Nome/i), 'Produto Teste');
      await user.type(screen.getByLabelText(/Preço/i), '10');
      await user.type(screen.getByLabelText(/Estoque/i), '50');
      
      await user.click(screen.getByRole('button', { name: /Salvar/i }));
      
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it('should save with updated product data when editing', async () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={mockProduct}
          onSave={mockOnSave}
        />
      );
      
      const priceInput = screen.getByLabelText(/Preço/i);
      await user.clear(priceInput);
      await user.type(priceInput, '6.50');
      
      await user.click(screen.getByRole('button', { name: /Salvar/i }));
      
      expect(mockOnSave).toHaveBeenCalledWith({
        id: '1',
        name: 'Coca-Cola',
        price: 6.5,
        stock: 100,
        category: 'bebidas',
        subcategory: 'refrigerante'
      });
    });

    it('should save without category and subcategory', async () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      
      await user.type(screen.getByLabelText(/Nome/i), 'Item Genérico');
      await user.type(screen.getByLabelText(/Preço/i), '5');
      await user.type(screen.getByLabelText(/Estoque/i), '10');
      
      await user.click(screen.getByRole('button', { name: /Salvar/i }));
      
      expect(mockOnSave).toHaveBeenCalledWith({
        name: 'Item Genérico',
        price: 5,
        stock: 10
      });
    });

    it('should handle decimal prices correctly', async () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      
      await user.type(screen.getByLabelText(/Nome/i), 'Produto');
      await user.type(screen.getByLabelText(/Preço/i), '12.99');
      await user.type(screen.getByLabelText(/Estoque/i), '5');
      
      await user.click(screen.getByRole('button', { name: /Salvar/i }));
      
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          price: 12.99
        })
      );
    });

    it('should handle integer stock correctly', async () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      
      await user.type(screen.getByLabelText(/Nome/i), 'Produto');
      await user.type(screen.getByLabelText(/Preço/i), '10');
      await user.type(screen.getByLabelText(/Estoque/i), '150');
      
      await user.click(screen.getByRole('button', { name: /Salvar/i }));
      
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          stock: 150
        })
      );
    });


  });

  // ==================== CANCEL FUNCTIONALITY ====================
  describe('Cancel Functionality', () => {
    it('should call onOpenChange when cancel button clicked', async () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      
      await user.click(screen.getByRole('button', { name: /Cancelar/i }));
      
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it('should not call onSave when cancelled', async () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      
      await user.type(screen.getByLabelText(/Nome/i), 'Produto Teste');
      await user.click(screen.getByRole('button', { name: /Cancelar/i }));
      
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('should reset form state on reopen after cancel', async () => {
      const { rerender } = render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={mockProduct}
          onSave={mockOnSave}
        />
      );
      
      const priceInput = screen.getByLabelText(/Preço/i);
      await user.clear(priceInput);
      await user.type(priceInput, '99');
      
      // Close
      rerender(
        <ProductFormDialog
          open={false}
          onOpenChange={mockOnOpenChange}
          product={mockProduct}
          onSave={mockOnSave}
        />
      );
      
      // Reopen - should reload from product prop
      rerender(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={mockProduct}
          onSave={mockOnSave}
        />
      );
      
      const priceInputAfter = screen.getByLabelText(/Preço/i) as HTMLInputElement;
      expect(priceInputAfter.value).toBe('5'); // Original value from product prop
    });
  });

  // ==================== EDGE CASES ====================
  describe('Edge Cases', () => {
    it('should handle very long product names', async () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      
      const longName = 'A'.repeat(200);
      const nameInput = screen.getByLabelText(/Nome/i);
      const priceInput = screen.getByLabelText(/Preço/i);
      const stockInput = screen.getByLabelText(/Estoque/i);
      
      // Use fireEvent for long text (faster than userEvent)
      fireEvent.change(nameInput, { target: { value: longName } });
      fireEvent.change(priceInput, { target: { value: '5' } });
      fireEvent.change(stockInput, { target: { value: '10' } });
      
      await user.click(screen.getByRole('button', { name: /Salvar/i }));
      
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: longName
        })
      );
    });

    it('should handle special characters in name', async () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      
      const specialName = 'Água & Gelo (500ml) - R$ 2,50!';
      const nameInput = screen.getByLabelText(/Nome/i);
      const priceInput = screen.getByLabelText(/Preço/i);
      const stockInput = screen.getByLabelText(/Estoque/i);
      
      // Use fireEvent for text with special characters
      fireEvent.change(nameInput, { target: { value: specialName } });
      fireEvent.change(priceInput, { target: { value: '2.50' } });
      fireEvent.change(stockInput, { target: { value: '50' } });
      
      await user.click(screen.getByRole('button', { name: /Salvar/i }));
      
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: specialName
        })
      );
    });

    it('should handle zero price', async () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      
      await user.type(screen.getByLabelText(/Nome/i), 'Cortesia');
      await user.type(screen.getByLabelText(/Preço/i), '0');
      await user.type(screen.getByLabelText(/Estoque/i), '999');
      
      await user.click(screen.getByRole('button', { name: /Salvar/i }));
      
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          price: 0
        })
      );
    });

    it('should handle zero stock', async () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      
      await user.type(screen.getByLabelText(/Nome/i), 'Sem Estoque');
      await user.type(screen.getByLabelText(/Preço/i), '10');
      await user.type(screen.getByLabelText(/Estoque/i), '0');
      
      await user.click(screen.getByRole('button', { name: /Salvar/i }));
      
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          stock: 0
        })
      );
    });

    it('should handle very large stock numbers', async () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      
      await user.type(screen.getByLabelText(/Nome/i), 'Estoque Grande');
      await user.type(screen.getByLabelText(/Preço/i), '1');
      await user.type(screen.getByLabelText(/Estoque/i), '999999');
      
      await user.click(screen.getByRole('button', { name: /Salvar/i }));
      
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          stock: 999999
        })
      );
    });

    it('should handle very high prices', async () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      
      await user.type(screen.getByLabelText(/Nome/i), 'Produto Caro');
      await user.type(screen.getByLabelText(/Preço/i), '9999.99');
      await user.type(screen.getByLabelText(/Estoque/i), '1');
      
      await user.click(screen.getByRole('button', { name: /Salvar/i }));
      
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          price: 9999.99
        })
      );
    });

    it('should handle product with minimal data', async () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      
      await user.type(screen.getByLabelText(/Nome/i), 'X');
      await user.type(screen.getByLabelText(/Preço/i), '1');
      await user.type(screen.getByLabelText(/Estoque/i), '1');
      
      await user.click(screen.getByRole('button', { name: /Salvar/i }));
      
      expect(mockOnSave).toHaveBeenCalledWith({
        name: 'X',
        price: 1,
        stock: 1
      });
    });

    it('should handle rapid open/close cycles', async () => {
      const { rerender } = render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      
      for (let i = 0; i < 5; i++) {
        rerender(
          <ProductFormDialog
            open={false}
            onOpenChange={mockOnOpenChange}
            product={null}
            onSave={mockOnSave}
          />
        );
        
        rerender(
          <ProductFormDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            product={null}
            onSave={mockOnSave}
          />
        );
      }
      
      expect(screen.getByText('Novo Produto')).toBeInTheDocument();
    });
  });

  // ==================== ACCESSIBILITY ====================
  describe('Accessibility', () => {
    it('should have proper aria-label on dialog', () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-label', 'Novo Produto');
    });

    it('should have aria-labelledby pointing to title', () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      
      const dialog = screen.getByRole('dialog');
      const titleId = dialog.getAttribute('aria-labelledby');
      
      expect(titleId).toBeTruthy();
      expect(document.getElementById(titleId!)).toHaveTextContent('Novo Produto');
    });

    it('should have aria-describedby pointing to description', () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      
      const dialog = screen.getByRole('dialog');
      const descriptionId = dialog.getAttribute('aria-describedby');
      
      expect(descriptionId).toBeTruthy();
      expect(document.getElementById(descriptionId!)).toHaveTextContent(/cadastrar o produto/i);
    });

    it('should have labels associated with inputs', () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      
      const nameLabel = screen.getByText(/^Nome$/i);
      const nameInput = screen.getByLabelText(/Nome/i);
      
      expect(nameLabel).toBeInTheDocument();
      expect(nameInput).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      
      const nameInput = screen.getByLabelText(/Nome/i);
      nameInput.focus();
      
      await user.tab();
      expect(screen.getByLabelText(/Preço/i)).toHaveFocus();
      
      await user.tab();
      expect(screen.getByLabelText(/Estoque/i)).toHaveFocus();
    });

    it('should allow form submission with Enter key', async () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      
      await user.type(screen.getByLabelText(/Nome/i), 'Teste');
      await user.type(screen.getByLabelText(/Preço/i), '5');
      await user.type(screen.getByLabelText(/Estoque/i), '10');
      
      const nameInput = screen.getByLabelText(/Nome/i);
      await user.type(nameInput, '{Enter}');
      
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });
    });

    it('should have proper button roles', () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      
      const saveButton = screen.getByRole('button', { name: /Salvar/i });
      const cancelButton = screen.getByRole('button', { name: /Cancelar/i });
      
      expect(saveButton).toBeInTheDocument();
      expect(cancelButton).toBeInTheDocument();
    });

    it('should have correct button types', () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      
      const saveButton = screen.getByRole('button', { name: /Salvar/i }) as HTMLButtonElement;
      const cancelButton = screen.getByRole('button', { name: /Cancelar/i }) as HTMLButtonElement;
      
      expect(saveButton.type).toBe('submit');
      expect(cancelButton.type).toBe('button');
    });
  });

  // ==================== INTEGRATION ====================
  describe('Integration', () => {
    it('should work with complete workflow for new product', async () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      
      // Fill all fields
      await user.type(screen.getByLabelText(/Nome/i), 'Heineken Lata');
      await user.type(screen.getByLabelText(/Preço/i), '8.50');
      await user.type(screen.getByLabelText(/Estoque/i), '120');
      await user.selectOptions(screen.getByLabelText(/Categoria Principal/i), 'bebidas');
      await user.selectOptions(screen.getByLabelText(/Subcategoria/i), 'cerveja');
      
      // Submit
      await user.click(screen.getByRole('button', { name: /Salvar/i }));
      
      // Verify
      expect(mockOnSave).toHaveBeenCalledWith({
        name: 'Heineken Lata',
        price: 8.5,
        stock: 120,
        category: 'bebidas',
        subcategory: 'cerveja'
      });
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it('should work with complete workflow for editing product', async () => {
      render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={mockProduct}
          onSave={mockOnSave}
        />
      );
      
      // Verify initial values loaded
      expect(screen.getByLabelText(/Nome/i)).toHaveValue('Coca-Cola');
      
      // Update values
      const stockInput = screen.getByLabelText(/Estoque/i);
      await user.clear(stockInput);
      await user.type(stockInput, '150');
      
      // Submit
      await user.click(screen.getByRole('button', { name: /Salvar/i }));
      
      // Verify
      expect(mockOnSave).toHaveBeenCalledWith({
        id: '1',
        name: 'Coca-Cola',
        price: 5,
        stock: 150,
        category: 'bebidas',
        subcategory: 'refrigerante'
      });
    });

    it('should handle switching between new and edit modes', async () => {
      const { rerender } = render(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={null}
          onSave={mockOnSave}
        />
      );
      
      expect(screen.getByText('Novo Produto')).toBeInTheDocument();
      
      rerender(
        <ProductFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          product={mockProduct}
          onSave={mockOnSave}
        />
      );
      
      expect(screen.getByText('Editar Produto')).toBeInTheDocument();
      expect(screen.getByLabelText(/Nome/i)).toHaveValue('Coca-Cola');
    });
  });
});
