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
 * Month labels helper
 */
export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * Create a new budget limit in Firestore
 */
export const createBudget = async (userId, budgetData) => {
  try {
    const budgetsRef = collection(db, COLLECTIONS.BUDGETS);
    const payload = {
      budgetId: budgetData.budgetId || null,
      userId: userId,
      categoryId: budgetData.categoryId || '',
      categoryName: budgetData.categoryName || '',
      monthlyLimit: parseFloat(budgetData.monthlyLimit) || 0,
      month: parseInt(budgetData.month, 10), // 1 - 12
      year: parseInt(budgetData.year, 10), // e.g. 2026
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(budgetsRef, payload);
    const resultId = docRef.id;
    
    // Update doc with its own budgetId for reference
    await updateDoc(doc(db, COLLECTIONS.BUDGETS, resultId), {
      budgetId: resultId,
    });

    return { budgetId: resultId, id: resultId, ...payload };
  } catch (error) {
    handleFirestoreError(error, 'create', COLLECTIONS.BUDGETS);
  }
};

/**
 * Fetch all budgets for a specific user
 */
export const getBudgets = async (userId) => {
  try {
    const budgetsRef = collection(db, COLLECTIONS.BUDGETS);
    const q = query(
      budgetsRef,
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);
    const budgetsList = [];
    snapshot.forEach((docSnap) => {
      budgetsList.push({
        budgetId: docSnap.id,
        id: docSnap.id,
        ...docSnap.data(),
      });
    });

    budgetsList.sort((a, b) => {
      if (b.year !== a.year) return (b.year || 0) - (a.year || 0);
      return (b.month || 0) - (a.month || 0);
    });

    return budgetsList;
  } catch (error) {
    handleFirestoreError(error, 'list', COLLECTIONS.BUDGETS);
    return [];
  }
};

/**
 * Update an existing budget record
 */
export const updateBudget = async (budgetId, updateData) => {
  try {
    const docRef = doc(db, COLLECTIONS.BUDGETS, budgetId);
    const payload = {};

    if (updateData.categoryId !== undefined) payload.categoryId = updateData.categoryId;
    if (updateData.categoryName !== undefined) payload.categoryName = updateData.categoryName;
    if (updateData.monthlyLimit !== undefined) payload.monthlyLimit = parseFloat(updateData.monthlyLimit);
    if (updateData.month !== undefined) payload.month = parseInt(updateData.month, 10);
    if (updateData.year !== undefined) payload.year = parseInt(updateData.year, 10);

    await updateDoc(docRef, payload);
    return { budgetId, id: budgetId, ...payload };
  } catch (error) {
    handleFirestoreError(error, 'update', `${COLLECTIONS.BUDGETS}/${budgetId}`);
  }
};

/**
 * Delete a budget record
 */
export const deleteBudget = async (budgetId) => {
  try {
    const docRef = doc(db, COLLECTIONS.BUDGETS, budgetId);
    await deleteDoc(docRef);
    return budgetId;
  } catch (error) {
    handleFirestoreError(error, 'delete', `${COLLECTIONS.BUDGETS}/${budgetId}`);
  }
};

/**
 * Subscribe to real-time updates for user's budgets
 */
export const subscribeToBudgets = (userId, callback, onError) => {
  try {
    const budgetsRef = collection(db, COLLECTIONS.BUDGETS);
    const q = query(
      budgetsRef,
      where('userId', '==', userId)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const budgetsList = [];
        snapshot.forEach((docSnap) => {
          budgetsList.push({
            budgetId: docSnap.id,
            id: docSnap.id,
            ...docSnap.data(),
          });
        });
        budgetsList.sort((a, b) => {
          if (b.year !== a.year) return (b.year || 0) - (a.year || 0);
          return (b.month || 0) - (a.month || 0);
        });
        callback(budgetsList);
      },
      (error) => {
        console.error('Realtime budget listener error:', error);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    console.error('Error setting up budget listener:', error);
    if (onError) onError(error);
    return () => {};
  }
};
