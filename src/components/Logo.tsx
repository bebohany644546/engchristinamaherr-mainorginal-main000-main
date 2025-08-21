
import React from "react";
import { Avatar } from "@/components/ui/avatar";

export function Logo() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="h-16 w-16 flex items-center justify-center">
        <Avatar className="h-16 w-16 border-2 border-physics-gold shadow-lg">
          <img 
            alt="Eng.Christina Maher" 
            src="/lovable-uploads/d3fa3125-e6e6-4060-ac05-fa22706c8cb2.jpg" 
            className="h-16 w-16 rounded-full object-cover shadow-inner" 
            style={{
              objectFit: "cover",
              imageRendering: "auto"
            }}
          />
        </Avatar>
      </div>
      <h1 className="text-2xl font-bold text-physics-gold mr-3 font-tajawal drop-shadow-lg">
        Eng.Christina Maher
      </h1>
    </div>
  );
}
