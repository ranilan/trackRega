
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function DeleteConfirmDialog({ isOpen, onOpenChange, categoryName, onConfirm, isSystem }) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-slate-800 text-white border-slate-700" dir="rtl">
        <DialogHeader className="text-right">
          <div className="flex items-center gap-3 justify-end mb-2">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <DialogTitle>אישור מחיקה</DialogTitle>
          </div>
          <DialogDescription className="text-gray-300 text-right">
            {isSystem ? (
              <>
                לא ניתן למחוק קטגוריית מערכת <strong className="text-white">"{categoryName}"</strong>.
                <br />
                ניתן רק להסתיר אותה מהתצוגה.
              </>
            ) : (
              <>
                האם אתה בטוח שברצונך למחוק את הקטגוריה <strong className="text-white">"{categoryName}"</strong>?
                <br />
                עסקאות קיימות שמשויכות לקטגוריה זו יישארו עם שם הקטגוריה, אך לא ניתן יהיה להשתמש בה יותר.
                <br />
                פעולה זו אינה ניתנת לביטול.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="bg-transparent border-slate-600 text-slate-300 hover:bg-slate-800 hover:border-slate-500 hover:text-white"
          >
            ביטול
          </Button>
          {!isSystem && (
            <Button 
              onClick={onConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              מחק לצמיתות
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
