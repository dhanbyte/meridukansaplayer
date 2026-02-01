"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Package,
    Wallet,
    Truck,
    RefreshCw,
    Map,
    PieChart,
    IndianRupee,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import dynamic from "next/dynamic";

// Dynamically import IndiaMap to avoid SSR issues
const IndiaMap = dynamic(() => import("@/components/analytics/IndiaMap"), {
    ssr: false,
    loading: () => (
        <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-lg">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        </div>
    )
});

// Dynamically import RtoBarChart
const RtoBarChart = dynamic(() => import("@/components/analytics/RtoBarChart"), {
    ssr: false,
    loading: () => (
        <div className="h-[200px] flex items-center justify-center bg-gray-50 rounded-lg">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
        </div>
    )
});

interface StateData {
    stateCode: string;
    stateName: string;
    totalOrders: number;
    deliveredOrders: number;
    rtoOrders: number;
    rtoRate: number;
    prepaidOrders: number;
    codOrders: number;
    totalRevenue: number;
    profit: number;
}

interface AnalyticsData {
    states: StateData[];
    totals: {
        totalOrders: number;
        deliveredOrders: number;
        rtoOrders: number;
        rtoRate: number;
        prepaidOrders: number;
        codOrders: number;
        totalRevenue: number;
        profit: number;
        avgOrderValue: number;
    };
    highRtoAlerts: StateData[];
    topPerformingStates: StateData[];
}

