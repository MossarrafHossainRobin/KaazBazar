"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { X, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, CheckCircle } from "lucide-react";
import Image from "next/image";
import { 
  auth, 
  googleProvider, 
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "@/lib/firebaseClient";
import { saveUserProfile, getUserProfile } from "@/lib/userService";

export default function LoginModal({ show, onClose, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isClosing, setIsClosing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  
  const formRef = useRef(null);
  const submittingRef = useRef(false);
  const cleanupTimerRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupTimerRef.current) clearTimeout(cleanupTimerRef.current);
    };
  }, []);

  // Reset state when modal closes
  useEffect(() => {
    if (!show) {
      cleanupTimerRef.current = setTimeout(() => {
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setError("");
        setSuccessMessage("");
        setIsSignUp(false);
        setLoading(false);
        setGoogleLoading(false);
        submittingRef.current = false;
      }, 300);
      return () => {
        if (cleanupTimerRef.current) clearTimeout(cleanupTimerRef.current);
      };
    }
  }, [show]);

  const handleClose = useCallback(() => {
    if (loading || googleLoading) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  }, [loading, googleLoading, onClose]);

  // Double-click guard for all auth actions
  const isSubmitting = useCallback(() => {
    if (submittingRef.current) return true;
    submittingRef.current = true;
    return false;
  }, []);

  if (!show && !isClosing) return null;

  const createSession = async (idToken) => {
    try {
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
    } catch (error) {
      console.error('Session creation error:', error);
    }
  };

  const generateAvatarFromEmail = (email, name) => {
    const encodedName = encodeURIComponent(name || email.split('@')[0]);
    return `https://ui-avatars.com/api/?name=${encodedName}&background=10b981&color=fff&size=200&rounded=true&bold=true`;
  };

  const saveUserToFirestore = async (user, provider, customPhotoURL = null) => {
    let photoURL = customPhotoURL || user.photoURL || "";
    
    if (!photoURL && provider === "email") {
      const name = user.displayName || email.split('@')[0];
      photoURL = generateAvatarFromEmail(user.email, name);
    }
    
    const userData = {
      uid: user.uid,
      name: user.displayName || email.split('@')[0],
      email: user.email,
      photoURL: photoURL,
      provider: provider,
      role: "user",
      phone: "",
      address: "",
      city: "",
      preferredCategories: [],
      listings: [],
      totalJobs: 0,
      totalSpent: 0,
      rating: 0,
      reviews: [],
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      isActive: true,
      notifications: { email: true, push: true, sms: false },
      settings: { language: "bengali", currency: "BDT", theme: "light" }
    };

    const existingUser = await getUserProfile(user.uid);
    
    if (!existingUser.success) {
      await saveUserProfile(user.uid, userData);
      return userData;
    } else {
      const updateData = { lastLogin: new Date().toISOString() };
      if ((!existingUser.data.photoURL || existingUser.data.photoURL === "") && photoURL) {
        updateData.photoURL = photoURL;
      }
      await saveUserProfile(user.uid, updateData);
      return { ...existingUser.data, ...updateData };
    }
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    if (isSubmitting()) return;
    
    setError("");
    setSuccessMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      submittingRef.current = false;
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      submittingRef.current = false;
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userData = await saveUserToFirestore(user, "email");
      const idToken = await user.getIdToken();
      await createSession(idToken);
      
      setSuccessMessage("Account created! Redirecting...");
      setTimeout(() => {
        onLogin(userData);
        handleClose();
      }, 800);
    } catch (err) {
      const errorMap = {
        'auth/email-already-in-use': 'Email already in use. Please login instead.',
        'auth/invalid-email': 'Invalid email address.',
        'auth/weak-password': 'Password must be at least 6 characters.',
      };
      setError(errorMap[err.code] || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    if (isSubmitting()) return;
    
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const result = await getUserProfile(user.uid);
      
      let userData;
      if (result.success) {
        userData = result.data;
        await saveUserProfile(user.uid, { lastLogin: new Date().toISOString() });
      } else {
        userData = await saveUserToFirestore(user, "email");
      }
      
      const idToken = await user.getIdToken();
      await createSession(idToken);
      
      setSuccessMessage("Welcome back! Redirecting...");
      setTimeout(() => {
        onLogin(userData);
        handleClose();
      }, 600);
    } catch (err) {
      const errorMap = {
        'auth/invalid-email': 'Invalid email address.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/invalid-credential': 'Invalid email or password.',
        'auth/too-many-requests': 'Too many attempts. Please try again later.',
      };
      setError(errorMap[err.code] || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  const handleGoogleLogin = async () => {
    if (isSubmitting()) return;
    setError("");
    setSuccessMessage("");
    setGoogleLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userData = await saveUserToFirestore(user, "google", user.photoURL);
      const idToken = await user.getIdToken();
      await createSession(idToken);
      
      setSuccessMessage("Welcome! Redirecting...");
      setTimeout(() => {
        onLogin(userData);
        handleClose();
      }, 600);
    } catch (err) {
      console.error("Google login error:", err);
      const errorMap = {
        'auth/popup-blocked': 'Popup blocked. Try email login or allow popups.',
        'auth/popup-closed-by-user': 'Sign in cancelled.',
        'auth/cancelled-popup-request': 'Sign in cancelled.',
        'auth/network-request-failed': 'Network error. Check your connection.',
      };
      setError(errorMap[err.code] || 'Google sign in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
      submittingRef.current = false;
    }
  };

  const isBusy = loading || googleLoading;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-3 transition-all duration-300 ${
        isClosing ? 'bg-black/0 backdrop-blur-0' : 'bg-black/50 backdrop-blur-sm'
      }`}
      onClick={(e) => { if (e.target === e.currentTarget && !isBusy) handleClose(); }}
    >
      {/* Centered card on both desktop and mobile */}
      <div 
        className={`bg-white w-full max-w-sm relative shadow-2xl overflow-hidden transition-all duration-300 rounded-2xl ${
          isClosing 
            ? 'scale-95 opacity-0 translate-y-2' 
            : 'scale-100 opacity-100 translate-y-0'
        }`}
        style={{ maxHeight: 'calc(100vh - 24px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent bar */}
        <div className="h-1 bg-gradient-to-r from-emerald-500 to-emerald-600 flex-shrink-0" />
        
        {/* Close button */}
        <button
          onClick={handleClose}
          disabled={isBusy}
          className="absolute right-3 top-3 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 z-10 transition-colors disabled:opacity-30"
        >
          <X className="w-3.5 h-3.5" />
        </button>
        
        {/* Scrollable content area */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 89px)' }}>
          <div className="px-5 py-4 sm:px-6 sm:py-5">
            
            {/* Header */}
            <div className="text-center mb-4">
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-2 sm:mb-2.5">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl shadow-md shadow-emerald-200 rotate-6" />
                <div className="absolute inset-0 bg-white rounded-xl shadow-md flex items-center justify-center -rotate-3 overflow-hidden">
                  <Image src="/favicon.ico" alt="Kaazbazar" width={32} height={32} className="w-8 h-8 sm:w-9 sm:h-9 object-contain" />
                </div>
              </div>
              
              <h2 className="text-lg font-bold text-gray-900">
                {isSignUp ? "Create Account" : "Welcome Back"}
              </h2>
              <p className="text-gray-500 mt-0.5 text-xs">
                {isSignUp ? "Join Kaazbazar today" : "Sign in to your account"}
              </p>
            </div>

            {/* Messages */}
            {successMessage && (
              <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-2.5 animate-fade-in">
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <p className="text-emerald-700 text-xs font-medium">{successMessage}</p>
              </div>
            )}

            {error && (
              <div className="mb-3 p-2.5 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2.5 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-red-600 text-xs font-medium">{error}</p>
              </div>
            )}

            {/* Google Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isBusy}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
            >
              {googleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              <span className="font-medium">{googleLoading ? "Signing in..." : "Continue with Google"}</span>
            </button>
            
            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-150" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-white text-xs text-gray-400 font-medium">or</span>
              </div>
            </div>
            
            {/* Form */}
            <form ref={formRef} onSubmit={isSignUp ? handleEmailSignUp : handleEmailSignIn} className="space-y-2.5">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="email"
                  placeholder="Email address"
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:bg-white outline-none transition-all duration-200 text-sm placeholder:text-gray-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isBusy}
                  required
                  autoComplete="email"
                />
              </div>
              
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full pl-9 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:bg-white outline-none transition-all duration-200 text-sm placeholder:text-gray-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isBusy}
                  required
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              {isSignUp && (
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="password"
                    placeholder="Confirm password"
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:bg-white outline-none transition-all duration-200 text-sm placeholder:text-gray-400"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isBusy}
                    required
                    autoComplete="new-password"
                  />
                </div>
              )}
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={isBusy}
                className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-semibold hover:bg-emerald-700 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm shadow-emerald-200 hover:shadow-md hover:shadow-emerald-200/50 text-sm active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Please wait...</span>
                  </>
                ) : (
                  <span>{isSignUp ? "Create Account" : "Sign In"}</span>
                )}
              </button>
            </form>
            
            {/* Toggle */}
            <p className="text-center text-xs text-gray-500 mt-3.5">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError("");
                  setSuccessMessage("");
                  setPassword("");
                  setConfirmPassword("");
                  submittingRef.current = false;
                }}
                disabled={isBusy}
                className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors disabled:opacity-40"
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50/80 px-5 py-2.5 border-t border-gray-100">
          <p className="text-center text-[11px] text-gray-400">
            By continuing, you agree to our{' '}
            <span className="text-gray-500 cursor-pointer hover:text-emerald-600 transition-colors">Terms</span>
            {' '}&{' '}
            <span className="text-gray-500 cursor-pointer hover:text-emerald-600 transition-colors">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}