import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import BackButton from '@/components/layout/BackButton';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { post } from "@/lib/api";
import { useNavigate } from 'react-router-dom';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items: cartItems, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<string>('credit_card');

  const selectedItems = cartItems.filter((item) => item.selected);
  const itemsToCheckout = selectedItems.length > 0 ? selectedItems : cartItems;
  const total = itemsToCheckout.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handlePlaceOrder = async () => {
    if (!user || itemsToCheckout.length === 0) return;

    const payload = {
      userId: user.id,
      status: 'PENDING',
      items: itemsToCheckout.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
    };

    try {
      const response = await post('/api/order', payload);
      console.log('Order created:', response.data);
      clearCart();
      navigate(`/user/${user.id}/orders`);
    } catch (error) {
      console.error('Failed to place order:', error);
    }
  };

  return (
    <ProtectedRoute accessLevel="user">
      <div className="container mx-auto px-4 py-10">
        <BackButton to={`/cart`} label="Back to Shopping Cart" />
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {itemsToCheckout.map((item) => (
              <Card key={item.product.id} className="p-4">
                <div className="flex justify-between">
                  <div>
                    <h2 className="font-semibold text-lg text-left">{item.product.name}</h2>
                    <p className="text-sm text-muted-foreground text-left">
                      Qty: {item.quantity} | Estimated: 3-5 business days
                    </p>
                  </div>
                  <div className="text-right font-medium">${(item.product.price * item.quantity).toFixed(2)}</div>
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
              <Button className="mt-4 w-full" onClick={handlePlaceOrder}>Place Order</Button>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Checkout;
