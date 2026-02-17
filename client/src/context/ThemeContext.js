import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { auth } from '../firebaseconfig'; // <--- 1. IMPORT FIREBASE AUTH DIRECTLY

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const { authData } = useContext(AuthContext);
    
    // Initialize theme from local storage or default
    const [theme, setTheme] = useState(localStorage.getItem('siteTheme') || 'default');

    // Effect to apply the CSS class to the body
    useEffect(() => {
        const validThemes = ['default', 'blue', 'gold', 'pink', 'purple', 'red', 'orange'];
        const safeTheme = validThemes.includes(theme) ? theme : 'default';

        validThemes.forEach(t => document.body.classList.remove(`theme-${t}`));
        document.body.classList.add(`theme-${safeTheme}`);
        localStorage.setItem('siteTheme', safeTheme);
    }, [theme]);

    // Effect to sync with DB when user logs in
    useEffect(() => {
        if (authData.isLoggedIn && authData.dbUser?.preferredTheme) {
            setTheme(authData.dbUser.preferredTheme);
        }
    }, [authData.isLoggedIn, authData.dbUser]);

    // --- THE FIXED FUNCTION ---
    const changeTheme = async (newTheme) => {
        setTheme(newTheme);
       if (auth.currentUser) {
            try {
                const token = await auth.currentUser.getIdToken();
                // 4. Send the request with the fresh token
                await axios.put('http://localhost:5000/profile/theme', 
                    { theme: newTheme }, 
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                console.log("Theme saved to database.");
            } catch (error) {
                console.error("Could not save theme:", error);
            }
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, changeTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeProvider;