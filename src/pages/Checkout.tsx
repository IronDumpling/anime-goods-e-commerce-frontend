import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  estimatedDelivery: string;
}

const Checkout: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>('credit_card');

  useEffect(() => {
    // Fetch from context or placeholder
    setCartItems([
      {
        id: 1,
        name: 'Anime Figure - Naruto',
        price: 45.99,
        quantity: 2,
        estimatedDelivery: 'Apr 25 - Apr 28',
      },
      {
        id: 2,
        name: 'One Piece Poster',
        price: 12.5,
        quantity: 1,
        estimatedDelivery: 'Apr 24 - Apr 27',
      },
    ]);
  }, []);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <ProtectedRoute accessLevel="user">
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex justify-between">
                  <div>
                    <h2 className="font-semibold text-lg text-left">{item.name}</h2>
                    <p className="text-sm text-muted-foreground text-left">
                      Qty: {item.quantity} | Estimated: {item.estimatedDelivery}
                    </p>
                  </div>
                  <div className="text-right font-medium">${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              </Card>
            ))}
          </div>

          <div className="space-y-6">
            <Card className="p-4">
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="credit_card" id="credit_card" />
                  <label htmlFor="credit_card">Credit Card</label>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="paypal" id="paypal" />
                  <label htmlFor="paypal">PayPal</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="alipay" id="alipay" />
                  <label htmlFor="alipay">Alipay</label>
                </div>
              </RadioGroup>
            </Card>

            <Card className="p-4">
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <Button className="mt-4 w-full">Place Order</Button>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Checkout;
