import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const partnerId = searchParams.get('partnerId');

    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    if (!userId && !partnerId) {
      return NextResponse.json({ error: 'User ID or Partner ID is required' }, { status: 400 });
    }

    // Get all orders for this user/partner
    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (partnerId) {
      query = query.eq('partner_id', partnerId);
    } else if (userId) {
      // First get user to find partnerId
      const { data: user } = await supabase
        .from('users')
        .select('partner_id')
        .eq('id', userId)
        .single();
      
      if (user?.partner_id) {
        query = query.eq('partner_id', user.partner_id);
      }
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    // Calculate statistics
    const stats = {
      totalOrders: orders?.length || 0,
      deliveredOrders: 0,
      rtoOrders: 0,
      cancelledOrders: 0,
      pendingOrders: 0,
      inTransitOrders: 0,
      confirmedOrders: 0,
      totalAmount: 0,
      deliveredAmount: 0,
      pendingAmount: 0,
      averageOrderValue: 0,
      recentOrders: []
    };

    if (orders && orders.length > 0) {
      orders.forEach((order: any) => {
        const amount = order.total_amount || 0;
        stats.totalAmount += amount;

        switch (order.status) {
          case 'delivered':
            stats.deliveredOrders++;
            stats.deliveredAmount += amount;
            break;
          case 'rto':
          case 'returned':
            stats.rtoOrders++;
            break;
          case 'cancelled':
            stats.cancelledOrders++;
            break;
          case 'pending':
          case 'draft':
            stats.pendingOrders++;
            stats.pendingAmount += amount;
            break;
          case 'in_transit':
            stats.inTransitOrders++;
            break;
          case 'confirmed':
            stats.confirmedOrders++;
            break;
        }
      });

      stats.averageOrderValue = stats.totalOrders > 0 ? stats.totalAmount / stats.totalOrders : 0;

      // Get recent orders (last 5)
      stats.recentOrders = orders.slice(0, 5).map((order: any) => ({
        id: order.id,
        orderNumber: order.order_number,
        customerName: order.customer_name,
        totalAmount: order.total_amount,
        status: order.status,
        createdAt: order.created_at,
        deliveredAt: order.delivered_at
      }));
    }

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({
      error: 'Failed to fetch user statistics'
    }, { status: 500 });
  }
}
