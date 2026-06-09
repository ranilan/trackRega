import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Wallet } from "lucide-react";

export default function MonthlyBalanceChart({ data }) {
  const averageBalance = data.reduce((sum, item) => sum + item.balance, 0) / data.length;
  const positiveMonths = data.filter(item => item.balance > 0).length;
  const negativeMonths = data.filter(item => item.balance < 0).length;

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader>
        <CardTitle className="text-white text-right flex items-center gap-2">
          <Wallet className="w-5 h-5 text-amber-400" />
          יתרה חודשית
        </CardTitle>
        <div className="flex gap-6 justify-end mt-2">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold">₪{averageBalance.toLocaleString()}</span>
            <span className="text-gray-400 text-sm">יתרה ממוצעת</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400 font-bold">{positiveMonths}</span>
            <span className="text-gray-400 text-sm">חודשים חיוביים</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-red-400 font-bold">{negativeMonths}</span>
            <span className="text-gray-400 text-sm">חודשים שליליים</span>
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
                formatter={(value) => [`₪${value.toLocaleString()}`, 'יתרה']}
                labelFormatter={(label) => data.find(d => d.month === label)?.monthFull}
              />
              <ReferenceLine y={0} stroke="#6B7280" strokeDasharray="2 2" />
              <Line 
                type="monotone" 
                dataKey="balance" 
                stroke="#F59E0B" 
                strokeWidth={3}
                dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#F59E0B' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}