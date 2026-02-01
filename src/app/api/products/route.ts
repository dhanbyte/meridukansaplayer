import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    if (!supabase) {
      return NextResponse.json({ products: [], success: true });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const includePending = searchParams.get('includePending') === 'true';

    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    // Only filter by is_active if not including pending
    if (!includePending) {
      query = query.eq('is_active', true);
    }

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
      extraImages: p.extra_images || [],
      category: p.category,
      stock: p.stock,
      weight: p.weight_kg,
      packingCostPerUnit: p.packing_cost_per_unit || 0,
      useGlobalCharges: p.use_global_charges !== false,
      customDeliveryCharge: p.custom_delivery_charge,
      customRtoPenalty: p.custom_rto_penalty,
      isActive: p.is_active,
      status: p.is_active ? 'active' : 'pending',
      createdAt: p.created_at
    }));

    // Return with cache headers for better performance
    return NextResponse.json(
      { products: normalizedProducts, success: true },
      {
        headers: {
          'Cache-Control': 'private, max-age=10, stale-while-revalidate=30',
        },
      }
    );

  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json({ products: [], error: 'Failed to fetch products', success: false });
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
      sku: productData.sku || null,
      price: parseFloat(productData.price) || 0,
      mrp: productData.mrp ? parseFloat(productData.mrp) : null,
      description: productData.description || null,
      image_url: productData.image,
      extra_images: productData.extraImages || [],
      category: productData.category || 'General',
      stock: parseInt(productData.stock) || 0,
      weight_kg: parseFloat(productData.weight) || 0.5,
      packing_cost_per_unit: parseFloat(productData.packingCostPerUnit) || 10,
      use_global_charges: productData.useGlobalCharges !== false,
      custom_delivery_charge: productData.customDeliveryCharge || null,
      custom_rto_penalty: productData.customRtoPenalty || null,
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
        id: data.id,
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
    if (updates.sku !== undefined) supabaseUpdates.sku = updates.sku || null;
    if (updates.price !== undefined) supabaseUpdates.price = parseFloat(updates.price);
    if (updates.mrp !== undefined) supabaseUpdates.mrp = updates.mrp ? parseFloat(updates.mrp) : null;
    if (updates.description !== undefined) supabaseUpdates.description = updates.description;
    if (updates.image) supabaseUpdates.image_url = updates.image;
    if (updates.extraImages !== undefined) supabaseUpdates.extra_images = updates.extraImages;
    if (updates.category) supabaseUpdates.category = updates.category;
    if (updates.stock !== undefined) supabaseUpdates.stock = parseInt(updates.stock);
    if (updates.weight !== undefined) supabaseUpdates.weight_kg = parseFloat(updates.weight);
    if (updates.packingCostPerUnit !== undefined) supabaseUpdates.packing_cost_per_unit = parseFloat(updates.packingCostPerUnit);
    if (updates.useGlobalCharges !== undefined) supabaseUpdates.use_global_charges = updates.useGlobalCharges;
    if (updates.customDeliveryCharge !== undefined) supabaseUpdates.custom_delivery_charge = updates.customDeliveryCharge;
    if (updates.customRtoPenalty !== undefined) supabaseUpdates.custom_rto_penalty = updates.customRtoPenalty;
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
