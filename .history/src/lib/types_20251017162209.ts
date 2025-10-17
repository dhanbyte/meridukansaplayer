export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  price: {
    original: number;
    discounted?: number;
    currency?: string;
  };
  quantity: number;
  image: string;
  extraImages?: string[];
  description: string;
  shortDescription?: string;
  features?: string[];
  ratings: {
    average: number;
    count: number;
  };
  taxPercent?: number;
  sku?: string;
  specifications?: Record<string, string>;
  isCustomizable?: boolean;
  tags?: string[];
}


export interface Partner {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  address?: string;
  bankDetails: {
    bankName: string;
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
  };
  walletBalance: number;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface Order {
    id?: string;
    _id?: string;
    partnerId: string;
    customerName: string;
    customerPhone: string;
    shippingAddress: string;
    productSku: string;
    productName?: string;
    quantity: number;
    paymentMethod: string;
    status: 'Pending' | 'Accepted' | 'Rejected' | 'Shipped' | 'Delivered' | 'Cancelled';
    trackingId?: string;
    amount: number;
    createdAt: string;
}

export interface RechargeRequest {
  id: string;
  userId: string;
  amount: number;
  screenshotUrl: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestDate: any; // Timestamp
}

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: 'user' | 'admin' | 'partner' | 'customer';
  status: 'Active' | 'Inactive';
  createdAt: Date;
  uid?: string;
  walletBalance?: number;
  address?: string;
  profilePhoto?: string;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    accountHolder: string;
  };
  isActive?: boolean;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  orderId?: string;
  createdAt: Date;
  status: 'completed' | 'pending' | 'failed';
}
