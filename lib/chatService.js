"use client";

import { 
  db, 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  doc, 
  serverTimestamp,
  setDoc,
  getDoc
} from "@/lib/firebaseClient"; // ← Changed from firebase to firebaseClient

// Create or get existing conversation between two users
export async function getOrCreateConversation(userId, otherUserId, otherUserData, currentUserData) {
  try {
    // Check if conversation already exists
    const conversationsRef = collection(db, "conversations");
    const q = query(
      conversationsRef,
      where("participants", "array-contains", userId)
    );
    const querySnapshot = await getDocs(q);
    
    let existingConversation = null;
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.participants && data.participants.includes(otherUserId)) {
        existingConversation = { id: doc.id, ...data };
      }
    });
    
    if (existingConversation) {
      return existingConversation;
    }
    
    // Create new conversation
    const conversationData = {
      participants: [userId, otherUserId],
      participantsData: {
        [userId]: {
          name: currentUserData?.name || "User",
          photoURL: currentUserData?.photoURL || "",
          lastSeen: new Date().toISOString()
        },
        [otherUserId]: {
          name: otherUserData?.name || "User",
          photoURL: otherUserData?.photoURL || "",
          lastSeen: new Date().toISOString()
        }
      },
      lastMessage: "",
      lastMessageTime: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      unreadCount: {
        [userId]: 0,
        [otherUserId]: 0
      }
    };
    
    const docRef = await addDoc(collection(db, "conversations"), conversationData);
    return { id: docRef.id, ...conversationData };
  } catch (error) {
    console.error("Error getting/creating conversation:", error);
    return null;
  }
}

// Send a message
export async function sendMessage(conversationId, messageData) {
  try {
    const messagesRef = collection(db, "conversations", conversationId, "messages");
    const newMessage = {
      ...messageData,
      timestamp: serverTimestamp(),
      read: false,
      delivered: true
    };
    const docRef = await addDoc(messagesRef, newMessage);
    
    // Update conversation last message and increment unread count for receiver
    const convRef = doc(db, "conversations", conversationId);
    const convDoc = await getDoc(convRef);
    const convData = convDoc.data();
    
    const currentUnreadCount = convData?.unreadCount || {};
    const newUnreadCount = {
      ...currentUnreadCount,
      [messageData.receiverId]: (currentUnreadCount[messageData.receiverId] || 0) + 1
    };
    
    await updateDoc(convRef, {
      lastMessage: messageData.text,
      lastMessageTime: serverTimestamp(),
      updatedAt: serverTimestamp(),
      unreadCount: newUnreadCount
    });
    
    return { success: true, messageId: docRef.id };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, error: error.message };
  }
}

// Get all conversations for a user
export async function getUserConversations(userId) {
  try {
    const conversationsRef = collection(db, "conversations");
    const q = query(
      conversationsRef,
      where("participants", "array-contains", userId)
    );
    
    const querySnapshot = await getDocs(q);
    const conversations = [];
    querySnapshot.forEach((doc) => {
      conversations.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort on client side
    conversations.sort((a, b) => {
      if (a.lastMessageTime && b.lastMessageTime) {
        return b.lastMessageTime - a.lastMessageTime;
      }
      return 0;
    });
    
    return { success: true, data: conversations };
  } catch (error) {
    console.error("Error getting conversations:", error);
    return { success: false, error: error.message };
  }
}

// Get messages for a conversation (real-time)
export function listenToMessages(conversationId, callback) {
  const messagesRef = collection(db, "conversations", conversationId, "messages");
  const q = query(messagesRef, orderBy("timestamp", "asc"));
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const messages = [];
    snapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    callback(messages);
  });
  
  return unsubscribe;
}

// Mark messages as read for a user
export async function markMessagesAsRead(conversationId, userId) {
  try {
    // First, reset unread count for this user in the conversation
    const convRef = doc(db, "conversations", conversationId);
    const convDoc = await getDoc(convRef);
    const convData = convDoc.data();
    
    if (convData && convData.unreadCount && convData.unreadCount[userId] > 0) {
      const newUnreadCount = {
        ...convData.unreadCount,
        [userId]: 0
      };
      await updateDoc(convRef, { unreadCount: newUnreadCount });
    }
    
    // Mark all messages from other user as read
    const messagesRef = collection(db, "conversations", conversationId, "messages");
    const q = query(
      messagesRef,
      where("receiverId", "==", userId),
      where("read", "==", false)
    );
    const querySnapshot = await getDocs(q);
    
    const updatePromises = [];
    querySnapshot.forEach((doc) => {
      updatePromises.push(updateDoc(doc.ref, { read: true }));
    });
    
    await Promise.all(updatePromises);
    return { success: true };
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return { success: false };
  }
}

// Update user online status
export async function updateUserStatus(userId, isOnline) {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      isOnline: isOnline,
      lastSeen: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error updating user status:", error);
  }
}

// Get unread message count for a user
export async function getUnreadCount(userId) {
  try {
    const conversationsRef = collection(db, "conversations");
    const q = query(conversationsRef, where("participants", "array-contains", userId));
    const querySnapshot = await getDocs(q);
    
    let totalUnread = 0;
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.unreadCount && data.unreadCount[userId]) {
        totalUnread += data.unreadCount[userId];
      }
    });
    
    return { success: true, count: totalUnread };
  } catch (error) {
    console.error("Error getting unread count:", error);
    return { success: false, count: 0 };
  }
}