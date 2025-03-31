
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-health-primary mb-4">404</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
          Oops! We couldn't find the page you're looking for.
        </p>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          The page might have been moved, deleted, or never existed.
        </p>
        <Link to="/">
          <Button className="flex items-center gap-2">
            <Home size={18} />
            <span>Return to Home</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
