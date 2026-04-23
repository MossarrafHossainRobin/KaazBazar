import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// Build time এ error এড়ানোর জন্য
export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    // Check if MongoDB URI exists
    if (!process.env.MONGODB_URI) {
      console.error("❌ MONGODB_URI is not defined");
      return NextResponse.json({ 
        success: false, 
        error: "Database configuration missing" 
      }, { status: 500 });
    }

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

export async function PUT(request, { params }) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ 
        success: false, 
        error: "Database configuration missing" 
      }, { status: 500 });
    }

    const { orderId } = await params;
    const updates = await request.json();
    
    const client = await clientPromise;
    const db = client.db("kaazbazar");
    
    const result = await db.collection("orders").updateOne(
      { orderId: orderId },
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
    
    const updatedOrder = await db.collection("orders").findOne({ orderId: orderId });
    
    return NextResponse.json({ success: true, data: updatedOrder });
    
  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ 
        success: false, 
        error: "Database configuration missing" 
      }, { status: 500 });
    }

    const { orderId } = await params;
    
    const client = await clientPromise;
    const db = client.db("kaazbazar");
    
    const result = await db.collection("orders").updateOne(
      { orderId: orderId, status: "pending" },
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
    
    const cancelledOrder = await db.collection("orders").findOne({ orderId: orderId });
    
    return NextResponse.json({ success: true, data: cancelledOrder });
    
  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}