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
 * Standard income source categories
 */
export const INCOME_SOURCES = [
  'Salary',
  'Freelance / Consulting',
  'Investments / Dividends',
  'Business Revenue',
  'Rental Income',
  'Side Hustle',
  'Gifts / Grants',
  'Refunds',
  'Other',
];

/**
 * Create a new income record in Firestore
 */
export const createIncome = async (userId, incomeData) => {
  try {
    const incomeRef = collection(db, COLLECTIONS.INCOME);
    const payload = {
      title: incomeData.title.trim(),
      source: incomeData.source || 'Salary',
      amount: parseFloat(incomeData.amount) || 0,
      date: incomeData.date || new Date().toISOString().split('T')[0],
      notes: incomeData.notes ? incomeData.notes.trim() : '',
      userId: userId,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(incomeRef, payload);
    return { incomeId: docRef.id, id: docRef.id, ...payload };
  } catch (error) {
    handleFirestoreError(error, 'create', COLLECTIONS.INCOME);
  }
};

/**
 * Fetch all income entries for a specific user
 */
export const getIncome = async (userId) => {
  try {
    const incomeRef = collection(db, COLLECTIONS.INCOME);
    const q = query(
      incomeRef,
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);
    const incomeList = [];
    snapshot.forEach((docSnap) => {
      incomeList.push({
        incomeId: docSnap.id,
        id: docSnap.id,
        ...docSnap.data(),
      });
    });

    incomeList.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    return incomeList;
  } catch (error) {
    handleFirestoreError(error, 'list', COLLECTIONS.INCOME);
    return [];
  }
};

/**
 * Update an existing income entry
 */
export const updateIncome = async (incomeId, updateData) => {
  try {
    const docRef = doc(db, COLLECTIONS.INCOME, incomeId);
    const payload = {};

    if (updateData.title !== undefined) payload.title = updateData.title.trim();
    if (updateData.source !== undefined) payload.source = updateData.source;
    if (updateData.amount !== undefined) payload.amount = parseFloat(updateData.amount);
    if (updateData.date !== undefined) payload.date = updateData.date;
    if (updateData.notes !== undefined) payload.notes = updateData.notes.trim();

    await updateDoc(docRef, payload);
    return { incomeId, id: incomeId, ...payload };
  } catch (error) {
    handleFirestoreError(error, 'update', `${COLLECTIONS.INCOME}/${incomeId}`);
  }
};

/**
 * Delete an income entry
 */
export const deleteIncome = async (incomeId) => {
  try {
    const docRef = doc(db, COLLECTIONS.INCOME, incomeId);
    await deleteDoc(docRef);
    return incomeId;
  } catch (error) {
    handleFirestoreError(error, 'delete', `${COLLECTIONS.INCOME}/${incomeId}`);
  }
};

/**
 * Subscribe to real-time updates for user's income
 */
export const subscribeToIncome = (userId, callback, onError) => {
  try {
    const incomeRef = collection(db, COLLECTIONS.INCOME);
    const q = query(
      incomeRef,
      where('userId', '==', userId)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const incomeList = [];
        snapshot.forEach((docSnap) => {
          incomeList.push({
            incomeId: docSnap.id,
            id: docSnap.id,
            ...docSnap.data(),
          });
        });
        incomeList.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        callback(incomeList);
      },
      (error) => {
        console.error('Realtime income listener error:', error);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    console.error('Error setting up income listener:', error);
    if (onError) onError(error);
    return () => {};
  }
};
