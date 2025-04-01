
import React, { forwardRef, useImperativeHandle, useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { toCamelCase } from "@/utils/formatters";

interface CamelCaseInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  defaultValue?: string;
  onValueChange: (value: string) => void;
}

// Forward ref and export component
const CamelCaseInput = forwardRef<HTMLInputElement, CamelCaseInputProps>(
  ({ defaultValue = "", onValueChange, ...props }, ref) => {
    const [value, setValue] = useState(defaultValue || "");
    const inputRef = useRef<HTMLInputElement>(null);
    
    // Forward ref to the internal input element
    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      setValue(rawValue);
    };
    
    const handleBlur = () => {
      const formattedValue = toCamelCase(value);
      setValue(formattedValue);
      onValueChange(formattedValue);
    };
    
    // Reset function to be called by parent
    React.useEffect(() => {
      if (defaultValue !== undefined) {
        setValue(defaultValue);
      }
    }, [defaultValue]);
    
    return (
      <Input
        {...props}
        ref={inputRef}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
      />
    );
  }
);

CamelCaseInput.displayName = 'CamelCaseInput';

export default CamelCaseInput;
