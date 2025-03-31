
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
import { Plus, Calendar, Download, Trash2, Edit, Save } from "lucide-react";
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
  
  // State for tracking sessions
  const [sessions, setSessions] = useState<{
    villageName: string;
    ucName: string;
    date: string;
    attendees: Partial<Attendee>[];
  }[]>([]);
  
  // Handle location update
  const handleLocationUpdate = (latitude: number, longitude: number) => {
    setNewSession({
      ...newSession,
      location: { latitude, longitude },
    });
  };
  
  // Handle adding a new session to the bulk list
  const handleAddSession = () => {
    if (!newSession.villageName || !newSession.ucName) {
      toast.error("Village name and UC name are required");
      return;
    }
    
    // Format village and UC names
    const formattedVillageName = toCamelCase(newSession.villageName || "");
    const formattedUcName = toCamelCase(newSession.ucName || "");
    
    setSessions([
      ...sessions,
      {
        villageName: formattedVillageName,
        ucName: formattedUcName,
        date: newSession.date || new Date().toISOString().slice(0, 10),
        attendees: []
      }
    ]);
    
    toast.success("Session added to bulk list");
  };
  
  // Handle adding a new attendee to a session
  const handleAddAttendeeToSession = (sessionIndex: number) => {
    // Validate form
    if (!newAttendee.name || !newAttendee.fatherHusbandName) {
      toast.error("Name and Father/Husband Name are required");
      return;
    }
    
    // Format names (camelcase)
    const formattedName = toCamelCase(newAttendee.name || "");
    const formattedFatherName = toCamelCase(newAttendee.fatherHusbandName || "");
    
    // Check for duplicate
    const session = sessions[sessionIndex];
    if (
      checkDuplicateAttendee(
        formattedName,
        formattedFatherName,
        session.villageName,
        session.date
      )
    ) {
      toast.warning("This attendee already exists for this session and village");
      return;
    }
    
    // Also check for duplicates in current session
    if (
      session.attendees.some(
        (a) => 
          a.name?.toLowerCase() === formattedName.toLowerCase() && 
          a.fatherHusbandName?.toLowerCase() === formattedFatherName.toLowerCase()
      )
    ) {
      toast.warning("This attendee already exists in this session");
      return;
    }
    
    // Add attendee to the session
    const newAttendeeWithId: Partial<Attendee> = {
      ...newAttendee,
      id: Date.now().toString(),
      name: formattedName,
      fatherHusbandName: formattedFatherName,
      dob: newAttendee.age ? getDobFromYears(newAttendee.age) : undefined,
    };
    
    const updatedSessions = [...sessions];
    updatedSessions[sessionIndex].attendees.push(newAttendeeWithId);
    setSessions(updatedSessions);
    
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
  
  // Handle removing a session from the bulk list
  const handleRemoveSession = (index: number) => {
    const updatedSessions = [...sessions];
    updatedSessions.splice(index, 1);
    setSessions(updatedSessions);
  };
  
  // Handle removing an attendee from a session
  const handleRemoveAttendeeFromSession = (sessionIndex: number, attendeeId: string) => {
    const updatedSessions = [...sessions];
    updatedSessions[sessionIndex].attendees = updatedSessions[sessionIndex].attendees.filter(
      (a) => a.id !== attendeeId
    );
    setSessions(updatedSessions);
  };
  
  // Handle saving all sessions
  const handleSaveAllSessions = () => {
    // Validate that all sessions have at least one attendee
    const emptySessions = sessions.filter((s) => s.attendees.length === 0);
    if (emptySessions.length > 0) {
      toast.error("All sessions must have at least one attendee");
      return;
    }
    
    // Save all sessions
    sessions.forEach((session) => {
      addAwarenessSession({
        date: session.date,
        villageName: session.villageName,
        ucName: session.ucName,
        userName: newSession.userName || user?.name || "",
        userDesignation: newSession.userDesignation || user?.role || "",
        location: newSession.location,
        attendees: session.attendees as Attendee[],
        createdBy: user?.username || "",
      });
    });
    
    // Reset state
    setSessions([]);
    setNewSession({
      date: new Date().toISOString().slice(0, 10),
      villageName: "",
      ucName: "",
      userName: user?.name || "",
      userDesignation: user?.role || "",
      attendees: [],
    });
    
    toast.success("All sessions saved successfully");
  };
  
  // Handle adding a new attendee to the bulk list (old method kept for compatibility)
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
  
  // Handle removing an attendee from the bulk list (old method kept for compatibility)
  const handleRemoveAttendee = (id: string) => {
    setAttendees(attendees.filter((a) => a.id !== id));
  };
  
  // Handle saving the entire session (old method kept for compatibility)
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
                <span>Add Sessions</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Awareness Sessions</DialogTitle>
                <DialogDescription>
                  Add multiple sessions and attendees for bulk health awareness sessions.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* User Details (Shared across all sessions) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      disabled={user?.role !== "developer" && user?.role !== "master"}
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
                </div>
                
                {/* Location (Shared across all sessions) */}
                <div className="space-y-2">
                  <Label>Location</Label>
                  <LocationPicker
                    onLocationChange={handleLocationUpdate}
                    initialLatitude={newSession.location?.latitude}
                    initialLongitude={newSession.location?.longitude}
                  />
                </div>
                
                {/* Add New Session Form */}
                <div className="border p-4 rounded-md">
                  <h3 className="text-lg font-medium mb-4">Add New Session</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  </div>
                  
                  <Button
                    onClick={handleAddSession}
                    className="mt-4"
                  >
                    Add Session
                  </Button>
                </div>
                
                {/* Sessions List */}
                {sessions.length > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Sessions ({sessions.length})</h3>
                      <Button onClick={handleSaveAllSessions} className="flex items-center gap-2">
                        <Save size={16} />
                        <span>Save All Sessions</span>
                      </Button>
                    </div>
                    
                    {sessions.map((session, sessionIndex) => (
                      <div key={sessionIndex} className="border rounded-md p-4 mb-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-medium">{session.villageName}, {session.ucName}</h4>
                            <p className="text-sm text-gray-500">
                              Date: {formatDate(session.date)} | Attendees: {session.attendees.length}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveSession(sessionIndex)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                        
                        {/* Add Attendee Form */}
                        <div className="border-t pt-4 mb-4">
                          <h5 className="font-medium mb-2">Add Attendee to Session</h5>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`name-${sessionIndex}`}>Name</Label>
                              <CamelCaseInput
                                id={`name-${sessionIndex}`}
                                defaultValue={newAttendee.name}
                                onValueChange={(value) => setNewAttendee({ ...newAttendee, name: value })}
                                placeholder="Enter name"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor={`fatherHusbandName-${sessionIndex}`}>Father/Husband Name</Label>
                              <CamelCaseInput
                                id={`fatherHusbandName-${sessionIndex}`}
                                defaultValue={newAttendee.fatherHusbandName}
                                onValueChange={(value) => setNewAttendee({ ...newAttendee, fatherHusbandName: value })}
                                placeholder="Enter father/husband name"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor={`age-${sessionIndex}`}>Age (years)</Label>
                              <Input
                                id={`age-${sessionIndex}`}
                                type="number"
                                value={newAttendee.age || ""}
                                onChange={(e) => setNewAttendee({ ...newAttendee, age: Number(e.target.value) })}
                                placeholder="Enter age"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor={`gender-${sessionIndex}`}>Gender</Label>
                              <Select
                                onValueChange={(value: "male" | "female" | "other") => setNewAttendee({ ...newAttendee, gender: value })}
                                defaultValue={newAttendee.gender}
                              >
                                <SelectTrigger id={`gender-${sessionIndex}`}>
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
                              <Label htmlFor={`underFiveChildren-${sessionIndex}`}>Under Five Children</Label>
                              <Input
                                id={`underFiveChildren-${sessionIndex}`}
                                type="number"
                                value={newAttendee.underFiveChildren || ""}
                                onChange={(e) => setNewAttendee({ ...newAttendee, underFiveChildren: Number(e.target.value) })}
                                placeholder="Enter number of children under 5"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor={`contactNumber-${sessionIndex}`}>Contact Number (optional)</Label>
                              <Input
                                id={`contactNumber-${sessionIndex}`}
                                value={newAttendee.contactNumber || ""}
                                onChange={(e) => setNewAttendee({ ...newAttendee, contactNumber: e.target.value })}
                                placeholder="Enter contact number"
                              />
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor={`remarks-${sessionIndex}`}>Remarks (optional)</Label>
                              <Input
                                id={`remarks-${sessionIndex}`}
                                value={newAttendee.remarks || ""}
                                onChange={(e) => setNewAttendee({ ...newAttendee, remarks: e.target.value })}
                                placeholder="Enter remarks"
                              />
                            </div>
                          </div>
                          
                          <Button
                            onClick={() => handleAddAttendeeToSession(sessionIndex)}
                            className="mt-4"
                          >
                            Add Attendee
                          </Button>
                        </div>
                        
                        {/* Attendees List */}
                        {session.attendees.length > 0 ? (
                          <div className="border rounded-md divide-y">
                            {session.attendees.map((attendee) => (
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
                                  onClick={() => handleRemoveAttendeeFromSession(sessionIndex, attendee.id!)}
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
                    ))}
                  </div>
                )}
                
                {/* Traditional Add Attendees Form (kept for compatibility) */}
                <div className="border p-4 rounded-md">
                  <h3 className="text-lg font-medium mb-4">Traditional Entry Method</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date-single">Date</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                        <Input
                          id="date-single"
                          type="date"
                          className="pl-10"
                          value={newSession.date}
                          onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="villageName-single">Village Name</Label>
                      <CamelCaseInput
                        id="villageName-single"
                        defaultValue={newSession.villageName}
                        onValueChange={(value) => setNewSession({ ...newSession, villageName: value })}
                        placeholder="Enter village name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="ucName-single">UC Name</Label>
                      <CamelCaseInput
                        id="ucName-single"
                        defaultValue={newSession.ucName}
                        onValueChange={(value) => setNewSession({ ...newSession, ucName: value })}
                        placeholder="Enter UC name"
                      />
                    </div>
                  </div>
                  
                  {/* Add Attendees Form */}
                  <div className="border-t mt-4 pt-4">
                    <h3 className="text-lg font-medium mb-4">Add Attendees</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name-single">Name</Label>
                        <CamelCaseInput
                          id="name-single"
                          defaultValue={newAttendee.name}
                          onValueChange={(value) => setNewAttendee({ ...newAttendee, name: value })}
                          placeholder="Enter name"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="fatherHusbandName-single">Father/Husband Name</Label>
                        <CamelCaseInput
                          id="fatherHusbandName-single"
                          defaultValue={newAttendee.fatherHusbandName}
                          onValueChange={(value) => setNewAttendee({ ...newAttendee, fatherHusbandName: value })}
                          placeholder="Enter father/husband name"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="age-single">Age (years)</Label>
                        <Input
                          id="age-single"
                          type="number"
                          value={newAttendee.age || ""}
                          onChange={(e) => setNewAttendee({ ...newAttendee, age: Number(e.target.value) })}
                          placeholder="Enter age"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="gender-single">Gender</Label>
                        <Select
                          onValueChange={(value: "male" | "female" | "other") => setNewAttendee({ ...newAttendee, gender: value })}
                          defaultValue={newAttendee.gender}
                        >
                          <SelectTrigger id="gender-single">
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
                        <Label htmlFor="underFiveChildren-single">Under Five Children</Label>
                        <Input
                          id="underFiveChildren-single"
                          type="number"
                          value={newAttendee.underFiveChildren || ""}
                          onChange={(e) => setNewAttendee({ ...newAttendee, underFiveChildren: Number(e.target.value) })}
                          placeholder="Enter number of children under 5"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="contactNumber-single">Contact Number (optional)</Label>
                        <Input
                          id="contactNumber-single"
                          value={newAttendee.contactNumber || ""}
                          onChange={(e) => setNewAttendee({ ...newAttendee, contactNumber: e.target.value })}
                          placeholder="Enter contact number"
                        />
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="remarks-single">Remarks (optional)</Label>
                        <Input
                          id="remarks-single"
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
                  <div className="mt-4">
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
              </div>
              
              <DialogFooter>
                {sessions.length > 0 ? (
                  <Button onClick={handleSaveAllSessions} disabled={sessions.some(s => s.attendees.length === 0)}>
                    Save All Sessions
                  </Button>
                ) : (
                  <Button onClick={handleSaveSession} disabled={attendees.length === 0}>
                    Save Session
                  </Button>
                )}
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
