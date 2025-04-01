
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center">
      <div className="max-w-5xl w-full p-6 md:py-12 md:px-8 space-y-8">
        
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Track4Health
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground">
            Improving health outcomes through data-driven insights
          </p>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* About Section */}
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle>About Track4Health</CardTitle>
              <CardDescription>Empowering communities through better health tracking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold">Project Goal:</h3>
              <p>
                Track4Health is a web-based health record management system focusing on child screening, 
                immunization, nutrition, and hygiene awareness sessions. This system allows efficient bulk 
                data entry, structured Excel exports, and real-time user tracking.
              </p>
              
              <h3 className="text-lg font-semibold">Key Features:</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Child health screening and nutritional status tracking</li>
                <li>Immunization records and scheduling</li>
                <li>Community awareness session management</li>
                <li>Real-time field worker tracking</li>
                <li>Data export capabilities for analysis</li>
                <li>Role-based access control for different user types</li>
              </ul>
              
              {isAuthenticated ? (
                <div className="pt-4">
                  <Link to="/dashboard">
                    <Button className="w-full">Go to Dashboard</Button>
                  </Link>
                </div>
              ) : (
                <div className="pt-4">
                  <Link to="/login">
                    <Button className="w-full">Login to Access System</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Contact/Help Section */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Need Assistance?</CardTitle>
              <CardDescription>Our team is here to help</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                For technical support or questions about the Track4Health system, please contact our team 
                via WhatsApp or email.
              </p>
              
              <div className="flex justify-center pt-2">
                <WhatsAppButton phoneNumber="+923032939576" message="Hello, I need help with Track4Health" />
              </div>
              
              <div className="pt-4">
                <p className="text-sm text-center text-muted-foreground">
                  This application is designed to work across all devices including smartphones, 
                  tablets and desktop computers.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
