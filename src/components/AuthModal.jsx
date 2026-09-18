import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  LogIn,
  UserPlus,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  KeyRound,
  RotateCcw,
  Trash2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Eye,
  EyeOff,
  Pencil
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NeonLogo } from './NeonLogo';
import { AVAILABLE_AVATARS, getAvatarUrl } from '../utils/avatarUtils';

export function AuthModal({ onClose }) {
  const {
    user,
    userData,
    isConfigured,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    logout,
    setProfileAvatar,
    changePassword,
    sendPasswordReset,
    resetAccountData,
    deleteAccount
  } = useAuth();

  const wasLoggedInOnOpen = useRef(!!user);

  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmailLoading, setResetEmailLoading] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const [showSignUpConfirmPw, setShowSignUpConfirmPw] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  // If the modal was opened while not logged in, close immediately upon authentication
  // once loading completes, so the profile/account settings modal does not flash for a glance.
  useEffect(() => {
    if (!wasLoggedInOnOpen.current && user && !loading) {
      onClose();
    }
  }, [user, loading, onClose]);

  // Account Settings Accordions: null | 'password' | 'reset' | 'delete'
  const [activeSetting, setActiveSetting] = useState(null);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmNewPw, setShowConfirmNewPw] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);

  // Reset Account state
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState(null);
  const [resetSuccess, setResetSuccess] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Delete Account state
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePw, setShowDeletePw] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Sign Out Confirmation state
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const isPasswordUser = user?.providerData?.some(p => p.providerId === 'password');
  const isGoogleUser = user?.providerData?.some(p => p.providerId === 'google.com');

  const formatAuthError = (err) => {
    const msg = err?.message || '';
    if (msg.includes('auth/unauthorized-domain')) {
      return `Domain not authorized. Please add "${window.location.hostname}" to Firebase Console -> Authentication -> Settings -> Authorized domains.`;
    }
    if (msg.includes('auth/popup-closed-by-user')) {
      return 'Google sign-in was closed before completing.';
    }
    if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password')) {
      return 'Incorrect email or password.';
    }
    if (msg.includes('auth/user-not-found')) {
      return isForgotPassword
        ? 'No account registered with this email address.'
        : 'Incorrect email or password.';
    }
    if (msg.includes('auth/email-already-in-use')) {
      return 'This email is already registered. Please sign in instead.';
    }
    if (msg.includes('auth/invalid-email')) {
      return 'Please enter a valid email address.';
    }
    if (msg.includes('auth/network-request-failed')) {
      return 'Network connection error. Please check your internet connection.';
    }
    if (msg.includes('auth/requires-recent-login')) {
      return 'Please re-authenticate with your recent credentials to perform this action.';
    }
    if (msg.includes('auth/too-many-requests')) {
      return 'Too many requests. Please wait a few minutes before trying again.';
    }
    return msg || 'Action failed. Please try again.';
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    if (!email || !email.trim()) {
      setError('Please enter your email address to receive a password reset link.');
      return;
    }
    setResetEmailLoading(true);
    try {
      await sendPasswordReset(email.trim());
      setSuccessMsg(`Password reset link sent to ${email.trim()}. Please check your inbox (and spam folder)!`);
    } catch (err) {
      console.error('Forgot password error:', err);
      setError(formatAuthError(err));
    } finally {
      setResetEmailLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    const startTime = Date.now();

    try {
      if (isSignUp) {
        if (!displayName.trim() || !email || !password || !signUpConfirmPassword) {
          throw new Error('Please fill in all required fields.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        if (password !== signUpConfirmPassword) {
          throw new Error('Passwords do not match.');
        }
        await signUpWithEmail(email, password, displayName.trim());
      } else {
        await signInWithEmail(email, password);
      }
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 1100 - elapsed);
      setTimeout(() => {
        setLoading(false);
        onClose();
      }, remaining);
    } catch (err) {
      console.error('Auth error:', err);
      setError(formatAuthError(err));
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    const startTime = Date.now();
    try {
      await signInWithGoogle();
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 1100 - elapsed);
      setTimeout(() => {
        setLoading(false);
        onClose();
      }, remaining);
    } catch (err) {
      console.error('Google auth error:', err);
      setError(formatAuthError(err));
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await logout();
      setShowLogoutConfirm(false);
      onClose();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLogoutLoading(false);
    }
  };

  // ─── Change Password Handler ──────────────────────────────────────────────
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(null), 4000);
    } catch (err) {
      console.error('Password change error:', err);
      setPasswordError(formatAuthError(err));
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSendResetEmail = async () => {
    setPasswordError(null);
    setPasswordSuccess(null);
    try {
      await sendPasswordReset();
      setPasswordSuccess(`Password reset link sent to ${user.email}. Please check your inbox!`);
    } catch (err) {
      setPasswordError(formatAuthError(err));
    }
  };

  // ─── Reset Account Handler ────────────────────────────────────────────────
  const handleResetAccount = async () => {
    setResetError(null);
    setResetSuccess(null);
    setResetLoading(true);
    try {
      await resetAccountData();
      setResetSuccess('Account data reset successfully! Default starter habits restored.');
      setShowResetConfirm(false);
      setTimeout(() => setResetSuccess(null), 4000);
    } catch (err) {
      console.error('Reset account error:', err);
      setResetError(err.message || 'Failed to reset account data.');
    } finally {
      setResetLoading(false);
    }
  };

  // ─── Delete Account Handler ───────────────────────────────────────────────
  const handleDeleteAccount = async () => {
    setDeleteError(null);
    if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') {
      setDeleteError('Please type DELETE to confirm.');
      return;
    }
    if (isPasswordUser && !deletePassword) {
      setDeleteError('Please enter your password to confirm account deletion.');
      return;
    }

    setDeleteLoading(true);
    try {
      await deleteAccount(deletePassword);
      onClose();
    } catch (err) {
      console.error('Delete account error:', err);
      setDeleteError(formatAuthError(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  // If user is logging in or registering, completely hide the modal and display only the floating animation
  if (loading) {
    return (
      <div className="auth-loading-screen-overlay">
        <div className="auth-loading-card">
          <NeonLogo size={200} />
          <div className="auth-loading-info">
            <h3 className="auth-loading-title">
              {isSignUp ? 'Creating Your Account...' : 'Logging In...'}
            </h3>
            <p className="auth-loading-subtitle">Syncing your habits & streaks to the cloud</p>
          </div>
        </div>
      </div>
    );
  }

  // If the modal was opened while unauthenticated and the user has just logged in or registered,
  // do not render the profile / account settings view once loading finishes.
  if (!wasLoggedInOnOpen.current && user && !loading) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content auth-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <h2 className="modal-title">
              {user && wasLoggedInOnOpen.current
                ? 'Account Settings'
                : isForgotPassword
                  ? 'Reset Password'
                  : isSignUp
                    ? 'Create an Account'
                    : 'Welcome Back'}
            </h2>
            <p className="modal-subtitle">
              {user && wasLoggedInOnOpen.current
                ? 'Manage your profile'
                : isForgotPassword
                  ? 'Enter your email to receive a password reset link'
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

        {/* If user was already logged in on open */}
        {user && wasLoggedInOnOpen.current ? (
          <div className="auth-profile-view">
            {/* Profile Info Card */}
            <div className="profile-badge-card">
              <button
                type="button"
                className="profile-avatar-wrap profile-avatar-clickable"
                onClick={() => setShowAvatarModal(true)}
                title="Click to change profile picture"
                aria-label="Change profile picture"
              >
                <img
                  src={getAvatarUrl(userData?.avatar)}
                  alt="Profile Avatar"
                  className="profile-avatar-img"
                />
                <span className="profile-avatar-edit-badge" title="Edit avatar">
                  <Pencil size={11} color="#ffffff" />
                </span>
              </button>
              <div className="profile-info">
                <div className="profile-name-row">
                  <div className="profile-name">
                    {userData?.name || user.displayName || 'HabitWave Member'}
                  </div>
                  <button
                    type="button"
                    className="btn-edit-avatar-text"
                    onClick={() => setShowAvatarModal(true)}
                    title="Choose profile picture"
                  >
                    <Pencil size={12} />
                    <span>Change Avatar</span>
                  </button>
                </div>
                <div className="profile-email">{user.email}</div>
                <div className="profile-status">
                  <span className="online-indicator" />
                  <span>Cloud Synced {isGoogleUser && '• Google Account'}</span>
                </div>
              </div>
            </div>

            {/* Account Settings & Management Section */}
            <div className="auth-management-section">
              <div className="auth-section-title">Security & Account Management</div>

              {/* 1. Change Password Accordion */}
              <div className={`auth-accordion-card ${activeSetting === 'password' ? 'open' : ''}`}>
                <button
                  type="button"
                  className="auth-accordion-header"
                  onClick={() => {
                    setActiveSetting(prev => prev === 'password' ? null : 'password');
                    setShowLogoutConfirm(false);
                    setPasswordError(null);
                    setPasswordSuccess(null);
                  }}
                >
                  <div className="auth-accordion-title-wrap">
                    <div className="auth-acc-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                      <KeyRound size={15} />
                    </div>
                    <div>
                      <div className="auth-acc-heading">Change Password</div>
                      <div className="auth-acc-sub">Update your account login password</div>
                    </div>
                  </div>
                  {activeSetting === 'password' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {activeSetting === 'password' && (
                  <div className="auth-accordion-body">
                    {isGoogleUser && !isPasswordUser ? (
                      <div className="auth-notice-box">
                        <ShieldCheck size={16} color="#60a5fa" />
                        <div>
                          You signed in using <strong>Google</strong>. Passwords are managed directly via your Google Account security settings.
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleChangePassword} className="auth-setting-form">
                        {passwordError && (
                          <div className="auth-alert error">
                            <AlertCircle size={15} />
                            <span>{passwordError}</span>
                          </div>
                        )}
                        {passwordSuccess && (
                          <div className="auth-alert success">
                            <CheckCircle2 size={15} />
                            <span>{passwordSuccess}</span>
                          </div>
                        )}

                        <div className="form-group">
                          <label className="form-label" htmlFor="current-pw">Current Password</label>
                          <div className="input-with-icon">
                            <Lock size={15} className="input-icon" />
                            <input
                              id="current-pw"
                              type={showCurrentPw ? 'text' : 'password'}
                              className="form-input with-toggle-pw"
                              placeholder="Enter current password"
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              required
                            />
                            <button
                              type="button"
                              className="input-toggle-pw"
                              onClick={() => setShowCurrentPw(prev => !prev)}
                              aria-label={showCurrentPw ? 'Hide password' : 'Show password'}
                            >
                              {showCurrentPw ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label" htmlFor="new-pw">New Password</label>
                          <div className="input-with-icon">
                            <Lock size={15} className="input-icon" />
                            <input
                              id="new-pw"
                              type={showNewPw ? 'text' : 'password'}
                              className="form-input with-toggle-pw"
                              placeholder="Min. 6 characters"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              required
                            />
                            <button
                              type="button"
                              className="input-toggle-pw"
                              onClick={() => setShowNewPw(prev => !prev)}
                              aria-label={showNewPw ? 'Hide password' : 'Show password'}
                            >
                              {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label" htmlFor="confirm-pw">Confirm New Password</label>
                          <div className="input-with-icon">
                            <Lock size={15} className="input-icon" />
                            <input
                              id="confirm-pw"
                              type={showConfirmNewPw ? 'text' : 'password'}
                              className="form-input with-toggle-pw"
                              placeholder="Repeat new password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              required
                            />
                            <button
                              type="button"
                              className="input-toggle-pw"
                              onClick={() => setShowConfirmNewPw(prev => !prev)}
                              aria-label={showConfirmNewPw ? 'Hide password' : 'Show password'}
                            >
                              {showConfirmNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          </div>
                        </div>

                        <div className="auth-form-footer">
                          <button
                            type="button"
                            className="auth-link-btn"
                            onClick={handleSendResetEmail}
                          >
                            Forgot password? Send reset email
                          </button>
                          <button
                            type="submit"
                            className="btn btn-primary btn-sm"
                            disabled={passwordLoading}
                          >
                            {passwordLoading ? 'Updating...' : 'Save Password'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>

              {/* 2. Reset Account Accordion */}
              <div className={`auth-accordion-card ${activeSetting === 'reset' ? 'open' : ''}`}>
                <button
                  type="button"
                  className="auth-accordion-header"
                  onClick={() => {
                    setActiveSetting(prev => prev === 'reset' ? null : 'reset');
                    setShowLogoutConfirm(false);
                    setResetError(null);
                    setResetSuccess(null);
                    setShowResetConfirm(false);
                  }}
                >
                  <div className="auth-accordion-title-wrap">
                    <div className="auth-acc-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                      <RotateCcw size={15} />
                    </div>
                    <div>
                      <div className="auth-acc-heading">Reset Account Data</div>
                      <div className="auth-acc-sub">Clear habit history & restore starter habits</div>
                    </div>
                  </div>
                  {activeSetting === 'reset' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {activeSetting === 'reset' && (
                  <div className="auth-accordion-body">
                    {resetError && (
                      <div className="auth-alert error">
                        <AlertCircle size={15} />
                        <span>{resetError}</span>
                      </div>
                    )}
                    {resetSuccess && (
                      <div className="auth-alert success">
                        <CheckCircle2 size={15} />
                        <span>{resetSuccess}</span>
                      </div>
                    )}

                    <div className="auth-notice-box" style={{ borderColor: 'rgba(245, 158, 11, 0.3)', background: 'rgba(245, 158, 11, 0.06)' }}>
                      <AlertTriangle size={16} color="#f59e0b" style={{ flexShrink: 0 }} />
                      <div style={{ fontSize: '0.78rem', color: '#fef3c7', lineHeight: 1.45 }}>
                        Resetting will <strong>erase all logged days, custom habits, and streaks</strong>. Your account login remains active with fresh starter habits.
                      </div>
                    </div>

                    {!showResetConfirm ? (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-warning"
                        style={{ marginTop: '0.65rem' }}
                        onClick={() => setShowResetConfirm(true)}
                      >
                        <RotateCcw size={14} /> Reset Habit Records
                      </button>
                    ) : (
                      <div className="auth-confirm-dialog" style={{ marginTop: '0.65rem' }}>
                        <div className="auth-confirm-text">Are you sure you want to reset all habit records?</div>
                        <div className="auth-confirm-actions">
                          <button
                            type="button"
                            className="btn btn-sm btn-subtle"
                            onClick={() => setShowResetConfirm(false)}
                            disabled={resetLoading}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-warning"
                            onClick={handleResetAccount}
                            disabled={resetLoading}
                          >
                            {resetLoading ? 'Resetting...' : 'Yes, Reset All Data'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 3. Delete Account Accordion (Danger Zone) */}
              <div className={`auth-accordion-card danger ${activeSetting === 'delete' ? 'open' : ''}`}>
                <button
                  type="button"
                  className="auth-accordion-header"
                  onClick={() => {
                    setActiveSetting(prev => prev === 'delete' ? null : 'delete');
                    setShowLogoutConfirm(false);
                    setDeleteError(null);
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText('');
                    setDeletePassword('');
                  }}
                >
                  <div className="auth-accordion-title-wrap">
                    <div className="auth-acc-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                      <Trash2 size={15} />
                    </div>
                    <div>
                      <div className="auth-acc-heading" style={{ color: '#fca5a5' }}>Delete Account</div>
                      <div className="auth-acc-sub">Permanently remove account & all cloud data</div>
                    </div>
                  </div>
                  {activeSetting === 'delete' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {activeSetting === 'delete' && (
                  <div className="auth-accordion-body">
                    {deleteError && (
                      <div className="auth-alert error">
                        <AlertCircle size={15} />
                        <span>{deleteError}</span>
                      </div>
                    )}

                    <div className="auth-notice-box" style={{ borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.08)' }}>
                      <AlertTriangle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
                      <div style={{ fontSize: '0.78rem', color: '#fee2e2', lineHeight: 1.45 }}>
                        <strong>Permanent and irreversible:</strong> Your account, login credentials, and all Firestore habit records will be completely destroyed.
                      </div>
                    </div>

                    {!showDeleteConfirm ? (
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        style={{ marginTop: '0.65rem' }}
                        onClick={() => setShowDeleteConfirm(true)}
                      >
                        <Trash2 size={14} /> Request Account Deletion
                      </button>
                    ) : (
                      <div className="auth-confirm-dialog danger" style={{ marginTop: '0.75rem' }}>
                        <div className="auth-confirm-title">Confirm Permanent Deletion</div>
                        <p style={{ fontSize: '0.74rem', color: '#fca5a5', margin: '4px 0 8px' }}>
                          Type <strong>DELETE</strong> below to confirm.
                        </p>

                        <div className="form-group" style={{ marginBottom: '8px' }}>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Type DELETE"
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            style={{ borderColor: 'rgba(239, 68, 68, 0.4)' }}
                          />
                        </div>

                        {isPasswordUser && (
                          <div className="form-group" style={{ marginBottom: '8px' }}>
                            <label className="form-label" style={{ fontSize: '0.72rem' }}>Confirm Your Password</label>
                            <div className="input-with-icon">
                              <Lock size={14} className="input-icon" />
                              <input
                                type={showDeletePw ? 'text' : 'password'}
                                className="form-input with-toggle-pw"
                                placeholder="Enter current password"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                style={{ borderColor: 'rgba(239, 68, 68, 0.4)' }}
                              />
                              <button
                                type="button"
                                className="input-toggle-pw"
                                onClick={() => setShowDeletePw(prev => !prev)}
                                aria-label={showDeletePw ? 'Hide password' : 'Show password'}
                              >
                                {showDeletePw ? <EyeOff size={15} /> : <Eye size={15} />}
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="auth-confirm-actions">
                          <button
                            type="button"
                            className="btn btn-sm btn-subtle"
                            onClick={() => {
                              setShowDeleteConfirm(false);
                              setDeleteConfirmText('');
                              setDeletePassword('');
                            }}
                            disabled={deleteLoading}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={handleDeleteAccount}
                            disabled={deleteLoading || deleteConfirmText.trim().toUpperCase() !== 'DELETE' || (isPasswordUser && !deletePassword)}
                          >
                            {deleteLoading ? 'Deleting...' : 'Delete Permanently'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Meta note & Sign Out */}
            <div className="profile-meta-banner" style={{ marginTop: '0.85rem' }}>
              <Sparkles size={16} color="#fbbf24" />
              <span>Your habits, logs, and streaks are securely stored in your personal Firestore collection.</span>
            </div>

            {!showLogoutConfirm ? (
              <button
                type="button"
                className="btn btn-full btn-outline-danger"
                onClick={() => setShowLogoutConfirm(true)}
                style={{ marginTop: '1rem' }}
              >
                <LogIn size={15} style={{ transform: 'rotate(180deg)' }} /> Sign Out
              </button>
            ) : (
              <div className="auth-confirm-dialog danger" style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertTriangle size={16} color="#ef4444" />
                  <span className="auth-confirm-title" style={{ margin: 0 }}>Confirm Sign Out</span>
                </div>
                <div className="auth-confirm-text">
                  Are you sure you want to sign out of your account?
                </div>
                <div className="auth-confirm-actions">
                  <button
                    type="button"
                    className="btn btn-sm btn-subtle"
                    onClick={() => setShowLogoutConfirm(false)}
                    disabled={logoutLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={handleLogout}
                    disabled={logoutLoading}
                  >
                    <LogIn size={14} style={{ transform: 'rotate(180deg)' }} />
                    {logoutLoading ? 'Signing Out...' : 'Yes, Sign Out'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : isForgotPassword ? (
          <>
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

            <form onSubmit={handleForgotPasswordSubmit} className="auth-form" style={{ marginTop: '0.5rem' }}>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem', lineHeight: 1.5 }}>
                Enter the email address associated with your account and we&apos;ll send you a link to reset your password.
              </p>

              <div className="form-group">
                <label htmlFor="reset-email">Email Address</label>
                <div className="input-icon-wrap">
                  <Mail size={16} className="input-icon" />
                  <input
                    id="reset-email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-full btn-primary"
                disabled={resetEmailLoading}
                style={{ marginTop: '0.8rem' }}
              >
                {resetEmailLoading ? 'Sending Link...' : 'Send Password Reset Link'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  className="auth-link-btn"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  style={{
                    fontSize: '0.82rem',
                    color: '#94a3b8',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    textDecoration: 'none'
                  }}
                >
                  ← Back to Sign In
                </button>
              </div>
            </form>
          </>
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
                  setIsForgotPassword(false);
                  setError(null);
                  setSuccessMsg(null);
                  setSignUpConfirmPassword('');
                  setShowAuthPassword(false);
                  setShowSignUpConfirmPw(false);
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
                  setIsForgotPassword(false);
                  setError(null);
                  setSuccessMsg(null);
                  setSignUpConfirmPassword('');
                  setShowAuthPassword(false);
                  setShowSignUpConfirmPw(false);
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
                      required
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label htmlFor="auth-password" style={{ margin: 0 }}>Password</label>
                  {!isSignUp && (
                    <button
                      type="button"
                      className="auth-link-btn"
                      onClick={() => {
                        setIsForgotPassword(true);
                        setError(null);
                        setSuccessMsg(null);
                      }}
                      style={{ fontSize: '0.78rem' }}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="input-icon-wrap">
                  <Lock size={16} className="input-icon" />
                  <input
                    id="auth-password"
                    type={showAuthPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input with-toggle-pw"
                  />
                  <button
                    type="button"
                    className="input-toggle-pw"
                    onClick={() => setShowAuthPassword(prev => !prev)}
                    aria-label={showAuthPassword ? 'Hide password' : 'Show password'}
                  >
                    {showAuthPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {isSignUp && (
                <div className="form-group">
                  <label htmlFor="auth-confirm-password">Confirm Password</label>
                  <div className="input-icon-wrap">
                    <Lock size={16} className="input-icon" />
                    <input
                      id="auth-confirm-password"
                      type={showSignUpConfirmPw ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={signUpConfirmPassword}
                      onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                      className="form-input with-toggle-pw"
                    />
                    <button
                      type="button"
                      className="input-toggle-pw"
                      onClick={() => setShowSignUpConfirmPw(prev => !prev)}
                      aria-label={showSignUpConfirmPw ? 'Hide password' : 'Show password'}
                    >
                      {showSignUpConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-full btn-primary"
                disabled={loading}
                style={{ marginTop: '0.8rem' }}
              >
                {loading
                  ? (isSignUp ? 'Creating Account...' : 'Signing In...')
                  : (isSignUp ? 'Create Account' : 'Sign In')}
              </button>
            </form>
          </>
        )}
      </div>

      {/* Avatar Selection Popup Modal */}
      {showAvatarModal && (
        <div className="modal-overlay avatar-modal-overlay" onClick={() => setShowAvatarModal(false)}>
          <div
            className="modal-content avatar-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title-wrap">
                <h3 className="modal-title">Choose Profile Picture</h3>
                <p className="modal-subtitle">Select an avatar style for your profile</p>
              </div>
              <button
                type="button"
                className="btn btn-icon"
                onClick={() => setShowAvatarModal(false)}
                aria-label="Close avatar picker"
              >
                <X size={18} />
              </button>
            </div>

            <div className="avatar-popup-grid">
              {AVAILABLE_AVATARS.map((avatar) => {
                const currentAvatarUrl = getAvatarUrl(userData?.avatar);
                const isSelected = currentAvatarUrl === avatar.url;

                return (
                  <button
                    key={avatar.id}
                    type="button"
                    className={`avatar-popup-card ${isSelected ? 'selected' : ''}`}
                    onClick={async () => {
                      await setProfileAvatar(avatar.url);
                      setShowAvatarModal(false);
                    }}
                  >
                    <div className="avatar-popup-img-wrap">
                      <img
                        src={avatar.url}
                        alt={avatar.label}
                        className="avatar-popup-img"
                      />
                      {isSelected && (
                        <span className="avatar-popup-check">
                          <CheckCircle2 size={14} color="#ffffff" />
                        </span>
                      )}
                    </div>
                    <span className="avatar-popup-name">{avatar.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="avatar-modal-footer">
              <button
                type="button"
                className="btn btn-secondary w-full"
                onClick={() => setShowAvatarModal(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
