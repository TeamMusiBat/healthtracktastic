
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Target } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import ApiService from "@/services/ApiService";

interface LocationTrackerProps {
  intervalMs?: number; // How often to update in milliseconds (default: 60000 = 1 minute)
  showButton?: boolean;
}

const LocationTracker: React.FC<LocationTrackerProps> = ({ 
  intervalMs = 60000,
  showButton = true
}) => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const { user, updateLocation } = useAuth();
  const watchIdRef = useRef<number | null>(null);
  const intervalIdRef = useRef<number | null>(null);
  
  // Check if geolocation is supported
  const isGeolocationSupported = 'geolocation' in navigator;
  
  // Start tracking location
  const startTracking = () => {
    if (!isGeolocationSupported) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    
    // Request permission if needed
    navigator.permissions?.query({ name: 'geolocation' }).then((result) => {
      if (result.state === 'denied') {
        toast.error("Location access denied. Please enable location in your browser settings.");
        return;
      }
      
      // Start watching position
      const watchId = navigator.geolocation.watchPosition(
        handlePositionSuccess,
        handlePositionError,
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
      
      watchIdRef.current = watchId;
      setIsTracking(true);
      toast.success("Location tracking started");
      
      // Also set up interval for periodic updates
      const intervalId = window.setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          handlePositionSuccess,
          handlePositionError,
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }, intervalMs);
      
      intervalIdRef.current = intervalId;
    });
  };
  
  // Stop tracking location
  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    
    if (intervalIdRef.current !== null) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    
    setIsTracking(false);
    toast.info("Location tracking stopped");
  };
  
  // Handle successful position acquisition
  const handlePositionSuccess = (position: GeolocationPosition) => {
    const { latitude, longitude } = position.coords;
    
    // Update local state
    setCurrentLocation({ latitude, longitude });
    
    // Update user location in AuthContext
    if (user) {
      updateLocation(latitude, longitude);
      
      // Send to server if online
      ApiService.updateLocation(user.id, latitude, longitude)
        .catch(error => {
          console.error("Failed to update location on server:", error);
        });
    }
  };
  
  // Handle position errors
  const handlePositionError = (error: GeolocationPositionError) => {
    let message = "Unknown error occurred while getting location";
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        message = "Location permission denied";
        break;
      case error.POSITION_UNAVAILABLE:
        message = "Location information is unavailable";
        break;
      case error.TIMEOUT:
        message = "Location request timed out";
        break;
    }
    
    console.error("Geolocation error:", message);
    toast.error(message);
    stopTracking();
  };
  
  // Toggle tracking
  const toggleTracking = () => {
    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  };
  
  // Get single position update
  const getCurrentPosition = () => {
    if (!isGeolocationSupported) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      handlePositionSuccess,
      handlePositionError,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };
  
  // Start tracking automatically on component mount
  useEffect(() => {
    // Attempt to get initial position
    getCurrentPosition();
    
    return () => {
      // Clean up on unmount
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      
      if (intervalIdRef.current !== null) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, []);
  
  if (!showButton) {
    return null;
  }
  
  return (
    <div className="flex flex-col space-y-2">
      <Button
        variant={isTracking ? "default" : "outline"}
        onClick={toggleTracking}
        className="flex items-center gap-2"
      >
        {isTracking ? <Target size={18} /> : <MapPin size={18} />}
        {isTracking ? "Stop Tracking Location" : "Start Tracking Location"}
      </Button>
      
      {currentLocation && (
        <div className="text-xs text-muted-foreground">
          Last location: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
        </div>
      )}
    </div>
  );
};

export default LocationTracker;
