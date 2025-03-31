
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  Bell, 
  Menu, 
  X, 
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  roles?: string[];
}

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, canLogout } = useAuth();
  const isMobile = useMobile();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close mobile menu when path changes
  React.useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Menu items with role-based access
  const menuItems: MenuItem[] = [
    {
      path: '/',
      label: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
    },
    {
      path: '/users',
      label: 'Users',
      icon: <Users size={20} />,
      roles: ['developer', 'master'],
    },
    {
      path: '/awareness-sessions',
      label: 'Awareness Sessions',
      icon: <Calendar size={20} />,
    },
    {
      path: '/child-screening',
      label: 'Child Screening',
      icon: <Bell size={20} />,
    },
    {
      path: '/blogs',
      label: 'Blogs',
      icon: <FileText size={20} />,
    },
  ];

  // Filter items based on user role
  const filteredMenuItems = menuItems.filter(item => {
    if (!item.roles) return true;
    if (!user) return false;
    return item.roles.includes(user.role);
  });

  const handleLogout = () => {
    if (canLogout) {
      logout();
      navigate('/login');
    } else {
      toast.error('You don\'t have permission to logout');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {isMobile && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setMenuOpen(!menuOpen)} 
                aria-label="Toggle menu"
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            )}
            <Link to="/" className="font-bold text-xl text-primary">Track4Health</Link>
          </div>
          
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      {user?.name.charAt(0)}
                    </div>
                    <div className="flex flex-col items-start max-w-[120px]">
                      <div className="font-medium truncate">{user?.name}</div>
                      <div className="text-xs text-muted-foreground capitalize">{user?.role}</div>
                    </div>
                    <ChevronDown size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem className="font-medium">{user?.name}</DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    disabled={!canLogout}
                    className={!canLogout ? "opacity-50 cursor-not-allowed" : ""}
                  >
                    <LogOut className="mr-2" size={16} />
                    Logout
                    {!canLogout && <span className="ml-2 text-xs">(Restricted)</span>}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => navigate('/login')} variant="default" size="sm">
                Login
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - desktop or mobile when menu is open */}
        {((!isMobile) || (isMobile && menuOpen)) && (
          <aside className={`${isMobile ? 'fixed inset-0 top-[61px] z-50 bg-black/50' : ''}`}>
            <div className={`
              w-64 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
              flex flex-col overflow-y-auto
              ${isMobile ? 'h-full' : 'min-h-[calc(100vh-61px)]'}
            `}>
              <nav className="flex-1 p-3">
                <ul className="space-y-1">
                  {filteredMenuItems.map((item) => (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={`
                          flex items-center gap-3 px-4 py-3 rounded-md transition-colors
                          ${pathname === item.path 
                            ? 'bg-primary text-primary-foreground' 
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }
                        `}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </aside>
        )}

        {/* Main content */}
        <main className={`flex-1 p-4 overflow-y-auto ${isMobile && menuOpen ? 'opacity-20 pointer-events-none' : ''}`}>
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
