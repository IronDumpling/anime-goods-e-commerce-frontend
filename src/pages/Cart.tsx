import { useState, useEffect } from 'react';
import { CartListEntry } from '@/components/layout/CartListEntry';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/checkbox';
import { mockApi, Product } from '@/lib/mock';
import { Trash2 } from 'lucide-react';

interface CartItem {
  product: Product;
  quantity: number;
  selected: boolean;
}

function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        // In a real app, this would fetch from an API
        const products = await mockApi.products.getAll();
        // For demo, add first 3 products to cart
        const items = products.slice(0, 3).map(product => ({
          product,
          quantity: Math.floor(Math.random() * 5) + 1,
          selected: false
        }));
        setCartItems(items);
      } catch (err) {
        setError('Failed to load cart items');
        console.error('Error fetching cart items:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  const handleQuantityChange = (productId: number, quantity: number) => {
    setCartItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleSelectChange = (productId: number, selected: boolean) => {
    setCartItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, selected } : item
      )
    );
  };

  const handleRemove = (productId: number) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleSelectAll = (selected: boolean) => {
    setCartItems(prev => prev.map(item => ({ ...item, selected })));
  };

  const handleRemoveSelected = () => {
    setCartItems(prev => prev.filter(item => !item.selected));
  };

  const selectedItems = cartItems.filter(item => item.selected);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const selectedItemsCount = selectedItems.length;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="text-center">Loading cart...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>

      <div className="flex gap-6">
        {/* Cart Items */}
        <div className="flex-1">
          {/* Cart Actions */}
          <div className="flex items-center justify-between mb-4 p-3 bg-card rounded-lg border">
            <div className="flex items-center gap-2">
              <Checkbox
                id="select-all"
                checked={cartItems.length > 0 && cartItems.every(item => item.selected)}
                onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
              />
              <label htmlFor="select-all" className="text-sm font-medium">
                Select All ({cartItems.length})
              </label>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive"
              disabled={selectedItemsCount === 0}
              onClick={handleRemoveSelected}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove Selected ({selectedItemsCount})
            </Button>
          </div>

          {/* Cart Items List */}
          <div className="space-y-3">
            {cartItems.length > 0 ? (
              cartItems.map(item => (
                <CartListEntry
                  key={item.product.id}
                  product={item.product}
                  quantity={item.quantity}
                  selected={item.selected}
                  onQuantityChange={handleQuantityChange}
                  onSelectChange={handleSelectChange}
                  onRemove={handleRemove}
                />
              ))
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                Your cart is empty
              </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <Card className="w-80 shrink-0 sticky top-[calc(3.5rem+1rem)] self-start">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Items ({totalItems})</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>Free</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <Button className="w-full" disabled={cartItems.length === 0}>
              Checkout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Cart;