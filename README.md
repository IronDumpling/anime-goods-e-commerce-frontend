# 🛍️ Full-Stack E-Commerce Frontend (React + TypeScript)

This project is the **frontend** of a full-stack e-commerce platform built with **React**, **TypeScript**, and **TailwindCSS**, offering robust user and admin functionality including shopping, checkout, user profiles, order management, and admin dashboards.

For full documentation, visit our [backend repository](https://github.com/LittlePetunia/ece1724-anime-goods-e-commerce-backend).

---

## 🧠 Project Features

### 🛍️ Users
- Browse products by category, price, stock status.
- View product detail pages.
- Add to cart or buy now.
- Manage cart (edit, remove, checkout).
- Checkout requires authentication.
- Import/Export products as Excel

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

| Tool                | Purpose                            |
|---------------------|------------------------------------|
| React               | Frontend framework                 |
| TypeScript          | Type safety                        |
| Vite                | Build tool & development server    |
| React Router        | Routing                            |
| Tailwind CSS        | Styling                            |
| ShadCN/UI           | UI Components                      |
| Prisma (Backend)    | ORM for PostgreSQL                 |
| Express.js (Backend)| API server                         |
| AWS S3              | Media/Image storage                |
| XLSX                | Table Import/Export                |

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
- The cart state is stored in client memory (localStorage).
- DISCONTINUED products are filtered on the frontend.
- Admins have access to all order and user records.
- Dark mode support available.

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

> Backend must be running on `localhost:5173` (or update proxy config)

## 🔧 Configurations

The project uses several configuration files:
- `vite.config.ts` - Vite configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `eslint.config.js` - ESLint configuration
- `postcss.config.cjs` - PostCSS configuration
