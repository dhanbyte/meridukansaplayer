"use client";
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserService } from '@/lib/userService';
import { User } from '@/lib/userTypes';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    phone: '',
    address: '',
    password: '',
    bankDetails: {
      accountNumber: '',
      ifscCode: '',
      bankName: '',
      accountHolderName: ''
    },
    isActive: true
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const usersList = await UserService.getUsers();
      setUsers(usersList || []);
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    }
  };

  const handleCreateUser = async () => {
    try {
      const result = await UserService.createUser(formData);
      
      if (result && result.user) {
        alert(`User created successfully!\nUsername: ${result.user.username}\nPassword: ${result.password}`);
        loadUsers();
        resetForm();
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user. Please try again.');
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    
    try {
      await UserService.updateUser(editingUser.id, formData);
      loadUsers();
      resetForm();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user. Please try again.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await UserService.deleteUser(userId);
        loadUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      name: '',
      phone: '',
      address: '',
      password: '',
      bankDetails: {
        accountNumber: '',
        ifscCode: '',
        bankName: '',
        accountHolderName: ''
      },
      isActive: true
    });
    setShowCreateForm(false);
    setEditingUser(null);
  };

  const startEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      name: user.name,
      phone: user.phone,
      address: user.address,
      password: user.password || '',
      bankDetails: user.bankDetails,
      isActive: user.isActive
    });
    setShowCreateForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Partner Management</h1>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Partner
        </Button>
      </div>

      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">
            {editingUser ? 'Edit Partner' : 'Create New Partner'}
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <Input
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                placeholder="Enter username"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter full name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="Enter phone number"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="Enter address"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <Input
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="Enter password"
                type="password"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Account Number</label>
              <Input
                value={formData.bankDetails.accountNumber}
                onChange={(e) => setFormData({
                  ...formData, 
                  bankDetails: {...formData.bankDetails, accountNumber: e.target.value}
                })}
                placeholder="Enter account number"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">IFSC Code</label>
              <Input
                value={formData.bankDetails.ifscCode}
                onChange={(e) => setFormData({
                  ...formData, 
                  bankDetails: {...formData.bankDetails, ifscCode: e.target.value}
                })}
                placeholder="Enter IFSC code"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Bank Name</label>
              <Input
                value={formData.bankDetails.bankName}
                onChange={(e) => setFormData({
                  ...formData, 
                  bankDetails: {...formData.bankDetails, bankName: e.target.value}
                })}
                placeholder="Enter bank name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Account Holder Name</label>
              <Input
                value={formData.bankDetails.accountHolderName}
                onChange={(e) => setFormData({
                  ...formData, 
                  bankDetails: {...formData.bankDetails, accountHolderName: e.target.value}
                })}
                placeholder="Enter account holder name"
              />
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button onClick={editingUser ? handleUpdateUser : handleCreateUser}>
              {editingUser ? 'Update Partner' : 'Create Partner'}
            </Button>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="text-left p-4">Username</th>
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Phone</th>
                <th className="text-left p-4">Password</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users && users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id || user._id} className="border-b">
                    <td className="p-4 font-medium">{user.username || 'N/A'}</td>
                    <td className="p-4">{user.name || 'N/A'}</td>
                    <td className="p-4">{user.phone || 'N/A'}</td>
                    <td className="p-4 font-mono text-sm">{user.password || 'N/A'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => startEdit(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDeleteUser(user.id || user._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}