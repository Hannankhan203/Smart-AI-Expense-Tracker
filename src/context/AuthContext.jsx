import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import {
  registerUser,
  loginUser,
  logoutUser,
  resetPassword,
  getUserProfile,
} from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Try fetching additional Firestore profile data if needed
        const profile = await getUserProfile(firebaseUser.uid);
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || profile?.fullName || 'User',
          photoURL: firebaseUser.photoURL || profile?.photoURL || null,
          createdAt: profile?.createdAt || null,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    return await loginUser(email, password);
  };

  const register = async (email, password, displayName) => {
    return await registerUser(email, password, displayName);
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  const sendPasswordReset = async (email) => {
    return await resetPassword(email);
  };

  const refreshUserProfile = async () => {
    if (!auth.currentUser) return;
    const profile = await getUserProfile(auth.currentUser.uid);
    setUser({
      uid: auth.currentUser.uid,
      email: auth.currentUser.email,
      displayName: auth.currentUser.displayName || profile?.fullName || 'User',
      photoURL: auth.currentUser.photoURL || profile?.photoURL || null,
      createdAt: profile?.createdAt || null,
    });
  };

  const value = {
    user,
    setUser,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    sendPasswordReset,
    refreshUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
