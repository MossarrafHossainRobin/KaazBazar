// Import directly from firebase to ensure functions are available
import { 
  db,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc
} from "@/lib/firebase";

// Import these directly from firebase/firestore
import { orderBy, limit, increment } from "firebase/firestore";

// ============ USER PROFILE ============
export async function getUserProfile(userId) {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { success: true, data: userSnap.data() };
    }
    return { success: false, error: "User not found" };
  } catch (error) {
    console.error("Error getting user profile:", error);
    return { success: false, error: error.message };
  }
}

export async function updateUserProfile(userId, updateData) {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      ...updateData,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return { success: false, error: error.message };
  }
}

export async function saveUserProfile(userId, userData) {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, userData, { merge: true });
    return { success: true };
  } catch (error) {
    console.error("Error saving user profile:", error);
    return { success: false, error: error.message };
  }
}

// ============ ORDERS ============
export async function createOrder(orderData) {
  try {
    const ordersRef = collection(db, "orders");
    const newOrder = {
      ...orderData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "pending"
    };
    const docRef = await addDoc(ordersRef, newOrder);
    return { success: true, orderId: docRef.id, data: { id: docRef.id, ...newOrder } };
  } catch (error) {
    console.error("Error creating order:", error);
    return { success: false, error: error.message };
  }
}

export async function getUserOrders(userId, role = "customer") {
  try {
    const ordersRef = collection(db, "orders");
    const field = role === "customer" ? "customerId" : "providerId";
    const q = query(ordersRef, where(field, "==", userId), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    const orders = [];
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: orders };
  } catch (error) {
    console.error("Error getting user orders:", error);
    return { success: false, error: error.message };
  }
}

export async function updateOrderStatus(orderId, status) {
  try {
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
      status: status,
      updatedAt: new Date().toISOString(),
      ...(status === "completed" && { completedAt: new Date().toISOString() })
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating order status:", error);
    return { success: false, error: error.message };
  }
}

