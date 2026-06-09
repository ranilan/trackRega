import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Transaction, Category, FinancialSource, Budget } from "@/entities/all";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { differenceInCalendarMonths } from "date-fns";

import SourceSelector from "../components/transactions/SourceSelector";
import CustomDatePicker from "../components/transactions/CustomDatePicker";
import CategoryWizard from "../components/transactions/CategoryWizard";
import RecentTransactionsTable from "../components/transactions/RecentTransactionsTable";
import TransactionEditModal from "../components/transactions/TransactionEditModal";
import { defaultCategoriesData } from "../components/categories/defaultCategories";
import { useDemoMode } from "../components/DemoModeContext";

export default function AddTransaction() {
  const navigate = useNavigate();
  const { isDemoMode, getCurrentUser, filterDataForDemo } = useDemoMode();

  // Data states
  const [user, setUser] = useState(null);
  const [sources, setSources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Budget Mode state
  const [showBudgetData, setShowBudgetData] = useState(false);

  // Transaction state
  const [activeSourceId, setActiveSourceId] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [amount, setAmount] = useState('');

  // UI/Flow states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmission, setLastSubmission] = useState({ status: null, message: '' });

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const currentUser = getCurrentUser();
      setUser(currentUser);

      const userEmail = currentUser?.email;
      if (!userEmail) {
        setLoading(false);
        return;
      }

      const [sourcesData, categoriesData, transactionsData, budgetsData] = await Promise.all([
      FinancialSource.filter({ is_active: true, created_by: userEmail }),
      Category.filter({ created_by: userEmail }),
      Transaction.filter({ created_by: userEmail }, '-created_date'),
      Budget.filter({ created_by: userEmail })]
      );
      
      // Create default categories if none exist
      if (categoriesData.length === 0 && !isDemoMode) {
        const categoriesToCreate = defaultCategoriesData.map(cat => ({ 
          ...cat, 
          created_by: userEmail,
          is_system: true
        }));
        await Category.bulkCreate(categoriesToCreate);
        const newCategoriesData = await Category.filter({ created_by: userEmail });
        setCategories(filterDataForDemo(newCategoriesData, 'categories'));
      } else {
        setCategories(filterDataForDemo(categoriesData, 'categories'));
      }
      
      setSources(filterDataForDemo(sourcesData, 'sources'));
      setTransactions(filterDataForDemo(transactionsData, 'transactions'));
      setBudgets(filterDataForDemo(budgetsData, 'budgets'));
      
      const filteredSources = filterDataForDemo(sourcesData, 'sources');
      if (filteredSources.length > 0 && !activeSourceId) {
        setActiveSourceId(filteredSources[0].id);
      }
    } catch (err) {
      setError("שגיאה בטעינת הנתונים. נסה לרענן את העמוד.");
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  }, [activeSourceId, isDemoMode, getCurrentUser, filterDataForDemo]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const budgetDetails = useMemo(() => {
    if (!user || !user.active_budget_group_name || budgets.length === 0) {
      return {};
    }

    const activeBudgets = budgets.filter((b) => b.budget_group_name === user.active_budget_group_name);
    if (activeBudgets.length === 0) return {};

    // Assuming all budgets in a group have the same start_date for month calculation purposes
    // Or we should determine the budget group's effective start date.
    // For simplicity, taking the first budget's start_date for now.
    const budgetGroupStartDate = activeBudgets.reduce((minDate, budget) => {
      const currentBudgetDate = new Date(budget.start_date);
      return minDate === null || currentBudgetDate < minDate ? currentBudgetDate : minDate;
    }, null);

    if (!budgetGroupStartDate) return {};

    const now = new Date();
    // Calculate months passed, ensuring it's at least 1 for the current month
    const monthsPassed = Math.max(1, differenceInCalendarMonths(now, budgetGroupStartDate) + 1);

    const relevantTransactions = transactions.filter((t) => new Date(t.date) >= budgetGroupStartDate);

    const detailsMap = {};

    // Process planned budgets
    activeBudgets.forEach((budget) => {
      const cumulativePlanned = budget.monthly_amount * monthsPassed;
      const cumulativeActual = relevantTransactions.
      filter((t) => t.category_id === budget.category_id).
      reduce((sum, t) => sum + t.amount, 0);

      detailsMap[budget.category_id] = {
        monthly_amount: budget.monthly_amount,
        cumulative_balance: cumulativePlanned - cumulativeActual
      };
    });

    // Process transactions for categories without a budget plan, if they have transactions
    relevantTransactions.forEach((transaction) => {
      if (!detailsMap[transaction.category_id]) {
        const cumulativeActual = relevantTransactions.
        filter((t) => t.category_id === transaction.category_id).
        reduce((sum, t) => sum + t.amount, 0);

        detailsMap[transaction.category_id] = {
          monthly_amount: 0, // No planned monthly amount for this category
          cumulative_balance: 0 - cumulativeActual // Only actual spending as a negative balance
        };
      }
    });

    return detailsMap;
  }, [user, budgets, transactions]);

  const handleTransactionSubmit = useCallback(async (categoryData) => {
    if (!activeSourceId || !amount || parseFloat(amount) <= 0) {
      setLastSubmission({ status: 'error', message: 'נא למלא סכום תקין ולבחור מקור.' });
      setTimeout(() => setLastSubmission({ status: null, message: '' }), 3000);
      return;
    }

    setIsSubmitting(true);
    setLastSubmission({ status: null, message: '' });

    try {
      const newTransaction = await Transaction.create({
        amount: parseFloat(amount),
        date: currentDate.toISOString().split('T')[0],
        source_id: activeSourceId,
        type: categoryData.type,
        category_id: categoryData.categoryId,
        description: '' // Can be added later
      });

      // Add new transaction to the top of the list for immediate feedback in source panel
      // And refresh full list for RecentTransactionsTable
      setLastSubmission({ status: 'success', message: 'העסקה נרשמה בהצלחה!' });
      setAmount(''); // Reset amount for next transaction
      loadData(); // Reload data to update all components

    } catch (err) {
      console.error("Error creating transaction:", err);
      setLastSubmission({ status: 'error', message: 'שגיאה ברישום העסקה.' });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setLastSubmission({ status: null, message: '' }), 2000);
    }
  }, [activeSourceId, amount, currentDate, loadData]);

  const handleDeleteTransaction = async (transactionId) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את העסקה?')) {
      try {
        await Transaction.delete(transactionId);
        setLastSubmission({ status: 'success', message: 'העסקה נמחקה בהצלחה!' });
        loadData(); // Reload all data
      } catch (err) {
        console.error("Error deleting transaction:", err);
        setLastSubmission({ status: 'error', message: 'שגיאה במחיקת העסקה.' });
      } finally {
        setTimeout(() => setLastSubmission({ status: null, message: '' }), 3000);
      }
    }
  };

  const handleOpenEditModal = (transaction) => {
    setEditingTransaction(transaction);
    setIsEditModalOpen(true);
  };

  const handleUpdateTransaction = async (updatedData) => {
    try {
      await Transaction.update(editingTransaction.id, updatedData);
      setIsEditModalOpen(false);
      setEditingTransaction(null);
      setLastSubmission({ status: 'success', message: 'העסקה עודכנה בהצלחה!' });
      loadData();
    } catch (err) {
      console.error("Error updating transaction:", err);
      setLastSubmission({ status: 'error', message: 'שגיאה בעדכון העסקה.' });
    } finally {
      setTimeout(() => setLastSubmission({ status: null, message: '' }), 3000);
    }
  };

  const handleToggleCategoryVisibility = async (categoryId) => {
    const categoryToUpdate = categories.find((c) => c.id === categoryId);
    if (!categoryToUpdate) return;

    // Optimistic UI Update
    setCategories((prev) => prev.map((cat) =>
    cat.id === categoryId ? { ...cat, is_active: false } : cat
    ));

    setLastSubmission({ status: 'success', message: 'הקטגוריה הוסתרה!' });
    setTimeout(() => setLastSubmission({ status: null, message: '' }), 2000);

    try {
      await Category.update(categoryId, { ...categoryToUpdate, is_active: false });
    } catch (err) {
      // Revert on error
      setCategories((prev) => prev.map((cat) =>
      cat.id === categoryId ? { ...cat, is_active: true } : cat
      ));
      console.error("Error hiding category:", err);
      setLastSubmission({ status: 'error', message: 'שגיאה בהסתרת הקטגוריה.' });
      setTimeout(() => setLastSubmission({ status: null, message: '' }), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
      </div>);

  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6 text-center">
        <p className="text-red-400 text-lg">{error}</p>
      </div>);

  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
              <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(createPageUrl("Dashboard"))}
              className="bg-transparent border-slate-600 text-slate-300 hover:bg-slate-800 hover:border-slate-500 hover:text-white">

                <ArrowRight className="w-4 h-4" />
              </Button>
              <div className="text-right">
                <h1 className="text-3xl font-bold text-white">אשף ביצוע מעקב</h1>
                <p className="text-gray-400 mt-1"></p>
              </div>
          </div>
          <div className="flex items-center space-x-2 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            <Checkbox
              id="budget-mode"
              checked={showBudgetData}
              onCheckedChange={setShowBudgetData}
              className="data-[state=checked]:bg-amber-500 border-slate-500" />

            <Label htmlFor="budget-mode" className="text-white font-medium select-none cursor-pointer">
              הצג נתוני תקציב
            </Label>
          </div>
        </div>

        <SourceSelector
          sources={sources}
          transactions={transactions}
          categories={categories}
          activeSourceId={activeSourceId}
          onSourceChange={setActiveSourceId} />


        <div className="flex flex-row-reverse gap-4">
          <div className="flex-[35]">
            <div className="bg-white/5 p-4 rounded-xl h-[120px] flex items-center">
              <div className="relative w-full">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-gray-400">₪</span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="bg-slate-950/50 border-white/20 text-white placeholder:text-gray-500 text-3xl font-bold h-16 text-center pr-12"
                  required />

              </div>
            </div>
          </div>
          <div className="flex-[65]">
            <CustomDatePicker
              date={currentDate}
              onDateChange={setCurrentDate} />

          </div>
        </div>
        
        {lastSubmission.status &&
        <div className="text-center">
            {lastSubmission.status === 'success' &&
          <p className="text-green-400 flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" /> {lastSubmission.message}
              </p>
          }
            {lastSubmission.status === 'error' &&
          <p className="text-red-400 flex items-center justify-center gap-2">
                <AlertCircle className="w-5 h-5" /> {lastSubmission.message}
              </p>
          }
          </div>
        }
        
        <CategoryWizard
          categories={categories}
          onFinalCategorySelect={handleTransactionSubmit}
          onToggleCategoryVisibility={handleToggleCategoryVisibility}
          isSubmitting={isSubmitting}
          amount={amount}
          showBudgetData={showBudgetData}
          budgetDetails={budgetDetails} />


        <RecentTransactionsTable
          transactions={transactions}
          categories={categories}
          sources={sources}
          onDelete={handleDeleteTransaction}
          onEdit={handleOpenEditModal} />

      </div>

      {editingTransaction &&
      <TransactionEditModal
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        transaction={editingTransaction}
        sources={sources}
        categories={categories}
        onUpdateTransaction={handleUpdateTransaction} />

      }
    </div>);

}