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
  phone: string;
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  status: 'Active' | 'Inactive';
  uid: string;
}

export interface Order {
    id: string;
    partnerId: string;
    customerName: string;
    customerPhone: string;
    shippingAddress: string;
    productSku: string;
    quantity: number;
    paymentMethod: string;
    status: 'Pending' | 'Accepted' | 'Rejected' | 'Shipped' | 'Delivered' | 'Cancelled';
    trackingId?: string;
    amount: number;
    orderDate: any; // Using 'any' for Firebase ServerTimestamp
}

export interface RechargeRequest {
  id: string;
  userId: string;
  amount: number;
  screenshotUrl: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestDate: any; // Using 'any' for Firebase ServerTimestamp
}
