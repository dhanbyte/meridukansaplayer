"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Info, 
  Zap,
  Lock
} from "lucide-react";
import Image from "next/image";

export default function ShopifySettingsPage() {
  const { user, login } = useAuth();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [formData, setFormData] = useState({
    storeUrl: '',
    accessToken: '',
    apiKey: '',
    apiSecret: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        storeUrl: user.shopifyStoreUrl || '',
        accessToken: user.shopifyAccessToken || '',
        apiKey: user.shopifyApiKey || '',
        apiSecret: user.shopifyApiSecret || ''
      });
    }
  }, [user]);

  const handleConnect = async () => {
    if (!user) return;
    
    if (!formData.storeUrl || !formData.accessToken) {
      toast({
        title: "Required Fields",
        description: "Store URL and Access Token are mandatory.",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);
    try {
      const response = await fetch('/api/shopify/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id || user._id,
          shopifyStoreUrl: formData.storeUrl,
          shopifyAccessToken: formData.accessToken,
          shopifyApiKey: formData.apiKey,
          shopifyApiSecret: formData.apiSecret
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Connection Successful",
          description: "Your Shopify store is now synced with the panel.",
        });
        
        // Refresh local user data
        const userResp = await fetch(`/api/users?id=${user.id || user._id}`);
        const userData = await userResp.json();
        if (userData.success) {
            localStorage.setItem('user', JSON.stringify(userData.user));
            window.location.reload(); // Refresh to update context
        }
      } else {
        throw new Error(data.error || 'Connection failed');
      }
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shopify Integration</h1>
          <p className="text-muted-foreground mt-1">Automate your order fulfillment with Shopify Sync.</p>
        </div>
        <div className="flex items-center gap-2">
            {user?.shopifyIsConnected ? (
                <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-200 text-sm font-semibold">
                    <CheckCircle2 className="h-4 w-4" />
                    Connected to Shopify
                </div>
            ) : (
                <div className="flex items-center gap-2 bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full border border-gray-200 text-sm font-semibold">
                    <AlertCircle className="h-4 w-4" />
                    Not Connected
                </div>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connection Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-lg border-2 border-primary/5">
            <CardHeader className="bg-primary/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-lg shadow-sm">
                    <RefreshCw className={`h-6 w-6 text-primary ${user?.shopifyIsConnected ? 'animate-none' : ''}`} />
                </div>
                <div>
                    <CardTitle>API Configuration</CardTitle>
                    <CardDescription>Enter your Shopify Custom App credentials.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="storeUrl">Shopify Store URL</Label>
                    <Input 
                        id="storeUrl"
                        placeholder="mystore.myshopify.com"
                        value={formData.storeUrl}
                        onChange={(e) => setFormData({ ...formData, storeUrl: e.target.value })}
                        className="bg-gray-50/50"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="accessToken" className="flex items-center gap-2">
                        Admin API Access Token 
                        <Lock className="h-3 w-3 text-muted-foreground" />
                    </Label>
                    <Input 
                        id="accessToken"
                        type="password"
                        placeholder="shpat_xxxxxxxxxxxxxxxx"
                        value={formData.accessToken}
                        onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                        className="bg-gray-50/50"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key (Optional)</Label>
                    <Input 
                        id="apiKey"
                        placeholder="Enter API Key"
                        value={formData.apiKey}
                        onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                        className="bg-gray-50/50"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="apiSecret">API Secret Key (Optional for HMAC)</Label>
                    <Input 
                        id="apiSecret"
                        type="password"
                        placeholder="Enter API Secret"
                        value={formData.apiSecret}
                        onChange={(e) => setFormData({ ...formData, apiSecret: e.target.value })}
                        className="bg-gray-50/50"
                    />
                </div>
              </div>

              <div className="pt-4">
                <Button 
                    onClick={handleConnect} 
                    disabled={isConnecting}
                    className="w-full md:w-auto px-10 h-11 bg-brand-navy hover:bg-brand-navy/90 text-white transition-all font-bold shadow-md hover:shadow-lg"
                >
                    {isConnecting ? (
                        <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Connecting Account...
                        </>
                    ) : (
                        <>
                            {user?.shopifyIsConnected ? "Update Connection" : "Connect Shopify Store"}
                            <Zap className="ml-2 h-4 w-4 fill-current" />
                        </>
                    )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Guide */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
            <h3 className="font-bold text-blue-900 flex items-center gap-2 mb-3">
                <Info className="h-5 w-5" />
                How to connect Shopwave with Shopify?
            </h3>
            <ol className="space-y-3 text-sm text-blue-800 list-decimal list-inside">
                <li>Go to your Shopify Admin → Settings → <b>App and sales channels</b>.</li>
                <li>Click <b>Develop apps</b> → <b>Create an app</b>.</li>
                <li>Assign <b>write_orders</b> and <b>read_orders</b> scopes to the Admin API.</li>
                <li>Install the app and copy the <b>Admin API access token</b> here.</li>
                <li>Also copy the <b>API secret key</b> for secure webhook verification.</li>
            </ol>
            <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-xs text-blue-600 font-medium">
                    Manual CSV uploads will still work, but Shopify Sync is recommended for real-time automation.
                </p>
            </div>
          </div>
        </div>

        {/* Sidebar Features */}
        <div className="space-y-6">
            <Card className="hover:border-primary/20 transition-colors">
                <CardContent className="pt-6 space-y-4">
                    <div className="bg-primary/5 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                        <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-bold">Real-time Sync</h3>
                    <p className="text-sm text-muted-foreground">
                        Orders from Shopify will automatically appear in your panel as soon as they are placed.
                    </p>
                </CardContent>
            </Card>

            <Card className="hover:border-primary/20 transition-colors">
                <CardContent className="pt-6 space-y-4">
                    <div className="bg-green-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                        <RefreshCw className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-bold">Fulfillment Update</h3>
                    <p className="text-sm text-muted-foreground">
                        When you update a tracking ID in this panel, it automatically fulfills the order in Shopify.
                    </p>
                </CardContent>
            </Card>

            <Card className="hover:border-primary/20 transition-colors">
                <CardContent className="pt-6 space-y-4">
                    <div className="bg-orange-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                        <CheckCircle2 className="h-6 w-6 text-orange-600" />
                    </div>
                    <h3 className="font-bold">Status Monitoring</h3>
                    <p className="text-sm text-muted-foreground">
                        Monitor the status of your Shopify orders directly from your main dashboard.
                    </p>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
