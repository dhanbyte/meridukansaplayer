import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    const orders = await db.collection('orders').find({}).sort({ createdAt: -1 }).toArray();
    
    return NextResponse.json({ orders: orders || [] });
  } catch (error) {
    console.error('Database error:', error);
    // Return empty array instead of error for frontend compatibility
    return NextResponse.json({ 
      orders: [],
      error: 'Database connection failed'
    });
  }
}

export async function POST(request: Request) {
  try {
    const orderData = await request.json();
    
    const client = await clientPromise;
    const db = client.db();
    
    const newOrder = {
      ...orderData,
      orderId: `ORD${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    
    const result = await db.collection('orders').insertOne(newOrder);
    
    return NextResponse.json({ 
      success: true, 
      order: { ...newOrder, _id: result.insertedId }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...updates } = await request.json();
    
    const client = await clientPromise;
    const db = client.db();
    
    await db.collection('orders').updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}