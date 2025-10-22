import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, MongoClientOptions } from 'mongodb';

declare global {
  // eslint-disable-next-line no-var
  var _products: any[]; // For development in-memory storage
}

interface Product {
  id: string;
  name: string;
  price: number | string;
  image: string;
  stock: number | string;
  weight?: number | string;
  category: string;
  createdAt?: Date;
}

const uri = process.env.MONGODB_URI!;

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/products called');
    const body = await request.json();
    const { name, price, image, stock, weight, category } = body;
    
    // Log environment info (for debugging)
    console.log('Environment:', process.env.NODE_ENV);
    console.log('MongoDB URI present:', !!process.env.MONGODB_URI);
    
    console.log('Product data received:', { name, price, image: image ? 'present' : 'missing', stock, category });

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

    // Try MongoDB first
    console.log('MongoDB Connection Attempt - URI:', uri ? 'Present' : 'Missing');
    if (uri && uri !== 'undefined') {
      try {
        const client = new MongoClient(uri);
        await client.connect();
        console.log('MongoDB connected successfully');
        
        const db = client.db('dropship');
        const collection = db.collection('products');
        
        console.log('Inserting product:', product.id);
        await collection.insertOne(product);
        await client.close();
        console.log('Product added to MongoDB successfully');

        return NextResponse.json({ success: true, product, source: 'mongodb' });
      } catch (dbError) {
        console.error('MongoDB error:', dbError);
        // Continue to fallback
      }
    }

    // Fallback: Try to use local storage in development or show error in production
    if (process.env.NODE_ENV === 'development') {
      console.log('Using development fallback - saving to in-memory array');
      // In development, we can use a simple in-memory array
      if (!global._products) global._products = [];
      global._products.push(product);
      
      return NextResponse.json({ 
        success: true, 
        product, 
        source: 'memory',
        message: 'Product saved to memory (development only)'
      });
    } else {
      console.error('Production error: Database connection failed and no fallback available');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database connection failed',
          message: 'Please check your MongoDB connection string in environment variables' 
        },
        { status: 500 }
      );
    }

  } catch (err) {
    const error = err as Error;
    console.error('Error adding product:', error);
    return NextResponse.json({ 
      error: 'Failed to add product', 
      details: error.message 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    console.log('Fetching products...');
    
    // 1. First try to get products from MongoDB
    if (uri && uri !== 'undefined') {
      try {
        console.log('Attempting to connect to MongoDB...');
        const client = new MongoClient(uri);
        await client.connect();
        
        const db = client.db('dropship');
        const collection = db.collection('products');
        
        const dbProducts = await collection.find({}).toArray();
        await client.close();
        
        console.log(`Successfully fetched ${dbProducts.length} products from MongoDB`);
        return NextResponse.json({ 
          success: true,
          products: dbProducts,
          source: 'mongodb'
        });
      } catch (dbError) {
        console.error('MongoDB connection failed:', dbError);
        // Continue to fallback
      }
    }
    
    // 2. Fallback to in-memory products in development
    if (process.env.NODE_ENV === 'development') {
      if (global._products) {
        console.log('Using in-memory products (development fallback)');
        return NextResponse.json({
          success: true,
          products: global._products,
          source: 'memory'
        });
      }
      
      // 3. Final fallback to static products
      try {
        const { ALL_PRODUCTS } = await import('../../../lib/products');
        const jsonProducts = (ALL_PRODUCTS || []).map(product => ({
          ...product,
          price: typeof product.price === 'object' ? product.price.original : product.price,
          deliveryCharge: 0
        }));
        
        console.log(`Using ${jsonProducts.length} static products as fallback`);
        return NextResponse.json({
          success: true,
          products: jsonProducts,
          source: 'static'
        });
      } catch (err) {
        const error = err as Error;
        console.error('Error loading static products:', error);
      }
    }
    
    // If we get here, return empty array
    console.warn('No products found and no fallback available');
    return NextResponse.json({
      success: false,
      products: [],
      error: 'No products available'
    });
    
  } catch (err) {
    const error = err as Error;
    console.error('API Error:', error);
    return NextResponse.json({
      success: false,
      products: [],
      error: 'Failed to fetch products',
      details: error.message
    }, { status: 500 });
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