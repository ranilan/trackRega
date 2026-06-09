import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BarChart3 } from "lucide-react";

export default function YearlyComparisonBarChart({ data }) {
  const totalIncome = data.reduce((sum, item) => sum + item.income, 0);
  const totalExpense = data.reduce((sum, item) => sum + item.expense, 0);

  return (
    <Card className="bg-emerald-950/30 backdrop-blur-sm border-emerald-800/30">
      <CardHeader>
        <div className="flex items-center justify-between">
            <div className="flex gap-6 justify-end">
              <div className="flex items-center gap-2">
                <span className="text-green-400 font-bold">₪{totalIncome.toLocaleString()}</span>
                <span className="text-gray-400 text-sm">סה"כ הכנסות שנתי</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-400 font-bold">₪{totalExpense.toLocaleString()}</span>
                <span className="text-gray-400 text-sm">סה"כ הוצאות שנתי</span>
              </div>
            </div>
            <CardTitle className="text-white text-right flex items-center gap-2">
              הכנסות מול הוצאות - שנתי
              <BarChart3 className="w-5 h-5 text-sky-400" />
            </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis 
                dataKey="month" 
                stroke="#9CA3AF"
                tick={{ fontSize: 12, textAnchor: 'middle' }}
              />
              <YAxis 
                stroke="#9CA3AF"
                tick={{ fontSize: 12, textAnchor: 'end' }}
                tickFormatter={(value) => new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value)}
                width={80}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(4, 29, 49, 0.9)',
                  border: '1px solid rgba(14, 165, 233, 0.3)',
                  borderRadius: '8px',
                  color: 'white',
                  textAlign: 'right'
                }}
                formatter={(value, name) => [
                  `₪${value.toLocaleString()}`,
                  name === 'income' ? 'הכנסות' : 'הוצאות'
                ]}
                labelFormatter={(label) => data.find(d => d.month === label)?.monthFull}
                cursor={{ fill: 'rgba(14, 165, 233, 0.1)' }}
              />
              <Legend 
                wrapperStyle={{ direction: 'rtl', paddingRight: '20px' }}
                formatter={(value) => value === 'income' ? 'הכנסות' : 'הוצאות'}
              />
              <Bar dataKey="income" fill="#10B981" name="income" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="#EF4444" name="expense" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}