import { auth } from './firebase';

export const COLLECTIONS = {
  USERS: 'users',
  CATEGORIES: 'categories',
  INCOME: 'income',
  EXPENSES: 'expenses',
  BUDGETS: 'budgets',
};

export const STORAGE_PATHS = {
  profile: (userId, fileName) => `users/${userId}/profile/${fileName}`,
  receipt: (userId, fileName) => `users/${userId}/receipts/${fileName}`,
};

export const OperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  GET: 'get',
  WRITE: 'write',
};

/**
 * Standardized Firestore error handler for permission and operational errors
 */
export function handleFirestoreError(error, operationType, path) {
  const currentUser = auth.currentUser;
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path: path || null,
    authInfo: {
      userId: currentUser?.uid || null,
      email: currentUser?.email || null,
      emailVerified: currentUser?.emailVerified || null,
      isAnonymous: currentUser?.isAnonymous || null,
    },
  };

  console.error('Firestore Operation Error:', errInfo);
  throw new Error(JSON.stringify(errInfo));
}
