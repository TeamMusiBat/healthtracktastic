
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
  
  // Apply consistent theme colors with 3D effects
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    // Always use light mode with enhanced colors
    root.classList.add("light");
    
    // Set professional color scheme
    root.style.setProperty('--background', 'hsl(0, 0%, 100%)');
    root.style.setProperty('--card', 'hsl(0, 0%, 100%)');
    root.style.setProperty('--border', 'hsl(220, 13%, 91%)');
    root.style.setProperty('--foreground', 'hsl(224, 71%, 4%)'); 
    
    // Ensure high contrast for text
    root.style.setProperty('--muted', 'hsl(220, 14%, 96%)');
    root.style.setProperty('--muted-foreground', 'hsl(220, 9%, 46%)');
    
    // Make sure all form inputs are readable with proper borders
    root.style.setProperty('--input', 'hsl(0, 0%, 100%)');
    root.style.setProperty('--input-background', 'hsl(0, 0%, 100%)');
    root.style.setProperty('--input-text', 'hsl(224, 71%, 4%)');
    
    // Enhanced button colors with 3D effects
    root.style.setProperty('--primary', 'hsl(196, 80%, 40%)');
    root.style.setProperty('--primary-foreground', 'hsl(0, 0%, 100%)');
    
    // Set the same background and foreground colors for dialogs too
    root.style.setProperty('--popover', 'hsl(0, 0%, 100%)');
    root.style.setProperty('--popover-foreground', 'hsl(224, 71%, 4%)');
    
    // Make secondary colors consistent
    root.style.setProperty('--secondary', 'hsl(220, 14%, 96%)');
    root.style.setProperty('--secondary-foreground', 'hsl(224, 71%, 4%)');
    
    // Ensure accent colors are consistent
    root.style.setProperty('--accent', 'hsl(220, 14%, 96%)');
    root.style.setProperty('--accent-foreground', 'hsl(224, 71%, 4%)');
    
    // Set sidebar colors explicitly for better contrast
    root.style.setProperty('--sidebar-background', 'hsl(0, 0%, 100%)');
    root.style.setProperty('--sidebar-foreground', 'hsl(224, 71%, 4%)');
    root.style.setProperty('--sidebar-border', 'hsl(220, 13%, 91%)');
    
    // 3D button effects - enhanced
    root.style.setProperty('--button-shadow', '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)');
    root.style.setProperty('--button-hover-shadow', '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)');
    
    // Add custom 3D button styles to stylesheet
    const style = document.createElement('style');
    style.textContent = `
      .button-3d, [data-variant="3d"], [variant="3d"] {
        transform: translateY(0);
        box-shadow: 0 4px 0 0 rgba(0, 0, 0, 0.2);
        transition: all 0.2s ease;
      }
      .button-3d:hover, [data-variant="3d"]:hover, [variant="3d"]:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 0 0 rgba(0, 0, 0, 0.2);
      }
      .button-3d:active, [data-variant="3d"]:active, [variant="3d"]:active {
        transform: translateY(2px);
        box-shadow: 0 2px 0 0 rgba(0, 0, 0, 0.2);
      }
      
      /* Fix Add User button visibility */
      .text-primary-foreground {
        color: white !important;
      }
      
      /* Ensure button text is visible */
      button {
        color: inherit;
      }
      
      button[variant="default"], 
      button[data-variant="default"] {
        color: white;
      }
    `;
    document.head.appendChild(style);
    
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
