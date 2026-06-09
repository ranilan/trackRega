
import React, { useState, useEffect } from "react";
import { Transaction, Category, User } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  ArrowRight } from
"lucide-react";
import { format, startOfYear, endOfYear, eachMonthOfInterval, startOfMonth, endOfMonth, getMonth } from "date-fns";
import { he } from "date-fns/locale";

import YearlyIncomeExpenseChart from "../components/reports/YearlyIncomeExpenseChart";
import MonthlyBalanceChart from "../components/reports/MonthlyBalanceChart";
import CategorySummaryTable from "../components/reports/CategorySummaryTable";

export default function Reports() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState('all'); // 'all' or 0-11 for month index
  const [showSubCategories, setShowSubCategories] = useState(false);
  const [sortBy, setSortBy] = useState('amount'); // 'category' or 'amount'

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      const [transactionsData, categoriesData] = await Promise.all([
      Transaction.filter({ created_by: currentUser.email }, '-date', 1000),
      Category.filter({ created_by: currentUser.email })]
      );

      setTransactions(transactionsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error loading reports data:", error);
    }
    setLoading(false);
  };

  const getYearlyData = () => {
    const yearStart = startOfYear(new Date(selectedYear, 0, 1));
    const yearEnd = endOfYear(new Date(selectedYear, 0, 1));
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

    return months.map((month) => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);

      const monthTransactions = transactions.filter((t) => {
        const transactionDate = new Date(t.date);
        return transactionDate >= monthStart && transactionDate <= monthEnd;
      });

      const income = monthTransactions.
      filter((t) => t.type === 'income').
      reduce((sum, t) => sum + t.amount, 0);

      const expense = monthTransactions.
      filter((t) => t.type === 'expense').
      reduce((sum, t) => sum + t.amount, 0);

      return {
        month: format(month, 'MMM', { locale: he }),
        monthFull: format(month, 'MMMM yyyy', { locale: he }),
        income,
        expense,
        balance: income - expense
      };
    });
  };

  const getAvailableYears = () => {
    if (transactions.length === 0) return [new Date().getFullYear()];

    const years = [...new Set(transactions.map((t) => new Date(t.date).getFullYear()))];
    return years.sort((a, b) => b - a);
  };

  const yearlyData = getYearlyData();
  const availableYears = getAvailableYears();

  // Filter transactions for summary tables based on selected year AND month
  const summaryTransactions = transactions.filter((t) => {
    const transactionDate = new Date(t.date);
    const yearMatch = transactionDate.getFullYear() === selectedYear;
    if (!yearMatch) return false;

    if (selectedMonth === 'all') {
      return true; // Include all transactions for the year
    }

    return getMonth(transactionDate) === parseInt(selectedMonth);
  });

  const incomeTransactions = summaryTransactions.filter((t) => t.type === 'income');
  const expenseTransactions = summaryTransactions.filter((t) => t.type === 'expense');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
      </div>);

  }

  const monthsForFilter = [
  { value: 'all', label: 'כל השנה' },
  ...yearlyData.map((d, index) => ({ value: index.toString(), label: d.monthFull.split(' ')[0] }))];


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
             <Select value={selectedYear.toString()} onValueChange={(value) => {
              setSelectedYear(parseInt(value));
              setSelectedMonth('all'); // Reset month when year changes
            }}>
              <SelectTrigger className="bg-slate-800/50 border-white/20 text-white w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {availableYears.map((year) =>
                <SelectItem key={year} value={year.toString()} className="text-white">
                    {year}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="text-right flex-1 flex items-center gap-4">
             <Link to={createPageUrl("Dashboard")}>
                <Button
                variant="outline"
                size="icon"
                className="bg-transparent border-slate-600 text-slate-300 hover:bg-slate-800 hover:border-slate-500 hover:text-white">

                <ArrowRight className="w-4 h-4" />
                </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">דוחות תקופתיים</h1>
              <p className="text-gray-400 mt-1"></p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <YearlyIncomeExpenseChart data={yearlyData} />
          <MonthlyBalanceChart data={yearlyData} />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">טבלאות סיכום</h2>
            <div className="flex items-center gap-4">
               <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="bg-slate-800/50 border-white/20 text-white w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {monthsForFilter.map((month) =>
                  <SelectItem key={month.value} value={month.value} className="text-white">
                        {month.label}
                      </SelectItem>
                  )}
                  </SelectContent>
                </Select>
               <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-slate-800/50 border-white/20 text-white w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="amount" className="text-white">מיון לפי סכום</SelectItem>
                    <SelectItem value="category" className="text-white">מיון לפי קטגוריה</SelectItem>
                  </SelectContent>
                </Select>
               <div className="flex items-center gap-3 bg-slate-800/50 px-4 py-2.5 rounded-lg border border-slate-600">
                <label htmlFor="show-subcategories" className="text-white cursor-pointer select-none text-sm font-medium flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="show-subcategories"
                    checked={showSubCategories}
                    onChange={(e) => setShowSubCategories(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-500 bg-slate-700 text-amber-500 focus:ring-amber-500 focus:ring-2" />

                  הצג תתי-קטגוריות
                </label>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <CategorySummaryTable
              title="סיכום הכנסות"
              type="income"
              transactions={incomeTransactions}
              categories={categories}
              showSubCategories={showSubCategories}
              sortBy={sortBy}
              year={selectedYear} />

            <CategorySummaryTable
              title="סיכום הוצאות"
              type="expense"
              transactions={expenseTransactions}
              categories={categories}
              showSubCategories={showSubCategories}
              sortBy={sortBy}
              year={selectedYear} />

          </div>
        </div>
      </div>
    </div>);

}