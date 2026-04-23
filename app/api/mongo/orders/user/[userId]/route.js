// app/api/mongo/orders/user/[userId]/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { userId } = await params;
    
    console.log("🔍 Fetching all orders for user:", userId);
    
    const client = await clientPromise;
    const db = client.db("kaazbazar");
    
    // যেখানে ইউজার customer অথবা provider
    const orders = await db.collection("orders")
      .find({ 
        $or: [
          { customerId: userId },
          { providerId: userId }
        ]
      })
      .sort({ createdAt: -1 })
      .toArray();
    
    // প্রতিটি order এ user role যোগ করুন
    const ordersWithRole = orders.map(order => ({
      ...order,
      userRole: order.customerId === userId ? "customer" : "provider"
    }));
    
    console.log(`✅ Found ${ordersWithRole.length} orders for user ${userId}`);
    
    return NextResponse.json({ 
      success: true, 
      data: ordersWithRole,
      count: ordersWithRole.length
    });
    
  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}