"use client";
import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/CartContext";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft } from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [product, setProduct] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        const allProducts = data.products || [];
        const foundProduct = allProducts.find((p: any) => p.id === params.id);
        setProduct(foundProduct);
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      toast({
        title: "Added to cart!",
        description: `${product.name} has been added to your cart.`,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Product not found</p>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Button 
        onClick={() => router.back()} 
        variant="outline" 
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Image
            src={product.image || '/placeholder.jpg'}
            alt={product.name}
            width={500}
            height={500}
            className="w-full rounded-lg object-cover"
            unoptimized
          />
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{product.name}</h1>
            {product.brand && (
              <p className="text-gray-600 mt-2">Brand: {product.brand}</p>
            )}
          </div>

          <div className="flex items-baseline gap-4">
            <span className="text-3xl font-bold text-green-600">
              ₹{product.price}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xl text-gray-500 line-through">
                ₹{product.originalPrice}
              </span>
            )}
          </div>

          {product.description && (
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-700">{product.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            {product.category && (
              <div>
                <span className="font-medium">Category:</span>
                <p className="text-gray-600">{product.category}</p>
              </div>
            )}
            {product.subcategory && (
              <div>
                <span className="font-medium">Subcategory:</span>
                <p className="text-gray-600">{product.subcategory}</p>
              </div>
            )}
            <div>
              <span className="font-medium">Stock:</span>
              <p className="text-gray-600">{product.stock || product.quantity || 'N/A'}</p>
            </div>
            {product.sku && (
              <div>
                <span className="font-medium">SKU:</span>
                <p className="text-gray-600">{product.sku}</p>
              </div>
            )}
          </div>

          <Button
            onClick={handleAddToCart}
            className="w-full bg-red-500 hover:bg-red-600 text-lg py-3"
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}