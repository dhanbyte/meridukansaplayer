import type { Product } from "../lib/types";
import { TECH_PRODUCTS } from "./tech";
import { HOME_PRODUCTS } from "./home";

export const NEWARRIVALS_PRODUCTS: Product[] = [
  ...TECH_PRODUCTS.filter(product => product.category === "New Arrivals"),
  ...HOME_PRODUCTS.filter(product => product.category === "New Arrivals"),
 
] 



