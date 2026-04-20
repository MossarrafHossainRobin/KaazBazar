// context/AuthContext.js
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { auth, onAuthStateChanged, signOut, db } from "@/lib/firebaseClient";
import { doc, getDoc, setDoc } from "firebase/firestore";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to get user profile from Firestore
  const getUserProfile = async (userId) => {
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
  };

  // Function to save user profile to Firestore
  const saveUserProfile = async (userId, userData) => {
    try {
      const userRef = doc(db, "users", userId);
      await setDoc(userRef, userData, { merge: true });
      return { success: true };
    } catch (error) {
      console.error("Error saving user profile:", error);
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    // Check localStorage for cached user (for faster initial load)
    const cachedUser = localStorage.getItem("kaazbazar_user");
    if (cachedUser) {
      setCurrentUser(JSON.parse(cachedUser));
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get user data from Firestore
          const result = await getUserProfile(user.uid);
          
          let userData;
          if (result.success) {
            userData = result.data;
            // Update last login
            await saveUserProfile(user.uid, { lastLogin: new Date().toISOString() });
          } else {
            // Create new user profile
            userData = {
              uid: user.uid,
              name: user.displayName || user.email.split('@')[0],
              email: user.email,
              photoURL: user.photoURL || "",
              provider: user.providerData[0]?.providerId || "email",
              role: "user",
              totalJobs: 0,
              listings: 0,
              messages: 0,
              isActive: true,
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString()
            };
            await saveUserProfile(user.uid, userData);
          }
          
          setCurrentUser(userData);
          localStorage.setItem("kaazbazar_user", JSON.stringify(userData));
        } catch (error) {
          console.error("Error fetching user data:", error);
          setCurrentUser({
            uid: user.uid,
            name: user.displayName || user.email.split('@')[0],
            email: user.email,
            photoURL: user.photoURL,
            provider: "email",
            role: "user"
          });
        }
      } else {
        setCurrentUser(null);
        localStorage.removeItem("kaazbazar_user");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      localStorage.removeItem("kaazbazar_user");
      sessionStorage.clear();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      setCurrentUser,
      loading, 
      logout, 
      isAuthenticated: !!currentUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}