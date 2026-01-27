"use client";
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreditCard, Building, User, Hash, Edit, AlertCircle, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function BankingPage() {
  const { user, isLoggedIn, updateUser } = useAuth();
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
          id: user?._id || user?.id, 
          bankDetails: formData 
        })
      });
      
      if (response.ok) {
        // Fetch updated user from database
        const userResponse = await fetch(`/api/users?id=${user?._id || user?.id}`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          updateUser(userData.user);
        } else {
          // Fallback: update context locally
          const updatedUser = { ...user, bankDetails: formData };
          updateUser(updatedUser);
        }
        
        toast({
          title: "Success",
          description: "Bank details saved to database successfully"
        });
        setIsEditing(false);
      } else {
        throw new Error('Failed to update');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save bank details to database"
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
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Banking Details</h1>
      
      {/* Bank Details Section */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Building className="h-6 w-6 text-blue-500" />
            Bank Account Information
          </h2>
        </div>

        {(user?.bankDetails && Object.keys(user.bankDetails).length > 0) || isEditing ? (
          <Card className="border-2 border-blue-50/50 shadow-xl overflow-hidden bg-white/50 backdrop-blur-sm">
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-blue-900">
                  <ShieldCheck className="h-5 w-5 text-green-500" />
                  Verified Payout Account
                </CardTitle>
                {!isEditing && (
                  <Button variant="outline" size="sm" onClick={handleEdit} className="hover:bg-blue-50 hover:text-blue-600 border-blue-200">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Details
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              {isEditing ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Account Holder Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          value={formData.accountHolderName}
                          onChange={(e) => setFormData({...formData, accountHolderName: e.target.value})}
                          placeholder="Ex: John Doe"
                          className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Account Number</label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          value={formData.accountNumber}
                          onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                          placeholder="Ex: 0000 1111 2222 3333"
                          className="pl-10 font-mono border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Bank Name</label>
                      <div className="relative">
                        <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          value={formData.bankName}
                          onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                          placeholder="Ex: State Bank of India"
                          className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">IFSC Code</label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          value={formData.ifscCode}
                          onChange={(e) => setFormData({...formData, ifscCode: e.target.value})}
                          placeholder="Ex: SBIN0001234"
                          className="pl-10 font-mono uppercase border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <Alert variant="destructive" className="bg-red-50 border-red-200">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle className="font-bold">Important Warning</AlertTitle>
                    <AlertDescription className="text-sm">
                      Sahi details bhare, agar details sahi nahi hogi to paise cut ho jayenge, uske liye hum responsible nahi honge.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex gap-3 pt-2">
                    <Button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700 shadow-md transition-all">Save Bank Details</Button>
                    <Button variant="outline" onClick={handleCancel} className="flex-1">Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-2">
                  <div className="flex flex-col gap-1 p-4 rounded-lg bg-gray-50 border border-gray-100 hover:border-blue-200 transition-all hover:bg-blue-50/30">
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Account Holder</p>
                    <div className="flex items-center gap-3 mt-1">
                      <User className="h-5 w-5 text-blue-400" />
                      <p className="text-lg font-bold text-gray-800">{user.bankDetails?.accountHolderName || 'Not Set'}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1 p-4 rounded-lg bg-gray-50 border border-gray-100 hover:border-blue-200 transition-all hover:bg-blue-50/30">
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Account Number</p>
                    <div className="flex items-center gap-3 mt-1">
                      <Hash className="h-5 w-5 text-blue-400" />
                      <p className="text-lg font-bold text-gray-800 font-mono tracking-tighter">
                        {user.bankDetails?.accountNumber ? 
                          '●●●● ' + user.bankDetails.accountNumber.slice(-4) : 
                          'Not Set'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1 p-4 rounded-lg bg-gray-50 border border-gray-100 hover:border-blue-200 transition-all hover:bg-blue-50/30">
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Bank Name</p>
                    <div className="flex items-center gap-3 mt-1">
                      <Building className="h-5 w-5 text-blue-400" />
                      <p className="text-lg font-bold text-gray-800">{user.bankDetails?.bankName || 'Not Set'}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1 p-4 rounded-lg bg-gray-50 border border-gray-100 hover:border-blue-200 transition-all hover:bg-blue-50/30">
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">IFSC Code</p>
                    <div className="flex items-center gap-3 mt-1">
                      <CreditCard className="h-5 w-5 text-blue-400" />
                      <p className="text-lg font-bold text-gray-800 font-mono uppercase tracking-widest">{user.bankDetails?.ifscCode || 'Not Set'}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed border-2 border-blue-200 bg-blue-50/30">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="bg-white p-4 rounded-full shadow-md mb-6 rotate-12 transition-transform hover:rotate-0">
                <CreditCard className="h-12 w-12 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Setup Your Bank Account</h3>
              <p className="text-gray-500 text-center mb-8 max-w-sm">
                Add your bank account details securely to receive your payments directly into your bank account.
              </p>
              <Button onClick={handleEdit} size="lg" className="bg-blue-600 hover:bg-blue-700 px-10 shadow-lg">
                <Edit className="h-5 w-5 mr-2" />
                Add Bank Account
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}