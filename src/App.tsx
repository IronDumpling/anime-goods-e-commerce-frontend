import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from './context/CartContext';
import Layout from "./components/layout/Layout";
import { Toaster, toast } from "sonner";
import { useEffect } from "react";

import ProductList from "./pages/Products/ProductList";
import ProductDetail from "./pages/Products/ProductDetail";

import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderDetail from "./pages/Orders/OrderDetail";

import UserDashboard from "./pages/User/UserDashboard";
import UserOrders from "./pages/Orders/UserOrders";
import UserAccount from "./pages/User/UserAccount";
import UserPayments from "./pages/User/UserPayments";
import Login from "./pages/User/Login";
import Register from "./pages/User/Register";

import AdminDashboard from "./pages/Admin/AdminDashboard";
import ManageUsers from "./pages/Admin/ManageUsers";
import ManageProducts from "./pages/Admin/ManageProducts";
import ManageOrders from "./pages/Admin/ManageOrders";

import './App.css'

function App() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      event.preventDefault();
      const error = event.error;
      let message = "An unexpected error occurred";

      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'object' && error !== null) {
        if ('error' in error) {
          message = (error as { error: string }).error;
        } else if ('message' in error) {
          message = (error as { message: string }).message;
        }
      }

      toast.error(message);
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      const error = event.reason;
      let message = "An unexpected error occurred";

      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'object' && error !== null) {
        if ('error' in error) {
          message = (error as { error: string }).error;
        } else if ('message' in error) {
          message = (error as { message: string }).message;
        }
      }

      toast.error(message);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  return (
    <CartProvider>
      <AuthProvider>
        <Toaster richColors position="top-center" />
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Redirect root to products */}
            <Route index element={<Navigate to="/products" replace />} />

            {/* Product Routes */}
            <Route path="products">
              <Route index element={<ProductList />} /> {/* Yushun: add cart + buy now logic */}
              <Route path=":productId" element={<ProductDetail />} /> {/* Yushun: add cart + buy now logic */}
            </Route>

            {/* Cart & Checkout */}
            <Route path="cart" element={<Cart />} /> {/* Stage 2. Product Yushun */}
            <Route path="checkout" element={<Checkout />} /> {/* Stage 2. Product Chuyue */}

            {/* Orders */}
            <Route path="orders">
              <Route path=":orderId" element={<OrderDetail />} /> {/* Stage 3. Order Chuyue */}
            </Route>

            {/* User Account Routes */}
            <Route path="user/:userId">
              <Route index element={<UserDashboard />} />
              <Route path="orders" element={<UserOrders />} /> {/* Stage 3. Order Chuyue */}
              <Route path="account" element={<UserAccount />} />
              <Route path="payments" element={<UserPayments />} /> {/* Stage 3. Order Chuyue */}
            </Route>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />

            {/* Admin Routes */}
            <Route path="admin">
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<ManageUsers />} /> {/* Stage 1. User Yushun: functionality */}
              <Route path="products" element={<ManageProducts />} /> {/* Stage 2. Product Yushun */}
              <Route path="orders" element={<ManageOrders />} /> {/* Stage 3. Order Chuyue */}
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </CartProvider>
  )
}

export default App
