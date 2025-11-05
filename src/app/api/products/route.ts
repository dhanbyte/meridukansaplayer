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

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ MONGODB_URI is not defined in environment variables');
  console.log('Make sure you have a .env.local file with MONGODB_URI set');
}

// Helper function to mask sensitive information in logs
function maskMongoUri(uri: string | undefined): string {
  if (!uri) return 'Not set';
  return uri.replace(
    /(mongodb(?:\+srv)?:\/\/)([^:]+):[^@]+@/, 
    (_, protocol, user) => `${protocol}${user}:****@`
  );
}

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
  console.log('\n=== PRODUCTS API REQUEST STARTED ===');
  console.log('Environment:', process.env.NODE_ENV);
  console.log('MongoDB URI:', maskMongoUri(uri));
  
  try {
    
    // 1. First try to get products from MongoDB
    console.log('Environment Variables:', {
      NODE_ENV: process.env.NODE_ENV,
      MONGODB_URI_PRESENT: !!uri && uri !== 'undefined',
      MONGODB_URI_STARTS: uri ? uri.substring(0, 30) + '...' : 'Not set'
    });

    if (uri && uri !== 'undefined') {
      console.log('MongoDB URI found, attempting to connect...');
      
      // Log a masked version of the connection string for security
      const maskedUri = uri.replace(
        /(mongodb\+srv:\/\/)([^:]+):[^@]+@/, 
        (match, protocol, user) => `${protocol}${user}:****@`
      );
      console.log('Connection string:', maskedUri);
      
      let client;
      try {
        client = new MongoClient(uri, {
          serverApi: {
            version: '1',
            strict: true,
            deprecationErrors: true,
          },
          connectTimeoutMS: 5000,
          socketTimeoutMS: 10000,
        });
        
        console.log('Connecting to MongoDB...');
        await client.connect();
        console.log('Successfully connected to MongoDB');
        
        const db = client.db('dropship');
        console.log('Accessing database: dropship');
        
        const collection = db.collection('products');
        console.log('Accessing collection: products');
        
        const count = await collection.countDocuments();
        console.log(`Found ${count} documents in collection`);
        
        const dbProducts = await collection.find({}).toArray();
        console.log(`Successfully fetched ${dbProducts.length} products`);
        
        await client.close();
        
        // Also load JSON products and combine
        try {
          const { ALL_PRODUCTS } = await import('../../../lib/products');
          const jsonProducts = (ALL_PRODUCTS || []).map((product: any) => ({
            ...product,
            price: typeof product.price === 'object' ? 
              (product.price.discounted || product.price.original) : product.price,
            originalPrice: typeof product.price === 'object' ? product.price.original : undefined,
            deliveryCharge: 0 // JSON products have no delivery charge
          }));
          
          // Remove duplicates by ID
          const seenIds = new Set();
          const combinedProducts = [...dbProducts, ...jsonProducts].filter(product => {
            if (seenIds.has(product.id)) {
              return false;
            }
            seenIds.add(product.id);
            return true;
          });
          
          console.log(`Combined products: ${dbProducts.length} from DB + ${jsonProducts.length} from JSON = ${combinedProducts.length} total`);
          
          return NextResponse.json({ 
            success: true,
            products: combinedProducts,
            source: 'combined',
            dbCount: dbProducts.length,
            jsonCount: jsonProducts.length,
            totalCount: combinedProducts.length
          });
        } catch (jsonError) {
          console.error('Error loading JSON products:', jsonError);
          // Return only DB products if JSON fails
          return NextResponse.json({ 
            success: true,
            products: dbProducts,
            source: 'mongodb-only',
            count: dbProducts.length
          });
        }
      } catch (error) {
        const dbError = error as Error & { code?: string; errorLabels?: string[]; };
        
        console.error('\n=== MONGODB CONNECTION ERROR ===');
        console.error('Error name:', dbError.name);
        console.error('Error code:', dbError.code);
        console.error('Error message:', dbError.message);
        
        if ('errorLabels' in dbError) {
          console.error('Error labels:', dbError.errorLabels);
        }
        
        // Common MongoDB error patterns
        if (dbError.message.includes('ECONNREFUSED')) {
          console.error('\n❌ Cannot connect to MongoDB server. Please check if:');
          console.error('1. Your MongoDB server is running');
          console.error('2. The connection string is correct');
          console.error('3. Your IP is whitelisted in MongoDB Atlas (if using Atlas)');
        } 
        else if (dbError.message.includes('bad auth') || dbError.message.includes('Authentication failed')) {
          console.error('\n🔑 Authentication failed. Please check:');
          console.error('1. Your MongoDB username and password');
          console.error('2. If the user has the correct permissions');
        }
        else if (dbError.message.includes('ENOTFOUND')) {
          console.error('\n🔍 Could not resolve MongoDB host. Please check:');
          console.error('1. Your internet connection');
          console.error('2. The MongoDB hostname in the connection string');
          console.error('3. Your DNS settings');
        }
        else if (dbError.message.includes('ETIMEDOUT')) {
          console.error('\n⏱️  Connection timed out. Please check:');
          console.error('1. Your internet connection');
          console.error('2. If your MongoDB server is accessible from your network');
          console.error('3. Firewall settings that might be blocking the connection');
        }
        
        console.error('\nFalling back to alternative data source...');
      } finally {
        if (client) {
          try {
            await client.close();
          } catch (e) {
            console.error('Error closing MongoDB connection:', e);
          }
        }
      }
    }
    
  
    // 2. Fallback to static products
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Node Version:', process.version);
    
    // Try to load static products as fallback
    try {
      const { ALL_PRODUCTS } = await import('../../../lib/products');
      const jsonProducts = (ALL_PRODUCTS || []).map((product: any) => ({
        ...product,
        price: typeof product.price === 'object' ? 
          (product.price.discounted || product.price.original) : product.price,
        originalPrice: typeof product.price === 'object' ? product.price.original : undefined,
        deliveryCharge: 0
      }));
      
      console.log(`Using ${jsonProducts.length} static products as fallback`);
      return NextResponse.json({
        success: true,
        products: jsonProducts,
        source: 'static-fallback',
        message: 'Using static products as fallback',
        count: jsonProducts.length
      });
    } catch (error) {
      console.error('Error loading static products:', error);
    }
      
    // If we get here, try in-memory products (development only)
    if (process.env.NODE_ENV === 'development') {
      if (global._products) {
        console.log('Using in-memory products (development fallback)');
        return NextResponse.json({
          success: true,
          products: global._products,
          source: 'memory'
        });
      }
    }
    
    // Final fallback - return empty array
    console.log('No products found in any source');
    return NextResponse.json({
      success: true,
      products: [],
      source: 'none',
      message: 'No products found in any source',
      count: 0
    });
  } catch (err) {
    const error = err as Error;
    console.error('\n❌ API ERROR:', error);
    console.error('Error stack:', error.stack);
    
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: 'Failed to fetch products',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } finally {
    console.log('=== PRODUCTS API REQUEST COMPLETED ===\n');
  }
}

export async function PUT(request: NextRequest) {
  console.log('\n=== UPDATE PRODUCT REQUEST STARTED ===');
  
  if (!uri) {
    const error = new Error('MongoDB URI is not configured');
    console.error(error.message);
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: 'Database configuration error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  
  try {
    const body = await request.json();
    const { id, name, price, image, stock, weight, category } = body;
    
    console.log('Updating product:', { id, name });
    
    // At this point, TypeScript knows uri is defined
    const client = new MongoClient(uri, {
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
      },
      connectTimeoutMS: 5000,
      socketTimeoutMS: 10000,
    });
    
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