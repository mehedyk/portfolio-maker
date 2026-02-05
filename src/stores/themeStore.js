/**
 * ============================================================================
 * THEME STORE - Portfolio Builder
 * Professional theme management with 13 carefully crafted themes
 * ============================================================================
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'professional-blue',
      isTransitioning: false,
      setTheme: (theme) => set({ theme }),
      setIsTransitioning: (value) => set({ isTransitioning: value }),
    }),
    {
      name: 'portfolio-builder-theme',
    }
  )
);

export const themes = [
  // LIGHT THEMES (Professional & Clean)
  {
    id: 'professional-blue',
    name: 'Professional Blue',
    class: 'theme-professional-blue',
    icon: '💼',
    description: 'Clean, corporate blue palette',
    category: 'light',
    primary: '#2563eb',
    secondary: '#3b82f6',
  },
  {
    id: 'minimal-gray',
    name: 'Minimal Gray',
    class: 'theme-minimal-gray',
    icon: '⚪',
    description: 'Elegant grayscale design',
    category: 'light',
    primary: '#4b5563',
    secondary: '#6b7280',
  },
  {
    id: 'fresh-green',
    name: 'Fresh Green',
    class: 'theme-fresh-green',
    icon: '🌿',
    description: 'Natural, eco-friendly green',
    category: 'light',
    primary: '#059669',
    secondary: '#10b981',
  },
  
  // DARK THEMES (Modern & Sleek)
  {
    id: 'dark-elegance',
    name: 'Dark Elegance',
    class: 'theme-dark-elegance',
    icon: '🌙',
    description: 'Sophisticated dark theme',
    category: 'dark',
    primary: '#6366f1',
    secondary: '#818cf8',
  },
  {
    id: 'midnight-slate',
    name: 'Midnight Slate',
    class: 'theme-midnight-slate',
    icon: '🌌',
    description: 'Deep slate with blue accents',
    category: 'dark',
    primary: '#0ea5e9',
    secondary: '#38bdf8',
  },
  {
    id: 'carbon-gold',
    name: 'Carbon Gold',
    class: 'theme-carbon-gold',
    icon: '⭐',
    description: 'Premium gold on dark',
    category: 'dark',
    primary: '#f59e0b',
    secondary: '#fbbf24',
  },
  
  // COLORFUL THEMES (Vibrant & Creative)
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    class: 'theme-ocean-breeze',
    icon: '🌊',
    description: 'Refreshing ocean blues',
    category: 'colorful',
    primary: '#06b6d4',
    secondary: '#22d3ee',
  },
  {
    id: 'sunset-glow',
    name: 'Sunset Glow',
    class: 'theme-sunset-glow',
    icon: '🌅',
    description: 'Warm sunset oranges',
    category: 'colorful',
    primary: '#f97316',
    secondary: '#fb923c',
  },
  {
    id: 'purple-reign',
    name: 'Purple Reign',
    class: 'theme-purple-reign',
    icon: '💜',
    description: 'Royal purple tones',
    category: 'colorful',
    primary: '#a855f7',
    secondary: '#c084fc',
  },
  {
    id: 'rose-pink',
    name: 'Rose Pink',
    class: 'theme-rose-pink',
    icon: '🌸',
    description: 'Elegant rose pink',
    category: 'colorful',
    primary: '#ec4899',
    secondary: '#f472b6',
  },
  {
    id: 'crimson-red',
    name: 'Crimson Red',
    class: 'theme-crimson-red',
    icon: '🔴',
    description: 'Bold crimson energy',
    category: 'colorful',
    primary: '#dc2626',
    secondary: '#ef4444',
  },
  {
    id: 'lime-fresh',
    name: 'Lime Fresh',
    class: 'theme-lime-fresh',
    icon: '🍋',
    description: 'Energetic lime green',
    category: 'colorful',
    primary: '#84cc16',
    secondary: '#a3e635',
  },
  {
    id: 'teal-mint',
    name: 'Teal Mint',
    class: 'theme-teal-mint',
    icon: '🌿',
    description: 'Cool teal and mint',
    category: 'colorful',
    primary: '#14b8a6',
    secondary: '#2dd4bf',
  },
];

// Helper function to apply theme
export const applyTheme = (themeId) => {
  const theme = themes.find(t => t.id === themeId);
  
  // Remove all theme classes
  themes.forEach(t => {
    if (t.class) {
      document.documentElement.classList.remove(t.class);
    }
  });
  
  // Add current theme class
  if (theme?.class) {
    document.documentElement.classList.add(theme.class);
    document.documentElement.setAttribute('data-theme', themeId);
  }
};