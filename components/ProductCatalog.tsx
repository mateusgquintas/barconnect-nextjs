'use client'
import { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Plus, Search, Pencil, ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Product } from '@/types';

import { useProductsDB } from '@/hooks/useProductsDB';

interface ProductCatalogProps {
  onAddProduct: (product: Product) => void;
  currentView?: string;
}

type Category = 'bebidas' | 'porcoes' | 'almoco' | 'outros';

// productsByCategory será calculado dinamicamente com os dados do banco

const categoryLabels: Record<Category, string> = {
  bebidas: 'Bebidas',
  porcoes: 'Porções',
  almoco: 'Almoço',
  outros: 'Outros',
};

export default function ProductCatalog({ onAddProduct, currentView }: ProductCatalogProps) {
  const { user } = useAuth();
  const { products, loading } = useProductsDB();
  const [activeCategory, setActiveCategory] = useState<Category>('bebidas');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustomItemDialog, setShowCustomItemDialog] = useState(false);
  const [customItemName, setCustomItemName] = useState('Outros');
  const [customItemPrice, setCustomItemPrice] = useState('');
  const [customItemNote, setCustomItemNote] = useState('');

  // Modal de produto (adicionar/editar)
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    stock: '',
    category: 'bebidas',
    subcategory: '',
  });

  const { addProduct, updateProduct } = useProductsDB();
  const openAddProductDialog = () => {
    setEditingProduct(null);
    setProductForm({ name: '', price: '', stock: '', category: 'bebidas', subcategory: '' });
    setShowProductDialog(true);
  };

  const openEditProductDialog = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category || 'bebidas',
      subcategory: product.subcategory || '',
    });
    setShowProductDialog(true);
  };

  const handleProductFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProductForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProduct = async () => {
    const { name, price, stock, category, subcategory } = productForm;
    if (!name || !price || !stock || !category) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }
    const productData = {
      name,
      price: parseFloat(price),
      stock: parseInt(stock),
      category,
      subcategory: subcategory || undefined,
    };
    if (editingProduct) {
      await updateProduct(editingProduct.id, productData);
    } else {
      await addProduct(productData);
    }
    setShowProductDialog(false);
  };

  const productsByCategory: Record<Category, Product[]> = {
    bebidas: products.filter(p => p.category === 'bebidas'),
    porcoes: products.filter(p => p.category === 'porcoes'),
    almoco: products.filter(p => p.category === 'almoco'),
    outros: [], // Categoria especial para itens customizados
  };

  const filterProducts = (categoryProducts: Product[]) => {
    if (!searchQuery.trim()) return categoryProducts;
    const query = searchQuery.toLowerCase();
    return categoryProducts.filter(product => 
      product.name.toLowerCase().includes(query)
    );
  };

  const getAllFilteredProducts = () => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(query)
    );
  };

  const isSearching = searchQuery.trim().length > 0;
  const searchResults = getAllFilteredProducts();

  const getProductBorderColor = (product: Product) => {
    switch (product.subcategory) {
      case 'drink':
        return 'border-l-4 border-l-purple-500';
      case 'cerveja':
        return 'border-l-4 border-l-amber-500';
      case 'refrigerante':
        return 'border-l-4 border-l-blue-500';
      case 'frita':
        return 'border-l-4 border-l-yellow-500';
      case 'carne':
        return 'border-l-4 border-l-red-500';
      case 'mista':
        return 'border-l-4 border-l-orange-500';
      case 'executivo':
        return 'border-l-4 border-l-green-500';
      default:
        return '';
    }
  };

  const getSubcategoryLabel = (subcategory?: string) => {
    const labels: Record<string, string> = {
      drink: 'Drinks',
      cerveja: 'Cervejas',
      refrigerante: 'Bebidas',
      frita: 'Fritas',
      carne: 'Carnes',
      mista: 'Mistas',
      executivo: 'Executivo',
    };
    return labels[subcategory || ''] || '';
  };

  const getSubcategoryColor = (subcategory?: string) => {
    const colors: Record<string, string> = {
      drink: 'text-purple-600 bg-purple-50',
      cerveja: 'text-amber-600 bg-amber-50',
      refrigerante: 'text-blue-600 bg-blue-50',
      frita: 'text-yellow-600 bg-yellow-50',
      carne: 'text-red-600 bg-red-50',
      mista: 'text-orange-600 bg-orange-50',
      executivo: 'text-green-600 bg-green-50',
    };
    return colors[subcategory || ''] || '';
  };

  // Ordem de subcategorias por categoria para layout consistente
  const subcategoryOrder: Record<string, string[]> = {
    bebidas: ['cerveja', 'refrigerante', 'drink'],
    porcoes: ['frita', 'carne', 'mista'],
    almoco: ['executivo'],
    outros: [],
  };

  const groupBySubcategory = (list: Product[], category: string) => {
    const groups: Record<string, Product[]> = {};
    list.forEach(p => {
      const key = p.subcategory || 'outros';
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    });
    const order = subcategoryOrder[category] || [];
    const orderedExisting = order.filter(sc => groups[sc]);
    const remaining = Object.keys(groups).filter(sc => !order.includes(sc));
    return [...orderedExisting, ...remaining].map(sc => ({ subcategory: sc, products: groups[sc] }));
  };

  const groupedProducts = useMemo(() => {
    const result: Record<string, { subcategory: string; products: Product[] }[]> = {};
    (Object.keys(productsByCategory) as Category[]).forEach(cat => {
      result[cat] = groupBySubcategory(productsByCategory[cat], cat);
    });
    return result;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, productsByCategory.bebidas.length, productsByCategory.porcoes.length, productsByCategory.almoco.length]);

  const Legend = () => (
    <div className="flex flex-wrap gap-2 text-xs mb-4">
      {['cerveja','refrigerante','drink','frita','carne','mista','executivo'].map(key => (
        <span key={key} className={`px-2 py-1 rounded-full border border-slate-200 flex items-center gap-1 ${getSubcategoryColor(key)}`}>
          <span className="font-medium">{getSubcategoryLabel(key)}</span>
        </span>
      ))}
    </div>
  );

  const handleAddCustomItem = () => {
    const price = parseFloat(customItemPrice);
    if (isNaN(price) || price <= 0) {
      alert('Por favor, insira um valor válido');
      return;
    }

    const customProduct: Product = {
      id: `custom-${Date.now()}`,
      name: customItemNote ? `${customItemName} - ${customItemNote}` : customItemName,
      price: price,
      stock: 999,
      category: 'outros',
    };

    onAddProduct(customProduct);
    setShowCustomItemDialog(false);
    setCustomItemPrice('');
    setCustomItemNote('');
  };

  return (
  <div className="flex flex-col h-full overflow-hidden min-h-0">
        <div className="px-6 pt-6 pb-4 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 flex-shrink-0">
        <div className="flex flex-1 gap-4 items-center">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar produto..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-50 border-slate-200"
            />
          </div>
          
          {/* Botões PDV melhorados */}
          {currentView === 'pdv' && (
              <div className="flex flex-col sm:flex-row gap-3 ml-auto w-full sm:w-auto">
              <Button
                size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-lg flex items-center justify-center gap-3 shadow-sm transition-all duration-200 hover:shadow-md min-w-[160px] font-medium text-base"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('pdv:directSale', { detail: { source: 'button' } }));
                  }
                }}
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="font-medium">Venda Direta</span>
              </Button>
              <Button
                size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg flex items-center justify-center gap-3 shadow-sm transition-all duration-200 hover:shadow-md min-w-[160px] font-medium text-base"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('pdv:newComanda', { detail: { source: 'button' } }));
                  }
                }}
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Nova Comanda</span>
              </Button>
            </div>
          )}
          
          {user?.role === 'admin' && currentView === 'inventory' && (
            <Button className="gap-2 bg-purple-600 hover:bg-purple-700" onClick={openAddProductDialog}>
              <Plus className="w-4 h-4" /> Novo Produto
            </Button>
          )}
        </div>
      </div>

      {isSearching ? (
        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4 min-h-0">
          {searchResults.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p>Nenhum produto encontrado</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-500 mb-4">{searchResults.length} produto(s) encontrado(s)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {searchResults.map((product: Product) => (
                  <Card key={product.id} className={`p-4 flex flex-col ${getProductBorderColor(product)}`}>
                    <div className="flex-1 mb-3">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-slate-900">{product.name}</h4>
                          {getSubcategoryLabel(product.subcategory) && (
                            <span className={`text-xs px-2 py-1 rounded-full ${getSubcategoryColor(product.subcategory)} mt-1 inline-block`}>
                              {getSubcategoryLabel(product.subcategory)}
                            </span>
                          )}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          product.stock <= 20 ? 'bg-red-100 text-red-600' :
                          product.stock <= 50 ? 'bg-orange-100 text-orange-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                          {product.stock} un.
                        </span>
                      </div>
                      <p className="text-slate-600">R$ {product.price.toFixed(2)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1 gap-2 bg-slate-900 hover:bg-slate-800"
                        onClick={() => onAddProduct(product)}
                        disabled={product.stock === 0}
                      >
                        <Plus className="w-4 h-4" />
                        {product.stock === 0 ? 'Sem Estoque' : 'Adicionar'}
                      </Button>
                      {user?.role === 'admin' && currentView === 'inventory' && (
                        <Button
                          size="icon"
                          variant="outline"
                          className="border-slate-300"
                          onClick={() => openEditProductDialog(product)}
                          aria-label="Editar produto"
                        >
                          <Pencil className="w-4 h-4 text-slate-500" />
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
  <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as Category)} className="flex-1 flex flex-col min-h-0">
          <div className="px-6 pt-4 pb-4">
            <TabsList className="grid grid-cols-4 w-full max-w-3xl">
              {(Object.keys(categoryLabels) as Category[]).map((cat) => (
                <TabsTrigger key={cat} value={cat} className="text-sm">
                  {categoryLabels[cat]}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6 min-h-0">
            <Legend />
            {(Object.keys(categoryLabels) as Category[]).map((cat) => (
              <TabsContent key={cat} value={cat} className="mt-0">
                {cat === 'outros' ? (
                  <div className="flex items-center justify-center py-12">
                    <Card className="p-8 max-w-md w-full text-center">
                      <h3 className="text-slate-900 mb-2">Item Personalizado</h3>
                      <p className="text-slate-600 text-sm mb-6">
                        Adicione um item com valor e observação customizados
                      </p>
                      <Button 
                        className="w-full gap-2 bg-slate-900 hover:bg-slate-800"
                        onClick={() => setShowCustomItemDialog(true)}
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar Item Personalizado
                      </Button>
                    </Card>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {groupedProducts[cat]
                      .filter(group => filterProducts(group.products).length > 0)
                      .map(group => {
                        const filtered = filterProducts(group.products);
                        return (
                          <div key={group.subcategory}>
                            {group.subcategory !== 'outros' && (
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getSubcategoryColor(group.subcategory)}`}>
                                    {getSubcategoryLabel(group.subcategory)}
                                  </span>
                                  <span className="text-slate-400 text-xs">({filtered.length})</span>
                                </h3>
                                <div className="h-px bg-slate-200 flex-1 ml-4" />
                              </div>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                              {filtered.map((product: Product) => (
                                <Card key={product.id} className={`p-4 flex flex-col ${getProductBorderColor(product)}`}>
                                  <div className="flex-1 mb-3">
                                    <div className="flex items-start justify-between mb-2">
                                      <div>
                                        <h4 className="text-slate-900">{product.name}</h4>
                                        {getSubcategoryLabel(product.subcategory) && (
                                          <span className={`text-xs px-2 py-1 rounded-full ${getSubcategoryColor(product.subcategory)} mt-1 inline-block`}>
                                            {getSubcategoryLabel(product.subcategory)}
                                          </span>
                                        )}
                                      </div>
                                      <span className={`text-xs px-2 py-1 rounded ${
                                        product.stock <= 20 ? 'bg-red-100 text-red-600' :
                                        product.stock <= 50 ? 'bg-orange-100 text-orange-600' :
                                        'bg-green-100 text-green-600'
                                      }`}>
                                        {product.stock} un.
                                      </span>
                                    </div>
                                    <p className="text-slate-600">R$ {product.price.toFixed(2)}</p>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button 
                                      className="flex-1 gap-2 bg-slate-900 hover:bg-slate-800"
                                      onClick={() => onAddProduct(product)}
                                      disabled={product.stock === 0}
                                    >
                                      <Plus className="w-4 h-4" />
                                      {product.stock === 0 ? 'Sem Estoque' : 'Adicionar'}
                                    </Button>
                                    {user?.role === 'admin' && currentView === 'inventory' && (
                                      <Button
                                        size="icon"
                                        variant="outline"
                                        className="border-slate-300"
                                        onClick={() => openEditProductDialog(product)}
                                        aria-label="Editar produto"
                                      >
                                        <Pencil className="w-4 h-4 text-slate-500" />
                                      </Button>
                                    )}
                                  </div>
                                </Card>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </TabsContent>
            ))}
          </div>
        </Tabs>
      )}

      {/* Modal de Adicionar/Editar Produto */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Editar Produto' : 'Adicionar Produto'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Atualize as informações do produto.' : 'Preencha os dados para adicionar um novo produto ao estoque.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="productName">Nome *</Label>
              <Input
                id="productName"
                name="name"
                value={productForm.name}
                onChange={handleProductFormChange}
                placeholder="Ex: Cerveja Lata"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="productPrice">Preço (R$) *</Label>
                <Input
                  id="productPrice"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={productForm.price}
                  onChange={handleProductFormChange}
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="productStock">Estoque *</Label>
                <Input
                  id="productStock"
                  name="stock"
                  type="number"
                  min="0"
                  value={productForm.stock}
                  onChange={handleProductFormChange}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="productCategory">Categoria *</Label>
                <select
                  id="productCategory"
                  name="category"
                  value={productForm.category}
                  onChange={handleProductFormChange}
                  className="mt-1 w-full border rounded px-2 py-2"
                >
                  <option value="bebidas">Bebidas</option>
                  <option value="porcoes">Porções</option>
                  <option value="almoco">Almoço</option>
                  <option value="outros">Outros</option>
                </select>
              </div>
              <div>
                <Label htmlFor="productSubcategory">Subcategoria</Label>
                <select
                  id="productSubcategory"
                  name="subcategory"
                  value={productForm.subcategory}
                  onChange={handleProductFormChange}
                  className="mt-1 w-full border rounded px-2 py-2"
                >
                  <option value="">Selecione</option>
                  <option value="cerveja">Cerveja</option>
                  <option value="refrigerante">Refrigerante</option>
                  <option value="drink">Drink</option>
                  <option value="frita">Frita</option>
                  <option value="carne">Carne</option>
                  <option value="mista">Mista</option>
                  <option value="executivo">Executivo</option>
                  <option value="outros">Outros</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProductDialog(false)}>Cancelar</Button>
            <Button onClick={handleSaveProduct}>{editingProduct ? 'Salvar Alterações' : 'Adicionar Produto'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Custom Item Dialog */}
      <Dialog open={showCustomItemDialog} onOpenChange={setShowCustomItemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Item Personalizado</DialogTitle>
            <DialogDescription>
              Defina o valor e adicione uma observação para este item
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="customPrice">Valor (R$)</Label>
              <Input
                id="customPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={customItemPrice}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomItemPrice(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="customNote">Observação (opcional)</Label>
              <Textarea
                id="customNote"
                placeholder="Ex: Taxa de serviço, item especial..."
                value={customItemNote}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCustomItemNote(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCustomItemDialog(false);
                setCustomItemPrice('');
                setCustomItemNote('');
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleAddCustomItem}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
