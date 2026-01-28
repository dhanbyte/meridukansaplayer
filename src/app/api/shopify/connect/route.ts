import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { 
      userId, 
      shopifyStoreUrl, 
      shopifyAccessToken, 
      shopifyApiKey, 
      shopifyApiSecret 
    } = await request.json();

    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    // 1. Clean the store URL (remove https:// and trainees /)
    const cleanUrl = shopifyStoreUrl.replace('https://', '').replace('http://', '').replace(/\/$/, '');
    
    // 2. Register Webhook in Shopify
    // We register orders/create webhook
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host');
    const webhookUrl = `${protocol}://${host}/api/shopify/webhooks/orders`;

    console.log(`[Shopify Connection] Registering webhook for ${cleanUrl} -> ${webhookUrl}`);

    const webhookBody = {
      webhook: {
        topic: "orders/create",
        address: webhookUrl,
        format: "json"
      }
    };

    const shopifyResponse = await fetch(`https://${cleanUrl}/admin/api/2024-01/webhooks.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': shopifyAccessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webhookBody)
    });

    const shopifyData = await shopifyResponse.json();

    if (!shopifyResponse.ok) {
        console.error('[Shopify Connection] Webhook registration failed:', shopifyData);
        // Sometimes webhook already exists, which yields a 422. We check that.
        if (shopifyResponse.status !== 422) {
            return NextResponse.json({ 
                success: false, 
                error: 'Failed to connect to Shopify. Check your Access Token and Store URL.',
                details: shopifyData
            }, { status: 400 });
        }
    }

    // 3. Save credentials to Database
    const { error: dbError } = await supabase
      .from('users')
      .update({
        shopify_store_url: cleanUrl,
        shopify_access_token: shopifyAccessToken,
        shopify_api_key: shopifyApiKey,
        shopify_api_secret: shopifyApiSecret,
        shopify_is_connected: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (dbError) {
      console.error('[Shopify Connection] Database error:', dbError);
      throw dbError;
    }

    return NextResponse.json({ 
        success: true, 
        message: 'Shopify Store connected successfully and webhooks registered.' 
    });

  } catch (error: any) {
    console.error('[Shopify Connection] Error:', error);
    return NextResponse.json({ 
        success: false, 
        error: error.message || 'Failed to connect Shopify' 
    }, { status: 500 });
  }
}
