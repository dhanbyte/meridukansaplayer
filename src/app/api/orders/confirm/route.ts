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

    // --- Shopify Sync Logic ---
    if (trackingId && trackingId.trim() && currentOrder.order_id?.startsWith('SHP-')) {
      try {
        const shopifyOrderId = currentOrder.order_id.replace('SHP-', '');
        
        // Find the partner credentials
        const { data: partner } = await supabase
          .from('users')
          .select('*')
          .eq('partner_id', currentOrder.partner_id)
          .single();

        if (partner && partner.shopify_is_connected) {
          console.log(`[Shopify Sync] Updating fulfillment for order ${shopifyOrderId}`);
          
          // 1. Get fulfillment orders for this order
          const foResp = await fetch(`https://${partner.shopify_store_url}/admin/api/2024-01/orders/${shopifyOrderId}/fulfillment_orders.json`, {
            headers: { 'X-Shopify-Access-Token': partner.shopify_access_token }
          });
          const foData = await foResp.json();
          
          if (foResp.ok && foData.fulfillment_orders?.length > 0) {
            const fulfillmentOrderId = foData.fulfillment_orders[0].id;
            
            // 2. Create fulfillment
            const fResp = await fetch(`https://${partner.shopify_store_url}/admin/api/2024-01/fulfillments.json`, {
              method: 'POST',
              headers: { 
                'X-Shopify-Access-Token': partner.shopify_access_token,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                fulfillment: {
                  message: "Order fulfilled via Shopwave Panel",
                  notify_customer: true,
                  tracking_info: {
                    number: trackingId.trim(),
                    url: `https://shipbhai.com/`, // Use shipbhai tracking
                    company: "Shipbhai"
                  },
                  line_items_by_fulfillment_order: [
                    {
                      fulfillment_order_id: fulfillmentOrderId,
                      fulfillment_order_line_items: foData.fulfillment_orders[0].line_items.map((li: any) => ({
                        id: li.id,
                        quantity: li.quantity
                      }))
                    }
                  ]
                }
              })
            });
            
            const fData = await fResp.json();
            if (fResp.ok) {
              console.log(`[Shopify Sync] Successfully fulfilled order ${shopifyOrderId}`);
            } else {
              console.error(`[Shopify Sync] Fulfillment failed:`, fData);
            }
          }
        }
      } catch (shpError) {
        console.error('[Shopify Sync] Critical error:', shpError);
        // We don't fail the local update if Shopify sync fails, just log it.
      }
    }
    // --- End Shopify Sync ---

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
