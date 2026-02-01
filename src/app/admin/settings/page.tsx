"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Settings, Save, RefreshCw, Truck, CreditCard, Percent, Gift } from "lucide-react";

interface SettingsData {
    delivery_charge: string;
    cod_charge: string;
    platform_fee_percent: string;
    free_delivery_threshold: string;
}

export default function AdminSettingsPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [settings, setSettings] = useState<SettingsData>({
        delivery_charge: '80',
        cod_charge: '40',
        platform_fee_percent: '5',
        free_delivery_threshold: '2000'
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/settings');
            const data = await response.json();

            if (data.success && data.settings) {
                setSettings({
                    delivery_charge: data.settings.delivery_charge || '80',
                    cod_charge: data.settings.cod_charge || '40',
                    platform_fee_percent: data.settings.platform_fee_percent || '5',
                    free_delivery_threshold: data.settings.free_delivery_threshold || '2000'
                });
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load settings"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ settings })
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: "Settings Saved",
                    description: "Global charges have been updated successfully."
                });
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to save settings"
            });
        } finally {
            setIsSaving(false);
        }
    };

    const settingsFields = [
        {
            key: 'delivery_charge',
            label: 'Delivery Charge',
            description: 'Flat delivery charge applied to orders (in ₹)',
            icon: Truck,
            placeholder: '80',
            suffix: '₹'
        },
        {
            key: 'cod_charge',
            label: 'COD Charge',
            description: 'Extra charge for Cash on Delivery orders (in ₹)',
            icon: CreditCard,
            placeholder: '40',
            suffix: '₹'
        },
        {
            key: 'platform_fee_percent',
            label: 'Handling Fee (Platform Fee)',
            description: 'Platform fee as percentage of product cost',
            icon: Percent,
            placeholder: '5',
            suffix: '%'
        },
        {
            key: 'free_delivery_threshold',
            label: 'Free Delivery Threshold',
            description: 'Order amount above which delivery is FREE (in ₹)',
            icon: Gift,
            placeholder: '2000',
            suffix: '₹'
        }
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <Settings className="h-8 w-8 text-blue-600" />
                    <div>
                        <h1 className="text-2xl font-bold">Global Settings</h1>
                        <p className="text-sm text-gray-500">Configure charges applied to vendor orders</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={fetchSettings}
                        disabled={isLoading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        <Save className="h-4 w-4 mr-2" />
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {settingsFields.map((field) => (
                    <Card key={field.key} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <field.icon className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">{field.label}</CardTitle>
                                    <CardDescription className="text-xs">{field.description}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-500 font-medium">{field.suffix === '%' ? '' : '₹'}</span>
                                <Input
                                    type="number"
                                    value={settings[field.key as keyof SettingsData]}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        [field.key]: e.target.value
                                    })}
                                    placeholder={field.placeholder}
                                    className="text-lg font-semibold"
                                />
                                <span className="text-gray-500 font-medium">{field.suffix === '%' ? '%' : ''}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Preview Section */}
            <Card className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        📋 Charges Preview (Example Order)
                    </CardTitle>
                    <CardDescription>
                        How charges will appear on a ₹1000 order with 2 items (₹10 packing/item)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <table className="w-full text-sm">
                            <tbody>
                                <tr className="border-b">
                                    <td className="py-2">Product Cost (₹500 × 2)</td>
                                    <td className="py-2 text-right font-medium">₹1,000</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2">Packing Charges (₹10 × 2)</td>
                                    <td className="py-2 text-right font-medium">+ ₹20</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2">
                                        Delivery Charges
                                        {parseFloat(settings.free_delivery_threshold) <= 1000 && (
                                            <span className="ml-2 text-green-600 text-xs">(FREE - above threshold)</span>
                                        )}
                                    </td>
                                    <td className="py-2 text-right font-medium">
                                        {parseFloat(settings.free_delivery_threshold) <= 1000
                                            ? <span className="text-green-600">FREE</span>
                                            : `+ ₹${settings.delivery_charge}`
                                        }
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2">Handling Fees ({settings.platform_fee_percent}% of ₹1000)</td>
                                    <td className="py-2 text-right font-medium">+ ₹{(1000 * parseFloat(settings.platform_fee_percent) / 100).toFixed(0)}</td>
                                </tr>
                                <tr className="border-b text-orange-600">
                                    <td className="py-2">COD Charges (if selected)</td>
                                    <td className="py-2 text-right font-medium">+ ₹{settings.cod_charge}</td>
                                </tr>
                                <tr className="bg-gray-50 font-bold text-lg">
                                    <td className="py-3">GRAND TOTAL (COD)</td>
                                    <td className="py-3 text-right text-green-700">
                                        ₹{(
                                            1000 +
                                            20 +
                                            (parseFloat(settings.free_delivery_threshold) <= 1000 ? 0 : parseFloat(settings.delivery_charge)) +
                                            (1000 * parseFloat(settings.platform_fee_percent) / 100) +
                                            parseFloat(settings.cod_charge)
                                        ).toFixed(0)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
