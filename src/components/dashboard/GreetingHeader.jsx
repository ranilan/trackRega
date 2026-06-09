import React from 'react';
import { Button } from "@/components/ui/button";
import { Bell, Hand } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";

export default function GreetingHeader({ userName }) {
  return (
    <div className="flex justify-between items-center mb-8">
      {/* Left: Logo */}


      {/* Center: Greeting */}
      <div className="flex items-center gap-2 text-lg text-emerald-300">
        
        <span>שלום {userName}</span>
        <Hand className="w-6 h-6 text-amber-400" />
      </div>

      {/* Right: Actions & Date */}
      <div className="flex items-center gap-4 text-emerald-300">
        <Button variant="ghost" size="icon" className="text-emerald-300 hover:bg-emerald-800/50 hover:text-white">
          <Bell className="w-6 h-6"/>
        </Button>
        <p className="hidden sm:block text-sm">
          {format(new Date(), "EEEE, d בMMMM yyyy", { locale: he })}
        </p>
      </div>
    </div>
  );
}