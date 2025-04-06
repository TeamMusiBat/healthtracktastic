import React, { useRef, useState, useEffect } from 'react';
import { Camera, Image, MapPin, RefreshCw, Share2, Settings, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
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
  compass?: string;
  note?: string;
}

export const CameraView: React.FC<CameraViewProps> = ({ onImageCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [overlayPosition, setOverlayPosition] = useState({ x: 10, y: 10 });
  const [isDragging, setIsDragging] = useState(false);
  const [textColor, setTextColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState(16);
  const [note, setNote] = useState('');
  const [locationData, setLocationData] = useState<CameraMetadata>({
    timestamp: new Date().toISOString(),
    location: {
      latitude: null,
      longitude: null,
      address: 'Retrieving location...'
    }
  });
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('environment');

  // Request camera access
  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: cameraFacingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }, 
          audio: false 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasPermission(true);
        }
      } catch (err) {
        console.error("Failed to get camera permission:", err);
        setHasPermission(false);
        toast.error("Camera permission denied. Please enable camera access.");
      }
    }

    if (isCameraActive && !capturedImage) {
      setupCamera();
    }

    return () => {
      // Clean up video stream when component unmounts
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraActive, cameraFacingMode, capturedImage]);

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
            // Add cache-busting parameter to avoid CORS issues
            const timestamp = new Date().getTime();
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&_=${timestamp}`,
              { 
                headers: { 
                  'Accept-Language': 'en-US,en;q=0.9',
                  'User-Agent': 'HealthTracktastic GPS Camera App' 
                }
              }
            );
            
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            // Use more detailed address format
            let address = '';
            
            if (data.address) {
              const addr = data.address;
              const parts = [];
              
              if (addr.road) parts.push(addr.road);
              if (addr.suburb) parts.push(addr.suburb);
              if (addr.town) parts.push(addr.town);
              if (addr.city) parts.push(addr.city);
              if (addr.state) parts.push(addr.state);
              if (addr.country) parts.push(addr.country);
              
              address = parts.join(', ');
            } else {
              address = data.display_name || 'Location found';
            }
            
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
              compass,
              note
            });
            
            toast.success("Location updated successfully");
          } catch (error) {
            console.error("Error fetching location details:", error);
            setLocationData({
              timestamp: new Date().toISOString(),
              location: {
                latitude,
                longitude,
                address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
              },
              note
            });
            
            toast.warning("Got coordinates, but couldn't get address details");
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
            },
            note
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

  const flipCamera = () => {
    // First stop the current stream
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    // Toggle camera mode
    setCameraFacingMode(current => current === 'user' ? 'environment' : 'user');
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
        
        if (note) {
          context.fillText(`Note: ${note}`, textX, textY + (fontSize + 5) * 6);
        }
        
        // Get the data URL from the canvas
        const dataURL = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataURL);
        
        // Update location data to include the note
        const updatedMetadata = {
          ...locationData,
          note: note
        };
        
        if (onImageCapture) {
          onImageCapture(dataURL, updatedMetadata);
          toast.success("Photo captured and saved to gallery");
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

  // Improved drag implementation with touch support
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    
    // Get starting position
    let clientX, clientY;
    
    if ('touches' in e) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
      
      // For mouse events, set data to make drag possible
      // Type checking is needed here since dataTransfer isn't available on all events
      if ((e as React.DragEvent).dataTransfer) {
        (e as React.DragEvent).dataTransfer.setData('text/plain', 'overlay');
      }
    }
    
    setDragStart({
      x: clientX - overlayPosition.x,
      y: clientY - overlayPosition.y
    });
  };
  
  const handleDragMove = (e: React.TouchEvent) => {
    if (!isDragging || !e.touches[0]) return;
    
    e.preventDefault();
    
    const container = overlayRef.current?.parentElement;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const clientX = e.touches[0].clientX;
    const clientY = e.touches[0].clientY;
    
    // Calculate new position
    const newX = Math.max(0, Math.min(clientX - dragStart.x, rect.width - 150));
    const newY = Math.max(0, Math.min(clientY - dragStart.y, rect.height - 150));
    
    setOverlayPosition({
      x: newX,
      y: newY
    });
  };
  
  const handleDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(false);
    
    // Handle mouse events
    if (!('touches' in e)) {
      const container = overlayRef.current?.parentElement;
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      const clientX = (e as React.MouseEvent).clientX;
      const clientY = (e as React.MouseEvent).clientY;
      
      const newX = Math.max(0, Math.min(clientX - dragStart.x, rect.width - 150));
      const newY = Math.max(0, Math.min(clientY - dragStart.y, rect.height - 150));
      
      setOverlayPosition({
        x: newX,
        y: newY
      });
    }
  };

  if (hasPermission === false) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] p-4">
        <Camera className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-2">Camera Permission Required</h2>
        <p className="text-center text-muted-foreground mb-4">
          Please allow camera access to use this feature.
        </p>
        <Button onClick={() => setHasPermission(null)}>
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
              muted
              className="w-full h-full object-cover"
            />
            
            <div
              ref={overlayRef}
              className="absolute p-2 rounded bg-black/30 cursor-move"
              style={{
                position: 'absolute',
                left: overlayPosition.x,
                top: overlayPosition.y,
                touchAction: 'none',
                zIndex: 5
              }}
              draggable
              onDragStart={handleDragStart as any}
              onDragEnd={handleDragEnd as any}
              onTouchStart={handleDragStart as any}
              onTouchMove={handleDragMove}
              onTouchEnd={handleDragEnd as any}
            >
              <GPSOverlay 
                locationData={locationData} 
                fontSize={fontSize}
                textColor={textColor}
              />
            </div>
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
                onClick={flipCamera}
                variant="outline" 
                className="text-primary-foreground border-primary-foreground hover:bg-primary/20"
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Flip Camera
              </Button>
              <Button 
                onClick={updateLocation} 
                variant="outline" 
                className="text-primary-foreground border-primary-foreground hover:bg-primary/20"
              >
                <MapPin className="mr-2 h-4 w-4" /> Refresh Location
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
                <label className="text-sm font-medium mb-2 block">Note (Optional)</label>
                <Textarea
                  placeholder="Add a note about this image..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="resize-none"
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
