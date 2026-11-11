// lib/notificationService.js
import { db } from "@/lib/firebaseClient";
import { collection, addDoc, query, where, getDocs, updateDoc, doc, orderBy, limit, onSnapshot, serverTimestamp } from "firebase/firestore";

// Request notification permission
export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === "granted";
}

// Send browser notification
export function sendBrowserNotification(title, body, icon = "/favicon.ico") {
  if (!("Notification" in window)) {
    return;
  }

  if (Notification.permission === "granted") {
    const notification = new Notification(title, {
      body: body,
      icon: icon,
      badge: icon,
      vibrate: [200, 100, 200],
      silent: false,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    setTimeout(() => {
      notification.close();
    }, 5000);
  }
}

// Check if notification already exists
async function notificationExists(userId, type, orderId, action) {
  try {
    // Check in root notifications
    const rootNotificationsRef = collection(db, "notifications");
    const rootQ = query(
      rootNotificationsRef,
      where("userId", "==", userId),
      where("type", "==", type),
      where("orderId", "==", orderId)
    );
    const rootSnapshot = await getDocs(rootQ);
    
    if (!rootSnapshot.empty) {
      return true;
    }
    
    // Check in user's nested notifications
    const userNotificationsRef = collection(db, "users", userId, "notifications");
    const userQ = query(
      userNotificationsRef,
      where("type", "==", type),
      where("orderId", "==", orderId)
    );
    const userSnapshot = await getDocs(userQ);
    
    return !userSnapshot.empty;
  } catch (error) {
    console.error("Error checking notification existence:", error);
    return false;
  }
}

// Generate composite key for notification
function generateNotificationKey(userId, type, orderId, action) {
  return `${userId}_${type}_${orderId}_${action}`;
}

// Create notification in database (with duplicate prevention)
export async function createNotification(userId, notificationData) {
  try {
    // Generate composite key to prevent duplicates
    const compositeKey = generateNotificationKey(
      userId, 
      notificationData.type, 
      notificationData.orderId || "general",
      notificationData.action || "default"
    );
    
    // Check if notification already exists
    const exists = await notificationExists(
      userId, 
      notificationData.type, 
      notificationData.orderId,
      notificationData.action
    );
    
    if (exists) {
      console.log(`Notification already exists for ${userId} - ${notificationData.type} - ${notificationData.orderId}`);
      return { success: true, duplicate: true };
    }
    
    // Store in root notifications collection
    const rootNotificationRef = collection(db, "notifications");
    const rootNotification = {
      userId: userId,
      title: notificationData.title,
      message: notificationData.body,
      type: notificationData.type,
      orderId: notificationData.orderId || null,
      link: notificationData.link || null,
      compositeKey: compositeKey,
      read: false,
      createdAt: serverTimestamp()
    };
    await addDoc(rootNotificationRef, rootNotification);
    
    // Also store in user's nested collection
    const userNotificationRef = collection(db, "users", userId, "notifications");
    const newNotification = {
      title: notificationData.title,
      body: notificationData.body,
      type: notificationData.type,
      orderId: notificationData.orderId || null,
      conversationId: notificationData.conversationId || null,
      link: notificationData.link || null,
      compositeKey: compositeKey,
      read: false,
      createdAt: serverTimestamp()
    };
    await addDoc(userNotificationRef, newNotification);
    
    // Send browser notification
    sendBrowserNotification(notificationData.title, notificationData.body);
    
    return { success: true, duplicate: false };
  } catch (error) {
    console.error("Error creating notification:", error);
    return { success: false, error: error.message };
  }
}

// Get user notifications
export async function getUserNotifications(userId) {
  try {
    const notificationsRef = collection(db, "users", userId, "notifications");
    const q = query(notificationsRef, orderBy("createdAt", "desc"), limit(50));
    const querySnapshot = await getDocs(q);
    
    const notifications = [];
    querySnapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, data: notifications };
  } catch (error) {
    console.error("Error getting notifications:", error);
    return { success: false, data: [] };
  }
}

// Mark notification as read
export async function markNotificationAsRead(userId, notificationId) {
  try {
    const notificationRef = doc(db, "users", userId, "notifications", notificationId);
    await updateDoc(notificationRef, { read: true });
    return { success: true };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { success: false };
  }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(userId) {
  try {
    const notificationsRef = collection(db, "users", userId, "notifications");
    const q = query(notificationsRef, where("read", "==", false));
    const querySnapshot = await getDocs(q);
    
    const updatePromises = [];
    querySnapshot.forEach((doc) => {
      updatePromises.push(updateDoc(doc.ref, { read: true }));
    });
    
    await Promise.all(updatePromises);
    return { success: true };
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return { success: false };
  }
}

// Listen to real-time notifications
export function listenToNotifications(userId, callback) {
  const notificationsRef = collection(db, "users", userId, "notifications");
  const q = query(notificationsRef, orderBy("createdAt", "desc"), limit(30));
  
  return onSnapshot(q, (snapshot) => {
    const notifications = [];
    snapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() });
    });
    callback(notifications);
  });
}

// ========== ORDER NOTIFICATION FUNCTIONS ==========

