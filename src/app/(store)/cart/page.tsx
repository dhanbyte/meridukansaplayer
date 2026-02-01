"use client";
import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Package,
  Truck,
  CreditCard,
  Percent,
  Gift,
  Receipt,
  Trash2
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useCart } from "@/lib/CartContext";
import { useAuth } from "@/lib/AuthContext";

interface ShippingInfo {
  customerName: string;
  customerPhone: string;
  address: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  sku?: string;
  productSku?: string;
  packingCostPerUnit?: number;
}

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    addToCart,
    paymentMethod,
    setPaymentMethod,
    getChargesBreakdown,
    settings
  } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddressDialogOpen, setIsAddressDialogOpen] = React.useState(false);
  const [shippingInfo, setShippingInfo] = React.useState<ShippingInfo | null>(null);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [productSearch, setProductSearch] = React.useState("");
  const [isProductDialogOpen, setIsProductDialogOpen] = React.useState(false);
  const [isOrderPlacing, setIsOrderPlacing] = React.useState(false);

  // State for the address form fields
  const [formName, setFormName] = React.useState("");
  const [formPhone, setFormPhone] = React.useState("");
  const [formAddress, setFormAddress] = React.useState("");

  // Fetch products for search
  React.useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Get charges breakdown
  const charges = getChargesBreakdown();

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPhone || !formAddress) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill out all address fields.",
      });
      return;
    }
    setShippingInfo({
      customerName: formName,
      customerPhone: formPhone,
      address: formAddress,
    });
    setIsAddressDialogOpen(false);
    toast({
      title: "Address Saved",
      description: "Your shipping address has been updated.",
    });
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Not Logged In",
        description: "You need to be logged in to place an order.",
      });
      return;
    }
    if (cart.length === 0) {
      toast({
        variant: "destructive",
        title: "Empty Cart",
        description: "You cannot place an order with an empty cart.",
      });
      return;
    }
    if (!shippingInfo) {
      toast({
        variant: "destructive",
        title: "No Address",
        description: "Please add a shipping address before placing an order.",
      });
      return;
    }

    setIsOrderPlacing(true);

    try {
      const getNumericPrice = (p: any) => {
        if (typeof p === 'number') return p;
        if (p && typeof p === 'object') return p.discounted || p.original || 0;
        return 0;
      };

      const orderData = {
        partnerId: user.partnerId || user.partner_id || user.id || user._id,
        partnerName: user.name || user.username || 'Partner',
        customerName: shippingInfo.customerName,
        customerPhone: shippingInfo.customerPhone,
        shippingAddress: shippingInfo.address,
        items: cart.map(item => {
          const itemPrice = getNumericPrice(item.price);
          return {
            productId: item.id,
            productName: item.name,
            productSku: item.productSku || item.sku || 'N/A',
            quantity: item.quantity,
            price: itemPrice,
            packingCost: item.packingCostPerUnit || 0,
            total: itemPrice * item.quantity
          };
        }),
        // Include all charges in order
        charges: {
          productCost: charges.productCost,
          packingCharges: charges.packingCharges,
          deliveryCharges: charges.deliveryCharges,
          platformFees: charges.platformFees,
          codCharges: charges.codCharges
        },
        totalAmount: charges.grandTotal,
        paymentMethod: paymentMethod,
        status: 'draft',
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        toast({ title: "Order Placed", description: "Your order has been placed successfully." });
        clearCart();
        setShippingInfo(null);
      } else {
        throw new Error('Failed to place order');
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Order Failed", description: "Could not place your order." });
    } finally {
      setIsOrderPlacing(false);
    }
  };

  const handleAddProduct = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      sku: product.sku || product.productSku || 'N/A',
      productSku: product.sku || product.productSku || 'N/A',
      packingCostPerUnit: product.packingCostPerUnit || 0,
      category: 'General',
    });
    setIsProductDialogOpen(false);
    setProductSearch("");
    toast({
      title: "Product Added",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
          <ShoppingBag className="h-8 w-8 text-blue-600" />
          Your Cart ({cart.length} items)
        </h1>
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your cart is empty.</h2>
          <p className="text-gray-600 mb-6">Add products to get started!</p>
          <Button onClick={() => setIsProductDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Search className="h-4 w-4 mr-2" />
            Add Products
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Add Product Button */}
            <div className="flex justify-between items-center mb-4">
              <Button onClick={() => setIsProductDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Search className="h-4 w-4 mr-2" />
                Add Products
              </Button>
              <Button variant="outline" onClick={() => clearCart()}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cart
              </Button>
            </div>

            {/* Cart Items */}
            <div className="space-y-4">
              {cart.map((item) => {
                const itemPrice = typeof item.price === 'number' ? item.price : (item.price?.discounted || item.price?.original || 0);
                return (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="rounded-md w-16 h-16 sm:w-20 sm:h-20 object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold line-clamp-2">{item.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-green-600 font-medium">{formatCurrency(itemPrice)}</span>
                            {item.packingCostPerUnit && item.packingCostPerUnit > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                +{formatCurrency(item.packingCostPerUnit)}/unit packing
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center">
                              <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => decreaseQuantity(item.id)}>
                                <Minus className="h-4 w-4" />
                              </Button>
                              <Input
                                type="number"
                                value={item.quantity}
                                readOnly
                                className="w-12 text-center mx-2 h-8"
                              />
                              <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => increaseQuantity(item.id)}>
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatCurrency(itemPrice * item.quantity)}</p>
                              <Button variant="link" className="p-0 h-auto text-red-500 text-xs" onClick={() => removeFromCart(item.id)}>
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Right Column: Order Details & Invoice */}
          <div className="space-y-4">
            {/* Shipping Address */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                {shippingInfo ? (
                  <div className="text-sm space-y-1">
                    <p className="font-medium">{shippingInfo.customerName}</p>
                    <p className="text-gray-600">{shippingInfo.customerPhone}</p>
                    <p className="text-gray-500">{shippingInfo.address}</p>
                    <Button variant="link" className="p-0 h-auto text-sm" onClick={() => setIsAddressDialogOpen(true)}>
                      Change Address
                    </Button>
                  </div>
                ) : (
                  <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="w-full">Add New Address</Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add Shipping Address</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSaveAddress}>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" value={formName} onChange={e => setFormName(e.target.value)} placeholder="Full Name" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder="Phone Number" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Textarea id="address" value={formAddress} onChange={e => setFormAddress(e.target.value)} placeholder="Full shipping address" required />
                          </div>
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button type="button" variant="secondary">Cancel</Button>
                          </DialogClose>
                          <Button type="submit">Save Address</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={(val) => setPaymentMethod(val as 'prepaid' | 'cod')}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="prepaid" id="prepaid" />
                    <Label htmlFor="prepaid" className="flex items-center gap-2">
                      Prepaid
                      {paymentMethod === 'prepaid' && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">No COD Charge</Badge>
                      )}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex items-center gap-2">
                      Cash On Delivery
                      {paymentMethod === 'cod' && (
                        <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">+{formatCurrency(settings.cod_charge)}</Badge>
                      )}
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Invoice Breakdown */}
            <Card className="bg-gradient-to-br from-slate-50 to-blue-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Invoice Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Product Cost */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4 text-gray-500" />
                    Product Cost
                  </div>
                  <span className="font-medium">{formatCurrency(charges.productCost)}</span>
                </div>

                {/* Packing Charges */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm">
                    <Gift className="h-4 w-4 text-gray-500" />
                    Packing Charges
                  </div>
                  <span className="font-medium text-gray-600">+ {formatCurrency(charges.packingCharges)}</span>
                </div>

                {/* Delivery Charges */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="h-4 w-4 text-gray-500" />
                    Delivery Charges
                    {charges.isFreeDelivery && (
                      <Badge className="text-xs bg-green-500">FREE</Badge>
                    )}
                  </div>
                  <span className={`font-medium ${charges.isFreeDelivery ? 'text-green-600 line-through' : 'text-gray-600'}`}>
                    {charges.isFreeDelivery ? formatCurrency(settings.delivery_charge) : `+ ${formatCurrency(charges.deliveryCharges)}`}
                  </span>
                </div>
                {!charges.isFreeDelivery && charges.productCost > 0 && (
                  <p className="text-xs text-gray-500 ml-6">
                    Free delivery on orders above {formatCurrency(settings.free_delivery_threshold)}
                  </p>
                )}

                {/* Handling Fees (Platform Fee) */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm">
                    <Percent className="h-4 w-4 text-gray-500" />
                    Handling Fees
                    <span className="text-xs text-gray-400">({settings.platform_fee_percent}%)</span>
                  </div>
                  <span className="font-medium text-gray-600">+ {formatCurrency(charges.platformFees)}</span>
                </div>

                {/* COD Charges */}
                {paymentMethod === 'cod' && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm">
                      <CreditCard className="h-4 w-4 text-orange-500" />
                      COD Charges
                    </div>
                    <span className="font-medium text-orange-600">+ {formatCurrency(charges.codCharges)}</span>
                  </div>
                )}

                <Separator className="my-3" />

                {/* Grand Total */}
                <div className="flex justify-between items-center bg-white rounded-lg p-3 shadow-sm">
                  <div className="text-base font-semibold">
                    GRAND TOTAL
                    <p className="text-xs font-normal text-gray-500">Vendor Payable Amount</p>
                  </div>
                  <span className="text-xl font-bold text-green-700">{formatCurrency(charges.grandTotal)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Place Order Button */}
            <Button
              className="w-full bg-slate-900 text-white hover:bg-slate-800 py-6 text-lg"
              onClick={handlePlaceOrder}
              disabled={isOrderPlacing}
            >
              {isOrderPlacing ? 'Placing Order...' : `Place Order - ${formatCurrency(charges.grandTotal)}`}
            </Button>
          </div>
        </div>
      )}

      {/* Add Product Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Products to Cart</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products by name..."
                className="pl-9"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No products found
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <div key={product.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={60}
                      height={60}
                      className="rounded-md object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm line-clamp-2">{product.name}</h4>
                      <div className="flex items-center gap-2">
                        <p className="text-green-600 font-semibold">{formatCurrency(product.price)}</p>
                        {product.packingCostPerUnit && product.packingCostPerUnit > 0 && (
                          <span className="text-xs text-gray-400">+{formatCurrency(product.packingCostPerUnit)} packing</span>
                        )}
                      </div>
                    </div>
                    <Button size="sm" onClick={() => handleAddProduct(product)}>
                      Add
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
