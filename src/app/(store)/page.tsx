"use client";
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  FileText,
  Settings,
  Bell,
  HelpCircle,
  MessageSquare,
  Tag,
  CreditCard,
  AlertCircle,
  ArrowRight,
  BarChart3,
  ShoppingCart,
  MapPin
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface DashboardStats {
  totalOrderValue: number;
  prepaidAmount: number;
  codPendingAmount: number;
  totalOrders: number;
  draftOrders: number;
  codAmount: number;
  intransit: number;
  totalManifested: number;
  cancelledOrders: number;
  outForDelivery: number;
  deliveredOrders: number;
  rtoInTransit: number;
  rto: number;
  codAmountPaid: number;
}

export default function StoreHome() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState<DashboardStats>({
    totalOrderValue: 0,
    prepaidAmount: 0,
    codPendingAmount: 0,
    totalOrders: 0,
    draftOrders: 0,
    codAmount: 0,
    intransit: 0,
    totalManifested: 0,
    cancelledOrders: 0,
    outForDelivery: 0,
    deliveredOrders: 0,
    rtoInTransit: 0,
    rto: 0,
    codAmountPaid: 0
  });

  React.useEffect(() => {
    if (user?.id || user?._id) {
      fetchDashboardStats();
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // Get partnerId from user - prioritizing human readable ID
      const partnerId = user?.partnerId || user?.partner_id || user?.id || user?._id;

      // Fetch only this partner's orders
      const response = await fetch(`/api/orders${partnerId ? `?partnerId=${partnerId}` : ''}`);
      const data = await response.json();

      if (data.orders && Array.isArray(data.orders)) {
        // Filter orders to only include current partner's orders (double check)
        const orders = data.orders.filter((order: any) =>
          !partnerId || order.partnerId === partnerId
        );

        // Calculate real statistics from orders data (including drafts)
        const calculatedStats: DashboardStats = {
          totalOrderValue: orders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0),
          prepaidAmount: orders.filter((o: any) => o.paymentMethod === 'prepaid').reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0),
          codPendingAmount: orders.filter((o: any) => o.paymentMethod === 'cod' && o.status !== 'delivered').reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0),
          totalOrders: orders.length,
          draftOrders: orders.filter((o: any) => o.status === 'draft').length,
          codAmount: orders.filter((o: any) => o.paymentMethod === 'cod').reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0),
          intransit: orders.filter((o: any) => o.status === 'in_transit').length,
          totalManifested: orders.filter((o: any) => o.status !== 'draft').length,
          cancelledOrders: orders.filter((o: any) => o.status === 'cancelled').length,
          outForDelivery: orders.filter((o: any) => o.status === 'out_for_delivery').length,
          deliveredOrders: orders.filter((o: any) => o.status === 'delivered').length,
          rtoInTransit: orders.filter((o: any) => o.status === 'rto_in_transit').length,
          rto: orders.filter((o: any) => o.status === 'rto').length,
          codAmountPaid: orders.filter((o: any) => o.paymentMethod === 'cod' && o.status === 'delivered').reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0)
        };

        setStats(calculatedStats);
        console.log('Dashboard stats calculated for partner:', partnerId, calculatedStats);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const menuItems = [
    { icon: BarChart3, label: "Dashboard", href: "/" },
    { icon: ShoppingCart, label: "Your Order", href: "/orders" },
    { icon: Package, label: "Track Order", href: "https://www.shipbhai.com/", external: true },
    { icon: Users, label: "Profile", href: "/profile" },
    { icon: HelpCircle, label: "Help & Support", href: "/support" },
  ];

  const statCards = [
    {
      title: "Amount of Total Orders",
      subtitle: "Value of Shipment Manifest",
      value: formatCurrency(stats.totalOrderValue),
      icon: DollarSign,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Prepaid Amount",
      subtitle: "Amount of Total Prepaid Orders",
      value: formatCurrency(stats.prepaidAmount),
      icon: CreditCard,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "COD Pending Amount",
      subtitle: "Total Amount Pending to Pay to Seller",
      value: formatCurrency(stats.codPendingAmount),
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Total Orders",
      subtitle: "Count of total Orders",
      value: stats.totalOrders.toString(),
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Draft Orders",
      subtitle: "Count of draft Orders",
      value: stats.draftOrders.toString(),
      icon: FileText,
      color: "text-gray-600",
      bgColor: "bg-gray-50"
    },
    {
      title: "COD Amount",
      subtitle: "Amount of total COD orders",
      value: formatCurrency(stats.codAmount),
      icon: DollarSign,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      title: "Intransit",
      subtitle: "Count of total orders in Transit",
      value: stats.intransit.toString(),
      icon: Truck,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      title: "Total Manifested",
      subtitle: "Count of total Manifested Orders",
      value: stats.totalManifested.toString(),
      icon: FileText,
      color: "text-pink-600",
      bgColor: "bg-pink-50"
    },
    {
      title: "Cancelled Orders",
      subtitle: "Count of total Cancelled Orders",
      value: stats.cancelledOrders.toString(),
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      title: "Out For Delivery",
      subtitle: "Count of total Orders in OFD",
      value: stats.outForDelivery.toString(),
      icon: MapPin,
      color: "text-teal-600",
      bgColor: "bg-teal-50"
    },
    {
      title: "Delivered Orders",
      subtitle: "Count of total Delivered Orders",
      value: stats.deliveredOrders.toString(),
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "RTO In-Transit",
      subtitle: "Count of total RTO In-Transit Orders",
      value: stats.rtoInTransit.toString(),
      icon: AlertCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "RTO",
      subtitle: "Count of total RTO Orders",
      value: stats.rto.toString(),
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      title: "COD Amount Paid",
      subtitle: "Total Amount Paid to Seller",
      value: formatCurrency(stats.codAmountPaid),
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-green-600">
                Available
              </Badge>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user?.name?.charAt(0)?.toUpperCase() || 'C'}
                </div>
                <span className="text-sm font-medium text-gray-700">{user?.name || 'Client'}</span>
              </div>
              <Button variant="ghost" size="sm">
                ×
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {menuItems.map((item, index) => (
            <Card 
              key={index} 
              className="hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => {
                if (item.external) {
                  window.open(item.href, '_blank');
                } else {
                  window.location.href = item.href;
                }
              }}
            >
              <CardContent className="p-4 flex flex-col items-center justify-center space-y-2 min-h-[100px]">
                <div className="p-3 rounded-lg bg-gray-50 group-hover:bg-blue-50 transition-colors">
                  <item.icon className="h-6 w-6 text-gray-600 group-hover:text-blue-600 transition-colors" />
                </div>
                <span className="text-xs font-medium text-center text-gray-700 group-hover:text-blue-600 transition-colors">
                  {item.label}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