// Send notification when order is placed
export async function sendOrderPlacedNotification(orderData) {
  const { customerId, customerName, providerId, providerName, serviceName, orderId, scheduledDate, scheduledTime, address } = orderData;
  
  // Notify customer
  await createNotification(customerId, {
    title: "🛍️ Order Placed Successfully!",
    body: `Your order for ${serviceName} has been placed. Provider will confirm within 30 minutes. Order #${orderId.slice(-8)}`,
    type: "order_placed",
    orderId: orderId,
    action: "placed",
    link: "/my-orders"
  });
  
  // Notify provider
  await createNotification(providerId, {
    title: "📦 New Order Received!",
    body: `${customerName} booked ${serviceName} on ${scheduledDate} at ${scheduledTime}. Please confirm within 30 minutes.`,
    type: "new_order",
    orderId: orderId,
    action: "received",
    link: `/provider/orders/${orderId}`
  });
}

// Send notification when order is confirmed
export async function sendOrderConfirmedNotification(orderData) {
  const { customerId, providerName, serviceName, orderId, scheduledDate, scheduledTime, providerId } = orderData;
  
  // Notify customer
  await createNotification(customerId, {
    title: "✅ Order Confirmed!",
    body: `Great news! ${providerName} has confirmed your ${serviceName} service on ${scheduledDate} at ${scheduledTime}.`,
    type: "order_confirmed",
    orderId: orderId,
    action: "confirmed",
    link: `/my-orders`
  });
  
  // Notify provider
  await createNotification(providerId, {
    title: "✅ Order Confirmed Successfully",
    body: `You have confirmed the order for ${serviceName} on ${scheduledDate} at ${scheduledTime}.`,
    type: "order_confirmed",
    orderId: orderId,
    action: "confirmed",
    link: `/provider/orders/${orderId}`
  });
}

// Send notification when order is cancelled (WITH DUPLICATE PREVENTION)
export async function sendOrderCancelledNotification(orderData) {
  const { customerId, providerId, customerName, providerName, serviceName, orderId, cancelledBy } = orderData;
  
  // Generate unique keys for this cancellation event
  const cancellationKey = `cancelled_${Date.now()}`;
  
  if (cancelledBy === "customer") {
    // Notify provider - only once per cancellation
    await createNotification(providerId, {
      title: "❌ Order Cancelled by Customer",
      body: `${customerName} has cancelled the ${serviceName} service request.`,
      type: "order_cancelled",
      orderId: orderId,
      action: `cancelled_by_customer_${cancellationKey}`,
      link: `/provider/orders`
    });
    
    // Notify customer - only once per cancellation
    await createNotification(customerId, {
      title: "❌ Order Cancelled",
      body: `You have cancelled your ${serviceName} service request.`,
      type: "order_cancelled",
      orderId: orderId,
      action: `cancelled_by_customer_${cancellationKey}`,
      link: `/my-orders`
    });
  } else if (cancelledBy === "provider") {
    // Notify customer - only once per cancellation
    await createNotification(customerId, {
      title: "❌ Order Cancelled by Provider",
      body: `${providerName} has cancelled your ${serviceName} service request. Please book another provider.`,
      type: "order_cancelled",
      orderId: orderId,
      action: `cancelled_by_provider_${cancellationKey}`,
      link: `/my-orders`
    });
    
    // Notify provider - only once per cancellation
    await createNotification(providerId, {
      title: "❌ Order Cancelled",
      body: `You have cancelled the ${serviceName} service request for ${customerName}.`,
      type: "order_cancelled",
      orderId: orderId,
      action: `cancelled_by_provider_${cancellationKey}`,
      link: `/provider/orders`
    });
  }
}

// Send notification when order is completed
export async function sendOrderCompletedNotification(orderData) {
  const { customerId, providerId, customerName, providerName, serviceName, orderId } = orderData;
  
  const completionKey = `completed_${Date.now()}`;
  
  // Notify customer
  await createNotification(customerId, {
    title: "🎉 Service Completed!",
    body: `Your ${serviceName} service with ${providerName} has been completed. Thank you for choosing Kaazbazar!`,
    type: "order_completed",
    orderId: orderId,
    action: completionKey,
    link: `/my-orders`
  });
  
  // Notify provider
  await createNotification(providerId, {
    title: "🎉 Service Completed Successfully",
    body: `${customerName} has confirmed the completion of ${serviceName} service.`,
    type: "order_completed",
    orderId: orderId,
    action: completionKey,
    link: `/provider/orders/${orderId}`
  });
}

// Send message notification
export async function sendMessageNotification(receiverId, senderName, message, conversationId, orderId = null) {
  const messageKey = `msg_${Date.now()}`;
  
  await createNotification(receiverId, {
    title: `💬 New message from ${senderName}`,
    body: message.length > 100 ? message.substring(0, 100) + "..." : message,
    type: "message",
    conversationId: conversationId,
    orderId: orderId,
    action: messageKey,
    senderName: senderName,
    link: `/messages/${conversationId}`
  });
}

// Export all functions
export default {
  requestNotificationPermission,
  sendBrowserNotification,
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  listenToNotifications,
  sendOrderPlacedNotification,
  sendOrderConfirmedNotification,
  sendOrderCancelledNotification,
  sendOrderCompletedNotification,
  sendMessageNotification
};