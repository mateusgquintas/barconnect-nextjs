import { Product } from '@/types';

export const products: Product[] = [
  // Bebidas - Cervejas (🟠 Âmbar)
  { id: '1', name: 'Cerveja Lata', price: 6.00, stock: 150, category: 'bebidas', subcategory: 'cerveja' },
  { id: '2', name: 'Cerveja Long Neck', price: 12.00, stock: 80, category: 'bebidas', subcategory: 'cerveja' },
  
  // Bebidas - Refrigerantes e Água (🔵 Azul)
  { id: '3', name: 'Refrigerante', price: 6.00, stock: 100, category: 'bebidas', subcategory: 'refrigerante' },
  { id: '4', name: 'Água', price: 4.00, stock: 120, category: 'bebidas', subcategory: 'refrigerante' },
  
  // Bebidas - Drinks (🟣 Roxo)
  { id: '5', name: 'Caipirinha', price: 22.00, stock: 50, category: 'bebidas', subcategory: 'drink' },
  { id: '6', name: 'Vodka Dose', price: 12.00, stock: 40, category: 'bebidas', subcategory: 'drink' },
  { id: '7', name: 'Whisky Dose', price: 20.00, stock: 30, category: 'bebidas', subcategory: 'drink' },
  
  // Porções - Fritas (🟡 Amarelo)
  { id: '8', name: 'Porção de Batata', price: 25.00, stock: 25, category: 'porcoes', subcategory: 'frita' },
  
  // Porções - Carnes (🔴 Vermelho)
  { id: '9', name: 'Porção de Calabresa', price: 30.00, stock: 20, category: 'porcoes', subcategory: 'carne' },
  { id: '10', name: 'Porção de Frango', price: 28.00, stock: 22, category: 'porcoes', subcategory: 'carne' },
  { id: '12', name: 'Espetinho', price: 8.00, stock: 60, category: 'porcoes', subcategory: 'carne' },
  
  // Porções - Mistas (🟠 Laranja)
  { id: '11', name: 'Petisco Misto', price: 35.00, stock: 15, category: 'porcoes', subcategory: 'mista' },
  
  // Almoço - Executivo (🟢 Verde)
  { id: '13', name: 'Almoço Executivo', price: 40.00, stock: 30, category: 'almoco', subcategory: 'executivo' },
];