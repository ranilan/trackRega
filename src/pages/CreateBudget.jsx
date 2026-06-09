
import React, { useState, useEffect } from "react";
import { Budget, Transaction, Category, User } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  ArrowRight,
  Target,
  Calculator,
  History,
  FileText,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { he } from "date-fns/locale";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function CreateBudget() {
  const navigate = useNavigate();
  const query = useQuery();
  const editBudgetName = query.get("edit");

  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [allBudgets, setAllBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Budget creation state
  const [isEditMode, setIsEditMode] = useState(!!editBudgetName);
  const [step, setStep] = useState(isEditMode ? 'amounts' : 'type');
  const [budgetType, setBudgetType] = useState('clean');
  const [budgetName, setBudgetName] = useState(editBudgetName || '');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [incomeCategoryAmounts, setIncomeCategoryAmounts] = useState({});
  const [expenseCategoryAmounts, setExpenseCategoryAmounts] = useState({});
  const [lastAction, setLastAction] = useState({ status: null, message: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      const [categoriesData, transactionsData, budgetsData] = await Promise.all([
        Category.filter({ created_by: currentUser.email }),
        Transaction.filter({ created_by: currentUser.email }, '-date', 5000),
        Budget.filter({ created_by: currentUser.email })
      ]);

      setCategories(categoriesData);
      setTransactions(transactionsData);
      setAllBudgets(budgetsData);

      if (isEditMode) {
          const budgetsForGroup = budgetsData.filter(b => b.budget_group_name === editBudgetName);
          if (budgetsForGroup.length > 0) {
              setStartDate(budgetsForGroup[0].start_date);
              initializeCategoryAmounts('edit', budgetsForGroup, categoriesData);
          }
      }

    } catch (error) {
      console.error("Error loading data:", error);
      setLastAction({ status: 'error', message: 'שגיאה בטעינת הנתונים' });
    }
    setLoading(false);
  };
  
  const getSubCategories = (parentName, type) => {
    return categories.filter(c => 
      c.parent_type === type && 
      c.parent_category_name === parentName && 
      c.is_active
    );
  };

  const getParentCategories = (type) => {
    return categories.filter(c => 
      c.parent_type === type && 
      !c.parent_category_name && 
      c.is_active
    );
  };

  const calculateHistoricalData = (categoryId) => {
    const now = new Date();
    const sixMonthsAgo = subMonths(now, 6);
    
    const relevantTransactions = transactions.filter(t =>
      t.category_id === categoryId &&
      new Date(t.date) >= sixMonthsAgo &&
      new Date(t.date) <= now
    );

    const totalAmount = relevantTransactions.reduce((sum, t) => sum + t.amount, 0);
    const monthlyAverage = Math.round(totalAmount / 6);
    
    return monthlyAverage;
  };

  const getPreviousBudgetData = (categoryId) => {
    // Find the most recent budget for this category, excluding the one being edited
    const previousBudget = allBudgets
      .filter(b => b.category_id === categoryId && b.budget_group_name !== editBudgetName)
      .sort((a, b) => new Date(b.start_date) - new Date(a.start_date))[0];
    
    return previousBudget?.monthly_amount || 0;
  };

  const initializeCategoryAmounts = (type = budgetType, budgetsForGroup = [], categoriesToUse = categories) => {
    const incomeAmounts = {};
    const expenseAmounts = {};
    
    const allSubCategories = categoriesToUse.filter(c => c.parent_category_name && c.is_active);

    allSubCategories.forEach(category => {
      let suggestedAmount = 0;
      if (type === 'edit') {
          const existing = budgetsForGroup.find(b => b.category_id === category.id);
          suggestedAmount = existing ? existing.monthly_amount : 0;
      } else if (type === 'historical') {
        suggestedAmount = calculateHistoricalData(category.id);
      } else if (type === 'previous') {
        suggestedAmount = getPreviousBudgetData(category.id);
      }
      
      if(category.parent_type === 'income'){
        incomeAmounts[category.id] = suggestedAmount;
      } else {
        expenseAmounts[category.id] = suggestedAmount;
      }
    });
    
    setIncomeCategoryAmounts(incomeAmounts);
    setExpenseCategoryAmounts(expenseAmounts);
  };

  const handleIncomeAmountChange = (categoryId, amount) => {
    setIncomeCategoryAmounts(prev => ({
      ...prev,
      [categoryId]: parseFloat(amount) || 0
    }));
  };

  const handleExpenseAmountChange = (categoryId, amount) => {
    setExpenseCategoryAmounts(prev => ({
      ...prev,
      [categoryId]: parseFloat(amount) || 0
    }));
  };

  const calculateTotalIncome = () => {
    return Object.values(incomeCategoryAmounts).reduce((sum, amount) => sum + amount, 0);
  };

  const calculateTotalExpenses = () => {
    return Object.values(expenseCategoryAmounts).reduce((sum, amount) => sum + amount, 0);
  };

  const calculateBalance = () => {
    return calculateTotalIncome() - calculateTotalExpenses();
  };

  const calculateCategoryTotal = (parentName, type) => {
    const subCategories = getSubCategories(parentName, type);
    const amounts = type === 'income' ? incomeCategoryAmounts : expenseCategoryAmounts;
    return subCategories.reduce((sum, cat) => sum + (amounts[cat.id] || 0), 0);
  };

  const handleSaveBudget = async () => {
    if (!budgetName.trim()) {
      setLastAction({ status: 'error', message: 'נא להזין שם לתקציב' });
      return;
    }

    try {
      const allAmounts = { ...incomeCategoryAmounts, ...expenseCategoryAmounts };
      
      if (isEditMode) {
        // Edit mode: sync changes
        const existingBudgets = allBudgets.filter(b => b.budget_group_name === editBudgetName);
        const budgetsToUpdate = [];
        const budgetsToDelete = [];
        const budgetsToCreate = [];

        // Check for updates and deletions
        for (const existing of existingBudgets) {
            const newAmount = allAmounts[existing.category_id];
            if (newAmount !== undefined) {
                if (newAmount > 0 && newAmount !== existing.monthly_amount) {
                    budgetsToUpdate.push(Budget.update(existing.id, { monthly_amount: newAmount }));
                } else if (newAmount === 0) {
                    budgetsToDelete.push(Budget.delete(existing.id));
                }
            }
        }
        
        // Check for creations
        for (const categoryId in allAmounts) {
            const amount = allAmounts[categoryId];
            if (amount > 0) {
                const alreadyExists = existingBudgets.some(b => b.category_id === categoryId);
                if (!alreadyExists) {
                    const category = categories.find(c => c.id === categoryId);
                    if (category) {
                        budgetsToCreate.push({
                            name: category.name,
                            budget_group_name: budgetName,
                            start_date: startDate,
                            category_id: categoryId,
                            monthly_amount: amount,
                            is_active: true,
                            created_by: user.email
                        });
                    }
                }
            }
        }
        
        await Promise.all(budgetsToUpdate);
        await Promise.all(budgetsToDelete);
        if (budgetsToCreate.length > 0) {
            await Budget.bulkCreate(budgetsToCreate);
        }

        setLastAction({ status: 'success', message: 'התקציב עודכן בהצלחה!' });

      } else {
        // Create mode
        const budgetsToCreate = [];
        Object.entries(allAmounts).forEach(([categoryId, amount]) => {
          if (amount > 0) {
            const category = categories.find(c => c.id === categoryId);
            if (category) {
              budgetsToCreate.push({
                name: category.name,
                budget_group_name: budgetName,
                start_date: startDate,
                category_id: categoryId,
                monthly_amount: amount,
                is_active: true,
                created_by: user.email
              });
            }
          }
        });

        if (budgetsToCreate.length === 0) {
          setLastAction({ status: 'error', message: 'נא להזין סכומים לפחות לקטגוריה אחת' });
          return;
        }

        await Budget.bulkCreate(budgetsToCreate);
        // Set the newly created budget as active
        await User.updateMyUserData({ active_budget_group_name: budgetName });
        setLastAction({ status: 'success', message: 'התקציב נוצר והוגדר כפעיל!' });
      }
      
      setTimeout(() => {
        navigate(createPageUrl("Budgets"));
      }, 1500);
      
    } catch (error) {
      console.error("Error saving budget:", error);
      setLastAction({ status: 'error', message: 'שגיאה בשמירת התקציב' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  const hasHistoricalData = transactions.length > 0;
  const hasPreviousBudgets = allBudgets.filter(b => b.budget_group_name !== editBudgetName).length > 0;
  const balance = calculateBalance();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Budgets"))}
            className="bg-transparent border-slate-600 text-slate-300 hover:bg-slate-800 hover:border-slate-500 hover:text-white"
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
          <div className="text-right">
            <h1 className="text-3xl font-bold text-white">{isEditMode ? 'עריכת תקציב' : 'יצירת תקציב חדש'}</h1>
            <p className="text-gray-400 mt-1">{isEditMode ? `עורך את תקציב "${budgetName}"` : 'צור תקציב מותאם אישית לניהול הכנסות והוצאות'}</p>
          </div>
        </div>

        {lastAction.status && (
          <div className="text-center">
            {lastAction.status === 'success' && (
              <p className="text-green-400 flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" /> {lastAction.message}
              </p>
            )}
            {lastAction.status === 'error' && (
              <p className="text-red-400 flex items-center justify-center gap-2">
                <AlertCircle className="w-5 h-5" /> {lastAction.message}
              </p>
            )}
          </div>
        )}

        {step === 'type' && (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-right">בחר סוג תקציב</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div 
                  onClick={() => setBudgetType('clean')}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    budgetType === 'clean' 
                      ? 'border-amber-400 bg-amber-500/20' 
                      : 'border-slate-600 bg-slate-800/50 hover:bg-slate-700/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-amber-400" />
                    <div className="text-right">
                      <h3 className="text-lg font-semibold text-white">תקציב נקי</h3>
                      <p className="text-gray-400 text-sm">התחל מאפס והזן סכומים ידנית</p>
                    </div>
                  </div>
                </div>

                {hasHistoricalData && (
                  <div 
                    onClick={() => setBudgetType('historical')}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      budgetType === 'historical' 
                        ? 'border-amber-400 bg-amber-500/20' 
                        : 'border-slate-600 bg-slate-800/50 hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                       <History className="w-8 h-8 text-blue-400" />
                      <div className="text-right">
                        <h3 className="text-lg font-semibold text-white">מבוסס נתוני עבר</h3>
                        <p className="text-gray-400 text-sm">השתמש בממוצע מ-6 החודשים האחרונים</p>
                      </div>
                    </div>
                  </div>
                )}

                {hasPreviousBudgets && (
                  <div 
                    onClick={() => setBudgetType('previous')}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      budgetType === 'previous' 
                        ? 'border-amber-400 bg-amber-500/20' 
                        : 'border-slate-600 bg-slate-800/50 hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                       <Calculator className="w-8 h-8 text-green-400" />
                      <div className="text-right">
                        <h3 className="text-lg font-semibold text-white">מבוסס תקציב קודם</h3>
                        <p className="text-gray-400 text-sm">השתמש בנתונים מהתקציב האחרון שלך</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  onClick={() => setStep('settings')}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-900"
                >
                  המשך
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'settings' && (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-right">הגדרות תקציב</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget-name" className="text-white text-right">שם התקציב</Label>
                  <Input
                    id="budget-name"
                    value={budgetName}
                    onChange={(e) => setBudgetName(e.target.value)}
                    placeholder="לדוגמה: תקציב ינואר 2025"
                    className="bg-slate-700/50 border-slate-600 text-white text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start-date" className="text-white text-right">חודש התחלה</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white text-right"
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <Button 
                  variant="outline"
                  onClick={() => setStep('type')}
                  className="bg-transparent border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  חזור
                </Button>
                <Button 
                  onClick={() => {
                    initializeCategoryAmounts();
                    setStep('amounts');
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-900"
                  disabled={!budgetName.trim()}
                >
                  המשך
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'amounts' && (
          <div className="space-y-6">
            {/* Summary Card */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-right">סיכום תקציב</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 text-right">
                  <div className="bg-green-500/20 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="text-right">
                        <p className="text-sm text-gray-400">סה"כ הכנסות</p>
                        <p className="text-xl font-bold text-green-400">₪{calculateTotalIncome().toLocaleString()}</p>
                      </div>
                      <TrendingUp className="w-6 h-6 text-green-400" />
                    </div>
                  </div>
                  <div className="bg-red-500/20 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                       <div className="text-right">
                        <p className="text-sm text-gray-400">סה"כ הוצאות</p>
                        <p className="text-xl font-bold text-red-400">₪{calculateTotalExpenses().toLocaleString()}</p>
                      </div>
                      <TrendingDown className="w-6 h-6 text-red-400" />
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg ${balance >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                    <div className="flex items-center justify-between">
                      <div className="text-right">
                        <p className="text-sm text-gray-400">יתרה צפויה</p>
                        <p className={`text-xl font-bold ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ₪{balance.toLocaleString()}
                        </p>
                      </div>
                       <Target className="w-6 h-6 text-amber-400" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="income" className="w-full" dir="rtl">
              <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
                <TabsTrigger value="income" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
                  <TrendingUp className="w-4 h-4 ml-2" />
                  יעדי הכנסות
                </TabsTrigger>
                <TabsTrigger value="expense" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400">
                  <TrendingDown className="w-4 h-4 ml-2" />
                  תקציב הוצאות
                </TabsTrigger>
              </TabsList>

              <TabsContent value="income" className="space-y-4">
                {getParentCategories('income').map((parentCategory) => {
                  const subCategories = getSubCategories(parentCategory.name, 'income');
                  const categoryTotal = calculateCategoryTotal(parentCategory.name, 'income');
                  if (subCategories.length === 0) return null;

                  return (
                    <Card key={parentCategory.id} className="bg-white/5 backdrop-blur-sm border-white/10">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-green-400 border-green-400">
                            ₪{categoryTotal.toLocaleString()}
                          </Badge>
                          <CardTitle className="text-white text-right flex items-center gap-3">
                            <span>{parentCategory.name}</span>
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: parentCategory.color || '#10B981' }}
                            />
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-4">
                          {subCategories.map((subCategory) => {
                            let suggestedAmount = 0;
                            let suggestionLabel = '';
                            
                            if (budgetType === 'historical') {
                              suggestedAmount = calculateHistoricalData(subCategory.id);
                              suggestionLabel = 'ממוצע חודשי';
                            } else if (budgetType === 'previous') {
                              suggestedAmount = getPreviousBudgetData(subCategory.id);
                              suggestionLabel = 'תקציב קודם';
                            }

                            return (
                              <div key={subCategory.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                                <div className="text-right">
                                  <p className="font-medium text-white">{subCategory.name}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                  {suggestedAmount > 0 && !isEditMode && (
                                    <div className="text-xs text-gray-500">
                                      {suggestionLabel}: ₪{suggestedAmount.toLocaleString()}
                                    </div>
                                  )}
                                  <span className="text-lg text-gray-400">₪</span>
                                  <Input
                                    type="number"
                                    value={incomeCategoryAmounts[subCategory.id] || ''}
                                    onChange={(e) => handleIncomeAmountChange(subCategory.id, e.target.value)}
                                    placeholder="0"
                                    className="bg-slate-700/50 border-slate-600 text-white w-28 text-center"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>

              <TabsContent value="expense" className="space-y-4">
                {getParentCategories('expense').map((parentCategory) => {
                  const subCategories = getSubCategories(parentCategory.name, 'expense');
                  const categoryTotal = calculateCategoryTotal(parentCategory.name, 'expense');
                  if (subCategories.length === 0) return null;
                  
                  return (
                    <Card key={parentCategory.id} className="bg-white/5 backdrop-blur-sm border-white/10">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-red-400 border-red-400">
                            ₪{categoryTotal.toLocaleString()}
                          </Badge>
                          <CardTitle className="text-white text-right flex items-center gap-3">
                            <span>{parentCategory.name}</span>
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: parentCategory.color || '#EF4444' }}
                            />
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-4">
                          {subCategories.map((subCategory) => {
                            let suggestedAmount = 0;
                            let suggestionLabel = '';
                            
                            if (budgetType === 'historical') {
                              suggestedAmount = calculateHistoricalData(subCategory.id);
                              suggestionLabel = 'ממוצע חודשי';
                            } else if (budgetType === 'previous') {
                              suggestedAmount = getPreviousBudgetData(subCategory.id);
                              suggestionLabel = 'תקציב קודם';
                            }

                            return (
                              <div key={subCategory.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                                 <div className="text-right">
                                  <p className="font-medium text-white">{subCategory.name}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                  {suggestedAmount > 0 && !isEditMode && (
                                    <div className="text-xs text-gray-500">
                                      {suggestionLabel}: ₪{suggestedAmount.toLocaleString()}
                                    </div>
                                  )}
                                   <span className="text-lg text-gray-400">₪</span>
                                  <Input
                                    type="number"
                                    value={expenseCategoryAmounts[subCategory.id] || ''}
                                    onChange={(e) => handleExpenseAmountChange(subCategory.id, e.target.value)}
                                    placeholder="0"
                                    className="bg-slate-700/50 border-slate-600 text-white w-28 text-center"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>
            </Tabs>

            <div className="flex justify-between pt-4">
              <Button 
                variant="outline"
                onClick={() => navigate(createPageUrl("Budgets"))}
                className="bg-transparent border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                ביטול
              </Button>
              <Button 
                onClick={handleSaveBudget}
                className="bg-amber-500 hover:bg-amber-600 text-slate-900"
                disabled={calculateTotalIncome() === 0 && calculateTotalExpenses() === 0}
              >
                {isEditMode ? 'עדכן תקציב' : 'שמור והחל תקציב'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
