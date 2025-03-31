
import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";
import { ScreenedChild, VaccineStatus } from "@/contexts/HealthDataContext";

interface PendingChildrenListProps {
  children: Partial<ScreenedChild>[];
  onRemove: (id: string) => void;
  onEdit?: (id: string) => void;
}

const PendingChildrenList: React.FC<PendingChildrenListProps> = ({ 
  children, 
  onRemove,
  onEdit
}) => {
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
      </div>
    );
  };

  if (children.length === 0) {
    return <p className="text-gray-500 italic">No children added yet</p>;
  }
  
  return (
    <div className="border rounded-md divide-y max-h-[300px] overflow-y-auto">
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
            {child.address && (
              <p className="text-sm text-gray-500">
                Address: {child.address}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            {getStatusBadge(child.status as "SAM" | "MAM" | "Normal")}
            <div className="flex gap-2">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(child.id!)}
                  className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                >
                  <Edit size={16} />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemove(child.id!)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PendingChildrenList;
