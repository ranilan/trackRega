import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

export default function TransactionEditModal({ isOpen, onOpenChange, transaction, sources, categories, onUpdateTransaction }) {
  const [formData, setFormData] = useState({});
  
  useEffect(() => {
    if (transaction) {
      setFormData({
        amount: transaction.amount || '',
        date: new Date(transaction.date) || new Date(),
        type: transaction.type || 'expense',
        source_id: transaction.source_id || '',
        category_id: transaction.category_id || '',
        description: transaction.description || ''
      });
    }
  }, [transaction]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  const handleSelectChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSubmit = {
      ...formData,
      amount: parseFloat(formData.amount),
      date: format(formData.date, 'yyyy-MM-dd')
    };
    onUpdateTransaction(dataToSubmit);
  };

  const parentCategories = categories.filter(c => c.parent_type === formData.type && !c.parent_category_name);
  const selectedParentName = categories.find(c => c.id === formData.category_id)?.parent_category_name;
  const subCategories = selectedParentName ? categories.filter(c => c.parent_category_name === selectedParentName) : [];

  if (!transaction) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-slate-800 text-white border-slate-700" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">עריכת עסקה</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">סכום</Label>
            <Input id="amount" type="number" value={formData.amount} onChange={handleInputChange} className="col-span-3 bg-slate-700 border-slate-600" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">תאריך</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="col-span-3 justify-start text-right font-normal bg-slate-700 border-slate-600 hover:bg-slate-600 hover:text-white">
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {formData.date ? format(formData.date, 'PPP') : <span>בחר תאריך</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={formData.date} onSelect={(d) => setFormData(prev => ({ ...prev, date: d }))} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="source_id" className="text-right">מקור</Label>
            <Select value={formData.source_id} onValueChange={(val) => handleSelectChange('source_id', val)}>
              <SelectTrigger className="col-span-3 bg-slate-700 border-slate-600">
                <SelectValue placeholder="בחר מקור" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 text-white border-slate-700">
                {sources.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">סוג</Label>
            <Select value={formData.type} onValueChange={(val) => handleSelectChange('type', val)}>
              <SelectTrigger className="col-span-3 bg-slate-700 border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 text-white border-slate-700">
                <SelectItem value="expense">הוצאה</SelectItem>
                <SelectItem value="income">הכנסה</SelectItem>
              </SelectContent>
            </Select>
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category_id" className="text-right">קטגוריה</Label>
            <Select value={formData.category_id} onValueChange={(val) => handleSelectChange('category_id', val)}>
              <SelectTrigger className="col-span-3 bg-slate-700 border-slate-600">
                <SelectValue placeholder="בחר קטגוריה" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 text-white border-slate-700">
                {categories.filter(c => c.parent_type === formData.type).map(c => <SelectItem key={c.id} value={c.id}>{c.parent_category_name ? `${c.parent_category_name} -> ${c.name}` : c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">תיאור</Label>
            <Input id="description" value={formData.description} onChange={handleInputChange} className="col-span-3 bg-slate-700 border-slate-600" />
          </div>
        </form>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit} className="bg-amber-500 hover:bg-amber-600 text-slate-900">שמור שינויים</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}