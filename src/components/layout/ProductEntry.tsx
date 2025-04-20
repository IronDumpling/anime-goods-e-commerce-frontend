import { useState } from 'react';
import { Product } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/context/CartContext';
import { Link } from 'react-router-dom';
import { ImageOff, ShoppingCart } from 'lucide-react';

interface ProductEntryProps {
  product: Product;
}

export function ProductEntry({ product }: ProductEntryProps) {
  const [imageError, setImageError] = useState(false);
  const { addItem } = useCart();

  return (
    <div className="bg-card text-card-foreground rounded-xl border shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex gap-4 p-3">
        <div className="w-24 h-24 relative bg-muted rounded-lg flex-shrink-0">
          {imageError ? (
            <div className="w-full h-full flex items-center justify-center">
              <ImageOff className="h-6 w-6 text-muted-foreground" />
            </div>
          ) : (
            <img
              src={product.imageURL}
              alt={product.name}
              className="object-cover w-full h-full rounded-lg"
              onError={() => setImageError(true)}
            />
          )}
        </div>
        <div className="flex-grow min-w-0 flex items-center gap-4">
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-3">
              <Badge
                variant={product.stock > 0 ? "default" : "destructive"}
                className="flex-shrink-0"
              >
                {product.stock > 0 ? "In Stock" : "Out of Stock"}
              </Badge>
              <h3 className="text-base font-semibold truncate">{product.name}</h3>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{product.description}</p>
            <div className="text-base font-bold mt-1">
              ${product.price.toFixed(2)}
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button asChild variant="outline" size="sm">
              <Link to={`/products/${product.id}`} className="text-foreground">View Details</Link>
            </Button>
            <Button
              size="sm"
              className="text-primary-foreground"
              disabled={product.stock <= 0}
              onClick={() => addItem(product)}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}