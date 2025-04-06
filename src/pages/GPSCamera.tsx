
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

    // Get current location on component mount
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Could not get your location. Please check permissions.');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, []);

  // Save photos to localStorage whenever the photos array changes
  useEffect(() => {
    localStorage.setItem('gpsPhotos', JSON.stringify(photos));
  }, [photos]);

  const handleImageCapture = (imageSrc: string, metadata: CameraMetadata) => {
    const newPhoto = {
      id: uuidv4(),
      src: imageSrc,
      metadata,
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
    <div className="container mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">GPS Camera</h1>
        <p className="text-muted-foreground">
          Take photos with location information, customize overlays, and share with ease
        </p>
      </div>

      <Tabs defaultValue="camera" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="camera" className="py-3 text-base">
            <Camera className="mr-2 h-5 w-5" /> Camera
          </TabsTrigger>
          <TabsTrigger value="gallery" className="py-3 text-base">
            <Image className="mr-2 h-5 w-5" /> Gallery
          </TabsTrigger>
          <TabsTrigger value="map" className="py-3 text-base">
            <Map className="mr-2 h-5 w-5" /> Map View
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
