
import React from 'react';
import { CameraMetadata } from './CameraView';

interface GPSOverlayProps {
  locationData: CameraMetadata;
  fontSize?: number;
  textColor?: string;
}

export const GPSOverlay: React.FC<GPSOverlayProps> = ({ 
  locationData, 
  fontSize = 16,
  textColor = '#ffffff'
}) => {
  const date = new Date(locationData.timestamp);
  const dateString = date.toLocaleDateString();
  const timeString = date.toLocaleTimeString();
  
  const lat = locationData.location.latitude?.toFixed(6) || 'unknown';
  const lng = locationData.location.longitude?.toFixed(6) || 'unknown';

  return (
    <div className="text-white" style={{ fontSize: `${fontSize}px`, color: textColor }}>
      <p className="font-bold mb-1">
        {dateString} {timeString}
      </p>
      <p className="mb-1">
        {lat}, {lng} {locationData.compass && `• ${locationData.compass}`}
      </p>
      <p className="text-xs opacity-80">
        {locationData.location.address}
      </p>
      {locationData.weather && (
        <p className="text-xs mt-1">
          {locationData.weather.condition} {locationData.weather.temperature}
        </p>
      )}
    </div>
  );
};
