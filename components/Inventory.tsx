'use client'

import { useState, useMemo, memo, useCallback } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Package, Search, AlertCircle, Edit, Info, Plus, Minus, Printer, Download, ShoppingCart, X, Tags } from 'lucide-react';
import { useProductsDB } from '@/hooks/useProductsDB';
import { Product } from '@/types';
import { ProductFormDialog } from './ProductFormDialog';
import { ProductInfoDialog } from './ProductInfoDialog';
import { CategoryManagerDialog } from './CategoryManagerDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';

// Mapeamento legível de categorias (fallback para o valor original se não mapeado)
const CATEGORY_LABELS: Record<string, string> = {
  bebidas: 'Bebidas',
  drinks: 'Drinks',
  porcoes: 'Porções',
  petiscos: 'Petiscos',
  almoco: 'Almoço',
};

// Categorias de itens perecíveis/in natura: compradas com frequência (semanal), então um
// estoque baixo é normal e não deve ser tratado como "crítico" no mesmo patamar de itens de mercearia.
const PERISHABLE_CATEGORIES = new Set([
  'Hortaliças e legumes',
  'Frutas',
  'Carnes e embutidos',
  'Laticínios e ovos',
]);

// Limite padrão de estoque mínimo por categoria, usado quando o produto não tem um valor próprio definido.
function getDefaultMinStock(category?: string): number {
  if (category && PERISHABLE_CATEGORIES.has(category)) return 5;
  return 20;
}

