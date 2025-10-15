'use client'

import { useState, useMemo, memo, useCallback } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Package, Search, AlertCircle, Edit, Info, Plus } from 'lucide-react';
import { useProductsDB } from '@/hooks/useProductsDB';
import { Product } from '@/types';
import { formatCurrency } from '@/utils/format';
import { ProductFormDialog } from './ProductFormDialog';
import { ProductInfoDialog } from './ProductInfoDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';

// Mapeamento legível de categorias (fallback para o valor original se não mapeado)
const CATEGORY_LABELS: Record<string, string> = {
  bebidas: 'Bebidas',
  drinks: 'Drinks',
  porcoes: 'Porções',
  petiscos: 'Petiscos',
  almoco: 'Almoço',
};

export function Inventory() {
  const { products, updateProduct, addProduct, loading } = useProductsDB();

  // Estado de busca
  const [searchQuery, setSearchQuery] = useState('');

  // Dialogs e produto em foco
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [infoProduct, setInfoProduct] = useState<Product | null>(null);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showInfoDialog, setShowInfoDialog] = useState(false);

  // Resultado filtrado memoizado
  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return products;
    return products.filter(p => p.name.toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q));
  }, [products, searchQuery]);

  // Estatísticas calculadas
  const lowStockCount = useMemo(() => products.filter(p => p.stock <= 20).length, [products]);
  
  // Valor total do estoque e valor médio por produto
  const totalStockValue = useMemo(() => 
    products.reduce((sum, p) => sum + (p.price * p.stock), 0), [products]
  );
  
  const averageStockValue = useMemo(() => 
    products.length > 0 ? totalStockValue / products.length : 0, [totalStockValue, products.length]
  );

  // Status de estoque uniforme
  const getStockStatus = useCallback((stock: number) => {
    if (stock <= 20) return { color: 'text-red-600', bg: 'bg-red-50', label: 'Crítico' };
    if (stock <= 50) return { color: 'text-orange-600', bg: 'bg-orange-50', label: 'Baixo' };
    return { color: 'text-green-600', bg: 'bg-green-50', label: 'Normal' };
  }, []);

  // Ações
  const handleCreateProduct = () => {
    setEditingProduct(null);
    setShowFormDialog(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowFormDialog(true);
  };

  const handleSaveProduct = async (partial: Partial<Product>) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, partial);
    } else {
      if (!partial.name || partial.price == null || partial.stock == null) return;
      await addProduct({
        name: partial.name,
        price: partial.price,
        stock: partial.stock,
        category: partial.category,
        subcategory: partial.subcategory,
      });
    }
  };

  return (
    <main className="space-y-6 overflow-y-auto max-h-screen pb-6" aria-labelledby="inventory-heading">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 id="inventory-heading" className="text-2xl font-semibold text-slate-900">Estoque</h1>
          <p className="text-slate-600 text-sm">Gerencie produtos, quantidades e informações.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
            <Input
              placeholder="Buscar por nome ou categoria"
              className="pl-9 w-64"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              aria-label="Buscar produtos"
            />
          </div>
          <Button
            onClick={handleCreateProduct}
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-lg flex items-center justify-center gap-3 shadow-md transition-all duration-200 min-w-[170px] font-semibold text-base"
            aria-label="Adicionar novo produto"
            style={{ boxShadow: '0 2px 8px 0 rgba(16, 185, 129, 0.10)' }}
          >
            <Plus className="w-5 h-5" aria-hidden="true" />
            Novo Produto
          </Button>
        </div>
      </div>

      {/* Cards métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total de Produtos</p>
              <p className="text-2xl text-slate-900">{products.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-rose-500 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Estoque Crítico</p>
              <p className="text-2xl text-slate-900">{lowStockCount}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Valor Total</p>
              <p className="text-2xl text-slate-900">{formatCurrency(totalStockValue)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Valor Médio</p>
              <p className="text-2xl text-slate-900">{formatCurrency(averageStockValue)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Alerta de estoque crítico */}
      {lowStockCount > 0 && (
        <Card className="p-4 bg-orange-50 border-orange-200" role="alert" aria-live="polite">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600" aria-hidden="true" />
            <p className="text-orange-900">
              {lowStockCount} produto{lowStockCount !== 1 && 's'} com estoque crítico (≤ 20 unidades)
            </p>
          </div>
        </Card>
      )}

      {/* Tabela de produtos */}
      <Card className="overflow-hidden" role="region" aria-label="Tabela de produtos">
        <div className="overflow-x-auto">
          <table className="w-full" aria-describedby="inventory-caption">
            <caption id="inventory-caption" className="sr-only">
              Tabela de produtos com nome, categoria, preço, estoque, status e ações
            </caption>
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-slate-900">Produto</th>
                <th className="px-6 py-4 text-left text-slate-900">Categoria</th>
                <th className="px-6 py-4 text-left text-slate-900">Preço</th>
                <th className="px-6 py-4 text-left text-slate-900">Estoque</th>
                <th className="px-6 py-4 text-left text-slate-900">Status</th>
                <th className="px-6 py-4 text-left text-slate-900">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200" aria-live="polite">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500 text-sm" role="status">
                    Carregando produtos...
                  </td>
                </tr>
              )}
              {!loading && filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500 text-sm" role="status">
                    Nenhum produto encontrado
                  </td>
                </tr>
              )}
              {!loading && filteredProducts.length > 0 && filteredProducts.map(product => (
                <InventoryRow
                  key={product.id}
                  product={product}
                  categoryLabel={CATEGORY_LABELS[product.category || ''] || product.category || '-'}
                  onInfo={() => { setInfoProduct(product); setShowInfoDialog(true); }}
                  onEdit={() => handleEditProduct(product)}
                  getStockStatus={getStockStatus}
                />
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Dialogs */}
      <ProductFormDialog
        open={showFormDialog}
        onOpenChange={setShowFormDialog}
        product={editingProduct}
        onSave={handleSaveProduct}
        title={editingProduct ? 'Editar Produto' : 'Novo Produto'}
      />

      <ProductInfoDialog
        open={showInfoDialog}
        onOpenChange={setShowInfoDialog}
        product={infoProduct}
      />
    </main>
  );
}

