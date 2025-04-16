import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "../ui/Button";
import { useTheme } from "../../context/ThemeContext";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

import { ShoppingCart, User } from "lucide-react";



const productCategory: { title: string; href: string, desc: string }[] = [
  {
    title: "Figures",
    href: "/TODO",
    desc: "Browse our collection of anime figures",
  },
  {
    title: "Badges",
    href: "/TODO",
    desc: "TODO: desc for badges",
  },
  {
    title: "Manga",
    href: "/TODO",
    desc: "TODO: desc for manga",
  },
];

const getProductCategoryComponents = () => {
  return (
    <div className="grid w-[300px] gap-2 p-3">
      {productCategory.map((component) => (
        <div key={component.title}>
          <NavigationMenuLink asChild>
            <a
              className="block select-none rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
              href={component.href}
            >
              <div className="text-sm font-medium leading-none text-center">{component.title}</div>
              <p className="mt-1 text-xs leading-snug text-foreground/80 text-center">
                {component.desc}
              </p>
            </a>
          </NavigationMenuLink>
        </div>
      ))}
    </div>
  );
}


export default function Navbar() {
  const { toggleTheme } = useTheme();
  const { isLoggedIn, username, isAdmin, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = () => {
    navigate('/login', { state: { from: { pathname: location.pathname } } });
  };

  const handleLogout = () => {
    // Navigate to home page first, then logout
    navigate('/');
    // Use setTimeout to ensure navigation completes before logout
    setTimeout(() => {
      logout();
    }, 0);
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
            <p className="text-sm font-medium">Welcome, Admin {username}!</p>
          </div>
          <div className="grid gap-3">
            <Link
              to="/admin"
              className="block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-sm"
            >
              Dashboard
            </Link>
            <Link
              to="/admin/users"
              className="block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-sm"
            >
              Manage Users
            </Link>
            <Link
              to="/admin/products"
              className="block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-sm"
            >
              Manage Products
            </Link>
            <Link
              to="/admin/orders"
              className="block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-sm"
            >
              Manage Orders
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
          <p className="text-sm font-medium">Welcome, {username}!</p>
        </div>
        <div className="grid gap-3">
          <Link
            to="/orders"
            className="block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-sm"
          >
            Orders
          </Link>
          <Link
            to="/user"
            className="block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-sm"
          >
            Account
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
    <div className="sticky top-0 z-50 w-full border-b">
      <div className="container flex h-14 items-center justify-between">
        <NavigationMenu>
          <NavigationMenuList className="flex items-center gap-6">
            {/* Logo/Brand */}
            <NavigationMenuItem>
              <Link to="/">
                AnimeGoods
              </Link>
            </NavigationMenuItem>

            {/* Products */}
            <NavigationMenuItem>
              <NavigationMenuTrigger>
                Products
              </NavigationMenuTrigger>
              <NavigationMenuContent className="bg-popover text-popover-foreground">
                {getProductCategoryComponents()}
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Search Bar */}
        <div className="flex-1 mx-4">
          <Input
            type="search"
            placeholder="Search..."
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
                <ShoppingCart className="h-5 w-5" />
              </NavigationMenuTrigger>
              <NavigationMenuContent className="bg-popover text-popover-foreground">
                <div className="w-[200px] p-2">
                  <p className="text-sm text-foreground/80">Your cart is empty</p>
                </div>
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
