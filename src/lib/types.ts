export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  isAdmin: boolean;
}

export interface Product {
  id: number;
  name: string;
  brand: string;
  description: string;
  price: number;
  stock: number;
  status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
  imageURL: string,
  category: string,
  createdAt: string;
}

export interface ProductCategory {
  title: string;
  href: string;
  desc: string;
}

export interface Order {
  id: number;
  userId: number;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  orderItems: OrderItem[];
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  product: {
    name: string;
  };
}

export const ProductCategories: ProductCategory[] = [
  {
    title: "Figures",
    href: "/products?categories=Figures",
    desc: "Action figures and collectible statues"
  },
  {
    title: "Accessories",
    href: "/products?categories=Accessories",
    desc: "Phone cases, watches, and other accessories"
  },
  {
    title: "Clothing",
    href: "/products?categories=Clothing",
    desc: "T-shirts, hoodies, and apparel"
  },
  {
    title: "Media",
    href: "/products?categories=Media",
    desc: "Manga, movies, and trading cards"
  },
  {
    title: "Cosplay",
    href: "/products?categories=Cosplay",
    desc: "Costumes, props, and replicas"
  }
];

export const typesApi = {
  categories: {
    getAll: async (): Promise<ProductCategory[]> => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(ProductCategories), 500);
      });
    },
  }
}

