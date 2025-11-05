import { MongoClient } from 'mongodb';

// Production MongoDB Atlas URI or fallback to localhost
const uri = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/shopwave';

if (!process.env.MONGODB_URI && !process.env.DATABASE_URL) {
  console.warn('No MongoDB URI found in environment variables, using localhost fallback');
}

const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  retryWrites: true,
  w: 'majority'
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Create connection with error handling
const createConnection = async (): Promise<MongoClient> => {
  try {
    const mongoClient = new MongoClient(uri, options);
    await mongoClient.connect();
    console.log('MongoDB connected successfully');
    return mongoClient;
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    // Return a mock client that throws errors for hosting compatibility
    throw new Error('Database connection unavailable');
  }
};

if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    globalWithMongo._mongoClientPromise = createConnection();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  clientPromise = createConnection();
}

export default clientPromise;