'use client'

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Package, Search, AlertCircle, Edit } from 'lucide-react';
import { products as initialProducts } from '@/data/products';
import { EditStockDialog } from './EditStockDialog';
import { Product } from '@/types';

export function Inventory() {
  const [products, setProducts] = useState(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleEditStock = (product: Product) => {
    setEditingProduct(product);
    setShowEditDialog(true);
  };

  const handleUpdateStock = (productId: string, newStock: number) => {
    setProducts(products.map(p => 
      p.id === productId ? { ...p, stock: newStock } : p
    ));
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStockStatus = (stock: number) => {
    if (stock <= 20) return { color: 'text-red-600', bg: 'bg-red-50', label: 'Crítico' };
    if (stock <= 50) return { color: 'text-orange-600', bg: 'bg-orange-50', label: 'Baixo' };
    return { color: 'text-green-600', bg: 'bg-green-50', label: 'Normal' };
  };

  const categoryNames: Record<string, string> = {
    bebidas: 'Bebidas',
    drinks: 'Drinks',
    porcoes: 'Porções',
    petiscos: 'Petiscos',
    almoco: 'Almoço',
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-slate-900 mb-2">Estoque</h1>
          <p className="text-slate-600">Gerencie o inventário de produtos</p>
        </div>

        {/* Search and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <Card className="p-6 lg:col-span-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Buscar produto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Produtos</p>
                <p className="text-2xl text-slate-900">{products.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Alerts */}
        <Card className="p-4 mb-6 bg-orange-50 border-orange-200">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <p className="text-orange-900">
              {products.filter(p => p.stock <= 20).length} produtos com estoque crítico
            </p>
          </div>
        </Card>

        {/* Products Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
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
              <tbody className="divide-y divide-slate-200">
                {filteredProducts.map((product) => {
                  const status = getStockStatus(product.stock);
                  return (
                    <tr key={product.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-slate-900">{product.name}</td>
                      <td className="px-6 py-4 text-slate-600">
                        {categoryNames[product.category || ''] || '-'}
                      </td>
                      <td className="px-6 py-4 text-slate-900">R$ {product.price.toFixed(2)}</td>
                      <td className="px-6 py-4 text-slate-900">{product.stock} un.</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${status.bg} ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditStock(product)}
                          className="gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Editar
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <EditStockDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        product={editingProduct}
        onUpdateStock={handleUpdateStock}
      />
    </div>
  );
}