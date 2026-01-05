'use client'
import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
  const [customItemName, setCustomItemName] = useState('');
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
    outros: products.filter(p => p.category === 'outros'), // Produtos cadastrados como "outros"
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
      case 'agua':
        return 'border-l-4 border-l-blue-500';
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
      agua: 'Águas',
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
      agua: 'text-blue-600 bg-blue-50',
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
    bebidas: ['agua', 'cerveja', 'refrigerante', 'drink'],
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

  // Legend removida para deixar apenas os destaques nos cards

  const handleAddCustomItem = () => {
    const price = parseFloat(customItemPrice);
    if (isNaN(price) || price <= 0) {
      alert('Por favor, insira um valor válido');
      return;
    }

    if (!customItemName.trim()) {
      alert('Por favor, insira o nome do item');
      return;
    }

    // Criar produto customizado com ID especial para identificar como custom
    const customProduct: Product = {
      id: `custom-${Date.now()}`,
      name: customItemNote ? `${customItemName.trim()} - ${customItemNote.trim()}` : customItemName.trim(),
      price: price,
      stock: 999, // Estoque virtual para custom items
      category: 'outros',
    };

    onAddProduct(customProduct);
    setShowCustomItemDialog(false);
    setCustomItemName('');
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
            <Button variant="default" className="gap-2" onClick={openAddProductDialog}>
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
                        className="flex-1 gap-2"
                        variant="default"
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
            {/* Legend removida: subgrupos ficarão apenas como badges nos cards */}
            {(Object.keys(categoryLabels) as Category[]).map((cat) => (
              <TabsContent key={cat} value={cat} className="mt-0">
                {cat === 'outros' ? (
                  <div className="space-y-6">
                    {/* Card de item personalizado no topo */}
                    <div className="mb-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        <Card
                          className="p-4 flex flex-col cursor-pointer border border-slate-300 bg-white rounded-lg shadow-sm hover:border-blue-500 hover:shadow-md transition-all duration-150 min-h-[120px]"
                          tabIndex={0}
                          role="button"
                          aria-label="Adicionar Item Personalizado"
                          onClick={() => setShowCustomItemDialog(true)}
                          onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setShowCustomItemDialog(true)}
                        >
                          <div className="flex-1 mb-3 flex items-start justify-between">
                            <div>
                              <h4 className="text-slate-900 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-blue-600" />
                                Adicionar Item Personalizado
                              </h4>
                              <span className="text-xs text-blue-500 mt-1 block">Defina nome e preço na hora</span>
                            </div>
                          </div>
                        </Card>
                      </div>
                    </div>

                    {/* Produtos cadastrados na categoria "outros" */}
                    {groupedProducts[cat]
                      .filter(group => filterProducts(group.products).length > 0)
                      .map(group => {
                        const filtered = filterProducts(group.products);
                        return (
                          <div key={group.subcategory}>
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
                                      className="flex-1 gap-2"
                                      variant="default"
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
                    
                    {/* Se não houver produtos cadastrados como "outros", mostrar aviso */}
                    {productsByCategory[cat].length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-slate-500 mb-4">
                          Nenhum produto cadastrado na categoria "Outros".
                        </p>
                        <p className="text-slate-400 text-sm">
                          Use o botão acima para adicionar itens com preço personalizado.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-8">
                    {groupedProducts[cat]
                      .filter(group => filterProducts(group.products).length > 0)
                      .map(group => {
                        const filtered = filterProducts(group.products);
                        return (
                          <div key={group.subcategory}>
                            {/* Cabeçalho de subgrupo removido; manter apenas badges nos cards */}
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
                                      className="flex-1 gap-2"
                                      variant="default"
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
              <Label htmlFor="customName">Nome do item *</Label>
              <Input
                id="customName"
                type="text"
                placeholder="Ex: Taxa de serviço, Açaí especial..."
                value={customItemName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomItemName(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="customPrice">Valor (R$) *</Label>
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
                placeholder="Ex: Ingredientes especiais, forma de preparo..."
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
                setCustomItemName('');
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
