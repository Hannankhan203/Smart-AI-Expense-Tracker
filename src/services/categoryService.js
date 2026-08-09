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
 * Default Category Suggestions required by specification
 */
export const DEFAULT_CATEGORY_SUGGESTIONS = [
  { id: 'def_food', categoryName: 'Food', categoryType: 'expense', isDefault: true },
  { id: 'def_transport', categoryName: 'Transport', categoryType: 'expense', isDefault: true },
  { id: 'def_shopping', categoryName: 'Shopping', categoryType: 'expense', isDefault: true },
  { id: 'def_bills', categoryName: 'Bills', categoryType: 'expense', isDefault: true },
  { id: 'def_entertainment', categoryName: 'Entertainment', categoryType: 'expense', isDefault: true },
  { id: 'def_fuel', categoryName: 'Fuel', categoryType: 'expense', isDefault: true },
  { id: 'def_education', categoryName: 'Education', categoryType: 'expense', isDefault: true },
  { id: 'def_healthcare', categoryName: 'Healthcare', categoryType: 'expense', isDefault: true },
  { id: 'def_salary', categoryName: 'Salary', categoryType: 'income', isDefault: true },
  { id: 'def_freelancing', categoryName: 'Freelancing', categoryType: 'income', isDefault: true },
];

/**
 * Fetch combined categories (default suggestions + custom user categories)
 */
export const getUserCategories = async (userId, type = null) => {
  try {
    const categoriesRef = collection(db, COLLECTIONS.CATEGORIES);
    const q = query(
      categoriesRef,
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);
    let customCategories = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (!type || data.categoryType === type) {
        customCategories.push({
          categoryId: docSnap.id,
          id: docSnap.id,
          isDefault: false,
          ...data,
        });
      }
    });

    customCategories.sort((a, b) => (a.categoryName || '').localeCompare(b.categoryName || ''));

    // Filter defaults if type is requested
    const filteredDefaults = type
      ? DEFAULT_CATEGORY_SUGGESTIONS.filter((c) => c.categoryType === type)
      : DEFAULT_CATEGORY_SUGGESTIONS;

    // Filter out default suggestions if custom category with same name exists
    const customNamesLower = new Set(customCategories.map((c) => c.categoryName.toLowerCase()));
    const nonOverriddenDefaults = filteredDefaults.filter(
      (d) => !customNamesLower.has(d.categoryName.toLowerCase())
    );

    return [...nonOverriddenDefaults, ...customCategories];
  } catch (error) {
    console.warn('Could not fetch custom categories, using default suggestions:', error);
    return type
      ? DEFAULT_CATEGORY_SUGGESTIONS.filter((c) => c.categoryType === type)
      : DEFAULT_CATEGORY_SUGGESTIONS;
  }
};

/**
 * Subscribe to real-time updates for custom categories of a user
 */
export const subscribeToCategories = (userId, callback, onError) => {
  try {
    const categoriesRef = collection(db, COLLECTIONS.CATEGORIES);
    const q = query(
      categoriesRef,
      where('userId', '==', userId)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const customCategories = [];
        snapshot.forEach((docSnap) => {
          customCategories.push({
            categoryId: docSnap.id,
            id: docSnap.id,
            isDefault: false,
            ...docSnap.data(),
          });
        });

        customCategories.sort((a, b) => (a.categoryName || '').localeCompare(b.categoryName || ''));

        // Merge defaults with custom
        const customNamesLower = new Set(customCategories.map((c) => c.categoryName.toLowerCase()));
        const nonOverriddenDefaults = DEFAULT_CATEGORY_SUGGESTIONS.filter(
          (d) => !customNamesLower.has(d.categoryName.toLowerCase())
        );

        callback([...nonOverriddenDefaults, ...customCategories]);
      },
      (error) => {
        console.error('Realtime category listener error:', error);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    console.error('Error setting up category listener:', error);
    if (onError) onError(error);
    return () => {};
  }
};

/**
 * Create a new custom category
 */
export const createCategory = async (userId, categoryData) => {
  try {
    const categoriesRef = collection(db, COLLECTIONS.CATEGORIES);
    const payload = {
      categoryName: categoryData.categoryName.trim(),
      categoryType: categoryData.categoryType || 'expense', // 'expense' or 'income'
      userId: userId,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(categoriesRef, payload);
    return { categoryId: docRef.id, id: docRef.id, ...payload };
  } catch (error) {
    handleFirestoreError(error, 'create', COLLECTIONS.CATEGORIES);
  }
};

/**
 * Update an existing custom category
 */
export const updateCategory = async (categoryId, updateData) => {
  try {
    const docRef = doc(db, COLLECTIONS.CATEGORIES, categoryId);
    const payload = {};

    if (updateData.categoryName !== undefined) {
      payload.categoryName = updateData.categoryName.trim();
    }
    if (updateData.categoryType !== undefined) {
      payload.categoryType = updateData.categoryType;
    }

    await updateDoc(docRef, payload);
    return { categoryId, id: categoryId, ...payload };
  } catch (error) {
    handleFirestoreError(error, 'update', `${COLLECTIONS.CATEGORIES}/${categoryId}`);
  }
};

/**
 * Delete a category
 */
export const deleteCategory = async (categoryId) => {
  try {
    const docRef = doc(db, COLLECTIONS.CATEGORIES, categoryId);
    await deleteDoc(docRef);
    return categoryId;
  } catch (error) {
    handleFirestoreError(error, 'delete', `${COLLECTIONS.CATEGORIES}/${categoryId}`);
  }
};

/**
 * Check whether a category is currently assigned to any expense or income transactions.
 * Prevents deleting in-use categories per prompt specification.
 */
export const checkCategoryInUse = async (userId, category) => {
  try {
    if (!userId || !category) return { inUse: false, count: 0, details: '' };

    const catName = (category.categoryName || '').toLowerCase().trim();
    const catId = category.categoryId || category.id;

    let expenseCount = 0;
    let incomeCount = 0;

    // 1. Check Expenses collection
    const expensesRef = collection(db, COLLECTIONS.EXPENSES);
    const qExp = query(expensesRef, where('userId', '==', userId));
    const expSnap = await getDocs(qExp);

    expSnap.forEach((docSnap) => {
      const data = docSnap.data();
      const expCatId = data.categoryId;
      const expCatName = (data.categoryName || '').toLowerCase().trim();

      if (expCatId === catId || expCatName === catName) {
        expenseCount++;
      }
    });

    // 2. Check Income collection
    const incomeRef = collection(db, COLLECTIONS.INCOME);
    const qInc = query(incomeRef, where('userId', '==', userId));
    const incSnap = await getDocs(qInc);

    incSnap.forEach((docSnap) => {
      const data = docSnap.data();
      const incSource = (data.source || '').toLowerCase().trim();
      const incCatId = data.categoryId;

      if (incSource === catName || incCatId === catId) {
        incomeCount++;
      }
    });

    const totalCount = expenseCount + incomeCount;
    if (totalCount > 0) {
      const usageParts = [];
      if (expenseCount > 0) usageParts.push(`${expenseCount} expense(s)`);
      if (incomeCount > 0) usageParts.push(`${incomeCount} income entry(ies)`);

      return {
        inUse: true,
        count: totalCount,
        details: usageParts.join(' and '),
      };
    }

    return { inUse: false, count: 0, details: '' };
  } catch (error) {
    console.error('Error checking category usage:', error);
    // Conservative fallback if check fails
    return { inUse: false, count: 0, details: '' };
  }
};
