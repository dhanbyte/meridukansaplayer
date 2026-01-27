import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!supabase) {
      return NextResponse.json({ users: [], error: 'Supabase not configured' });
    }

    if (userId) {
      // Get single user
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !user) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        user: normalizeUser(user)
      });
    } else {
      // Get all users
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return NextResponse.json({
        users: (users || []).map(normalizeUser)
      });
    }
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({
      users: [],
      error: 'Database connection failed'
    });
  }
}

export async function POST(request: Request) {
  try {
    const userData = await request.json();

    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    // Generate password if not provided
    const password = userData.password || generatePassword();

    // Generate unique partnerId (VND001, VND002, etc.)
    let partnerId = userData.partnerId;
    if (!partnerId) {
      // Find the highest existing partnerId
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
      partnerId = `VND${String(nextNum).padStart(3, '0')}`;
    }

    const newUser = {
      partner_id: partnerId,
      username: userData.username,
      password: password,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      address: userData.address,
      bank_details: userData.bankDetails || {},
      wallet_balance: userData.walletBalance || 0,
      role: userData.role || 'partner',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('users')
      .insert([newUser])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      user: normalizeUser(data),
      password,
      partnerId
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create user'
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...updates } = await request.json();

    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    // Map frontend fields to Supabase snake_case
    const supabaseUpdates: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.name) supabaseUpdates.name = updates.name;
    if (updates.email) supabaseUpdates.email = updates.email;
    if (updates.phone) supabaseUpdates.phone = updates.phone;
    if (updates.address) supabaseUpdates.address = updates.address;
    if (updates.password) supabaseUpdates.password = updates.password;
    if (updates.bankDetails) supabaseUpdates.bank_details = updates.bankDetails;
    if (updates.walletBalance !== undefined) supabaseUpdates.wallet_balance = updates.walletBalance;
    if (updates.isActive !== undefined) supabaseUpdates.is_active = updates.isActive;

    const { data, error } = await supabase
      .from('users')
      .update(supabaseUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      user: normalizeUser(data),
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({
      success: false,
      error: 'Database error occurred'
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete user'
    }, { status: 500 });
  }
}

// Normalize Supabase user to frontend format
function normalizeUser(user: any) {
  return {
    _id: user.id,
    id: user.id,
    partnerId: user.partner_id,
    username: user.username,
    name: user.name,
    email: user.email,
    phone: user.phone,
    address: user.address,
    bankDetails: user.bank_details,
    walletBalance: user.wallet_balance,
    role: user.role,
    isActive: user.is_active,
    createdAt: user.created_at,
    updatedAt: user.updated_at
  };
}

function generatePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}