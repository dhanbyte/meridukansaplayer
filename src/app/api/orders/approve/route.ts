import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    // Get order status
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('status')
      .eq('id', id)
      .single();

    if (fetchError || !order) {
      // Fallback: Check if it's 'shopify_orders' just in case schema differs from assumption
      // But assuming 'orders' is the correct one based on schema.sql
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Allow approving from draft or pending status
    if (order.status !== 'draft' && order.status !== 'pending') {
      return NextResponse.json({
        error: `Cannot approve order with status: ${order.status}. Only draft or pending orders can be approved.`
      }, { status: 400 });
    }

    // Update to pending (submit for approval)
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'confirmed',
        updated_at: new Date().toISOString(),
        confirmed_at: new Date().toISOString()
        // submitted_at removed as it's not in schema
      })
      .eq('id', id);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, message: 'Order submitted for admin approval' });
  } catch (error: any) {
    console.error('Approve error:', error);
    return NextResponse.json({
      error: error.message || 'Failed to approve order'
    }, { status: 500 });
  }
}
