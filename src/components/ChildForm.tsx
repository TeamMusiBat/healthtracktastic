
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
    vaccination: "complete" as VaccineStatus,
    vaccineDue: false,
    remarks: "",
    status: "normal",
    belongsToSameUC: true,
  };
  
  const [newChild, setNewChild] = useState<Partial<ScreenedChild>>(initialChildState);
  const [otherAddress, setOtherAddress] = useState<string>("");
  
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
      status: newChild.status as "normal" | "mam" | "sam",
      belongsToSameUC: newChild.belongsToSameUC,
      // Only add otherLocation if belongsToSameUC is false
      ...((!newChild.belongsToSameUC && otherAddress) ? { otherLocation: otherAddress } : {})
    };
    
    onAddChild(fullChild);
    
    // Reset form
    setNewChild({...initialChildState});
    setOtherAddress("");
    
    toast.success("Child added successfully");
  };
  
  const getMuacClass = () => {
    if (newChild.muac < 11.5) return "bg-red-100 border-red-300";
    if (newChild.muac >= 11.5 && newChild.muac < 12.5) return "bg-yellow-100 border-yellow-300";
    return "bg-green-100 border-green-300";
  };
  
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <h3 className="text-lg font-semibold">Add New Child</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="childName">Name</Label>
          <CamelCaseInput
            id="childName"
            placeholder="Child's Full Name"
            defaultValue={newChild.name}
            onValueChange={(value) => setNewChild({...newChild, name: value})}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="fatherName">Father Name</Label>
          <CamelCaseInput
            id="fatherName"
            placeholder="Father's Name"
            defaultValue={newChild.fatherName}
            onValueChange={(value) => setNewChild({...newChild, fatherName: value})}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="childAge">Age (Months)</Label>
          <Input
            id="childAge"
            type="number"
            min={0}
            max={60}
            value={newChild.age}
            onChange={(e) => setNewChild({...newChild, age: parseInt(e.target.value) || 0})}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="childGender">Gender</Label>
          <select
            id="childGender"
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
            min={0}
            className={getMuacClass()}
            value={newChild.muac}
            onChange={(e) => {
              const muac = parseFloat(e.target.value) || 0;
              let status = "normal";
              if (muac < 11.5) status = "sam";
              else if (muac < 12.5) status = "mam";
              
              setNewChild({
                ...newChild, 
                muac, 
                status: status as "normal" | "mam" | "sam"
              });
            }}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Vaccination Status</Label>
        <RadioGroup 
          value={newChild.vaccination} 
          onValueChange={(value) => setNewChild({...newChild, vaccination: value as VaccineStatus})}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="complete" id="complete" />
            <Label htmlFor="complete">Complete</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="partial" id="partial" />
            <Label htmlFor="partial">Partial</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="none" id="none" />
            <Label htmlFor="none">None</Label>
          </div>
        </RadioGroup>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="vaccineDue"
          checked={newChild.vaccineDue}
          onCheckedChange={(checked) => setNewChild({...newChild, vaccineDue: checked})}
        />
        <Label htmlFor="vaccineDue">Vaccine Due</Label>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="childBelongsToSameUC">Belongs to Same UC</Label>
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
              placeholder="Village, UC, Tehsil, District"
              value={otherAddress}
              onChange={(e) => setOtherAddress(e.target.value)}
            />
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="childRemarks">Remarks</Label>
        <Textarea
          id="childRemarks"
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
