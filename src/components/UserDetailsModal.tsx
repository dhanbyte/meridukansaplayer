"use client";
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Package, Truck, CheckCircle, XCircle, Clock, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

interface UserStats {
  totalOrders: number;
  deliveredOrders: number;
  rtoOrders: number;
  cancelledOrders: number;
  pendingOrders: number;
  inTransitOrders: number;
  confirmedOrders: number;
  totalAmount: number;
  deliveredAmount: number;
  pendingAmount: number;
  averageOrderValue: number;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    deliveredAt?: string;
  }>;
}

interface UserDetailsModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  user: {
    id: string;
    username: string;
    name: string;
    phone: string;
    email?: string;
    partnerId: string;
    password?: string;
    isActive: boolean;
    address?: string;
    bankDetails?: {
      accountNumber: string;
      ifscCode: string;
      bankName: string;
      accountHolderName: string;
    };
  } | null;
}

export default function UserDetailsModal({ isOpen, onCloseAction, user }: UserDetailsModalProps) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchUserStats();
    }
  }, [isOpen, user]);

  const fetchUserStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/users/stats?partnerId=${user!.partnerId}`);
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      } else {
        console.error('Failed to fetch user stats:', data.error);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'rto':
      case 'returned': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'pending':
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'in_transit': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onCloseAction}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Details - {user.name} ({user.username})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Username</label>
                <p className="font-semibold">{user.username}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Full Name</label>
                <p className="font-semibold">{user.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Phone</label>
                <p className="font-semibold">{user.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="font-semibold">{user.email || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Partner ID</label>
                <p className="font-semibold">{user.partnerId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Password</label>
                <p className="font-mono text-sm">{user.password || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <div>
                  <Badge className={user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Address</label>
                <p className="font-semibold">{user.address || 'N/A'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Bank Details */}
          {user.bankDetails && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Bank Details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Account Number</label>
                  <p className="font-semibold">{user.bankDetails.accountNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">IFSC Code</label>
                  <p className="font-semibold">{user.bankDetails.ifscCode || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Bank Name</label>
                  <p className="font-semibold">{user.bankDetails.bankName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Account Holder Name</label>
                  <p className="font-semibold">{user.bankDetails.accountHolderName || 'N/A'}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Order Statistics */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading order statistics...</p>
            </div>
          ) : stats ? (
            <div className="space-y-4">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Order Statistics
              </CardTitle>

              {/* Summary Cards */}
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Total Orders</p>
                        <p className="text-2xl font-bold">{stats.totalOrders}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Delivered</p>
                        <p className="text-2xl font-bold">{stats.deliveredOrders}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      <div>
                        <p className="text-sm text-gray-600">RTO/Returned</p>
                        <p className="text-2xl font-bold">{stats.rtoOrders}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <div>
                        <p className="text-sm text-gray-600">Cancelled</p>
                        <p className="text-2xl font-bold">{stats.cancelledOrders}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order Status Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        Pending/Draft
                      </span>
                      <span className="font-semibold">{stats.pendingOrders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-purple-600" />
                        Confirmed
                      </span>
                      <span className="font-semibold">{stats.confirmedOrders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-blue-600" />
                        In Transit
                      </span>
                      <span className="font-semibold">{stats.inTransitOrders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Delivered
                      </span>
                      <span className="font-semibold">{stats.deliveredOrders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                        RTO/Returned
                      </span>
                      <span className="font-semibold">{stats.rtoOrders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        Cancelled
                      </span>
                      <span className="font-semibold">{stats.cancelledOrders}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Financial Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Amount</span>
                      <span className="font-semibold">{formatCurrency(stats.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivered Amount</span>
                      <span className="font-semibold text-green-600">{formatCurrency(stats.deliveredAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending Amount</span>
                      <span className="font-semibold text-yellow-600">{formatCurrency(stats.pendingAmount)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Average Order Value
                      </span>
                      <span className="font-semibold">{formatCurrency(stats.averageOrderValue)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Orders */}
              {stats.recentOrders.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.recentOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-semibold">{order.orderNumber}</p>
                            <p className="text-sm text-gray-600">{order.customerName}</p>
                            <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(order.totalAmount)}</p>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-600">No order statistics available</p>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCloseAction}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
