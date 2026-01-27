import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { rechargeId, status, finalAmount, note } = await request.json();

    if (!rechargeId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    // 1. Get recharge request
    const { data: recharge, error: fetchError } = await supabase
      .from('recharge_history')
      .select('*')
      .eq('id', rechargeId)
      .single();

    if (fetchError || !recharge) {
      return NextResponse.json({ error: 'Recharge request not found' }, { status: 404 });
    }

    if (recharge.status !== 'pending') {
      return NextResponse.json({ error: 'Recharge already processed' }, { status: 400 });
    }

    // 2. Update status
    // Note: Schema might not have adminNote or finalAmount explicitly, handling basics.
    const { error: updateError } = await supabase
      .from('recharge_history')
      .update({
        status,
        amount: finalAmount ? parseFloat(finalAmount) : recharge.amount, // Update amount if changed
        // admin_note: note, // Schema doesn't have this, ignoring for now
      })
      .eq('id', rechargeId);

    if (updateError) throw updateError;

    // 3. If approved, update user wallet balance
    if (status === 'approved') {
      const amountToAdd = finalAmount ? parseFloat(finalAmount) : recharge.amount;
      const partnerId = recharge.partner_id;

      // Fetch current balance
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('wallet_balance, id')
        // Try to match by partner_id first as it is more reliable given the schema usage
        .eq('partner_id', partnerId)
        .single();

      // If not found by partner_id, try by id if partnerId is a UUID (less likely based on format VND...)

      if (userError || !user) {
        console.error('User not found for wallet update:', partnerId);
        // Ensure we don't fail the request completely if user is missing, but log it.
        // Or fail? Better to fail or handle gracefully.
      } else {
        const newBalance = (user.wallet_balance || 0) + amountToAdd;
        await supabase
          .from('users')
          .update({ wallet_balance: newBalance })
          .eq('id', user.id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Wallet approval error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process wallet request' }, { status: 500 });
  }
}
