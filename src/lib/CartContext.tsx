"use client";

import * as React from "react";
import type { Product } from "@/lib/types";

interface CartItem extends Product {
  quantity: number;
}

interface GlobalSettings {
  delivery_charge: number;
  cod_charge: number;
  platform_fee_percent: number;
  free_delivery_threshold: number;
  rto_penalty_charge: number;
}

interface ChargesBreakdown {
  productCost: number;
  packingCharges: number;
  deliveryCharges: number;
  platformFees: number;
  codCharges: number;
  grandTotal: number;
  isFreeDelivery: boolean;
  hasCustomCharges: boolean;
}

interface CartContextType {
  cart: CartItem[];
  settings: GlobalSettings;
  paymentMethod: 'prepaid' | 'cod';
  setPaymentMethod: (method: 'prepaid' | 'cod') => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  clearCart: () => void;
  getProductCost: () => number;
  getChargesBreakdown: () => ChargesBreakdown;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: GlobalSettings = {
  delivery_charge: 80,
  cod_charge: 40,
  platform_fee_percent: 5,
  free_delivery_threshold: 2000,
  rto_penalty_charge: 100
};

const CartContext = React.createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [settings, setSettings] = React.useState<GlobalSettings>(defaultSettings);
  const [paymentMethod, setPaymentMethod] = React.useState<'prepaid' | 'cod'>('prepaid');
  const [settingsLoaded, setSettingsLoaded] = React.useState(false);

  // Fetch global settings on mount
  React.useEffect(() => {
    if (!settingsLoaded) {
      refreshSettings();
    }
  }, [settingsLoaded]);

  const refreshSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();

      if (data.success && data.settings) {
        setSettings({
          delivery_charge: parseFloat(data.settings.delivery_charge) || 80,
          cod_charge: parseFloat(data.settings.cod_charge) || 40,
          platform_fee_percent: parseFloat(data.settings.platform_fee_percent) || 5,
          free_delivery_threshold: parseFloat(data.settings.free_delivery_threshold) || 2000,
          rto_penalty_charge: parseFloat(data.settings.rto_penalty_charge) || 100
        });
      }
      setSettingsLoaded(true);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      setSettingsLoaded(true);
    }
  };

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const increaseQuantity = (productId: string) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (productId: string) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity - 1) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Helper to get numeric price from Product
  const getNumericPrice = (price: number | { original: number; discounted?: number }): number => {
    if (typeof price === 'number') return price;
    return price?.discounted || price?.original || 0;
  };

  // Get total product cost (price × quantity)
  const getProductCost = (): number => {
    return cart.reduce((total, item) => {
      const price = getNumericPrice(item.price);
      return total + (price * item.quantity);
    }, 0);
  };

  // HIERARCHY-BASED CHARGE CALCULATION
  // Logic: Product Override > Global Settings
  const getChargesBreakdown = (): ChargesBreakdown => {
    const productCost = getProductCost();
    let hasCustomCharges = false;

    // Packing charges: sum of (packingCostPerUnit × quantity) for each item
    const packingCharges = cart.reduce((total, item) => {
      const packingCost = item.packingCostPerUnit || 0;
      return total + (packingCost * item.quantity);
    }, 0);

    // HIERARCHY: Calculate delivery charge with product-level overrides
    // If ANY product has custom charges, calculate weighted delivery
    let deliveryCharges = 0;
    const isFreeDelivery = productCost >= settings.free_delivery_threshold;

    if (!isFreeDelivery) {
      // Check if any product has custom delivery charge
      const customDeliveryItems = cart.filter(
        (item: any) => item.useGlobalCharges === false && item.customDeliveryCharge
      );

      if (customDeliveryItems.length > 0) {
        hasCustomCharges = true;
        // Use maximum custom delivery charge from products with overrides
        // Plus global for products without overrides
        const maxCustomDelivery = Math.max(
          ...customDeliveryItems.map((item: any) => parseFloat(item.customDeliveryCharge) || 0)
        );
        const hasGlobalItems = cart.some((item: any) => item.useGlobalCharges !== false);

        // Take the higher of custom or global if mixed
        deliveryCharges = hasGlobalItems
          ? Math.max(maxCustomDelivery, settings.delivery_charge)
          : maxCustomDelivery;
      } else {
        deliveryCharges = settings.delivery_charge;
      }
    }

    // Platform fee (percentage of product cost)
    const platformFees = Math.round((productCost * settings.platform_fee_percent) / 100);

    // COD charges (only if COD payment method is selected)
    const codCharges = paymentMethod === 'cod' ? settings.cod_charge : 0;

    // Grand total
    const grandTotal = productCost + packingCharges + deliveryCharges + platformFees + codCharges;

    return {
      productCost,
      packingCharges,
      deliveryCharges,
      platformFees,
      codCharges,
      grandTotal,
      isFreeDelivery,
      hasCustomCharges
    };
  };

  const value = {
    cart,
    settings,
    paymentMethod,
    setPaymentMethod,
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    getProductCost,
    getChargesBreakdown,
    refreshSettings
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = React.useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
