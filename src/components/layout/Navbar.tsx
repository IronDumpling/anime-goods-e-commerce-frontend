import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "../ui/Button";
import { useTheme } from "../../context/ThemeContext";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { mockApi, ProductCategory } from "@/lib/mock";
import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

import { ShoppingCart, User, ImageOff } from "lucide-react";

const getProductCategoryComponents = (categories: ProductCategory[]) => {
  return (
    <div className="grid w-[300px] gap-2 p-3">
      {/* All Products link */}
      <div>
        <NavigationMenuLink asChild>
          <Link
            to="/products"
            className="block select-none rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
          >
            <div className="text-sm font-medium leading-none text-center">All Products</div>
            <p className="mt-1 text-xs leading-snug text-foreground/80 text-center">
              Browse all our anime merchandise
            </p>
          </Link>
        </NavigationMenuLink>
      </div>

      {/* Category links */}
      {categories.map((component) => (
        <div key={component.title}>
          <NavigationMenuLink asChild>
            <Link
              to={component.href}
              className="block select-none rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
            >
              <div className="text-sm font-medium leading-none text-center">{component.title}</div>
              <p className="mt-1 text-xs leading-snug text-foreground/80 text-center">
                {component.desc}
              </p>
            </Link>
          </NavigationMenuLink>
        </div>
      ))}
    </div>
  );
}

interface CartPreviewItemProps {
  item: {
    product: {
      id: number;
      name: string;
      imageURL: string;
      price: number;
    };
    quantity: number;
  };
}

function CartPreviewItem({ item }: CartPreviewItemProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <Link to={`/products/${item.product.id}`}>
      <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent">
        <div className="w-12 h-12 relative bg-muted rounded-md flex-shrink-0">
          {imageError ? (
            <div className="w-full h-full flex items-center justify-center">
              <ImageOff className="h-6 w-6 text-muted-foreground" />
            </div>
          ) : (
            <img
              src={item.product.imageURL}
              alt={item.product.name}
              className="w-full h-full object-cover rounded-md"
              onError={() => setImageError(true)}
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{item.product.name}</p>
          <p className="text-xs text-muted-foreground">
            ${item.product.price.toFixed(2)} × {item.quantity}
          </p>
        </div>
      </div>
    </Link>
  );
}

function CartPreview() {
  const navigate = useNavigate();
  const { items: cartItems } = useCart();
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <div className="w-[300px] p-4">
      {cartItems.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">Your cart is empty</p>
      ) : (
        <>
          <div className="max-h-[200px] overflow-y-auto space-y-2">
            {cartItems.map((item) => (
              <CartPreviewItem key={item.product.id} item={item} />
            ))}
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium">Total</span>
              <span className="text-sm font-bold">${totalPrice.toFixed(2)}</span>
            </div>
            <div className="grid gap-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/cart')}
              >
                Go to Cart
              </Button>
              <Button
                className="w-full"
                onClick={() => navigate('/checkout')}
              >
                Checkout
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function Navbar() {
  const { toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const isLoggedIn = user !== null;
  const isAdmin = user?.isAdmin;
  const userId = user?.id;
  const firstName = user?.firstName;
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const { totalItems } = useCart();

  const isProductsPage = location.pathname === '/products';

  const handleSearch = (value: string) => {
    setSearchValue(value);
    if (isProductsPage) {
      const newParams = new URLSearchParams(searchParams);
      if (value) {
        newParams.set('search', value);
      } else {
        newParams.delete('search');
      }
      setSearchParams(newParams);
    }
  };

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (!isProductsPage) {
        const newParams = new URLSearchParams();
        if (searchValue) {
          newParams.set('search', searchValue);
        }
        navigate(`/products${searchValue ? `?${newParams.toString()}` : ''}`);
      }
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await mockApi.categories.getAll();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleLogin = () => {
    navigate('/login', { state: { from: { pathname: location.pathname } } });
  };

  const handleLogout = () => {
    // Only navigate if we're not already on the products page
    if (location.pathname !== '/products') {
      navigate('/products');
      // Use setTimeout to ensure navigation completes before logout
      setTimeout(() => {
        logout();
      }, 100);
    } else {
      // If already on products page, just logout directly
      logout();
    }
  };

  const renderUserMenu = () => {
    if (!isLoggedIn) {
      return (
        <div className="w-[200px] p-4">
          <p className="text-sm text-foreground/80 mb-4">You are not logged in</p>
          <Button
            className="w-full"
            onClick={handleLogin}
          >
            Login
          </Button>
        </div>
      );
    }

    if (isAdmin) {
      return (
        <div className="w-[200px] p-4">
          <div className="mb-4">
            <p className="text-sm font-medium">Welcome, Admin {firstName}!</p>
          </div>
          <div className="grid gap-3">
            <Link
              to="/admin"
              className="block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-sm"
            >
              Dashboard
            </Link>
            <Link
              to="/admin/orders"
              className="block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-sm"
            >
              Manage Orders
            </Link>
            <Link
              to="/admin/users"
              className="block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-sm"
            >
              Manage Accounts
            </Link>
            <Link
              to="/admin/products"
              className="block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-sm"
            >
              Manage Products
            </Link>
            <Button
              className="w-full"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="w-[200px] p-4">
        <div className="mb-4">
          <p className="text-sm font-medium">Welcome, {firstName}!</p>
        </div>
        <div className="grid gap-3">
          <Link
            to={`/user/${userId}`}
            className="block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-sm"
          >
            Dashboard
          </Link>
          <Link
            to={`/user/${userId}/orders`}
            className="block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-sm"
          >
            Orders
          </Link>
          <Button
            className="w-full"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-14 items-center justify-between">
        <NavigationMenu>
          <NavigationMenuList className="flex items-center gap-6">
            {/* Logo/Brand */}
            <NavigationMenuItem>
              <Link to="/products">
                AnimeGoods
              </Link>
            </NavigationMenuItem>

            {/* Products Dropdown */}
            <NavigationMenuItem>
              <NavigationMenuTrigger>
                Products
              </NavigationMenuTrigger>
              <NavigationMenuContent className="bg-popover text-popover-foreground">
                {getProductCategoryComponents(categories)}
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Search Bar */}
        <div className="flex-1 mx-4">
          <Input
            type="search"
            placeholder="Search products..."
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={handleSearchSubmit}
          />
        </div>

        {/* Right side items */}
        <NavigationMenu>
          <NavigationMenuList className="flex items-center gap-4">
            {/* User Account */}
            <NavigationMenuItem>
              <NavigationMenuTrigger>
                <User className="h-5 w-5" />
              </NavigationMenuTrigger>
              <NavigationMenuContent className="bg-popover text-popover-foreground">
                {renderUserMenu()}
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Shopping Cart */}
            <NavigationMenuItem>
              <NavigationMenuTrigger>
                <div className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </div>
              </NavigationMenuTrigger>
              <NavigationMenuContent className="bg-popover text-popover-foreground">
                <CartPreview />
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Theme Toggle */}
            <NavigationMenuItem>
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                🌓
              </Button>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
}
