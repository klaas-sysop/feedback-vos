import { Theme } from '../types';

export function getThemeClasses(theme: Theme) {
  return {
    // Background colors - light mode is now softer (gray-50 instead of white)
    bgPrimary: theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-50',
    bgSecondary: theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-100',
    bgTertiary: theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-200',
    bgHover: theme === 'dark' ? 'hover:bg-zinc-600' : 'hover:bg-gray-200',
    bgHoverSecondary: theme === 'dark' ? 'hover:bg-zinc-700' : 'hover:bg-gray-200',
    
    // Text colors
    textPrimary: theme === 'dark' ? 'text-zinc-100' : 'text-gray-900',
    textSecondary: theme === 'dark' ? 'text-zinc-300' : 'text-gray-700',
    textTertiary: theme === 'dark' ? 'text-zinc-400' : 'text-gray-600',
    textMuted: theme === 'dark' ? 'text-neutral-400' : 'text-gray-500',
    
    // Border colors
    borderPrimary: theme === 'dark' ? 'border-zinc-700' : 'border-gray-300',
    borderSecondary: theme === 'dark' ? 'border-zinc-600' : 'border-gray-300',
    borderHover: theme === 'dark' ? 'hover:border-zinc-500' : 'hover:border-gray-400',
    
    // Canvas/Editor background
    canvasBg: theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-200',
    
    // Overlay
    overlay: theme === 'dark' ? 'bg-black/80' : 'bg-black/60',
    
    // Focus ring offset
    focusRingOffset: theme === 'dark' ? 'focus:ring-offset-zinc-900' : 'focus:ring-offset-gray-50',
    
    // Button variants
    buttonSecondary: theme === 'dark' 
      ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100' 
      : 'bg-gray-200 hover:bg-gray-300 text-gray-900',
    
    buttonTertiary: theme === 'dark'
      ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-100'
      : 'bg-gray-300 hover:bg-gray-400 text-gray-900',
    
    // Icon colors - make icons more visible (darker for better contrast)
    iconColor: theme === 'dark' ? 'text-zinc-100' : 'text-gray-900',
  };
}

export function getDefaultTheme(): Theme {
  // Check environment variable (works in Next.js client-side)
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_FEEDBACK_THEME === 'light') {
    return 'light';
  }
  return 'dark'; // Default to dark
}
