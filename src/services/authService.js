import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { auth, db, storage } from '../firebase/firebase';

// Friendly error message parser for Firebase Auth error codes
export const getAuthErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred.';
  const code = error.code || '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password. Please try again.';
    case 'auth/email-already-in-use':
      return 'This email address is already registered. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many failed login attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/requires-recent-login':
      return 'For security reasons, please confirm your current password to continue.';
    default:
      return error.message || 'Authentication failed. Please try again.';
  }
};

/**
 * Register a new user with Firebase Auth and create a Firestore user profile document
 */
export const registerUser = async (email, password, displayName) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const firebaseUser = userCredential.user;

  // Update Auth Profile Display Name
  if (displayName) {
    await updateProfile(firebaseUser, { displayName });
  }

  // Create User Document in Firestore
  const userRef = doc(db, 'users', firebaseUser.uid);
  const userData = {
    uid: firebaseUser.uid,
    fullName: displayName || '',
    email: email,
    photoURL: firebaseUser.photoURL || null,
    settings: {
      theme: 'dark',
      currency: 'USD',
      notifications: true,
      autoSync: true,
    },
    createdAt: serverTimestamp(),
  };

  await setDoc(userRef, userData);

  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: displayName || firebaseUser.displayName || '',
    photoURL: firebaseUser.photoURL || null,
  };
};

/**
 * Login user with Email and Password
 */
export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

/**
 * Logout current user
 */
export const logoutUser = async () => {
  await signOut(auth);
};

/**
 * Send Password Reset Email
 */
export const resetPassword = async (email) => {
  await sendPasswordResetEmail(auth, email);
};

/**
 * Fetch User document from Firestore
 */
export const getUserProfile = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (err) {
    console.warn('Error fetching user profile from Firestore:', err);
    return null;
  }
};

/**
 * Upload Profile Image to Firebase Storage (with base64 fallback)
 */
export const uploadProfileImage = async (userId, file) => {
  if (!userId || !file) return null;

  try {
    const storageRef = ref(storage, `profile_pictures/${userId}/avatar`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (err) {
    console.warn('Firebase storage upload failed, using Data URL fallback:', err);
    // Convert file to Base64 Data URL fallback for sandbox environments
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }
};

/**
 * Delete Profile Image from Firebase Storage
 */
export const deleteProfileImage = async (userId) => {
  if (!userId) return;
  try {
    const storageRef = ref(storage, `profile_pictures/${userId}/avatar`);
    await deleteObject(storageRef);
  } catch (err) {
    console.warn('Error deleting profile picture from storage:', err);
  }
};

/**
 * Update User Profile (Full Name & Photo URL)
 */
export const updateUserProfileData = async (user, { fullName, photoURL }) => {
  if (!auth.currentUser) throw new Error('No authenticated user');

  // Update Firebase Auth profile
  await updateProfile(auth.currentUser, {
    displayName: fullName,
    photoURL: photoURL !== undefined ? photoURL : auth.currentUser.photoURL,
  });

  // Update Firestore user document
  const userRef = doc(db, 'users', auth.currentUser.uid);
  const updatePayload = {
    fullName,
    updatedAt: serverTimestamp(),
  };

  if (photoURL !== undefined) {
    updatePayload.photoURL = photoURL;
  }

  await setDoc(userRef, updatePayload, { merge: true });

  return {
    displayName: fullName,
    photoURL: photoURL !== undefined ? photoURL : auth.currentUser.photoURL,
  };
};

/**
 * Update User Email with Re-authentication
 */
export const updateUserEmailAddress = async (user, newEmail, currentPassword) => {
  if (!auth.currentUser) throw new Error('No authenticated user');

  // Re-authenticate user first for security
  if (currentPassword) {
    const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
    await reauthenticateWithCredential(auth.currentUser, credential);
  }

  // Update Auth email
  await updateEmail(auth.currentUser, newEmail);

  // Update Firestore email
  const userRef = doc(db, 'users', auth.currentUser.uid);
  await setDoc(userRef, { email: newEmail, updatedAt: serverTimestamp() }, { merge: true });

  return newEmail;
};

/**
 * Change User Password with Re-authentication
 */
export const changeUserAccountPassword = async (currentPassword, newPassword) => {
  if (!auth.currentUser) throw new Error('No authenticated user');

  const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
  await reauthenticateWithCredential(auth.currentUser, credential);
  await updatePassword(auth.currentUser, newPassword);
};

/**
 * Update User Application Settings in Firestore
 */
export const updateUserSettingsData = async (userId, settings) => {
  if (!userId) return;
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, { settings, updatedAt: serverTimestamp() }, { merge: true });
};

/**
 * Permanently Delete Account & All Associated Firestore Data
 */
export const deleteAccountAndAllData = async (currentPassword) => {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) throw new Error('No authenticated user found');

  const uid = firebaseUser.uid;

  // 1. Re-authenticate user
  if (currentPassword) {
    const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword);
    await reauthenticateWithCredential(firebaseUser, credential);
  }

  // Helper to delete collection items for user
  const deleteUserCollection = async (collectionName) => {
    try {
      const q = query(collection(db, collectionName), where('userId', '==', uid));
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
      await Promise.all(deletePromises);
    } catch (err) {
      console.warn(`Error deleting ${collectionName} for user:`, err);
    }
  };

  // 2. Delete user's financial records from Firestore
  await deleteUserCollection('expenses');
  await deleteUserCollection('income');
  await deleteUserCollection('budgets');
  await deleteUserCollection('categories');

  // 3. Delete user document
  try {
    await deleteDoc(doc(db, 'users', uid));
  } catch (err) {
    console.warn('Error deleting user doc:', err);
  }

  // 4. Delete profile avatar if exists
  await deleteProfileImage(uid);

  // 5. Delete Firebase Auth user
  await deleteUser(firebaseUser);
};

