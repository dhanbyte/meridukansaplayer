import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { partnerId, partnerName, amount, transactionId, screenshotUrl } = await request.json();

    if (!partnerId || !amount || !transactionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    // Optional: Get user_id from partner_id if linking is needed
    // const { data: user } = await supabase.from('users').select('id').eq('partner_id', partnerId).single();

    const { data, error } = await supabase
      .from('recharge_history')
      .insert([
        {
          partner_id: partnerId,
          amount: parseFloat(amount),
          transaction_id: transactionId,
          screenshot_url: screenshotUrl,
          status: 'pending',
          payment_method: 'upi' // Default or passed from frontend?
        }
      ])
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, id: data[0].id });
  } catch (error: any) {
    console.error('Wallet recharge error:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit recharge request' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get('partnerId');
    const status = searchParams.get('status');

    if (!supabase) {
      return NextResponse.json({ recharges: [] });
    }

    let query = supabase
      .from('recharge_history')
      .select('*')
      .order('created_at', { ascending: false });

    if (partnerId) query = query.eq('partner_id', partnerId);
    if (status) query = query.eq('status', status);

    const { data: recharges, error } = await query;

    if (error) throw error;

    return NextResponse.json({ recharges: recharges || [] });
  } catch (error) {
    console.error('Wallet fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch recharges' }, { status: 500 });
  }
}
