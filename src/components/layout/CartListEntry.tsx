import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/checkbox';
import { ImageOff, Minus, Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';

interface CartListEntryProps {
  product: Product;
  quantity: number;
  selected: boolean;
  onQuantityChange: (productId: number, quantity: number) => void;
  onSelectChange: (productId: number, selected: boolean) => void;
  onRemove: (productId: number) => void;
}

export function CartListEntry({
  product,
  quantity,
  selected,
  onQuantityChange,
  onSelectChange,
  onRemove
}: CartListEntryProps) {
  const [imageError, setImageError] = useState(false);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      onQuantityChange(product.id, newQuantity);
    }
  };

  return (
    <div className="bg-card text-card-foreground rounded-xl border shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex gap-4 p-3">
        <div className="flex items-center">
          <Checkbox
            checked={selected}
            onCheckedChange={(checked) => onSelectChange(product.id, checked as boolean)}
            className="h-5 w-5"
          />
        </div>
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
              <Link to={`/products/${product.id}`}>
                <h3 className="text-base font-semibold truncate">{product.name}</h3>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{product.description}</p>
            <div className="text-base font-bold mt-1">
              ${product.price.toFixed(2)}
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center border rounded-md">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-none"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                min={1}
                max={product.stock}
                value={quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                className="w-16 h-8 text-center rounded-none border-x [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-none"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= product.stock}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              onClick={() => onRemove(product.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}