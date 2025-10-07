import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Product } from '../types';
import { products } from '../data/products';

interface ProductCatalogProps {
  onAddProduct: (product: Product) => void;
}

type Category = 'bebidas' | 'porcoes' | 'almoco' | 'outros';

const productsByCategory: Record<Category, Product[]> = {
  bebidas: products.filter(p => p.category === 'bebidas'),
  porcoes: products.filter(p => p.category === 'porcoes'),
  almoco: products.filter(p => p.category === 'almoco'),
  outros: [], // Categoria especial para itens customizados
};

const categoryLabels: Record<Category, string> = {
  bebidas: 'Bebidas',
  porcoes: 'Porções',
  almoco: 'Almoço',
  outros: 'Outros',
};

export function ProductCatalog({ onAddProduct }: ProductCatalogProps) {
  const [activeCategory, setActiveCategory] = useState<Category>('bebidas');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustomItemDialog, setShowCustomItemDialog] = useState(false);
  const [customItemName, setCustomItemName] = useState('Outros');
  const [customItemPrice, setCustomItemPrice] = useState('');
  const [customItemNote, setCustomItemNote] = useState('');

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
      drink: 'Drink',
      cerveja: 'Cerveja',
      refrigerante: 'Bebida',
      frita: 'Frita',
      carne: 'Carne',
      mista: 'Mista',
      executivo: 'Executivo',
    };
    return labels[subcategory || ''] || '';
  };

  const getSubcategoryColor = (subcategory?: string) => {
    const colors: Record<string, string> = {
      drink: 'text-purple-600',
      cerveja: 'text-amber-600',
      refrigerante: 'text-blue-600',
      frita: 'text-yellow-600',
      carne: 'text-red-600',
      mista: 'text-orange-600',
      executivo: 'text-green-600',
    };
    return colors[subcategory || ''] || 'text-slate-600';
  };

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
    <div className="flex flex-col h-full">
      <div className="px-6 pt-6 pb-4 border-b border-slate-200">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Buscar produto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-50 border-slate-200"
          />
        </div>
      </div>

      {isSearching ? (
        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4">
          {searchResults.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p>Nenhum produto encontrado</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-500 mb-4">{searchResults.length} produto(s) encontrado(s)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {searchResults.map((product) => (
                  <Card key={product.id} className={`p-4 flex flex-col ${getProductBorderColor(product)}`}>
                    <div className="flex-1 mb-3">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-slate-900">{product.name}</h4>
                          {product.subcategory && (
                            <span className={`text-xs ${getSubcategoryColor(product.subcategory)}`}>
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
                    <Button 
                      className="w-full gap-2 bg-slate-900 hover:bg-slate-800"
                      onClick={() => onAddProduct(product)}
                      disabled={product.stock === 0}
                    >
                      <Plus className="w-4 h-4" />
                      {product.stock === 0 ? 'Sem Estoque' : 'Adicionar'}
                    </Button>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as Category)} className="flex-1 flex flex-col">
          <div className="px-6 pt-4 pb-4">
            <TabsList className="grid grid-cols-4 w-full max-w-3xl">
              {(Object.keys(categoryLabels) as Category[]).map((cat) => (
                <TabsTrigger key={cat} value={cat} className="text-sm">
                  {categoryLabels[cat]}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filterProducts(productsByCategory[cat]).map((product) => (
                      <Card key={product.id} className={`p-4 flex flex-col ${getProductBorderColor(product)}`}>
                        <div className="flex-1 mb-3">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="text-slate-900">{product.name}</h4>
                              {product.subcategory && (
                                <span className={`text-xs ${getSubcategoryColor(product.subcategory)}`}>
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
                        <Button 
                          className="w-full gap-2 bg-slate-900 hover:bg-slate-800"
                          onClick={() => onAddProduct(product)}
                          disabled={product.stock === 0}
                        >
                          <Plus className="w-4 h-4" />
                          {product.stock === 0 ? 'Sem Estoque' : 'Adicionar'}
                        </Button>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </div>
        </Tabs>
      )}

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
                onChange={(e) => setCustomItemPrice(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="customNote">Observação (opcional)</Label>
              <Textarea
                id="customNote"
                placeholder="Ex: Taxa de serviço, item especial..."
                value={customItemNote}
                onChange={(e) => setCustomItemNote(e.target.value)}
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
