import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Activity, ArrowLeft } from "lucide-react";

export default function TrackingCTA({ lastTransactionInfo }) {
  return (
    <Card className="bg-emerald-950/30 backdrop-blur-sm border-emerald-800/30">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-md">
            <Activity className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            {lastTransactionInfo ? (
              <p className="text-sm text-emerald-300">
                פעם אחרונה ביצעת מעקב ב-{lastTransactionInfo.date}
                <span className="text-emerald-400/80 text-xs mr-2">
                  ({lastTransactionInfo.daysSince === 0 ? 'היום' : `לפני ${lastTransactionInfo.daysSince} ימים`})
                </span>
              </p>
            ) : (
              <p className="text-sm text-emerald-300">עדיין לא ביצעת מעקב. זה הזמן להתחיל!</p>
            )}
          </div>
        </div>

        <Link to={createPageUrl("AddTransaction")}>
          <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold group">
            מעבר למסך המעקב
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}