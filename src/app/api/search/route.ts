import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || !query.trim()) {
      return NextResponse.json({ products: [] });
    }

    if (!supabase) {
      return NextResponse.json({ products: [], error: 'Supabase not configured' });
    }

    const searchTerm = `%${query.toLowerCase().trim()}%`;

    const { data: dbProducts, error } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},category.ilike.${searchTerm}`);

    if (error) throw error;

    // Transform database products
    const transformedDbProducts = (dbProducts || []).map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.mrp,
      image: product.image_url,
      brand: 'Generic', // Not in schema
      category: product.category,
      subcategory: '',
      description: product.description,
      stock: product.stock,
      deliveryCharge: 50,
      createdAt: product.created_at
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