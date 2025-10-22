import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query || !query.trim()) {
      return NextResponse.json({ products: [] });
    }

    const { db } = await connectToDatabase();
    const searchTerm = query.toLowerCase().trim();
    
    // Search in database products
    const dbProducts = await db.collection('products').find({
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { brand: { $regex: searchTerm, $options: 'i' } },
        { category: { $regex: searchTerm, $options: 'i' } },
        { subcategory: { $regex: searchTerm, $options: 'i' } }
      ]
    }).toArray();

    // Transform database products
    const transformedDbProducts = dbProducts.map(product => ({
      id: product._id.toString(),
      name: product.name,
      price: product.discountedPrice || product.price,
      originalPrice: product.discountedPrice ? product.price : null,
      image: product.image,
      brand: product.brand,
      category: product.category,
      subcategory: product.subcategory,
      description: product.description,
      stock: product.stock,
      deliveryCharge: 50,
      createdAt: product.createdAt
    }));

    return NextResponse.json({ 
      products: transformedDbProducts,
      total: transformedDbProducts.length 
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}