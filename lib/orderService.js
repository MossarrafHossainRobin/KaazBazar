// lib/orderService.js
import { db } from "@/lib/firebaseClient";
import { doc, updateDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

export async function updateOrderStatus(orderId, status) {
  try {
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, { 
      status, 
      updatedAt: new Date().toISOString(),
      ...(status === "completed" && { completedAt: new Date().toISOString() })
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating order status:", error);
    return { success: false, error: error.message };
  }
}

export async function getUserOrders(userId) {
  try {
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, where("customerId", "==", userId));
    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { success: true, data: orders };
  } catch (error) {
    return { success: false, error: error.message, data: [] };
  }
}