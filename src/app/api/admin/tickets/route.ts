import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(request: Request) {
  try {
    const { ticketId, status, adminReply } = await request.json();

    if (!ticketId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (adminReply) {
      updateData.admin_response = adminReply;
    }

    const { error } = await supabase
      .from('tickets')
      .update(updateData)
      .eq('id', ticketId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Ticket update error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update ticket' }, { status: 500 });
  }
}
