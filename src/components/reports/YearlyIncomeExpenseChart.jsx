import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from "lucide-react";

export default function YearlyIncomeExpenseChart({ data }) {
  const totalIncome = data.reduce((sum, item) => sum + item.income, 0);
  const totalExpense = data.reduce((sum, item) => sum + item.expense, 0);

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader>
        <CardTitle className="text-white text-right flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          הכנסות מול הוצאות - מגמה שנתית
        </CardTitle>
        <div className="flex gap-6 justify-end mt-2">
          <div className="flex items-center gap-2">
            <span className="text-green-400 font-bold">₪{totalIncome.toLocaleString()}</span>
            <span className="text-gray-400 text-sm">סה"כ הכנסות</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-red-400 font-bold">₪{totalExpense.toLocaleString()}</span>
            <span className="text-gray-400 text-sm">סה"כ הוצאות</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="month" 
                stroke="#9CA3AF"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="#9CA3AF"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `₪${value.toLocaleString()}`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  textAlign: 'right'
                }}
                formatter={(value, name) => [
                  `₪${value.toLocaleString()}`,
                  name === 'income' ? 'הכנסות' : 'הוצאות'
                ]}
                labelFormatter={(label) => data.find(d => d.month === label)?.monthFull}
              />
              <Legend 
                wrapperStyle={{ textAlign: 'right', color: 'white' }}
                formatter={(value) => value === 'income' ? 'הכנסות' : 'הוצאות'}
              />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#10B981' }}
                name="income"
              />
              <Line 
                type="monotone" 
                dataKey="expense" 
                stroke="#EF4444" 
                strokeWidth={3}
                dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#EF4444' }}
                name="expense"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}