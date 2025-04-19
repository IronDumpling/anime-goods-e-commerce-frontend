import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { mockApi, Order } from '@/lib/mock';
import { get } from "@/lib/api"; 
import { Product } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import BackButton from '@/components/layout/BackButton';
import { Badge } from '@/components/ui/Badge';

function OrderDetail() {
  const { orderId } = useParams();
  // TODO: get userId from orderId
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [products, setProducts] = useState<Record<number, Product>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId || !user) return;

      try {
        const orderData = await mockApi.orders.getById(parseInt(orderId));

        if (!orderData) {
          setError('Order not found');
          return;
        }

        // Verify that the order belongs to the current user
        if (orderData.userId !== user.id) {
          setError('You do not have permission to view this order');
          return;
        }

        setOrder(orderData);

        // Fetch product details for each item in the order
        const productPromises = orderData.products.map(item =>
          get<Product>("/api/product/" + Number(item.productId))
        );
        const productResults = await Promise.all(productPromises);

        const productMap: Record<number, Product> = {};
        productResults.forEach(product => {
          if (product) {
            productMap[product.id] = product;
          }
        });
        setProducts(productMap);
      } catch (err) {
        setError('Failed to load order details');
        console.error('Error fetching order details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, user]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6">Order Details</h1>
        <div className="text-center">Loading order details...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6">Order Details</h1>
        <div className="text-center text-red-500">{error || 'Order not found'}</div>
        <div className="mt-4 text-center">
          <Link to="/orders" className="text-primary hover:underline">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute accessLevel="self-and-admin">
      <div className="container mx-auto px-4 py-10">
        <div className="mb-6">
          <Link to="/orders" className="text-primary hover:underline">
            ← Back to Orders
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-6">Order #{order.id}</h1>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Order Status</CardTitle>
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
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Ordered on {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.products.map((item) => {
                  const product = products[item.productId];
                  return (
                    <div key={item.productId} className="flex items-center gap-4">
                      {product && (
                        <img
                          src={product.imageURL}
                          alt={product.name}
                          className="w-20 h-20 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium">
                          {product ? product.name : `Product #${item.productId}`}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity}
                        </p>
                        <p className="text-sm">
                          Price: ${item.price.toFixed(2)} each
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default OrderDetail;