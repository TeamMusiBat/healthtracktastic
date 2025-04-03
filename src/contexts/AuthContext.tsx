
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";
import ApiService from "@/services/ApiService";

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
  designation?: string;
  district?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  updateLocation: (latitude: number, longitude: number) => void;
  canLogout: boolean;
  canAddUsers: boolean;
  canEditUsers: boolean;
  canAddMasters: boolean;
  canAddDevelopers: boolean;
  canEditData: boolean;
  allowedRoutes: string[];
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  logout: () => {},
  isAuthenticated: false,
  updateLocation: () => {},
  canLogout: false,
  canAddUsers: false,
  canEditUsers: false,
  canAddMasters: false,
  canAddDevelopers: false,
  canEditData: false,
  allowedRoutes: [],
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("track4health_user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        ApiService.setUser(parsedUser);
        
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
  
  // Check if current route is allowed for user role
  useEffect(() => {
    if (user) {
      const allowedRoutes = getAllowedRoutes(user.role);
      const currentPath = location.pathname;
      
      // If user is on a route they don't have access to, redirect to dashboard or home
      if (!allowedRoutes.some(route => currentPath.startsWith(route)) && 
          !currentPath.startsWith('/login')) {
        toast.error("You don't have permission to access this page");
        navigate(user.role === "developer" || user.role === "master" ? '/dashboard' : '/');
      }
    }
  }, [location.pathname, user, navigate]);
  
  // Define allowed routes based on user role
  const getAllowedRoutes = (role: UserRole): string[] => {
    switch (role) {
      case "developer":
        return ['/dashboard', '/users', '/blogs', '/child-screening', '/awareness-sessions', '/'];
      case "master":
        return ['/dashboard', '/users', '/blogs', '/child-screening', '/awareness-sessions', '/'];
      case "fmt":
      case "socialMobilizer":
        return ['/', '/dashboard', '/blogs', '/child-screening', '/awareness-sessions'];
      default:
        return ['/'];
    }
  };
  
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
    try {
      // Use API service for login
      const loggedInUser = await ApiService.login(username, password);
      
      if (loggedInUser) {
        setUser(loggedInUser);
        ApiService.setUser(loggedInUser);
        localStorage.setItem("track4health_user", JSON.stringify(loggedInUser));
        return true;
      }
      
      toast.error("Invalid username or password");
      return false;
    } catch (error) {
      console.error("Login error:", error);
      
      // Handle offline login with fallback
      if (!navigator.onLine) {
        // Check stored credentials
        const storedUser = localStorage.getItem("track4health_user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          
          // IMPORTANT: This is a very insecure way to handle offline login
          // In a real app, you would use a more secure approach
          if (parsedUser.username === username) {
            // If username matches stored user, allow offline login
            toast.warning("Working in offline mode. Limited functionality available.");
            setUser(parsedUser);
            ApiService.setUser(parsedUser);
            return true;
          }
        }
      }
      
      toast.error("Login failed. Please check your connection and try again.");
      return false;
    }
  };
  
  // Logout function
  const logout = () => {
    // Only allow master and developer to logout
    if (user && (user.role === "master" || user.role === "developer")) {
      setUser(null);
      ApiService.setUser(null);
      localStorage.removeItem("track4health_user");
      toast.success("Logged out successfully");
      navigate('/login');
    } else {
      toast.error("You don't have permission to logout");
    }
  };
  
  // Permission flags based on role
  const canLogout = user?.role === "master" || user?.role === "developer";
  const canAddUsers = user?.role === "master" || user?.role === "developer";
  const canEditUsers = user?.role === "master" || user?.role === "developer";
  const canAddMasters = user?.role === "developer";
  const canAddDevelopers = false; // No one can add developers
  const canEditData = user?.role === "master" || user?.role === "developer";
  const allowedRoutes = user ? getAllowedRoutes(user.role) : [];
  
  // Update location
  const updateLocation = (latitude: number, longitude: number) => {
    if (user) {
      const updatedUser = {
        ...user,
        location: { latitude, longitude },
      };
      
      setUser(updatedUser);
      
      // Store updated user with location
      localStorage.setItem("track4health_user", JSON.stringify(updatedUser));
      
      // Update location on server if online
      if (navigator.onLine && user.id) {
        ApiService.updateLocation(user.id, latitude, longitude)
          .catch(error => {
            console.error("Failed to update location on server:", error);
          });
      }
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
        canLogout,
        canAddUsers,
        canEditUsers,
        canAddMasters,
        canAddDevelopers,
        canEditData,
        allowedRoutes,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
