
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import CamelCaseInput from "@/components/CamelCaseInput";
import { Attendee } from "@/contexts/HealthDataContext";
import { toast } from "sonner";
import { format } from "date-fns";

interface AttendeeFormProps {
  onAddAttendee: (attendee: Attendee) => void;
  checkDuplicate?: (name: string, fatherName: string) => boolean;
  userName?: string;
  userDesignation?: string;
}

const AttendeeForm: React.FC<AttendeeFormProps> = ({ 
  onAddAttendee, 
  checkDuplicate,
  userName,
  userDesignation 
}) => {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const fatherInputRef = useRef<HTMLInputElement>(null);

  const initialAttendeeState: Partial<Attendee> = {
    name: "",
    fatherHusbandName: "",
    age: 0,
    dob: "",
    gender: "male",
    underFiveChildren: 0,
    contactNumber: "",
    remarks: "",
    belongsToSameUC: true,
    vaccination: "none", // Default vaccination status
    vaccineDue: false,
    conductedBy: userName || "",
    designation: userDesignation || ""
  };
  
  const [newAttendee, setNewAttendee] = useState<Partial<Attendee>>(initialAttendeeState);
  const [otherAddress, setOtherAddress] = useState<string>("");
  const [showVaccinationDetails, setShowVaccinationDetails] = useState<boolean>(false);
  
  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dobValue = e.target.value;
    setNewAttendee({...newAttendee, dob: dobValue});
    
    // Calculate age in years from DOB
    if (dobValue) {
      try {
        const dobDate = new Date(dobValue);
        const today = new Date();
        let age = today.getFullYear() - dobDate.getFullYear();
        const monthDiff = today.getMonth() - dobDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
          age--;
        }
        setNewAttendee(prev => ({...prev, age: age}));
      } catch (error) {
        console.error("Invalid date format", error);
      }
    }
  };
  
  const handleChildrenCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = parseInt(e.target.value) || 0;
    setNewAttendee({...newAttendee, underFiveChildren: count});
    setShowVaccinationDetails(count > 0);
  };
  
  const resetForm = () => {
    // Only reset name and father name
    if (nameInputRef.current) nameInputRef.current.value = "";
    if (fatherInputRef.current) fatherInputRef.current.value = "";
    
    setNewAttendee(prev => ({
      ...prev,
      name: "",
      fatherHusbandName: "",
    }));
  };
  
  const handleAddAttendee = () => {
    // Validation
    if (!newAttendee.name || !newAttendee.fatherHusbandName) {
      toast.error("Name and Father/Husband Name are required");
      return;
    }
    
    if (newAttendee.age <= 0 && !newAttendee.dob) {
      toast.error("Either Age or Date of Birth must be provided");
      return;
    }
    
    // Validate DOB format if provided
    if (newAttendee.dob && !/^\d{4}-\d{2}-\d{2}$/.test(newAttendee.dob)) {
      toast.error("Date of Birth must be in YYYY-MM-DD format");
      return;
    }
    
    // Check for duplicates if function is provided
    if (checkDuplicate && checkDuplicate(newAttendee.name, newAttendee.fatherHusbandName)) {
      toast.error("This person has already been added");
      return;
    }
    
    // Create full attendee with all required fields
    const fullAttendee: Attendee = {
      id: `attendee-${Date.now()}`,
      name: newAttendee.name,
      fatherHusbandName: newAttendee.fatherHusbandName,
      age: newAttendee.age || 0,
      dob: newAttendee.dob || "",
      gender: newAttendee.gender as "male" | "female" | "other",
      underFiveChildren: newAttendee.underFiveChildren || 0,
      contactNumber: newAttendee.contactNumber || "",
      remarks: newAttendee.remarks || "",
      belongsToSameUC: newAttendee.belongsToSameUC,
      vaccination: showVaccinationDetails ? (newAttendee.vaccination as VaccineStatus) : "none",
      vaccineDue: showVaccinationDetails ? (newAttendee.vaccineDue || false) : false,
      conductedBy: newAttendee.conductedBy || userName || "",
      designation: newAttendee.designation || userDesignation || "",
      // Only add address if belongsToSameUC is false
      ...((!newAttendee.belongsToSameUC && otherAddress) ? { address: otherAddress } : {})
    };
    
    onAddAttendee(fullAttendee);
    
    // Reset only name and father name fields
    resetForm();
    
    toast.success("Attendee added successfully");
  };
  
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <h3 className="text-lg font-semibold">Add New Attendee</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <CamelCaseInput
            id="name"
            name="name"
            placeholder="Full Name"
            defaultValue=""
            onValueChange={(value) => setNewAttendee({...newAttendee, name: value})}
            autoComplete="off"
            ref={nameInputRef}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="fatherHusbandName">Father/Husband Name</Label>
          <CamelCaseInput
            id="fatherHusbandName"
            name="fatherHusbandName"
            placeholder="Father or Husband Name"
            defaultValue=""
            onValueChange={(value) => setNewAttendee({...newAttendee, fatherHusbandName: value})}
            autoComplete="off"
            ref={fatherInputRef}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="age">Age (Years)</Label>
          <Input
            id="age"
            name="age"
            type="number"
            min={1}
            value={newAttendee.age || ""}
            onChange={(e) => setNewAttendee({...newAttendee, age: parseInt(e.target.value) || 0})}
            autoComplete="off"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="dob">Date of Birth (Optional)</Label>
          <Input
            id="dob"
            name="dob"
            type="date"
            value={newAttendee.dob || ""}
            onChange={handleDobChange}
            autoComplete="off"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <select
            id="gender"
            name="gender"
            className="w-full px-3 py-2 border rounded-md"
            value={newAttendee.gender}
            onChange={(e) => setNewAttendee({...newAttendee, gender: e.target.value as "male" | "female" | "other"})}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="underFiveChildren">Children (Under 5 Years)</Label>
          <Input
            id="underFiveChildren"
            name="underFiveChildren"
            type="number"
            min={0}
            value={newAttendee.underFiveChildren || ""}
            onChange={handleChildrenCountChange}
            autoComplete="off"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="contactNumber">Contact Number (Optional)</Label>
          <Input
            id="contactNumber"
            name="contactNumber"
            placeholder="Phone number (optional)"
            value={newAttendee.contactNumber || ""}
            onChange={(e) => setNewAttendee({...newAttendee, contactNumber: e.target.value})}
            autoComplete="off"
          />
        </div>
      </div>
      
      {showVaccinationDetails && (
        <div className="p-3 border rounded-md bg-muted/20">
          <h4 className="font-medium mb-2">Vaccination Status</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vaccination">Vaccination Status</Label>
              <RadioGroup 
                defaultValue={newAttendee.vaccination || "0-Dose"}
                onValueChange={(value) => setNewAttendee({...newAttendee, vaccination: value as VaccineStatus})}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0-Dose" id="0-Dose" />
                  <Label htmlFor="0-Dose">0-Dose</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1st-Dose" id="1st-Dose" />
                  <Label htmlFor="1st-Dose">1st-Dose</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2nd-Dose" id="2nd-Dose" />
                  <Label htmlFor="2nd-Dose">2nd-Dose</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3rd-Dose" id="3rd-Dose" />
                  <Label htmlFor="3rd-Dose">3rd-Dose</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="MR-1" id="MR-1" />
                  <Label htmlFor="MR-1">MR-1</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="vaccineDue" 
                  checked={newAttendee.vaccineDue}
                  onCheckedChange={(checked) => 
                    setNewAttendee({...newAttendee, vaccineDue: checked as boolean})
                  }
                />
                <Label htmlFor="vaccineDue">Vaccine Due</Label>
              </div>
              {newAttendee.vaccineDue && (
                <div className="text-sm text-amber-600 mt-1">
                  Note: Image of session with child's card will be required
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="belongsToSameUC">Person Belongs From Same Address</Label>
          <Switch 
            id="belongsToSameUC"
            name="belongsToSameUC"
            checked={newAttendee.belongsToSameUC}
            onCheckedChange={(checked) => setNewAttendee({...newAttendee, belongsToSameUC: checked})}
          />
        </div>
        
        {!newAttendee.belongsToSameUC && (
          <div className="pt-2">
            <Label htmlFor="otherAddress">Specify Location</Label>
            <Input
              id="otherAddress"
              name="otherAddress"
              placeholder="Village, UC, Tehsil, District"
              value={otherAddress}
              onChange={(e) => setOtherAddress(e.target.value)}
              autoComplete="off"
            />
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="remarks">Remarks</Label>
        <Textarea
          id="remarks"
          name="remarks"
          placeholder="Any additional information"
          value={newAttendee.remarks || ""}
          onChange={(e) => setNewAttendee({...newAttendee, remarks: e.target.value})}
          autoComplete="off"
        />
      </div>
      
      <Button onClick={handleAddAttendee} className="w-full">
        Add Attendee
      </Button>
    </div>
  );
};

export default AttendeeForm;
