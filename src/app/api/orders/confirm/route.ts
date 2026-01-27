import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { id, trackingId } = await request.json();

    console.log('[Confirm] Processing order:', id, 'with tracking:', trackingId);

    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    // Get current order
    const { data: currentOrder, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !currentOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    console.log('[Confirm] Current order status:', currentOrder.status);

    // Allow confirming from pending or confirmed status
    if (currentOrder.status !== 'pending' && currentOrder.status !== 'confirmed') {
      return NextResponse.json({
        error: `Cannot confirm order with status: ${currentOrder.status}. Only pending or confirmed orders can be processed.`
      }, { status: 400 });
    }

    // Build update data based on current status
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // If it's pending, set to confirmed
    if (currentOrder.status === 'pending') {
      updateData.status = 'confirmed';
      updateData.confirmed_at = new Date().toISOString();
    }

    // If tracking ID is provided, set status to in_transit
    if (trackingId && trackingId.trim()) {
      updateData.tracking_id = trackingId.trim();
      updateData.status = 'in_transit';
      updateData.in_transit_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      console.error('[Confirm] Update error:', updateError);
      throw updateError;
    }

    console.log('[Confirm] Order updated successfully');

    return NextResponse.json({
      success: true,
      message: trackingId
        ? 'Order confirmed and tracking ID added'
        : 'Order confirmed successfully'
    });

  } catch (error) {
    console.error('[Confirm] Error:', error);
    return NextResponse.json({
      error: 'Failed to confirm order'
    }, { status: 500 });
  }
}
