import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';

  try {
    const stored = localStorage.getItem('localbox-theme') as Theme | null;
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // localStorage may be unavailable
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;

  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.classList.toggle('light', theme === 'light');

  try {
    localStorage.setItem('localbox-theme', theme);
  } catch {
    // localStorage may be unavailable
  }
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'light', // Default, will be hydrated on client
  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      applyTheme(newTheme);
      return { theme: newTheme };
    });
  },
  setTheme: (theme: Theme) => {
    set({ theme });
    applyTheme(theme);
  },
}));

// Hydrate theme on client-side
if (typeof window !== 'undefined') {
  // Run immediately to avoid flash
  const theme = getInitialTheme();
  useThemeStore.setState({ theme });
  applyTheme(theme);

  // Listen for OS theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const stored = localStorage.getItem('localbox-theme');
    if (!stored) {
      const newTheme = e.matches ? 'dark' : 'light';
      useThemeStore.getState().setTheme(newTheme);
    }
  });
}
