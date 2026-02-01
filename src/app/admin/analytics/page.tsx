"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Package,
    Wallet,
    Truck,
    RefreshCw,
    IndianRupee,
    ArrowUpRight,
    ArrowDownRight,
    MapPin,
    CheckCircle2,
    XCircle,
    Clock,
    Users
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import dynamic from "next/dynamic";
import { ScrollArea } from "@/components/ui/scroll-area";

// Dynamically import IndiaMap to avoid SSR issues
const IndiaMap = dynamic(() => import("@/components/analytics/IndiaMap"), {
    ssr: false,
    loading: () => (
        <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-lg">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
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
        rtoLoss?: number;
        netProfit?: number;
        avgOrderValue: number;
        pendingOrders?: number;
    };
    highRtoAlerts: StateData[];
    topPerformingStates: StateData[];
    vendors?: VendorData[];
    costBreakdown?: {
        deliveryCharge: number;
        taxRate: number;
        rtoLossPerOrder: number;
    };
}

interface VendorData {
    vendorId: string;
    vendorName: string;
    totalOrders: number;
    deliveredOrders: number;
    rtoOrders: number;
    pendingOrders: number;
    totalRevenue: number;
    totalCost: number;
    profit: number;
    rtoLoss: number;
    netProfit: number;
    rtoRate: number;
    avgOrderValue: number;
    avgProfit: number;
}

export default function AdminAnalyticsPage() {
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
            const response = await fetch('/api/analytics?admin=true');
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
                <BarChart3 className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600 mb-4">No analytics data available</p>
                <Button onClick={fetchAnalytics}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                </Button>
            </div>
        );
    }

    // Calculate pending from totals if not provided - with null safety
    const pendingOrders = data.totals.pendingOrders ??
        ((data.totals.totalOrders || 0) - (data.totals.deliveredOrders || 0) - (data.totals.rtoOrders || 0));

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <BarChart3 className="h-7 w-7 text-blue-600" />
                        Admin Analytics
                    </h1>
                    <p className="text-gray-600 mt-1">Complete business overview</p>
                </div>
                <Button variant="outline" onClick={fetchAnalytics}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Key Metrics Row 1 - Orders */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <Package className="h-8 w-8 text-blue-600" />
                            <Badge variant="outline" className="bg-blue-100">All</Badge>
                        </div>
                        <p className="text-3xl font-bold mt-2">{data.totals.totalOrders || 0}</p>
                        <p className="text-sm text-gray-600">Total Orders</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <Clock className="h-8 w-8 text-yellow-600" />
                            <Badge variant="outline" className="bg-yellow-100">Pending</Badge>
                        </div>
                        <p className="text-3xl font-bold mt-2">{pendingOrders}</p>
                        <p className="text-sm text-gray-600">Pending</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <CheckCircle2 className="h-8 w-8 text-green-600" />
                            <Badge variant="outline" className="bg-green-100">
                                {data.totals.totalOrders > 0
                                    ? `${((data.totals.deliveredOrders / data.totals.totalOrders) * 100).toFixed(0)}%`
                                    : '0%'}
                            </Badge>
                        </div>
                        <p className="text-3xl font-bold mt-2">{data.totals.deliveredOrders || 0}</p>
                        <p className="text-sm text-gray-600">Delivered</p>
                    </CardContent>
                </Card>

                <Card className={`bg-gradient-to-br ${(data.totals.rtoRate || 0) > 15 ? 'from-red-50 to-red-100' : 'from-amber-50 to-amber-100'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <XCircle className={`h-8 w-8 ${(data.totals.rtoRate || 0) > 15 ? 'text-red-600' : 'text-amber-600'}`} />
                            <Badge variant={(data.totals.rtoRate || 0) > 15 ? "destructive" : "outline"} className={(data.totals.rtoRate || 0) > 15 ? '' : 'bg-amber-100'}>
                                {(data.totals.rtoRate || 0).toFixed(1)}%
                            </Badge>
                        </div>
                        <p className="text-3xl font-bold mt-2">{data.totals.rtoOrders || 0}</p>
                        <p className="text-sm text-gray-600">RTO Orders</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <Users className="h-8 w-8 text-indigo-600" />
                            <Badge variant="outline" className="bg-indigo-100">
                                COD: {data.totals.codOrders}
                            </Badge>
                        </div>
                        <p className="text-3xl font-bold mt-2">{data.totals.prepaidOrders || 0}</p>
                        <p className="text-sm text-gray-600">Prepaid Orders</p>
                    </CardContent>
                </Card>
            </div>

            {/* Key Metrics Row 2 - Financial */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-200 rounded-full">
                                <IndianRupee className="h-8 w-8 text-purple-700" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Revenue</p>
                                <p className="text-3xl font-bold">{formatCurrency(data.totals.totalRevenue || 0)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-200 rounded-full">
                                <Wallet className="h-8 w-8 text-green-700" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Net Profit</p>
                                <p className={`text-3xl font-bold ${(data.totals.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(data.totals.profit || 0)}
                                </p>
                            </div>
                        </div>
                        {(data.totals.totalRevenue || 0) > 0 && (
                            <div className="mt-3 flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-green-600" />
                                <span className="text-sm text-green-700">
                                    {(((data.totals.profit || 0) / (data.totals.totalRevenue || 1)) * 100).toFixed(1)}% margin
                                </span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-cyan-200 rounded-full">
                                <Package className="h-8 w-8 text-cyan-700" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Avg. Order Value</p>
                                <p className="text-3xl font-bold">₹{data.totals.avgOrderValue || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Map and State Table */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* India Map */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    State-wise Distribution
                                </CardTitle>
                                <CardDescription>Click a state to see details</CardDescription>
                            </div>
                            <div className="flex gap-1">
                                <Button
                                    size="sm"
                                    variant={mapColorMode === 'orders' ? 'default' : 'outline'}
                                    onClick={() => setMapColorMode('orders')}
                                >
                                    Orders
                                </Button>
                                <Button
                                    size="sm"
                                    variant={mapColorMode === 'profit' ? 'default' : 'outline'}
                                    onClick={() => setMapColorMode('profit')}
                                >
                                    Profit
                                </Button>
                                <Button
                                    size="sm"
                                    variant={mapColorMode === 'rto' ? 'default' : 'outline'}
                                    onClick={() => setMapColorMode('rto')}
                                >
                                    RTO
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <IndiaMap
                            data={data.states}
                            colorMode={mapColorMode}
                            onStateClick={(stateCode) => setSelectedState(stateCode)}
                            selectedState={selectedState}
                        />
                    </CardContent>
                </Card>

                {/* State Details Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            State Performance
                        </CardTitle>
                        <CardDescription>Orders, Revenue & RTO by state</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[400px]">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>State</TableHead>
                                        <TableHead className="text-right">Orders</TableHead>
                                        <TableHead className="text-right">Revenue</TableHead>
                                        <TableHead className="text-right">Profit</TableHead>
                                        <TableHead className="text-right">RTO %</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.states
                                        .sort((a, b) => b.totalOrders - a.totalOrders)
                                        .map((state) => (
                                            <TableRow
                                                key={state.stateCode}
                                                className={`cursor-pointer hover:bg-gray-50 ${selectedState === state.stateCode ? 'bg-blue-50' : ''}`}
                                                onClick={() => setSelectedState(state.stateCode)}
                                            >
                                                <TableCell className="font-medium">
                                                    {state.stateName}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {state.totalOrders}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatCurrency(state.totalRevenue)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <span className={state.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                        {formatCurrency(state.profit)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Badge
                                                        variant={(state.rtoRate || 0) > 20 ? "destructive" : (state.rtoRate || 0) > 10 ? "secondary" : "outline"}
                                                        className={(state.rtoRate || 0) <= 10 ? 'bg-green-100 text-green-800' : ''}
                                                    >
                                                        {(state.rtoRate || 0).toFixed(1)}%
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>

            {/* Alerts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* High RTO Alerts */}
                <Card className="border-red-200">
                    <CardHeader className="bg-red-50 rounded-t-lg">
                        <CardTitle className="flex items-center gap-2 text-red-700">
                            <AlertTriangle className="h-5 w-5" />
                            High RTO States
                        </CardTitle>
                        <CardDescription>States with RTO rate above 15%</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {data.highRtoAlerts.length === 0 ? (
                            <div className="text-center py-6 text-gray-500">
                                <CheckCircle2 className="h-10 w-10 mx-auto text-green-500 mb-2" />
                                No high RTO alerts
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {data.highRtoAlerts.slice(0, 5).map((state) => (
                                    <div key={state.stateCode} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                        <div>
                                            <p className="font-medium">{state.stateName}</p>
                                            <p className="text-sm text-gray-600">{state.rtoOrders} of {state.totalOrders} orders returned</p>
                                        </div>
                                        <Badge variant="destructive" className="text-lg">
                                            {(state.rtoRate || 0).toFixed(1)}%
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Top Performing States */}
                <Card className="border-green-200">
                    <CardHeader className="bg-green-50 rounded-t-lg">
                        <CardTitle className="flex items-center gap-2 text-green-700">
                            <TrendingUp className="h-5 w-5" />
                            Top Performing States
                        </CardTitle>
                        <CardDescription>Best states by profit and volume</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {data.topPerformingStates.length === 0 ? (
                            <div className="text-center py-6 text-gray-500">
                                No data available
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {data.topPerformingStates.slice(0, 5).map((state, index) => (
                                    <div key={state.stateCode} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                                {index + 1}
                                            </span>
                                            <div>
                                                <p className="font-medium">{state.stateName}</p>
                                                <p className="text-sm text-gray-600">{state.totalOrders} orders</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-green-600">{formatCurrency(state.profit || 0)}</p>
                                            <p className="text-xs text-gray-500">RTO: {(state.rtoRate || 0).toFixed(1)}%</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Vendor Analytics Section */}
            {data.vendors && data.vendors.length > 0 && (
                <Card className="mt-6">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Vendor Profit & RTO Analysis
                                </CardTitle>
                                <CardDescription>
                                    Profit: Selling Price - (Base + ₹{data.costBreakdown?.deliveryCharge || 80} Delivery + {data.costBreakdown?.taxRate || 18}% Tax) | RTO Loss: ₹{data.costBreakdown?.rtoLossPerOrder || 140}/order
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Profit Calculation Formula */}
                        <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
                            <p className="text-sm font-medium mb-2">📊 Profit Calculation Formula:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="space-y-1">
                                    <p className="text-green-700">✅ <strong>Delivered Order Profit:</strong></p>
                                    <p className="text-gray-600 ml-4">Base Price: ₹200</p>
                                    <p className="text-gray-600 ml-4">+ 18% Tax: ₹36</p>
                                    <p className="text-gray-600 ml-4">+ Delivery: ₹80</p>
                                    <p className="text-gray-600 ml-4">= <strong>System Cost: ₹316</strong></p>
                                    <p className="text-green-600 ml-4">If Selling Price ₹899 → <strong>Profit: ₹583</strong></p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-red-700">❌ <strong>RTO Order Loss:</strong></p>
                                    <p className="text-gray-600 ml-4">Return Shipping: ₹80</p>
                                    <p className="text-gray-600 ml-4">+ Handling Cost: ₹60</p>
                                    <p className="text-red-600 ml-4">= <strong>RTO Loss: ₹140/order</strong></p>
                                </div>
                            </div>
                        </div>

                        <ScrollArea className="h-[400px]">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Vendor ID</TableHead>
                                        <TableHead className="text-right">Orders</TableHead>
                                        <TableHead className="text-right">Delivered</TableHead>
                                        <TableHead className="text-right">RTO</TableHead>
                                        <TableHead className="text-right">RTO %</TableHead>
                                        <TableHead className="text-right">Revenue</TableHead>
                                        <TableHead className="text-right">Profit</TableHead>
                                        <TableHead className="text-right">RTO Loss</TableHead>
                                        <TableHead className="text-right">Net Profit</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.vendors.map((vendor) => (
                                        <TableRow key={vendor.vendorId}>
                                            <TableCell className="font-medium">
                                                {vendor.vendorId.substring(0, 8)}...
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {vendor.totalOrders || 0}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className="text-green-600">{vendor.deliveredOrders || 0}</span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className="text-red-600">{vendor.rtoOrders || 0}</span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Badge
                                                    variant={(vendor.rtoRate || 0) > 20 ? "destructive" : (vendor.rtoRate || 0) > 10 ? "secondary" : "outline"}
                                                    className={(vendor.rtoRate || 0) <= 10 ? 'bg-green-100 text-green-800' : ''}
                                                >
                                                    {(vendor.rtoRate || 0).toFixed(1)}%
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(vendor.totalRevenue || 0)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className="text-green-600 font-medium">
                                                    +{formatCurrency(vendor.profit || 0)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className="text-red-600 font-medium">
                                                    -{formatCurrency(vendor.rtoLoss || 0)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className={`font-bold ${(vendor.netProfit || 0) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                                    {(vendor.netProfit || 0) >= 0 ? '+' : ''}{formatCurrency(vendor.netProfit || 0)}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>

                        {/* Vendor Summary Cards */}
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card className="bg-blue-50">
                                <CardContent className="p-4">
                                    <p className="text-sm text-gray-600">Total Vendors</p>
                                    <p className="text-2xl font-bold">{data.vendors.length}</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-green-50">
                                <CardContent className="p-4">
                                    <p className="text-sm text-gray-600">Total Gross Profit</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        +{formatCurrency(data.vendors.reduce((sum, v) => sum + (v.profit || 0), 0))}
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="bg-red-50">
                                <CardContent className="p-4">
                                    <p className="text-sm text-gray-600">Total RTO Loss</p>
                                    <p className="text-2xl font-bold text-red-600">
                                        -{formatCurrency(data.vendors.reduce((sum, v) => sum + (v.rtoLoss || 0), 0))}
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="bg-purple-50">
                                <CardContent className="p-4">
                                    <p className="text-sm text-gray-600">Total Net Profit</p>
                                    <p className={`text-2xl font-bold ${data.vendors.reduce((sum, v) => sum + (v.netProfit || 0), 0) >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                                        {formatCurrency(data.vendors.reduce((sum, v) => sum + (v.netProfit || 0), 0))}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