// ============ SAVED ITEMS ============
export async function saveItem(userId, itemData) {
  try {
    const savedRef = collection(db, "users", userId, "savedItems");
    const existing = await getDocs(query(savedRef, where("itemId", "==", itemData.itemId)));
    
    if (!existing.empty) {
      return { success: false, error: "Item already saved" };
    }
    
    await addDoc(savedRef, {
      ...itemData,
      savedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error("Error saving item:", error);
    return { success: false, error: error.message };
  }
}

export async function getSavedItems(userId) {
  try {
    const savedRef = collection(db, "users", userId, "savedItems");
    const q = query(savedRef, orderBy("savedAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    const items = [];
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: items };
  } catch (error) {
    console.error("Error getting saved items:", error);
    return { success: false, error: error.message };
  }
}

export async function removeSavedItem(userId, savedItemId) {
  try {
    const itemRef = doc(db, "users", userId, "savedItems", savedItemId);
    await deleteDoc(itemRef);
    return { success: true };
  } catch (error) {
    console.error("Error removing saved item:", error);
    return { success: false, error: error.message };
  }
}

// ============ ACTIVITIES ============
export async function addActivity(userId, activityData) {
  try {
    const activitiesRef = collection(db, "users", userId, "activities");
    await addDoc(activitiesRef, {
      ...activityData,
      timestamp: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error("Error adding activity:", error);
    return { success: false, error: error.message };
  }
}

export async function getUserActivities(userId, limitCount = 20) {
  try {
    const activitiesRef = collection(db, "users", userId, "activities");
    const q = query(activitiesRef, orderBy("timestamp", "desc"), limit(limitCount));
    const querySnapshot = await getDocs(q);
    
    const activities = [];
    querySnapshot.forEach((doc) => {
      activities.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: activities };
  } catch (error) {
    console.error("Error getting activities:", error);
    return { success: false, error: error.message };
  }
}

// ============ MESSAGES ============
export async function sendMessage(conversationId, messageData) {
  try {
    const messagesRef = collection(db, "conversations", conversationId, "messages");
    const newMessage = {
      ...messageData,
      timestamp: new Date().toISOString(),
      read: false
    };
    const docRef = await addDoc(messagesRef, newMessage);
    
    // Update conversation last message
    const convRef = doc(db, "conversations", conversationId);
    await updateDoc(convRef, {
      lastMessage: messageData.text,
      lastMessageTime: new Date().toISOString(),
      [`unreadCount.${messageData.receiverId}`]: increment(1)
    });
    
    return { success: true, messageId: docRef.id };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, error: error.message };
  }
}

export async function getConversations(userId) {
  try {
    const conversationsRef = collection(db, "conversations");
    const q = query(
      conversationsRef, 
      where("participants", "array-contains", userId),
      orderBy("lastMessageTime", "desc")
    );
    const querySnapshot = await getDocs(q);
    
    const conversations = [];
    querySnapshot.forEach((doc) => {
      conversations.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: conversations };
  } catch (error) {
    console.error("Error getting conversations:", error);
    return { success: false, error: error.message };
  }
}

export async function getMessages(conversationId) {
  try {
    const messagesRef = collection(db, "conversations", conversationId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));
    const querySnapshot = await getDocs(q);
    
    const messages = [];
    querySnapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: messages };
  } catch (error) {
    console.error("Error getting messages:", error);
    return { success: false, error: error.message };
  }
}

// ============ SETTINGS ============
export async function updateUserSettings(userId, settings) {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      settings: settings,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating settings:", error);
    return { success: false, error: error.message };
  }
}

// ============ SELLER APPLICATION ============
export async function applyForSeller(userId, applicationData) {
  try {
    const applicationsRef = collection(db, "sellerApplications");
    await addDoc(applicationsRef, {
      userId: userId,
      ...applicationData,
      status: "pending",
      appliedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error("Error applying for seller:", error);
    return { success: false, error: error.message };
  }
}

// ============ HELP & SUPPORT ============
export async function submitSupportTicket(userId, ticketData) {
  try {
    const ticketsRef = collection(db, "supportTickets");
    await addDoc(ticketsRef, {
      userId: userId,
      ...ticketData,
      status: "open",
      createdAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error("Error submitting support ticket:", error);
    return { success: false, error: error.message };
  }
}

// Add these functions to existing firestoreService.js

// ============ SERVICE PROVIDERS ============
export async function createServiceProvider(userId, providerData) {
  try {
    const providerRef = doc(db, "serviceProviders", userId);
    await setDoc(providerRef, {
      ...providerData,
      userId: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      totalBookings: 0,
      rating: 0,
      reviews: []
    }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error("Error creating service provider:", error);
    return { success: false, error: error.message };
  }
}

export async function getServiceProvider(userId) {
  try {
    const providerRef = doc(db, "serviceProviders", userId);
    const providerSnap = await getDoc(providerRef);
    
    if (providerSnap.exists()) {
      return { success: true, data: providerSnap.data() };
    }
    return { success: false, error: "Provider not found" };
  } catch (error) {
    console.error("Error getting service provider:", error);
    return { success: false, error: error.message };
  }
}

export async function getAllServiceProviders(category = null) {
  try {
    let providersRef = collection(db, "serviceProviders");
    let q = providersRef;
    
    if (category && category !== "all") {
      q = query(providersRef, where("category", "==", category));
    }
    
    const querySnapshot = await getDocs(q);
    
    const providers = [];
    querySnapshot.forEach((doc) => {
      providers.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, data: providers };
  } catch (error) {
    console.error("Error getting service providers:", error);
    return { success: false, error: error.message };
  }
}

export async function updateServiceProvider(userId, updateData) {
  try {
    const providerRef = doc(db, "serviceProviders", userId);
    await updateDoc(providerRef, {
      ...updateData,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating service provider:", error);
    return { success: false, error: error.message };
  }
}