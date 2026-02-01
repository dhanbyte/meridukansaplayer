import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Supabase-first API for orders
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const partnerId = searchParams.get('partnerId');
    const excludeDraft = searchParams.get('excludeDraft') === 'true';
    const status = searchParams.get('status');

    if (!supabase) {
      return NextResponse.json({
        orders: [],
        error: 'Supabase not configured'
      });
    }

    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    // Filter by partner
    if (partnerId) {
      query = query.eq('partner_id', partnerId);
    }

    // Exclude draft orders
    if (excludeDraft) {
      query = query.not('status', 'in', '("draft","pending")');
    }

    // Filter by status
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    // Fetch partners/users to get emails
    const { data: usersData } = await supabase
      .from('users')
      .select('partner_id, email');

    const emailMap = new Map();
    (usersData || []).forEach((u: any) => {
      emailMap.set(u.partner_id, u.email);
    });

    // Normalize Supabase orders to frontend format
    const normalizedOrders = (orders || []).map((order: any) => ({
      _id: order.id,
      orderId: order.order_id,
      orderNumber: order.order_number,
      partnerId: order.partner_id,
      partnerName: order.partner_name,
      partnerEmail: emailMap.get(order.partner_id) || '-',
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      shippingAddress: order.shipping_address,
      pincode: order.pincode,
      city: order.city,
      state: order.state,
      items: order.items || [],
      totalAmount: order.total_amount,
      sellingPrice: order.selling_price,
      profit: order.profit,
      paymentMethod: order.payment_method,
      status: order.status,
      trackingId: order.tracking_id,
      notes: order.notes,
      cancellation_reason: order.cancellation_reason,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      confirmedAt: order.confirmed_at,
      inTransitAt: order.in_transit_at,
      deliveredAt: order.delivered_at
    }));

    return NextResponse.json({ orders: normalizedOrders });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({
      orders: [],
      error: 'Database connection failed'
    });
  }
}

export async function POST(request: Request) {
  try {
    const orderData = await request.json();

    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const partnerId = (orderData.partnerId || 'GUEST').toString().slice(0, 20);
    const partnerName = (orderData.partnerName || 'Guest Partner').toString();

    // Generate order number with partnerId: VND001-ORD123456
    const partnerPrefix = partnerId.toUpperCase().replace(/\s+/g, '');

    const timestamp = Date.now();
    const shortTimestamp = timestamp.toString().slice(-8);
    const orderNumber = `${partnerPrefix}-ORD${shortTimestamp}`;

    const newOrder = {
      order_id: `ORD${timestamp}`,
      order_number: orderNumber,
      partner_id: partnerId,
      partner_name: partnerName,
      customer_name: orderData.customerName || 'N/A',
      customer_phone: orderData.customerPhone || 'N/A',
      shipping_address: orderData.shippingAddress || 'N/A',
      pincode: orderData.pincode || '',
      city: orderData.city || '',
      state: orderData.state || '',
      customer_state: orderData.customerState || orderData.state || '', // For analytics
      items: orderData.items || [],
      total_amount: Number(orderData.totalAmount) || 0,
      selling_price: Number(orderData.sellingPrice) || Number(orderData.totalAmount) || 0,
      profit: Number(orderData.profit) || 0,
      payment_method: orderData.paymentMethod || 'cod',
      status: orderData.status || 'draft',
      notes: orderData.notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('[Orders] Creating order:', orderNumber);

    const { data, error } = await supabase
      .from('orders')
      .insert([newOrder])
      .select()
      .single();

    if (error) {
      console.error('[Orders] Supabase insert error:', error);
      return NextResponse.json({
        error: error.message || 'Database insert failed',
        details: error
      }, { status: 500 });
    }

    // Return normalized order
    return NextResponse.json({
      success: true,
      order: {
        _id: data.id,
        orderId: data.order_id,
        orderNumber: data.order_number,
        ...orderData,
        createdAt: data.created_at
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...updates } = await request.json();

    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    // Map frontend fields to Supabase snake_case
    const supabaseUpdates: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.customerName) supabaseUpdates.customer_name = updates.customerName;
    if (updates.customerPhone) supabaseUpdates.customer_phone = updates.customerPhone;
    if (updates.shippingAddress) supabaseUpdates.shipping_address = updates.shippingAddress;
    if (updates.pincode) supabaseUpdates.pincode = updates.pincode;
    if (updates.totalAmount !== undefined) supabaseUpdates.total_amount = updates.totalAmount;
    if (updates.sellingPrice !== undefined) supabaseUpdates.selling_price = updates.sellingPrice;
    if (updates.profit !== undefined) supabaseUpdates.profit = updates.profit;
    if (updates.status) supabaseUpdates.status = updates.status;
    if (updates.trackingId !== undefined) supabaseUpdates.tracking_id = updates.trackingId;
    if (updates.notes !== undefined) supabaseUpdates.notes = updates.notes;
    if (updates.items) supabaseUpdates.items = updates.items;
    if (updates.cancellationReason !== undefined) supabaseUpdates.cancellation_reason = updates.cancellationReason;

    // Add timestamps based on status changes
    if (updates.status === 'confirmed') supabaseUpdates.confirmed_at = new Date().toISOString();
    if (updates.status === 'in_transit') supabaseUpdates.in_transit_at = new Date().toISOString();
    if (updates.status === 'delivered') supabaseUpdates.delivered_at = new Date().toISOString();
    if (updates.status === 'cancelled') supabaseUpdates.cancelled_at = new Date().toISOString();

    const { error } = await supabase
      .from('orders')
      .update(supabaseUpdates)
      .eq('id', id);

    if (error) {
      console.error('Supabase update error:', error);
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}