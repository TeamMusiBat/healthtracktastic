
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CameraView, PhotoGallery, MapView } from '@/components';
import { Camera, Image, Map } from 'lucide-react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import type { CameraMetadata } from '@/components/camera/CameraView';

interface Photo {
  id: string;
  src: string;
  metadata: CameraMetadata;
}

const GPSCamera: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{latitude: number | null, longitude: number | null}>({
    latitude: null,
    longitude: null
  });
  const { user } = useAuth();

  // Load saved photos from localStorage on component mount
  useEffect(() => {
    const savedPhotos = localStorage.getItem('gpsPhotos');
    if (savedPhotos) {
      try {
        setPhotos(JSON.parse(savedPhotos));
      } catch (error) {
        console.error('Failed to parse saved photos', error);
      }
    }

    // Set up continuous location tracking with high accuracy
    const setupLocationTracking = () => {
      if ('geolocation' in navigator) {
        // Get initial position with high accuracy
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCurrentLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
            console.log(`Initial position: ${position.coords.latitude}, ${position.coords.longitude}`);
          },
          (error) => {
            console.error('Error getting initial location:', error);
            toast.error(`Could not get your location: ${error.message}. Please check permissions.`);
          },
          { 
            enableHighAccuracy: true, 
            timeout: 30000, 
            maximumAge: 0 
          }
        );
        
        // Set up a watcher for continuous updates with maximum accuracy
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            console.log(`Location updated: ${latitude}, ${longitude} (accuracy: ${accuracy}m)`);
            
            setCurrentLocation({
              latitude: latitude,
              longitude: longitude
            });
          },
          (error) => {
            console.error('Error watching location:', error);
          },
          { 
            enableHighAccuracy: true, 
            timeout: 30000, 
            maximumAge: 0
          }
        );
        
        // Clean up watcher on component unmount
        return () => navigator.geolocation.clearWatch(watchId);
      } else {
        toast.error('Geolocation is not supported by this browser');
        return undefined;
      }
    };
    
    const cleanupFn = setupLocationTracking();
    return cleanupFn;
  }, []);

  // Save photos to localStorage whenever the photos array changes
  useEffect(() => {
    localStorage.setItem('gpsPhotos', JSON.stringify(photos));
  }, [photos]);

  const handleImageCapture = (imageSrc: string, metadata: CameraMetadata) => {
    // Ensure we're using the most recent location data
    const updatedMetadata = {
      ...metadata,
      location: {
        ...metadata.location,
        // Use currentLocation if available and more accurate
        latitude: currentLocation.latitude || metadata.location.latitude,
        longitude: currentLocation.longitude || metadata.location.longitude,
      }
    };
    
    const newPhoto = {
      id: uuidv4(),
      src: imageSrc,
      metadata: updatedMetadata,
    };
    
    setPhotos(prevPhotos => [newPhoto, ...prevPhotos]);
    toast.success('Photo captured successfully');
  };

  // Extract locations for the map
  const mapLocations = photos.map(photo => ({
    id: photo.id,
    latitude: photo.metadata.location.latitude || 0,
    longitude: photo.metadata.location.longitude || 0,
    name: photo.metadata.location.address
  })).filter(loc => loc.latitude !== 0 && loc.longitude !== 0);

  return (
    <div className="container mx-auto px-2 md:px-4 max-w-7xl">
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">GPS Camera</h1>
        <p className="text-muted-foreground">
          Take photos with location information, customize overlays, and share with ease
        </p>
      </div>

      <Tabs defaultValue="camera" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4 md:mb-8">
          <TabsTrigger value="camera" className="py-2 md:py-3 text-sm md:text-base">
            <Camera className="mr-2 h-4 w-4 md:h-5 md:w-5" /> Camera
          </TabsTrigger>
          <TabsTrigger value="gallery" className="py-2 md:py-3 text-sm md:text-base">
            <Image className="mr-2 h-4 w-4 md:h-5 md:w-5" /> Gallery
          </TabsTrigger>
          <TabsTrigger value="map" className="py-2 md:py-3 text-sm md:text-base">
            <Map className="mr-2 h-4 w-4 md:h-5 md:w-5" /> Map View
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="camera" className="min-h-[60vh]">
          <CameraView onImageCapture={handleImageCapture} />
        </TabsContent>
        
        <TabsContent value="gallery" className="min-h-[60vh]">
          <PhotoGallery initialPhotos={photos} />
        </TabsContent>
        
        <TabsContent value="map" className="min-h-[60vh]">
          <MapView 
            locations={mapLocations} 
            currentLocation={currentLocation}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GPSCamera;
