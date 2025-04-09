
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

  // Split the address into smaller lines if it's too long
  const address = locationData.location.address || '';
  const addressLines = address.length > 30 
    ? address.split(', ').filter(Boolean)
    : [address];

  return (
    <div className="text-white px-2 py-1" style={{ fontSize: `${fontSize}px`, color: textColor }}>
      <p className="font-bold mb-1">
        {dateString} {timeString}
      </p>
      <p className="mb-1">
        {lat}, {lng} {locationData.compass && `• ${locationData.compass}`}
      </p>
      {addressLines.map((line, index) => (
        <p key={index} className="text-xs opacity-80">
          {line}
        </p>
      ))}
      {locationData.note && (
        <p className="text-xs mt-1 font-medium">
          Note: {locationData.note}
        </p>
      )}
    </div>
  );
};
