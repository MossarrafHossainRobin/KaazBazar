// app/api/mongo/orders/customer/[userId]/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { userId } = await params;
    
    console.log("🔍 Fetching orders for customer:", userId);
    
    const client = await clientPromise;
    const db = client.db("kaazbazar");
    
    const orders = await db.collection("orders")
      .find({ customerId: userId })
      .sort({ createdAt: -1 })
      .toArray();
    
    console.log(`✅ Found ${orders.length} orders for customer ${userId}`);
    
    return NextResponse.json({ 
      success: true, 
      data: orders,
      count: orders.length
    });
    
  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}