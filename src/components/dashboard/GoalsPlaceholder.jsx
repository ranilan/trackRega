import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Rocket } from "lucide-react";

export default function GoalsPlaceholder() {
  return (
    <Card className="bg-emerald-950/30 backdrop-blur-sm border-emerald-800/30">
      <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full min-h-[150px]">
        <Rocket className="w-8 h-8 text-purple-400 mb-3" />
        <h3 className="text-lg font-bold text-white">מעקב יעדים</h3>
        <p className="text-sm text-slate-400 mt-1">ייבנה בהמשך...</p>
      </CardContent>
    </Card>
  );
}