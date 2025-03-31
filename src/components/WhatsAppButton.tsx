
import React from "react";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";

interface WhatsAppButtonProps {
  phoneNumber: string;
  message?: string;
  className?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phoneNumber,
  message = "Hello, I need support from Track4Health",
  className,
}) => {
  const handleClick = () => {
    // Format the phone number (remove any non-digit characters)
    const formattedNumber = phoneNumber.replace(/\D/g, "");
    
    // Create the WhatsApp URL
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${formattedNumber}&text=${encodeURIComponent(
      message
    )}`;
    
    // Open WhatsApp in a new tab
    window.open(whatsappUrl, "_blank");
  };
  
  return (
    <Button
      onClick={handleClick}
      variant="outline"
      className={`bg-green-500 hover:bg-green-600 text-white ${className}`}
    >
      <Phone size={18} className="mr-2" />
      WhatsApp Support
    </Button>
  );
};
