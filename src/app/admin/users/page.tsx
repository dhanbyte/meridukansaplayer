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

  const loadUsers = () => {
    const usersList = UserService.getUsers();
    setUsers(usersList);
  };

  const handleCreateUser = async () => {
    const password = UserService.generatePassword();
    const newUser = await UserService.createUser({
      ...formData,
      password
    });
    
    alert(`User created successfully!\nUsername: ${newUser.username}\nPassword: ${password}`);
    loadUsers();
    resetForm();
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    
    await UserService.updateUser(editingUser.id, formData);
    loadUsers();
    resetForm();
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      await UserService.deleteUser(userId);
      loadUsers();
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      name: '',
      phone: '',
      address: '',
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
      bankDetails: user.bankDetails,
      isActive: user.isActive
    });
    setShowCreateForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create User
        </Button>
      </div>

      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">
            {editingUser ? 'Edit User' : 'Create New User'}
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
              {editingUser ? 'Update User' : 'Create User'}
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
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Created</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b">
                  <td className="p-4 font-medium">{user.username}</td>
                  <td className="p-4">{user.name}</td>
                  <td className="p-4">{user.phone}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => startEdit(user)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}