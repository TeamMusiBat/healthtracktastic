
import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Users from "./pages/Users";
import AwarenessSessions from "./pages/AwarenessSessions";
import ChildScreening from "./pages/ChildScreening";
import Blogs from "./pages/Blogs";
import NotFound from "./pages/NotFound";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { HealthDataProvider } from "./contexts/HealthDataContext";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children, requiredRoles = [] }: { children: React.ReactNode, requiredRoles?: string[] }) => {
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Small delay to ensure auth state is loaded
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // If requiredRoles is specified but empty, any authenticated user can access
  if (requiredRoles.length > 0) {
    // Check if user has required role
    if (!user || !requiredRoles.includes(user.role)) {
      return <Navigate to="/dashboard" />;
    }
  }

  return <>{children}</>;
};

const AppContent = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute requiredRoles={["developer", "master"]}>
            <Users />
          </ProtectedRoute>
        } />
        <Route path="/awareness-sessions" element={
          <ProtectedRoute>
            <AwarenessSessions />
          </ProtectedRoute>
        } />
        <Route path="/child-screening" element={
          <ProtectedRoute>
            <ChildScreening />
          </ProtectedRoute>
        } />
        {/* Blogs page is publicly accessible */}
        <Route path="/blogs" element={<Blogs />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
};

const App = () => {
  // We don't need the BrowserRouter here because it's in main.tsx
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <HealthDataProvider>
            <AppContent />
          </HealthDataProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
