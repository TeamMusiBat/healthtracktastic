
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { toCamelCase } from "@/utils/formatters";

interface CamelCaseInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onValueChange: (value: string) => void;
  defaultValue?: string;
}

const CamelCaseInput: React.FC<CamelCaseInputProps> = ({
  onValueChange,
  defaultValue = "",
  ...props
}) => {
  const [value, setValue] = useState(defaultValue);
  const [hasBeenEdited, setHasBeenEdited] = useState(false);
  
  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue);
    }
  }, [defaultValue]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    
    // Only apply camelCase after the first edit
    if (!hasBeenEdited) {
      setHasBeenEdited(true);
    }
  };
  
  const handleBlur = () => {
    if (hasBeenEdited && value.trim() !== "") {
      const formattedValue = toCamelCase(value);
      setValue(formattedValue);
      onValueChange(formattedValue);
      
      // Reset the edit flag, so next time user edits, it will format again
      setHasBeenEdited(false);
    } else if (value.trim() === "") {
      // If empty, just pass the empty value
      onValueChange("");
    }
  };
  
  return (
    <Input
      {...props}
      autoComplete="off"
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
};

export default CamelCaseInput;
