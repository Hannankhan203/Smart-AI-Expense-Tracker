import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { COLLECTIONS, handleFirestoreError } from '../firebase/firestoreUtils';

/**
 * Default categories helper list
 */
export const DEFAULT_CATEGORIES = [
  { id: 'housing', name: 'Housing & Rent', color: '#10b981' },
  { id: 'groceries', name: 'Groceries & Food', color: '#0d9488' },
  { id: 'transport', name: 'Transportation & Gas', color: '#0284c7' },
  { id: 'utilities', name: 'Utilities & Bills', color: '#6366f1' },
  { id: 'dining', name: 'Dining & Restaurants', color: '#f59e0b' },
  { id: 'shopping', name: 'Shopping & Apparel', color: '#ec4899' },
  { id: 'healthcare', name: 'Healthcare & Medical', color: '#ef4444' },
  { id: 'entertainment', name: 'Entertainment & Leisure', color: '#8b5cf6' },
  { id: 'subscriptions', name: 'Subscriptions & Software', color: '#06b6d4' },
  { id: 'other', name: 'Other Expenses', color: '#64748b' },
];

/**
 * Payment method options
 */
export const PAYMENT_METHODS = [
  'Credit Card',
  'Debit Card',
  'Cash',
  'Bank Transfer',
  'UPI / Mobile Wallet',
  'Other',
];

/**
 * Create a new expense record in Firestore
 */
export const createExpense = async (userId, expenseData) => {
  try {
    const expensesRef = collection(db, COLLECTIONS.EXPENSES);
    const payload = {
      title: expenseData.title.trim(),
      amount: parseFloat(expenseData.amount) || 0,
      categoryId: expenseData.categoryId || 'other',
      categoryName: expenseData.categoryName || 'Other Expenses',
      paymentMethod: expenseData.paymentMethod || 'Credit Card',
      expenseDate: expenseData.expenseDate || new Date().toISOString().split('T')[0],
      description: expenseData.description ? expenseData.description.trim() : '',
      receiptURL: expenseData.receiptURL || null,
      userId: userId,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(expensesRef, payload);
    return { expenseId: docRef.id, ...payload };
  } catch (error) {
    handleFirestoreError(error, 'create', COLLECTIONS.EXPENSES);
  }
};

/**
 * Fetch all expenses for a specific user
 */
export const getExpenses = async (userId) => {
  try {
    const expensesRef = collection(db, COLLECTIONS.EXPENSES);
    const q = query(
      expensesRef,
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);
    const expenses = [];
    snapshot.forEach((docSnap) => {
      expenses.push({
        expenseId: docSnap.id,
        id: docSnap.id,
        ...docSnap.data(),
      });
    });

    expenses.sort((a, b) => (b.expenseDate || '').localeCompare(a.expenseDate || ''));

    return expenses;
  } catch (error) {
    handleFirestoreError(error, 'list', COLLECTIONS.EXPENSES);
    return [];
  }
};

/**
 * Update an existing expense record
 */
export const updateExpense = async (expenseId, updateData) => {
  try {
    const docRef = doc(db, COLLECTIONS.EXPENSES, expenseId);
    const payload = {
      ...updateData,
    };
    if (updateData.title) payload.title = updateData.title.trim();
    if (updateData.amount) payload.amount = parseFloat(updateData.amount);
    if (updateData.description !== undefined) payload.description = updateData.description.trim();

    await updateDoc(docRef, payload);
    return { expenseId, ...payload };
  } catch (error) {
    handleFirestoreError(error, 'update', `${COLLECTIONS.EXPENSES}/${expenseId}`);
  }
};

/**
 * Delete an expense record
 */
export const deleteExpense = async (expenseId) => {
  try {
    const docRef = doc(db, COLLECTIONS.EXPENSES, expenseId);
    await deleteDoc(docRef);
    return expenseId;
  } catch (error) {
    handleFirestoreError(error, 'delete', `${COLLECTIONS.EXPENSES}/${expenseId}`);
  }
};

/**
 * Real-time listener for expenses collection
 */
export const subscribeToExpenses = (userId, callback, onError) => {
  try {
    const expensesRef = collection(db, COLLECTIONS.EXPENSES);
    const q = query(
      expensesRef,
      where('userId', '==', userId)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const expenses = [];
        snapshot.forEach((docSnap) => {
          expenses.push({
            expenseId: docSnap.id,
            id: docSnap.id,
            ...docSnap.data(),
          });
        });
        expenses.sort((a, b) => (b.expenseDate || '').localeCompare(a.expenseDate || ''));
        callback(expenses);
      },
      (error) => {
        console.error('Realtime expenses listener error:', error);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    console.error('Error setting up expense listener:', error);
    if (onError) onError(error);
    return () => {};
  }
};
