import React, { useState, useEffect } from "react";
import { Budget, Category, Transaction } from "@/entities/all";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, eachMonthOfInterval, differenceInDays } from "date-fns";
import { he } from "date-fns/locale";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

import GreetingHeader from "../components/dashboard/GreetingHeader";
import MonthlySummary from "../components/dashboard/MonthlySummary";
import TrackingCTA from "../components/dashboard/TrackingCTA";
import TopBudgetsChart from "../components/dashboard/TopBudgetsChart";
import GoalsPlaceholder from "../components/dashboard/GoalsPlaceholder";
import YearlyComparisonBarChart from "../components/dashboard/YearlyComparisonBarChart";
import { useDemoMode } from "../components/DemoModeContext";

export default function Dashboard() {
  const { isDemoMode, toggleDemoMode, getCurrentUser, filterDataForDemo, realUser } = useDemoMode();
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [isDemoMode]);

  const loadData = async () => {
    setLoading(true);
    try {
      const currentUser = getCurrentUser();
      setUser(currentUser);

      const userEmail = currentUser?.email;
      if (!userEmail) {
        setLoading(false);
        return;
      }

      const [transactionsData, budgetsData, categoriesData] = await Promise.all([
        Transaction.filter({ created_by: userEmail }),
        Budget.filter({ created_by: userEmail }),
        Category.filter({ created_by: userEmail }),
      ]);

      setTransactions(filterDataForDemo(transactionsData, 'transactions'));
      setBudgets(filterDataForDemo(budgetsData, 'budgets'));
      setCategories(filterDataForDemo(categoriesData, 'categories'));

    } catch (error)
    {
      console.error("Error loading dashboard data:", error);
    }
    setLoading(false);
  };
  
  // Calculations
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const yearStart = startOfYear(now);

  const currentMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= monthStart && transactionDate <= monthEnd;
  });

  const ytdTransactions = transactions.filter(t => new Date(t.date) >= yearStart);

  const currentMonthIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const currentMonthExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const ytdIncome = ytdTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const ytdExpenses = ytdTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const ytdBalance = ytdIncome - ytdExpenses;

  const lastTransactionInfo = (() => {
    if (transactions.length === 0) return null;
    const lastTransaction = [...transactions].sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime())[0];
    const daysSince = differenceInDays(now, new Date(lastTransaction.created_date));
    return {
      date: format(new Date(lastTransaction.created_date), "d בMMMM yyyy", { locale: he }),
      daysSince: daysSince
    };
  })();

  const topBudgetsData = (() => {
    if (!user || !user.active_budget_group_name || budgets.length === 0 || categories.length === 0) return [];
    
    const activeBudgetItems = budgets.filter(b => 
      b.budget_group_name === user.active_budget_group_name &&
      categories.find(c => c.id === b.category_id)?.parent_type === 'expense'
    );
    
    const top4 = activeBudgetItems.sort((a, b) => b.monthly_amount - a.monthly_amount).slice(0, 4);

    return top4.map(budgetItem => {
      const spent = currentMonthTransactions
        .filter(t => t.category_id === budgetItem.category_id)
        .reduce((sum, t) => sum + t.amount, 0);
      
      const planned = budgetItem.monthly_amount;
      const percentage = planned > 0 ? (spent / planned) * 100 : 0;
      
      return {
        id: budgetItem.id,
        name: budgetItem.name,
        spent,
        planned,
        percentage: Math.min(100, percentage), // Cap at 100 for visual
      };
    });
  })();

  const yearlyData = (() => {
    const yearStart = startOfYear(now);
    const yearEnd = endOfYear(now);
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= monthStart && transactionDate <= monthEnd;
      });

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expense = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        month: format(month, 'MMM', { locale: he }),
        monthFull: format(month, 'MMMM yyyy', { locale: he }),
        income,
        expense,
        balance: income - expense
      };
    });
  })();


  if (loading) {
    return (
      <div className="min-h-screen bg-[#041D31] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 min-h-screen" style={{ backgroundColor: '#041D31' }} dir="rtl">
      <div className="max-w-7xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <GreetingHeader userName={user?.full_name || 'משתמש'} />
          <Button
            onClick={toggleDemoMode}
            variant={isDemoMode ? "default" : "outline"}
            className={isDemoMode 
              ? "bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold" 
              : "border-emerald-700 text-emerald-300 hover:bg-emerald-800/50"
            }
          >
            {isDemoMode ? <EyeOff className="w-4 h-4 ml-2" /> : <Eye className="w-4 h-4 ml-2" />}
            {isDemoMode ? 'חזרה לנתונים שלי' : 'תצוגת משתמש חדש'}
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Right Column (in RTL) - Now wider */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <TrackingCTA lastTransactionInfo={lastTransactionInfo} />
            <TopBudgetsChart topBudgetsData={topBudgetsData} />
            <GoalsPlaceholder />
          </div>

          {/* Left Column (in RTL) - Now narrower */}
          <div className="lg:col-span-1">
            <MonthlySummary 
              income={currentMonthIncome}
              expenses={currentMonthExpenses}
              ytdBalance={ytdBalance}
            />
          </div>
        </div>

        <div className="mt-6">
          <YearlyComparisonBarChart data={yearlyData} />
        </div>
      </div>
    </div>
  );
}
