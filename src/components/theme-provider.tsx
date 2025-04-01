
import * as React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

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

// Generate random colors for themes
const generateRandomColor = (isDark: boolean) => {
  // For dark themes, generate darker colors
  if (isDark) {
    // Dark colors have lower RGB values
    const r = Math.floor(Math.random() * 60);
    const g = Math.floor(Math.random() * 60);
    const b = Math.floor(Math.random() * 100);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // For light themes, generate lighter colors
    const r = Math.floor(Math.random() * 100) + 155;
    const g = Math.floor(Math.random() * 100) + 155;
    const b = Math.floor(Math.random() * 100) + 155;
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
  
  const location = useLocation();
  
  // Apply theme and random color when theme changes or location changes
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
    
    // Update CSS variables based on theme
    if (actualTheme === "dark") {
      root.style.setProperty('--background', `${backgroundColor}`);
      root.style.setProperty('--foreground', 'rgb(245, 245, 245)');
    } else {
      root.style.setProperty('--background', `${backgroundColor}`);
      root.style.setProperty('--foreground', 'rgb(15, 15, 15)');
    }
    
  }, [theme, location]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
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
