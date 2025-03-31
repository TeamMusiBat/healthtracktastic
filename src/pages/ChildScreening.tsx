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
  CardFooter,
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Plus, 
  Calendar, 
  Download, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2,
  AlertCircle,
  Filter
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useHealthData, ChildScreening, ScreenedChild, VaccineStatus } from "@/contexts/HealthDataContext";
import LocationPicker from "@/components/LocationPicker";
import CamelCaseInput from "@/components/CamelCaseInput";
import DateRangePicker from "@/components/DateRangePicker";
import { createJsonExport, formatDate, getDobFromMonths, getMuacStatus, toCamelCase } from "@/utils/formatters";

const ChildScreeningPage = () => {
  const { user } = useAuth();
  const { 
    childScreenings, 
    addChildScreening, 
    deleteChildScreening,
    getChildScreeningsByDateRange,
    getChildScreeningsByStatus,
    checkDuplicateChild 
  } = useHealthData();
  
  // State for screening form
  const [newScreening, setNewScreening] = useState<Partial<ChildScreening>>({
    date: new Date().toISOString().slice(0, 10),
    villageName: "",
    ucName: "",
    userName: user?.name || "",
    userDesignation: user?.role || "",
    children: [],
  });
  
  // State for child form
  const [newChild, setNewChild] = useState<Partial<ScreenedChild>>({
    name: "",
    fatherName: "",
    age: 6, // Default to 6 months
    muac: 12.5, // Default to normal
    gender: "male",
    vaccination: "0-Dose",
    vaccineDue: false,
    remarks: "",
    status: "Normal", // Will be calculated based on MUAC
  });
  
  // State for bulk children
  const [children, setChildren] = useState<Partial<ScreenedChild>[]>([]);
  
  // State for export
  const [exportStartDate, setExportStartDate] = useState<Date>(new Date());
  const [exportEndDate, setExportEndDate] = useState<Date>(new Date());
  const [exportOption, setExportOption] = useState<"today" | "range" | "all">("today");
  const [exportStatus, setExportStatus] = useState<"all" | "SAM" | "MAM" | "Normal">("all");
  
  // State for filtering
  const [statusFilter, setStatusFilter] = useState<"all" | "SAM" | "MAM" | "Normal">("all");
  
  // Handle location update
  const handleLocationUpdate = (latitude: number, longitude: number) => {
    setNewScreening({
      ...newScreening,
      location: { latitude, longitude },
    });
  };
  
  // Handle MUAC change and update status
  const handleMuacChange = (value: string) => {
    const muac = parseFloat(value);
    const status = getMuacStatus(muac);
    
    setNewChild({
      ...newChild,
      muac,
      status,
    });
  };
  
  // Handle adding a new child to the bulk list
  const handleAddChild = () => {
    // Validate form
    if (!newChild.name || !newChild.fatherName) {
      toast.error("Name and Father Name are required");
      return;
    }
    
    if (newChild.age! < 6 || newChild.age! > 59) {
      toast.error("Age must be between 6 and 59 months");
      return;
    }
    
    // Format names (camelcase)
    const formattedName = toCamelCase(newChild.name || "");
    const formattedFatherName = toCamelCase(newChild.fatherName || "");
    
    // Check for duplicate
    if (
      newScreening.villageName &&
      newScreening.date &&
      checkDuplicateChild(
        formattedName,
        formattedFatherName,
        newScreening.villageName,
        newScreening.date
      )
    ) {
      toast.warning("This child already exists for this screening and village");
      return;
    }
    
    // Add to bulk list
    const newChildWithId: Partial<ScreenedChild> = {
      ...newChild,
      id: Date.now().toString(),
      name: formattedName,
      fatherName: formattedFatherName,
      dob: newChild.age ? getDobFromMonths(newChild.age) : undefined,
      status: getMuacStatus(newChild.muac!),
    };
    
    setChildren([...children, newChildWithId]);
    
    // Reset form
    setNewChild({
      name: "",
      fatherName: "",
      age: 6,
      muac: 12.5,
      gender: "male",
      vaccination: "0-Dose",
      vaccineDue: false,
      remarks: "",
      status: "Normal",
    });
    
    toast.success("Child added to screening");
  };
  
  // Handle removing a child from the bulk list
  const handleRemoveChild = (id: string) => {
    setChildren(children.filter((c) => c.id !== id));
  };
  
  // Handle saving the entire screening
  const handleSaveScreening = () => {
    // Validate form
    if (!newScreening.villageName || !newScreening.ucName || children.length === 0) {
      toast.error("Village name, UC name, and at least one child are required");
      return;
    }
    
    // Format village and UC names
    const formattedVillageName = toCamelCase(newScreening.villageName || "");
    const formattedUcName = toCamelCase(newScreening.ucName || "");
    
    // Add screening with all children
    addChildScreening({
      date: newScreening.date || new Date().toISOString().slice(0, 10),
      villageName: formattedVillageName,
      ucName: formattedUcName,
      userName: newScreening.userName || user?.name || "",
      userDesignation: newScreening.userDesignation || user?.role || "",
      location: newScreening.location,
      children: children as ScreenedChild[],
      createdBy: user?.username || "",
    });
    
    // Reset form
    setNewScreening({
      date: new Date().toISOString().slice(0, 10),
      villageName: "",
      ucName: "",
      userName: user?.name || "",
      userDesignation: user?.role || "",
      children: [],
    });
    setChildren([]);
    
    toast.success("Child screening saved successfully");
  };
  
  // Handle export
  const handleExport = () => {
    let dataToExport;
    
    // First filter by date
    if (exportOption === "today") {
      const today = new Date().toISOString().slice(0, 10);
      dataToExport = childScreenings.filter((screening) => screening.date === today);
    } else if (exportOption === "range") {
      dataToExport = getChildScreeningsByDateRange(
        exportStartDate.toISOString().slice(0, 10),
        exportEndDate.toISOString().slice(0, 10)
      );
    } else {
      dataToExport = childScreenings;
    }
    
    // Then filter by status if needed
    if (exportStatus !== "all") {
      // We need to filter the children in each screening
      dataToExport = dataToExport.map(screening => {
        return {
          ...screening,
          children: screening.children.filter(child => child.status === exportStatus)
        };
      }).filter(screening => screening.children.length > 0);
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
  
  // Filter screenings by status
  const filteredScreenings = statusFilter === "all" 
    ? childScreenings 
    : childScreenings.map(screening => {
        return {
          ...screening,
          children: screening.children.filter(child => child.status === statusFilter)
        };
      }).filter(screening => screening.children.length > 0);
  
  // Get status classes
  const getStatusClass = (status: "SAM" | "MAM" | "Normal") => {
    if (status === "SAM") return "sam-row";
    if (status === "MAM") return "mam-row";
    return "normal-row";
  };
  
  // Get status badge
  const getStatusBadge = (status: "SAM" | "MAM" | "Normal") => {
    if (status === "SAM") return <span className="status-badge status-badge-sam">SAM</span>;
    if (status === "MAM") return <span className="status-badge status-badge-mam">MAM</span>;
    return <span className="status-badge status-badge-normal">Normal</span>;
  };
  
  // Get vaccine badge
  const getVaccineBadge = (vaccination: VaccineStatus, vaccineDue: boolean) => {
    return (
      <div className="flex items-center gap-2">
        <span className={`vaccine-badge ${vaccineDue ? 'vaccine-due' : 'vaccine-complete'}`}>
          {vaccination}
        </span>
        {vaccineDue && <AlertTriangle size={14} className="text-yellow-500" />}
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Child Screening</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Today: {new Date().toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus size={16} />
                <span>Add Screening</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Add New Child Screening</DialogTitle>
                <DialogDescription>
                  Add details and children for a new health screening session.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Screening Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                      <Input
                        id="date"
                        type="date"
                        className="pl-10"
                        value={newScreening.date}
                        onChange={(e) => setNewScreening({ ...newScreening, date: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="villageName">Village Name</Label>
                    <CamelCaseInput
                      id="villageName"
                      defaultValue={newScreening.villageName}
                      onValueChange={(value) => setNewScreening({ ...newScreening, villageName: value })}
                      placeholder="Enter village name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ucName">UC Name</Label>
                    <CamelCaseInput
                      id="ucName"
                      defaultValue={newScreening.ucName}
                      onValueChange={(value) => setNewScreening({ ...newScreening, ucName: value })}
                      placeholder="Enter UC name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="userName">User Name</Label>
                    <CamelCaseInput
                      id="userName"
                      defaultValue={newScreening.userName}
                      onValueChange={(value) => setNewScreening({ ...newScreening, userName: value })}
                      placeholder="Enter user name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="userDesignation">User Designation</Label>
                    <Select
                      onValueChange={(value) => setNewScreening({ ...newScreening, userDesignation: value })}
                      defaultValue={newScreening.userDesignation}
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
                      initialLatitude={newScreening.location?.latitude}
                      initialLongitude={newScreening.location?.longitude}
                    />
                  </div>
                </div>
                
                {/* Add Child Form */}
                <div className="border p-4 rounded-md">
                  <h3 className="text-lg font-medium mb-4">Add Child</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="childName">Name</Label>
                      <CamelCaseInput
                        id="childName"
                        defaultValue={newChild.name}
                        onValueChange={(value) => setNewChild({ ...newChild, name: value })}
                        placeholder="Enter child name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="fatherName">Father Name</Label>
                      <CamelCaseInput
                        id="fatherName"
                        defaultValue={newChild.fatherName}
                        onValueChange={(value) => setNewChild({ ...newChild, fatherName: value })}
                        placeholder="Enter father name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="age">Age (months, 6-59)</Label>
                      <Input
                        id="age"
                        type="number"
                        min={6}
                        max={59}
                        value={newChild.age || ""}
                        onChange={(e) => setNewChild({ ...newChild, age: Number(e.target.value) })}
                        placeholder="Enter age in months"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        onValueChange={(value: "male" | "female" | "other") => setNewChild({ ...newChild, gender: value })}
                        defaultValue={newChild.gender}
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
                      <Label htmlFor="muac">MUAC (cm)</Label>
                      <Input
                        id="muac"
                        type="number"
                        step="0.1"
                        value={newChild.muac || ""}
                        onChange={(e) => handleMuacChange(e.target.value)}
                        placeholder="Enter MUAC in cm"
                        className={`border-2 ${
                          newChild.status === "SAM"
                            ? "border-health-sam"
                            : newChild.status === "MAM"
                            ? "border-health-mam"
                            : "border-health-normal"
                        }`}
                      />
                      <div className="flex items-center mt-1 gap-2">
                        <div className="flex-1 text-xs">
                          {newChild.status === "SAM" && (
                            <span className="text-health-sam">SAM: MUAC ≤ 11 cm</span>
                          )}
                          {newChild.status === "MAM" && (
                            <span className="text-health-mam">MAM: MUAC ≤ 12 cm</span>
                          )}
                          {newChild.status === "Normal" && (
                            <span className="text-health-normal">Normal: MUAC {'>'}12 cm</span>
                          )}
                        </div>
                        {getStatusBadge(newChild.status as "SAM" | "MAM" | "Normal")}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="vaccination">Vaccination Status</Label>
                      <Select
                        onValueChange={(value: VaccineStatus) => setNewChild({ ...newChild, vaccination: value })}
                        defaultValue={newChild.vaccination}
                      >
                        <SelectTrigger id="vaccination">
                          <SelectValue placeholder="Select vaccination status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0-Dose">0-Dose</SelectItem>
                          <SelectItem value="1st-Dose">1st-Dose</SelectItem>
                          <SelectItem value="2nd-Dose">2nd-Dose</SelectItem>
                          <SelectItem value="3rd-Dose">3rd-Dose</SelectItem>
                          <SelectItem value="MR-1">MR-1</SelectItem>
                          <SelectItem value="MR-2">MR-2</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2 flex items-center">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="vaccineDue"
                          checked={newChild.vaccineDue}
                          onCheckedChange={(checked) => setNewChild({ ...newChild, vaccineDue: checked as boolean })}
                        />
                        <Label htmlFor="vaccineDue">Vaccine Due</Label>
                      </div>
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="remarks">Remarks (optional)</Label>
                      <Input
                        id="remarks"
                        value={newChild.remarks || ""}
                        onChange={(e) => setNewChild({ ...newChild, remarks: e.target.value })}
                        placeholder="Enter remarks"
                      />
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleAddChild}
                    className="mt-4"
                  >
                    Add Child
                  </Button>
                </div>
                
                {/* Children List */}
                <div>
                  <h3 className="text-lg font-medium mb-2">Children ({children.length})</h3>
                  
                  {children.length > 0 ? (
                    <div className="border rounded-md divide-y">
                      {children.map((child) => (
                        <div 
                          key={child.id} 
                          className={`p-3 flex justify-between items-center ${getStatusClass(child.status as "SAM" | "MAM" | "Normal")}`}
                        >
                          <div>
                            <p className="font-medium">{child.name}</p>
                            <p className="text-sm text-gray-500">
                              Father: {child.fatherName} | Age: {child.age} months | MUAC: {child.muac} cm
                            </p>
                            <div className="text-sm mt-1">
                              {getVaccineBadge(child.vaccination as VaccineStatus, child.vaccineDue as boolean)}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {getStatusBadge(child.status as "SAM" | "MAM" | "Normal")}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveChild(child.id!)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No children added yet</p>
                  )}
                </div>
              </div>
              
              <DialogFooter>
                <Button onClick={handleSaveScreening} disabled={children.length === 0}>
                  Save Screening
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
                <DialogTitle>Export Child Screenings</DialogTitle>
                <DialogDescription>
                  Export screening data as JSON file.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Date Options</Label>
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
                
                <div className="space-y-2">
                  <Label>Status Filter</Label>
                  <div className="grid grid-cols-4 gap-2">
                    <Button
                      variant={exportStatus === "all" ? "default" : "outline"}
                      onClick={() => setExportStatus("all")}
                      className="w-full"
                    >
                      All
                    </Button>
                    <Button
                      variant={exportStatus === "SAM" ? "default" : "outline"}
                      onClick={() => setExportStatus("SAM")}
                      className="w-full bg-health-sam text-white"
                    >
                      SAM
                    </Button>
                    <Button
                      variant={exportStatus === "MAM" ? "default" : "outline"}
                      onClick={() => setExportStatus("MAM")}
                      className="w-full bg-health-mam text-white"
                    >
                      MAM
                    </Button>
                    <Button
                      variant={exportStatus === "Normal" ? "default" : "outline"}
                      onClick={() => setExportStatus("Normal")}
                      className="w-full bg-health-normal text-white"
                    >
                      Normal
                    </Button>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button onClick={handleExport}>Export</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter size={16} />
                <span>Filter</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Filter Screenings</DialogTitle>
                <DialogDescription>
                  Filter children by nutritional status.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Status Filter</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <Button
                      variant={statusFilter === "all" ? "default" : "outline"}
                      onClick={() => setStatusFilter("all")}
                      className="w-full"
                    >
                      All
                    </Button>
                    <Button
                      variant={statusFilter === "SAM" ? "default" : "outline"}
                      onClick={() => setStatusFilter("SAM")}
                      className="w-full bg-health-sam text-white"
                    >
                      SAM
                    </Button>
                    <Button
                      variant={statusFilter === "MAM" ? "default" : "outline"}
                      onClick={() => setStatusFilter("MAM")}
                      className="w-full bg-health-mam text-white"
                    >
                      MAM
                    </Button>
                    <Button
                      variant={statusFilter === "Normal" ? "default" : "outline"}
                      onClick={() => setStatusFilter("Normal")}
                      className="w-full bg-health-normal text-white"
                    >
                      Normal
                    </Button>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button onClick={() => toast.success(`Filtered to ${statusFilter} cases`)}>Apply Filter</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Status Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-red-50 border-health-sam">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertCircle size={18} className="text-health-sam" />
              <span>SAM Cases</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {childScreenings.reduce((count, screening) => {
                return count + screening.children.filter(child => child.status === "SAM").length;
              }, 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-50 border-health-mam">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle size={18} className="text-health-mam" />
              <span>MAM Cases</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {childScreenings.reduce((count, screening) => {
                return count + screening.children.filter(child => child.status === "MAM").length;
              }, 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-health-normal">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle2 size={18} className="text-health-normal" />
              <span>Normal Cases</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {childScreenings.reduce((count, screening) => {
                return count + screening.children.filter(child => child.status === "Normal").length;
              }, 0)}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Status filter indicator */}
      {statusFilter !== "all" && (
        <Alert className={`
          ${statusFilter === "SAM" ? "bg-red-50 border-health-sam" : 
            statusFilter === "MAM" ? "bg-yellow-50 border-health-mam" : 
            "bg-green-50 border-health-normal"}
        `}>
          <AlertTitle className="flex items-center gap-2">
            {statusFilter === "SAM" && <AlertCircle size={18} className="text-health-sam" />}
            {statusFilter === "MAM" && <AlertTriangle size={18} className="text-health-mam" />}
            {statusFilter === "Normal" && <CheckCircle2 size={18} className="text-health-normal" />}
            Filtering: {statusFilter} Cases
          </AlertTitle>
          <AlertDescription>
            Showing only children with {statusFilter} nutritional status.
            <Button 
              variant="link" 
              className="p-0 h-auto ml-2" 
              onClick={() => setStatusFilter("all")}
            >
              Clear filter
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Screenings List */}
      <Tabs defaultValue="table">
        <TabsList>
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="cards">Card View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="table" className="space-y-4">
          {filteredScreenings.length > 0 ? (
            <div className="rounded-md border overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Father's Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Village
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Age
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      MUAC
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vaccination
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredScreenings.flatMap((screening) =>
                    screening.children.map((child) => (
                      <tr key={child.id} className={getStatusClass(child.status)}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium">{child.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {child.fatherName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {screening.villageName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {child.age} months
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {child.muac} cm
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(child.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getVaccineBadge(child.vaccination, child.vaccineDue)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex justify-center items-center h-40">
              <p className="text-gray-500">No child screenings found</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="cards" className="space-y-4">
          {filteredScreenings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredScreenings.flatMap((screening) =>
                screening.children.map((child) => (
                  <Card key
