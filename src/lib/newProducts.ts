import type { Product } from "./types";

export const NEW_PRODUCTS: Product[] = [
  {
    id: "APEX_SOAP_DISPENSER_001",
    slug: "apex-push-it-soap-dispenser-300ml",
    name: "Apex Push It Soap Dispenser Approx 300ml (1 Pc)",
    brand: "Apex",
    category: "Home & Kitchen",
    subcategory: "Kitchen Accessories",
    price: {
      original: 70,
      discounted: 70,
      currency: "₹"
    },
    quantity: 300,
    image: "https://d3np62i3isvr1h.cloudfront.net/catalog/products/11713_apex_push_it_soap_dispenser_300ml/XA4kA1zZDELhLraxVjRJ8CZSjdIvATxIJKKBjDh2_thumb.jpeg",
    extraImages: [],
    description: "Apex Push It Soap Dispenser with approximately 300ml capacity. Perfect for kitchen and bathroom use with easy push mechanism for convenient soap dispensing.",
    shortDescription: "300ml capacity soap dispenser with push mechanism",
    features: [
      "300ml capacity",
      "Easy push mechanism",
      "Suitable for kitchen and bathroom",
      "Durable construction"
    ],
    ratings: {
      average: 4.5,
      count: 0
    },
    taxPercent: 18,
    sku: "11713_apex_push_it_soap_dispenser_300ml",
    specifications: {
      "Capacity": "300ml",
      "Material": "Plastic",
      "Type": "Push Dispenser"
    }
  },
  {
    id: "GLASS_OIL_DISPENSER_001", 
    slug: "glass-oil-dispenser-bottle-spray-200ml",
    name: "Glass Oil Dispenser Bottle Spray (1 Pc)",
    brand: "Generic",
    category: "Home & Kitchen", 
    subcategory: "Kitchen Accessories",
    price: {
      original: 78,
      discounted: 78,
      currency: "₹"
    },
    quantity: 200,
    image: "https://d3np62i3isvr1h.cloudfront.net/catalog/products/10228_cooking_spray_bottle_1pc/EinTdfApjuIVGkzzWNTpXGxDCJ4viVhPWlJBDHrD_thumb.jpeg",
    extraImages: [],
    description: "Glass Oil Dispenser Bottle with spray mechanism. Perfect for cooking oils, vinegar, and other liquid seasonings. Easy to use spray bottle for kitchen applications.",
    shortDescription: "Glass oil dispenser bottle with spray mechanism",
    features: [
      "Glass construction",
      "Spray mechanism",
      "Perfect for oils and vinegar", 
      "Easy to clean",
      "Kitchen essential"
    ],
    ratings: {
      average: 4.3,
      count: 0
    },
    taxPercent: 18,
    sku: "10228_cooking_spray_bottle_1pc",
    specifications: {
      "Material": "Glass",
      "Type": "Spray Bottle",
      "Usage": "Cooking oils and liquids"
    }
  }
];