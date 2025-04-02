
import * as React from "react";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
};

const initialState: ThemeProviderState = {
  theme: "system",
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "track4health-theme",
  ...props
}: ThemeProviderProps) {
  const [theme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );
  
  // Apply consistent theme colors
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    // Always use light mode with consistent colors
    root.classList.add("light");
    
    // Apply clean white look
    root.style.setProperty('--background', 'hsl(0, 0%, 99%)');
    root.style.setProperty('--card', 'hsl(0, 0%, 100%)');
    root.style.setProperty('--border', 'hsl(0, 0%, 94%)');
    root.style.setProperty('--foreground', 'hsl(210, 20%, 10%)'); // Very dark text for contrast
    root.style.setProperty('--input', 'hsl(0, 0%, 94%)');
    root.style.setProperty('--muted', 'hsl(210, 10%, 96%)');
    root.style.setProperty('--muted-foreground', 'hsl(215, 16%, 55%)');
    
    // Ensure high contrast for text
    root.style.setProperty('--foreground', 'hsl(210, 20%, 10%)'); // Very dark text for light mode
    root.style.setProperty('--border', 'hsl(240, 5.9%, 90%)'); // Light border for light mode
    
    // Make sure all form inputs are readable
    root.style.setProperty('--input-text', '240 10% 3.9%');
    root.style.setProperty('--input-background', '0 0% 100%');
    
    // Ensure that buttons and interactive elements have good contrast
    root.style.setProperty('--primary', '210 100% 45%'); // Slightly darker blue
    root.style.setProperty('--primary-foreground', '0 0% 100%'); // White text on primary
    
  }, []);

  const value = {
    theme,
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
