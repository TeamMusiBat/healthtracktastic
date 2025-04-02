
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface ImageUploaderProps {
  onImagesChange: (images: string[]) => void;
  initialImages?: string[];
  sessionNumber?: string | number;
}

const ImageUploader = ({ onImagesChange, initialImages = [], sessionNumber = 1 }: ImageUploaderProps) => {
  const [images, setImages] = useState<string[]>(initialImages);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  
  const generateFileName = () => {
    const username = user?.username || 'unknown';
    const designation = user?.role || 'unknown';
    const session = sessionNumber || '0';
    const randomNum = Math.floor(10000 + Math.random() * 90000); // 5 digit random number
    
    return `${username}_${designation}_${session}_${randomNum}`;
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const newImagesPromises = Array.from(files).map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            resolve(e.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      });
    });
    
    Promise.all(newImagesPromises).then(newImages => {
      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);
      onImagesChange(updatedImages);
      toast.success(`Added ${newImages.length} image${newImages.length > 1 ? 's' : ''}`);
    });
  };
  
  const handleCameraCapture = () => {
    // Use file input with capture attribute for mobile devices
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.setAttribute('name', generateFileName());
      fileInputRef.current.click();
    }
  };
  
  const handleUpload = () => {
    // Regular file upload without capture attribute
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.setAttribute('name', generateFileName());
      fileInputRef.current.click();
    }
  };
  
  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    onImagesChange(updatedImages);
    toast.success('Image removed');
  };
  
  return (
    <div className="space-y-3">
      <Label>Session Images</Label>
      
      <div className="flex flex-wrap gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleCameraCapture}
          className="flex items-center gap-2"
        >
          <Camera size={16} />
          <span>Take Photo</span>
        </Button>
        
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleUpload}
          className="flex items-center gap-2"
        >
          <Upload size={16} />
          <span>Upload Image</span>
        </Button>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
          multiple
        />
      </div>
      
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-3">
          {images.map((image, index) => (
            <div key={index} className="relative">
              <img 
                src={image} 
                alt={`Uploaded ${generateFileName()}`} 
                className="w-full h-24 object-cover rounded-md"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1 text-white"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
