
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { useHealthData } from "@/contexts/HealthDataContext";

const Dashboard = () => {
  const { user } = useAuth();
  const { childScreenings, awarenessSessions } = useHealthData();
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  
  // Filter data based on user role
  const isAdminRole = user?.role === "developer" || user?.role === "master";
  
  // Filter screenings and sessions based on user role
  const filteredScreenings = isAdminRole 
    ? childScreenings 
    : childScreenings.filter(screening => screening.conductedBy === user?.username);
    
  const filteredSessions = isAdminRole
    ? awarenessSessions
    : awarenessSessions.filter(session => session.conductedBy === user?.username);

  // Calculate stats based on filtered data
  const totalChildrenScreened = filteredScreenings.reduce((total, screening) => {
    return total + screening.children.length;
  }, 0);

  const totalAwarenessSessions = filteredSessions.length;

  // Calculate attendance rate (average attendees per session)
  const attendanceRate = filteredSessions.length > 0 
    ? Math.round(filteredSessions.reduce((total, session) => total + session.attendees.length, 0) / filteredSessions.length) 
    : 0;

  // Process screening data for charts
  const processScreeningData = () => {
    // Group children by month or as needed
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const screeningByMonth = months.map(month => ({
      name: month,
      normal: 0,
      mam: 0,
      sam: 0
    }));

    filteredScreenings.forEach(screening => {
      const date = new Date(screening.date);
      const monthIndex = date.getMonth();
      
      screening.children.forEach(child => {
        if (child.status === "Normal") screeningByMonth[monthIndex].normal++;
        else if (child.status === "MAM") screeningByMonth[monthIndex].mam++;
        else if (child.status === "SAM") screeningByMonth[monthIndex].sam++;
      });
    });

    return screeningByMonth;
  };

  // Process awareness session data for charts
  const processSessionsData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const sessionsByMonth = months.map(month => ({
      name: month,
      sessions: 0,
      attendees: 0
    }));

    filteredSessions.forEach(session => {
      const date = new Date(session.date);
      const monthIndex = date.getMonth();
      
      sessionsByMonth[monthIndex].sessions++;
      sessionsByMonth[monthIndex].attendees += session.attendees.length;
    });

    return sessionsByMonth;
  };

  // Process nutritional status data for pie chart
  const processNutritionalData = () => {
    let normal = 0, mam = 0, sam = 0;

    filteredScreenings.forEach(screening => {
      screening.children.forEach(child => {
        if (child.status === "Normal") normal++;
        else if (child.status === "MAM") mam++;
        else if (child.status === "SAM") sam++;
      });
    });

    return [
      { name: "Normal", value: normal, color: "#4CAF50" },
      { name: "MAM", value: mam, color: "#FFC107" },
      { name: "SAM", value: sam, color: "#F44336" }
    ];
  };

  const screeningData = processScreeningData();
  const sessionsData = processSessionsData();
  const nutritionalStatusData = processNutritionalData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name || "User"}</h1>
        <p className="text-muted-foreground">
          {isAdminRole 
            ? "View all health metrics and activities across your team" 
            : "Track your health monitoring activities and contributions"}
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Children Screened</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalChildrenScreened}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isAdminRole ? "Across all workers" : "Your screenings"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Awareness Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAwarenessSessions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isAdminRole ? "Conducted by all workers" : "Your sessions"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Attendees per Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceRate}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="screening" className="space-y-4">
        <TabsList>
          <TabsTrigger value="screening">Screening Data</TabsTrigger>
          <TabsTrigger value="awareness">Awareness Sessions</TabsTrigger>
          <TabsTrigger value="nutritional">Nutritional Status</TabsTrigger>
        </TabsList>
        <TabsContent value="screening" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Child Screening Trends</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={screeningData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="normal" stroke="#4CAF50" strokeWidth={2} />
                  <Line type="monotone" dataKey="mam" stroke="#FFC107" strokeWidth={2} />
                  <Line type="monotone" dataKey="sam" stroke="#F44336" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="awareness" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Awareness Session Attendance</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sessionsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sessions" name="Sessions" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="attendees" name="Attendees" fill="var(--secondary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nutritional" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Nutritional Status Distribution</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={nutritionalStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {nutritionalStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
