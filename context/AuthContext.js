"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { auth, onAuthStateChanged, signOut } from "@/lib/firebase";
import { getUserProfile } from "@/lib/firestoreService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const cachedUser = localStorage.getItem("kaazbazar_user");
    if (cachedUser) {
      const user = JSON.parse(cachedUser);
      setCurrentUser(user);
      setIsAuthenticated(true);
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
            photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email.split('@')[0])}&background=10b981&color=fff&size=200&rounded=true`,
            provider: "email",
            role: "user",
            totalJobs: 0,
            listings: 0,
            isActive: true
          };
        }
        
        setCurrentUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem("kaazbazar_user", JSON.stringify(userData));
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem("kaazbazar_user");
        sessionStorage.clear();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Dynamic logout without page reload
  const logout = async () => {
    try {
      await signOut(auth);
      // Clear all state immediately
      setCurrentUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("kaazbazar_user");
      sessionStorage.clear();
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      setCurrentUser,
      loading, 
      logout, 
      isAuthenticated
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