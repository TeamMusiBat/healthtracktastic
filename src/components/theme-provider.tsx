
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
    
    // Set clean white background with blue accent colors
    root.style.setProperty('--background', 'hsl(0, 0%, 100%)');
    root.style.setProperty('--card', 'hsl(0, 0%, 100%)');
    root.style.setProperty('--border', 'hsl(210, 20%, 90%)');
    root.style.setProperty('--foreground', 'hsl(210, 20%, 25%)'); 
    
    // Ensure high contrast for text
    root.style.setProperty('--muted', 'hsl(210, 10%, 96%)');
    root.style.setProperty('--muted-foreground', 'hsl(215, 16%, 47%)');
    
    // Make sure all form inputs are readable with proper borders
    root.style.setProperty('--input', 'hsl(0, 0%, 100%)');
    root.style.setProperty('--input-background', 'hsl(0, 0%, 100%)');
    root.style.setProperty('--input-text', 'hsl(210, 20%, 25%)');
    
    // Ensure that buttons and interactive elements have good contrast
    root.style.setProperty('--primary', 'hsl(196, 67%, 45%)'); // Deeper blue for better contrast
    root.style.setProperty('--primary-foreground', 'hsl(0, 0%, 100%)');
    
    // Set the same background and foreground colors for dialogs too
    root.style.setProperty('--popover', 'hsl(0, 0%, 100%)');
    root.style.setProperty('--popover-foreground', 'hsl(210, 20%, 25%)');
    
    // Make secondary colors consistent
    root.style.setProperty('--secondary', 'hsl(210, 40%, 96.1%)');
    root.style.setProperty('--secondary-foreground', 'hsl(210, 20%, 25%)');
    
    // Ensure accent colors are consistent
    root.style.setProperty('--accent', 'hsl(210, 40%, 96.1%)');
    root.style.setProperty('--accent-foreground', 'hsl(210, 20%, 25%)');
    
    // Set sidebar colors explicitly for better contrast
    root.style.setProperty('--sidebar-background', 'hsl(0, 0%, 100%)');
    root.style.setProperty('--sidebar-foreground', 'hsl(210, 20%, 25%)');
    root.style.setProperty('--sidebar-border', 'hsl(210, 20%, 90%)');
    
    // Enhanced 3D button effects
    root.style.setProperty('--button-shadow', '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)');
    root.style.setProperty('--button-hover-shadow', '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)');
    
    // Apply these colors to all components
    document.querySelectorAll('input, button, select, textarea, dialog, [data-radix-popper-content-wrapper]').forEach(el => {
      el.classList.add('color-override');
    });
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
