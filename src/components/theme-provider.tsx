
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
    const h = Math.floor(Math.random() * 360); // Hue (any color)
    const s = Math.floor(Math.random() * 30) + 20; // Saturation (not too gray, not too vivid)
    const l = Math.floor(Math.random() * 15) + 5; // Lightness (dark but not too dark)
    return `${h} ${s}% ${l}%`;
  } else {
    // For light themes, generate lighter colors with better contrast
    const h = Math.floor(Math.random() * 360); // Hue (any color)
    const s = Math.floor(Math.random() * 20) + 5; // Lower saturation for light mode
    const l = Math.floor(Math.random() * 10) + 90; // Very light for better contrast
    return `${h} ${s}% ${l}%`;
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
  
  // Generate a new random seed when the component mounts and on route changes
  useEffect(() => {
    setRandomSeed(Math.random());
    
    // Add an event listener to detect navigation events
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
    
    // Ensure high contrast for text based on theme
    if (actualTheme === "dark") {
      root.style.setProperty('--foreground', 'hsl(0, 0%, 95%)'); // Very light text for dark mode
      root.style.setProperty('--border', 'hsl(240, 3.7%, 25%)'); // Darker border for dark mode
    } else {
      root.style.setProperty('--foreground', 'hsl(210, 20%, 10%)'); // Very dark text for light mode
      root.style.setProperty('--border', 'hsl(240, 5.9%, 90%)'); // Light border for light mode
      
      // For system (light) theme make it 99% white with clean look
      if (theme === "system") {
        root.style.setProperty('--background', 'hsl(0, 0%, 99%)');
        root.style.setProperty('--card', 'hsl(0, 0%, 100%)');
        root.style.setProperty('--border', 'hsl(0, 0%, 92%)');
      }
    }
    
    // Make sure all form inputs are readable
    root.style.setProperty('--input-text', actualTheme === 'dark' ? '240 5% 95%' : '240 10% 3.9%');
    root.style.setProperty('--input-background', actualTheme === 'dark' ? '240 10% 20%' : '0 0% 100%');
    
    // Ensure that buttons and interactive elements have good contrast
    if (actualTheme === "dark") {
      root.style.setProperty('--primary', '210 100% 52%'); // Bright blue for dark mode
      root.style.setProperty('--primary-foreground', '0 0% 100%'); // White text on primary
    } else {
      root.style.setProperty('--primary', '210 100% 45%'); // Slightly darker blue for light mode
      root.style.setProperty('--primary-foreground', '0 0% 100%'); // White text on primary
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
