
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Landmark, CreditCard, Wallet, Briefcase, TrendingUp, Calendar as CalendarIcon } from "lucide-react";

const sourceTypes = [
  { value: "bank", label: "בנק", icon: Landmark },
  { value: "credit_card", label: "כרטיס אשראי", icon: CreditCard },
  { value: "cash", label: "מזומן", icon: Wallet },
  { value: "digital_wallet", label: "ארנק דיגיטלי", icon: Wallet },
  { value: "investment", label: "השקעות", icon: TrendingUp },
  { value: "other", label: "אחר", icon: Briefcase }
];

export default function SourceForm({ source, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    type: "bank",
    starting_balance: 0,
    starting_balance_date: new Date().toISOString().split('T')[0],
    currency: "ILS",
    is_active: true,
    description: ""
  });

  useEffect(() => {
    if (source) {
      setFormData({
        name: source.name || "",
        type: source.type || "bank",
        starting_balance: source.starting_balance || 0,
        starting_balance_date: source.starting_balance_date || new Date().toISOString().split('T')[0],
        currency: source.currency || "ILS",
        is_active: source.is_active !== undefined ? source.is_active : true,
        description: source.description || ""
      });
    }
  }, [source]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-right">
            {source ? 'עריכת מקור כספי' : 'מקור כספי חדש'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white text-right">שם המקור</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="לדוגמה: בנק הפועלים, כרטיס ויזה"
                  className="bg-slate-800/50 border-white/20 text-white text-right"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="text-white text-right">סוג המקור</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger className="bg-slate-800/50 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {sourceTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <SelectItem key={type.value} value={type.value} className="text-white">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="starting_balance" className="text-white text-right">יתרה התחלתית</Label>
                <Input
                  id="starting_balance"
                  type="number"
                  step="0.01"
                  value={formData.starting_balance}
                  onChange={(e) => handleInputChange('starting_balance', parseFloat(e.target.value) || 0)}
                  className="bg-slate-800/50 border-white/20 text-white text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="starting_balance_date" className="text-white text-right">נכון לתאריך</Label>
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className="w-full justify-end text-right font-normal bg-slate-800/50 border-white/20 text-white hover:bg-slate-700 hover:text-white"
                        >
                            {formData.starting_balance_date ? format(new Date(formData.starting_balance_date), 'PPP') : <span>בחר תאריך</span>}
                            <CalendarIcon className="mr-2 h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={new Date(formData.starting_balance_date)}
                            onSelect={(date) => handleInputChange('starting_balance_date', format(date, 'yyyy-MM-dd'))}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency" className="text-white text-right">מטבע</Label>
                <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                  <SelectTrigger className="bg-slate-800/50 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="ILS" className="text-white">שקל ישראלי (ILS)</SelectItem>
                    <SelectItem value="USD" className="text-white">דולר אמריקני (USD)</SelectItem>
                    <SelectItem value="EUR" className="text-white">יורו (EUR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white text-right">תיאור (אופציונלי)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="תיאור נוסף על המקור הכספי..."
                className="bg-slate-800/50 border-white/20 text-white text-right h-20"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onCancel} className="bg-transparent border-slate-600 text-slate-300 hover:bg-slate-800 hover:border-slate-500 hover:text-white">
                ביטול
              </Button>
              <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold">
                {source ? 'עדכן מקור' : 'צור מקור'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
