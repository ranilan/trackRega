
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function CategorySummaryTable({ 
  title, 
  type, 
  transactions, 
  categories, 
  showSubCategories, 
  sortBy, 
  year 
}) {
  const getCategoryData = () => {
    const data = {};
    
    transactions.forEach(transaction => {
      const category = categories.find(c => c.id === transaction.category_id);
      if (!category) return;

      if (showSubCategories) {
        // Show subcategories
        const key = category.name;
        const parentName = category.parent_category_name || category.name;
        
        if (!data[key]) {
          data[key] = {
            name: category.name,
            parentName,
            amount: 0,
            count: 0,
            isSubCategory: !!category.parent_category_name
          };
        }
        data[key].amount += transaction.amount;
        data[key].count += 1;
      } else {
        // Show only parent categories
        const parentName = category.parent_category_name || category.name;
        
        if (!data[parentName]) {
          data[parentName] = {
            name: parentName,
            parentName: parentName,
            amount: 0,
            count: 0,
            isSubCategory: false
          };
        }
        data[parentName].amount += transaction.amount;
        data[parentName].count += 1;
      }
    });

    const result = Object.values(data);
    
    // Sort data
    if (sortBy === 'amount') {
      result.sort((a, b) => b.amount - a.amount);
    } else {
      result.sort((a, b) => a.name.localeCompare(b.name, 'he'));
    }

    return result;
  };

  const categoryData = getCategoryData();
  const total = categoryData.reduce((sum, item) => sum + item.amount, 0);
  const icon = type === 'income' ? TrendingUp : TrendingDown;
  const colorClass = type === 'income' ? 'text-green-400' : 'text-red-400';
  const bgClass = type === 'income' ? 'bg-green-500/20' : 'bg-red-500/20';

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className={`text-white text-right flex items-center gap-2 ${colorClass}`}>
            {React.createElement(icon, { className: "w-5 h-5" })}
            {title}
          </CardTitle>
          <div className="text-left">
            <Badge variant="outline" className={`${colorClass} border-current`}>
              ₪{total.toLocaleString()}
            </Badge>
            <div className="text-sm text-gray-400 mt-1">
              {categoryData.length} קטגוריות • {transactions.length} עסקאות
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-64 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b-white/20 hover:bg-transparent">
                <TableHead className="text-right text-white">קטגוריה</TableHead>
                <TableHead className="text-right text-white">עסקאות</TableHead>
                <TableHead className="text-right text-white">סכום</TableHead>
                <TableHead className="text-left text-white">%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categoryData.map((item, index) => {
                const percentage = total > 0 ? (item.amount / total * 100) : 0;
                return (
                  <TableRow key={index} className="border-b-white/10 hover:bg-white/5">
                    <TableCell className="text-right">
                      <div className="font-medium text-white">
                        {item.isSubCategory && showSubCategories && (
                          <span className="text-gray-400 text-sm ml-2">{item.parentName} ←</span>
                        )}
                        {item.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-gray-300">
                      {item.count}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`font-mono font-bold ${colorClass}`}>
                        ₪{item.amount.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-left text-gray-300">
                      {percentage.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        
        {categoryData.length === 0 && (
          <div className="text-center py-8">
            <div className={`w-12 h-12 mx-auto mb-4 rounded-full ${bgClass} flex items-center justify-center`}>
              {React.createElement(icon, { className: `w-6 h-6 ${colorClass}` })}
            </div>
            <p className="text-gray-400">אין נתונים להציג עבור {year}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
