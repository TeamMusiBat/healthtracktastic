
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CamelCaseInput from "@/components/CamelCaseInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { ScreenedChild, VaccineStatus } from "@/contexts/HealthDataContext";
import { toCamelCase, getDobFromMonths, getMuacStatus } from "@/utils/formatters";

interface ChildFormProps {
  onAddChild: (child: Partial<ScreenedChild>) => void;
  checkDuplicate?: (name: string, fatherName: string) => boolean;
}

const ChildForm: React.FC<ChildFormProps> = ({ onAddChild, checkDuplicate }) => {
  const initialChildState = {
    name: "",
    fatherName: "",
    age: 6, // Default to 6 months
    muac: 12.5, // Default to normal
    gender: "male",
    vaccination: "0-Dose",
    vaccineDue: false,
    remarks: "",
    status: "Normal", // Will be calculated based on MUAC
    belongsToSameUC: true,
  };
  
  const [newChild, setNewChild] = useState<Partial<ScreenedChild>>({...initialChildState});
  const [otherAddress, setOtherAddress] = useState<string>("");
  
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
    
    // Check for duplicate if function provided
    if (checkDuplicate && checkDuplicate(formattedName, formattedFatherName)) {
      toast.warning("This child already exists for this screening");
      return;
    }
    
    // Create new child object
    const childToAdd: Partial<ScreenedChild> = {
      ...newChild,
      id: Date.now().toString(),
      name: formattedName,
      fatherName: formattedFatherName,
      dob: newChild.age ? getDobFromMonths(newChild.age) : undefined,
      status: getMuacStatus(newChild.muac!),
      address: !newChild.belongsToSameUC ? otherAddress : undefined,
    };
    
    // Send to parent component
    onAddChild(childToAdd);
    
    // Reset form - properly clear all inputs
    setNewChild({...initialChildState});
    setOtherAddress("");
    
    toast.success("Child added to screening");
  };
  
  // Get status badge
  const getStatusBadge = (status: "SAM" | "MAM" | "Normal") => {
    if (status === "SAM") return <span className="status-badge status-badge-sam">SAM</span>;
    if (status === "MAM") return <span className="status-badge status-badge-mam">MAM</span>;
    return <span className="status-badge status-badge-normal">Normal</span>;
  };
  
  return (
    <div className="space-y-4">
      <h5 className="font-medium mb-2">Add Child</h5>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="childName">Name</Label>
          <CamelCaseInput
            id="childName"
            key={`child-name-${newChild.name}`}
            defaultValue={newChild.name}
            onValueChange={(value) => setNewChild({ ...newChild, name: value })}
            placeholder="Enter child name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="fatherName">Father Name</Label>
          <CamelCaseInput
            id="fatherName"
            key={`father-name-${newChild.fatherName}`}
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
            value={newChild.gender}
            onValueChange={(value: "male" | "female" | "other") => setNewChild({ ...newChild, gender: value })}
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
            value={newChild.vaccination}
            onValueChange={(value: VaccineStatus) => setNewChild({ ...newChild, vaccination: value })}
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
          <div className="flex items-center space-x-2 mb-2">
            <Checkbox
              id="belongsToSameUC"
              checked={newChild.belongsToSameUC}
              onCheckedChange={(checked) => setNewChild({ ...newChild, belongsToSameUC: checked as boolean })}
            />
            <Label htmlFor="belongsToSameUC">Child belongs to same UC</Label>
          </div>
          
          {!newChild.belongsToSameUC && (
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
            value={newChild.remarks || ""}
            onChange={(e) => setNewChild({ ...newChild, remarks: e.target.value })}
            placeholder="Enter remarks"
          />
        </div>
      </div>
      
      <Button
        onClick={handleAddChild}
        className="flex items-center gap-2"
      >
        <Plus size={16} />
        <span>Add Child</span>
      </Button>
    </div>
  );
};

export default ChildForm;
