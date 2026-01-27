import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    console.log('[Auth] Login attempt for:', email);

    // Validate input
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email/username and password are required'
      }, { status: 400 });
    }

    // Admin login
    if (email === 'admin' && password === 'admin123') {
      console.log('[Auth] Admin login successful');
      return NextResponse.json({
        success: true,
        user: {
          id: 'admin_1',
          partnerId: 'ADMIN001',
          username: 'admin',
          name: 'Admin User',
          role: 'admin'
        }
      });
    }

    // Demo user for testing
    if (email === 'demo' && password === 'demo123') {
      console.log('[Auth] Demo user login successful');
      return NextResponse.json({
        success: true,
        user: {
          id: 'demo_user_1',
          partnerId: 'VND001',
          username: 'demo',
          name: 'Demo Partner',
          phone: '9876543210',
          address: '123 Demo Street, Test City',
          bankDetails: {
            accountNumber: '1234567890',
            ifscCode: 'DEMO0001234',
            bankName: 'Demo Bank',
            accountHolderName: 'Demo Partner'
          },
          walletBalance: 5000,
          role: 'partner'
        }
      });
    }

    // Try Supabase
    if (supabase) {
      try {
        const { data: users, error } = await supabase
          .from('users')
          .select('*')
          .eq('username', email)
          .eq('password', password)
          .eq('is_active', true)
          .limit(1);

        if (!error && users && users.length > 0) {
          const user = users[0];
          console.log('[Auth] Supabase user found:', user.username);
          return NextResponse.json({
            success: true,
            user: {
              id: user.id,
              partnerId: user.partner_id,
              username: user.username,
              name: user.name,
              phone: user.phone,
              address: user.address,
              bankDetails: user.bank_details,
              walletBalance: user.wallet_balance || 0,
              role: user.role || 'partner'
            }
          });
        }
      } catch (supabaseError) {
        console.error('[Auth] Supabase error:', supabaseError);
      }
    }

    // No user found
    console.log('[Auth] Login failed - invalid credentials');
    return NextResponse.json({
      success: false,
      error: 'Invalid credentials'
    }, { status: 401 });

  } catch (error) {
    console.error('[Auth] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Authentication failed'
    }, { status: 500 });
  }
}