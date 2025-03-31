
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Menu, Home, Users, FileText, User, LogOut } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ModeToggle } from "@/components/mode-toggle";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const isMobile = useIsMobile();
  const location = useLocation();
  
  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: "/", label: "Dashboard", icon: Home, requiresAuth: true },
    { 
      path: "/users", 
      label: "Users", 
      icon: Users, 
      requiresAuth: true,
      requiresRole: ["developer", "master"]
    },
    { 
      path: "/awareness-sessions", 
      label: "Awareness Sessions", 
      icon: FileText, 
      requiresAuth: true 
    },
    { 
      path: "/child-screening", 
      label: "Child Screening", 
      icon: FileText, 
      requiresAuth: true 
    },
    { path: "/blogs", label: "Blogs", icon: FileText, requiresAuth: false },
  ];
  
  const filteredNavItems = navItems.filter(item => {
    if (!item.requiresAuth) return true;
    if (!isAuthenticated) return false;
    if (item.requiresRole && user) {
      return item.requiresRole.includes(user.role);
    }
    return true;
  });

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Navigation */}
      {isMobile && (
        <Sheet>
          <div className="fixed top-0 left-0 right-0 z-50 h-16 px-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-full items-center justify-between">
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              
              <div className="flex items-center space-x-2">
                <Link to="/" className="text-lg font-semibold">
                  Track4Health
                </Link>
              </div>
              
              <div className="flex items-center space-x-2">
                <ModeToggle />
              </div>
            </div>
          </div>
          
          <SheetContent side="left" className="w-64 pt-16">
            <nav className="flex flex-col space-y-6 pt-4">
              <div className="space-y-1">
                {filteredNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-3 py-2 text-sm rounded-md ${
                      isActiveRoute(item.path)
                        ? "bg-secondary text-secondary-foreground"
                        : "hover:bg-secondary/80 hover:text-secondary-foreground"
                    }`}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
              </div>
              
              <Separator />
              
              {isAuthenticated && (
                <Button 
                  variant="destructive" 
                  onClick={logout} 
                  className="flex items-center justify-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      )}

      {/* Desktop Navigation */}
      <aside className="hidden md:flex md:flex-col md:w-64 border-r bg-background">
        <div className="p-4 flex items-center justify-between">
          <Link to="/" className="font-bold text-lg">
            Track4Health
          </Link>
          <ModeToggle />
        </div>
        <Separator />
        <nav className="flex-grow p-4">
          <div className="space-y-1">
            {filteredNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                  isActiveRoute(item.path)
                    ? "bg-secondary text-secondary-foreground"
                    : "hover:bg-secondary/80 hover:text-secondary-foreground"
                }`}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
        <Separator />
        {isAuthenticated && (
          <div className="p-4">
            <div className="flex items-center space-x-2 mb-4 p-3 bg-secondary/20 rounded-md">
              <User className="h-5 w-5" />
              <div className="truncate">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.role}</p>
              </div>
            </div>
            <Button 
              variant="destructive" 
              onClick={logout} 
              className="w-full flex items-center justify-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto pt-20 md:pt-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;
