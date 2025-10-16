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
