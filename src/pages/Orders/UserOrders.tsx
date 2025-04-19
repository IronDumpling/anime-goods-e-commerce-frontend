import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import { useAuth } from '@/context/AuthContext';
import { Order } from '@/lib/mock';
import { get } from "@/lib/api";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import BackButton from '@/components/layout/BackButton';
import { Badge } from '@/components/ui/Badge';

function UserOrders() {
  const { user } = useAuth();
  const { userId } = useParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      try {
        const response = await get<Array<Order>>("/api/order/user/" + userId);
        let data: Array<Order>;
        if (response.error || !response.data) {
          throw response.error || { error: "Unknown Error UserOrders"};
        }
        data = response.data;
        setOrders(data);
      } catch (err) {
        setError('Failed to load orders');
        console.error('Error fetching orders:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6">Your Orders</h1>
        <div className="text-center">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6">Your Orders</h1>
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-10">
        <BackButton to={`/user/${userId}`} label="Back to User Page" />
        <h1 className="text-2xl font-bold mb-6">Your Orders</h1>
        <div className="text-center">
          <p className="mb-4">You haven't placed any orders yet.</p>
          <Link to="/products" className="text-primary hover:underline">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute accessLevel="self">
      <div className="container mx-auto px-4 py-10">
        <BackButton to={`/user/${userId}`} label="Back to User Page" />
        <h1 className="text-2xl font-bold mb-6">Your Orders</h1>
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Order #{order.id}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      order.status === 'delivered' ? 'bg-green-500' :
                      order.status === 'processing' ? 'bg-blue-500' :
                      order.status === 'cancelled' ? 'bg-red-500' :
                      'bg-yellow-500'
                    }
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {order.products.map((item) => (
                    <div key={item.productId} className="flex justify-between">
                      <span>Product #{item.productId} x {item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <Link
                    to={`/orders/${order.id}`}
                    className="text-primary hover:underline"
                  >
                    View Order Details
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default UserOrders;