import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const partners = await db.collection('partners').find({}).toArray();
    
    return NextResponse.json(partners);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch partners' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const body = await request.json();
    
    const result = await db.collection('partners').insertOne(body);
    return NextResponse.json({ id: result.insertedId });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create partner' }, { status: 500 });
  }
}