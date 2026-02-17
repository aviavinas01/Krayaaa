import React, { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';  
import './ThemeSwitcher.css';  

const themes = [
    { id: 'default', color: '#188125', name: 'Matrix Green' },
    { id: 'blue',    color: '#00f3ff', name: 'Cyber Blue' },
    { id: 'gold',    color: '#ffd700', name: 'Midas Gold' },
    { id: 'pink',    color: '#ff00ff', name: 'Neon Pink' },
    { id: 'purple',  color: '#9d00ff', name: 'Void Purple' },
    { id: 'red',     color: '#ff003c', name: 'Crimson' },
    { id: 'orange',  color: '#ff8800', name: 'Sunset' },
];

const ThemeSwitcher = () => {
    const { theme, changeTheme } = useContext(ThemeContext);

    return (
        <div className="theme-switcher-container">
            <h4 className="theme-label">SYSTEM THEME //</h4>
            <div className="theme-grid">
                {themes.map((t) => (
                    <button
                        key={t.id}
                        className={`theme-btn ${theme === t.id ? 'active' : ''}`}
                        style={{ backgroundColor: t.color }}
                        onClick={() => changeTheme(t.id)}
                        aria-label={`Select ${t.name}`}
                        title={t.name}
                    />
                ))}
            </div>
            <div className="theme-name-display">
                CURRENT: {themes.find(t => t.id === theme)?.name || 'UNKNOWN'}
            </div>
        </div>
    );
};

export default ThemeSwitcher;