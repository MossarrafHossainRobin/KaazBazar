// C:\Users\rh503\OneDrive\Documents\Kaazbazar\app\test-db.js
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env.local ফাইল লোড করুন
const envPath = path.resolve(__dirname, '../.env.local');
console.log('📁 Looking for .env.local at:', envPath);

dotenv.config({ path: envPath });

async function testDirectConnection() {
  console.log('\n🔌 Testing DIRECT MongoDB Connection...');
  console.log('📡 Connection string exists:', !!process.env.MONGODB_URI);
  
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env.local');
    return;
  }
  
  // Hide password in log
  const hiddenUri = process.env.MONGODB_URI.replace(/\/\/.*@/, '//****:****@');
  console.log('🔗 Using:', hiddenUri.substring(0, 100) + '...');
  
  const client = new MongoClient(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });
  
  try {
    console.log('⏳ Connecting to MongoDB Atlas...');
    await client.connect();
    console.log('✅ DIRECT Connection successful!');
    
    const db = client.db('kaazbazar');
    console.log('📊 Database Name:', db.databaseName);
    
    // List all collections
    console.log('\n📁 Collections in database:');
    const collections = await db.listCollections().toArray();
    if (collections.length === 0) {
      console.log('   (No collections yet)');
    } else {
      collections.forEach(c => console.log('   📄', c.name));
    }
    
    // Test write operation
    console.log('\n📝 Testing write operation...');
    const testCollection = db.collection('connection_test');
    
    const testDoc = {
      testId: Date.now(),
      message: 'DIRECT MongoDB connection successful!',
      timestamp: new Date(),
      type: 'direct_test'
    };
    
    const result = await testCollection.insertOne(testDoc);
    console.log('✅ Write successful! Document ID:', result.insertedId);
    
    // Test read operation
    console.log('📖 Testing read operation...');
    const readDoc = await testCollection.findOne({ _id: result.insertedId });
    console.log('✅ Read successful:', readDoc.message);
    
    // Cleanup
    console.log('🧹 Cleaning up...');
    await testCollection.deleteOne({ _id: result.insertedId });
    console.log('✅ Cleanup successful');
    
    console.log('\n🎉 DIRECT MongoDB connection is PERFECT!');
    console.log('💡 Use this connection string for Vercel as well.\n');
    
  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);
    
    if (error.message.includes('Authentication failed')) {
      console.error('\n💡 Authentication Issue:');
      console.error('1. Check username: kaazbazar_database');
      console.error('2. Check password: KaazBazar@2026 (URL encoded: KaazBazar%402026)');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Network Issue:');
      console.error('1. Check your internet connection');
      console.error('2. Check if MongoDB Atlas IP whitelist has 0.0.0.0/0');
    }
  } finally {
    await client.close();
    console.log('🔌 Connection closed.\n');
  }
}

// Run the test
testDirectConnection();