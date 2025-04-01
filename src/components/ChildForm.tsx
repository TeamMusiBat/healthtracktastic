
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import CamelCaseInput from "@/components/CamelCaseInput";
import { ScreenedChild, VaccineStatus } from "@/contexts/HealthDataContext";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

interface ChildFormProps {
  onAddChild: (child: ScreenedChild) => void;
  checkDuplicate?: (name: string, fatherName: string) => boolean;
}

const ChildForm: React.FC<ChildFormProps> = ({ onAddChild, checkDuplicate }) => {
  const initialChildState: Partial<ScreenedChild> = {
    name: "",
    fatherName: "",
    age: 0,
    muac: 0,
    gender: "male",
    vaccination: "0-Dose" as VaccineStatus,
    vaccineDue: false,
    remarks: "",
    status: "Normal",
    belongsToSameUC: true,
  };
  
  const [newChild, setNewChild] = useState<Partial<ScreenedChild>>(initialChildState);
  const [otherAddress, setOtherAddress] = useState<string>("");
  const [selectedDob, setSelectedDob] = useState<Date | undefined>(undefined);
  
  const handleAddChild = () => {
    // Validation
    if (!newChild.name || !newChild.fatherName) {
      toast.error("Name and Father Name are required");
      return;
    }
    
    if (newChild.age <= 0) {
      toast.error("Age must be greater than 0");
      return;
    }
    
    if (newChild.muac <= 0) {
      toast.error("MUAC must be greater than 0");
      return;
    }
    
    // Check for duplicates if function is provided
    if (checkDuplicate && checkDuplicate(newChild.name, newChild.fatherName)) {
      toast.error("This child has already been added");
      return;
    }
    
    // Create full child with all required fields
    const fullChild: ScreenedChild = {
      id: `child-${Date.now()}`,
      name: newChild.name,
      fatherName: newChild.fatherName,
      age: newChild.age,
      muac: newChild.muac,
      gender: newChild.gender as "male" | "female" | "other",
      vaccination: newChild.vaccination as VaccineStatus,
      vaccineDue: newChild.vaccineDue,
      remarks: newChild.remarks || "",
      status: newChild.status as "SAM" | "MAM" | "Normal",
      belongsToSameUC: newChild.belongsToSameUC,
      // Only add otherLocation if belongsToSameUC is false
      ...((!newChild.belongsToSameUC && otherAddress) ? { otherLocation: otherAddress } : {}),
      // Add DOB if selected
      ...(selectedDob ? { dob: format(selectedDob, 'dd/MM/yyyy') } : {})
    };
    
    onAddChild(fullChild);
    
    // Reset only name and father name fields as requested
    setNewChild({
      ...newChild,
      name: "",
      fatherName: "",
    });
    
    toast.success("Child added successfully");
    
    // Reset only name and father name input elements to clear autocomplete
    const nameInputs = document.querySelectorAll('input[name="childName"], input[name="fatherName"]');
    nameInputs.forEach((input: any) => {
      input.value = "";
    });
  };
  
  const getMuacClass = () => {
    if (newChild.muac < 11.5) return "bg-red-100 border-red-300";
    if (newChild.muac >= 11.5 && newChild.muac < 12.5) return "bg-yellow-100 border-yellow-300";
    return "bg-green-100 border-green-300";
  };

  const handleDobChange = (date: Date | undefined) => {
    setSelectedDob(date);
    if (date) {
      // Calculate age in months
      const today = new Date();
      const birthDate = new Date(date);
      const months = (today.getFullYear() - birthDate.getFullYear()) * 12 + 
                    (today.getMonth() - birthDate.getMonth());
      
      setNewChild({...newChild, age: months});
    }
  };
  
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <h3 className="text-lg font-semibold">Add New Child</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="childName">Name</Label>
          <CamelCaseInput
            id="childName"
            name="childName"
            placeholder="Child's Full Name"
            defaultValue={newChild.name}
            onValueChange={(value) => setNewChild({...newChild, name: value})}
            autoComplete="off"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="fatherName">Father Name</Label>
          <CamelCaseInput
            id="fatherName"
            name="fatherName"
            placeholder="Father's Name"
            defaultValue={newChild.fatherName}
            onValueChange={(value) => setNewChild({...newChild, fatherName: value})}
            autoComplete="off"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="childDob">Date of Birth (Optional)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDob && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDob ? format(selectedDob, "dd/MM/yyyy") : <span>Select DOB</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDob}
                onSelect={handleDobChange}
                initialFocus
                disabled={(date) => date > new Date()}
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="childAge">Age (Months)</Label>
          <Input
            id="childAge"
            name="childAge"
            type="number"
            min={0}
            max={60}
            value={newChild.age || ""}
            onChange={(e) => setNewChild({...newChild, age: parseInt(e.target.value) || 0})}
            autoComplete="off"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="childGender">Gender</Label>
          <select
            id="childGender"
            name="childGender"
            className="w-full px-3 py-2 border rounded-md"
            value={newChild.gender}
            onChange={(e) => setNewChild({...newChild, gender: e.target.value as "male" | "female" | "other"})}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="muac">MUAC (cm)</Label>
          <Input
            id="muac"
            name="muac"
            type="number"
            step="0.1"
            min={0}
            className={getMuacClass()}
            value={newChild.muac || ""}
            onChange={(e) => {
              const muac = parseFloat(e.target.value) || 0;
              let status: "SAM" | "MAM" | "Normal" = "Normal";
              if (muac < 11.5) status = "SAM";
              else if (muac < 12.5) status = "MAM";
              
              setNewChild({
                ...newChild, 
                muac, 
                status
              });
            }}
            autoComplete="off"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Vaccination Status</Label>
        <select
          id="vaccinationStatus"
          name="vaccinationStatus"
          className="w-full px-3 py-2 border rounded-md"
          value={newChild.vaccination}
          onChange={(e) => setNewChild({...newChild, vaccination: e.target.value as VaccineStatus})}
        >
          <option value="0-Dose">0-Dose</option>
          <option value="1st-Dose">1st-Dose</option>
          <option value="2nd-Dose">2nd-Dose</option>
          <option value="3rd-Dose">3rd-Dose</option>
          <option value="MR-1">MR-1</option>
          <option value="MR-2">MR-2</option>
          <option value="Completed">Completed</option>
        </select>
        
        <div className="flex items-center space-x-2 pt-2">
          <Switch 
            id="vaccineDue" 
            checked={newChild.vaccineDue} 
            onCheckedChange={(checked) => setNewChild({...newChild, vaccineDue: checked})} 
          />
          <Label htmlFor="vaccineDue">Vaccine Due</Label>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="childBelongsToSameUC">Kid Belongs From Same Address</Label>
          <Switch 
            id="childBelongsToSameUC"
            checked={newChild.belongsToSameUC}
            onCheckedChange={(checked) => setNewChild({...newChild, belongsToSameUC: checked})}
          />
        </div>
        
        {!newChild.belongsToSameUC && (
          <div className="pt-2">
            <Label htmlFor="childOtherAddress">Specify Location</Label>
            <Input
              id="childOtherAddress"
              name="childOtherAddress"
              placeholder="Village, UC, Tehsil, District"
              value={otherAddress}
              onChange={(e) => setOtherAddress(e.target.value)}
              autoComplete="off"
            />
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="childRemarks">Remarks</Label>
        <Textarea
          id="childRemarks"
          name="childRemarks"
          placeholder="Any additional information"
          value={newChild.remarks || ""}
          onChange={(e) => setNewChild({...newChild, remarks: e.target.value})}
          autoComplete="off"
        />
      </div>
      
      <Button onClick={handleAddChild} className="w-full">
        Add Child
      </Button>
    </div>
  );
};

export default ChildForm;
