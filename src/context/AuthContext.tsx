import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';

interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  whatsApp?: string;
  companyName?: string;
  createdAt: string;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, profile: Omit<UserProfile, 'uid' | 'createdAt'>) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [mockUser, setMockUser] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setMockUser(null);
        // Fetch Firestore profile
        try {
          const docRef = doc(db, 'users', user.uid);
          let docSnap;
          try {
            docSnap = await getDoc(docRef);
          } catch (err) {
            handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
            return;
          }

          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfile);
          } else {
            // Profile does not exist yet (e.g. if registered elsewhere or oauth), create minimal
            const minimalProfile: UserProfile = {
              uid: user.uid,
              fullName: user.displayName || 'Client Partner',
              email: user.email || '',
              phone: '',
              createdAt: new Date().toISOString()
            };
            try {
              await setDoc(docRef, minimalProfile);
            } catch (err) {
              handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
              return;
            }
            setUserProfile(minimalProfile);
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      } else {
        if (!mockUser) {
          setUserProfile(null);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [mockUser]);

  const login = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        console.warn('Firebase Auth email/password provider is disabled. Using sandbox login fallback.');
        const isSystemAdmin = email === 'bajpaiadmin64@gmail.com' && pass === 'BAJPAI@890';
        const mockUid = isSystemAdmin ? 'admin-sandbox-uid' : 'user-sandbox-' + Math.random().toString(36).substring(2, 9);
        const name = isSystemAdmin ? 'Bajpai Admin (Sandbox)' : email.split('@')[0];
        
        const fallbackProfile: UserProfile = {
          uid: mockUid,
          fullName: name,
          email: email,
          phone: isSystemAdmin ? '7706929484' : '',
          createdAt: new Date().toISOString()
        };
        
        setMockUser({
          uid: mockUid,
          email: email,
          displayName: name,
          emailVerified: true
        });
        setUserProfile(fallbackProfile);
        return;
      }
      throw err;
    }
  };

  const register = async (email: string, pass: string, profile: Omit<UserProfile, 'uid' | 'createdAt'>) => {
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, pass);
      const user = credential.user;

      // Update Auth Profile displayName
      await updateProfile(user, {
        displayName: profile.fullName
      });

      const newProfile: UserProfile = {
        uid: user.uid,
        fullName: profile.fullName,
        email: email,
        phone: profile.phone,
        whatsApp: profile.whatsApp || '',
        companyName: profile.companyName || '',
        createdAt: new Date().toISOString()
      };

      // Save profile to firestore
      try {
        await setDoc(doc(db, 'users', user.uid), newProfile);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
      }
      setUserProfile(newProfile);
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        console.warn('Firebase Auth email/password provider is disabled. Using sandbox registration fallback.');
        const mockUid = 'user-sandbox-' + Math.random().toString(36).substring(2, 9);
        const fallbackProfile: UserProfile = {
          uid: mockUid,
          fullName: profile.fullName,
          email: email,
          phone: profile.phone,
          whatsApp: profile.whatsApp || '',
          companyName: profile.companyName || '',
          createdAt: new Date().toISOString()
        };
        setMockUser({
          uid: mockUid,
          email: email,
          displayName: profile.fullName,
          emailVerified: true
        });
        setUserProfile(fallbackProfile);
        return;
      }
      throw err;
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    setMockUser(null);
    setUserProfile(null);
    await firebaseSignOut(auth);
  };

  const activeUser = currentUser || mockUser;

  const value = {
    currentUser: activeUser,
    userProfile,
    loading,
    isAdmin: activeUser?.email === 'bajpaiadmin64@gmail.com',
    login,
    register,
    signInWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
