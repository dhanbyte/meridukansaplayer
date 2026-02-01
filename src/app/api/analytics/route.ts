import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getStateCodeFromOrder, STATE_NAMES } from '@/lib/pincode-state';


// Cost calculation constants
const DELIVERY_CHARGE = 80;
const TAX_RATE = 0.18;
const RTO_LOSS_PER_ORDER = 140; // Return shipping + handling cost

// Calculate system cost from base price
const calculateSystemCost = (basePrice: number) => {
    const taxAmount = basePrice * TAX_RATE;
    return basePrice + taxAmount + DELIVERY_CHARGE;
};

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const partnerId = searchParams.get('partnerId');
        const isAdmin = searchParams.get('admin') === 'true';

        // Initialize empty analytics data structure
        let analyticsData: any = {
            states: [],
            totals: {
                totalOrders: 0,
                deliveredOrders: 0,
                rtoOrders: 0,
                pendingOrders: 0,
                prepaidOrders: 0,
                codOrders: 0,
                totalRevenue: 0,
                totalCost: 0,
                profit: 0,
                rtoLoss: 0,
                avgOrderValue: 0,
                rtoRate: 0
            },
            highRtoAlerts: [],
            topPerformingStates: [],
            vendors: [] // Vendor-wise analytics
        };

        if (supabase) {
            // Build query - include pincode for state detection
            let query = supabase
                .from('orders')
                .select('id, status, total_amount, selling_price, profit, payment_method, customer_state, state, pincode, partner_id, created_at, items')
                .order('created_at', { ascending: false });

            // Filter by partner if specified
            if (partnerId) {
                query = query.eq('partner_id', partnerId);
            }

            const { data: orders, error } = await query;

            if (!error && orders && orders.length > 0) {
                // Aggregate real data by state
                const stateMap: Record<string, any> = {};
                // Aggregate by vendor (partner)
                const vendorMap: Record<string, any> = {};

                orders.forEach((order: any) => {
                    // Get state code from pincode (primary) or state field (fallback)
                    const state = getStateCodeFromOrder(order.pincode, order.customer_state || order.state);
                    const vendorId = order.partner_id || 'Unknown';

                    // Initialize state data
                    if (!stateMap[state]) {
                        stateMap[state] = {
                            stateCode: state,
                            stateName: STATE_NAMES[state] || state,
                            totalOrders: 0,
                            deliveredOrders: 0,
                            rtoOrders: 0,
                            prepaidOrders: 0,
                            codOrders: 0,
                            totalRevenue: 0,
                            profit: 0,
                            rtoLoss: 0
                        };
                    }

                    // Initialize vendor data
                    if (!vendorMap[vendorId]) {
                        vendorMap[vendorId] = {
                            vendorId: vendorId,
                            vendorName: vendorId, // Will be updated with actual name lookup
                            totalOrders: 0,
                            deliveredOrders: 0,
                            rtoOrders: 0,
                            pendingOrders: 0,
                            totalRevenue: 0,
                            totalCost: 0,
                            profit: 0,
                            rtoLoss: 0
                        };
                    }

                    stateMap[state].totalOrders++;
                    vendorMap[vendorId].totalOrders++;

                    // Calculate order economics
                    // Use selling_price or total_amount for revenue
                    let sellingPrice = Number(order.selling_price) || Number(order.total_amount) || 0;

                    // Get base price from items or estimate from total
                    let basePrice = 0;
                    if (order.items && Array.isArray(order.items) && order.items.length > 0) {
                        basePrice = order.items.reduce((sum: number, item: any) =>
                            sum + ((Number(item.price) || 0) * (Number(item.quantity) || 1)), 0);
                    } else {
                        // Estimate base price as 40% of selling price if not available
                        basePrice = sellingPrice * 0.4;
                    }

                    const systemCost = calculateSystemCost(basePrice);
                    const orderProfit = order.profit || (sellingPrice - systemCost);

                    // Status normalization (handle case sensitivity)
                    const status = order.status?.toLowerCase() || '';

                    if (status === 'delivered') {
                        stateMap[state].deliveredOrders++;
                        stateMap[state].totalRevenue += sellingPrice;
                        stateMap[state].profit += orderProfit;

                        vendorMap[vendorId].deliveredOrders++;
                        vendorMap[vendorId].totalRevenue += sellingPrice;
                        vendorMap[vendorId].totalCost += systemCost;
                        vendorMap[vendorId].profit += orderProfit;
                    } else if (status === 'rto' || status === 'returned') {
                        stateMap[state].rtoOrders++;
                        stateMap[state].rtoLoss += RTO_LOSS_PER_ORDER;

                        vendorMap[vendorId].rtoOrders++;
                        vendorMap[vendorId].rtoLoss += RTO_LOSS_PER_ORDER;
                    } else {
                        // Pending/processing orders
                        vendorMap[vendorId].pendingOrders++;
                    }

                    // Payment method normalization
                    const paymentMethod = order.payment_method?.toLowerCase() || '';
                    if (paymentMethod === 'prepaid') {
                        stateMap[state].prepaidOrders++;
                    } else {
                        stateMap[state].codOrders++;
                    }
                });

                const statesWithData = Object.values(stateMap);
                const vendorsWithData = Object.values(vendorMap);

                if (statesWithData.length > 0) {
                    // Calculate derived metrics
                    statesWithData.forEach((s: any) => {
                        s.rtoRate = s.totalOrders > 0 ? Math.round((s.rtoOrders / s.totalOrders) * 100) : 0;
                        s.netProfit = s.profit - s.rtoLoss;
                    });

                    vendorsWithData.forEach((v: any) => {
                        v.rtoRate = v.totalOrders > 0 ? Math.round((v.rtoOrders / v.totalOrders) * 100) : 0;
                        v.netProfit = v.profit - v.rtoLoss;
                        v.avgOrderValue = v.deliveredOrders > 0 ? Math.round(v.totalRevenue / v.deliveredOrders) : 0;
                        v.avgProfit = v.deliveredOrders > 0 ? Math.round(v.profit / v.deliveredOrders) : 0;
                    });

                    // Sort by total orders desc
                    statesWithData.sort((a: any, b: any) => b.totalOrders - a.totalOrders);
                    vendorsWithData.sort((a: any, b: any) => b.totalOrders - a.totalOrders);

                    // Calculate totals from aggregated state data
                    const totals = statesWithData.reduce((acc: any, s: any) => ({
                        totalOrders: acc.totalOrders + s.totalOrders,
                        deliveredOrders: acc.deliveredOrders + s.deliveredOrders,
                        rtoOrders: acc.rtoOrders + s.rtoOrders,
                        prepaidOrders: acc.prepaidOrders + s.prepaidOrders,
                        codOrders: acc.codOrders + s.codOrders,
                        totalRevenue: acc.totalRevenue + s.totalRevenue,
                        profit: acc.profit + s.profit,
                        rtoLoss: acc.rtoLoss + s.rtoLoss
                    }), { totalOrders: 0, deliveredOrders: 0, rtoOrders: 0, prepaidOrders: 0, codOrders: 0, totalRevenue: 0, profit: 0, rtoLoss: 0 });

                    analyticsData = {
                        states: statesWithData,
                        totals: {
                            ...totals,
                            pendingOrders: totals.totalOrders - totals.deliveredOrders - totals.rtoOrders,
                            netProfit: totals.profit - totals.rtoLoss,
                            rtoRate: totals.totalOrders > 0 ? Math.round((totals.rtoOrders / totals.totalOrders) * 100) : 0,
                            avgOrderValue: totals.deliveredOrders > 0 ? Math.round(totals.totalRevenue / totals.deliveredOrders) : 0
                        },
                        highRtoAlerts: statesWithData.filter((s: any) => s.rtoRate > 15).slice(0, 5),
                        topPerformingStates: statesWithData.filter((s: any) => s.profit > 0).slice(0, 5),
                        vendors: isAdmin ? vendorsWithData : [], // Only include vendors for admin
                        // Include cost calculation constants for frontend reference
                        costBreakdown: {
                            deliveryCharge: DELIVERY_CHARGE,
                            taxRate: TAX_RATE * 100,
                            rtoLossPerOrder: RTO_LOSS_PER_ORDER
                        }
                    };
                }
            }
        }

        return NextResponse.json({
            success: true,
            ...analyticsData
        });

    } catch (error) {
        console.error('Analytics API error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch analytics'
        }, { status: 500 });
    }
}
