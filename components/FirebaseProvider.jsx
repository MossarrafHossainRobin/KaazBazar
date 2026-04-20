// components/FirebaseProvider.jsx
"use client";

import { useEffect } from "react";
import { auth, onAuthStateChanged } from "@/lib/firebase";

export default function FirebaseProvider({ children }) {
  useEffect(() => {
    // Initialize Firebase auth listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Auth state is handled by AuthContext
    });
    return () => unsubscribe();
  }, []);

  return <>{children}</>;
}