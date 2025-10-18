"use client";
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Shield, Calendar } from 'lucide-react';

export default function SettingsPage() {
  const { user, isLoggedIn } = useAuth();

  if (!isLoggedIn || !user) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Settings</h1>
        <p>Please login to view your profile details.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">User Profile</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{user.name || 'N/A'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Username</p>
              <p className="font-medium">{user.username || user.email || 'N/A'}</p>
            </div>
          </div>
          
          {user.phone && (
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{user.phone}</p>
              </div>
            </div>
          )}
          
          {user.address && (
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">{user.address}</p>
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-3">
            <Shield className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="font-medium capitalize">{user.role || 'User'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {user.bankDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Bank Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Account Number</p>
                <p className="font-medium">{user.bankDetails.accountNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">IFSC Code</p>
                <p className="font-medium">{user.bankDetails.ifscCode || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Bank Name</p>
                <p className="font-medium">{user.bankDetails.bankName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Account Holder</p>
                <p className="font-medium">{user.bankDetails.accountHolderName || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}