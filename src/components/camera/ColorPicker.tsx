
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange }) => {
  const [inputValue, setInputValue] = useState(value);
  
  const presetColors = [
    '#ffffff', // white
    '#ffff00', // yellow
    '#ff0000', // red
    '#00ff00', // green
    '#00ffff', // cyan
    '#0000ff', // blue
    '#ff00ff', // magenta
    '#000000', // black
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onChange(e.target.value);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          type="color"
          value={value}
          onChange={handleInputChange}
          className="w-20 h-10 cursor-pointer p-0"
        />
        <Input
          type="text"
          value={value}
          onChange={handleInputChange}
          className="flex-1"
          placeholder="#FFFFFF"
        />
      </div>
      
      <div className="flex flex-wrap gap-2">
        {presetColors.map((color) => (
          <Button
            key={color}
            type="button"
            onClick={() => {
              setInputValue(color);
              onChange(color);
            }}
            className="w-8 h-8 rounded p-0 border"
            style={{ 
              backgroundColor: color,
              borderColor: color === '#ffffff' ? '#ccc' : color
            }}
            aria-label={`Select color ${color}`}
          />
        ))}
      </div>
    </div>
  );
};
