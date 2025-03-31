
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Users from "./pages/Users";
import AwarenessSessions from "./pages/AwarenessSessions";
import ChildScreening from "./pages/ChildScreening";
import Blogs from "./pages/Blogs";
import NotFound from "./pages/NotFound";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { HealthDataProvider } from "./contexts/HealthDataContext";
import { useState, useEffect } from "react";

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
      return <Navigate to="/" />;
    }
  }

  return <>{children}</>;
};

const AppContent = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Layout>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
        <Route path="/" element={
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
        {/* Blogs page is now publicly accessible */}
        <Route path="/blogs" element={<Blogs />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <HealthDataProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </HealthDataProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