export function Inventory() {
  const {
    products,
    categories: standaloneCategories,
    updateProduct,
    addProduct,
    loading,
    addCategory,
    renameCategory,
    deleteCategory,
  } = useProductsDB();

  // Estado de busca e filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Dialogs e produto em foco
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [infoProduct, setInfoProduct] = useState<Product | null>(null);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  // Seleção de produtos para lista de compras
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Categorias já cadastradas (produtos + categorias criadas sem produto ainda), para sugestão no formulário e filtro
  const existingCategories = useMemo(() => {
    const fromProducts = products.map(p => p.category).filter((c): c is string => Boolean(c));
    return Array.from(new Set([...fromProducts, ...standaloneCategories])).sort();
  }, [products, standaloneCategories]);

  // Status de estoque: usa o mínimo definido no próprio produto, ou um padrão por categoria
  // (perecíveis/in natura toleram estoque mais baixo, já que são comprados semanalmente).
  const getStockStatus = useCallback((product: Pick<Product, 'stock' | 'category' | 'min_stock'>) => {
    const minStock = product.min_stock ?? getDefaultMinStock(product.category);
    if (product.stock <= minStock) return { color: 'text-red-600', bg: 'bg-red-50', label: 'Crítico' };
    if (product.stock <= minStock * 2.5) return { color: 'text-orange-600', bg: 'bg-orange-50', label: 'Baixo' };
    return { color: 'text-green-600', bg: 'bg-green-50', label: 'Normal' };
  }, []);

  // Resultado filtrado memoizado
  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter(p => {
      const matchesSearch = !q || p.name.toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q);
      const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || getStockStatus(p).label === filterStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchQuery, filterCategory, filterStatus, getStockStatus]);

  // Estatísticas calculadas
  const lowStockCount = useMemo(() => products.filter(p => getStockStatus(p).label === 'Crítico').length, [products, getStockStatus]);

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
      if (!partial.name || partial.stock == null) return;
      await addProduct({
        name: partial.name,
        price: 0,
        stock: partial.stock,
        category: partial.category,
        min_stock: partial.min_stock,
      });
    }
  };

  // Seleção para lista de compras
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const allVisibleSelected = filteredProducts.length > 0 && filteredProducts.every(p => selectedIds.has(p.id));

  const toggleSelectAllVisible = () => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        filteredProducts.forEach(p => next.delete(p.id));
      } else {
        filteredProducts.forEach(p => next.add(p.id));
      }
      return next;
    });
  };

  const selectedProducts = useMemo(
    () => products.filter(p => selectedIds.has(p.id)),
    [products, selectedIds]
  );

  const handlePrintShoppingList = () => {
    window.print();
  };

  const handleExportShoppingList = () => {
    const header = ['Produto', 'Categoria', 'Estoque atual', 'Quantidade a comprar'];
    const rows = selectedProducts.map(p => [
      p.name,
      CATEGORY_LABELS[p.category || ''] || p.category || '-',
      String(p.stock),
      '',
    ]);
    const csv = [header, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
      .join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lista-de-compras-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50" aria-labelledby="inventory-heading">
    <div className="p-8 space-y-6">
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

      {/* Filtros */}
      <Card className="p-4 no-print">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-slate-900">Filtros:</span>
          <div className="w-48">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger aria-label="Filtrar por categoria">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {existingCategories.map(cat => (
                  <SelectItem key={cat} value={cat}>{CATEGORY_LABELS[cat] || cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-44">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger aria-label="Filtrar por status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="Crítico">Crítico</SelectItem>
                <SelectItem value="Baixo">Baixo</SelectItem>
                <SelectItem value="Normal">Normal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(filterCategory !== 'all' || filterStatus !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setFilterCategory('all'); setFilterStatus('all'); }}
              className="gap-1 text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
              Limpar
            </Button>
          )}
          <div className="flex-1" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCategoryManager(true)}
            className="gap-2"
          >
            <Tags className="w-3.5 h-3.5" />
            Gerenciar Categorias
          </Button>
        </div>
      </Card>

      {/* Barra de seleção / lista de compras */}
      {selectedIds.size > 0 && (
        <Card className="p-4 bg-blue-50 border-blue-200 no-print">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-blue-900">
              <ShoppingCart className="w-4 h-4" />
              <span className="text-sm font-semibold">
                {selectedIds.size} produto{selectedIds.size !== 1 && 's'} selecionado{selectedIds.size !== 1 && 's'} para lista de compras
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedIds(new Set())} className="gap-1">
                <X className="w-3.5 h-3.5" />
                Limpar seleção
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrintShoppingList} className="gap-1">
                <Printer className="w-3.5 h-3.5" />
                Imprimir
              </Button>
              <Button size="sm" onClick={handleExportShoppingList} className="gap-1 bg-blue-600 hover:bg-blue-700 text-white">
                <Download className="w-3.5 h-3.5" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Cards métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
      </div>

      {/* Alerta de estoque crítico */}
      {lowStockCount > 0 && (
        <Card className="p-4 bg-orange-50 border-orange-200" role="alert" aria-live="polite">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600" aria-hidden="true" />
            <p className="text-orange-900">
              {lowStockCount} produto{lowStockCount !== 1 && 's'} com estoque crítico (abaixo do mínimo definido para cada item)
            </p>
          </div>
        </Card>
      )}

      {/* Tabela de produtos */}
      <Card className="overflow-hidden no-print" role="region" aria-label="Tabela de produtos">
        <div className="overflow-x-auto">
          <table className="w-full" aria-describedby="inventory-caption">
            <caption id="inventory-caption" className="sr-only">
              Tabela de produtos com nome, categoria, estoque, status e ações
            </caption>
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-4 text-left w-px">
                  <Checkbox
                    checked={allVisibleSelected}
                    onCheckedChange={toggleSelectAllVisible}
                    aria-label="Selecionar todos os produtos visíveis"
                  />
                </th>
                <th className="px-6 py-4 text-left text-slate-900 w-full">Produto</th>
                <th className="px-6 py-4 text-left text-slate-900 whitespace-nowrap">Categoria</th>
                <th className="px-6 py-4 text-left text-slate-900 whitespace-nowrap">Estoque</th>
                <th className="px-6 py-4 text-left text-slate-900 whitespace-nowrap">Status</th>
                <th className="px-6 py-4 text-left text-slate-900 whitespace-nowrap">Ações</th>
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
                  selected={selectedIds.has(product.id)}
                  onToggleSelect={() => toggleSelect(product.id)}
                  onInfo={() => { setInfoProduct(product); setShowInfoDialog(true); }}
                  onEdit={() => handleEditProduct(product)}
                  getStockStatus={getStockStatus}
                />
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Lista de compras: somente para impressão */}
      {selectedProducts.length > 0 && (
        <div className="hidden print:block">
          <h1 className="text-xl font-bold mb-1">Lista de Compras</h1>
          <p className="text-sm text-slate-600 mb-4">Gerada em {new Date().toLocaleDateString('pt-BR')}</p>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-900">
                <th className="text-left py-2">Produto</th>
                <th className="text-left py-2">Categoria</th>
                <th className="text-left py-2">Estoque atual</th>
                <th className="text-left py-2">Quantidade a comprar</th>
              </tr>
            </thead>
            <tbody>
              {selectedProducts.map(p => (
                <tr key={p.id} className="border-b border-slate-300">
                  <td className="py-2">{p.name}</td>
                  <td className="py-2">{CATEGORY_LABELS[p.category || ''] || p.category || '-'}</td>
                  <td className="py-2">{p.stock} un.</td>
                  <td className="py-2">______________</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Dialogs */}
      <ProductFormDialog
        open={showFormDialog}
        onOpenChange={setShowFormDialog}
        product={editingProduct}
        onSave={handleSaveProduct}
        title={editingProduct ? 'Editar Produto' : 'Novo Produto'}
        existingCategories={existingCategories}
      />

      <ProductInfoDialog
        open={showInfoDialog}
        onOpenChange={setShowInfoDialog}
        product={infoProduct}
      />

      <CategoryManagerDialog
        open={showCategoryManager}
        onOpenChange={setShowCategoryManager}
        categories={existingCategories}
        onAddCategory={addCategory}
        onRenameCategory={renameCategory}
        onDeleteCategory={deleteCategory}
      />
    </div>
    </main>
  );
}

interface InventoryRowProps {
  product: Product;
  categoryLabel: string;
  selected: boolean;
  onToggleSelect: () => void;
  onInfo: () => void;
  onEdit: () => void;
  getStockStatus: (product: Pick<Product, 'stock' | 'category' | 'min_stock'>) => { color: string; bg: string; label: string };
}

const InventoryRow = memo(function InventoryRow({ product, categoryLabel, selected, onToggleSelect, onInfo, onEdit, getStockStatus }: InventoryRowProps) {
  const status = getStockStatus(product);
  const [showAddStock, setShowAddStock] = useState(false);
  const [addQty, setAddQty] = useState('');
  const [showRemoveStock, setShowRemoveStock] = useState(false);
  const [removeQty, setRemoveQty] = useState('');
  const { addStock, removeStock } = useProductsDB();

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(addQty);
    if (isNaN(qty) || qty <= 0) return;
    await addStock(product.id, qty);
    setShowAddStock(false);
    setAddQty('');
  };

  const handleRemoveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(removeQty);
    if (isNaN(qty) || qty <= 0) return;
    await removeStock(product.id, qty);
    setShowRemoveStock(false);
    setRemoveQty('');
  };

  return (
    <tr className="hover:bg-slate-50 focus-within:outline-none">
      <td className="px-4 py-4">
        <Checkbox
          checked={selected}
          onCheckedChange={onToggleSelect}
          aria-label={`Selecionar produto ${product.name} para lista de compras`}
        />
      </td>
      <td className="px-6 py-4 text-slate-900">{product.name}</td>
      <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{categoryLabel}</td>
      <td className="px-6 py-4 text-slate-900 whitespace-nowrap">{product.stock} un.</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-3 py-1 rounded-full text-sm ${status.bg} ${status.color}`}>{status.label}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setRemoveQty('');
              setShowRemoveStock(true);
            }}
            className="gap-2"
            disabled={product.stock <= 0}
            aria-label={`Retirar estoque do produto ${product.name}`}
          >
            <Minus className="w-4 h-4" aria-hidden="true" />
            Retirada
          </Button>
          <Dialog open={showRemoveStock} onOpenChange={setShowRemoveStock}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Retirada de Estoque</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleRemoveStock} className="space-y-4">
                <div>
                  <label className="block text-sm mb-1">Quantidade a retirar (disponível: {product.stock} un.)</label>
                  <Input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={removeQty}
                    onChange={e => setRemoveQty(e.target.value)}
                    autoFocus
                    placeholder="Digite a quantidade"
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowRemoveStock(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">
                    Retirar
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
