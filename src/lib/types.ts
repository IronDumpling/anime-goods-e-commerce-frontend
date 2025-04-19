

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