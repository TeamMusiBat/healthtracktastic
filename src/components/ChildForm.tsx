
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { CamelCaseInput } from "@/components/CamelCaseInput";
import { ScreenedChild, VaccineStatus } from "@/contexts/HealthDataContext";
import { toast } from "sonner";

interface ChildFormProps {
  onAddChild: (child: ScreenedChild) => void;
  checkDuplicate?: (name: string, fatherName: string) => boolean;
}

const ChildForm: React.FC<ChildFormProps> = ({ onAddChild, checkDuplicate }) => {
  const initialChildState: Partial<ScreenedChild> = {
    name: "",
    fatherName: "",
    age: 6, // Default to 6 months
    muac: 12.5, // Default MUAC value
    gender: "male",
    vaccination: "complete",
    vaccineDue: false,
    remarks: "",
    status: "Normal",
    belongsToSameUC: true,
  };
  
  const [newChild, setNewChild] = useState<Partial<ScreenedChild>>(initialChildState);
  const [otherAddress, setOtherAddress] = useState<string>("");
  
  // Function to determine nutritional status based on MUAC
  const determineStatus = (muac: number) => {
    if (muac < 11.5) return "SAM";
    if (muac < 12.5) return "MAM";
    return "Normal";
  };
  
  // Update status when MUAC changes
  const handleMuacChange = (muac: number) => {
    const status = determineStatus(muac);
    setNewChild({...newChild, muac, status});
  };
  
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
      otherLocation: !newChild.belongsToSameUC ? otherAddress : "",
    };
    
    onAddChild(fullChild);
    
    // Reset form
    setNewChild({...initialChildState});
    setOtherAddress("");
    
    toast.success("Child added successfully");
  };
  
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <h3 className="text-lg font-semibold">Add New Child</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <CamelCaseInput
            id="name"
            placeholder="Child's Full Name"
            value={newChild.name}
            onChange={(value) => setNewChild({...newChild, name: value})}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="fatherName">Father Name</Label>
          <CamelCaseInput
            id="fatherName"
            placeholder="Father's Name"
            value={newChild.fatherName}
            onChange={(value) => setNewChild({...newChild, fatherName: value})}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="age">Age (months)</Label>
          <Input
            id="age"
            type="number"
            min={0}
            max={60}
            value={newChild.age}
            onChange={(e) => setNewChild({...newChild, age: parseInt(e.target.value) || 0})}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <select
            id="gender"
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
            type="number"
            step="0.1"
            min={9}
            max={20}
            value={newChild.muac}
            onChange={(e) => handleMuacChange(parseFloat(e.target.value) || 12.5)}
          />
          <div className={`text-xs font-medium mt-1 ${
            newChild.status === "SAM" ? "text-red-500" : 
            newChild.status === "MAM" ? "text-amber-500" : 
            "text-green-500"
          }`}>
            Status: {newChild.status}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vaccination">Vaccination Status</Label>
          <select
            id="vaccination"
            className="w-full px-3 py-2 border rounded-md"
            value={newChild.vaccination}
            onChange={(e) => setNewChild({...newChild, vaccination: e.target.value as VaccineStatus})}
          >
            <option value="complete">Complete</option>
            <option value="partial">Partial</option>
            <option value="none">None</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="vaccineDue">Vaccine Due</Label>
            <Switch 
              id="vaccineDue"
              checked={newChild.vaccineDue}
              onCheckedChange={(checked) => setNewChild({...newChild, vaccineDue: checked})}
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="belongsToSameUC">Belongs to Same UC</Label>
          <Switch 
            id="belongsToSameUC"
            checked={newChild.belongsToSameUC}
            onCheckedChange={(checked) => setNewChild({...newChild, belongsToSameUC: checked})}
          />
        </div>
        
        {!newChild.belongsToSameUC && (
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
          value={newChild.remarks}
          onChange={(e) => setNewChild({...newChild, remarks: e.target.value})}
        />
      </div>
      
      <Button onClick={handleAddChild} className="w-full">
        Add Child
      </Button>
    </div>
  );
};

export default ChildForm;
