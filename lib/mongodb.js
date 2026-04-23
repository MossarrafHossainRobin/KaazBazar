// lib/mongodb.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {};

// Build time error এড়ানোর জন্য
if (!uri && process.env.NODE_ENV === 'production') {
  console.warn('⚠️ MONGODB_URI is not defined in environment variables');
}

let client;
let clientPromise;

if (!uri) {
  // Development এ fallback (optional)
  if (process.env.NODE_ENV === 'development') {
    console.warn('⚠️ MONGODB_URI not found, using fallback (data will not be saved)');
    // Create a dummy client that won't actually connect
    clientPromise = Promise.resolve(null);
  } else {
    throw new Error('Please define MONGODB_URI in environment variables');
  }
} else {
  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
}

export default clientPromise;