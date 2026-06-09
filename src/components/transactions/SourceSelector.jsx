
import React, { useRef } from 'react';
import { CreditCard, Landmark, Wallet, Briefcase, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

const sourceIcons = {
  bank: Landmark,
  credit_card: CreditCard,
  cash: Wallet,
  digital_wallet: Wallet,
  investment: TrendingUp,
  other: Briefcase
};

const sourceColors = {
  bank: "from-blue-400 to-blue-600",
  credit_card: "from-purple-400 to-purple-600",
  cash: "from-green-400 to-green-600",
  digital_wallet: "from-sky-400 to-sky-600",
  investment: "from-amber-400 to-amber-600",
  other: "from-gray-400 to-gray-600"
};

export default function SourceSelector({ sources, transactions, categories, activeSourceId, onSourceChange }) {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      // Fixed scroll direction for RTL
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };
  
  const getLastTransactionForSource = (sourceId) => {
    const sourceTransactions = transactions
      .filter(tx => tx.source_id === sourceId)
      .sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime());
    
    const lastTx = sourceTransactions[0];

    if (!lastTx) return null;

    const category = categories.find(cat => cat.id === lastTx.category_id);
    return {
      date: format(new Date(lastTx.date), 'dd-MMM', { locale: he }),
      amount: lastTx.amount,
      categoryName: category?.name || 'ללא קטגוריה',
      type: lastTx.type
    };
  };

  if (!sources || sources.length === 0) {
    return (
      <Card className="bg-white/5 p-6 text-center text-gray-400">
        לא נמצאו מקורות כספיים. <Link to={createPageUrl("Sources")} className="text-amber-400 underline">הוסף מקור חדש</Link>.
      </Card>
    );
  }

  return (
    <div className="relative group">
      <Button
        variant="outline"
        size="icon"
        onClick={() => scroll('left')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-slate-800/80 border-white/20 text-white hover:bg-slate-700/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
      
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto custom-scrollbar px-4"
      >
        {sources.map((source) => {
          const Icon = sourceIcons[source.type] || Briefcase;
          const colors = sourceColors[source.type] || sourceColors.other;
          const isActive = source.id === activeSourceId;
          const lastTx = getLastTransactionForSource(source.id);
          
          return (
            <div
              key={source.id}
              onClick={() => onSourceChange(source.id)}
              className={`
                relative p-4 rounded-xl cursor-pointer transition-all duration-300 h-32 min-w-[200px]
                bg-slate-800/50 border border-transparent
                ${isActive ? 'ring-2 ring-amber-400 shadow-lg shadow-amber-500/20' : 'hover:bg-slate-700/50'}
              `}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${colors} opacity-10 rounded-xl`}></div>
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-white text-right">{source.name}</span>
                  <Icon className="w-5 h-5 text-gray-400" />
                </div>
                <div className="text-right mt-2">
                  <span className="text-xs text-gray-500">עסקה אחרונה</span>
                  {lastTx ? (
                    <p className="text-sm font-semibold text-white truncate">
                      {lastTx.date} | {lastTx.type === 'expense' ? '-' : '+'}{lastTx.amount}₪ | {lastTx.categoryName}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400">אין עסקאות</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={() => scroll('right')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-slate-800/80 border-white/20 text-white hover:bg-slate-700/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(251, 191, 36, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(251, 191, 36, 0.7);
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(251, 191, 36, 0.5) rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}
