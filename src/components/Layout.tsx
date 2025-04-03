
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Home, 
  Users, 
  FileText, 
  User, 
  LogOut,
  LayoutDashboard,
  Database,
  ChevronLeft,
  ChevronRight,
  Menu
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useWindowSize } from "@/hooks/useWindowSize";
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
  const { isDesktop } = useWindowSize();
  const location = useLocation();
  const navigate = useNavigate();
  const [autoCollapse, setAutoCollapse] = useState(false); // Default to open for better UX
  
  // Auto-collapse detection - if user moves mouse away from sidebar
  useEffect(() => {
    if (!isMobile && isDesktop) {
      const handleMouseMovement = (e: MouseEvent) => {
        const sidebar = document.querySelector('[data-sidebar="sidebar"]');
        if (!sidebar) return;
        
        const sidebarRect = sidebar.getBoundingClientRect();
        // If mouse is far away from sidebar, collapse it
        if (e.clientX > sidebarRect.right + 100) {
          setAutoCollapse(true);
        } 
        // If mouse is near the left edge, expand it
        else if (e.clientX < 50) {
          setAutoCollapse(false);
        }
      };
      
      document.addEventListener('mousemove', handleMouseMovement);
      return () => {
        document.removeEventListener('mousemove', handleMouseMovement);
      };
    }
  }, [isMobile, isDesktop]);
  
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
  
  // Add DB Status page only for developers
  if (user?.role === 'developer') {
    navItems.push({ 
      path: "/db-status", 
      label: "DB Status", 
      icon: Database, 
      requiresAuth: true,
      requiresRole: ["developer"]
    });
  }
  
  const filteredNavItems = navItems.filter(item => {
    if (!item.requiresAuth) return true;
    if (!isAuthenticated) return false;
    if (item.requiresRole && user) {
      return item.requiresRole.includes(user.role);
    }
    return true;
  });

  // Only allow master and developer to logout
  const canLogout = user?.role === 'master' || user?.role === 'developer';

  // Get current route label for header
  const currentPageLabel = filteredNavItems.find(item => isActiveRoute(item.path))?.label || "Track4Health";

  return (
    <SidebarProvider defaultOpen={!autoCollapse && isDesktop}>
      <div className="flex min-h-screen w-full bg-background">
        {/* Sidebar with collapsible behavior */}
        <Sidebar 
          variant={isMobile ? "floating" : "sidebar"} 
          collapsible={isMobile ? "offcanvas" : "icon"}
          className="transition-all duration-300 border-r shadow-lg"
        >
          <SidebarHeader className="flex items-center justify-between p-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex items-center">
                <span className="text-xl font-bold text-primary">T4H</span>
                <span className="ml-2 text-xl font-bold transition-opacity duration-200 group-data-[collapsible=icon]:hidden">
                  Track4Health
                </span>
              </div>
            </Link>
            <div className="flex items-center gap-2">
              {isDesktop && (
                <Button 
                  variant="3d" 
                  size="icon" 
                  onClick={() => setAutoCollapse(!autoCollapse)}
                  className="rounded-full h-8 w-8 shadow-md hover:shadow-lg"
                >
                  {autoCollapse ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
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
                        className="hover:shadow-md transition-all"
                      >
                        <Link to={item.path} className="flex items-center gap-2">
                          <item.icon className="h-5 w-5" />
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
                <div className="flex items-center space-x-2 p-3 bg-secondary/20 rounded-md shadow-inner">
                  <User className="h-5 w-5" />
                  <div className="truncate group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.role}</p>
                  </div>
                </div>
                
                <Button 
                  variant="3d" 
                  onClick={logout} 
                  className="w-full flex items-center justify-center gap-2 bg-red-500 border-b-4 border-red-700 hover:bg-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="group-data-[collapsible=icon]:hidden">Logout</span>
                </Button>
              </div>
            </SidebarFooter>
          )}
        </Sidebar>
        
        {/* Main Content Area */}
        <SidebarInset className="p-0 flex flex-col static bg-gray-50">
          <div className="flex h-16 items-center gap-4 border-b bg-white px-4 md:px-6 shadow-sm z-10">
            {isMobile && (
              <SidebarTrigger>
                <Menu className="h-5 w-5" />
              </SidebarTrigger>
            )}
            <div className="flex-1">
              <h1 className="text-xl font-semibold">
                {currentPageLabel}
              </h1>
            </div>
          </div>
          <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto bg-gray-50">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
