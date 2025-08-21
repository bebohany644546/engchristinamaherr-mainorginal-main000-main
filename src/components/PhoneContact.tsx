import React, { useState } from "react";
import { Phone, MessageCircle } from "lucide-react";
export function PhoneContact() {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const phoneNumbers = ["01228895553", "01273994390"];
  const handleWhatsAppClick = (phoneNumber: string) => {
    // Open WhatsApp with the phone number
    const whatsappUrl = `https://wa.me/${phoneNumber}`;
    window.open(whatsappUrl, '_blank');
    setIsPopoverOpen(false);

    // Play sound effect
    const audio = new Audio("/click-sound.mp3");
    audio.volume = 0.5;
    audio.play().catch(e => console.error("Sound play failed:", e));
  };
  return <div className="fixed bottom-4 left-4 z-50">
      <div className="relative">
        <button onClick={() => setIsPopoverOpen(!isPopoverOpen)} className="flex items-center justify-center w-12 h-12 bg-physics-gold rounded-full shadow-lg hover:bg-yellow-500 transition-all">
          <Phone className="text-physics-navy" size={24} />
        </button>
        
        {isPopoverOpen && <div className="absolute bottom-16 left-0 bg-physics-navy border border-physics-gold rounded-lg shadow-2xl p-4 w-64 animate-fade-in">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-physics-gold font-bold text-lg font-tajawal">تواصل معنا</h3>
              <button onClick={() => setIsPopoverOpen(false)} className="text-white hover:text-physics-gold">
                &times;
              </button>
            </div>
            
            {phoneNumbers.map((phoneNumber, index) => <div key={phoneNumber} className={`flex items-center justify-between ${index !== phoneNumbers.length - 1 ? 'border-b border-gray-700 pb-2 mb-2' : ''}`}>
                <span className="text-white font-tajawal">{phoneNumber}</span>
                <div className="flex space-x-2">
                  <button onClick={() => {
              window.location.href = `tel:${phoneNumber}`;
              setIsPopoverOpen(false);
            }} className="bg-physics-gold text-physics-navy p-2 rounded-full hover:bg-yellow-500">
                    <Phone size={16} />
                  </button>
                  
                </div>
              </div>)}
            
            <p className="text-white text-sm font-tajawal mt-2">يمكنك الاتصال بنا من خلال الارقام الظاهرة امامك</p>
          </div>}
      </div>
    </div>;
}