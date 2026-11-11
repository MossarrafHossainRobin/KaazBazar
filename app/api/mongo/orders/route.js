// app/api/mongo/orders/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const dynamic = 'force-dynamic';

// GET - Get all orders (with optional filters)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const providerId = searchParams.get('providerId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const client = await clientPromise;
    const db = client.db("kaazbazar");
    
    let query = {};
    if (customerId) query.customerId = customerId;
    if (providerId) query.providerId = providerId;
    if (status) query.status = status;
    
    const orders = await db.collection("orders")
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
    
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

// POST - Create new order
export async function POST(request) {
  try {
    const body = await request.json();
    
    const client = await clientPromise;
    const db = client.db("kaazbazar");
    
    // Generate unique order ID
    const uniqueOrderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    
    const order = {
      ...body,
      orderId: uniqueOrderId,
      status: body.status || "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes expiry
    };
    
    const result = await db.collection("orders").insertOne(order);
    
    return NextResponse.json({ 
      success: true, 
      data: { ...order, _id: result.insertedId } 
    });
    
  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}