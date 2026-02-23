/**
 * ============================================================================
 * THEME STORE - Portfolio Builder
 * ============================================================================
 * Tier system:
 *   free     → Light + Dark (always available, both selectable simultaneously)
 *   pro      → Profession-specific signature theme (costs 1 extra credit)
 *   premium  → All other color themes (costs 1 credit, locked for free users)
 * ============================================================================
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'light',
      isTransitioning: false,
      setTheme: (theme) => set({ theme }),
      setIsTransitioning: (value) => set({ isTransitioning: value }),
    }),
    { name: 'portfolio-builder-theme' }
  )
);

// ─── FREE THEMES (always available) ──────────────────────────────────────────
export const freeThemes = [
  {
    id: 'light',
    name: 'Light Mode',
    icon: '☀️',
    description: 'Clean, professional light theme',
    tier: 'free',
    colors: { primary: '#f8fafc', secondary: '#e2e8f0' },
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    icon: '🌙',
    description: 'Sleek, modern dark theme',
    tier: 'free',
    colors: { primary: '#1f2937', secondary: '#111827' },
  },
];

// ─── PROFESSION-SPECIFIC PRO THEMES (1 extra credit) ─────────────────────────
// Each profession slug maps to a unique signature theme
export const proThemesByProfession = {
  // Technology
  'software-engineer': {
    id: 'pro-dev-terminal',
    name: 'Dev Terminal',
    icon: '💻',
    description: 'Hacker-green on deep black — built for coders',
    tier: 'pro',
    colors: { primary: '#00ff41', secondary: '#003b00' },
    gradient: 'linear-gradient(135deg, #0d0d0d 0%, #003b00 50%, #001a00 100%)',
  },
  'web-developer': {
    id: 'pro-dev-terminal',
    name: 'Dev Terminal',
    icon: '💻',
    description: 'Hacker-green on deep black — built for coders',
    tier: 'pro',
    colors: { primary: '#00ff41', secondary: '#003b00' },
    gradient: 'linear-gradient(135deg, #0d0d0d 0%, #003b00 50%, #001a00 100%)',
  },
  'designer': {
    id: 'pro-designer-canvas',
    name: 'Designer Canvas',
    icon: '🎨',
    description: 'Warm cream & ink — a gallery for your work',
    tier: 'pro',
    colors: { primary: '#f5f0e8', secondary: '#c9a96e' },
    gradient: 'linear-gradient(135deg, #f5f0e8 0%, #e8d5b7 50%, #c9a96e 100%)',
  },
  'ui-ux-designer': {
    id: 'pro-designer-canvas',
    name: 'Designer Canvas',
    icon: '🎨',
    description: 'Warm cream & ink — a gallery for your work',
    tier: 'pro',
    colors: { primary: '#f5f0e8', secondary: '#c9a96e' },
    gradient: 'linear-gradient(135deg, #f5f0e8 0%, #e8d5b7 50%, #c9a96e 100%)',
  },
  'doctor': {
    id: 'pro-medical-trust',
    name: 'Medical Trust',
    icon: '🏥',
    description: 'Clinical white & healing blue — trusted by patients',
    tier: 'pro',
    colors: { primary: '#0077b6', secondary: '#00b4d8' },
    gradient: 'linear-gradient(135deg, #f0f9ff 0%, #0077b6 60%, #023e8a 100%)',
  },
  'teacher': {
    id: 'pro-educator-warm',
    name: 'Educator Warm',
    icon: '📚',
    description: 'Warm amber & chalkboard green — inspiring and approachable',
    tier: 'pro',
    colors: { primary: '#2d6a4f', secondary: '#f4a261' },
    gradient: 'linear-gradient(135deg, #fefae0 0%, #f4a261 40%, #2d6a4f 100%)',
  },
  'photographer': {
    id: 'pro-photo-dark-room',
    name: 'Dark Room',
    icon: '📷',
    description: 'Deep black & silver — your work takes centre stage',
    tier: 'pro',
    colors: { primary: '#c9d6df', secondary: '#52616b' },
    gradient: 'linear-gradient(135deg, #0f0f0f 0%, #1c1c1c 50%, #52616b 100%)',
  },
  'lawyer': {
    id: 'pro-legal-prestige',
    name: 'Legal Prestige',
    icon: '⚖️',
    description: 'Deep navy & gold — authority and trust',
    tier: 'pro',
    colors: { primary: '#1a1a2e', secondary: '#c9a84c' },
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #c9a84c 100%)',
  },
  'accountant': {
    id: 'pro-finance-slate',
    name: 'Finance Slate',
    icon: '📊',
    description: 'Steel blue & white — precise and professional',
    tier: 'pro',
    colors: { primary: '#334155', secondary: '#64748b' },
    gradient: 'linear-gradient(135deg, #f1f5f9 0%, #334155 60%, #1e293b 100%)',
  },
  // Default fallback for any profession not explicitly listed
  'default': {
    id: 'pro-signature',
    name: 'Signature',
    icon: '⚡',
    description: 'A premium theme exclusive to your profession',
    tier: 'pro',
    colors: { primary: '#7c3aed', secondary: '#a78bfa' },
    gradient: 'linear-gradient(135deg, #1e1b4b 0%, #7c3aed 50%, #a78bfa 100%)',
  },
};

// ─── PREMIUM COLOR THEMES (need credits) ─────────────────────────────────────
export const premiumThemes = [
  {
    id: 'professional-blue',
    name: 'Professional Blue',
    icon: '💼',
    tier: 'premium',
    colors: { primary: '#2563eb', secondary: '#3b82f6' },
  },
  {
    id: 'minimal-gray',
    name: 'Minimal Gray',
    icon: '⚪',
    tier: 'premium',
    colors: { primary: '#4b5563', secondary: '#6b7280' },
  },
  {
    id: 'fresh-green',
    name: 'Fresh Green',
    icon: '🌿',
    tier: 'premium',
    colors: { primary: '#059669', secondary: '#10b981' },
  },
  {
    id: 'dark-elegance',
    name: 'Dark Elegance',
    icon: '✨',
    tier: 'premium',
    colors: { primary: '#6366f1', secondary: '#818cf8' },
  },
  {
    id: 'midnight-slate',
    name: 'Midnight Slate',
    icon: '🌌',
    tier: 'premium',
    colors: { primary: '#0ea5e9', secondary: '#38bdf8' },
  },
  {
    id: 'carbon-gold',
    name: 'Carbon Gold',
    icon: '⭐',
    tier: 'premium',
    colors: { primary: '#f59e0b', secondary: '#fbbf24' },
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    icon: '🌊',
    tier: 'premium',
    colors: { primary: '#06b6d4', secondary: '#22d3ee' },
  },
  {
    id: 'sunset-glow',
    name: 'Sunset Glow',
    icon: '🌅',
    tier: 'premium',
    colors: { primary: '#f97316', secondary: '#fb923c' },
  },
  {
    id: 'purple-reign',
    name: 'Purple Reign',
    icon: '💜',
    tier: 'premium',
    colors: { primary: '#a855f7', secondary: '#c084fc' },
  },
  {
    id: 'rose-pink',
    name: 'Rose Pink',
    icon: '🌸',
    tier: 'premium',
    colors: { primary: '#ec4899', secondary: '#f472b6' },
  },
  {
    id: 'crimson-red',
    name: 'Crimson Red',
    icon: '🔴',
    tier: 'premium',
    colors: { primary: '#dc2626', secondary: '#ef4444' },
  },
  {
    id: 'lime-fresh',
    name: 'Lime Fresh',
    icon: '🍋',
    tier: 'premium',
    colors: { primary: '#84cc16', secondary: '#a3e635' },
  },
  {
    id: 'teal-mint',
    name: 'Teal Mint',
    icon: '🫧',
    tier: 'premium',
    colors: { primary: '#14b8a6', secondary: '#2dd4bf' },
  },
];

// Flat list for backward compat (used in PortfolioBuilder theme_id mapping etc.)
export const themes = [...freeThemes, ...premiumThemes];

// ─── Helper: get the pro theme for a given profession slug ────────────────────
export const getProThemeForProfession = (professionSlug) => {
  return proThemesByProfession[professionSlug] || proThemesByProfession['default'];
};

// ─── Theme ID → DB numeric ID mapper (unchanged) ─────────────────────────────
export const themeIdMap = {
  'light': 1, 'dark': 2, 'professional-blue': 3, 'minimal-gray': 4,
  'fresh-green': 5, 'dark-elegance': 6, 'midnight-slate': 7, 'carbon-gold': 8,
  'ocean-breeze': 9, 'sunset-glow': 10, 'purple-reign': 11, 'rose-pink': 12,
  'crimson-red': 13, 'lime-fresh': 14, 'teal-mint': 15,
  // Pro themes map to high IDs (add these to your DB themes table too)
  'pro-dev-terminal': 101, 'pro-designer-canvas': 102, 'pro-medical-trust': 103,
  'pro-educator-warm': 104, 'pro-photo-dark-room': 105, 'pro-legal-prestige': 106,
  'pro-finance-slate': 107, 'pro-signature': 108,
};