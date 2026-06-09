import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";

export default function CategoryForm({ initialData, categories, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    parent_type: "expense",
    parent_category_name: null,
    color: "#64748b",
    icon: "📝",
    is_active: true,
    is_system: false
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        parent_type: initialData.parent_type || "expense",
        parent_category_name: initialData.parent_category_name || null,
        color: initialData.color || "#64748b",
        icon: initialData.icon || "📝",
        is_active: initialData.is_active !== undefined ? initialData.is_active : true,
        is_system: initialData.is_system || false
      });
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isEditingParentCategory = !formData.parent_category_name;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <DialogHeader>
        <DialogTitle className="text-right text-white">
          {initialData?.name ? 'עריכת קטגוריה' : 
           formData.parent_category_name ? 'תת-קטגוריה חדשה' : 'קטגוריה ראשית חדשה'}
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-white text-right">שם הקטגוריה</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="הכנס שם לקטגוריה"
            className="bg-slate-700/50 border-slate-600 text-white text-right"
            required
          />
        </div>

        {!formData.parent_category_name && (
          <>
            <div className="space-y-2">
              <Label htmlFor="type" className="text-white text-right">סוג הקטגוריה</Label>
              <Select 
                value={formData.parent_type} 
                onValueChange={(value) => handleInputChange('parent_type', value)}
              >
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="expense" className="text-white">הוצאה</SelectItem>
                  <SelectItem value="income" className="text-white">הכנסה</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="color" className="text-white text-right">צבע</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="color"
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    className="w-12 h-10 rounded-lg border-2 border-slate-600"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white flex-1"
                    placeholder="#64748b"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon" className="text-white text-right">אייקון</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => handleInputChange('icon', e.target.value)}
                  placeholder="📝"
                  className="bg-slate-700/50 border-slate-600 text-white text-center text-2xl"
                  maxLength={2}
                />
              </div>
            </div>
          </>
        )}

        {formData.parent_category_name && (
          <div className="p-3 bg-slate-700/30 rounded-lg text-right">
            <p className="text-white text-sm">
              <span className="text-gray-400">תת-קטגוריה תחת:</span>{" "}
              <span className="font-semibold">{formData.parent_category_name}</span>
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="bg-transparent border-slate-600 text-slate-300 hover:bg-slate-800 hover:border-slate-500 hover:text-white"
          >
            ביטול
          </Button>
          <Button 
            type="submit" 
            className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold"
          >
            {initialData?.name ? 'עדכן' : 'צור'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}