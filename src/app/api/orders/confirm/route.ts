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

    // Define allowed statuses for different operations
    // Order Flow: pending → confirmed → in_transit → delivered
    // Also allow: draft → pending/confirmed
    const allowedForConfirm = ['draft', 'pending', 'confirmed'];
    const allowedForTrackingUpdate = ['confirmed', 'in_transit', 'dispatched'];

    // Check if we can process this order
    const canConfirm = allowedForConfirm.includes(currentOrder.status);
    const canUpdateTracking = allowedForTrackingUpdate.includes(currentOrder.status);

    if (!canConfirm && !canUpdateTracking) {
      return NextResponse.json({
        error: `Cannot process order with status: ${currentOrder.status}. Order must be in pending, confirmed, or in_transit status.`
      }, { status: 400 });
    }

    // Build update data based on current status and request
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Status transition logic
    if (currentOrder.status === 'draft') {
      // draft → pending (or confirmed if approving)
      updateData.status = 'pending';
    } else if (currentOrder.status === 'pending' && !trackingId) {
      // pending → confirmed (approve without tracking)
      updateData.status = 'confirmed';
      updateData.confirmed_at = new Date().toISOString();
    } else if (currentOrder.status === 'pending' && trackingId) {
      // pending → in_transit (approve with tracking directly)
      updateData.status = 'in_transit';
      updateData.confirmed_at = new Date().toISOString();
      updateData.in_transit_at = new Date().toISOString();
      updateData.tracking_id = trackingId.trim();
    } else if (currentOrder.status === 'confirmed' && trackingId) {
      // confirmed → in_transit (add tracking)
      updateData.status = 'in_transit';
      updateData.in_transit_at = new Date().toISOString();
      updateData.tracking_id = trackingId.trim();
    } else if ((currentOrder.status === 'in_transit' || currentOrder.status === 'dispatched') && trackingId) {
      // Already in_transit, just update tracking ID
      updateData.tracking_id = trackingId.trim();
      console.log('[Confirm] Updating tracking ID for in_transit order');
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
