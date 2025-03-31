
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { WhatsAppButton } from "@/components/WhatsAppButton";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Redirect to dashboard if authenticated
    if (isAuthenticated) {
      navigate("/");
    } else {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-health-primary mb-2">Track4Health</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Monitor. Improve. Thrive.</p>
        <div className="animate-pulse mb-8">Redirecting...</div>
        <div className="flex justify-center">
          <WhatsAppButton phoneNumber="+923032939576" message="Hello, I need help with Track4Health" />
        </div>
      </div>
    </div>
  );
};

export default Index;
