import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Package, Search, AlertCircle, Edit, Plus, Info, TrendingDown, TrendingUp } from 'lucide-react';
import { products as initialProducts } from '../data/products';
import { Product } from '../types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Inventory() {
  const [products, setProducts] = useState(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialogs
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Edit/Add form fields
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formCategory, setFormCategory] = useState<string>('bebidas');
  const [formSubcategory, setFormSubcategory] = useState<string>('');

  // Mock data para gráficos (em um app real viria do Supabase)
  const getProductSalesData = (productId: string) => [
    { month: 'Set', vendas: 45, saidas: 52 },
    { month: 'Out', vendas: 62, saidas: 58 },
    { month: 'Nov', vendas: 38, saidas: 41 },
    { month: 'Dez', vendas: 71, saidas: 68 },
    { month: 'Jan', vendas: 55, saidas: 60 },
    { month: 'Fev', vendas: 48, saidas: 45 },
  ];

  const handleOpenInfo = (product: Product) => {
    setSelectedProduct(product);
    setShowInfoDialog(true);
  };

  const handleOpenEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormName(product.name);
    setFormPrice(product.price.toString());
    setFormStock(product.stock.toString());
    setFormCategory(product.category || 'bebidas');
    setFormSubcategory(product.subcategory || 'none');
    setShowEditDialog(true);
  };

  const handleOpenAdd = () => {
    setFormName('');
    setFormPrice('');
    setFormStock('');
    setFormCategory('bebidas');
    setFormSubcategory('none');
    setShowAddDialog(true);
  };

  const handleConfirmEdit = () => {
    if (!selectedProduct || !formName || !formPrice || !formStock) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    setProducts(products.map(p =>
      p.id === selectedProduct.id
        ? {
            ...p,
            name: formName,
            price: parseFloat(formPrice),
            stock: parseInt(formStock),
            category: formCategory,
            subcategory: formSubcategory === 'none' ? undefined : formSubcategory,
          }
        : p
    ));

    setShowEditDialog(false);
  };

  const handleConfirmAdd = () => {
    if (!formName || !formPrice || !formStock) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const newProduct: Product = {
      id: `new-${Date.now()}`,
      name: formName,
      price: parseFloat(formPrice),
      stock: parseInt(formStock),
      category: formCategory,
      subcategory: formSubcategory === 'none' ? undefined : formSubcategory,
    };

    setProducts([...products, newProduct]);
    setShowAddDialog(false);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStockStatus = (stock: number) => {
    if (stock <= 20) return { color: 'text-red-600', bg: 'bg-red-50', label: 'Crítico', icon: AlertCircle };
    if (stock <= 50) return { color: 'text-orange-600', bg: 'bg-orange-50', label: 'Baixo', icon: TrendingDown };
    return { color: 'text-green-600', bg: 'bg-green-50', label: 'Normal', icon: TrendingUp };
  };

  const categoryNames: Record<string, string> = {
    bebidas: 'Bebidas',
    porcoes: 'Porções',
    almoco: 'Almoço',
    outros: 'Outros',
  };

  const subcategoryNames: Record<string, string> = {
    drink: 'Drink',
    cerveja: 'Cerveja',
    refrigerante: 'Refrigerante',
    frita: 'Frita',
    carne: 'Carne',
    mista: 'Mista',
    executivo: 'Executivo',
  };

  const stats = {
    total: products.length,
    lowStock: products.filter(p => p.stock <= 20).length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0),
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-slate-900 mb-2">Estoque & Produtos</h1>
            <p className="text-slate-600">Gerencie inventário e catálogo de produtos</p>
          </div>
          <Button onClick={handleOpenAdd} className="gap-2 bg-slate-900 hover:bg-slate-800">
            <Plus className="w-4 h-4" />
            Adicionar Produto
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total de Produtos</p>
                <p className="text-2xl text-slate-900">{stats.total}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Estoque Baixo</p>
                <p className="text-2xl text-slate-900">{stats.lowStock}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Valor Total</p>
                <p className="text-2xl text-slate-900">R$ {stats.totalValue.toFixed(2)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search */}
        <Card className="p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar produto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </Card>

        {/* Products Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-4 text-slate-700">Produto</th>
                  <th className="text-left p-4 text-slate-700">Categoria</th>
                  <th className="text-left p-4 text-slate-700">Preço</th>
                  <th className="text-left p-4 text-slate-700">Estoque</th>
                  <th className="text-left p-4 text-slate-700">Status</th>
                  <th className="text-right p-4 text-slate-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const status = getStockStatus(product.stock);
                  const StatusIcon = status.icon;
                  
                  return (
                    <tr key={product.id} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenInfo(product)}
                            className="p-1 hover:bg-slate-200 rounded transition-colors"
                            title="Ver informações"
                          >
                            <Info className="w-4 h-4 text-blue-600" />
                          </button>
                          <div>
                            <p className="text-slate-900">{product.name}</p>
                            {product.subcategory && (
                              <p className="text-xs text-slate-500">
                                {subcategoryNames[product.subcategory] || product.subcategory}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-600">
                        {categoryNames[product.category || ''] || product.category}
                      </td>
                      <td className="p-4 text-slate-900">
                        R$ {product.price.toFixed(2)}
                      </td>
                      <td className="p-4 text-slate-900">
                        {product.stock} un.
                      </td>
                      <td className="p-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${status.bg}`}>
                          <StatusIcon className={`w-4 h-4 ${status.color}`} />
                          <span className={`text-sm ${status.color}`}>{status.label}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenEdit(product)}
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

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-400">Nenhum produto encontrado</p>
            </div>
          )}
        </Card>
      </div>

      {/* Info Dialog */}
      <Dialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Informações do Produto</DialogTitle>
            <DialogDescription>
              Dados detalhados e estatísticas de vendas
            </DialogDescription>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-6 py-4">
              {/* Dados do Produto */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm text-slate-600">Nome</p>
                  <p className="text-slate-900">{selectedProduct.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Categoria</p>
                  <p className="text-slate-900">
                    {categoryNames[selectedProduct.category || ''] || selectedProduct.category}
                    {selectedProduct.subcategory && (
                      <span className="text-slate-600 text-sm">
                        {' - '}{subcategoryNames[selectedProduct.subcategory]}
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Preço Unitário</p>
                  <p className="text-slate-900">R$ {selectedProduct.price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Estoque Atual</p>
                  <p className="text-slate-900">{selectedProduct.stock} unidades</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Valor em Estoque</p>
                  <p className="text-slate-900">
                    R$ {(selectedProduct.price * selectedProduct.stock).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Status</p>
                  <p className={`${getStockStatus(selectedProduct.stock).color}`}>
                    {getStockStatus(selectedProduct.stock).label}
                  </p>
                </div>
              </div>

              {/* Gráfico de Vendas */}
              <div>
                <h4 className="text-slate-900 mb-4">Vendas Mensais</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={getProductSalesData(selectedProduct.id)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="vendas" fill="#3b82f6" name="Vendas" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico de Saídas */}
              <div>
                <h4 className="text-slate-900 mb-4">Saída de Estoque</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={getProductSalesData(selectedProduct.id)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="saidas" stroke="#10b981" strokeWidth={2} name="Saídas" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowInfoDialog(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
            <DialogDescription>
              Atualize as informações do produto
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="editName">Nome do Produto *</Label>
              <Input
                id="editName"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ex: Cerveja Lata"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editPrice">Preço (R$) *</Label>
                <Input
                  id="editPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="editStock">Estoque *</Label>
                <Input
                  id="editStock"
                  type="number"
                  min="0"
                  value={formStock}
                  onChange={(e) => setFormStock(e.target.value)}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="editCategory">Categoria *</Label>
              <Select value={formCategory} onValueChange={setFormCategory}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bebidas">Bebidas</SelectItem>
                  <SelectItem value="porcoes">Porções</SelectItem>
                  <SelectItem value="almoco">Almoço</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="editSubcategory">Subcategoria</Label>
              <Select value={formSubcategory} onValueChange={setFormSubcategory}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  <SelectItem value="drink">Drink</SelectItem>
                  <SelectItem value="cerveja">Cerveja</SelectItem>
                  <SelectItem value="refrigerante">Refrigerante</SelectItem>
                  <SelectItem value="frita">Frita</SelectItem>
                  <SelectItem value="carne">Carne</SelectItem>
                  <SelectItem value="mista">Mista</SelectItem>
                  <SelectItem value="executivo">Executivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmEdit}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Product Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Produto</DialogTitle>
            <DialogDescription>
              Cadastre um novo produto no catálogo
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="addName">Nome do Produto *</Label>
              <Input
                id="addName"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ex: Suco de Laranja"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="addPrice">Preço (R$) *</Label>
                <Input
                  id="addPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="addStock">Estoque Inicial *</Label>
                <Input
                  id="addStock"
                  type="number"
                  min="0"
                  value={formStock}
                  onChange={(e) => setFormStock(e.target.value)}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="addCategory">Categoria *</Label>
              <Select value={formCategory} onValueChange={setFormCategory}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bebidas">Bebidas</SelectItem>
                  <SelectItem value="porcoes">Porções</SelectItem>
                  <SelectItem value="almoco">Almoço</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="addSubcategory">Subcategoria</Label>
              <Select value={formSubcategory} onValueChange={setFormSubcategory}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  <SelectItem value="drink">Drink</SelectItem>
                  <SelectItem value="cerveja">Cerveja</SelectItem>
                  <SelectItem value="refrigerante">Refrigerante</SelectItem>
                  <SelectItem value="frita">Frita</SelectItem>
                  <SelectItem value="carne">Carne</SelectItem>
                  <SelectItem value="mista">Mista</SelectItem>
                  <SelectItem value="executivo">Executivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmAdd} className="bg-green-600 hover:bg-green-700">
              Adicionar Produto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
