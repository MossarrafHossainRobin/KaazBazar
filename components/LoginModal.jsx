"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { 
  auth, 
  googleProvider, 
  facebookProvider, 
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "@/lib/firebase";

export default function LoginModal({ show, onClose, onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  if (!show) return null;

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      }
      const user = userCredential.user;
      const userData = {
        name: user.displayName || email.split('@')[0],
        email: user.email,
        uid: user.uid,
      };
      onLogin(userData);
      onClose();
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
        case 'auth/email-already-in-use':
          setError('Email already in use. Please login instead.');
          break;
        default:
          setError('Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userData = {
        name: user.displayName || user.email.split('@')[0],
        email: user.email,
        photoURL: user.photoURL,
        uid: user.uid,
      };
      onLogin(userData);
      onClose();
    } catch (err) {
      setError('Failed to login with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      const user = result.user;
      const userData = {
        name: user.displayName || user.email.split('@')[0],
        email: user.email,
        photoURL: user.photoURL,
        uid: user.uid,
      };
      onLogin(userData);
      onClose();
    } catch (err) {
      setError('Failed to login with Facebook. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      setShowEmailForm(false);
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl max-w-md w-full relative shadow-2xl overflow-hidden">
        <button
          onClick={() => {
            setShowEmailForm(false);
            onClose();
          }}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 z-10"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-green-600">K</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {isLogin ? "Sign in to your account" : "Create your account"}
            </h2>
            <p className="text-gray-600 text-sm">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                  setShowEmailForm(false);
                }}
                className="text-green-600 font-semibold hover:underline"
              >
                {isLogin ? "Join here" : "Sign in"}
              </button>
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Google Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 transition mb-3 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Email Button */}
          {!showEmailForm && (
            <button
              onClick={() => setShowEmailForm(true)}
              className="w-full flex items-center justify-center gap-3 border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 transition mb-3"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Continue with email/username</span>
            </button>
          )}

          {/* Email/Password Form */}
          {showEmailForm && (
            <form onSubmit={handleEmailAuth} className="space-y-3 mb-4">
              <input
                type="email"
                placeholder="Email address"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2 text-gray-400 text-sm"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
              >
                {loading ? "Please wait..." : (isLogin ? "Sign In" : "Sign Up")}
              </button>
              <button
                type="button"
                onClick={() => setShowEmailForm(false)}
                className="w-full text-gray-500 text-sm hover:text-gray-700"
              >
                ← Back
              </button>
            </form>
          )}

          {/* OR Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">OR</span>
            </div>
          </div>

          {/* Apple and Facebook */}
          <div className="space-y-2">
            <button className="w-full flex items-center justify-center gap-3 bg-black text-white py-2 rounded-lg hover:bg-gray-900 transition disabled:opacity-50" disabled>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17.36 3 13.75 3 10.92c0-4.03 2.58-6.1 5.12-6.1 1.34 0 2.45.89 3.29.89.83 0 2.38-1.09 4.03-1.09.68 0 2.58.14 3.79 1.52-3.29 1.88-2.74 6.78.51 7.96-.79 2.31-2.03 4.62-3.03 6.4zM15.53 2c.66-.79 1.48-1.4 2.52-1.5.15 1.23-.36 2.45-1.07 3.33-.66.82-1.56 1.46-2.56 1.38-.15-1.18.42-2.4 1.11-3.21z"/>
              </svg>
              <span>Apple</span>
            </button>
            <button
              onClick={handleFacebookLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-[#1877F2] text-white py-2 rounded-lg hover:bg-[#166fe5] transition disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.96h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.49h-2.8V24C19.62 23.1 24 18.1 24 12.07z" />
              </svg>
              <span>Facebook</span>
            </button>
          </div>

          {/* Terms */}
          <p className="text-xs text-gray-500 text-center mt-6">
            By joining, you agree to the Kaazbazar{" "}
            <a href="#" className="text-green-600 hover:underline">Terms of Service</a>{" "}
            and to occasionally receive emails from us.
          </p>
        </div>
      </div>
    </div>
  );
}