
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Sun, 
  Moon, 
  LogOut, 
  Menu, 
  X, 
  Home, 
  Users, 
  FileText, 
  Stethoscope,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/WhatsAppButton";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };
  
  // Close mobile menu when navigating to a new page
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);
  
  // Apply dark mode on component mount if it was previously set
  useEffect(() => {
    const isDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    }
  }, []);
  
  // Save dark mode preference when it changes
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-health-primary">
                Track4Health
              </h1>
            </Link>
            <span className="hidden md:inline-block ml-3 text-gray-500 dark:text-gray-400">
              Monitor. Improve. Thrive.
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Dark mode toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
            
            {/* Display logout if authenticated */}
            {isAuthenticated && (
              <div className="hidden md:flex items-center gap-4">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {user?.name} ({user?.role})
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={logout}
                  aria-label="Logout"
                >
                  <LogOut size={20} />
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 shadow-md">
          <nav className="container mx-auto px-4 py-4">
            <ul className="space-y-4">
              <li>
                <Link
                  to="/"
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-health-primary dark:hover:text-health-primary"
                >
                  <Home size={18} />
                  <span>Home</span>
                </Link>
              </li>
              {isAuthenticated && (
                <>
                  {(user?.role === "developer" || user?.role === "master") && (
                    <li>
                      <Link
                        to="/users"
                        className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-health-primary dark:hover:text-health-primary"
                      >
                        <Users size={18} />
                        <span>Users</span>
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link
                      to="/awareness-sessions"
                      className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-health-primary dark:hover:text-health-primary"
                    >
                      <MessageSquare size={18} />
                      <span>Awareness Sessions</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/child-screening"
                      className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-health-primary dark:hover:text-health-primary"
                    >
                      <Stethoscope size={18} />
                      <span>Child Screening</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/blogs"
                      className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-health-primary dark:hover:text-health-primary"
                    >
                      <FileText size={18} />
                      <span>Blogs</span>
                    </Link>
                  </li>
                </>
              )}
              <li>
                <div 
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-200"
                >
                  <WhatsAppButton phoneNumber="+923032939576" />
                </div>
              </li>
              {isAuthenticated && (
                <li>
                  <Button 
                    variant="destructive" 
                    onClick={logout} 
                    className="w-full"
                  >
                    <LogOut size={18} className="mr-2" />
                    Logout
                  </Button>
                </li>
              )}
            </ul>
          </nav>
        </div>
      )}
      
      {/* Desktop sidebar for authenticated users */}
      {isAuthenticated && (
        <div className="flex flex-1">
          <aside className="hidden md:block w-64 bg-gray-50 dark:bg-gray-800 p-4 shadow-md">
            <nav>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/"
                    className={`flex items-center gap-2 p-2 rounded-md transition ${
                      location.pathname === "/" ? "bg-health-primary text-white" : "text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Home size={18} />
                    <span>Home</span>
                  </Link>
                </li>
                {(user?.role === "developer" || user?.role === "master") && (
                  <li>
                    <Link
                      to="/users"
                      className={`flex items-center gap-2 p-2 rounded-md transition ${
                        location.pathname === "/users" ? "bg-health-primary text-white" : "text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      <Users size={18} />
                      <span>Users</span>
                    </Link>
                  </li>
                )}
                <li>
                  <Link
                    to="/awareness-sessions"
                    className={`flex items-center gap-2 p-2 rounded-md transition ${
                      location.pathname === "/awareness-sessions" ? "bg-health-primary text-white" : "text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    <MessageSquare size={18} />
                    <span>Awareness Sessions</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/child-screening"
                    className={`flex items-center gap-2 p-2 rounded-md transition ${
                      location.pathname === "/child-screening" ? "bg-health-primary text-white" : "text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Stethoscope size={18} />
                    <span>Child Screening</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/blogs"
                    className={`flex items-center gap-2 p-2 rounded-md transition ${
                      location.pathname === "/blogs" ? "bg-health-primary text-white" : "text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    <FileText size={18} />
                    <span>Blogs</span>
                  </Link>
                </li>
              </ul>
            </nav>
          </aside>
          
          {/* Main content */}
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {children}
          </main>
        </div>
      )}
      
      {/* Full width content for non-authenticated users */}
      {!isAuthenticated && (
        <main className="flex-1">
          {children}
        </main>
      )}
    </div>
  );
};

export default Layout;
