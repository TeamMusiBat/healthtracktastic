
import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";
import { Attendee } from "@/contexts/HealthDataContext";

interface PendingAttendeesListProps {
  attendees: Partial<Attendee>[];
  onRemove: (id: string) => void;
  onEdit?: (id: string) => void;
}

const PendingAttendeesList: React.FC<PendingAttendeesListProps> = ({ 
  attendees, 
  onRemove,
  onEdit
}) => {
  if (attendees.length === 0) {
    return <p className="text-gray-500 italic">No attendees added yet</p>;
  }
  
  return (
    <div className="border rounded-md divide-y max-h-[300px] overflow-y-auto">
      {attendees.map((attendee) => (
        <div key={attendee.id} className="p-3 flex justify-between items-center">
          <div>
            <p className="font-medium">{attendee.name}</p>
            <p className="text-sm text-gray-500">
              Father/Husband: {attendee.fatherHusbandName} | Age: {attendee.age} years
            </p>
            {attendee.address && (
              <p className="text-sm text-gray-500">
                Address: {attendee.address}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(attendee.id!)}
                className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
              >
                <Edit size={16} />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(attendee.id!)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PendingAttendeesList;
