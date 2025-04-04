
import React, { useRef, useState, useEffect } from 'react';
import { Camera, Image, MapPin, RefreshCw, Share2, Settings, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { ColorPicker } from './ColorPicker';
import { GPSOverlay } from './GPSOverlay';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';

interface CameraViewProps {
  onImageCapture?: (image: string, metadata: CameraMetadata) => void;
}

export interface CameraMetadata {
  timestamp: string;
  location: {
    latitude: number | null;
    longitude: number | null;
    address: string;
  };
  weather?: {
    temperature?: string;
    condition?: string;
  };
  compass?: string;
}

export const CameraView: React.FC<CameraViewProps> = ({ onImageCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [overlayPosition, setOverlayPosition] = useState({ x: 10, y: 10 });
  const [textColor, setTextColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState(16);
  const [locationData, setLocationData] = useState<CameraMetadata>({
    timestamp: new Date().toISOString(),
    location: {
      latitude: null,
      longitude: null,
      address: 'Retrieving location...'
    }
  });

  // Request camera access
  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }, 
          audio: false 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasPermission(true);
          setIsCameraActive(true);
        }
      } catch (err) {
        console.error("Failed to get camera permission:", err);
        setHasPermission(false);
        toast.error("Camera permission denied. Please enable camera access.");
      }
    }

    if (isCameraActive && !videoRef.current?.srcObject) {
      setupCamera();
    }

    return () => {
      // Clean up video stream when component unmounts
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraActive]);

  // Get location data
  useEffect(() => {
    if (isCameraActive) {
      updateLocation();
    }
  }, [isCameraActive]);

  const updateLocation = () => {
    setIsLoading(true);
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Get address using reverse geocoding
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
              { headers: { 'Accept-Language': 'en-US,en;q=0.9' } }
            );
            
            const data = await response.json();
            const address = data.display_name || 'Unknown location';
            
            // Get weather data (simplified - in real app would use a weather API)
            const weather = {
              temperature: '24°C',  // Placeholder
              condition: 'Sunny'    // Placeholder
            };
            
            // Get compass direction (simplified)
            const compassDirections = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
            const compassIndex = Math.floor(Math.random() * compassDirections.length);
            const compass = compassDirections[compassIndex];
            
            setLocationData({
              timestamp: new Date().toISOString(),
              location: {
                latitude,
                longitude,
                address
              },
              weather,
              compass
            });
          } catch (error) {
            console.error("Error fetching location details:", error);
            setLocationData({
              timestamp: new Date().toISOString(),
              location: {
                latitude,
                longitude,
                address: 'Location found, address unavailable'
              }
            });
          }
          setIsLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Could not get your location. Please check permissions.");
          setLocationData({
            timestamp: new Date().toISOString(),
            location: {
              latitude: null,
              longitude: null,
              address: 'Location unavailable'
            }
          });
          setIsLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      toast.error("Geolocation is not supported by this browser");
      setIsLoading(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw the video frame to the canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Add the GPS overlay to the image
        context.font = `${fontSize}px Arial`;
        context.fillStyle = textColor;
        
        const date = new Date();
        const dateString = date.toLocaleDateString();
        const timeString = date.toLocaleTimeString();
        
        const lat = locationData.location.latitude?.toFixed(6) || 'unknown';
        const lng = locationData.location.longitude?.toFixed(6) || 'unknown';
        
        const textX = overlayPosition.x;
        const textY = overlayPosition.y;
        
        context.fillText(`Date: ${dateString}`, textX, textY);
        context.fillText(`Time: ${timeString}`, textX, textY + fontSize + 5);
        context.fillText(`Lat: ${lat}, Lng: ${lng}`, textX, textY + (fontSize + 5) * 2);
        
        if (locationData.location.address) {
          const addressLines = locationData.location.address.split(', ');
          addressLines.forEach((line, i) => {
            context.fillText(line, textX, textY + (fontSize + 5) * (3 + i));
          });
        }
        
        // Get the data URL from the canvas
        const dataURL = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataURL);
        
        if (onImageCapture) {
          onImageCapture(dataURL, locationData);
        }
      }
    }
  };

  const resetCamera = () => {
    setCapturedImage(null);
  };

  const downloadImage = () => {
    if (capturedImage) {
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      link.download = `gps-photo-${timestamp}.jpg`;
      link.href = capturedImage;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Image downloaded successfully");
    }
  };

  const shareImage = async () => {
    if (capturedImage && navigator.share) {
      try {
        const blob = await fetch(capturedImage).then(res => res.blob());
        const file = new File([blob], 'gps-photo.jpg', { type: 'image/jpeg' });
        
        await navigator.share({
          title: 'GPS Photo',
          text: 'Check out this photo with GPS location',
          files: [file]
        });
        
        toast.success("Image shared successfully");
      } catch (error) {
        console.error("Error sharing image:", error);
        toast.error("Failed to share image");
      }
    } else {
      toast.error("Sharing is not supported on this device");
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    // Calculate new position based on drag result
    setOverlayPosition({
      x: result.destination.x || overlayPosition.x,
      y: result.destination.y || overlayPosition.y
    });
  };

  if (hasPermission === false) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] p-4">
        <Camera className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-2">Camera Permission Required</h2>
        <p className="text-center text-muted-foreground mb-4">
          Please allow camera access to use this feature.
        </p>
        <Button onClick={() => setIsCameraActive(true)}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto">
      <Card className="relative overflow-hidden bg-gray-900 rounded-lg shadow-xl">
        {!capturedImage ? (
          <div className="relative aspect-video w-full">
            {isLoading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            )}
            <video 
              ref={videoRef}
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="overlay-area">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="absolute inset-0"
                  >
                    <Draggable draggableId="gps-overlay" index={0}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            position: 'absolute',
                            left: overlayPosition.x,
                            top: overlayPosition.y,
                            ...provided.draggableProps.style
                          }}
                          className="p-2 rounded bg-black/30 cursor-move"
                        >
                          <GPSOverlay 
                            locationData={locationData} 
                            fontSize={fontSize}
                            textColor={textColor}
                          />
                        </div>
                      )}
                    </Draggable>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        ) : (
          <div className="relative">
            <img src={capturedImage} alt="Captured" className="w-full" />
            <button
              onClick={resetCamera}
              className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full"
            >
              <X size={24} />
            </button>
          </div>
        )}
        
        <canvas ref={canvasRef} className="hidden" />
        
        <div className="p-4 bg-black flex flex-wrap justify-center gap-2">
          {!capturedImage ? (
            <>
              <Button 
                onClick={captureImage} 
                size="lg" 
                className="bg-primary hover:bg-primary/90"
              >
                <Camera className="mr-2 h-5 w-5" /> Capture
              </Button>
              <Button 
                onClick={updateLocation} 
                variant="outline" 
                className="text-primary-foreground border-primary-foreground hover:bg-primary/20"
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh Location
              </Button>
            </>
          ) : (
            <>
              <Button onClick={downloadImage} className="bg-green-600 hover:bg-green-700">
                <Download className="mr-2 h-4 w-4" /> Save
              </Button>
              <Button onClick={shareImage} className="bg-blue-600 hover:bg-blue-700">
                <Share2 className="mr-2 h-4 w-4" /> Share
              </Button>
              <Button onClick={resetCamera} variant="outline" className="text-primary-foreground">
                <Camera className="mr-2 h-4 w-4" /> New Photo
              </Button>
            </>
          )}
        </div>
      </Card>
      
      <div className="mt-6">
        <Tabs defaultValue="settings">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="settings">Style Settings</TabsTrigger>
            <TabsTrigger value="location">Location Details</TabsTrigger>
          </TabsList>
          <TabsContent value="settings" className="p-4">
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Text Color</label>
                <ColorPicker value={textColor} onChange={setTextColor} />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Font Size: {fontSize}px
                </label>
                <Slider
                  value={[fontSize]}
                  min={10}
                  max={32}
                  step={1}
                  onValueChange={(value) => setFontSize(value[0])}
                  className="my-4"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Overlay Position
                </label>
                <p className="text-sm text-muted-foreground mb-2">
                  Drag the overlay directly on the preview to reposition
                </p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="location" className="space-y-4 p-4">
            <div className="space-y-2">
              <h3 className="font-medium">Current Location</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-medium">Latitude:</div>
                <div>{locationData.location.latitude?.toFixed(6) || 'Unknown'}</div>
                <div className="font-medium">Longitude:</div>
                <div>{locationData.location.longitude?.toFixed(6) || 'Unknown'}</div>
                <div className="font-medium">Address:</div>
                <div>{locationData.location.address}</div>
                {locationData.compass && (
                  <>
                    <div className="font-medium">Direction:</div>
                    <div>{locationData.compass}</div>
                  </>
                )}
                {locationData.weather && (
                  <>
                    <div className="font-medium">Weather:</div>
                    <div>{locationData.weather.condition}, {locationData.weather.temperature}</div>
                  </>
                )}
              </div>
              <Button 
                onClick={updateLocation}
                variant="outline"
                className="w-full mt-4"
                disabled={isLoading}
              >
                <MapPin className="mr-2 h-4 w-4" />
                {isLoading ? 'Updating Location...' : 'Refresh Location Data'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
