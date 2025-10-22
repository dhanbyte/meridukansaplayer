import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI!;

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/products called');
    const body = await request.json();
    const { name, price, image, stock, weight, category } = body;
    
    console.log('Product data received:', { name, price, image: image ? 'present' : 'missing', stock, category });

    if (!uri || uri === 'undefined') {
      console.error('MongoDB URI not found');
      return NextResponse.json({ error: 'Database connection not configured' }, { status: 500 });
    }

    const client = new MongoClient(uri);
    await client.connect();
    console.log('MongoDB connected successfully');
    
    const db = client.db('dropship');
    const collection = db.collection('products');
    
    const product = {
      id: `PRODUCT_${Date.now()}`,
      name,
      price: Number(price),
      image,
      stock: Number(stock),
      weight: weight ? Number(weight) : undefined,
      category,
      deliveryCharge: 50,
      createdAt: new Date()
    };

    console.log('Inserting product:', product.id);
    await collection.insertOne(product);
    await client.close();
    console.log('Product added successfully');

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Error adding product:', error);
    return NextResponse.json({ error: 'Failed to add product', details: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    let dbProducts: any[] = [];
    
    // Try to connect to MongoDB if URI is available
    if (uri && uri !== 'undefined') {
      try {
        const client = new MongoClient(uri);
        await client.connect();
        
        const db = client.db('dropship');
        const collection = db.collection('products');
        
        dbProducts = await collection.find({}).toArray();
        await client.close();
      } catch (dbError) {
        console.error('MongoDB connection failed:', dbError);
        // Continue with empty dbProducts array
      }
    }

    const { ALL_PRODUCTS } = await import('../../../lib/products');
    const jsonProducts = (ALL_PRODUCTS || []).map(product => ({
      ...product,
      price: typeof product.price === 'object' ? product.price.original : product.price,
      deliveryCharge: 0
    }));

    // Remove duplicates by ID
    const seenIds = new Set();
    const uniqueProducts = [...dbProducts, ...jsonProducts].filter(product => {
      if (seenIds.has(product.id)) {
        return false;
      }
      seenIds.add(product.id);
      return true;
    });

    return NextResponse.json({ products: uniqueProducts || [] });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ products: [] }, { status: 200 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, price, image, stock, weight, category } = body;

    const client = new MongoClient(uri);
    await client.connect();
    
    const db = client.db('dropship');
    const collection = db.collection('products');
    
    await collection.updateOne(
      { id },
      { 
        $set: {
          name,
          price: Number(price),
          image,
          stock: Number(stock),
          weight: weight ? Number(weight) : undefined,
          category,
          updatedAt: new Date()
        }
      }
    );
    
    await client.close();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}