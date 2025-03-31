
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

// Define the user roles
export type UserRole = "developer" | "master" | "fmt" | "socialMobilizer";

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  email?: string;
  phoneNumber?: string;
  isOnline?: boolean;
  lastActive?: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  updateLocation: (latitude: number, longitude: number) => void;
}

// Initial hardcoded developer user
const DEVELOPER_USER: User = {
  id: "1",
  username: "asifjamali83",
  name: "Asif Jamali",
  role: "developer",
  isOnline: true,
};

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  logout: () => {},
  isAuthenticated: false,
  updateLocation: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  
  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("track4health_user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        // Set up periodic online status
        const interval = setInterval(() => {
          updateOnlineStatus();
        }, 60000); // Update every minute
        
        return () => clearInterval(interval);
      } catch (e) {
        console.error("Failed to parse stored user:", e);
        localStorage.removeItem("track4health_user");
      }
    }
  }, []);
  
  // Update online status
  const updateOnlineStatus = () => {
    if (user) {
      setUser({
        ...user,
        isOnline: true,
        lastActive: new Date(),
      });
      
      // Store updated user in local storage
      localStorage.setItem("track4health_user", JSON.stringify({
        ...user,
        isOnline: true,
        lastActive: new Date(),
      }));
    }
  };
  
  // Login function
  const login = async (username: string, password: string): Promise<boolean> => {
    // In a real app, this would be an API call, but for this demonstration:
    if (username === "asifjamali83" && password === "Atifkhan83##") {
      setUser(DEVELOPER_USER);
      localStorage.setItem("track4health_user", JSON.stringify(DEVELOPER_USER));
      return true;
    }
    
    // Mock master login for demo purposes
    if (username === "master" && password === "master") {
      const masterUser: User = {
        id: "2",
        username: "master",
        name: "Master User",
        role: "master",
        isOnline: true,
        lastActive: new Date(),
      };
      setUser(masterUser);
      localStorage.setItem("track4health_user", JSON.stringify(masterUser));
      return true;
    }
    
    // Mock FMT user login
    if (username === "fmt" && password === "fmt") {
      const fmtUser: User = {
        id: "3",
        username: "fmt",
        name: "FMT User",
        role: "fmt",
        isOnline: true,
        lastActive: new Date(),
      };
      setUser(fmtUser);
      localStorage.setItem("track4health_user", JSON.stringify(fmtUser));
      return true;
    }
    
    // Mock social mobilizer login
    if (username === "social" && password === "social") {
      const socialUser: User = {
        id: "4",
        username: "social",
        name: "Social Mobilizer",
        role: "socialMobilizer",
        isOnline: true,
        lastActive: new Date(),
      };
      setUser(socialUser);
      localStorage.setItem("track4health_user", JSON.stringify(socialUser));
      return true;
    }
    
    return false;
  };
  
  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("track4health_user");
    toast.success("Logged out successfully");
  };
  
  // Update location
  const updateLocation = (latitude: number, longitude: number) => {
    if (user) {
      setUser({
        ...user,
        location: { latitude, longitude },
      });
      
      // Store updated user with location
      localStorage.setItem("track4health_user", JSON.stringify({
        ...user,
        location: { latitude, longitude },
      }));
    }
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        updateLocation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
