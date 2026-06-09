import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, Calendar } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";

const StatItem = ({ icon: Icon, label, value, colorClass, isCurrency = true }) => (
  <div className="flex items-center justify-between p-4 bg-emerald-950/40 rounded-lg">
    <div className="text-right">
      <p className="text-sm text-emerald-400">{label}</p>
      <p className={`text-2xl font-bold ${colorClass}`}>
        {isCurrency ? `₪${value.toLocaleString()}` : value}
      </p>
    </div>
    <div className={`p-3 rounded-lg ${colorClass.replace('text', 'bg').replace('-400', '-500/20')}`}>
      <Icon className={`w-6 h-6 ${colorClass}`} />
    </div>
  </div>
);

export default function MonthlySummary({ income, expenses, ytdBalance }) {
  const netBalance = income - expenses;

  return (
    <Card className="bg-emerald-950/30 backdrop-blur-sm border-emerald-800/30 h-full">
      <CardContent className="p-6 flex flex-col h-full">
        <h2 className="text-2xl font-bold text-white text-right mb-6">
          סיכום חודש {format(new Date(), 'MMMM', { locale: he })}
        </h2>
        <div className="space-y-4 flex-grow">
          <StatItem icon={TrendingUp} label="הכנסות" value={income} colorClass="text-green-400" />
          <StatItem icon={TrendingDown} label="הוצאות" value={expenses} colorClass="text-red-400" />
          <StatItem 
            icon={Wallet} 
            label="יתרה" 
            value={netBalance} 
            colorClass={netBalance >= 0 ? "text-green-400" : "text-red-400"} 
          />
        </div>
        <div className="mt-6 pt-4 border-t border-emerald-800/50">
           <StatItem 
            icon={Calendar} 
            label="יתרה מתחילת השנה" 
            value={ytdBalance} 
            colorClass={ytdBalance >= 0 ? "text-sky-400" : "text-red-400"} 
          />
        </div>
      </CardContent>
    </Card>
  );
}