// Types
// export interface User {
//   id: number;
//   firstName: string;
//   lastName: string;
//   email: string;
//   address: string;
//   isAdmin: boolean;
// }

// Internal type for user data with password
// interface UserWithPassword extends User {
//   password: string;
// }

// interface Product {
//   id: number;
//   name: string;
//   brand: string;
//   description: string;
//   price: number;
//   stock: number;
//   status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
//   imageURL: string,
//   category: string,
//   createdAt: string;
// }

export interface Order {
  id: number;
  userId: number;
  products: {
    productId: number;
    quantity: number;
    price: number;
  }[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
}

export interface ProductCategory {
  title: string;
  href: string;
  desc: string;
}

// // Mock Data
// const mockUsersWithPassword: UserWithPassword[] = [
//   {
//     id: 1,
//     username: "admin",
//     email: "admin@example.com",
//     role: "admin",
//     status: "active",
//     createdAt: "2024-01-01",
//     password: "admin123"
//   },
//   {
//     id: 2,
//     username: "anime_lover",
//     email: "anime_lover@example.com",
//     role: "user",
//     status: "active",
//     createdAt: "2024-01-02",
//     password: "anime123"
//   },
//   {
//     id: 3,
//     username: "manga_reader",
//     email: "manga_reader@example.com",
//     role: "user",
//     status: "active",
//     createdAt: "2024-01-03",
//     password: "manga123"
//   },
//   {
//     id: 4,
//     username: "cosplay_fan",
//     email: "cosplay_fan@example.com",
//     role: "user",
//     status: "inactive",
//     createdAt: "2024-01-04",
//     password: "cosplay123"
//   },
// ];

// // Helper function to convert UserWithPassword to User
// const toUser = (userWithPassword: UserWithPassword): User => {
//   const { password, ...user } = userWithPassword;
//   return user;
// };

// export const mockProducts: Product[] = [
//   {
//     id: 1,
//     title: "Naruto Uzumaki Figure",
//     description: "High-quality figure of Naruto Uzumaki in his signature pose",
//     price: 49.99,
//     image: "https://example.com/naruto-figure.jpg",
//     category: "Figures",
//     stock: 15,
//     createdAt: "2024-01-01",
//   },
//   {
    // id: 2,
    // title: "Attack on Titan Badge Set",
    // description: "Set of 5 badges featuring Attack on Titan characters",
    // price: 12.99,
    // image: "https://example.com/aot-badges.jpg",
    // category: "Accessories",
    // stock: 50,
    // createdAt: "2024-01-02",
//   },
//   {
    // id: 3,
    // title: "One Piece Volume 1",
    // description: "First volume of the One Piece manga series",
    // price: 9.99,
    // image: "https://example.com/one-piece-vol1.jpg",
    // category: "Media",
    // stock: 30,
    // createdAt: "2024-01-03",
//   },
//   {
    // id: 4,
    // title: "Demon Slayer Tanjiro Sword",
    // description: "Replica of Tanjiro's Nichirin Blade from Demon Slayer",
    // price: 89.99,
    // image: "https://example.com/tanjiro-sword.jpg",
    // category: "Cosplay",
    // stock: 5,
    // createdAt: "2024-01-04",
//   },
//   {
    // id: 5,
    // title: "My Hero Academia Hoodie",
    // description: "U.A. High School themed hoodie, available in multiple sizes",
    // price: 39.99,
    // image: "https://example.com/mha-hoodie.jpg",
    // category: "Clothing",
    // stock: 25,
    // createdAt: "2024-01-05",
//   },
//   {
//     id: 6,
//     title: "Ghibli Movies Collection",
//     description: "Complete collection of Studio Ghibli films on Blu-ray",
//     price: 199.99,
//     image: "https://example.com/ghibli-collection.jpg",
//     category: "Media",
//     stock: 10,
//     createdAt: "2024-01-06",
//   },
//   {
//     id: 7,
//     title: "Jujutsu Kaisen Phone Case",
//     description: "Protective phone case featuring Gojo Satoru design",
//     price: 19.99,
//     image: "https://example.com/jjk-case.jpg",
//     category: "Accessories",
//     stock: 40,
//     createdAt: "2024-01-07",
//   },
//   {
//     id: 8,
//     title: "Dragon Ball Z Action Figure Set",
//     description: "Set of 4 premium Dragon Ball Z character figures",
//     price: 129.99,
//     image: "https://example.com/dbz-figures.jpg",
//     category: "Figures",
//     stock: 8,
//     createdAt: "2024-01-08",
//   },
//   {
//     id: 9,
//     title: "Tokyo Ghoul Mask Replica",
//     description: "High-quality replica of Ken Kaneki's mask",
//     price: 34.99,
//     image: "https://example.com/kaneki-mask.jpg",
//     category: "Cosplay",
//     stock: 15,
//     createdAt: "2024-01-09",
//   },
//   {
//     id: 10,
//     title: "Death Note Notebook",
//     description: "Replica of the Death Note with faux leather cover",
//     price: 24.99,
//     image: "https://example.com/death-note.jpg",
//     category: "Accessories",
//     stock: 20,
//     createdAt: "2024-01-10",
//   },
//   {
//     id: 11,
//     title: "Sailor Moon Wand",
//     description: "Light-up replica of Sailor Moon's Cutie Moon Rod",
//     price: 44.99,
//     image: "https://example.com/sailor-moon-wand.jpg",
//     category: "Cosplay",
//     stock: 12,
//     createdAt: "2024-01-11",
//   },
//   {
//     id: 12,
//     title: "Evangelion Model Kit",
//     description: "1/144 scale EVA Unit-01 model kit with LED effects",
//     price: 79.99,
//     image: "https://example.com/eva-model.jpg",
//     category: "Figures",
//     stock: 7,
//     createdAt: "2024-01-12",
//   },
//   {
//     id: 13,
//     title: "Pokémon Trading Card Set",
//     description: "Limited edition set of 50 rare Pokémon cards",
//     price: 149.99,
//     image: "https://example.com/pokemon-cards.jpg",
//     category: "Media",
//     stock: 5,
//     createdAt: "2024-01-13",
//   },
//   {
//     id: 14,
//     title: "Hunter x Hunter T-Shirt",
//     description: "Cotton t-shirt featuring Hunter Association logo",
//     price: 29.99,
//     image: "https://example.com/hxh-shirt.jpg",
//     category: "Clothing",
//     stock: 18,
//     createdAt: "2024-01-14",
//   },
//   {
//     id: 15,
//     title: "Fullmetal Alchemist Pocket Watch",
//     description: "Detailed replica of State Alchemist pocket watch",
//     price: 59.99,
//     image: "https://example.com/fma-watch.jpg",
//     category: "Accessories",
//     stock: 0,
//     createdAt: "2024-01-15",
//   }
// ];

export const mockOrders: Order[] = [
  {
    id: 1,
    userId: 2,
    products: [
      {
        productId: 1,
        quantity: 1,
        price: 49.99,
      },
    ],
    total: 49.99,
    status: "delivered",
    createdAt: "2024-01-05",
  },
  {
    id: 2,
    userId: 3,
    products: [
      {
        productId: 2,
        quantity: 2,
        price: 12.99,
      },
      {
        productId: 3,
        quantity: 1,
        price: 9.99,
      },
    ],
    total: 35.97,
    status: "processing",
    createdAt: "2024-01-06",
  },
];

export const mockProductCategories: ProductCategory[] = [
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

// Mock API Functions
export const mockApi = {
  // // User API
  // users: {
  //   getAll: async (): Promise<User[]> => {
  //     return new Promise((resolve) => {
  //       setTimeout(() => resolve(mockUsersWithPassword.map(toUser)), 500);
  //     });
  //   },
  //   getById: async (id: number): Promise<User | undefined> => {
  //     return new Promise((resolve) => {
  //       setTimeout(() => {
  //         const userWithPassword = mockUsersWithPassword.find(u => u.id === id);
  //         resolve(userWithPassword ? toUser(userWithPassword) : undefined);
  //       }, 500);
  //     });
  //   },
  //   create: async (userData: Omit<User, 'id' | 'createdAt'>, password?: string): Promise<User> => {
  //     return new Promise((resolve, reject) => {
  //       // Check for duplicate email
  //       if (mockUsersWithPassword.some(u => u.email === userData.email)) {
  //         reject(new Error('Email already exists'));
  //         return;
  //       }

  //       // Set default values for new users
  //       const newUserWithPassword: UserWithPassword = {
  //         ...userData,
  //         id: mockUsersWithPassword.length + 1,
  //         createdAt: new Date().toISOString().split('T')[0],
  //         role: userData.role || 'user',
  //         status: userData.status || 'active',
  //         password: password || '' // Use provided password or empty string
  //       };

  //       mockUsersWithPassword.push(newUserWithPassword);
  //       setTimeout(() => resolve(toUser(newUserWithPassword)), 500);
  //     });
  //   },
  //   update: async (id: number, userData: Partial<User>): Promise<User | undefined> => {
  //     return new Promise((resolve, reject) => {
  //       const index = mockUsersWithPassword.findIndex(user => user.id === id);
  //       if (index !== -1) {
  //         // Check if email is being updated and if it already exists
  //         if (userData.email && userData.email !== mockUsersWithPassword[index].email) {
  //           if (mockUsersWithPassword.some(u => u.email === userData.email)) {
  //             reject(new Error('Email already exists'));
  //             return;
  //           }
  //         }

  //         const updatedUserWithPassword = { ...mockUsersWithPassword[index], ...userData };
  //         mockUsersWithPassword[index] = updatedUserWithPassword;
  //         setTimeout(() => resolve(toUser(updatedUserWithPassword)), 500);
  //       } else {
  //         setTimeout(() => resolve(undefined), 500);
  //       }
  //     });
  //   },
  //   delete: async (id: number): Promise<boolean> => {
  //     return new Promise((resolve) => {
  //       const index = mockUsersWithPassword.findIndex(user => user.id === id);
  //       if (index !== -1) {
  //         mockUsersWithPassword.splice(index, 1);
  //         setTimeout(() => resolve(true), 500);
  //       } else {
  //         setTimeout(() => resolve(false), 500);
  //       }
  //     });
  //   },
  // },

  // Product API
  // products: {
  //   getAll: async (): Promise<Product[]> => {
  //     return new Promise((resolve) => {
  //       setTimeout(() => resolve(mockProducts), 500);
  //     });
  //   },
  //   getById: async (id: number): Promise<Product | undefined> => {
  //     return new Promise((resolve) => {
  //       setTimeout(() => resolve(mockProducts.find(product => product.id === id)), 500);
  //     });
  //   },
  //   getByCategory: async (category: string): Promise<Product[]> => {
  //     return new Promise((resolve) => {
  //       setTimeout(() => resolve(mockProducts.filter(product => product.category === category)), 500);
  //     });
  //   },
  //   create: async (product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> => {
  //     return new Promise((resolve) => {
  //       const newProduct: Product = {
  //         ...product,
  //         id: mockProducts.length + 1,
  //         createdAt: new Date().toISOString().split('T')[0],
  //       };
  //       mockProducts.push(newProduct);
  //       setTimeout(() => resolve(newProduct), 500);
  //     });
  //   },
  //   update: async (id: number, productData: Partial<Product>): Promise<Product | undefined> => {
  //     return new Promise((resolve) => {
  //       const index = mockProducts.findIndex(product => product.id === id);
  //       if (index !== -1) {
  //         mockProducts[index] = { ...mockProducts[index], ...productData };
  //         setTimeout(() => resolve(mockProducts[index]), 500);
  //       } else {
  //         setTimeout(() => resolve(undefined), 500);
  //       }
  //     });
  //   },
  //   delete: async (id: number): Promise<boolean> => {
  //     return new Promise((resolve) => {
  //       const index = mockProducts.findIndex(product => product.id === id);
  //       if (index !== -1) {
  //         mockProducts.splice(index, 1);
  //         setTimeout(() => resolve(true), 500);
  //       } else {
  //         setTimeout(() => resolve(false), 500);
  //       }
  //     });
  //   },
  // },

  // Order API
  orders: {
    getAll: async (): Promise<Order[]> => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(mockOrders), 500);
      });
    },
    getById: async (id: number): Promise<Order | undefined> => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(mockOrders.find(order => order.id === id)), 500);
      });
    },
    getByUserId: async (userId: number): Promise<Order[]> => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(mockOrders.filter(order => order.userId === userId)), 500);
      });
    },
    create: async (order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> => {
      return new Promise((resolve) => {
        const newOrder: Order = {
          ...order,
          id: mockOrders.length + 1,
          createdAt: new Date().toISOString().split('T')[0],
        };
        mockOrders.push(newOrder);
        setTimeout(() => resolve(newOrder), 500);
      });
    },
    update: async (id: number, orderData: Partial<Order>): Promise<Order | undefined> => {
      return new Promise((resolve) => {
        const index = mockOrders.findIndex(order => order.id === id);
        if (index !== -1) {
          mockOrders[index] = { ...mockOrders[index], ...orderData };
          setTimeout(() => resolve(mockOrders[index]), 500);
        } else {
          setTimeout(() => resolve(undefined), 500);
        }
      });
    },
  },

  // Categories API
  categories: {
    getAll: async (): Promise<ProductCategory[]> => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(mockProductCategories), 500);
      });
    },
  },

  // Auth API
  auth: {
    // login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    //   return new Promise((resolve, reject) => {
    //     setTimeout(() => {
    //       const userWithPassword = mockUsersWithPassword.find(
    //         u => u.email === email && u.password === password
    //       );
    //       if (userWithPassword) {
    //         const token = `mock_token_${Date.now()}`;
    //         resolve({ token, user: toUser(userWithPassword) });
    //       } else {
    //         reject(new Error('Invalid credentials'));
    //       }
    //     }, 500);
    //   });
    // },
    // register: async (username: string, email: string, password: string): Promise<User> => {
    //   try {
    //     // Use users.create with default role and status for new registrations
    //     return await mockApi.users.create({
    //       username,
    //       email,
    //       role: 'user',
    //       status: 'active'
    //     }, password);
    //   } catch (error) {
    //     throw error;
    //   }
    // },
  },
};
