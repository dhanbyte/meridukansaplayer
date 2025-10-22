import type { Product } from "./types";
import { TECH_PRODUCTS } from "./tech";
import { HOME_PRODUCTS } from "./home";
import { NEWARRIVALS_PRODUCTS as NEW_ARRIVALS } from "./newarrivals";

// Combine all products from different categories
export const ALL_PRODUCTS: Product[] = [
  ...TECH_PRODUCTS,
  ...HOME_PRODUCTS,
  ...NEW_ARRIVALS
];

// Keep individual exports for specific category filtering
export const TECH_PRODUCTS_EXPORT = TECH_PRODUCTS;
export const HOME_PRODUCTS_EXPORT = HOME_PRODUCTS;
export const NEWARRIVALS_PRODUCTS: Product[] = [
  
    {
      id: 'P_HOME_PE_01',
      slug: 'premium-7-rose-dhoop-sticks',
      name: 'Premium 7 Rose Dhoop Sticks (Jar Pack / 100grams)',
      brand: 'LT',
      category: 'Home',
      subcategory: 'Puja-Essentials',
      price: { original: 190, discounted: 117, currency: '₹' },
      quantity: 100,
      image: 'https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/Pooja%20Essential%20Pooja%20Essentials/1/1.webp?updatedAt=1756551012208',
      extraImages: [
        'https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/Pooja%20Essential%20Pooja%20Essentials/1/3.webp?updatedAt=1756551077168',
        'https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/Pooja%20Essential%20Pooja%20Essentials/1/2.webp?updatedAt=1756551077346',
        'https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/Pooja%20Essential%20Pooja%20Essentials/1/4.webp?updatedAt=1756551077442',
        'https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/Pooja%20Essential%20Pooja%20Essentials/1/cUllWiugL8.webp?updatedAt=1756551077429'
      ],
      description: 'A premium blend of Rose fragrances for a delightful aroma. Crafted from natural, plant-based ingredients for a refreshing and long-lasting scent. The soothing and uplifting aroma can help create a relaxing and inviting ambience.',
      shortDescription: 'Premium blend of Rose fragrances for a delightful aroma.',
      features: [
        'Fragrant Blend',
        'Natural Ingredients',
        'Versatile Usage',
        'Mood-Enhancing',
        'Concentrated Formula'
      ],
      ratings: { average: 4.8, count: 47 },
      taxPercent: 18,
      sku: 'DSIN 48535',
      specifications: { 'Country of Origin': 'India' }
    },
   
];

    