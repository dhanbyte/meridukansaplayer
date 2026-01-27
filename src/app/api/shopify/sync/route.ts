import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { shopUrl, accessToken, partnerId, partnerName } = await request.json();

    if (!shopUrl || !accessToken || !partnerId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Shopify Admin API URL
    const shopifyUrl = `https://${shopUrl}/admin/api/2024-01/orders.json?status=any&limit=50`;

    const response = await fetch(shopifyUrl, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: 'Shopify API error', details: errorData }, { status: response.status });
    }

    const { orders } = await response.json();

    // Transform Shopify orders to our format and save to Supabase
    const transformedOrders = orders.map((order: any) => ({
      partner_id: partnerId,
      partner_name: partnerName,
      shopify_order_id: order.id.toString(),
      customer_name: `${order.customer?.first_name || ''} ${order.customer?.last_name || ''}`.trim() || 'No Name',
      customer_phone: order.customer?.phone || order.shipping_address?.phone || '',
      shipping_address: `${order.shipping_address?.address1 || ''}, ${order.shipping_address?.city || ''}, ${order.shipping_address?.province || ''}, ${order.shipping_address?.zip || ''}, ${order.shipping_address?.country || ''}`,
      items: order.line_items.map((item: any) => ({
        product_id: item.product_id?.toString(),
        product_name: item.title,
        quantity: item.quantity,
        price: parseFloat(item.price),
        sku: item.sku
      })),
      total_amount: parseFloat(order.total_price),
      status: 'preview',
      created_at: new Date().toISOString(),
    }));

    // Insert into Supabase (using upsert on shopify_order_id to avoid duplicates)
    const { data, error } = await supabase
      .from('shopify_orders')
      .upsert(transformedOrders, { onConflict: 'shopify_order_id' });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to save orders to database', details: error }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: transformedOrders.length });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
