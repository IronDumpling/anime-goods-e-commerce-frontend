import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '@/components/layout/ProductCard';
import { ProductEntry } from '@/components/layout/ProductEntry';
import { typesApi, ProductCategory } from '@/lib/types';
import { Product } from '@/lib/types'
import { get } from "@/lib/api";
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, X, LayoutGrid, List } from 'lucide-react';
import { Input } from '@/components/ui/Input';

interface FilterState {
  search: string;
  minPrice: number;
  maxPrice: number;
  categories: string[];
  inStock: boolean;
  sortBy: 'price-asc' | 'price-desc' | 'newest' | 'name-asc' | 'name-desc';
  viewMode: 'card' | 'list';
}

function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const maxPrice = 500
  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get('search') || '',
    minPrice: Number(searchParams.get('minPrice')) || 0,
    maxPrice: Number(searchParams.get('maxPrice')) || maxPrice,
    categories: searchParams.get('categories')?.split(',') || [],
    inStock: searchParams.get('inStock') === 'true',
    sortBy: (searchParams.get('sortBy') as FilterState['sortBy']) || 'newest',
    viewMode: (searchParams.get('viewMode') as FilterState['viewMode']) || 'card',
  });

  // Fetch products and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesData] = await Promise.all([
          get<{ products: Product[] }>("/api/product"),
          typesApi.categories.getAll(),
        ]);
        setProducts(productsRes.data?.products || []);
        setCategories(categoriesData);
      } catch (err) {
        setError('Failed to load products');
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update filters when URL params change
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      search: searchParams.get('search') || '',
      minPrice: Number(searchParams.get('minPrice')) || 0,
      maxPrice: Number(searchParams.get('maxPrice')) || maxPrice,
      categories: searchParams.get('categories')?.split(',') || [],
      inStock: searchParams.get('inStock') === 'true',
      sortBy: (searchParams.get('sortBy') as FilterState['sortBy']) || 'newest',
      viewMode: (searchParams.get('viewMode') as FilterState['viewMode']) || 'card',
    }));
  }, [searchParams]);

  // Update URL params when filters change (excluding search)
  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    // Handle minPrice
    if (filters.minPrice > 0) {
      params.set('minPrice', filters.minPrice.toString());
    } else {
      params.delete('minPrice');
    }

    // Handle maxPrice
    if (filters.maxPrice < maxPrice) {
      params.set('maxPrice', filters.maxPrice.toString());
    } else {
      params.delete('maxPrice');
    }

    // Handle categories
    if (filters.categories.length > 0) {
      params.set('categories', filters.categories.join(','));
    } else {
      params.delete('categories');
    }

    // Handle inStock
    if (filters.inStock) {
      params.set('inStock', 'true');
    } else {
      params.delete('inStock');
    }

    // Handle sortBy
    if (filters.sortBy !== 'newest') {
      params.set('sortBy', filters.sortBy);
    } else {
      params.delete('sortBy');
    }

    // Handle viewMode
    if (filters.viewMode !== 'card') {
      params.set('viewMode', filters.viewMode);
    } else {
      params.delete('viewMode');
    }

    setSearchParams(params);
  }, [
    filters.minPrice,
    filters.maxPrice,
    filters.categories,
    filters.inStock,
    filters.sortBy,
    filters.viewMode,
    searchParams,
    setSearchParams
  ]);

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                          product.description.toLowerCase().includes(filters.search.toLowerCase());
      const matchesPrice = product.price >= filters.minPrice && product.price <= filters.maxPrice;
      const matchesCategory = filters.categories.length === 0 || filters.categories.includes(product.category);
      const matchesStock = !filters.inStock || product.stock > 0;
      return matchesSearch && matchesPrice && matchesCategory && matchesStock;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'newest':
        default:
          // Sort by ID (assuming newer products have higher IDs due to auto-increment)
          return b.id - a.id;
      }
    });

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background p-8">
        <h1 className="text-2xl font-bold mb-6">Products</h1>
        <div className="text-center">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-background p-8">
        <h1 className="text-2xl font-bold mb-6">Products</h1>
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background py-4 px-6">
      <h1 className="text-2xl font-bold mb-4">Products</h1>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <Card className="w-64 shrink-0 sticky top-[calc(3.5rem+1rem)] max-h-[calc(100vh-2rem)] self-start">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 overflow-y-auto">
            {/* Price Range */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Price Range</label>
              <Slider
                min={0}
                max={maxPrice}
                step={10}
                value={[filters.minPrice, filters.maxPrice]}
                onValueChange={([min, max]) => setFilters(prev => ({ ...prev, minPrice: min, maxPrice: max }))}
              />
              <div className="flex justify-between items-center">
                <Input
                  type="number"
                  min={0}
                  max={maxPrice}
                  value={filters.minPrice}
                  onChange={(e) => {
                    const value = Math.min(Math.max(0, Number(e.target.value)), filters.maxPrice);
                    setFilters(prev => ({ ...prev, minPrice: value }));
                  }}
                  className="w-24"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="number"
                  min={filters.minPrice}
                  max={maxPrice}
                  value={filters.maxPrice}
                  onChange={(e) => {
                    const value = Math.min(Math.max(filters.minPrice, Number(e.target.value)), maxPrice);
                    setFilters(prev => ({ ...prev, maxPrice: value }));
                  }}
                  className="w-24"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Categories</label>
              <div className="space-y-1">
                {categories.map((category) => (
                  <div key={category.title} className="flex items-center space-x-2">
                    <Checkbox
                      id={category.title}
                      checked={filters.categories.includes(category.title)}
                      onCheckedChange={(checked) => {
                        setFilters(prev => ({
                          ...prev,
                          categories: checked
                            ? [...prev.categories, category.title]
                            : prev.categories.filter(c => c !== category.title)
                        }));
                      }}
                    />
                    <label htmlFor={category.title} className="text-sm">
                      {category.title}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Stock Status */}
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="inStock"
                  checked={filters.inStock}
                  onCheckedChange={(checked) => {
                    setFilters(prev => ({ ...prev, inStock: checked as boolean }));
                  }}
                />
                <label htmlFor="inStock" className="text-sm">
                  In Stock Only
                </label>
              </div>
            </div>

            {/* Clear Filters */}
            <Button
              variant="outline"
              className="w-full mt-2"
              onClick={() => {
                // Clear filters state
                setFilters({
                  search: '',
                  minPrice: 0,
                  maxPrice: maxPrice,
                  categories: [],
                  inStock: false,
                  sortBy: 'newest',
                  viewMode: filters.viewMode,
                });
                // Clear URL parameters
                setSearchParams(new URLSearchParams());
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <div className="flex-1">
          {/* Sort Options */}
          <div className="mb-4 flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {filteredProducts.length} products found
            </p>
            <div className="flex items-center gap-3">
              {/* View Mode Selector */}
              <div className="flex items-center gap-1 border rounded-md p-1">
                <Button
                  variant={filters.viewMode === 'card' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setFilters(prev => ({ ...prev, viewMode: 'card' }))}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={filters.viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setFilters(prev => ({ ...prev, viewMode: 'list' }))}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Sort Selector */}
              <Select
                value={filters.sortBy}
                onValueChange={(value: FilterState['sortBy']) =>
                  setFilters(prev => ({ ...prev, sortBy: value }))
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="name-asc">Name: A to Z</SelectItem>
                  <SelectItem value="name-desc">Name: Z to A</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Products Grid/List */}
          {filters.viewMode === 'card' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProducts.map((product) => (
                <ProductEntry key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* No Results */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-lg text-muted-foreground">No products found matching your criteria</p>
              <Button
                variant="outline"
                className="mt-3"
                onClick={() => {
                  setFilters({
                    search: '',
                    minPrice: 0,
                    maxPrice: maxPrice,
                    categories: [],
                    inStock: false,
                    sortBy: 'newest',
                    viewMode: filters.viewMode,
                  });
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductList;