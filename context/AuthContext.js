// context/AuthContext.js
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "@/lib/firebaseClient";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// ... rest of AuthContext (using auth and db from firebaseClient)

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const cachedUser = localStorage.getItem("kaazbazar_user");
    if (cachedUser) {
      setCurrentUser(JSON.parse(cachedUser));
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const result = await getUserProfile(user.uid);
        
        let userData;
        if (result.success) {
          userData = result.data;
        } else {
          userData = {
            uid: user.uid,
            name: user.displayName || user.email.split('@')[0],
            email: user.email,
            photoURL: user.photoURL,
            provider: "email",
            role: "user",
            totalJobs: 0,
            listings: 0,
            isActive: true
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
  }, [mounted]);

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      localStorage.removeItem("kaazbazar_user");
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