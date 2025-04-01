
import * as React from "react";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

// Generate random colors for themes with better contrast
const generateRandomColor = (isDark: boolean) => {
  if (isDark) {
    // For dark themes, generate darker colors with better contrast
    const r = Math.floor(Math.random() * 40); // Lower values for darker colors
    const g = Math.floor(Math.random() * 40);
    const b = Math.floor(Math.random() * 70);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // For light themes, generate lighter colors with better contrast
    const r = Math.floor(Math.random() * 60) + 195; // Higher values for lighter colors
    const g = Math.floor(Math.random() * 60) + 195;
    const b = Math.floor(Math.random() * 60) + 195;
    return `rgb(${r}, ${g}, ${b})`;
  }
};

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "track4health-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );
  
  // We'll use a reference to track path changes manually instead of useLocation
  const [randomSeed, setRandomSeed] = useState<number>(Math.random());
  
  // Generate a new random seed when the component mounts
  useEffect(() => {
    setRandomSeed(Math.random());
  }, []);
  
  // Add an event listener to detect navigation events
  useEffect(() => {
    // This will trigger when the URL changes
    const handleNavigation = () => {
      setRandomSeed(Math.random());
    };

    window.addEventListener('popstate', handleNavigation);
    
    // Also trigger on history.pushState and history.replaceState
    const originalPushState = history.pushState.bind(history);
    const originalReplaceState = history.replaceState.bind(history);
    
    history.pushState = (...args) => {
      originalPushState(...args);
      handleNavigation();
    };
    
    history.replaceState = (...args) => {
      originalReplaceState(...args);
      handleNavigation();
    };
    
    return () => {
      window.removeEventListener('popstate', handleNavigation);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);
  
  // Apply theme and random color when theme changes or randomSeed changes
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    let actualTheme = theme;
    if (theme === "system") {
      actualTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    
    root.classList.add(actualTheme);
    
    // Generate and apply random background color
    const backgroundColor = generateRandomColor(actualTheme === "dark");
    root.style.setProperty('--random-background', backgroundColor);
    
    // Update CSS variables based on theme with high contrast text
    if (actualTheme === "dark") {
      root.style.setProperty('--background', `${backgroundColor}`);
      root.style.setProperty('--foreground', 'rgb(245, 245, 245)'); // Very light text for dark mode
    } else {
      root.style.setProperty('--background', `${backgroundColor}`);
      root.style.setProperty('--foreground', 'rgb(15, 15, 15)'); // Very dark text for light mode
    }
    
  }, [theme, randomSeed]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
      // Generate new random color when theme changes
      setRandomSeed(Math.random());
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
