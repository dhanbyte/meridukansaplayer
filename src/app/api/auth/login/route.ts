import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    // Admin login check
    if (email === 'admin' && password === 'admin123') {
      return NextResponse.json({ 
        success: true, 
        user: { 
          id: 'admin', 
          name: 'Admin', 
          email: 'admin@shopwave.com', 
          role: 'admin' 
        } 
      });
    }
    
    // Test partner for demo
    if (email === 'dhan@gmail.com' && password === '123456') {
      return NextResponse.json({ 
        success: true, 
        user: { 
          id: 'test-partner', 
          username: 'dhan@gmail.com',
          name: 'Dhan Kumar', 
          phone: '9876543210',
          address: 'Test Address, Delhi',
          bankDetails: {
            accountNumber: '1234567890',
            ifscCode: 'SBIN0001234',
            bankName: 'State Bank of India',
            accountHolderName: 'Dhan Kumar'
          },
          role: 'partner' 
        } 
      });
    }
    
    const client = await clientPromise;
    const db = client.db();
    
    // Check in users collection (created by admin)
    const user = await db.collection('users').findOne({ 
      username: email, 
      password: password,
      isActive: true
    });
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    return NextResponse.json({ 
      success: true, 
      user: { 
        id: user._id, 
        username: user.username,
        name: user.name, 
        phone: user.phone,
        address: user.address,
        bankDetails: user.bankDetails,
        role: 'partner' 
      } 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}