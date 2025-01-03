// AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabase/supabaseClient'; // Make sure supabase is properly configured

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const session = supabase.auth.session(); // Check the current session
      if (session) {
        setIsLoggedIn(true); // Set to true if the user is logged in
      } else {
        setIsLoggedIn(false); // Set to false if no session
      }
    };

    checkSession(); // Check session on component mount

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(session ? true : false); // Update login status on auth state change
    });

    return () => {
      authListener?.unsubscribe(); // Clean up the listener on unmount
    };
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};
