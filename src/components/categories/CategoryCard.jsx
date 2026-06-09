import React from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye, EyeOff, Lock } from "lucide-react";
import { motion } from "framer-motion";

export default function CategoryCard({ category, onEdit, onDelete, onToggleVisibility }) {
  const isSubCategory = !!category.parent_category_name;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`relative group rounded-lg ${!category.is_active ? 'opacity-50' : ''}`}
    >
      <div className={`
          flex items-center justify-between gap-2 px-3 py-2 rounded-lg 
          bg-slate-700/50 border border-slate-600/80 
          hover:bg-slate-700 hover:border-slate-600 transition-all duration-200
        `}>
        <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white whitespace-nowrap">{category.name}</h3>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {isSubCategory && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onToggleVisibility(category)}
                    className="text-gray-400 hover:text-white h-7 w-7"
                    title={category.is_active ? 'הסתר' : 'הצג'}
                >
                    {category.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
            )}
            {!category.is_system && isSubCategory && (
            <>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(category)}
                    className="text-gray-400 hover:text-amber-400 h-7 w-7"
                    title="ערוך"
                >
                    <Pencil className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(category)}
                    className="text-gray-400 hover:text-red-400 h-7 w-7"
                    title="מחק"
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </>
            )}
        </div>
      </div>
      {category.is_system && isSubCategory && (
        <div className="absolute -top-1.5 -right-1.5">
            <Lock className="w-3.5 h-3.5 text-amber-400 bg-slate-800 rounded-full p-0.5 border border-amber-500/50" />
        </div>
      )}
    </motion.div>
  );
}