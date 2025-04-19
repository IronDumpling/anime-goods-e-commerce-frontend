import { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '@/lib/types';
import { toast } from "sonner";

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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (product: Product) => {
    toast.success("Add product to cart!");
    setItems(prev => {
      console.log("Prev = ", prev);
      const existingItem = prev.find(item => item.product.id === product.id);
      if (existingItem) {
        // If item exists, increment quantity
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
            : item
        );
      }
      // If item doesn't exist, add new item
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