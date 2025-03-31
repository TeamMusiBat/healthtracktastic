
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface LocationPickerProps {
  onLocationChange: (lat: number, lng: number) => void;
  initialLatitude?: number;
  initialLongitude?: number;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationChange,
  initialLatitude,
  initialLongitude,
}) => {
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { updateLocation } = useAuth();
  
  useEffect(() => {
    // Check if location permission already granted
    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        if (result.state === "granted") {
          setLocationPermission(true);
          
          // If initial coordinates are not provided, get current location
          if (!initialLatitude || !initialLongitude) {
            getCurrentLocation();
          }
        } else if (result.state === "denied") {
          setLocationPermission(false);
        } else {
          setLocationPermission(null);
        }
      });
    }
  }, [initialLatitude, initialLongitude]);
  
  const getCurrentLocation = () => {
    setIsLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onLocationChange(latitude, longitude);
        updateLocation(latitude, longitude);
        setLocationPermission(true);
        setIsLoading(false);
        toast.success("Location updated successfully");
      },
      (error) => {
        console.error("Error getting location:", error);
        setLocationPermission(false);
        setIsLoading(false);
        toast.error("Failed to get location. Please try again.");
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };
  
  const handleGetLocation = () => {
    if (locationPermission === false) {
      toast.error(
        "Location permission denied. Please enable location in your browser settings."
      );
      return;
    }
    
    getCurrentLocation();
  };
  
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        type="button"
        onClick={handleGetLocation}
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        <MapPin size={18} />
        {isLoading ? "Getting location..." : "Get Current Location"}
      </Button>
      
      {(initialLatitude && initialLongitude) && (
        <div className="text-sm text-gray-500">
          Location: {initialLatitude.toFixed(6)}, {initialLongitude.toFixed(6)}
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
