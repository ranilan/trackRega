
import React, { useState, useEffect, useMemo } from "react";
import { Budget, Transaction, Category, User } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Plus,
  ArrowRight,
  Target,
  TrendingDown,
  TrendingUp,
  Trash2,
  Pencil,
  CheckCircle } from
"lucide-react";
import { format, differenceInCalendarMonths } from "date-fns";
import { he } from "date-fns/locale";
import EditBudgetItemModal from "../components/budgets/EditBudgetItemModal";

export default function Budgets() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBudgetItem, setEditingBudgetItem] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      const [budgetsData, transactionsData, categoriesData] = await Promise.all([
      Budget.filter({ created_by: currentUser.email }),
      Transaction.filter({ created_by: currentUser.email }, '-date', 5000),
      Category.filter({ created_by: currentUser.email })]
      );

      setBudgets(budgetsData);
      setTransactions(transactionsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error loading budgets data:", error);
    }
    setLoading(false);
  };

  const handleUpdateItem = () => {
    setEditingBudgetItem(null);
    loadData();
  };

  const handleDeleteBudgetGroup = async (groupName) => {
    if (window.confirm(`האם אתה בטוח שברצונך למחוק את כל התקציב "${groupName}"?`)) {
      try {
        if (!user || !user.email) {
          console.error("User email not available for deleting budget group.");
          return;
        }
        const budgetsToDelete = await Budget.filter({
          created_by: user.email,
          budget_group_name: groupName
        });
        await Promise.all(budgetsToDelete.map((budget) => Budget.delete(budget.id)));
        loadData();
      } catch (error) {
        console.error("Error deleting budget group:", error);
      }
    }
  };

  const handleSetActiveBudget = async (groupName, isCurrentlyActive) => {
    const newActiveGroup = isCurrentlyActive ? null : groupName;
    try {
      await User.updateMyUserData({ active_budget_group_name: newActiveGroup });
      setUser((prevUser) => ({ ...prevUser, active_budget_group_name: newActiveGroup }));
    } catch (error) {
      console.error("Failed to set active budget:", error);
    }
  };

  const getCategoryById = (id) => categories.find((c) => c.id === id);

  const groupedBudgets = useMemo(() => {
    if (!categories.length) return []; // Ensure categories are loaded

    const groups = {};
    const now = new Date();

    // Step 1: Initialize groups from all budget plans to get their start dates
    // This ensures all budget groups appear, even if they currently have no transactions.
    budgets.forEach((budget) => {
      const groupName = budget.budget_group_name;
      if (!groups[groupName]) {
        groups[groupName] = {
          name: groupName,
          startDate: budget.start_date,
          categories: {}
        };
      }
    });

    // This will hold every single item, whether from a plan or a transaction
    const allItems = {};

    // Step 2: Add all planned budget items to our master list
    budgets.forEach((budget) => {
      const key = `${budget.budget_group_name}-${budget.category_id}`;
      allItems[key] = {
        ...budget,
        cumulativePlanned: 0,
        cumulativeActual: 0,
        balance: 0
      };
    });

    // Step 3: Go through transactions and add items that weren't in the plan
    transactions.forEach((transaction) => {
      // Find which budget group this transaction belongs to based on its date
      // A transaction belongs to the most recent budget group whose startDate is before or on the transaction date.
      const relevantGroup = Object.values(groups).
      filter((g) => new Date(transaction.date) >= new Date(g.startDate)).
      sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()) // Sort by date ascending to get the latest
      .pop(); // Take the last (most recent) one

      if (!relevantGroup) return; // Transaction occurred before any budget was defined

      const groupName = relevantGroup.name;
      const key = `${groupName}-${transaction.category_id}`;

      // If this item (e.g., spending on 'Cinema' in 'Budget 2024') doesn't have a plan, create it virtually
      if (!allItems[key]) {
        const category = getCategoryById(transaction.category_id);
        if (!category) return;

        allItems[key] = {
          id: `virtual-${groupName}-${transaction.category_id}`, // Unique ID for virtual items
          name: category.name,
          budget_group_name: groupName,
          start_date: relevantGroup.startDate,
          category_id: transaction.category_id,
          monthly_amount: 0, // CRITICAL: The plan is 0 as per the requirement for unplanned items
          cumulativePlanned: 0,
          cumulativeActual: 0,
          balance: 0
        };
      }
    });

    // Step 4: Calculate correct values for EVERY item in the master list
    Object.values(allItems).forEach((item) => {
      const group = groups[item.budget_group_name];
      if (!group) return; // This should not happen if `allItems` is built correctly

      const subCategory = getCategoryById(item.category_id);
      if (!subCategory || !subCategory.parent_category_name) return;

      const parentCategoryName = subCategory.parent_category_name;
      const parentCategory = categories.find((c) => c.name === parentCategoryName && c.parent_type === subCategory.parent_type && !c.parent_category_name);
      if (!parentCategory) return;

      if (!group.categories[parentCategoryName]) {
        group.categories[parentCategoryName] = {
          name: parentCategoryName,
          type: parentCategory.parent_type,
          color: parentCategory.color,
          items: []
        };
      }

      // Calculate cumulative planned amount based on the group's start date
      const monthsPassed = differenceInCalendarMonths(now, new Date(group.startDate)) + 1;
      item.cumulativePlanned = item.monthly_amount * monthsPassed;

      // Calculate actual spending for this item, considering transactions from the group's start date up to now
      const itemTransactions = transactions.filter((t) => {
        const tDate = new Date(t.date);
        return t.category_id === item.category_id &&
        tDate >= new Date(group.startDate) &&
        tDate <= now;
      });
      item.cumulativeActual = itemTransactions.reduce((sum, t) => sum + t.amount, 0);

      item.balance = item.cumulativePlanned - item.cumulativeActual;

      // Add the fully calculated item to its parent category within the group
      const existingItemIndex = group.categories[parentCategoryName].items.findIndex((i) => i.id === item.id);
      if (existingItemIndex > -1) {
        group.categories[parentCategoryName].items[existingItemIndex] = item;
      } else {
        group.categories[parentCategoryName].items.push(item);
      }
    });

    // Step 5: Aggregate final values up to parent categories and the main group
    Object.values(groups).forEach((group) => {
      group.cumulativePlannedIncome = 0;
      group.cumulativePlannedExpenses = 0;
      group.actualIncome = 0;
      group.actualExpenses = 0;

      Object.values(group.categories).forEach((categoryGroup) => {
        categoryGroup.cumulativePlanned = categoryGroup.items.reduce((sum, item) => sum + item.cumulativePlanned, 0);
        categoryGroup.cumulativeActual = categoryGroup.items.reduce((sum, item) => sum + item.cumulativeActual, 0);
        categoryGroup.balance = categoryGroup.items.reduce((sum, item) => sum + item.balance, 0);

        if (categoryGroup.type === 'income') {
          group.cumulativePlannedIncome += categoryGroup.cumulativePlanned;
          group.actualIncome += categoryGroup.cumulativeActual;
        } else {
          group.cumulativePlannedExpenses += categoryGroup.cumulativePlanned;
          group.actualExpenses += categoryGroup.cumulativeActual;
        }
      });
    });

    return Object.values(groups).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }, [budgets, transactions, categories]);


  const renderBudgetGroupItem = (item) => {
    const category = getCategoryById(item.category_id);
    if (!category) return null;

    const percentage = item.cumulativePlanned > 0 ? item.cumulativeActual / item.cumulativePlanned * 100 : 0;
    // Handle cases where cumulativePlanned is 0 (for unplanned items) but there's actual spending
    const displayPercentage = item.cumulativePlanned === 0 && item.cumulativeActual > 0 ? 100 : Math.min(100, percentage);


    let progressBgColor = '#10B981'; // Default green (on track)
    if (category.parent_type === 'income') {
      if (item.cumulativeActual < item.cumulativePlanned * 0.8) progressBgColor = '#EF4444';else
      if (item.cumulativeActual < item.cumulativePlanned) progressBgColor = '#F59E0B';
      // If no planned amount but actual income, still show green
      else if (item.cumulativePlanned === 0 && item.cumulativeActual > 0) progressBgColor = '#10B981';
    } else {// expense
      if (item.cumulativeActual > item.cumulativePlanned * 1.2) progressBgColor = '#EF4444';else
      if (item.cumulativeActual > item.cumulativePlanned) progressBgColor = '#F59E0B';
      // If no planned amount but actual expense, it's generally a concern (red)
      else if (item.cumulativePlanned === 0 && item.cumulativeActual > 0) progressBgColor = '#EF4444';
    }

    return (
      <div key={item.id} className="grid grid-cols-7 items-center gap-4 text-sm p-3 border-b border-slate-700/50 last:border-b-0">
            <div className="col-span-2 flex items-center justify-start gap-3">
                <span className="font-medium text-slate-200">{item.name}</span>
                <div style={{ backgroundColor: category.color }} className="w-3 h-3 rounded-full shrink-0"></div>
            </div>
            <div className="text-right text-slate-300">₪{item.monthly_amount.toLocaleString()}</div>
            <div className={`text-right font-semibold ${category.parent_type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                ₪{item.cumulativeActual.toLocaleString()}
            </div>
            <div className={`text-right font-semibold text-orange-400`}>
                ₪{item.balance.toLocaleString()}
            </div>
            <div className="col-span-2 flex items-center justify-between gap-2">
                 <Progress
            value={displayPercentage} // Use displayPercentage here
            className="h-2 flex-grow"
            style={{ '--progress-background': progressBgColor }} />

              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-amber-400" onClick={() => setEditingBudgetItem(item)}>
                <Pencil className="w-4 h-4" />
              </Button>
            </div>
        </div>);

  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header and title */}
        <div className="flex items-center gap-4">
          <Link to={createPageUrl("Dashboard")}>
            <Button
              variant="outline"
              size="icon"
              className="bg-transparent border-slate-600 text-slate-300 hover:bg-slate-800 hover:border-slate-500 hover:text-white">

              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <div className="text-right flex-1">
            <h1 className="text-3xl font-bold text-white">מנהל התקציבים</h1>
            <p className="text-gray-400 mt-1"></p>
          </div>
          <Button
            onClick={() => navigate(createPageUrl("CreateBudget"))}
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-semibold">

            <Plus className="w-5 h-5 ml-2" />
            תקציב חדש
          </Button>
        </div>

        {loading ?
        <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
          </div> :
        groupedBudgets.length > 0 ?
        <div className="space-y-4">
            <div className="px-6 py-2 grid grid-cols-11 items-center gap-4 text-xs font-semibold text-slate-400">
              <div className="col-span-2 text-right">שם תקציב</div>
              <div className="text-right">תאריך</div>
              <div className="text-right text-green-400">תכנון הכנסות</div>
              <div className="text-right text-red-400">תכנון הוצאות</div>
              <div className="text-right text-green-400">ביצוע הכנסות</div>
              <div className="text-right text-red-400">ביצוע הוצאות</div>
              <div className="text-right text-orange-400">יתרת תכנון</div>
              <div className="text-right">יתרת ביצוע</div>
              <div className="text-left col-span-2">פעולות</div>
            </div>
            <Accordion type="multiple" className="w-full space-y-4">
              {groupedBudgets.map((group) => {
              const executionBalance = group.actualIncome - group.actualExpenses;
              const isActive = user?.active_budget_group_name === group.name;

              return (
                <AccordionItem key={group.name} value={group.name} className="bg-slate-800/50 border-slate-700/50 rounded-xl">
                  <AccordionTrigger className="px-6 py-4 text-white hover:no-underline rounded-xl">
                    <div className="w-full grid grid-cols-11 items-center gap-4 text-right text-sm">
                      <div className="col-span-2 font-bold text-lg text-white">{group.name}</div>
                      <div>{format(new Date(group.startDate), 'MMM yyyy', { locale: he })}</div>
                      <div className="text-green-400">₪{group.cumulativePlannedIncome.toLocaleString()}</div>
                      <div className="text-red-400">₪{group.cumulativePlannedExpenses.toLocaleString()}</div>
                      <div className="text-green-400 font-semibold">₪{group.actualIncome.toLocaleString()}</div>
                      <div className="text-red-400 font-semibold">₪{group.actualExpenses.toLocaleString()}</div>
                      <div className={`font-bold ${group.cumulativePlannedIncome - group.cumulativePlannedExpenses >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                         ₪{(group.cumulativePlannedIncome - group.cumulativePlannedExpenses).toLocaleString()}
                      </div>
                      <div className={`font-bold ${executionBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                         ₪{executionBalance.toLocaleString()}
                      </div>
                      <div className="text-left flex items-center justify-end gap-2 col-span-2">
                           <button onClick={(e) => {e.stopPropagation();handleSetActiveBudget(group.name, isActive);}}>
                              {isActive ?
                          <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 cursor-pointer">
                                  <CheckCircle className="w-4 h-4 ml-1" />
                                  פעיל
                                </Badge> :

                          <Badge variant="outline" className="text-slate-400 border-slate-600 hover:bg-slate-700 hover:text-white cursor-pointer">
                                  הפעל
                                </Badge>
                          }
                            </button>
                           <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-amber-400"
                          onClick={(e) => {e.stopPropagation();navigate(createPageUrl(`CreateBudget?edit=${group.name}`));}}>

                            <Pencil className="w-4 h-4" />
                          </Button>
                           <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-red-400"
                          onClick={(e) => {e.stopPropagation();handleDeleteBudgetGroup(group.name);}}>

                            <Trash2 className="w-4 h-4" />
                          </Button>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-2 pt-2 md:px-6 md:pb-4">
                    <Accordion type="multiple" className="w-full space-y-3">
                      
                      <AccordionItem value="income-section" className="bg-slate-700/20 rounded-lg border-b-0">
                        <AccordionTrigger className="p-3 hover:no-underline rounded-lg data-[state=open]:bg-slate-700/40">
                          <div className="flex items-center justify-between w-full px-2">
                              <div className="flex items-center gap-2 text-white text-lg font-bold">
                                  <span>הכנסות</span>
                                  <TrendingUp className="w-5 h-5 text-green-400" />
                              </div>
                              <div className="flex items-center gap-4 text-green-400 font-semibold">
                                  <div>
                                      <span className="text-xs text-slate-400 ml-1">יתרה:</span>
                                      <span className={`font-bold ${group.cumulativePlannedIncome - group.actualIncome >= 0 ? 'text-green-400' : 'text-red-400'}`}>₪{(group.cumulativePlannedIncome - group.actualIncome).toLocaleString()}</span>
                                  </div>
                                  <div>
                                    <span className="text-xs text-slate-400 ml-1">ביצוע/תכנון:</span>
                                    <span>₪{group.actualIncome.toLocaleString()} / ₪{group.cumulativePlannedIncome.toLocaleString()}</span>
                                  </div>
                              </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-2">
                           <Accordion type="multiple" className="w-full space-y-2">
                            {Object.values(group.categories).
                            filter((cat) => cat.type === 'income').
                            sort((a, b) => a.name.localeCompare(b.name, 'he')).
                            map((categoryGroup) =>
                            <AccordionItem key={categoryGroup.name} value={categoryGroup.name} className="bg-slate-700/30 rounded-lg border-b-0">
                                  <AccordionTrigger className="p-2 hover:no-underline rounded-lg data-[state=open]:bg-slate-700/50">
                                      <div className="flex items-center justify-between w-full px-2">
                                          <div className="flex items-center gap-2 text-white font-bold">
                                              <div style={{ backgroundColor: categoryGroup.color }} className="w-3 h-3 rounded-full"></div>
                                              <span>{categoryGroup.name}</span>
                                          </div>
                                          <div className="flex items-center gap-4 text-green-400 font-semibold text-sm">
                                               <div>
                                                  <span className="text-xs text-slate-400 ml-1">יתרה:</span>
                                                  <span className={`font-bold ${categoryGroup.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>₪{categoryGroup.balance.toLocaleString()}</span>
                                              </div>
                                              <div>
                                                <span className="text-xs text-slate-400 ml-1">ב/ת:</span>
                                                <span>₪{categoryGroup.cumulativeActual.toLocaleString()}/{categoryGroup.cumulativePlanned.toLocaleString()}</span>
                                              </div>
                                          </div>
                                      </div>
                                  </AccordionTrigger>
                                  <AccordionContent className="pb-0">
                                      <div className="bg-slate-800/20 rounded-b-lg">
                                        <div className="grid grid-cols-7 items-center gap-4 text-xs font-semibold text-slate-400 px-3 py-2 border-y border-slate-700">
                                              <div className="col-span-2 text-right">סעיף תקציב</div>
                                              <div className="text-right">תכנון חודשי</div>
                                              <div className="text-right">ביצוע מצטבר</div>
                                              <div className="text-right">יתרה מצטברת</div>
                                              <div className="text-left col-span-2">התקדמות / פעולות</div>
                                          </div>
                                        {categoryGroup.items.
                                  sort((a, b) => a.name.localeCompare(b.name, 'he')).
                                  map(renderBudgetGroupItem)}
                                      </div>
                                  </AccordionContent>
                                </AccordionItem>
                            )}
                          </Accordion>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="expense-section" className="bg-slate-700/20 rounded-lg border-b-0">
                        <AccordionTrigger className="p-3 hover:no-underline rounded-lg data-[state=open]:bg-slate-700/40">
                          <div className="flex items-center justify-between w-full px-2">
                            <div className="flex items-center gap-2 text-white text-lg font-bold">
                              <span>הוצאות</span>
                              <TrendingDown className="w-5 h-5 text-red-400" />
                            </div>
                            <div className="flex items-center gap-4 text-red-400 font-semibold">
                                <div>
                                    <span className="text-xs text-slate-400 ml-1">יתרה:</span>
                                    <span className={`font-bold ${group.cumulativePlannedExpenses - group.actualExpenses >= 0 ? 'text-green-400' : 'text-red-400'}`}>₪{(group.cumulativePlannedExpenses - group.actualExpenses).toLocaleString()}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-400 ml-1">ביצוע/תכנון:</span>
                                    <span>₪{group.actualExpenses.toLocaleString()} / ₪{group.cumulativePlannedExpenses.toLocaleString()}</span>
                                </div>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-2">
                           <Accordion type="multiple" className="w-full space-y-2">
                            {Object.values(group.categories).
                            filter((cat) => cat.type === 'expense').
                            sort((a, b) => a.name.localeCompare(b.name, 'he')).
                            map((categoryGroup) =>
                            <AccordionItem key={categoryGroup.name} value={categoryGroup.name} className="bg-slate-700/30 rounded-lg border-b-0">
                                  <AccordionTrigger className="p-2 hover:no-underline rounded-lg data-[state=open]:bg-slate-700/50">
                                    <div className="flex items-center justify-between w-full px-2">
                                        <div className="flex items-center gap-2 text-white font-bold">
                                          <div style={{ backgroundColor: categoryGroup.color }} className="w-3 h-3 rounded-full"></div>
                                          <span>{categoryGroup.name}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-red-400 font-semibold text-sm">
                                            <div>
                                                <span className="text-xs text-slate-400 ml-1">יתרה:</span>
                                                <span className={`font-bold ${categoryGroup.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>₪{categoryGroup.balance.toLocaleString()}</span>
                                            </div>
                                            <div>
                                                <span className="text-xs text-slate-400 ml-1">ב/ת:</span>
                                                <span>₪{categoryGroup.cumulativeActual.toLocaleString()}/{categoryGroup.cumulativePlanned.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                  </AccordionTrigger>
                                  <AccordionContent className="pb-0">
                                      <div className="bg-slate-800/20 rounded-b-lg">
                                        <div className="grid grid-cols-7 items-center gap-4 text-xs font-semibold text-slate-400 px-3 py-2 border-y border-slate-700">
                                            <div className="col-span-2 text-right">סעיף תקציב</div>
                                            <div className="text-right">תכנון חודשי</div>
                                            <div className="text-right">ביצוע מצטבר</div>
                                            <div className="text-right">יתרה מצטברת</div>
                                            <div className="text-left col-span-2">התקדמות / פעולות</div>
                                        </div>
                                        {categoryGroup.items.
                                  sort((a, b) => a.name.localeCompare(b.name, 'he')).
                                  map(renderBudgetGroupItem)}
                                      </div>
                                  </AccordionContent>
                                </AccordionItem>
                            )}
                          </Accordion>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </AccordionContent>
                </AccordionItem>);

            })}
            </Accordion>
          </div> :

        <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">אין תקציבים</h3>
            <p className="text-gray-400 mb-6">צור את התקציב הראשון שלך כדי להתחיל לעקוב אחר ההוצאות</p>
            <Button
            onClick={() => navigate(createPageUrl("CreateBudget"))}
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-semibold">

              <Plus className="w-5 h-5 ml-2" />
              צור תקציב חדש
            </Button>
          </div>
        }
      </div>

      <EditBudgetItemModal
        isOpen={!!editingBudgetItem}
        onOpenChange={() => setEditingBudgetItem(null)}
        budgetItem={editingBudgetItem}
        onUpdate={handleUpdateItem} />

    </div>);

}
