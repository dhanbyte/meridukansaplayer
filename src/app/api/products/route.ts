import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  console.log('=== PRODUCTS API (SUPABASE) ===');

  try {
    if (!supabase) {
      console.log('Supabase not configured, returning empty');
      return NextResponse.json({ products: [] });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let query = supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data: products, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    // Normalize to frontend format
    const normalizedProducts = (products || []).map((p: any) => ({
      _id: p.id,
      id: p.id,
      name: p.name,
      sku: p.sku,
      price: p.price,
      mrp: p.mrp,
      description: p.description,
      image: p.image_url,
      category: p.category,
      stock: p.stock,
      weightKg: p.weight_kg,
      isActive: p.is_active,
      createdAt: p.created_at
    }));

    console.log(`Found ${normalizedProducts.length} products`);
    return NextResponse.json({ products: normalizedProducts });

  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json({ products: [], error: 'Failed to fetch products' });
  }
}

export async function POST(request: Request) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const productData = await request.json();

    const newProduct = {
      name: productData.name,
      sku: productData.sku,
      price: productData.price || 0,
      mrp: productData.mrp,
      description: productData.description,
      image_url: productData.image,
      category: productData.category,
      stock: productData.stock || 0,
      weight_kg: productData.weightKg || 0.5,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('products')
      .insert([newProduct])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      product: {
        _id: data.id,
        ...productData,
        createdAt: data.created_at
      }
    });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const { id, ...updates } = await request.json();

    const supabaseUpdates: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.name) supabaseUpdates.name = updates.name;
    if (updates.sku) supabaseUpdates.sku = updates.sku;
    if (updates.price !== undefined) supabaseUpdates.price = updates.price;
    if (updates.mrp !== undefined) supabaseUpdates.mrp = updates.mrp;
    if (updates.description) supabaseUpdates.description = updates.description;
    if (updates.image) supabaseUpdates.image_url = updates.image;
    if (updates.category) supabaseUpdates.category = updates.category;
    if (updates.stock !== undefined) supabaseUpdates.stock = updates.stock;
    if (updates.isActive !== undefined) supabaseUpdates.is_active = updates.isActive;

    const { error } = await supabase
      .from('products')
      .update(supabaseUpdates)
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const { id } = await request.json();

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}