import { db, doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from "@/lib/firebase";

// ইউজার প্রোফাইল সেভ বা আপডেট করা
export async function saveUserProfile(userId, userData) {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, {
      ...userData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error("Error saving user profile:", error);
    return { success: false, error: error.message };
  }
}

// ইউজার প্রোফাইল পাওয়া
export async function getUserProfile(userId) {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { success: true, data: userSnap.data() };
    } else {
      return { success: false, error: "User not found" };
    }
  } catch (error) {
    console.error("Error getting user profile:", error);
    return { success: false, error: error.message };
  }
}

// ইউজার প্রোফাইল আপডেট করা
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

// ইউজারের ক্যাটাগরি সংরক্ষণ করা
export async function saveUserCategories(userId, categories) {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      preferredCategories: categories,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error("Error saving user categories:", error);
    return { success: false, error: error.message };
  }
}

// ইউজারের ঠিকানা সংরক্ষণ করা
export async function saveUserAddress(userId, addressData) {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      address: addressData,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error("Error saving user address:", error);
    return { success: false, error: error.message };
  }
}

// ইউজারের লিস্টিং সংরক্ষণ করা
export async function saveUserListing(userId, listingData) {
  try {
    const listingRef = doc(collection(db, "users", userId, "listings"));
    await setDoc(listingRef, {
      ...listingData,
      createdAt: new Date().toISOString(),
      status: "active"
    });
    return { success: true, listingId: listingRef.id };
  } catch (error) {
    console.error("Error saving user listing:", error);
    return { success: false, error: error.message };
  }
}

// ইউজারের সকল লিস্টিং পাওয়া
export async function getUserListings(userId) {
  try {
    const listingsRef = collection(db, "users", userId, "listings");
    const q = query(listingsRef);
    const querySnapshot = await getDocs(q);
    
    const listings = [];
    querySnapshot.forEach((doc) => {
      listings.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, data: listings };
  } catch (error) {
    console.error("Error getting user listings:", error);
    return { success: false, error: error.message };
  }
}