export default function AnalyticsPage() {
    const { toast } = useToast();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedState, setSelectedState] = useState<string | null>(null);
    const [mapColorMode, setMapColorMode] = useState<'orders' | 'profit' | 'rto'>('orders');

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/analytics');
            const result = await response.json();

            if (result.success) {
                setData(result);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Failed to Load Analytics",
                description: String(error)
            });
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        if (amount >= 100000) {
            return `₹${(amount / 100000).toFixed(1)}L`;
        } else if (amount >= 1000) {
            return `₹${(amount / 1000).toFixed(1)}K`;
        }
        return `₹${amount}`;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">No analytics data available</p>
                <Button onClick={fetchAnalytics} className="mt-4">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6 max-w-7xl">
            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                        <BarChart3 className="h-8 w-8 text-blue-600" />
                        Analytics Dashboard
                    </h1>
                    <p className="text-gray-600 mt-1">Track your business performance across India</p>
                </div>
                <Button variant="outline" onClick={fetchAnalytics}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Data
                </Button>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <Package className="h-8 w-8 text-blue-600" />
                            <Badge variant="outline" className="bg-blue-100">
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                                +12%
                            </Badge>
                        </div>
                        <p className="text-2xl font-bold mt-2">{data.totals.totalOrders}</p>
                        <p className="text-sm text-gray-600">Total Orders</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <Wallet className="h-8 w-8 text-green-600" />
                            <Badge variant="outline" className="bg-green-100">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Profit
                            </Badge>
                        </div>
                        <p className="text-2xl font-bold mt-2">{formatCurrency(data.totals.profit)}</p>
                        <p className="text-sm text-gray-600">Net Profit</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <IndianRupee className="h-8 w-8 text-purple-600" />
                            <Badge variant="outline" className="bg-purple-100">AVG</Badge>
                        </div>
                        <p className="text-2xl font-bold mt-2">₹{data.totals.avgOrderValue || 0}</p>
                        <p className="text-sm text-gray-600">Avg Order Value</p>
                    </CardContent>
                </Card>

                <Card className={`bg-gradient-to-br ${data.totals.rtoRate > 15 ? 'from-red-50 to-red-100' : 'from-amber-50 to-amber-100'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <Truck className="h-8 w-8 text-red-600" />
                            {data.totals.rtoRate > 15 ? (
                                <Badge variant="destructive">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    High
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="bg-amber-100">Normal</Badge>
                            )}
                        </div>
                        <p className="text-2xl font-bold mt-2">{data.totals.rtoRate}%</p>
                        <p className="text-sm text-gray-600">RTO Rate</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* India Map */}
                <Card className="lg:col-span-2">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Map className="h-5 w-5" />
                                    State-wise Performance
                                </CardTitle>
                                <CardDescription>Click on any state to view details</CardDescription>
                            </div>
                            <div className="flex gap-1">
                                {(['orders', 'profit', 'rto'] as const).map(mode => (
                                    <Button
                                        key={mode}
                                        size="sm"
                                        variant={mapColorMode === mode ? 'default' : 'outline'}
                                        onClick={() => setMapColorMode(mode)}
                                        className="text-xs"
                                    >
                                        {mode === 'orders' ? 'Orders' : mode === 'profit' ? 'Profit' : 'RTO'}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <IndiaMap
                            data={data.states}
                            onStateClick={setSelectedState}
                            selectedState={selectedState}
                            colorMode={mapColorMode}
                        />
                    </CardContent>
                </Card>

                {/* Right Sidebar */}
                <div className="space-y-4">
                    {/* RTO Alerts */}
                    {data.highRtoAlerts.length > 0 && (
                        <Card className="border-red-200 bg-red-50">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base flex items-center gap-2 text-red-700">
                                    <AlertTriangle className="h-5 w-5" />
                                    High RTO Alert Zones
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {data.highRtoAlerts.map(state => (
                                    <div key={state.stateCode} className="flex items-center justify-between p-2 bg-white rounded-lg">
                                        <span className="font-medium">{state.stateName}</span>
                                        <Badge variant="destructive">{state.rtoRate}% RTO</Badge>
                                    </div>
                                ))}
                                <p className="text-xs text-red-600 mt-2">
                                    💡 Consider pausing ads or switching to Prepaid-Only for these states
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Order Type Split */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <PieChart className="h-5 w-5" />
                                Order Type Split
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <div className="h-4 rounded-full overflow-hidden bg-gray-200 flex">
                                        <div
                                            className="bg-green-500 h-full"
                                            style={{ width: `${(data.totals.prepaidOrders / data.totals.totalOrders) * 100}%` }}
                                        />
                                        <div
                                            className="bg-orange-500 h-full"
                                            style={{ width: `${(data.totals.codOrders / data.totals.totalOrders) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between mt-3 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded bg-green-500" />
                                    <span>Prepaid: {data.totals.prepaidOrders} ({Math.round((data.totals.prepaidOrders / data.totals.totalOrders) * 100)}%)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded bg-orange-500" />
                                    <span>COD: {data.totals.codOrders} ({Math.round((data.totals.codOrders / data.totals.totalOrders) * 100)}%)</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Financial Summary */}
                    <Card className="bg-gradient-to-br from-emerald-50 to-teal-50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Wallet className="h-5 w-5 text-emerald-600" />
                                Financial Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Revenue</span>
                                <span className="font-semibold">{formatCurrency(data.totals.totalRevenue)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Estimated Cost</span>
                                <span className="font-semibold text-red-600">-{formatCurrency(data.totals.totalRevenue - data.totals.profit)}</span>
                            </div>
                            <hr />
                            <div className="flex justify-between">
                                <span className="font-semibold">Net Profit</span>
                                <span className="font-bold text-lg text-emerald-600">{formatCurrency(data.totals.profit)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Per Order Profit</span>
                                <span className="text-emerald-600">₹{Math.round(data.totals.profit / data.totals.deliveredOrders)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* RTO Bar Chart - Delivered vs RTO Analysis */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                        Delivered vs RTO Analysis
                    </CardTitle>
                    <CardDescription>
                        Compare delivery success and RTO rates across top performing states
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <RtoBarChart data={data.states} maxItems={8} />
                </CardContent>
            </Card>

            {/* State Performance Table */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="text-lg">State-wise Performance Table</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-gray-50">
                                    <th className="px-4 py-3 text-left font-medium">State</th>
                                    <th className="px-4 py-3 text-center font-medium">Orders</th>
                                    <th className="px-4 py-3 text-center font-medium">Delivered</th>
                                    <th className="px-4 py-3 text-center font-medium">RTO</th>
                                    <th className="px-4 py-3 text-center font-medium">RTO %</th>
                                    <th className="px-4 py-3 text-right font-medium">Profit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.states.slice(0, 10).map(state => (
                                    <tr
                                        key={state.stateCode}
                                        className={`border-b hover:bg-gray-50 cursor-pointer ${selectedState === state.stateCode ? 'bg-blue-50' : ''}`}
                                        onClick={() => setSelectedState(state.stateCode)}
                                    >
                                        <td className="px-4 py-3 font-medium">{state.stateName}</td>
                                        <td className="px-4 py-3 text-center">{state.totalOrders}</td>
                                        <td className="px-4 py-3 text-center text-green-600">{state.deliveredOrders}</td>
                                        <td className="px-4 py-3 text-center text-red-600">{state.rtoOrders}</td>
                                        <td className="px-4 py-3 text-center">
                                            <Badge variant={state.rtoRate > 20 ? 'destructive' : state.rtoRate > 10 ? 'secondary' : 'outline'}>
                                                {state.rtoRate}%
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium text-green-600">
                                            {formatCurrency(state.profit)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
