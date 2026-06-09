import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Target, ArrowLeft } from "lucide-react";
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';

const COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#EF4444']; // Blue, Amber, Green, Red

const DonutChart = ({ percentage, color, name, spent, planned }) => (
  <div className="flex flex-col items-center">
    <div className="w-24 h-24 relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={[{ value: percentage }, { value: 100 - percentage }]}
            cx="50%"
            cy="50%"
            innerRadius="70%"
            outerRadius="100%"
            dataKey="value"
            startAngle={90}
            endAngle={450}
            stroke="none"
          >
            <Cell fill={color} />
            <Cell fill="rgba(255, 255, 255, 0.1)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white font-bold text-lg">{`${Math.round(percentage)}%`}</span>
      </div>
    </div>
    <p className="text-white text-sm mt-2 text-center truncate w-24">{name}</p>
    <p className="text-xs text-slate-400">{`₪${spent.toLocaleString()} / ₪${planned.toLocaleString()}`}</p>
  </div>
);

export default function TopBudgetsChart({ topBudgetsData }) {
  return (
    <Card className="bg-emerald-950/30 backdrop-blur-sm border-emerald-800/30">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">

          <div className="flex items-center gap-2">
             <Target className="w-6 h-6 text-sky-400" />
             <h3 className="text-xl font-bold text-white">סעיפים נבחרים</h3>
             
          </div>
           <Link to={createPageUrl("Budgets")}>
            <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold group">
                מעבר למנהל התקציבים
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
        {topBudgetsData && topBudgetsData.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 justify-items-center">
            {topBudgetsData.map((data, index) => (
              <DonutChart
                key={data.id}
                percentage={data.percentage}
                color={COLORS[index % COLORS.length]}
                name={data.name}
                spent={data.spent}
                planned={data.planned}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-400">לא נמצאו נתוני תקציב פעיל להצגה.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}