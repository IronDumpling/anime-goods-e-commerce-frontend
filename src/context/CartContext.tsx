import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product } from '@/lib/types';
import { get } from '@/lib/api';

export interface CartItem {
  product: Product;
  quantity: number;
  selected: boolean;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  updateSelected: (productId: number, selected: boolean) => void;
  selectAll: (selected: boolean) => void;
  removeSelected: () => void;
  clearCart: () => void;
  isLoading: boolean;
}

// Interface for the minimal data stored in localStorage
interface StoredCartItem {
  productId: number;
  quantity: number;
  selected: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart data from localStorage and fetch fresh product data
  useEffect(() => {
    const loadCart = async () => {
      try {
        const storedCart = localStorage.getItem(STORAGE_KEY);
        if (!storedCart) {
          setIsLoading(false);
          return;
        }

        const storedItems: StoredCartItem[] = JSON.parse(storedCart);

        // Fetch fresh product data for each stored item
        const freshItems: CartItem[] = [];
        for (const storedItem of storedItems) {
          try {
            const response = await get<Product>(`/api/product/${storedItem.productId}`);
            if (response.data) {
              freshItems.push({
                product: response.data,
                quantity: storedItem.quantity,
                selected: storedItem.selected
              });
            }
          } catch (error) {
            console.error(`Failed to fetch product ${storedItem.productId}:`, error);
          }
        }

        setItems(freshItems);
      } catch (error) {
        console.error('Failed to load cart:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();
  }, []);

  // Save cart data to localStorage whenever items change
  useEffect(() => {
    if (!isLoading) {
      const storedItems: StoredCartItem[] = items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        selected: item.selected
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storedItems));
    }
  }, [items, isLoading]);

  const addItem = (product: Product) => {
    setItems(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
            : item
        );
      }
      return [...prev, { product, quantity: 1, selected: false }];
    });
  };

  const removeItem = (productId: number) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    setItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const updateSelected = (productId: number, selected: boolean) => {
    setItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, selected } : item
      )
    );
  };

  const selectAll = (selected: boolean) => {
    setItems(prev => prev.map(item => ({ ...item, selected })));
  };

  const removeSelected = () => {
    setItems(prev => prev.filter(item => !item.selected));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const value = {
    items,
    totalItems,
    addItem,
    removeItem,
    updateQuantity,
    updateSelected,
    selectAll,
    removeSelected,
    clearCart,
    isLoading
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}