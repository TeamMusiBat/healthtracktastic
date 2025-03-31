
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useHealthData } from "@/contexts/HealthDataContext";
import { FileText, MessageSquare, Stethoscope, UserPlus, Users } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const { awarnessSessions, childScreenings, activeUsers } = useHealthData();
  const [samCount, setSamCount] = useState(0);
  const [mamCount, setMamCount] = useState(0);
  const [normalCount, setNormalCount] = useState(0);
  const [totalScreenings, setTotalScreenings] = useState(0);
  const [todayScreenings, setTodayScreenings] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [todaySessions, setTodaySessions] = useState(0);
  
  useEffect(() => {
    // Calculate counts for nutritional status
    let sam = 0;
    let mam = 0;
    let normal = 0;
    let totalChildCount = 0;
    let todayChildCount = 0;
    
    const today = new Date().toISOString().slice(0, 10);
    
    childScreenings.forEach(screening => {
      screening.children.forEach(child => {
        if (child.status === "SAM") sam++;
        else if (child.status === "MAM") mam++;
        else if (child.status === "Normal") normal++;
        
        totalChildCount++;
      });
      
      if (screening.date === today) {
        todayChildCount += screening.children.length;
      }
    });
    
    setSamCount(sam);
    setMamCount(mam);
    setNormalCount(normal);
    setTotalScreenings(totalChildCount);
    setTodayScreenings(todayChildCount);
    
    // Calculate awareness session counts
    setTotalSessions(awarnessSessions.length);
    setTodaySessions(awarnessSessions.filter(session => session.date === today).length);
  }, [awarnessSessions, childScreenings]);
  
  // Data for pie chart
  const nutritionData = [
    { name: 'SAM', value: samCount, color: '#F44336' },
    { name: 'MAM', value: mamCount, color: '#FFC107' },
    { name: 'Normal', value: normalCount, color: '#4CAF50' },
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Dashboard overview of Track4Health
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {(user?.role === "developer" || user?.role === "master") && (
            <Link to="/users">
              <Button className="flex items-center gap-2">
                <UserPlus size={18} />
                <span>Add User</span>
              </Button>
            </Link>
          )}
          
          <Link to="/awareness-sessions">
            <Button variant="outline" className="flex items-center gap-2">
              <MessageSquare size={18} />
              <span>Sessions</span>
            </Button>
          </Link>
          
          <Link to="/child-screening">
            <Button variant="outline" className="flex items-center gap-2">
              <Stethoscope size={18} />
              <span>Screening</span>
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Children Screened</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalScreenings}</div>
            <p className="text-xs text-gray-500 mt-1">Today: {todayScreenings}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Awareness Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSessions}</div>
            <p className="text-xs text-gray-500 mt-1">Today: {todaySessions}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              <span className="flex items-center">
                SAM Cases <span className="ml-2 w-2 h-2 rounded-full bg-health-sam"></span>
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{samCount}</div>
            <p className="text-xs text-gray-500 mt-1">
              {totalScreenings > 0 
                ? `${((samCount / totalScreenings) * 100).toFixed(1)}% of total` 
                : "No screenings yet"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              <span className="flex items-center">
                MAM Cases <span className="ml-2 w-2 h-2 rounded-full bg-health-mam"></span>
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mamCount}</div>
            <p className="text-xs text-gray-500 mt-1">
              {totalScreenings > 0 
                ? `${((mamCount / totalScreenings) * 100).toFixed(1)}% of total` 
                : "No screenings yet"}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts and Additional Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Nutritional Status Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Nutritional Status Distribution</CardTitle>
            <CardDescription>
              Summary of all child screening results
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {(samCount > 0 || mamCount > 0 || normalCount > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={nutritionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {nutritionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No data available yet</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Active Users */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Active Field Workers</CardTitle>
            <CardDescription>
              Users currently active in the field
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeUsers.length > 0 ? (
              <div className="space-y-4">
                {activeUsers.map((activeUser) => (
                  <div 
                    key={activeUser.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Users size={24} className="text-gray-700 dark:text-gray-300" />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500"></span>
                      </div>
                      <div>
                        <h3 className="font-medium">{activeUser.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{activeUser.role}</p>
                      </div>
                    </div>
                    
                    {activeUser.location && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Location: {activeUser.location.latitude.toFixed(4)}, {activeUser.location.longitude.toFixed(4)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32">
                <p className="text-gray-500">No active field workers</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare size={18} />
              <span>Awareness Sessions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Track and manage health awareness sessions
            </p>
            <Link to="/awareness-sessions">
              <Button className="w-full">View Sessions</Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope size={18} />
              <span>Child Screening</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Track nutritional status and vaccinations
            </p>
            <Link to="/child-screening">
              <Button className="w-full">View Screenings</Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText size={18} />
              <span>Health Blogs</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Read health tips and articles
            </p>
            <Link to="/blogs">
              <Button className="w-full">View Blogs</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
