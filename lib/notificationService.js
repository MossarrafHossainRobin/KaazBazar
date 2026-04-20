// lib/notificationService.js
import { db } from "@/lib/firebaseClient";
import { collection, addDoc, query, where, getDocs, updateDoc, doc, orderBy, limit, onSnapshot } from "firebase/firestore";

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
export function sendBrowserNotification(title, body, icon = "/logo.png") {
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

// Create notification in database
export async function createNotification(userId, notificationData) {
  try {
    const notificationsRef = collection(db, "users", userId, "notifications");
    const newNotification = {
      ...notificationData,
      createdAt: new Date().toISOString(),
      read: false,
      id: Date.now().toString()
    };
    await addDoc(notificationsRef, newNotification);
    
    // Also send browser notification if user is online
    sendBrowserNotification(notificationData.title, notificationData.body);
    
    return { success: true, data: newNotification };
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
  const q = query(notificationsRef, orderBy("createdAt", "desc"), limit(20));
  
  return onSnapshot(q, (snapshot) => {
    const notifications = [];
    snapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() });
    });
    callback(notifications);
  });
}

// Send order notification
export async function sendOrderNotification(orderData) {
  // Notify customer
  await createNotification(orderData.customerId, {
    title: "Order Confirmed",
    body: `Your order #${orderData.orderId} has been confirmed. Provider will contact you soon.`,
    type: "order",
    orderId: orderData.orderId,
    image: orderData.providerPhotoURL,
    link: `/order-tracking/${orderData.orderId}`
  });
  
  // Notify provider
  await createNotification(orderData.providerId, {
    title: "New Order Received",
    body: `${orderData.customerName} has placed an order for ${orderData.serviceName}.`,
    type: "order",
    orderId: orderData.orderId,
    image: orderData.customerPhotoURL,
    link: `/order-tracking/${orderData.orderId}`
  });
}

// Send message notification
export async function sendMessageNotification(receiverId, senderName, message, conversationId) {
  await createNotification(receiverId, {
    title: `New message from ${senderName}`,
    body: message.length > 100 ? message.substring(0, 100) + "..." : message,
    type: "message",
    conversationId: conversationId,
    senderName: senderName,
    link: "/dashboard?tab=messages"
  });
}