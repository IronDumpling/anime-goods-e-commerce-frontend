import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { get } from "@/lib/api"; 
import { Product } from '@/lib/types'
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import BackButton from '@/components/layout/BackButton';
import { ImageOff, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';

function ProductDetail() {
  const { productId } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await get<Product>("/api/product/" + Number(productId));

        if (res) {
          setProduct(res.data || null);
        } else {
          setError('Product not found');
        }
      } catch (err) {
        setError('Failed to load product');
        console.error('Error fetching product:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="text-center">Loading product details...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="text-center text-red-500">{error || 'Product not found'}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <BackButton to={`/products`} label="Back to Product List" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="aspect-square relative bg-muted rounded-lg">
          {!imageError ? (
            <img
              src={product.imageURL}
              alt={product.name}
              className="w-full h-full object-cover rounded-lg"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageOff className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <Badge className="mb-4">{product.category}</Badge>
          <p className="text-2xl font-bold text-primary mb-4">${product.price.toFixed(2)}</p>
          <p className="text-muted-foreground mb-6">{product.description}</p>
          <div className="mb-4">
            <span className="font-medium">Stock: </span>
            <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>
          <div className="flex gap-4">
            <Button
              className="flex-1"
              disabled={product.stock === 0}
              onClick={() => addItem(product)}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;