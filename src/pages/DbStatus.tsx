
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, RefreshCw, Database, Server } from 'lucide-react';
import ApiService from '@/services/ApiService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const DbStatus = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [lastChecked, setLastChecked] = useState<string>('');
  const [dbInfo, setDbInfo] = useState<{
    host: string;
    database: string;
    version?: string;
  } | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if not a developer
  useEffect(() => {
    if (user?.role !== 'developer') {
      navigate('/dashboard');
      toast.error('You do not have permission to access this page');
    }
  }, [user, navigate]);
  
  const checkConnection = async () => {
    setIsLoading(true);
    try {
      // First check basic connectivity
      const isOnline = await ApiService.checkServerConnectivity();
      
      // If basic connectivity works, try a specific db check
      if (isOnline) {
        try {
          const response = await fetch('https://healthbyasif.buylevi.xyz/api/db_status.php');
          const data = await response.json();
          
          if (data.success) {
            setIsConnected(true);
            setDbInfo({
              host: data.host || 'srv1135.hstgr.io',
              database: data.database || 'u769157863_track4health',
              version: data.version
            });
          } else {
            setIsConnected(false);
            setDbInfo(null);
          }
        } catch (error) {
          console.error('Database check error:', error);
          setIsConnected(false);
          setDbInfo(null);
        }
      } else {
        setIsConnected(false);
        setDbInfo(null);
      }
    } catch (error) {
      console.error('Connection error:', error);
      setIsConnected(false);
      setDbInfo(null);
    } finally {
      setIsLoading(false);
      setLastChecked(new Date().toLocaleTimeString());
    }
  };
  
  // Check connection on component mount
  useEffect(() => {
    checkConnection();
  }, []);
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Database Connection Status</h1>
      <p className="text-muted-foreground">
        This page is only accessible by developers to verify database connectivity.
      </p>
      
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Status
          </CardTitle>
          <CardDescription>
            Checking connection to Hostinger MySQL database
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 p-4 border rounded-md bg-muted/30">
            {isLoading ? (
              <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
            ) : isConnected ? (
              <CheckCircle className="h-8 w-8 text-green-500" />
            ) : (
              <XCircle className="h-8 w-8 text-red-500" />
            )}
            
            <div>
              <h3 className="text-lg font-medium">
                {isLoading 
                  ? 'Checking connection...' 
                  : isConnected 
                    ? 'Connected to database' 
                    : 'Database connection failed'}
              </h3>
              <p className="text-sm text-muted-foreground">
                Last checked: {lastChecked || 'Never'}
              </p>
            </div>
          </div>
          
          {dbInfo && (
            <div className="space-y-3 p-4 border rounded-md">
              <div className="flex items-center">
                <Server className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="font-medium mr-2">Host:</span> 
                <code className="bg-muted px-2 py-1 rounded text-sm">{dbInfo.host}</code>
              </div>
              <div className="flex items-center">
                <Database className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="font-medium mr-2">Database:</span> 
                <code className="bg-muted px-2 py-1 rounded text-sm">{dbInfo.database}</code>
              </div>
              {dbInfo.version && (
                <div className="flex items-center">
                  <span className="font-medium mr-2">MySQL Version:</span> 
                  <code className="bg-muted px-2 py-1 rounded text-sm">{dbInfo.version}</code>
                </div>
              )}
            </div>
          )}
          
          {!isConnected && !isLoading && (
            <div className="space-y-2 p-4 border border-red-200 rounded-md bg-red-50">
              <h4 className="font-medium text-red-700">Troubleshooting Steps:</h4>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                <li>Verify database credentials in api/db_config.php</li>
                <li>Check if the database server is running</li>
                <li>Ensure API server can connect to the database</li>
                <li>Check for firewall or network connectivity issues</li>
              </ul>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </Button>
          <Button 
            onClick={checkConnection} 
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
            {isLoading ? 'Checking...' : 'Check Again'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DbStatus;
