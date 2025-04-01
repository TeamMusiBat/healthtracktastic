
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CamelCaseInput from "@/components/CamelCaseInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Attendee } from "@/contexts/HealthDataContext";
import { toCamelCase, getDobFromYears } from "@/utils/formatters";

interface AttendeeFormProps {
  onAddAttendee: (attendee: Partial<Attendee>) => void;
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
    // Validate form
    if (!newAttendee.name || !newAttendee.fatherHusbandName) {
      toast.error("Name and Father/Husband Name are required");
      return;
    }
    
    // Format names (camelcase)
    const formattedName = toCamelCase(newAttendee.name || "");
    const formattedFatherName = toCamelCase(newAttendee.fatherHusbandName || "");
    
    // Check for duplicate if function provided
    if (checkDuplicate && checkDuplicate(formattedName, formattedFatherName)) {
      toast.warning("This attendee already exists for this session");
      return;
    }
    
    // Create new attendee object
    const attendeeToAdd: Partial<Attendee> = {
      ...newAttendee,
      id: Date.now().toString(),
      name: formattedName,
      fatherHusbandName: formattedFatherName,
      dob: newAttendee.age ? getDobFromYears(newAttendee.age) : undefined,
      address: !newAttendee.belongsToSameUC ? otherAddress : undefined,
    };
    
    // Send to parent component
    onAddAttendee(attendeeToAdd);
    
    // Reset form - properly clear inputs
    setNewAttendee({...initialAttendeeState});
    setOtherAddress("");
    
    toast.success("Attendee added");
  };
  
  return (
    <div className="space-y-4">
      <h5 className="font-medium mb-2">Add Attendee</h5>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <CamelCaseInput
            id="name"
            key={`name-${newAttendee.name}`}
            defaultValue={newAttendee.name}
            onValueChange={(value) => setNewAttendee({ ...newAttendee, name: value })}
            placeholder="Enter name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="fatherHusbandName">Father/Husband Name</Label>
          <CamelCaseInput
            id="fatherHusbandName"
            key={`father-${newAttendee.fatherHusbandName}`}
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
            value={newAttendee.gender}
            onValueChange={(value: "male" | "female" | "other") => setNewAttendee({ ...newAttendee, gender: value })}
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
          <div className="flex items-center space-x-2 mb-2">
            <Checkbox
              id="belongsToSameUC"
              checked={newAttendee.belongsToSameUC}
              onCheckedChange={(checked) => setNewAttendee({ ...newAttendee, belongsToSameUC: checked as boolean })}
            />
            <Label htmlFor="belongsToSameUC">Person belongs to same UC</Label>
          </div>
          
          {!newAttendee.belongsToSameUC && (
            <div className="space-y-2">
              <Label htmlFor="otherAddress">Address</Label>
              <Input
                id="otherAddress"
                value={otherAddress}
                onChange={(e) => setOtherAddress(e.target.value)}
                placeholder="Enter address"
              />
            </div>
          )}
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
        className="flex items-center gap-2"
      >
        <Plus size={16} />
        <span>Add Attendee</span>
      </Button>
    </div>
  );
};

export default AttendeeForm;
