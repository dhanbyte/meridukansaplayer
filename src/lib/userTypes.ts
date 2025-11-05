export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  phone: string;
  address: string;
  bankDetails: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    accountHolderName: string;
  };
  createdAt: string;
  isActive: boolean;
}

export interface AdminUser {
  id: string;
  username: string;
  password: string;
  role: 'admin';
}