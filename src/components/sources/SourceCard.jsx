
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export default function SourceCard({ source, onEdit, onDelete, sourceIcons, sourceTypeNames }) {
  const Icon = sourceIcons[source.type] || sourceIcons.other;
  
  const sourceColors = {
    bank: "from-blue-400 to-blue-600",
    credit_card: "from-purple-400 to-purple-600", 
    cash: "from-green-400 to-green-600",
    digital_wallet: "from-sky-400 to-sky-600",
    investment: "from-amber-400 to-amber-600",
    other: "from-gray-400 to-gray-600"
  };

  const colors = sourceColors[source.type] || sourceColors.other;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${colors} opacity-5`}></div>
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(source)}
                className="text-gray-400 hover:text-amber-400 h-8 w-8"
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(source)}
                className="text-gray-400 hover:text-red-400 h-8 w-8"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className={`p-3 rounded-xl bg-gradient-to-br ${colors} opacity-20`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="text-right space-y-2">
            <div className="flex items-center gap-2 justify-end">
              <Badge 
                variant={source.is_active ? "default" : "secondary"}
                className={source.is_active ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}
              >
                {source.is_active ? "פעיל" : "לא פעיל"}
              </Badge>
              <h3 className="text-lg font-bold text-white">{source.name}</h3>
            </div>
            
            <p className="text-gray-400 text-sm">{sourceTypeNames[source.type]}</p>
            
            <div className="pt-2">
              <p className="text-2xl font-bold text-white">
                {source.currency === 'ILS' ? '₪' : source.currency} {source.calculated_balance?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) || '0.00'}
              </p>
            </div>
            
            {source.description && (
              <p className="text-gray-300 text-sm mt-2 leading-relaxed">{source.description}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
