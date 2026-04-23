// app/api/mongo/service-providers/[userId]/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { userId } = await params;
    
    console.log("🔍 Checking if user is provider:", userId);
    
    const client = await clientPromise;
    const db = client.db("kaazbazar");
    
    // Check if user exists in serviceProviders collection
    const provider = await db.collection("serviceProviders").findOne({ 
      $or: [
        { userId: userId },
        { id: userId }
      ]
    });
    
    const isProvider = !!provider;
    
    console.log(`✅ User ${userId} is ${isProvider ? 'a provider' : 'not a provider'}`);
    
    return NextResponse.json({ 
      success: true, 
      exists: isProvider,
      data: provider || null
    });
    
  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json({ 
      success: false, 
      exists: false,
      error: error.message 
    }, { status: 500 });
  }
}