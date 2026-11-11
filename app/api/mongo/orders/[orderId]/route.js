// app/api/mongo/orders/[orderId]/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const dynamic = 'force-dynamic';

// GET - Get single order
export async function GET(request, { params }) {
  try {
    const { orderId } = await params;
    
    console.log("🔍 Fetching order:", orderId);
    
    const client = await clientPromise;
    const db = client.db("kaazbazar");
    
    // Try to find by orderId field first
    let order = await db.collection("orders").findOne({ orderId: orderId });
    
    // If not found, try by MongoDB _id
    if (!order && ObjectId.isValid(orderId)) {
      order = await db.collection("orders").findOne({ _id: new ObjectId(orderId) });
    }
    
    if (!order) {
      console.log("❌ Order not found:", orderId);
      return NextResponse.json({ 
        success: false, 
        error: "Order not found" 
      }, { status: 404 });
    }
    
    console.log("✅ Order found:", order.orderId);
    return NextResponse.json({ success: true, data: order });
    
  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

// PUT - Update order status
export async function PUT(request, { params }) {
  try {
    const { orderId } = await params;
    const updates = await request.json();
    
    console.log("📝 Updating order:", orderId, updates);
    
    const client = await clientPromise;
    const db = client.db("kaazbazar");
    
    // Find by orderId field or MongoDB _id
    let filter = { orderId: orderId };
    if (!orderId.startsWith("ORD-") && ObjectId.isValid(orderId)) {
      filter = { _id: new ObjectId(orderId) };
    }
    
    const result = await db.collection("orders").updateOne(
      filter,
      { 
        $set: { 
          ...updates, 
          updatedAt: new Date() 
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Order not found" 
      }, { status: 404 });
    }
    
    const updatedOrder = await db.collection("orders").findOne(filter);
    
    return NextResponse.json({ success: true, data: updatedOrder });
    
  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

// DELETE - Cancel order (not actually delete, just update status)
export async function DELETE(request, { params }) {
  try {
    const { orderId } = await params;
    
    console.log("🗑️ Cancelling order:", orderId);
    
    const client = await clientPromise;
    const db = client.db("kaazbazar");
    
    let filter = { orderId: orderId };
    if (!orderId.startsWith("ORD-") && ObjectId.isValid(orderId)) {
      filter = { _id: new ObjectId(orderId) };
    }
    
    const result = await db.collection("orders").updateOne(
      filter,
      { 
        $set: { 
          status: "cancelled", 
          cancelledAt: new Date(),
          updatedAt: new Date(),
          cancelledBy: "customer"
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Order not found or cannot be cancelled" 
      }, { status: 404 });
    }
    
    const cancelledOrder = await db.collection("orders").findOne(filter);
    
    return NextResponse.json({ success: true, data: cancelledOrder });
    
  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}