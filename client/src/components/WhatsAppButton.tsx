import { MessageCircle } from "lucide-react";
import { useState } from "react";

export function WhatsAppButton() {
  const [isHovered, setIsHovered] = useState(false);
  
  const whatsappNumber = "447446610660"; // UK number without + and spaces
  const message = "Hi! I'm interested in learning more about your Electric bikes.";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex items-center gap-3 bg-[#25D366] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        data-testid="button-whatsapp"
      >
        <div className="flex items-center gap-3 px-4 py-3 relative z-10">
          <MessageCircle className="h-6 w-6" />
          <span
            className={`font-medium overflow-hidden transition-all duration-300 ${
              isHovered ? "max-w-[200px] opacity-100" : "max-w-0 opacity-0"
            }`}
          >
            Chat with us
          </span>
        </div>
        
        {/* Pulse animation ring - pointer-events-none prevents blocking clicks */}
        <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20 pointer-events-none" />
      </a>
    </div>
  );
}
