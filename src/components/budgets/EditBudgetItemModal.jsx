import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Budget } from '@/entities/Budget';

export default function EditBudgetItemModal({ isOpen, onOpenChange, budgetItem, onUpdate }) {
  const [amount, setAmount] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (budgetItem) {
      setAmount(budgetItem.monthly_amount.toString());
    }
  }, [budgetItem]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const newAmount = parseFloat(amount);
      if (isNaN(newAmount) || newAmount < 0) {
        alert("נא להזין סכום חוקי.");
        return;
      }
      await Budget.update(budgetItem.id, { monthly_amount: newAmount });
      onUpdate(); // This will trigger a data reload and close the modal
    } catch (error) {
      console.error("Failed to update budget item:", error);
      alert("שגיאה בעדכון הסעיף.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!budgetItem) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-slate-800 text-white border-slate-700" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">עריכת סעיף תקציב</DialogTitle>
          <DialogDescription className="text-right text-slate-400">
            עדכן את סכום התכנון החודשי עבור "{budgetItem.name}".
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right col-span-1">
              סכום חודשי
            </Label>
            <div className="relative col-span-3">
               <span className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-gray-400">₪</span>
               <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white text-right pr-8"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="ml-2 bg-transparent border-slate-600 hover:bg-slate-700">
            ביטול
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-amber-500 hover:bg-amber-600 text-slate-900">
            {isSaving ? 'שומר...' : 'שמור שינויים'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}