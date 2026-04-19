"use client";
import { useState, useEffect } from "react";
import { X, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { 
  auth, 
  googleProvider, 
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "@/lib/firebase";
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

  useEffect(() => {
    if (!show) {
      const timer = setTimeout(() => {
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setError("");
        setSuccessMessage("");
        setIsSignUp(false);
        setLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [show]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  };

  if (!show && !isClosing) return null;

  // Generate avatar from email
  const generateAvatarFromEmail = (email, name) => {
    const encodedName = encodeURIComponent(name || email.split('@')[0]);
    return `https://ui-avatars.com/api/?name=${encodedName}&background=10b981&color=fff&size=200&rounded=true&bold=true`;
  };

  // Save user to Firestore
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
      notifications: {
        email: true,
        push: true,
        sms: false
      },
      settings: {
        language: "bengali",
        currency: "BDT",
        theme: "light"
      }
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
    setLoading(true);
    setError("");
    setSuccessMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password should be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userData = await saveUserToFirestore(user, "email");
      
      setSuccessMessage("Account created successfully! Redirecting...");
      setTimeout(() => {
        onLogin(userData);
        handleClose();
      }, 1000);
    } catch (err) {
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('Email already in use. Please login instead.');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address.');
          break;
        case 'auth/weak-password':
          setError('Password should be at least 6 characters.');
          break;
        default:
          setError('Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

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
      
      setSuccessMessage("Login successful! Redirecting...");
      setTimeout(() => {
        onLogin(userData);
        handleClose();
      }, 800);
    } catch (err) {
      switch (err.code) {
        case 'auth/invalid-email':
          setError('Invalid email address format.');
          break;
        case 'auth/user-not-found':
          setError('No account found with this email.');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password.');
          break;
        default:
          setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    setSuccessMessage("");
    
    try {
      // Clear any existing session to prevent conflicts
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const userData = await saveUserToFirestore(user, "google", user.photoURL);
      
      setSuccessMessage("Google login successful! Redirecting...");
      setTimeout(() => {
        onLogin(userData);
        handleClose();
      }, 800);
    } catch (err) {
      console.error("Google login error:", err);
      if (err.code === 'auth/popup-blocked') {
        setError('Popup was blocked. Please allow popups for this site.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Login cancelled. Please try again.');
      } else {
        setError('Failed to login with Google. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className={`fixed inset-0 bg-black transition-all duration-300 flex items-center justify-center z-[9999] p-4 ${
        isClosing ? 'bg-opacity-0' : 'bg-opacity-50'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) handleClose();
      }}
    >
      <div className={`bg-white rounded-2xl max-w-md w-full relative shadow-2xl overflow-hidden transition-all duration-300 transform ${
        isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
      }`}>
        <button
          onClick={handleClose}
          disabled={loading}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 z-10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-2xl font-bold text-white">K</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              {isSignUp 
                ? "Sign up to connect with local service providers" 
                : "Login to view details and chat with service providers"}
            </p>
          </div>

          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg animate-pulse">
              <p className="text-green-600 text-sm text-center">{successMessage}</p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continue with Google</span>
          </button>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-400">OR</span>
            </div>
          </div>
          
          {/* Email/Password Form */}
          <form onSubmit={isSignUp ? handleEmailSignUp : handleEmailSignIn} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Email address"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-gray-300 outline-none transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            
            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-gray-300 outline-none transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isSignUp && (
              <div>
                <input
                  type="password"
                  placeholder="Confirm password"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-gray-300 outline-none transition-all"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-2.5 rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Please wait..." : (isSignUp ? "Sign Up" : "Sign In")}
            </button>
          </form>
          
          <p className="text-center text-sm text-gray-500 mt-6">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{' '}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
                setSuccessMessage("");
                setPassword("");
                setConfirmPassword("");
              }}
              className="text-black font-semibold hover:underline transition"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}