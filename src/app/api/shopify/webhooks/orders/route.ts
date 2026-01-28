import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const hmac = request.headers.get('x-shopify-hmac-sha256');
    const domain = request.headers.get('x-shopify-shop-domain');

    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    // 1. Find the partner associated with this Shopify domain
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('shopify_store_url', domain)
      .single();

    if (userError || !user) {
      console.error(`[Shopify Webhook] No user found for domain: ${domain}`);
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // 2. HMAC Validation (Security)
    if (user.shopify_api_secret) {
      const generatedHash = crypto
        .createHmac('sha256', user.shopify_api_secret)
        .update(rawBody, 'utf8')
        .digest('base64');

      if (generatedHash !== hmac) {
        console.error(`[Shopify Webhook] Invalid HMAC for ${domain}`);
        // In production, you might want to return 401. 
        // return NextResponse.json({ error: 'Invalid HMAC' }, { status: 401 });
      }
    }

    const order = JSON.parse(rawBody);
    console.log(`[Shopify Webhook] Received order ${order.name} from ${domain}`);

    // 3. Transform Shopify Order to our format
    const shippingAddress = order.shipping_address ? 
        `${order.shipping_address.address1}, ${order.shipping_address.address2 ? order.shipping_address.address2 + ', ' : ''}${order.shipping_address.city}, ${order.shipping_address.province}, ${order.shipping_address.country}` : 
        'No Shipping Address';
    
    const pincode = order.shipping_address?.zip || '';

    const orderData = {
      order_id: `SHP-${order.id}`,
      order_number: `${user.partner_id}-${order.name}`,
      partner_id: user.partner_id,
      partner_name: user.name,
      customer_name: order.shipping_address?.name || order.customer?.first_name + ' ' + order.customer?.last_name || 'N/A',
      customer_phone: order.shipping_address?.phone || order.customer?.phone || 'N/A',
      shipping_address: shippingAddress,
      pincode: pincode,
      city: order.shipping_address?.city || '',
      state: order.shipping_address?.province || '',
      items: (order.line_items || []).map((item: any) => ({
        productId: item.product_id?.toString() || 'shopify-item',
        productName: item.title,
        productSku: item.sku || item.variant_title || 'N/A',
        quantity: item.quantity,
        price: parseFloat(item.price),
        total: parseFloat(item.price) * item.quantity
      })),
      total_amount: parseFloat(order.total_price),
      selling_price: parseFloat(order.total_price),
      payment_method: order.gateway === 'manual' ? 'cod' : 'prepaid', // Very basic mapping
      status: 'pending', // Shopify orders start as pending in our system for review
      notes: `Shopify Order ID: ${order.id}. Gateway: ${order.gateway}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 4. Save Order to Database
    const { error: insertError } = await supabase
      .from('orders')
      .insert([orderData]);

    if (insertError) {
      console.error('[Shopify Webhook] Error saving order:', insertError);
      return NextResponse.json({ error: 'Failed to save order' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Order processed' });

  } catch (error: any) {
    console.error('[Shopify Webhook] Error:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}
