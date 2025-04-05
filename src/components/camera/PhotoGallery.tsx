import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Image as ImageIcon, 
  MapPin, 
  Calendar, 
  Share2, 
  Download, 
  Trash2,
  Search,
  ArrowUpDown,
  X
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CameraMetadata } from './CameraView';

// Replace the PhotoMetadata with CameraMetadata from CameraView
interface Photo {
  id: string;
  src: string;
  metadata: CameraMetadata;
}

interface PhotoGalleryProps {
  initialPhotos?: Photo[];
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ initialPhotos = [] }) => {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  
  // Load photos from localStorage on component mount
  useEffect(() => {
    const savedPhotos = localStorage.getItem('gpsPhotos');
    if (savedPhotos) {
      try {
        setPhotos(JSON.parse(savedPhotos));
      } catch (error) {
        console.error('Failed to parse saved photos', error);
      }
    }
  }, []);
  
  // Save photos to localStorage whenever the photos array changes
  useEffect(() => {
    localStorage.setItem('gpsPhotos', JSON.stringify(photos));
  }, [photos]);

  const addPhoto = (photo: Photo) => {
    setPhotos(prevPhotos => [photo, ...prevPhotos]);
  };

  const deletePhoto = (id: string) => {
    setPhotos(prevPhotos => prevPhotos.filter(photo => photo.id !== id));
    if (selectedPhoto?.id === id) {
      setSelectedPhoto(null);
    }
  };

  const downloadPhoto = (photo: Photo) => {
    const link = document.createElement('a');
    link.href = photo.src;
    link.download = `gps-photo-${photo.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sharePhoto = async (photo: Photo) => {
    if (navigator.share) {
      try {
        const blob = await fetch(photo.src).then(res => res.blob());
        const file = new File([blob], `gps-photo-${photo.id}.jpg`, { type: 'image/jpeg' });
        
        await navigator.share({
          title: 'GPS Photo',
          text: `Photo taken at: ${photo.metadata.location.address}`,
          files: [file]
        });
      } catch (error) {
        console.error("Error sharing photo:", error);
      }
    } else {
      console.error("Web Share API not supported");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Filter and sort photos
  const filteredPhotos = photos
    .filter(photo => 
      photo.metadata.location.address.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.metadata.timestamp).getTime();
      const dateB = new Date(b.metadata.timestamp).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  const toggleSortOrder = () => {
    setSortOrder(current => current === 'newest' ? 'oldest' : 'newest');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <h2 className="text-2xl font-bold">Photo Gallery</h2>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSortOrder}
            title={`Sort by: ${sortOrder === 'newest' ? 'Newest first' : 'Oldest first'}`}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No Photos Yet</h3>
          <p className="text-muted-foreground max-w-sm mt-2">
            Your captured photos with GPS information will appear here.
          </p>
        </div>
      ) : filteredPhotos.length === 0 ? (
        <div className="text-center py-8">
          <Search className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <p>No photos match your search.</p>
          {searchTerm && (
            <Button
              variant="ghost"
              onClick={() => setSearchTerm('')}
              className="mt-2"
            >
              Clear search
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredPhotos.map(photo => (
            <Card 
              key={photo.id} 
              className="overflow-hidden group relative"
            >
              <Dialog>
                <DialogTrigger asChild>
                  <div 
                    className="aspect-video cursor-pointer relative overflow-hidden" 
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <img 
                      src={photo.src} 
                      alt={`Photo at ${photo.metadata.location.address}`}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                      <div className="p-3 text-white">
                        <p className="text-sm truncate">{photo.metadata.location.address}</p>
                      </div>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Photo Details</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                      <img 
                        src={photo.src} 
                        alt="Full size" 
                        className="w-full h-auto rounded-md"
                      />
                    </div>
                    <div className="flex flex-col space-y-4 lg:w-64">
                      <Tabs defaultValue="info">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="info">Info</TabsTrigger>
                          <TabsTrigger value="actions">Actions</TabsTrigger>
                        </TabsList>
                        <TabsContent value="info" className="space-y-3">
                          <div>
                            <h4 className="text-sm font-medium flex items-center gap-2">
                              <Calendar className="h-4 w-4" /> Date & Time
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(photo.metadata.timestamp)}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium flex items-center gap-2">
                              <MapPin className="h-4 w-4" /> Location
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {photo.metadata.location.latitude}, {photo.metadata.location.longitude}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {photo.metadata.location.address}
                            </p>
                          </div>
                        </TabsContent>
                        <TabsContent value="actions" className="space-y-2">
                          <Button 
                            onClick={() => downloadPhoto(photo)}
                            className="w-full justify-start"
                          >
                            <Download className="mr-2 h-4 w-4" /> Download
                          </Button>
                          <Button 
                            onClick={() => sharePhoto(photo)}
                            className="w-full justify-start"
                            variant="secondary"
                          >
                            <Share2 className="mr-2 h-4 w-4" /> Share
                          </Button>
                          <Button 
                            onClick={() => deletePhoto(photo.id)}
                            className="w-full justify-start"
                            variant="destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </Button>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <div className="p-2 flex justify-between items-center">
                <div className="text-xs text-muted-foreground overflow-hidden">
                  {formatDate(photo.metadata.timestamp)}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePhoto(photo.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
