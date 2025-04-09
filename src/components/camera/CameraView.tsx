
import React, { useRef, useState, useEffect } from 'react';
import { Camera, Image, MapPin, RefreshCw, Share2, Settings, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { ColorPicker } from './ColorPicker';
import { GPSOverlay } from './GPSOverlay';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

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
  const [textColor, setTextColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState(16);
  const [note, setNote] = useState('');
  const [fixedOverlayPosition, setFixedOverlayPosition] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [overlayPosition, setOverlayPosition] = useState({ x: 10, y: 10 });
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

  // Set up dragging logic
  useEffect(() => {
    if (!overlayRef.current || fixedOverlayPosition) return;
    
    const overlay = overlayRef.current;
    
    let startX: number, startY: number;
    
    const onMouseDown = (e: MouseEvent) => {
      if (fixedOverlayPosition) return;
      setIsDragging(true);
      startX = e.clientX - overlayPosition.x;
      startY = e.clientY - overlayPosition.y;
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };
    
    const onTouchStart = (e: TouchEvent) => {
      if (fixedOverlayPosition) return;
      setIsDragging(true);
      startX = e.touches[0].clientX - overlayPosition.x;
      startY = e.touches[0].clientY - overlayPosition.y;
      document.addEventListener('touchmove', onTouchMove);
      document.addEventListener('touchend', onTouchEnd);
    };
    
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || fixedOverlayPosition) return;
      const newX = Math.max(0, Math.min(e.clientX - startX, window.innerWidth - 100));
      const newY = Math.max(0, Math.min(e.clientY - startY, window.innerHeight - 100));
      setOverlayPosition({ x: newX, y: newY });
    };
    
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || fixedOverlayPosition) return;
      const newX = Math.max(0, Math.min(e.touches[0].clientX - startX, window.innerWidth - 100));
      const newY = Math.max(0, Math.min(e.touches[0].clientY - startY, window.innerHeight - 100));
      setOverlayPosition({ x: newX, y: newY });
    };
    
    const onMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    
    const onTouchEnd = () => {
      setIsDragging(false);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
    
    overlay.addEventListener('mousedown', onMouseDown);
    overlay.addEventListener('touchstart', onTouchStart);
    
    return () => {
      overlay.removeEventListener('mousedown', onMouseDown);
      overlay.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [overlayRef, overlayPosition, isDragging, fixedOverlayPosition]);

  const updateLocation = () => {
    setIsLoading(true);
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          console.log(`Got raw position: ${latitude}, ${longitude} (accuracy: ${accuracy}m)`);
          
          try {
            // Use a more reliable geocoding service with cache busting and more parameters
            const timestamp = new Date().getTime();
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?` +
              `format=json&lat=${latitude}&lon=${longitude}` +
              `&zoom=18&addressdetails=1&_=${timestamp}` +
              `&accept-language=en`,
              { 
                headers: { 
                  'Accept-Language': 'en-US,en;q=0.9',
                  'User-Agent': 'GPSCameraApp/1.0 (contact@example.com)',
                  'Cache-Control': 'no-cache, no-store, must-revalidate',
                  'Pragma': 'no-cache'
                }
              }
            );
            
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log("Geocoding API response:", data);
            
            // Format detailed address from components
            let address = '';
            
            if (data.address) {
              const addr = data.address;
              const parts = [];
              
              // Use more specific fields first
              if (addr.road) parts.push(addr.road);
              if (addr.house_number) parts.push(addr.house_number);
              if (addr.neighbourhood) parts.push(addr.neighbourhood);
              if (addr.suburb) parts.push(addr.suburb);
              if (addr.village || addr.town || addr.city) {
                parts.push(addr.village || addr.town || addr.city);
              }
              if (addr.county) parts.push(addr.county);
              if (addr.state) parts.push(addr.state);
              
              address = parts.join(', ');
              
              // If no usable parts, use raw coordinates
              if (!address) {
                address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
              }
            } else {
              address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            }
            
            // Get compass direction (simplified)
            const compassDirections = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
            let compass = '';
            
            if ('DeviceOrientationEvent' in window) {
              window.addEventListener('deviceorientation', function onOrientationChange(event) {
                if (event.alpha !== null) {
                  // Standard compass heading calculation
                  const heading = event.alpha;
                  const index = Math.round(heading / 45) % 8;
                  compass = compassDirections[index];
                }
                window.removeEventListener('deviceorientation', onOrientationChange);
              });
            }
            
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
            
            toast.warning("Using raw coordinates only");
          }
          setIsLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error(`Could not get your location: ${error.message}. Please check permissions.`);
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

  // Get the overlay position based on settings
  const getOverlayPosition = () => {
    if (fixedOverlayPosition) {
      // Fixed at bottom
      return { 
        position: 'absolute',
        left: '10px', 
        bottom: '70px',
        top: 'auto',
        right: 'auto'
      };
    } else {
      // Custom position
      return {
        position: 'absolute',
        left: `${overlayPosition.x}px`,
        top: `${overlayPosition.y}px`,
        right: 'auto',
        bottom: 'auto',
        cursor: 'move'
      };
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
              className="absolute p-2 rounded bg-black/30"
              style={{
                ...getOverlayPosition() as any,
                touchAction: fixedOverlayPosition ? 'auto' : 'none',
                zIndex: 5
              }}
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
              
              <div className="flex items-center space-x-2 py-2">
                <Switch
                  id="fixed-position"
                  checked={fixedOverlayPosition}
                  onCheckedChange={setFixedOverlayPosition}
                />
                <Label htmlFor="fixed-position">Lock overlay at bottom (recommended)</Label>
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