interface InventoryRowProps {
  product: Product;
  categoryLabel: string;
  onInfo: () => void;
  onEdit: () => void;
  getStockStatus: (stock: number) => { color: string; bg: string; label: string };
}

const InventoryRow = memo(function InventoryRow({ product, categoryLabel, onInfo, onEdit, getStockStatus }: InventoryRowProps) {
  const status = getStockStatus(product.stock);
  const [showAddStock, setShowAddStock] = useState(false);
  const [addQty, setAddQty] = useState('');
  const { updateProduct } = useProductsDB();

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(addQty);
    if (isNaN(qty) || qty <= 0) return;
    // Manter categoria e subcategoria ao atualizar estoque
    await updateProduct(product.id, {
      stock: product.stock + qty,
      category: product.category,
      subcategory: product.subcategory,
    });
    setShowAddStock(false);
    setAddQty('');
  };

  return (
    <tr className="hover:bg-slate-50 focus-within:outline-none">
      <td className="px-6 py-4 text-slate-900">{product.name}</td>
      <td className="px-6 py-4 text-slate-600">{categoryLabel}</td>
      <td className="px-6 py-4 text-slate-900">{formatCurrency(product.price)}</td>
      <td className="px-6 py-4 text-slate-900">{product.stock} un.</td>
      <td className="px-6 py-4">
        <span className={`px-3 py-1 rounded-full text-sm ${status.bg} ${status.color}`}>{status.label}</span>
      </td>
      <td className="px-6 py-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onInfo}
            className="gap-2"
            aria-label={`Informações do produto ${product.name}`}
          >
            <Info className="w-4 h-4" aria-hidden="true" />
            Info
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="gap-2"
            aria-label={`Editar produto ${product.name}`}
          >
            <Edit className="w-4 h-4" aria-hidden="true" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setAddQty('');
              setShowAddStock(true);
            }}
            className="gap-2"
            aria-label={`Adicionar estoque ao produto ${product.name}`}
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Estoque
          </Button>
          <Dialog open={showAddStock} onOpenChange={setShowAddStock}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar ao Estoque</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddStock} className="space-y-4">
                <div>
                  <label className="block text-sm mb-1">Quantidade a adicionar</label>
                  <Input
                    type="number"
                    min="1"
                    value={addQty}
                    onChange={e => setAddQty(e.target.value)}
                    autoFocus
                    placeholder="Digite a quantidade"
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowAddStock(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    Adicionar
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </td>
    </tr>
  );
});
