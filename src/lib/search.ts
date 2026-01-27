import type { Product } from './types';
import { ALL_PRODUCTS } from './products';

// Use products from products.ts

// Remove duplicates based on product ID
export const UNIQUE_PRODUCTS = ALL_PRODUCTS.filter((product, index, self) => 
  index === self.findIndex(p => p.id === product.id)
);

export function searchProducts(query: string): Product[] {
  if (!query.trim()) return [];
  
  const searchTerm = query.toLowerCase().trim();
  
  return UNIQUE_PRODUCTS.filter(product => 
    product.name.toLowerCase().includes(searchTerm) ||
    product.description.toLowerCase().includes(searchTerm) ||
    product.shortDescription?.toLowerCase().includes(searchTerm) ||
    product.brand.toLowerCase().includes(searchTerm) ||
    product.category.toLowerCase().includes(searchTerm) ||
    product.subcategory?.toLowerCase().includes(searchTerm) ||
    product.features?.some(feature => feature.toLowerCase().includes(searchTerm))
  ).sort((a, b) => {
    // Prioritize exact matches in name
    const aNameMatch = a.name.toLowerCase().includes(searchTerm);
    const bNameMatch = b.name.toLowerCase().includes(searchTerm);
    if (aNameMatch && !bNameMatch) return -1;
    if (!aNameMatch && bNameMatch) return 1;
    return 0;
  });
}

export function getSearchSuggestions(query: string, limit: number = 5): Product[] {
  return searchProducts(query).slice(0, limit);
}

export function getProductsByCategory(category: string): Product[] {
  return UNIQUE_PRODUCTS.filter(product => 
    product.category.toLowerCase() === category.toLowerCase()
  );
}

export function getProductsByBrand(brand: string): Product[] {
  return UNIQUE_PRODUCTS.filter(product => 
    product.brand.toLowerCase() === brand.toLowerCase()
  );
}