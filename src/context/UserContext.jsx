import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, provider, db } from '../firebase';

const UserContext = createContext(null);

const DEFAULT_PROFILE = {
  name: '',
  email: '',
  age: '',
  riskLevel: 'moderate',
  investmentAmount: '',
  holdingPeriod: 'medium',
  sectors: [],
  _id: null,
};

export const UserProvider = ({ children }) => {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [watchlist] = useState(['AAPL', 'NVDA']);

  // Listen to Google Auth State Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      if (user) {
        // Fetch or create profile from Firestore based on Google Account
        const userRef = doc(db, 'users_auth_profiles', user.uid);
        const snapshot = await getDoc(userRef);

        if (snapshot.exists()) {
          setProfile({ ...DEFAULT_PROFILE, ...snapshot.data(), _id: user.uid });
        } else {
          // Initialize new db entry upon Sign-Up
          const newProfile = {
            ...DEFAULT_PROFILE,
            name: user.displayName || '',
            email: user.email || '',
            _id: user.uid,
          };
          setProfile(newProfile);
          
          try {
            await setDoc(userRef, {
              name: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp(),
            }, { merge: true });
          } catch (dbError) {
             alert(`Database Initial Save Failed!\nCheck Firebase Rules: ${dbError.message}`);
             console.error('Firestore Error:', dbError);
          }
        }
      } else {
        setProfile(DEFAULT_PROFILE);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (error) {
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
        console.warn('Popup blocked or closed by browser. Falling back to redirect...');
        await signInWithRedirect(auth, provider);
      } else {
        alert(`Login Failed: ${error.message}`);
        console.error('Login Failed:', error);
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setProfile(DEFAULT_PROFILE);
    } catch (error) {
      console.error('Logout Failed:', error);
    }
  };

  const updateProfile = async (newProfile) => {
    const updated = { ...profile, ...newProfile };
    setProfile(updated);
    
    // Save partial or full profile updates directly to Firebase
    if (authUser) {
      try {
        const userRef = doc(db, 'users_auth_profiles', authUser.uid);
        await setDoc(userRef, newProfile, { merge: true });
        // Optional: console.log for debug success
      } catch (dbError) {
        alert(`Database Save Failed!\nCheck Firebase Rules: ${dbError.message}`);
        console.error('Firestore Error:', dbError);
      }
    }
  };

  const updateUserPortfolio = async (newPortfolioArray) => {
    const updated = { ...profile, portfolio: newPortfolioArray };
    setProfile(updated);
    
    if (authUser) {
      try {
        const userRef = doc(db, 'users_auth_profiles', authUser.uid);
        await setDoc(userRef, { portfolio: newPortfolioArray }, { merge: true });
      } catch (dbError) {
        alert(`Database Save Failed!\nCheck Firebase Rules: ${dbError.message}`);
      }
    }
  };

  return (
    <UserContext.Provider value={{ profile, authUser, loading, updateProfile, updateUserPortfolio, loginWithGoogle, logout, watchlist }}>
      {!loading && children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be inside UserProvider');
  return ctx;
};
