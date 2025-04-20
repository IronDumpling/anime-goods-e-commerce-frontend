import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ImageOff } from 'lucide-react';

import { get } from "@/lib/api";
import { addOrderTotal } from '@/lib/utils';
import { Product, Order } from '@/lib/types';

import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import BackButton from '@/components/layout/BackButton';
import { Badge } from '@/components/ui/Badge';

function OrderDetail() {
  const { orderId } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState<(Order & { total: number }) | null>(null);
  const [products, setProducts] = useState<Record<number, Product>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId || !user) return;

      try {
        const response = await get<Order>("/api/order/" + parseInt(orderId));
        if (response.error || !response.data) {
          throw response.error || { error: "Unknown Error Order Detail"};
        }

        // Verify that the order belongs to the current user
        const orderData = response.data;
        if (!user.isAdmin && orderData.userId !== user.id) {
          setError("You do not have permission to view this order");
          return;
        }

        setOrder(addOrderTotal(orderData));

        // Fetch product details for each item in the order
        const productPromises = orderData.orderItems.map(item =>
          get<Product>("/api/product/" + Number(item.productId))
        );
        const productResults = await Promise.all(productPromises);

        const productMap: Record<number, Product> = {};
        productResults.forEach(result => {
          if (result && result.data) {
            productMap[result.data.id] = result.data;
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

  const handleImageError = (productId: number) => {
    setImageErrors(prev => ({
      ...prev,
      [productId]: true
    }));
  };

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

  const getUserIdFromOrderId = async function (orderId: string) {
    try {
      const response = await get<Order>(`/api/order/${orderId}`);
      return String(response.data?.userId) || undefined;
    } catch (error) {
      return undefined;
    }
  };
  return (
    <ProtectedRoute
      accessLevel="self-and-admin"
      resolveUserId={getUserIdFromOrderId}
      paramKey='orderId'
    >
      <div className="container mx-auto px-4 py-10">
        <BackButton to={`/user/${user?.id}/orders`} label="Back to Orders" />
        <h1 className="text-2xl font-bold mb-6">Order #{order.id}</h1>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Order Status</CardTitle>
                <Badge
                  className={
                    order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                    order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                    order.status === 'SHIPPED' ? 'bg-green-100 text-green-800 border-green-300' :
                    order.status === 'DELIVERED' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                    'bg-red-100 text-red-800 border-red-300'
                  }
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase()}
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
                {order.orderItems.map((item) => {
                  const product = products[item.productId];
                  return (
                    <div key={item.productId} className="flex items-center gap-4">
                      {product && (
                        <div className="w-20 h-20 relative bg-muted rounded flex-shrink-0">
                          {imageErrors[item.productId] ? (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageOff className="h-6 w-6 text-muted-foreground" />
                            </div>
                          ) : (
                            <img
                              src={product.imageURL}
                              alt={product.name}
                              className="w-full h-full object-cover rounded"
                              onError={() => handleImageError(item.productId)}
                            />
                          )}
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium">
                          {product ? product.name : `Product #${item.productId}`}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity}
                        </p>
                        <p className="text-sm">
                          Price: ${item.unitPrice.toFixed(2)} each
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${(item.unitPrice * item.quantity).toFixed(2)}
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
                  <span>${order.total?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span>${order.total?.toFixed(2)}</span>
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