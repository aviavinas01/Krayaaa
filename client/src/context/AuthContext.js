// client/src/context/AuthContext.js

import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebaseconfig';
import axios from 'axios';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState({
    isLoggedIn: false,
    firebaseUser: null,
    dbUser: null,
    hasProfile: false,
  });

  const [isLoading, setIsLoading] = useState(true);

  /* -------------------------------
      CORE AUTH LISTENER
  -------------------------------- */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);

      // 🚫 Not logged in
      if (!firebaseUser) {
        setAuthData({
          isLoggedIn: false,
          firebaseUser: null,
          dbUser: null,
          hasProfile: false,
        });
        setIsLoading(false);
        return;
      }

      try {
        const token = await firebaseUser.getIdToken(true);

        const res = await axios.get(
          `https://krayaaa.onrender.com/users/profile/${firebaseUser.uid}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // ✅ Profile exists
        setAuthData({
          isLoggedIn: true,
          firebaseUser,
          dbUser: res.data,
          hasProfile: true,
        });

      } catch (err) {
        // Expected case for new users
        if (err.response?.status === 404) {
          setAuthData({
            isLoggedIn: true,
            firebaseUser,
            dbUser: null,
            hasProfile: false,
          });
        } else {
          console.error('AuthContext fatal error:', err);
          await signOut(auth);
          setAuthData({
            isLoggedIn: false,
            firebaseUser: null,
            dbUser: null,
            hasProfile: false,
          });
        }
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /* -------------------------------
      AFTER PROFILE CREATION
  -------------------------------- */
  const completeProfile = async () => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return;

    try {
      const token = await firebaseUser.getIdToken(true);
      const res = await axios.get(
        `https://krayaaa.onrender.com/users/profile/${firebaseUser.uid}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAuthData({
        isLoggedIn: true,
        firebaseUser,
        dbUser: res.data,
        hasProfile: true,
      });
    } catch (err) {
      if (err.response?.status === 404) {
        setAuthData({
          isLoggedIn: true,
          firebaseUser,
          dbUser: null,
          hasProfile: false,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  /* -------------------------------
      LOGOUT
  -------------------------------- */
  const logoutUser = async () => {
    await signOut(auth);
    setAuthData({
      isLoggedIn: false,
      firebaseUser: null,
      dbUser: null,
      hasProfile: false,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        authData,
        isLoading,
        completeProfile,
        logoutUser,
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
};