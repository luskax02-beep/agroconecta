
import { UserProfile, AnalysisResult, HistoryItem, PastureListing } from '../types';
import { db as firestoreDb, auth } from '../firebaseConfig';
import { doc, getDoc, setDoc, collection, getDocs, addDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';

const defaultProfile: UserProfile = {
    farmName: '',
    location: '',
    crops: [],
    history: [],
    isSubscribed: false,
    promptCount: 0
};

// Listen for auth state to cache profile or set initial state if needed
let currentUserId: string | null = null;
onAuthStateChanged(auth, (user) => {
    currentUserId = user ? user.uid : null;
});

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const db = {
    user: {
        isAuthenticated: (): boolean => {
            return currentUserId !== null;
        },
        login: async () => {
             const provider = new GoogleAuthProvider();
             provider.setCustomParameters({
                 prompt: 'select_account'
             });
             try {
                const { signInWithPopup } = await import('firebase/auth');
                await signInWithPopup(auth, provider);
             } catch (error: any) {
                console.error("Login failed:", error);
                throw error;
             }
        },
        loginWithEmail: async (email: string, password: string) => {
             try {
                 const { signInWithEmailAndPassword } = await import('firebase/auth');
                 await signInWithEmailAndPassword(auth, email, password);
             } catch (error: any) {
                 console.error("Email login failed", error);
                 throw error;
             }
        },
        registerWithEmail: async (email: string, password: string) => {
             try {
                 const { createUserWithEmailAndPassword } = await import('firebase/auth');
                 await createUserWithEmailAndPassword(auth, email, password);
             } catch (error: any) {
                 console.error("Email register failed", error);
                 throw error;
             }
        },
        logout: async () => {
             try {
                 await signOut(auth);
             } catch (error) {
                 console.error("Logout failed", error);
             }
        },
        getProfile: async (): Promise<UserProfile> => {
            if (!currentUserId) return defaultProfile;
            const path = `users/${currentUserId}`;
            try {
                const userDoc = await getDoc(doc(firestoreDb, 'users', currentUserId));
                if (userDoc.exists()) {
                    return userDoc.data() as UserProfile;
                } else {
                    return defaultProfile;
                }
            } catch (error) {
                handleFirestoreError(error, OperationType.GET, path);
                return defaultProfile;
            }
        },
        updateProfile: async (profile: UserProfile): Promise<void> => {
            if (!currentUserId) return;
            const path = `users/${currentUserId}`;
            try {
                await setDoc(doc(firestoreDb, 'users', currentUserId), profile, { merge: true });
            } catch (error) {
                handleFirestoreError(error, OperationType.WRITE, path);
            }
        },
        addHistoryItem: async (result: AnalysisResult): Promise<void> => {
            if (!currentUserId) return;
            const path = `users/${currentUserId}/history`;
            try {
                const newItem = {
                    timestamp: Date.now(),
                    result: result
                };
                await addDoc(collection(firestoreDb, 'users', currentUserId, 'history'), newItem);
            } catch (error) {
                handleFirestoreError(error, OperationType.CREATE, path);
            }
        }
    },
    marketplace: {
        getListings: async (): Promise<PastureListing[]> => {
            const path = 'marketplace';
            try {
                const snapshot = await getDocs(collection(firestoreDb, 'marketplace'));
                const listings: PastureListing[] = [];
                snapshot.forEach((doc) => {
                    listings.push({ id: doc.id, ...doc.data() } as PastureListing);
                });
                return listings;
            } catch (error) {
                handleFirestoreError(error, OperationType.LIST, path);
                return [];
            }
        },
        addListing: async (listing: Omit<PastureListing, 'id'>): Promise<void> => {
            const path = 'marketplace';
            try {
                await addDoc(collection(firestoreDb, 'marketplace'), { ...listing, createdAt: Date.now() });
            } catch (error) {
                handleFirestoreError(error, OperationType.CREATE, path);
            }
        }
    }
};

export const database = db;

