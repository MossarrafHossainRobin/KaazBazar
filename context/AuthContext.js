"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { auth, onAuthStateChanged, signOut } from "@/lib/firebase";
import { getUserProfile } from "@/lib/userService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for cached user first
    const cachedUser = localStorage.getItem("kaazbazar_user");
    if (cachedUser) {
      setCurrentUser(JSON.parse(cachedUser));
    }

    // Listen to Firebase auth state
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in
        const result = await getUserProfile(user.uid);
        
        let userData;
        if (result.success) {
          userData = result.data;
        } else {
          userData = {
            uid: user.uid,
            name: user.displayName || user.email.split('@')[0],
            email: user.email,
            photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email.split('@')[0])}&background=10b981&color=fff&size=200&rounded=true`,
            provider: "email",
            role: "user",
            totalJobs: 0,
            listings: 0
          };
        }
        
        setCurrentUser(userData);
        localStorage.setItem("kaazbazar_user", JSON.stringify(userData));
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
      // Clear state immediately
      setCurrentUser(null);
      localStorage.removeItem("kaazbazar_user");
      // Force a small delay to ensure Firebase state updates
      await new Promise(resolve => setTimeout(resolve, 100));
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