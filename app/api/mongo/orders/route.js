import dbConnect from "@/lib/mongoose";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { customerId, providerId, ...orderData } = body;
    
    // Generate unique order ID
    const uniqueOrderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    
    const order = new Order({
      orderId: uniqueOrderId,
      customerId: customerId,
      providerId: providerId,
      ...orderData,
      status: "pending",
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const savedOrder = await order.save();
    
    return NextResponse.json({ 
      success: true, 
      data: savedOrder,
      message: "Order created successfully" 
    });
    
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}