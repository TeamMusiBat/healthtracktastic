
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

const Dashboard = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  const screeningData = [
    { name: "Jan", normal: 400, mam: 240, sam: 60 },
    { name: "Feb", normal: 300, mam: 139, sam: 45 },
    { name: "Mar", normal: 200, mam: 140, sam: 40 },
    { name: "Apr", normal: 278, mam: 100, sam: 30 },
    { name: "May", normal: 189, mam: 140, sam: 40 },
    { name: "Jun", normal: 239, mam: 119, sam: 25 },
    { name: "Jul", normal: 349, mam: 130, sam: 20 },
  ];

  const attendanceData = [
    { name: "Jan", attendance: 85 },
    { name: "Feb", attendance: 78 },
    { name: "Mar", attendance: 90 },
    { name: "Apr", attendance: 84 },
    { name: "May", attendance: 92 },
    { name: "Jun", attendance: 88 },
    { name: "Jul", attendance: 95 },
  ];

  const nutritionalStatusData = [
    { name: "Normal", value: 680, color: "#4CAF50" },
    { name: "MAM", value: 270, color: "#FFC107" },
    { name: "SAM", value: 120, color: "#F44336" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name || "User"}</h1>
        <p className="text-muted-foreground">
          Track your community health metrics and activities in real-time
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Children Screened</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,248</div>
            <p className="text-xs text-muted-foreground">
              +12.5% from previous month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Awareness Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">
              +4.2% from previous month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from previous month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="screening" className="space-y-4">
        <TabsList>
          <TabsTrigger value="screening">Screening Data</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
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

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Awareness Session Attendance</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="attendance" fill="var(--primary)" radius={[4, 4, 0, 0]} />
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
