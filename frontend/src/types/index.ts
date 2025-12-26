export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  isAdmin: boolean;
  totalSales: number;
  totalPurchases: number;
  createdAt: string;
  averageRating?: number;
  reviewCount?: number;
  about?: string;
  location?: string;
  phone?: string;
  website?: string;
}

export interface Review {
  _id: string;
  product: string;
  reviewer: {
    _id: string;
    name: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  size: string;
  gender: 'men' | 'women' | 'unisex';
  category: string;
  condition: 'new' | 'like-new' | 'good' | 'fair';
  location: string;
  images: string[];
  seller: User;
  status: 'pending' | 'approved' | 'rejected' | 'sold';
  createdAt: string;
  averageRating?: number;
  reviewCount?: number;
  views?: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}
