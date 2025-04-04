
import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CameraMetadata } from './CameraView';

interface MapLocation {
  id: string;
  latitude: number;
  longitude: number;
  name: string;
}

interface MapViewProps {
  locations?: MapLocation[];
  currentLocation?: {
    latitude: number | null;
    longitude: number | null;
  };
}

export const MapView: React.FC<MapViewProps> = ({ 
  locations = [], 
  currentLocation 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This is a placeholder for map implementation
    // In a real app, you would use a mapping library like Leaflet or Google Maps
    const loadMap = async () => {
      try {
        setIsLoading(true);
        
        // Simulate loading time
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (mapRef.current) {
          // In a real implementation, this would initialize the map
          const mapElement = mapRef.current;
          
          // Create a simple placeholder map with styling
          mapElement.style.height = '400px';
          mapElement.style.backgroundColor = '#e0e0e0';
          mapElement.style.position = 'relative';
          mapElement.style.overflow = 'hidden';
          mapElement.style.borderRadius = '4px';
          
          // Add some basic map elements for visual representation
          const mapContent = document.createElement('div');
          mapContent.innerHTML = `
            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: url('https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/-96.7970,32.7767,10,0/600x400?access_token=placeholder'); background-size: cover; background-position: center;"></div>
            <div style="position: absolute; bottom: 10px; left: 10px; background: #fff; padding: 5px; border-radius: 4px; font-size: 12px; box-shadow: 0 0 5px rgba(0,0,0,0.2);">
              <strong>Map Placeholder</strong><br>
              In production, use a mapping library
            </div>
          `;
          
          mapElement.appendChild(mapContent);
          
          // Add location pins
          if (currentLocation?.latitude && currentLocation.longitude) {
            const pin = document.createElement('div');
            pin.style.position = 'absolute';
            pin.style.left = '50%';
            pin.style.top = '50%';
            pin.style.transform = 'translate(-50%, -50%)';
            pin.style.width = '20px';
            pin.style.height = '20px';
            pin.style.backgroundColor = '#f00';
            pin.style.borderRadius = '50%';
            pin.style.border = '3px solid #fff';
            pin.style.boxShadow = '0 0 5px rgba(0,0,0,0.5)';
            
            mapElement.appendChild(pin);
          }
          
          locations.forEach((location, index) => {
            const pin = document.createElement('div');
            pin.style.position = 'absolute';
            pin.style.left = `${Math.random() * 80 + 10}%`;
            pin.style.top = `${Math.random() * 80 + 10}%`;
            pin.style.width = '16px';
            pin.style.height = '16px';
            pin.style.backgroundColor = '#4a90e2';
            pin.style.borderRadius = '50%';
            pin.style.border = '2px solid #fff';
            pin.style.boxShadow = '0 0 5px rgba(0,0,0,0.3)';
            
            // Add tooltip
            pin.title = location.name;
            
            mapElement.appendChild(pin);
          });
          
          setMapLoaded(true);
        }
      } catch (err) {
        console.error("Error loading map:", err);
        setError("Failed to load map. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    loadMap();

    return () => {
      // Cleanup function for real map implementation
      if (mapRef.current) {
        mapRef.current.innerHTML = '';
      }
    };
  }, [currentLocation, locations]);

  const handleRefresh = () => {
    if (mapRef.current) {
      mapRef.current.innerHTML = '';
      setMapLoaded(false);
      setError(null);
      setIsLoading(true);
      
      // Re-trigger the map loading effect
      // In a real implementation this might refresh the map or reload markers
      setTimeout(() => {
        setIsLoading(false);
        setMapLoaded(true);
      }, 1000);
    }
  };

  return (
    <Card className="overflow-hidden">
      {error ? (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            className="mt-2"
          >
            Try Again
          </Button>
        </Alert>
      ) : (
        <div className="relative">
          <div 
            ref={mapRef} 
            className="w-full h-[400px] bg-muted rounded-md" 
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          <div className="p-4 flex justify-between items-center">
            <div>
              <h3 className="font-medium">Photo Locations</h3>
              <p className="text-sm text-muted-foreground">
                {locations.length} locations saved
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
            >
              Refresh Map
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
