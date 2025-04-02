
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Home, 
  Users, 
  FileText, 
  User, 
  LogOut,
  LayoutDashboard,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  useSidebar
} from "@/components/ui/sidebar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const isMobile = useIsMobile();
  const location = useLocation();
  const [isHovering, setIsHovering] = useState(false);
  
  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: "/", label: "Home", icon: Home, requiresAuth: false },
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard, requiresAuth: true },
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

  // Only allow master and developer to logout
  const canLogout = user?.role === "master" || user?.role === "developer";

  // Get current route label for header
  const currentPageLabel = filteredNavItems.find(item => isActiveRoute(item.path))?.label || "Track4Health";

  // Custom toggle handler for the sidebar
  const handleToggleSidebar = () => {
    if (!isMobile) {
      const sidebarContext = useSidebar();
      sidebarContext.toggleSidebar();
    }
  };

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex min-h-screen w-full bg-background">
        {/* Dynamic Sidebar */}
        <Sidebar 
          variant={isMobile ? "floating" : "sidebar"} 
          collapsible={isMobile ? "offcanvas" : "icon"}
          className={`transition-all duration-300 ${isHovering && !isMobile ? 'w-64' : ''}`}
          onMouseEnter={() => !isMobile && setIsHovering(true)}
          onMouseLeave={() => !isMobile && setIsHovering(false)}
        >
          <SidebarHeader className="flex items-center justify-between p-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex items-center">
                <span className="text-xl font-bold">T4H</span>
                {(isHovering || !isMobile) && (
                  <span className="ml-2 text-xl font-bold transition-opacity duration-200">Track4Health</span>
                )}
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <ModeToggle />
              {!isMobile && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={handleToggleSidebar}
                >
                  {isHovering ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              )}
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filteredNavItems.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={isActiveRoute(item.path)}
                        tooltip={item.label}
                      >
                        <Link to={item.path} className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          
          {isAuthenticated && canLogout && (
            <SidebarFooter className="p-4 border-t">
              <div className="flex flex-col gap-4">
                <div className="flex items-center space-x-2 p-3 bg-secondary/20 rounded-md">
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
                  {(isHovering || !isMobile) && "Logout"}
                </Button>
              </div>
            </SidebarFooter>
          )}
        </Sidebar>
        
        {/* Main Content Area */}
        <SidebarInset className="p-0">
          <div className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
            {isMobile && <SidebarTrigger />}
            <div className="flex-1">
              <h1 className="text-xl font-semibold">
                {currentPageLabel}
              </h1>
            </div>
          </div>
          <div className="flex-1 p-6 md:p-8">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
