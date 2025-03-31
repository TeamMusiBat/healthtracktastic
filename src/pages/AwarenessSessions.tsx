
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Calendar, Download, Trash2, Edit } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useHealthData, AwarenessSession, Attendee } from "@/contexts/HealthDataContext";
import LocationPicker from "@/components/LocationPicker";
import CamelCaseInput from "@/components/CamelCaseInput";
import DateRangePicker from "@/components/DateRangePicker";
import { createJsonExport, formatDate, getDobFromYears, toCamelCase } from "@/utils/formatters";

const AwarenessSessions = () => {
  const { user } = useAuth();
  const { 
    awarnessSessions, 
    addAwarenessSession, 
    deleteAwarenessSession,
    getAwarenessSessionsByDateRange,
    checkDuplicateAttendee 
  } = useHealthData();
  
  // State for session form
  const [newSession, setNewSession] = useState<Partial<AwarenessSession>>({
    date: new Date().toISOString().slice(0, 10),
    villageName: "",
    ucName: "",
    userName: user?.name || "",
    userDesignation: user?.role || "",
    attendees: [],
  });
  
  // State for attendee form
  const [newAttendee, setNewAttendee] = useState<Partial<Attendee>>({
    name: "",
    fatherHusbandName: "",
    age: 0,
    gender: "male",
    underFiveChildren: 0,
    contactNumber: "",
    remarks: "",
  });
  
  // State for bulk attendees
  const [attendees, setAttendees] = useState<Partial<Attendee>[]>([]);
  
  // State for export
  const [exportStartDate, setExportStartDate] = useState<Date>(new Date());
  const [exportEndDate, setExportEndDate] = useState<Date>(new Date());
  const [exportOption, setExportOption] = useState<"today" | "range" | "all">("today");
  
  // Handle location update
  const handleLocationUpdate = (latitude: number, longitude: number) => {
    setNewSession({
      ...newSession,
      location: { latitude, longitude },
    });
  };
  
  // Handle adding a new attendee to the bulk list
  const handleAddAttendee = () => {
    // Validate form
    if (!newAttendee.name || !newAttendee.fatherHusbandName) {
      toast.error("Name and Father/Husband Name are required");
      return;
    }
    
    // Format names (camelcase)
    const formattedName = toCamelCase(newAttendee.name || "");
    const formattedFatherName = toCamelCase(newAttendee.fatherHusbandName || "");
    
    // Check for duplicate
    if (
      newSession.villageName &&
      newSession.date &&
      checkDuplicateAttendee(
        formattedName,
        formattedFatherName,
        newSession.villageName,
        newSession.date
      )
    ) {
      toast.warning("This attendee already exists for this session and village");
      return;
    }
    
    // Add to bulk list
    const newAttendeeWithId: Partial<Attendee> = {
      ...newAttendee,
      id: Date.now().toString(),
      name: formattedName,
      fatherHusbandName: formattedFatherName,
      dob: newAttendee.age ? getDobFromYears(newAttendee.age) : undefined,
    };
    
    setAttendees([...attendees, newAttendeeWithId]);
    
    // Reset form
    setNewAttendee({
      name: "",
      fatherHusbandName: "",
      age: 0,
      gender: "male",
      underFiveChildren: 0,
      contactNumber: "",
      remarks: "",
    });
    
    toast.success("Attendee added to session");
  };
  
  // Handle removing an attendee from the bulk list
  const handleRemoveAttendee = (id: string) => {
    setAttendees(attendees.filter((a) => a.id !== id));
  };
  
  // Handle saving the entire session
  const handleSaveSession = () => {
    // Validate form
    if (!newSession.villageName || !newSession.ucName || attendees.length === 0) {
      toast.error("Village name, UC name, and at least one attendee are required");
      return;
    }
    
    // Format village and UC names
    const formattedVillageName = toCamelCase(newSession.villageName || "");
    const formattedUcName = toCamelCase(newSession.ucName || "");
    
    // Add session with all attendees
    addAwarenessSession({
      date: newSession.date || new Date().toISOString().slice(0, 10),
      villageName: formattedVillageName,
      ucName: formattedUcName,
      userName: newSession.userName || user?.name || "",
      userDesignation: newSession.userDesignation || user?.role || "",
      location: newSession.location,
      attendees: attendees as Attendee[],
      createdBy: user?.username || "",
    });
    
    // Reset form
    setNewSession({
      date: new Date().toISOString().slice(0, 10),
      villageName: "",
      ucName: "",
      userName: user?.name || "",
      userDesignation: user?.role || "",
      attendees: [],
    });
    setAttendees([]);
    
    toast.success("Awareness session saved successfully");
  };
  
  // Handle export
  const handleExport = () => {
    let dataToExport;
    
    if (exportOption === "today") {
      const today = new Date().toISOString().slice(0, 10);
      dataToExport = awarnessSessions.filter((session) => session.date === today);
    } else if (exportOption === "range") {
      dataToExport = getAwarenessSessionsByDateRange(
        exportStartDate.toISOString().slice(0, 10),
        exportEndDate.toISOString().slice(0, 10)
      );
    } else {
      dataToExport = awarnessSessions;
    }
    
    if (dataToExport.length === 0) {
      toast.warning("No data available for export");
      return;
    }
    
    // Export as JSON
    createJsonExport(dataToExport);
    toast.success("Export successful");
  };
  
  // Handle date range change
  const handleDateRangeChange = (start: Date, end: Date) => {
    setExportStartDate(start);
    setExportEndDate(end);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Awareness Sessions</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Today: {new Date().toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus size={16} />
                <span>Add Session</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Add New Awareness Session</DialogTitle>
                <DialogDescription>
                  Add details and attendees for a new health awareness session.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Session Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                      <Input
                        id="date"
                        type="date"
                        className="pl-10"
                        value={newSession.date}
                        onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="villageName">Village Name</Label>
                    <CamelCaseInput
                      id="villageName"
                      defaultValue={newSession.villageName}
                      onValueChange={(value) => setNewSession({ ...newSession, villageName: value })}
                      placeholder="Enter village name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ucName">UC Name</Label>
                    <CamelCaseInput
                      id="ucName"
                      defaultValue={newSession.ucName}
                      onValueChange={(value) => setNewSession({ ...newSession, ucName: value })}
                      placeholder="Enter UC name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="userName">User Name</Label>
                    <CamelCaseInput
                      id="userName"
                      defaultValue={newSession.userName}
                      onValueChange={(value) => setNewSession({ ...newSession, userName: value })}
                      placeholder="Enter user name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="userDesignation">User Designation</Label>
                    <Select
                      onValueChange={(value) => setNewSession({ ...newSession, userDesignation: value })}
                      defaultValue={newSession.userDesignation}
                    >
                      <SelectTrigger id="userDesignation">
                        <SelectValue placeholder="Select designation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fmt">FMT</SelectItem>
                        <SelectItem value="socialMobilizer">Social Mobilizer</SelectItem>
                        <SelectItem value="master">Master</SelectItem>
                        <SelectItem value="developer">Developer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <LocationPicker
                      onLocationChange={handleLocationUpdate}
                      initialLatitude={newSession.location?.latitude}
                      initialLongitude={newSession.location?.longitude}
                    />
                  </div>
                </div>
                
                {/* Add Attendees Form */}
                <div className="border p-4 rounded-md">
                  <h3 className="text-lg font-medium mb-4">Add Attendees</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <CamelCaseInput
                        id="name"
                        defaultValue={newAttendee.name}
                        onValueChange={(value) => setNewAttendee({ ...newAttendee, name: value })}
                        placeholder="Enter name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="fatherHusbandName">Father/Husband Name</Label>
                      <CamelCaseInput
                        id="fatherHusbandName"
                        defaultValue={newAttendee.fatherHusbandName}
                        onValueChange={(value) => setNewAttendee({ ...newAttendee, fatherHusbandName: value })}
                        placeholder="Enter father/husband name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="age">Age (years)</Label>
                      <Input
                        id="age"
                        type="number"
                        value={newAttendee.age || ""}
                        onChange={(e) => setNewAttendee({ ...newAttendee, age: Number(e.target.value) })}
                        placeholder="Enter age"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        onValueChange={(value: "male" | "female" | "other") => setNewAttendee({ ...newAttendee, gender: value })}
                        defaultValue={newAttendee.gender}
                      >
                        <SelectTrigger id="gender">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="underFiveChildren">Under Five Children</Label>
                      <Input
                        id="underFiveChildren"
                        type="number"
                        value={newAttendee.underFiveChildren || ""}
                        onChange={(e) => setNewAttendee({ ...newAttendee, underFiveChildren: Number(e.target.value) })}
                        placeholder="Enter number of children under 5"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contactNumber">Contact Number (optional)</Label>
                      <Input
                        id="contactNumber"
                        value={newAttendee.contactNumber || ""}
                        onChange={(e) => setNewAttendee({ ...newAttendee, contactNumber: e.target.value })}
                        placeholder="Enter contact number"
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="remarks">Remarks (optional)</Label>
                      <Input
                        id="remarks"
                        value={newAttendee.remarks || ""}
                        onChange={(e) => setNewAttendee({ ...newAttendee, remarks: e.target.value })}
                        placeholder="Enter remarks"
                      />
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleAddAttendee}
                    className="mt-4"
                  >
                    Add Attendee
                  </Button>
                </div>
                
                {/* Attendee List */}
                <div>
                  <h3 className="text-lg font-medium mb-2">Attendees ({attendees.length})</h3>
                  
                  {attendees.length > 0 ? (
                    <div className="border rounded-md divide-y">
                      {attendees.map((attendee) => (
                        <div key={attendee.id} className="p-3 flex justify-between items-center">
                          <div>
                            <p className="font-medium">{attendee.name}</p>
                            <p className="text-sm text-gray-500">
                              Father/Husband: {attendee.fatherHusbandName} | Age: {attendee.age} years
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveAttendee(attendee.id!)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No attendees added yet</p>
                  )}
                </div>
              </div>
              
              <DialogFooter>
                <Button onClick={handleSaveSession} disabled={attendees.length === 0}>
                  Save Session
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Download size={16} />
                <span>Export</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Export Awareness Sessions</DialogTitle>
                <DialogDescription>
                  Export session data as JSON file.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Export Options</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={exportOption === "today" ? "default" : "outline"}
                      onClick={() => setExportOption("today")}
                      className="w-full"
                    >
                      Today
                    </Button>
                    <Button
                      variant={exportOption === "range" ? "default" : "outline"}
                      onClick={() => setExportOption("range")}
                      className="w-full"
                    >
                      Date Range
                    </Button>
                    <Button
                      variant={exportOption === "all" ? "default" : "outline"}
                      onClick={() => setExportOption("all")}
                      className="w-full"
                    >
                      All Data
                    </Button>
                  </div>
                </div>
                
                {exportOption === "range" && (
                  <div className="space-y-2">
                    <Label>Select Date Range</Label>
                    <DateRangePicker onRangeChange={handleDateRangeChange} />
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button onClick={handleExport}>Export</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Sessions List */}
      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="cards">Card View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-4">
          {awarnessSessions.length > 0 ? (
            <div className="rounded-md border">
              <div className="grid grid-cols-6 gap-4 p-4 font-medium border-b">
                <div className="col-span-2">Details</div>
                <div className="col-span-1">Date</div>
                <div className="col-span-1">Location</div>
                <div className="col-span-1">Attendees</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>
              
              <div className="divide-y">
                {awarnessSessions.map((session) => (
                  <div key={session.id} className="grid grid-cols-6 gap-4 p-4 items-center">
                    <div className="col-span-2">
                      <p className="font-medium">{session.villageName}</p>
                      <p className="text-sm text-gray-500">UC: {session.ucName}</p>
                      <p className="text-sm text-gray-500">By: {session.userName}</p>
                    </div>
                    <div className="col-span-1">
                      {formatDate(session.date)}
                    </div>
                    <div className="col-span-1">
                      {session.location ? (
                        <span className="text-xs text-gray-500">
                          {session.location.latitude.toFixed(4)}, {session.location.longitude.toFixed(4)}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">No location</span>
                      )}
                    </div>
                    <div className="col-span-1">
                      {session.attendees.length}
                    </div>
                    <div className="col-span-1 flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteAwarenessSession(session.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center h-40">
              <p className="text-gray-500">No awareness sessions found</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="cards" className="space-y-4">
          {awarnessSessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {awarnessSessions.map((session) => (
                <Card key={session.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{session.villageName}</CardTitle>
                        <CardDescription>UC: {session.ucName}</CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteAwarenessSession(session.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Date:</span>
                        <span>{formatDate(session.date)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Conducted by:</span>
                        <span>{session.userName}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Attendees:</span>
                        <span>{session.attendees.length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center h-40">
              <p className="text-gray-500">No awareness sessions found</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AwarenessSessions;
