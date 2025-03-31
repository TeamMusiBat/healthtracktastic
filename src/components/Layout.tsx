import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { ModeToggle } from "@/components/mode-toggle";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Navigation */}
      {isMobile && (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription>
                Navigate through the application.
              </SheetDescription>
            </SheetHeader>
            <Separator className="my-4" />
            <div className="flex flex-col space-y-2">
              <Link to="/" className="block py-2 hover:bg-secondary rounded-md px-2">
                Dashboard
              </Link>
              {isAuthenticated && user?.role === "developer" && (
                <Link to="/users" className="block py-2 hover:bg-secondary rounded-md px-2">
                  Users
                </Link>
              )}
              <Link to="/awareness-sessions" className="block py-2 hover:bg-secondary rounded-md px-2">
                Awareness Sessions
              </Link>
              <Link to="/child-screening" className="block py-2 hover:bg-secondary rounded-md px-2">
                Child Screening
              </Link>
              <Link to="/blogs" className="block py-2 hover:bg-secondary rounded-md px-2">
                Blogs
              </Link>
              <Button variant="destructive" onClick={logout} className="w-full">
                Logout
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Desktop Navigation */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-secondary">
        <div className="p-4">
          <Link to="/" className="font-bold text-lg">
            Track4Health
          </Link>
        </div>
        <Separator />
        <nav className="flex-grow p-4">
          <ul className="space-y-2">
            <li>
              <Link to="/" className="block py-2 hover:bg-secondary rounded-md px-2">
                Dashboard
              </Link>
            </li>
            {isAuthenticated && user?.role === "developer" && (
              <li>
                <Link to="/users" className="block py-2 hover:bg-secondary rounded-md px-2">
                  Users
                </Link>
              </li>
            )}
            <li>
              <Link to="/awareness-sessions" className="block py-2 hover:bg-secondary rounded-md px-2">
                Awareness Sessions
              </Link>
            </li>
            <li>
              <Link to="/child-screening" className="block py-2 hover:bg-secondary rounded-md px-2">
                Child Screening
              </Link>
            </li>
            <li>
              <Link to="/blogs" className="block py-2 hover:bg-secondary rounded-md px-2">
                Blogs
              </Link>
            </li>
          </ul>
        </nav>
        <Separator />
        <div className="p-4">
          <Button variant="destructive" onClick={logout} className="w-full">
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {children}
      </main>

      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
    </div>
  );
};

export default Layout;
