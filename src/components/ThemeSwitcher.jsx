/**
 * ============================================================================
 * THEME SWITCHER COMPONENT
 * Beautiful theme selector with live preview
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { useThemeStore, themes, applyTheme } from '../stores/themeStore';
import './ThemeSwitcher.css';

export const ThemeSwitcher = () => {
  const { theme, setTheme, setIsTransitioning } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const handleThemeChange = (newTheme) => {
    if (newTheme === theme) return;
    
    setIsTransitioning(true);
    setTheme(newTheme);
    applyTheme(newTheme);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 600);
  };

  const filteredThemes = themes.filter(t => 
    filter === 'all' || t.category === filter
  );

  const currentTheme = themes.find(t => t.id === theme);

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="theme-switcher-trigger"
        title="Change Theme"
      >
        <span className="theme-icon">🎨</span>
      </button>

      {/* Theme Switcher Modal */}
      {isOpen && (
        <div className="theme-switcher-overlay" onClick={() => setIsOpen(false)}>
          <div className="theme-switcher-modal" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="theme-switcher-header">
              <div className="theme-switcher-title">
                <span className="sparkle-icon">✨</span>
                <div>
                  <h2>Choose Your Theme</h2>
                  <p className="current-theme">
                    Current: {currentTheme?.name} {currentTheme?.icon}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="close-button"
              >
                ✕
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="theme-filter-tabs">
              {['all', 'light', 'dark', 'colorful'].map((category) => (
                <button
                  key={category}
                  onClick={() => setFilter(category)}
                  className={`filter-tab ${filter === category ? 'active' : ''}`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                  {category === 'all' && ` (${themes.length})`}
                  {category !== 'all' && ` (${themes.filter(t => t.category === category).length})`}
                </button>
              ))}
            </div>

            {/* Theme Grid */}
            <div className="theme-grid-container">
              <div className="theme-grid">
                {filteredThemes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleThemeChange(t.id)}
                    className={`theme-card ${theme === t.id ? 'active' : ''}`}
                  >
                    {/* Theme Preview */}
                    <div className="theme-preview">
                      <div className="theme-icon-large">
                        {t.icon}
                      </div>
                      <div className="theme-info">
                        <h3>{t.name}</h3>
                        <p className="theme-category">{t.category}</p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="theme-description">
                      {t.description}
                    </p>

                    {/* Color Swatches */}
                    <div className="color-swatches">
                      <div
                        className="color-swatch"
                        style={{ background: t.primary }}
                        title="Primary Color"
                      />
                      <div
                        className="color-swatch"
                        style={{ background: t.secondary }}
                        title="Secondary Color"
                      />
                    </div>

                    {/* Active Indicator */}
                    {theme === t.id && (
                      <div className="active-indicator" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="theme-switcher-footer">
              <p>
                {filteredThemes.length} theme{filteredThemes.length !== 1 ? 's' : ''} available
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ThemeSwitcher;