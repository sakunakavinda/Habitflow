import React, { useState } from 'react';
import { X, Mail, Lock, User, LogIn, UserPlus, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function AuthModal({ onClose }) {
  const { user, userData, isConfigured, signInWithEmail, signUpWithEmail, signInWithGoogle, logout } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (!email || !password) {
          throw new Error('Please fill in all required fields.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        await signUpWithEmail(email, password, displayName);
        setSuccessMsg('Account created successfully! Welcome to HabitWave.');
        setTimeout(() => onClose(), 1200);
      } else {
        await signInWithEmail(email, password);
        setSuccessMsg('Logged in successfully!');
        setTimeout(() => onClose(), 1000);
      }
    } catch (err) {
      console.error('Auth error:', err);
      let message = err.message || 'Authentication failed. Please try again.';
      if (message.includes('auth/invalid-credential') || message.includes('auth/wrong-password')) {
        message = 'Invalid email or password.';
      } else if (message.includes('auth/email-already-in-use')) {
        message = 'This email is already registered. Please sign in instead.';
      } else if (message.includes('auth/invalid-email')) {
        message = 'Please enter a valid email address.';
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      setSuccessMsg('Signed in with Google!');
      setTimeout(() => onClose(), 1000);
    } catch (err) {
      console.error('Google auth error:', err);
      setError(err.message || 'Failed to sign in with Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content auth-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <h2 className="modal-title">
              {user ? 'Account Profile' : isSignUp ? 'Create an Account' : 'Welcome Back'}
            </h2>
            <p className="modal-subtitle">
              {user
                ? 'Sync habits and tracking across all your devices'
                : 'Cloud sync with Firebase Authentication & Firestore'}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-icon"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* If user is already logged in */}
        {user ? (
          <div className="auth-profile-view">
            <div className="profile-badge-card">
              <div className="profile-avatar">
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </div>
              <div className="profile-info">
                <div className="profile-name">
                  {userData?.name || user.displayName || 'HabitWave Member'}
                </div>
                <div className="profile-email">{user.email}</div>
                <div className="profile-status">
                  <span className="online-indicator" />
                  <span>Cloud Synced</span>
                </div>
              </div>
            </div>

            <div className="profile-meta-banner">
              <Sparkles size={16} color="#fbbf24" />
              <span>Your habits, logs, and streaks are securely stored in your personal Firestore collection.</span>
            </div>

            <button
              type="button"
              className="btn btn-full btn-danger"
              onClick={handleLogout}
              style={{ marginTop: '1.25rem' }}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <>
            {/* Firebase Config Notice if needed */}
            {!isConfigured && (
              <div className="auth-alert warning">
                <AlertCircle size={16} />
                <div>
                  <strong>Demo Mode Active:</strong> Firebase API keys not detected in environment. You can test habit creation and tracking locally, or add your Firebase credentials to <code>.env</code>.
                </div>
              </div>
            )}

            {/* Switch Tabs */}
            <div className="auth-tabs">
              <button
                type="button"
                className={`auth-tab ${!isSignUp ? 'active' : ''}`}
                onClick={() => {
                  setIsSignUp(false);
                  setError(null);
                }}
              >
                <LogIn size={15} />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                className={`auth-tab ${isSignUp ? 'active' : ''}`}
                onClick={() => {
                  setIsSignUp(true);
                  setError(null);
                }}
              >
                <UserPlus size={15} />
                <span>Create Account</span>
              </button>
            </div>

            {/* Error or Success notification */}
            {error && (
              <div className="auth-alert error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
            {successMsg && (
              <div className="auth-alert success">
                <CheckCircle2 size={16} />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Google Sign In Button */}
            {isConfigured && (
              <>
                <button
                  type="button"
                  className="btn btn-full google-signin-btn"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <div className="auth-divider">
                  <span>or with email</span>
                </div>
              </>
            )}

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="auth-form">
              {isSignUp && (
                <div className="form-group">
                  <label htmlFor="auth-name">Your Name</label>
                  <div className="input-icon-wrap">
                    <User size={16} className="input-icon" />
                    <input
                      id="auth-name"
                      type="text"
                      placeholder="e.g. Alex"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="auth-email">Email Address</label>
                <div className="input-icon-wrap">
                  <Mail size={16} className="input-icon" />
                  <input
                    id="auth-email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="auth-password">Password</label>
                <div className="input-icon-wrap">
                  <Lock size={16} className="input-icon" />
                  <input
                    id="auth-password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-full btn-primary"
                disabled={loading}
                style={{ marginTop: '0.8rem' }}
              >
                {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
