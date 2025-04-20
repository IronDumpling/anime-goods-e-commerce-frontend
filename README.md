# 🛍️ Full-Stack E-Commerce Frontend (React + TypeScript)

This project is the **frontend** of a full-stack e-commerce platform built with **React**, **TypeScript**, and **TailwindCSS**, offering robust user and admin functionality including shopping, checkout, user profiles, order management, and admin dashboards.

---

## 📸 Project Previews

- ### 📦 Product Browsing
  ![](./Product.png)

- ### 📑 Order Flow
  ![](./Order.png)

- ### 🛒 Shopping Cart & Checkout
  ![](./Frontend%20Shopping%20Cart.png)

- ### 👤 User Flows
  ![](./Frontend%20User.png)

- ### 🗂️ Pages & Access Design
  ![](./frontend.drawio.png)

- ### 🏗️ Infrastructure Overview
  ![](./Infrastracture.png)

---

## 🧠 Project Features

### 🛍️ Users
- Browse products by category, price, stock status.
- View product detail pages.
- Add to cart or buy now.
- Manage cart (edit, remove, checkout).
- Checkout requires authentication.

### 👤 User Profile
- View/update personal information (name, email, address).
- Change password (with current-password validation).
- View order history and detail.
- Delete account.

### 📦 Orders
- Place orders with multiple products.
- View order details with product breakdown.
- Filter and track order status (Pending, Shipped, Delivered, Cancelled).

### 👨‍💼 Admins
- Access full dashboards.
- Manage all users (view/edit/delete).
- Manage all products (CRUD).
- Manage all orders (update status, view details).

---

## 🧩 Project Structure

```
📁 src/
├── components/          # Reusable UI components
├── context/             # Auth context
├── pages/               # Page-level components
│   ├── User/            # /user/:id routes
│   ├── Admin/           # /admin routes
│   ├── Product/         # /products
│   └── Order/           # /orders
├── lib/                 # Utility functions, API handlers
├── assets/              # Images & icons
└── App.tsx              # Main router
```

---

## 🔐 Authentication & Authorization

- ✅ Protected routes use `<ProtectedRoute accessLevel="user" | "admin" | "self" | "self-and-admin" />`.
- 🔐 Login state is stored in AuthContext.
- 👮‍♂️ Route guard prevents unauthorized access to sensitive pages.

---

## 🔁 API Interaction

Uses a centralized `api.ts` wrapper for all HTTP calls. Example:

```ts
const response = await get<Product[]>("/api/products");
```

When placing an order:

```ts
POST /api/order
{
  userId: 1,
  status: "PENDING",
  items: [{ productId: 3, quantity: 2 }]
}
```

---

## 📦 Tech Stack

| Tool               | Purpose                            |
|--------------------|------------------------------------|
| React              | Frontend framework                 |
| TypeScript         | Type safety                        |
| React Router       | Routing                            |
| Tailwind CSS       | Styling                            |
| ShadCN/UI          | UI Components                      |
| Prisma (Backend)   | ORM for PostgreSQL                 |
| Express.js (Backend)| API server                        |
| AWS S3             | Media/Image storage                |

---

## 🧪 Sample User Flows

### Guest Browsing
1. Visit Product List
2. View Product Details
3. Try to checkout → redirect to login
4. Register → redirect back to checkout

### Authenticated User
1. Add to cart
2. Place order → view order list
3. Click to edit profile
4. Change password

### Admin
1. Login as Admin
2. View Admin Dashboard
3. Manage products & orders
4. Edit/delete user profiles

---

## 📌 Notes

- Password fields are **not fetched** from backend for security reasons.
- The cart state is stored in client memory (React context or state).
- DISCONTINUED products are filtered on the frontend.
- Admins have access to all order and user records.

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

> Backend must be running on `localhost:5173` (or update proxy config)
