// app/api/mongo/orders/[orderId]/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    // ✅ এখন params.orderId সঠিকভাবে কাজ করবে
    const { orderId } = await params;
    
    console.log("🔍 Fetching order:", orderId);
    
    const client = await clientPromise;
    const db = client.db("kaazbazar");
    
    const order = await db.collection("orders").findOne({ orderId: orderId });
    
    if (!order) {
      return NextResponse.json({ 
        success: false, 
        error: "Order not found" 
      }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: order });
    
  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}