import { useState } from 'react';
import { Product } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { ImageOff, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const { addItem, isLoading } = useCart();

  return (
    <div className="bg-card text-card-foreground rounded-xl border shadow-sm overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
      <div className="aspect-square relative bg-muted">
        {imageError ? (
          <div className="w-full h-full flex items-center justify-center">
            <ImageOff className="h-12 w-12 text-muted-foreground" />
          </div>
        ) : (
          <img
            src={product.imageURL}
            alt={product.name}
            className="object-cover w-full h-full"
            onError={() => setImageError(true)}
          />
        )}
        <Badge
          className="absolute top-2 right-2"
          variant={product.stock > 0 ? "default" : "destructive"}
        >
          {product.stock > 0 ? "In Stock" : "Out of Stock"}
        </Badge>
      </div>
      <div className="p-3 flex-grow">
        <h3 className="text-lg font-semibold truncate">{product.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        <div className="mt-1.5 font-bold">
          ${product.price.toFixed(2)}
        </div>
      </div>
      <div className="p-3 pt-0 mt-auto grid gap-2">
        <Button asChild variant="outline" size="sm">
          <Link to={`/products/${product.id}`} className="text-foreground">View Details</Link>
        </Button>
        <Button
          size="sm"
          className="text-primary-foreground"
          disabled={product.stock <= 0 || isLoading}
          onClick={() => addItem(product)}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {isLoading ? "Loading..." : "Add to Cart"}
        </Button>
        <Button
          size="sm"
          className="text-primary-foreground"
          disabled={product.stock <= 0 || isLoading}
        >
          Buy Now
        </Button>
      </div>
    </div>
  );
}
