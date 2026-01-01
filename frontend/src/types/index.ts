// User Types
export interface User {
  id: string;
  nom?: string; // Keeping for backward compatibility
  firstName?: string;
  lastName?: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'CLIENT';
  phoneNumber?: string;
  address?: string;
  active?: boolean;
  password?: string; // Used only for creating/updating users
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

// Product Types
export interface Product {
  id: string;
  nom: string;
  description: string;
  prix: number;
  currency?: string;
  imageUrl: string | null;
  additionalImages?: string[];
  categoryName: string;
  stockQuantity: number;
  source: 'INTERNAL' | 'EBAY' | 'AMAZON' | 'WALMART';
  ebayItemId?: string;
  itemWebUrl?: string;
  condition?: string;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EbayItem {
  itemId: string;
  title: string;
  shortDescription?: string;
  price?: {
    value: string;
    currency: string;
  };
  image?: {
    imageUrl: string;
  };
  additionalImages?: Array<{
    imageUrl: string;
  }>;
  categories?: Array<{
    categoryName: string;
  }>;
  itemWebUrl: string;
  condition?: string;
  itemLocation?: {
    city?: string;
    country?: string;
  };
}

// Order Types
export interface OrderItem {
  productId: string;
  productName?: string;
  productNom?: string; // Alias for productName
  quantity: number;
  price?: number;
  prixUnitaire?: number; // Alias for price
  sousTotal?: number;
  imageUrl?: string;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber?: string;
  items?: OrderItem[];
  orderItems?: OrderItem[]; // Alias for items
  total?: number;
  montantTotal?: number; // Alias for total
  status: 'PENDING' | 'PROCESSING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  shippingAddress?: Address;
  adresseLivraison?: string;
  createdAt: string;
  updatedAt?: string;
}


export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Cart Types
export interface CartItem {
  productId: string;
  quantity: number;
}

// Payment Types
export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  paymentMethod: string;
  createdAt: string;
}

export interface PayPalPaymentData {
  orderId: string;
  amount: number;
  currency: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

// Context Types
export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User; message?: string }>;
  signup: (userData: SignupData | any) => Promise<{ success: boolean; user?: User; message?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  error?: string | null;
  updateUser?: (updatedData: Partial<User>) => void;
}

export interface NotificationContextType {
  showNotification?: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  NotificationContainer: React.ComponentType;
}

// Component Props Types
export interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

