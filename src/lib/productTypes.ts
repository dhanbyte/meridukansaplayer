export interface SimpleProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  weight?: number;
  category: string;
}