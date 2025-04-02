
import React, { forwardRef, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { toCamelCase } from "@/utils/formatters";

interface CamelCaseInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  onValueChange?: (value: string) => void;
  defaultValue?: string;
}

const CamelCaseInput = forwardRef<HTMLInputElement, CamelCaseInputProps>(
  ({ onValueChange, defaultValue = "", className, ...props }, ref) => {
    const [value, setValue] = useState(defaultValue);
    const [camelCased, setCamelCased] = useState(defaultValue);
    const [hasFocus, setHasFocus] = useState(false);
    
    useEffect(() => {
      if (defaultValue !== value) {
        setValue(defaultValue);
        setCamelCased(toCamelCase(defaultValue));
      }
    }, [defaultValue]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);
      
      // Don't camelCase during typing
      if (!hasFocus) {
        const formattedValue = toCamelCase(newValue);
        setCamelCased(formattedValue);
        if (onValueChange) onValueChange(formattedValue);
      } else {
        if (onValueChange) onValueChange(newValue);
      }
    };
    
    const handleBlur = () => {
      setHasFocus(false);
      const formattedValue = toCamelCase(value);
      setValue(formattedValue);
      setCamelCased(formattedValue);
      if (onValueChange) onValueChange(formattedValue);
    };
    
    const handleFocus = () => {
      setHasFocus(true);
    };
    
    return (
      <Input
        ref={ref}
        value={hasFocus ? value : camelCased}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        className={className}
        {...props}
      />
    );
  }
);

CamelCaseInput.displayName = "CamelCaseInput";

export default CamelCaseInput;
