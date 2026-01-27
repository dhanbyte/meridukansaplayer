"use client";
import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  User, 
  Mail, 
  Shield, 
  MapPin, 
  Phone, 
  Building, 
  CreditCard, 
  Wallet, 
  LogOut, 
  ArrowRight,
  Package,
  Headset,
  Edit
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

export default function ProfilePage() {
  const { user, isLoggedIn, logout, updateUser } = useAuth();
  const { toast } = useToast();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Edit form states
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');

  const openEditModal = () => {
    setEditName(user?.name || '');
    setEditPhone(user?.phone || '');
    setEditAddress(user?.address || '');
    setIsEditOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id || user._id,
          name: editName,
          phone: editPhone,
          address: editAddress
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        });
        setIsEditOpen(false);
        
        // Refresh user data in context
        if (updateUser) {
          updateUser(data.user);
        }
      } else {
        throw new Error(data.error || 'Failed to update');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: "Update Failed",
        description: "Could not update your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoggedIn || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="p-4 bg-blue-50 rounded-full">
          <User className="h-12 w-12 text-blue-500" />
        </div>
        <h1 className="text-2xl font-bold">Your Profile</h1>
        <p className="text-gray-500 text-center max-w-xs">Please login to view your profile details and manage your account.</p>
        <Button asChild className="bg-blue-600 hover:bg-blue-700 px-8">
          <Link href="/login">Login Now</Link>
        </Button>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, label, value, color, href }: any) => (
    <Link href={href || "#"}>
      <Card className="hover:shadow-md transition-all cursor-pointer border-none bg-white/50 backdrop-blur-sm group">
        <CardContent className="p-4 flex items-center gap-4">
          <div className={cn("p-2 rounded-lg transition-transform group-hover:scale-110", color)}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            <p className="text-lg font-bold">{value}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <>
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      {/* Header Profile Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white p-6 sm:p-10 shadow-xl">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />
        
        <div className="relative flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-white/20 bg-white/10 flex items-center justify-center backdrop-blur-md">
              <span className="text-4xl sm:text-5xl font-bold uppercase">
                {(user.name || user.username || 'U')[0]}
              </span>
            </div>
            <div className="absolute bottom-1 right-1 h-6 w-6 bg-green-500 border-2 border-white rounded-full flex items-center justify-center" title="Active">
              <div className="h-2 w-2 bg-white rounded-full animate-pulse" />
            </div>
          </div>
          
          <div className="text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <h1 className="text-3xl font-bold tracking-tight">{user.name || 'User Name'}</h1>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase border border-white/10 tracking-widest self-center sm:self-auto">
                {user.role || 'Member'}
              </span>
            </div>
            <p className="text-blue-100 flex items-center justify-center sm:justify-start gap-2">
              <Mail className="h-4 w-4" />
              {user.username || user.email || 'N/A'}
            </p>
            <p className="text-blue-200 text-xs font-mono opacity-80">
              ID: {user.partnerId || user.partner_id || user.id || user._id}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          icon={Wallet} 
          label="Wallet Balance" 
          value={`₹${user.walletBalance || 0}`} 
          color="bg-green-100 text-green-700"
          href="/banking"
        />
        <StatCard 
          icon={Package} 
          label="Total Orders" 
          value="View All" 
          color="bg-blue-100 text-blue-700"
          href="/orders"
        />
        <StatCard 
          icon={Shield} 
          label="Account Status" 
          value="Verified" 
          color="bg-amber-100 text-amber-700"
        />
        <StatCard 
          icon={Headset} 
          label="Get Help" 
          value="Support" 
          color="bg-purple-100 text-purple-700"
          href="/support"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-md overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Personal Information
              </CardTitle>
              <Button variant="outline" size="sm" onClick={openEditModal} className="text-blue-600 border-blue-200 hover:bg-blue-50">
                <Edit className="h-3 w-3 mr-1" /> Edit
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center py-4 px-6 gap-2">
                   <div className="w-40 flex items-center gap-2 text-sm text-gray-500">
                    <User className="h-4 w-4" /> Full Name
                   </div>
                   <div className="font-semibold text-gray-900">{user.name || 'Not Provided'}</div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center py-4 px-6 gap-2">
                   <div className="w-40 flex items-center gap-2 text-sm text-gray-500">
                    <Mail className="h-4 w-4" /> Email / ID
                   </div>
                   <div className="font-semibold text-gray-900">{user.username || user.email}</div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center py-4 px-6 gap-2">
                   <div className="w-40 flex items-center gap-2 text-sm text-gray-500">
                    <Phone className="h-4 w-4" /> Mobile Number
                   </div>
                   <div className="font-semibold text-gray-900">{user.phone || 'N/A'}</div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start py-4 px-6 gap-2">
                   <div className="w-40 flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <MapPin className="h-4 w-4" /> Shop Address
                   </div>
                   <div className="font-semibold text-gray-900 leading-relaxed max-w-md">
                     {user.address || 'Click to add business address'}
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wallet Summary Card */}
          <Card className="border-none shadow-md bg-white overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Wallet className="h-5 w-5 text-green-600" />
                Wallet & Payouts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100 mb-4">
                 <div className="space-y-1">
                   <p className="text-sm text-green-700 font-medium">Available Balance</p>
                   <p className="text-3xl font-black text-green-800 tracking-tight">₹{user.walletBalance || 0}</p>
                 </div>
                 <Button asChild className="bg-green-600 hover:bg-green-700 shadow-md">
                   <Link href="/banking">
                      Recharge <ArrowRight className="h-4 w-4 ml-2" />
                   </Link>
                 </Button>
              </div>
              <p className="text-xs text-gray-400 text-center italic">
                * Profits are credited to your wallet after orders are delivered successfully.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Cards */}
        <div className="space-y-6">
          {/* Bank Account */}
          <Card className="border-none shadow-md overflow-hidden h-fit">
            <CardHeader className="bg-gray-50/50 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="h-5 w-5 text-amber-600" />
                Bank Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {user.bankDetails ? (
                <div className="space-y-4">
                  <div className="flex flex-col gap-1 p-3 bg-amber-50 rounded border border-amber-100">
                    <span className="text-[10px] uppercase font-bold text-amber-700">Bank Name</span>
                    <span className="font-bold text-gray-800">{user.bankDetails.bankName || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500">Account No.</span>
                    <span className="font-mono font-medium text-gray-700 tracking-wider">
                      {user.bankDetails.accountNumber ? `****${user.bankDetails.accountNumber.slice(-4)}` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500">IFSC Code</span>
                    <span className="font-mono font-medium text-gray-700">{user.bankDetails.ifscCode || 'N/A'}</span>
                  </div>
                  <Button asChild variant="outline" className="w-full mt-2 text-blue-600 border-blue-200 hover:bg-blue-50">
                    <Link href="/banking">Manage Bank Accounts</Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                   <CreditCard className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                   <p className="text-sm text-gray-500 mb-4">No bank details added yet.</p>
                   <Button asChild size="sm" variant="outline" className="w-full">
                     <Link href="/banking">Setup Banking</Link>
                   </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Support Card */}
          <Card className="border-none shadow-md overflow-hidden bg-blue-600 text-white">
            <CardContent className="p-6 space-y-4 text-center">
               <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                 <Headset className="h-6 w-6" />
               </div>
               <div>
                 <h4 className="font-bold text-lg">Need Support?</h4>
                 <p className="text-blue-100 text-xs mt-1">Our team is available 24/7 for your help.</p>
               </div>
               <Button asChild className="w-full bg-white text-blue-600 hover:bg-gray-100 font-bold border-none">
                 <Link href="/support">Open Support Ticket</Link>
               </Button>
            </CardContent>
          </Card>

          {/* Logout Button */}
          <Button 
            onClick={logout} 
            variant="ghost" 
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 font-bold border-red-100 border bg-white"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout Account
          </Button>
        </div>
      </div>
    </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md w-[95vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-600" />
              Edit Profile
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input 
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Mobile Number</Label>
              <Input 
                id="edit-phone"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="10-digit mobile number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Shop / Business Address</Label>
              <Textarea 
                id="edit-address"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                placeholder="Full address with city, state, and PIN code"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveProfile} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
