import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { orderIds } = await request.json();

    if (!orderIds || !Array.isArray(orderIds)) {
      return NextResponse.json({ error: 'Order IDs array is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('shopify_orders')
      .update({ status: 'pending', pushed_at: new Date().toISOString() })
      .in('id', orderIds);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: orderIds.length });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
