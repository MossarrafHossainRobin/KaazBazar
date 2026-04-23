import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { MongoClient } from 'mongodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function testConnection() {
  console.log('\n🔌 Connecting to MongoDB...');

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ MONGODB_URI not found in .env.local');
    return;
  }

  // Hide password in log
  console.log('📡 Using URI:', uri.replace(/\/\/.*@/, '//****:****@'));

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected successfully!');

    const db = client.db(); // auto uses DB from URI
    console.log('📊 Database:', db.databaseName);

    // Test insert
    const collection = db.collection('test_connection');

    const result = await collection.insertOne({
      message: 'MongoDB working ✅',
      createdAt: new Date(),
    });

    console.log('✅ Inserted ID:', result.insertedId);

    // Clean up
    await collection.deleteOne({ _id: result.insertedId });
    console.log('🧹 Cleanup done');

    console.log('\n🎉 MongoDB setup is PERFECT!');
  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error('Error:', error.message);
  } finally {
    await client.close();
  }
}

testConnection();