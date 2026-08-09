import React, { useState, useRef, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import {
  uploadProfileImage,
  deleteProfileImage,
  updateUserProfileData,
  updateUserEmailAddress,
  changeUserAccountPassword,
  deleteAccountAndAllData,
  getAuthErrorMessage,
  getUserProfile,
} from '../services/authService';
import {
  User,
  Mail,
  Lock,
  Camera,
  Trash2,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  RefreshCw,
  Sparkles,
  Shield,
  Calendar,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, setUser, refreshUserProfile, logout } = useAuth();
  const { addToast } = useToast();

  const fileInputRef = useRef(null);

  // Form States
  const [fullName, setFullName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [emailPasswordConfirm, setEmailPasswordConfirm] = useState('');

  // Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Loading States
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingAvatar, setUpdatingAvatar] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Delete Modal States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Sync state if user context updates
  useEffect(() => {
    if (user) {
      setFullName(user.displayName || '');
      setEmail(user.email || '');
    }
  }, [user]);

  // Handle Avatar Image File Upload
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user?.uid) return;

    if (!file.type.startsWith('image/')) {
      addToast({
        title: 'Invalid File',
        message: 'Please select an image file (e.g., JPG, PNG, WebP).',
        type: 'error',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast({
        title: 'File Too Large',
        message: 'Image size must be less than 5MB.',
        type: 'error',
      });
      return;
    }

    setUpdatingAvatar(true);
    try {
      const photoURL = await uploadProfileImage(user.uid, file);
      if (photoURL) {
        await updateUserProfileData(user, { fullName, photoURL });
        setUser((prev) => ({ ...prev, photoURL }));
        addToast({
          title: 'Avatar Updated',
          message: 'Your profile picture has been updated successfully.',
          type: 'success',
        });
      }
    } catch (err) {
      console.error('Error uploading avatar:', err);
      addToast({
        title: 'Upload Failed',
        message: getAuthErrorMessage(err),
        type: 'error',
      });
    } finally {
      setUpdatingAvatar(false);
    }
  };

  // Delete Avatar Image
  const handleDeleteAvatar = async () => {
    if (!user?.uid) return;
    setUpdatingAvatar(true);
    try {
      await deleteProfileImage(user.uid);
      await updateUserProfileData(user, { fullName, photoURL: null });
      setUser((prev) => ({ ...prev, photoURL: null }));
      addToast({
        title: 'Avatar Removed',
        message: 'Profile picture reset to default avatar.',
        type: 'info',
      });
    } catch (err) {
      console.error('Error removing avatar:', err);
      addToast({
        title: 'Removal Failed',
        message: getAuthErrorMessage(err),
        type: 'error',
      });
    } finally {
      setUpdatingAvatar(false);
    }
  };

  // Save Profile Name & Email
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!user) return;

    if (!fullName.trim()) {
      addToast({
        title: 'Validation Error',
        message: 'Full Name cannot be empty.',
        type: 'error',
      });
      return;
    }

    setUpdatingProfile(true);
    try {
      let emailUpdated = false;

      // Check if email changed
      if (email.trim().toLowerCase() !== (user.email || '').toLowerCase()) {
        if (!emailPasswordConfirm) {
          addToast({
            title: 'Re-authentication Required',
            message: 'Please enter your current password to update your email address.',
            type: 'error',
          });
          setUpdatingProfile(false);
          return;
        }

        await updateUserEmailAddress(user, email.trim(), emailPasswordConfirm);
        emailUpdated = true;
        setEmailPasswordConfirm('');
      }

      // Update Full Name
      await updateUserProfileData(user, { fullName: fullName.trim() });
      setUser((prev) => ({
        ...prev,
        displayName: fullName.trim(),
        email: emailUpdated ? email.trim() : prev.email,
      }));

      addToast({
        title: 'Profile Updated',
        message: 'Your personal information has been saved successfully.',
        type: 'success',
      });
    } catch (err) {
      console.error('Error updating profile:', err);
      addToast({
        title: 'Update Failed',
        message: getAuthErrorMessage(err),
        type: 'error',
      });
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Update Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      addToast({
        title: 'Validation Error',
        message: 'Please enter your current password.',
        type: 'error',
      });
      return;
    }

    if (newPassword.length < 6) {
      addToast({
        title: 'Weak Password',
        message: 'New password must be at least 6 characters long.',
        type: 'error',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      addToast({
        title: 'Password Mismatch',
        message: 'New password and confirm password do not match.',
        type: 'error',
      });
      return;
    }

    setUpdatingPassword(true);
    try {
      await changeUserAccountPassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      addToast({
        title: 'Password Changed',
        message: 'Your account password was updated successfully.',
        type: 'success',
      });
    } catch (err) {
      console.error('Error changing password:', err);
      addToast({
        title: 'Password Change Failed',
        message: getAuthErrorMessage(err),
        type: 'error',
      });
    } finally {
      setUpdatingPassword(false);
    }
  };

  // Permanently Delete Account
  const handleConfirmAccountDeletion = async () => {
    if (deleteConfirmText !== 'DELETE') {
      addToast({
        title: 'Confirmation Failed',
        message: 'Please type "DELETE" to confirm account termination.',
        type: 'error',
      });
      return;
    }

    if (!deletePassword) {
      addToast({
        title: 'Password Required',
        message: 'Please enter your password to confirm account deletion.',
        type: 'error',
      });
      return;
    }

    setDeletingAccount(true);
    try {
      await deleteAccountAndAllData(deletePassword);
      setShowDeleteModal(false);
      addToast({
        title: 'Account Deleted',
        message: 'Your account and all associated data have been permanently erased.',
        type: 'info',
      });
      await logout();
    } catch (err) {
      console.error('Error deleting account:', err);
      addToast({
        title: 'Deletion Failed',
        message: getAuthErrorMessage(err),
        type: 'error',
      });
    } finally {
      setDeletingAccount(false);
    }
  };

  // Initials for Avatar Fallback
  const getInitials = (nameStr) => {
    if (!nameStr) return 'U';
    const parts = nameStr.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return nameStr.slice(0, 2).toUpperCase();
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              User Profile & Security
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Manage personal credentials, avatar photo, email address, and account termination settings.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Avatar & Account Badge Card */}
          <Card className="lg:col-span-1 flex flex-col items-center text-center p-6 space-y-4">
            <div className="relative group">
              <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-emerald-500 to-indigo-600 p-1 shadow-xl">
                <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden flex items-center justify-center relative">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User Avatar'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-extrabold text-emerald-400 font-mono">
                      {getInitials(user?.displayName)}
                    </span>
                  )}

                  {updatingAvatar && (
                    <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center text-white">
                      <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={updatingAvatar}
                className="absolute bottom-1 right-1 p-2 rounded-full bg-emerald-500 text-white shadow-md hover:bg-emerald-600 transition-colors"
                title="Upload Profile Picture"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {user?.displayName || 'User'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {user?.email}
              </p>
            </div>

            <div className="flex gap-2 flex-wrap justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={updatingAvatar}
                className="text-xs"
              >
                <Camera className="w-3.5 h-3.5 mr-1.5" />
                Upload Photo
              </Button>

              {user?.photoURL && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteAvatar}
                  disabled={updatingAvatar}
                  className="text-xs text-rose-500 hover:text-rose-600 dark:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Remove
                </Button>
              )}
            </div>

            <hr className="w-full border-slate-100 dark:border-slate-800" />

            <div className="w-full text-left space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium">
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  Authentication Status
                </span>
                <Badge variant="emerald" size="sm">
                  Active
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  Database Sync
                </span>
                <span className="font-mono text-slate-700 dark:text-slate-300">Firebase Firestore</span>
              </div>
            </div>
          </Card>

          {/* Right Column: Profile Edit & Password Change Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Update Full Name & Email */}
            <Card title="Personal Information" subtitle="Update your display name and email address">
              <form onSubmit={handleSaveProfile} className="space-y-4 pt-1">
                <Input
                  label="Full Name / Display Name"
                  icon={User}
                  placeholder="e.g. Alex Morgan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />

                <Input
                  label="Email Address"
                  type="email"
                  icon={Mail}
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                {/* Show password prompt if email changed */}
                {email.trim().toLowerCase() !== (user?.email || '').toLowerCase() && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 space-y-2">
                    <p className="font-semibold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      Email change requires password re-authentication:
                    </p>
                    <Input
                      label="Current Password"
                      type="password"
                      icon={Lock}
                      placeholder="Enter current password to verify"
                      value={emailPasswordConfirm}
                      onChange={(e) => setEmailPasswordConfirm(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <Button type="submit" loading={updatingProfile} className="text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                    Save Changes
                  </Button>
                </div>
              </form>
            </Card>

            {/* 2. Change Password */}
            <Card title="Security & Password" subtitle="Update your account password">
              <form onSubmit={handleChangePassword} className="space-y-4 pt-1">
                <Input
                  label="Current Password"
                  type="password"
                  icon={KeyRound}
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="New Password"
                    type="password"
                    icon={Lock}
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />

                  <Input
                    label="Confirm New Password"
                    type="password"
                    icon={Lock}
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    variant="outline"
                    loading={updatingPassword}
                    className="text-xs"
                  >
                    <KeyRound className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                    Update Password
                  </Button>
                </div>
              </form>
            </Card>

            {/* 3. Account Termination Danger Zone */}
            <div className="p-5 rounded-2xl border border-rose-500/30 bg-rose-500/5 dark:bg-rose-950/20 space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-rose-600 dark:text-rose-400">
                    Danger Zone: Permanent Account Deletion
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Deleting your account is permanent. This action erases your authentication credentials, user document, and all logged financial records (expenses, income, budgets, categories).
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setShowDeleteModal(true)}
                  className="text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => {
            if (!deletingAccount) setShowDeleteModal(false);
          }}
          title="Delete Account & Erase All Data"
          subtitle="This action is permanent and cannot be undone."
          size="md"
          footer={
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteModal(false)}
                disabled={deletingAccount}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmAccountDeletion}
                loading={deletingAccount}
                disabled={deleteConfirmText !== 'DELETE' || !deletePassword}
              >
                Permanently Delete Account
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Warning: Irreversible Action</p>
                <p className="mt-1 leading-relaxed text-slate-600 dark:text-slate-300">
                  All your data stored in Firestore (including all income logs, expense items, custom categories, monthly budgets, and profile assets) will be permanently purged from the server.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Input
                label="Confirm with Password"
                type="password"
                icon={Lock}
                placeholder="Enter current password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                required
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Type <strong className="text-rose-500 font-mono">DELETE</strong> to confirm:
                </label>
                <input
                  type="text"
                  placeholder="DELETE"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                />
              </div>
            </div>
          </div>
        </Modal>
      )}
    </MainLayout>
  );
}
