import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/checkbox';
import { CartListEntry } from '@/components/layout/CartListEntry';
import { useCart } from '@/context/CartContext';

import { Trash2 } from 'lucide-react';
import { useNavigate } from "react-router-dom";

function Cart() {
  const {
    items: cartItems,
    updateQuantity,
    updateSelected,
    removeItem,
    selectAll,
    removeSelected,
    isLoading
  } = useCart();
  const navigate = useNavigate();

  // Filter selected items and calculate totals
  const selectedItems = cartItems.filter(item => item.selected);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const selectedItemsCount = selectedItems.length;

  // Calculate totals for selected items
  const selectedTotalItems = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const selectedTotalPrice = selectedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  // Use selected items' totals if any items are selected, otherwise use all items' totals
  const displayTotalItems = selectedItems.length > 0 ? selectedTotalItems : totalItems;
  const displayTotalPrice = selectedItems.length > 0 ? selectedTotalPrice : totalPrice;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="text-center">Loading cart...</div>
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
                onCheckedChange={(checked) => selectAll(checked as boolean)}
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
              onClick={removeSelected}
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
                  onQuantityChange={updateQuantity}
                  onSelectChange={updateSelected}
                  onRemove={removeItem}
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
              <span className="text-muted-foreground">
                {selectedItems.length > 0 ? 'Selected Items' : 'Items'} ({displayTotalItems})
              </span>
              <span>${displayTotalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>Free</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>Total</span>
              <span>${displayTotalPrice.toFixed(2)}</span>
            </div>
            <Button
              className="w-full"
              disabled={cartItems.length === 0 || (selectedItems.length > 0 && selectedTotalItems === 0)}
              onClick={() => navigate(`/checkout`)}
            >
              Checkout {selectedItems.length > 0 ? `(${selectedTotalItems} items)` : ''}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Cart;