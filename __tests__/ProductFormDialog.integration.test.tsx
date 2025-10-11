import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProductFormDialog } from '../components/ProductFormDialog';

// Mock onSave and onOpenChange
const onSave = jest.fn();
const onOpenChange = jest.fn();

describe('ProductFormDialog integration', () => {
  it('should fill and submit the form for new product', async () => {
    render(
      <ProductFormDialog open={true} onOpenChange={onOpenChange} product={null} onSave={onSave} />
    );
    fireEvent.change(screen.getByPlaceholderText(/Ex: Suco de Laranja/i), { target: { value: 'Água Mineral' } });
    fireEvent.change(screen.getByLabelText(/Preço/i), { target: { value: '2.5' } });
    fireEvent.change(screen.getByLabelText(/Estoque/i), { target: { value: '100' } });
  fireEvent.change(screen.getByLabelText(/Categoria Principal/i), { target: { value: 'bebidas' } });
    fireEvent.change(screen.getByLabelText(/Subcategoria/i), { target: { value: 'garrafa' } });
  fireEvent.click(screen.getByRole('button', { name: /Salvar/i }));
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        name: 'Água Mineral',
        price: 2.5,
        stock: 100,
        category: 'bebidas',
        subcategory: 'garrafa',
      });
    });
  });
});
