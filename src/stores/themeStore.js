/**
 * ============================================================================
 * THEME STORE - Portfolio Builder
 * Complete theme management system with 13 professional themes
 * ============================================================================
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'true-classic',
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
  {
    id: 'true-classic',
    name: 'True Classic',
    class: '',
    icon: '📄',
    description: 'Clean, professional light theme',
    category: 'light',
    primary: 'hsl(0 0% 12%)',
    secondary: 'hsl(0 0% 40%)',
  },
  {
    id: 'monochrome',
    name: 'Sin City',
    class: 'theme-monochrome',
    icon: '◼️',
    description: 'Pure black & white high contrast',
    category: 'dark',
    primary: 'hsl(0 0% 98%)',
    secondary: 'hsl(0 0% 85%)',
  },
  {
    id: 'classical',
    name: 'Classical',
    class: 'theme-classical',
    icon: '🏛️',
    description: 'Formal, elegant blue & gold',
    category: 'dark',
    primary: 'hsl(220 60% 55%)',
    secondary: 'hsl(45 40% 60%)',
  },
  {
    id: 'cyber',
    name: 'FARD',
    class: 'theme-cyber',
    icon: '⚡',
    description: 'Hacker aesthetic with neon green',
    category: 'dark',
    primary: 'hsl(135 100% 50%)',
    secondary: 'hsl(180 100% 50%)',
  },
  {
    id: 'red-alert',
    name: 'Matrix',
    class: 'theme-red-alert',
    icon: '🔴',
    description: 'Pure black with intense red',
    category: 'dark',
    primary: 'hsl(0 100% 50%)',
    secondary: 'hsl(0 80% 40%)',
  },
  {
    id: 'purple',
    name: 'Fifth Element',
    class: 'theme-purple',
    icon: '🟣',
    description: 'Vibrant purple sci-fi theme',
    category: 'colorful',
    primary: 'hsl(270 100% 60%)',
    secondary: 'hsl(290 100% 50%)',
  },
  {
    id: 'ocean',
    name: 'Abyss',
    class: 'theme-ocean',
    icon: '🌊',
    description: 'Deep ocean blue professional',
    category: 'colorful',
    primary: 'hsl(200 100% 50%)',
    secondary: 'hsl(190 100% 45%)',
  },
  {
    id: 'sunset',
    name: 'Dune',
    class: 'theme-sunset',
    icon: '🌅',
    description: 'Warm orange desert vibes',
    category: 'colorful',
    primary: 'hsl(30 100% 55%)',
    secondary: 'hsl(10 100% 50%)',
  },
  {
    id: 'pink',
    name: 'Ex Machina',
    class: 'theme-pink',
    icon: '💖',
    description: 'Electric hot pink',
    category: 'colorful',
    primary: 'hsl(320 100% 60%)',
    secondary: 'hsl(340 100% 55%)',
  },
  {
    id: 'lime',
    name: 'Alien',
    class: 'theme-lime',
    icon: '🟢',
    description: 'Bright lime acid green',
    category: 'colorful',
    primary: 'hsl(75 100% 55%)',
    secondary: 'hsl(85 100% 50%)',
  },
  {
    id: 'ice',
    name: 'Interstellar',
    class: 'theme-ice',
    icon: '❄️',
    description: 'Cool ice blue modern',
    category: 'colorful',
    primary: 'hsl(185 100% 55%)',
    secondary: 'hsl(195 100% 50%)',
  },
  {
    id: 'gold',
    name: 'Star Wars',
    class: 'theme-gold',
    icon: '⭐',
    description: 'Luxurious rich gold',
    category: 'colorful',
    primary: 'hsl(50 100% 55%)',
    secondary: 'hsl(40 100% 50%)',
  },
  {
    id: 'blade-runner',
    name: 'Blade Runner 2049',
    class: 'theme-blade-runner',
    icon: '🌆',
    description: 'Cyberpunk amber & pink',
    category: 'colorful',
    primary: 'hsl(35 100% 60%)',
    secondary: 'hsl(320 100% 65%)',
  },
];

// Helper function to apply theme
export const applyTheme = (themeId) => {
  const theme = themes.find(t => t.id === themeId);
  
  // Remove all theme classes
  themes.forEach(t => {
    if (t.class) {
      document.documentElement.classList.remove(t.class);
      document.documentElement.removeAttribute('data-theme');
    }
  });
  
  // Add current theme class
  if (theme?.class) {
    document.documentElement.classList.add(theme.class);
    document.documentElement.setAttribute('data-theme', themeId);
  }
};