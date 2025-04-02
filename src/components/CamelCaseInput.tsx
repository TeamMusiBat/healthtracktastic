
import React, { useState, useEffect, forwardRef } from "react";
import { Input } from "@/components/ui/input";

interface CamelCaseInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  defaultValue?: string;
  onValueChange: (value: string) => void;
}

const CamelCaseInput = forwardRef<HTMLInputElement, CamelCaseInputProps>(
  ({ defaultValue = "", onValueChange, ...props }, ref) => {
    const [value, setValue] = useState(defaultValue);

    useEffect(() => {
      setValue(defaultValue);
    }, [defaultValue]);

    const formatToCamelCase = (input: string): string => {
      // Trim whitespace from start and end
      let trimmed = input.trim();
      
      // If empty, return empty string
      if (!trimmed) return "";
      
      // Split on one or more spaces
      const words = trimmed.split(/\s+/);
      
      // Map each word to capitalize first letter, lowercase rest
      const camelCased = words.map(
        word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      );
      
      // Join with spaces
      return camelCased.join(" ");
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);
      
      // Only camelcase if there's actual content
      if (newValue.trim()) {
        // For better UX, we delay the camelcase formatting until blur
        // This way user can type naturally, and we format when they're done
      }
    };
    
    const handleBlur = () => {
      const formattedValue = formatToCamelCase(value);
      setValue(formattedValue);
      onValueChange(formattedValue);
    };

    return (
      <Input
        ref={ref}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        {...props}
      />
    );
  }
);

CamelCaseInput.displayName = "CamelCaseInput";

export default CamelCaseInput;
