import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";

import Layout from "./components/layout/Layout";
import Home from "./pages/Home";

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
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}> {/* Stage 2. Product */}
            <Route index element={<Home />} /> {/* Stage 2. Product */}

            {/* Product Routes */}
            <Route path="products">
              <Route index element={<ProductList />} /> {/* Stage 2. Product */}
              <Route path=":productId" element={<ProductDetail />} /> {/* Stage 2. Product */}
            </Route>

            {/* Cart & Checkout */}
            <Route path="cart" element={<Cart />} /> {/* Stage 2. Product */}
            <Route path="checkout" element={<Checkout />} /> {/* Stage 2. Product */}

            {/* Orders */}
            <Route path="orders">
              <Route path=":orderId" element={<OrderDetail />} /> {/* Stage 3. Order */}
            </Route>

            {/* User Account Routes */}
            <Route path="user">
              <Route index element={<UserDashboard />} /> {/* Stage 1. User */}
              <Route path="orders" element={<UserOrders />} /> {/* Stage 3. Order */}
              <Route path="account" element={<UserAccount />} /> {/* Stage 1. User */}
              <Route path="payments" element={<UserPayments />} /> {/* Stage 3. Order */}
            </Route>
            <Route path="login" element={<Login />} /> {/* Stage 1. User */}
            <Route path="register" element={<Register />} /> {/* Stage 1. User */}

            {/* Admin Routes */}
            <Route path="admin">
              <Route index element={<AdminDashboard />} /> {/* Stage 1. User */}
              <Route path="users" element={<ManageUsers />} /> {/* Stage 1. User */}
              <Route path="products" element={<ManageProducts />} /> {/* Stage 2. Product */}
              <Route path="orders" element={<ManageOrders />} /> {/* Stage 3. Order */}
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
