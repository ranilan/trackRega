import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";

export default function RecentTransactionsTable({ transactions, categories, sources, onDelete, onEdit }) {

  const getCategoryInfo = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return { name: 'לא מוגדר', parent: '' };
    return { 
      name: category.name, 
      parent: category.parent_category_name || category.name 
    };
  };

  const getSourceName = (sourceId) => {
    return sources.find(s => s.id === sourceId)?.name || 'לא מוגדר';
  };

  return (
    <div className="bg-white/5 p-4 rounded-xl">
      <h3 className="text-lg font-semibold text-white mb-4 text-right">10 עסקאות אחרונות</h3>
      <Table>
        <TableHeader>
          <TableRow className="border-b-white/20 hover:bg-transparent">
            <TableHead className="text-right text-white">תאריך</TableHead>
            <TableHead className="text-right text-white">קטגוריה</TableHead>
            <TableHead className="text-right text-white">מקור</TableHead>
            <TableHead className="text-center text-white">סכום</TableHead>
            <TableHead className="text-left text-white">פעולות</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => {
            const categoryInfo = getCategoryInfo(tx.category_id);
            return (
              <TableRow key={tx.id} className="border-b-white/10 hover:bg-white/10">
                <TableCell className="text-right text-gray-300">
                  {format(new Date(tx.date), "dd/MM/yy", { locale: he })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="font-medium text-white">{categoryInfo.name}</div>
                  <div className="text-xs text-gray-400">{categoryInfo.parent}</div>
                </TableCell>
                <TableCell className="text-right text-gray-300">{getSourceName(tx.source_id)}</TableCell>
                <TableCell className="text-center">
                  <Badge 
                    className={`font-mono text-sm ${
                      tx.type === 'income' 
                      ? 'bg-green-500/20 text-green-300 border-green-500/50' 
                      : 'bg-red-500/20 text-red-300 border-red-500/50'
                    }`}
                    variant="outline"
                  >
                    {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()} ₪
                  </Badge>
                </TableCell>
                <TableCell className="text-left">
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-amber-400 h-8 w-8" onClick={() => onEdit(tx)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-400 h-8 w-8" onClick={() => onDelete(tx.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}