import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    const users = await db.collection('users').find({}).toArray();
    
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userData = await request.json();
    
    const client = await clientPromise;
    const db = client.db();
    
    // Use provided password or generate one
    const password = userData.password || generatePassword();
    
    const newUser = {
      ...userData,
      password,
      createdAt: new Date().toISOString(),
      isActive: true
    };
    
    const result = await db.collection('users').insertOne(newUser);
    
    return NextResponse.json({ 
      success: true, 
      user: { ...newUser, _id: result.insertedId },
      password 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...updates } = await request.json();
    
    const client = await clientPromise;
    const db = client.db();
    
    await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    
    const client = await clientPromise;
    const db = client.db();
    
    await db.collection('users').deleteOne({ _id: new ObjectId(id) });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}

function generatePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}