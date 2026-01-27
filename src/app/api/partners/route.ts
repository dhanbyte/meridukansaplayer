import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json([]);
    }

    const { data: partners, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'partner');

    if (error) throw error;

    return NextResponse.json(partners);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch partners' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const body = await request.json();
    
    // 1. Generate unique partnerId
    const { data: lastUser } = await supabase
      .from('users')
      .select('partner_id')
      .like('partner_id', 'VND%')
      .order('partner_id', { ascending: false })
      .limit(1);

    let nextNum = 1;
    if (lastUser && lastUser.length > 0 && lastUser[0].partner_id) {
      const match = lastUser[0].partner_id.match(/VND(\d+)/);
      if (match) {
        nextNum = parseInt(match[1]) + 1;
      }
    }
    const partnerId = `VND${String(nextNum).padStart(3, '0')}`;

    // 2. Prepare user data
    const newPartner = {
      name: body.name,
      email: body.email,
      phone: body.phone,
      password: body.password,
      username: body.email || body.username || partnerId.toLowerCase(),
      partner_id: partnerId,
      role: 'partner',
      is_active: true,
      bank_details: {
        bankName: body.bankName,
        accountHolderName: body.accountHolderName,
        accountNumber: body.accountNumber,
        ifscCode: body.ifscCode
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('users')
      .insert([newPartner])
      .select();

    if (error) {
      console.error('Partner creation error:', error);
      throw error;
    }

    return NextResponse.json({ 
      success: true, 
      id: data[0].id, 
      partnerId: partnerId,
      username: newPartner.username
    });
  } catch (error: any) {
    console.error('Failed to create partner:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to create partner' 
    }, { status: 500 });
  }
}