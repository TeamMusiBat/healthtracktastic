
import React, { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Calendar, Download, Trash2, Save, Image, Edit } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useHealthData, AwarenessSession, Attendee } from "@/contexts/HealthDataContext";
import LocationPicker from "@/components/LocationPicker";
import CamelCaseInput from "@/components/CamelCaseInput";
import DateRangePicker from "@/components/DateRangePicker";
import ImageUploader from "@/components/ImageUploader";
import AttendeeForm from "@/components/AttendeeForm";
import PendingAttendeesList from "@/components/PendingAttendeesList";
import { createJsonExport, formatDate, toCamelCase } from "@/utils/formatters";

const AwarenessSessions = () => {
  const { user } = useAuth();
  const { 
    awarenessSessions, 
    addAwarenessSession, 
    deleteAwarenessSession,
    updateAwarenessSession,
    updateChildInSession,
    getAwarenessSessionsByDateRange,
    checkDuplicateAttendee 
  } = useHealthData();
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().slice(0, 10);
  
  // Find the highest session number for today
  const getNextSessionNumber = () => {
    const todaySessions = awarenessSessions.filter(session => session.date === today);
    if (todaySessions.length === 0) return 1;
    
    const maxSessionNumber = Math.max(...todaySessions.map(session => session.sessionNumber || 1));
    return maxSessionNumber + 1;
  };
  
  // State for session form
  const [newSession, setNewSession] = useState<Partial<AwarenessSession>>({
    date: today,
    villageName: "",
    ucName: "",
    userName: user?.name || "",
    userDesignation: user?.role || "",
    sessionNumber: getNextSessionNumber(),
    attendees: [],
    children: [], // Added children array
    images: [],
  });
  
  // Update session number when date changes
  useEffect(() => {
    if (newSession.date === today) {
      setNewSession(prev => ({
        ...prev,
        sessionNumber: getNextSessionNumber()
      }));
    } else {
      // For other dates, start at 1 or keep manual input
      setNewSession(prev => ({
        ...prev,
        sessionNumber: prev.sessionNumber || 1
      }));
    }
  }, [newSession.date, awarenessSessions]);
  
  // State for bulk attendees
  const [pendingAttendees, setPendingAttendees] = useState<Partial<Attendee>[]>([]);
  
  // State for export
  const [exportStartDate, setExportStartDate] = useState<Date>(new Date());
  const [exportEndDate, setExportEndDate] = useState<Date>(new Date());
  const [exportOption, setExportOption] = useState<"today" | "range" | "all">("today");
  
  // State for dialog open/close
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // State for edit mode
  const [editingSession, setEditingSession] = useState<AwarenessSession | null>(null);
  const [editingAttendee, setEditingAttendee] = useState<Attendee | null>(null);
  
  // Handle location update
  const handleLocationUpdate = (latitude: number, longitude: number) => {
    setNewSession({
      ...newSession,
      location: { latitude, longitude },
    });
  };
  
  // Handle images change
  const handleImagesChange = (images: string[]) => {
    setNewSession({
      ...newSession,
      images: images,
    });
  };
  
  // Handle adding a new attendee
  const handleAddAttendee = (attendee: Attendee) => {
    setPendingAttendees([...pendingAttendees, attendee]);
  };
  
  // Check for duplicate attendee
  const checkDuplicate = (name: string, fatherName: string) => {
    // Check in pending attendees
    if (pendingAttendees.some(
      a => a.name?.toLowerCase() === name.toLowerCase() && 
           a.fatherHusbandName?.toLowerCase() === fatherName.toLowerCase()
    )) {
      return true;
    }
    
    // Check in database
    if (
      newSession.villageName &&
      newSession.date &&
      checkDuplicateAttendee(
        name,
        fatherName,
        newSession.villageName,
        newSession.date
      )
    ) {
      return true;
    }
    
    return false;
  };
  
  // Handle removing an attendee
  const handleRemoveAttendee = (id: string) => {
    setPendingAttendees(pendingAttendees.filter((a) => a.id !== id));
  };
  
  // Handle saving the session
  const handleSaveSession = () => {
    // Validate form
    if (!newSession.villageName || !newSession.ucName) {
      toast.error("Village name and UC name are required");
      return;
    }
    
    if (pendingAttendees.length === 0) {
      toast.error("At least one attendee is required");
      return;
    }
    
    // Format village and UC names
    const formattedVillageName = toCamelCase(newSession.villageName || "");
    const formattedUcName = toCamelCase(newSession.ucName || "");
    
    // Add session with all attendees
    addAwarenessSession({
      date: newSession.date || today,
      villageName: formattedVillageName,
      ucName: formattedUcName,
      userName: newSession.userName || user?.name || "",
      userDesignation: newSession.userDesignation || user?.role || "",
      location: newSession.location,
      children: [], // Empty children array
      attendees: pendingAttendees as Attendee[],
      createdBy: user?.username || "",
      sessionNumber: newSession.sessionNumber || 1,
      images: newSession.images,
    });
    
    // Reset form
    setNewSession({
      date: today,
      villageName: "",
      ucName: "",
      userName: user?.name || "",
      userDesignation: user?.role || "",
      sessionNumber: getNextSessionNumber(),
      attendees: [],
      children: [],
      images: [],
    });
    setPendingAttendees([]);
    setIsDialogOpen(false);
    
    toast.success("Awareness session saved successfully");
  };
  
  // Handle edit session
  const handleEditSession = (session: AwarenessSession) => {
    // Only developers and masters can edit
    if (!user || (user.role !== "developer" && user.role !== "master")) {
      toast.error("You don't have permission to edit sessions");
      return;
    }
    
    setEditingSession(session);
    setNewSession({
      date: session.date,
      villageName: session.villageName,
      ucName: session.ucName,
      userName: session.userName,
      userDesignation: session.userDesignation,
      sessionNumber: session.sessionNumber,
      images: session.images,
      location: session.location,
    });
    setPendingAttendees(session.attendees);
    setIsDialogOpen(true);
  };
  
  // Handle export
  const handleExport = () => {
    let dataToExport;
    
    if (exportOption === "today") {
      dataToExport = awarenessSessions.filter((session) => session.date === today);
    } else if (exportOption === "range") {
      dataToExport = getAwarenessSessionsByDateRange(
        exportStartDate.toISOString().slice(0, 10),
        exportEndDate.toISOString().slice(0, 10)
      );
    } else {
      dataToExport = awarenessSessions;
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
  
  // Handle date change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setNewSession({ ...newSession, date: newDate });
  };
  
  // Check if user can edit (developers and masters only)
  const canEdit = user && (user.role === "developer" || user.role === "master");
  
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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus size={16} />
                <span>Add Session</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingSession ? "Edit Awareness Session" : "Add New Awareness Session"}</DialogTitle>
                <DialogDescription>
                  {editingSession ? "Edit session details and attendees" : "Add session details and attendees"}
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
                        onChange={handleDateChange}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sessionNumber">Session Number</Label>
                    <Input
                      id="sessionNumber"
                      type="number"
                      value={newSession.sessionNumber || 1}
                      onChange={(e) => setNewSession({ ...newSession, sessionNumber: Number(e.target.value) })}
                      placeholder="Enter session number"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="villageName">Village Name</Label>
                    <CamelCaseInput
                      id="villageName"
                      defaultValue={newSession.villageName}
                      onValueChange={(value) => setNewSession({ ...newSession, villageName: value })}
                      placeholder="Enter village name"
                      autoComplete="off"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ucName">UC Name</Label>
                    <CamelCaseInput
                      id="ucName"
                      defaultValue={newSession.ucName}
                      onValueChange={(value) => setNewSession({ ...newSession, ucName: value })}
                      placeholder="Enter UC name"
                      autoComplete="off"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="userName">Conducted By</Label>
                    <Input
                      id="userName"
                      value={newSession.userName || ""}
                      onChange={(e) => setNewSession({ ...newSession, userName: e.target.value })}
                      placeholder="Conductor's full name"
                      disabled={!canEdit}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="userDesignation">Designation</Label>
                    <Input
                      id="userDesignation"
                      value={newSession.userDesignation || ""}
                      onChange={(e) => setNewSession({ ...newSession, userDesignation: e.target.value })}
                      placeholder="Conductor's designation"
                      disabled={!canEdit}
                    />
                  </div>
                </div>
                
                {/* Location and Image Upload */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <LocationPicker
                      onLocationChange={handleLocationUpdate}
                      initialLatitude={newSession.location?.latitude}
                      initialLongitude={newSession.location?.longitude}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <ImageUploader 
                      onImagesChange={handleImagesChange}
                      initialImages={newSession.images}
                    />
                  </div>
                </div>
                
                {/* Add Attendee Form */}
                <div className="border p-4 rounded-md">
                  <AttendeeForm 
                    onAddAttendee={handleAddAttendee}
                    checkDuplicate={checkDuplicate}
                    userName={newSession.userName}
                    userDesignation={newSession.userDesignation}
                  />
                </div>
                
                {/* Pending Attendees List */}
                <div className="border p-4 rounded-md">
                  <h3 className="text-lg font-medium mb-2">Pending Attendees ({pendingAttendees.length})</h3>
                  <PendingAttendeesList 
                    attendees={pendingAttendees}
                    onRemove={handleRemoveAttendee}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  onClick={handleSaveSession} 
                  disabled={pendingAttendees.length === 0}
                  className="flex items-center gap-2"
                >
                  <Save size={16} />
                  <span>{editingSession ? "Update Session" : "Save Session"}</span>
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
          {awarenessSessions.length > 0 ? (
            <div className="rounded-md border">
              <div className="grid grid-cols-8 gap-4 p-4 font-medium border-b">
                <div className="col-span-2">Details</div>
                <div className="col-span-1">Date</div>
                <div className="col-span-1">Session #</div>
                <div className="col-span-1">Conducted By</div>
                <div className="col-span-1">Location</div>
                <div className="col-span-1">Attendees</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>
              
              <div className="divide-y">
                {awarenessSessions.map((session) => (
                  <div key={session.id} className="grid grid-cols-8 gap-4 p-4 items-center">
                    <div className="col-span-2">
                      <p className="font-medium">{session.villageName}</p>
                      <p className="text-sm text-gray-500">UC: {session.ucName}</p>
                    </div>
                    <div className="col-span-1">
                      {formatDate(session.date)}
                    </div>
                    <div className="col-span-1">
                      {session.sessionNumber || 1}
                    </div>
                    <div className="col-span-1">
                      <p className="text-sm">{session.userName}</p>
                      <p className="text-xs text-gray-500">{session.userDesignation}</p>
                    </div>
                    <div className="col-span-1">
                      {session.location ? (
                        <a 
                          href={`https://www.google.com/maps?q=${session.location.latitude},${session.location.longitude}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:underline"
                        >
                          View on map
                        </a>
                      ) : (
                        <span className="text-xs text-gray-500">No location</span>
                      )}
                    </div>
                    <div className="col-span-1">
                      {session.attendees.length}
                    </div>
                    <div className="col-span-1 flex justify-end gap-2">
                      {canEdit && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditSession(session)}
                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteAwarenessSession(session.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </>
                      )}
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
          {awarenessSessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {awarenessSessions.map((session) => (
                <Card key={session.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{session.villageName}</CardTitle>
                        <CardDescription>UC: {session.ucName}</CardDescription>
                      </div>
                      {canEdit && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditSession(session)}
                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 h-8 w-8"
                          >
                            <Edit size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteAwarenessSession(session.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Date:</span>
                        <span>{formatDate(session.date)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Session #:</span>
                        <span>{session.sessionNumber || 1}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Conducted by:</span>
                        <span>{session.userName}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Designation:</span>
                        <span>{session.userDesignation}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Attendees:</span>
                        <span>{session.attendees.length}</span>
                      </div>
                      {session.location && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Location:</span>
                          <a 
                            href={`https://www.google.com/maps?q=${session.location.latitude},${session.location.longitude}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            View on map
                          </a>
                        </div>
                      )}
                      {session.images && session.images.length > 0 && (
                        <div className="mt-2">
                          <span className="text-gray-500 block mb-1">Images:</span>
                          <div className="grid grid-cols-3 gap-1">
                            {session.images.slice(0, 3).map((image, index) => (
                              <img 
                                key={index}
                                src={image} 
                                alt={`Session ${index + 1}`}
                                className="w-full h-16 object-cover rounded"
                              />
                            ))}
                            {session.images.length > 3 && (
                              <div className="flex items-center justify-center bg-gray-100 rounded h-16">
                                <span className="text-sm text-gray-500">+{session.images.length - 3} more</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
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
