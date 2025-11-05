"use client";
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreditCard, Building, User, Hash, Edit } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

export default function BankingPage() {
  const { user, isLoggedIn } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    accountHolderName: '',
    accountNumber: '',
    bankName: '',
    ifscCode: ''
  });

  const handleEdit = () => {
    setFormData({
      accountHolderName: user?.bankDetails?.accountHolderName || '',
      accountNumber: user?.bankDetails?.accountNumber || '',
      bankName: user?.bankDetails?.bankName || '',
      ifscCode: user?.bankDetails?.ifscCode || ''
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: user?.id, 
          bankDetails: formData 
        })
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Bank details updated successfully"
        });
        setIsEditing(false);
        // Update user context would need to be implemented
      } else {
        throw new Error('Failed to update');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update bank details"
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      accountHolderName: '',
      accountNumber: '',
      bankName: '',
      ifscCode: ''
    });
  };

  if (!isLoggedIn || !user) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Banking</h1>
        <p>Please login to view your banking details.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Banking Details</h1>
      
      {user.bankDetails || isEditing ? (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Bank Account Information
              </CardTitle>
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Account Holder Name</label>
                    <Input
                      value={formData.accountHolderName}
                      onChange={(e) => setFormData({...formData, accountHolderName: e.target.value})}
                      placeholder="Enter account holder name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Account Number</label>
                    <Input
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                      placeholder="Enter account number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Bank Name</label>
                    <Input
                      value={formData.bankName}
                      onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                      placeholder="Enter bank name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">IFSC Code</label>
                    <Input
                      value={formData.ifscCode}
                      onChange={(e) => setFormData({...formData, ifscCode: e.target.value})}
                      placeholder="Enter IFSC code"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleSave}>Save Changes</Button>
                  <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Account Holder Name</p>
                    <p className="font-medium">{user.bankDetails?.accountHolderName || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Hash className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Account Number</p>
                    <p className="font-medium font-mono">{user.bankDetails?.accountNumber || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Building className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Bank Name</p>
                    <p className="font-medium">{user.bankDetails?.bankName || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">IFSC Code</p>
                    <p className="font-medium font-mono">{user.bankDetails?.ifscCode || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CreditCard className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Banking Details</h3>
            <p className="text-gray-500 text-center mb-4">
              Add your banking details to receive payments.
            </p>
            <Button onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Add Bank Details
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}