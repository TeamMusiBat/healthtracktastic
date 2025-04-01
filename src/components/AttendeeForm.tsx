
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { CamelCaseInput } from "@/components/CamelCaseInput";
import { Attendee } from "@/contexts/HealthDataContext";
import { toast } from "sonner";

interface AttendeeFormProps {
  onAddAttendee: (attendee: Attendee) => void;
  checkDuplicate?: (name: string, fatherName: string) => boolean;
}

const AttendeeForm: React.FC<AttendeeFormProps> = ({ onAddAttendee, checkDuplicate }) => {
  const initialAttendeeState: Partial<Attendee> = {
    name: "",
    fatherHusbandName: "",
    age: 0,
    gender: "male",
    underFiveChildren: 0,
    contactNumber: "",
    remarks: "",
    belongsToSameUC: true,
  };
  
  const [newAttendee, setNewAttendee] = useState<Partial<Attendee>>(initialAttendeeState);
  const [otherAddress, setOtherAddress] = useState<string>("");
  
  const handleAddAttendee = () => {
    // Validation
    if (!newAttendee.name || !newAttendee.fatherHusbandName) {
      toast.error("Name and Father/Husband Name are required");
      return;
    }
    
    if (newAttendee.age <= 0) {
      toast.error("Age must be greater than 0");
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
      age: newAttendee.age,
      gender: newAttendee.gender as "male" | "female" | "other",
      underFiveChildren: newAttendee.underFiveChildren,
      contactNumber: newAttendee.contactNumber || "",
      remarks: newAttendee.remarks || "",
      belongsToSameUC: newAttendee.belongsToSameUC,
      otherLocation: !newAttendee.belongsToSameUC ? otherAddress : "",
    };
    
    onAddAttendee(fullAttendee);
    
    // Reset form
    setNewAttendee({...initialAttendeeState});
    setOtherAddress("");
    
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
            placeholder="Full Name"
            value={newAttendee.name}
            onChange={(value) => setNewAttendee({...newAttendee, name: value})}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="fatherHusbandName">Father/Husband Name</Label>
          <CamelCaseInput
            id="fatherHusbandName"
            placeholder="Father or Husband Name"
            value={newAttendee.fatherHusbandName}
            onChange={(value) => setNewAttendee({...newAttendee, fatherHusbandName: value})}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            min={1}
            value={newAttendee.age}
            onChange={(e) => setNewAttendee({...newAttendee, age: parseInt(e.target.value) || 0})}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <select
            id="gender"
            className="w-full px-3 py-2 border rounded-md"
            value={newAttendee.gender}
            onChange={(e) => setNewAttendee({...newAttendee, gender: e.target.value as "male" | "female" | "other"})}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="underFiveChildren">Under 5 Children</Label>
          <Input
            id="underFiveChildren"
            type="number"
            min={0}
            value={newAttendee.underFiveChildren}
            onChange={(e) => setNewAttendee({...newAttendee, underFiveChildren: parseInt(e.target.value) || 0})}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="contactNumber">Contact Number</Label>
        <Input
          id="contactNumber"
          placeholder="Phone number"
          value={newAttendee.contactNumber}
          onChange={(e) => setNewAttendee({...newAttendee, contactNumber: e.target.value})}
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="belongsToSameUC">Belongs to Same UC</Label>
          <Switch 
            id="belongsToSameUC"
            checked={newAttendee.belongsToSameUC}
            onCheckedChange={(checked) => setNewAttendee({...newAttendee, belongsToSameUC: checked})}
          />
        </div>
        
        {!newAttendee.belongsToSameUC && (
          <div className="pt-2">
            <Label htmlFor="otherAddress">Specify Location</Label>
            <Input
              id="otherAddress"
              placeholder="Village, UC, Tehsil, District"
              value={otherAddress}
              onChange={(e) => setOtherAddress(e.target.value)}
            />
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="remarks">Remarks</Label>
        <Textarea
          id="remarks"
          placeholder="Any additional information"
          value={newAttendee.remarks}
          onChange={(e) => setNewAttendee({...newAttendee, remarks: e.target.value})}
        />
      </div>
      
      <Button onClick={handleAddAttendee} className="w-full">
        Add Attendee
      </Button>
    </div>
  );
};

export default AttendeeForm;
