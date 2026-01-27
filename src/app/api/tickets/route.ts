import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { userId, partnerId, partnerName, partnerPhone, subject, message, orderId } = await request.json();

    if (!partnerId || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const { data, error } = await supabase
      .from('tickets')
      .insert([
        {
          user_id: userId,
          partner_id: partnerId,
          partner_name: partnerName,
          partner_phone: partnerPhone,
          order_id: orderId,
          subject,
          message,
          status: 'open',
          priority: 'normal'
        }
      ])
      .select();

    if (error) {
      console.error('Supabase Insert Error:', error);
      throw error;
    }

    return NextResponse.json({ success: true, id: data?.[0]?.id });
  } catch (error: any) {
    console.error('Ticket creation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create ticket' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get('partnerId');
    const userId = searchParams.get('userId');

    if (!supabase) {
      return NextResponse.json({ tickets: [] });
    }

    let query = supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    } else if (partnerId) {
      // Try both if only partnerId is provided (for backward compatibility or flexibility)
      query = query.or(`user_id.eq.${partnerId},partner_id.eq.${partnerId}`);
    }

    const { data: tickets, error } = await query;

    if (error) throw error;

    return NextResponse.json({ tickets: tickets || [] });
  } catch (error) {
    console.error('Ticket fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}
