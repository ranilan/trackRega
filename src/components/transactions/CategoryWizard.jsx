
import React, { useState } from 'react';
import { TrendingUp, TrendingDown, ArrowRight, Loader2, EyeOff } from 'lucide-react';
import { Button } from "@/components/ui/button";

const StepButton = ({ onClick, disabled, children, className, plannedAmount, balance, showBudgetData }) =>
<Button
  onClick={onClick}
  disabled={disabled}
  className={`p-3 min-h-[4.5rem] h-auto text-center justify-center text-white border-2 transition-all duration-200 flex flex-col gap-1
        ${className}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
  variant="outline">

      <span className="text-sm font-semibold break-words">{children}</span>
      {showBudgetData && plannedAmount !== undefined &&
  <div className="text-xs font-normal text-slate-300 mt-1">
          <p>תכנון: ₪{plannedAmount.toLocaleString()}</p>
          <p className={balance < 0 ? 'text-red-400 font-medium' : 'text-green-400'}>
            יתרה: ₪{balance.toLocaleString()}
          </p>
        </div>
  }
    </Button>;


export default function CategoryWizard({ categories, onFinalCategorySelect, onToggleCategoryVisibility, isSubmitting, amount, showBudgetData, budgetDetails }) {
  const [step, setStep] = useState('type');
  const [selectedType, setSelectedType] = useState(null);
  const [selectedParent, setSelectedParent] = useState(null);

  // The useEffect that previously reset the wizard state is removed as per the outline.
  // This means the wizard will no longer automatically reset to the 'type' step
  // when isSubmitting becomes false after being on the 'subCategory' step.
  // Users will now need to manually navigate back using the "חזור" button.

  const handleSelect = (currentStep, value) => {
    switch (currentStep) {
      case 'type':
        setSelectedType(value);
        setStep('parentCategory');
        break;
      case 'parentCategory':
        setSelectedParent(value);
        setStep('subCategory');
        break;
      case 'subCategory':
        if (!isSubmitting) {
          onFinalCategorySelect({ type: selectedType, categoryId: value.id });
        }
        break;
      default:
        break;
    }
  };

  const goBack = () => {
    if (step === 'subCategory') {
      setStep('parentCategory');
      setSelectedParent(null);
    } else if (step === 'parentCategory') {
      setStep('type');
      setSelectedType(null);
    }
  };

  const canSubmit = amount && parseFloat(amount) > 0;

  const getAggregatedBudget = (type, parentCategoryName = null) => {
    if (!showBudgetData || !budgetDetails) return { plannedAmount: undefined, balance: undefined };

    let totalPlanned = 0;
    let totalBalance = 0;

    const relevantCategories = categories.filter((c) => {
      if (c.parent_type !== type) return false;
      if (parentCategoryName) return c.parent_category_name === parentCategoryName;
      // If no parentCategoryName, consider all active categories of the given type that don't have a parent (i.e. are parent categories themselves)
      // or all sub-categories depending on how it's used. For 'type' step, we aggregate all sub-categories under that type.
      return true;
    });

    // For the 'type' step, when parentCategoryName is null, we need to sum up all budget details
    // for all sub-categories under that type, not just parent categories.
    // So, we filter by type first, then aggregate budgets of all sub-categories of that type.
    const budgetCategories = categories.filter((c) => c.parent_type === type);

    if (parentCategoryName) {
      // For parentCategory step, aggregate for all subcategories under a specific parent
      budgetCategories.filter((c) => c.parent_category_name === parentCategoryName).forEach((cat) => {
        const details = budgetDetails[cat.id];
        if (details) {
          totalPlanned += details.monthly_amount;
          totalBalance += details.cumulative_balance;
        }
      });
    } else {
      // For type step, aggregate for all categories (parent or sub) under that type
      budgetCategories.forEach((cat) => {
        const details = budgetDetails[cat.id];
        if (details) {
          totalPlanned += details.monthly_amount;
          totalBalance += details.cumulative_balance;
        }
      });
    }

    return { plannedAmount: totalPlanned, balance: totalBalance };
  };

  const parentCategories = categories.filter((c) => c.parent_type === selectedType && !c.parent_category_name && c.is_active);
  const subCategories = selectedParent ? categories.filter((c) => c.parent_type === selectedType && c.parent_category_name === selectedParent.name && c.is_active) : [];

  const renderStep = () => {
    switch (step) {
      case 'type':
        const expenseBudget = getAggregatedBudget('expense');
        const incomeBudget = getAggregatedBudget('income');
        return (
          <div className="grid grid-cols-2 gap-4">
            <div
              onClick={() => handleSelect('type', 'expense')}
              className="p-6 rounded-xl bg-red-900/30 border-2 border-red-500/40 cursor-pointer hover:bg-red-800/40 hover:border-red-400/60 transition-all text-center flex flex-col items-center gap-2">

              <TrendingDown className="w-8 h-8 text-red-400" />
              <h3 className="text-xl font-bold text-white">הוצאה</h3>
              {showBudgetData && expenseBudget.plannedAmount !== undefined &&
              <div className="text-xs font-normal text-slate-300 mt-1">
                  <p>תכנון: ₪{expenseBudget.plannedAmount.toLocaleString()}</p>
                  <p className={expenseBudget.balance < 0 ? 'text-red-400 font-medium' : 'text-green-400'}>
                    יתרה: ₪{expenseBudget.balance.toLocaleString()}
                  </p>
                </div>
              }
            </div>
            <div
              onClick={() => handleSelect('type', 'income')}
              className="p-6 rounded-xl bg-green-900/30 border-2 border-green-500/40 cursor-pointer hover:bg-green-800/40 hover:border-green-400/60 transition-all text-center flex flex-col items-center gap-2">

              <TrendingUp className="w-8 h-8 text-green-400" />
              <h3 className="text-xl font-bold text-white">הכנסה</h3>
              {showBudgetData && incomeBudget.plannedAmount !== undefined &&
              <div className="text-xs font-normal text-slate-300 mt-1">
                  <p>תכנון: ₪{incomeBudget.plannedAmount.toLocaleString()}</p>
                  <p className={incomeBudget.balance < 0 ? 'text-red-400 font-medium' : 'text-green-400'}>
                    יתרה: ₪{incomeBudget.balance.toLocaleString()}
                  </p>
                </div>
              }
            </div>
          </div>);

      case 'parentCategory':
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {parentCategories.map((category) => {
              const budget = getAggregatedBudget(selectedType, category.name);
              return (
                <StepButton
                  key={category.id}
                  onClick={() => handleSelect('parentCategory', category)}
                  className="bg-slate-700/50 border-slate-500/50 text-slate-100 hover:bg-slate-600/60 hover:border-amber-400/60 hover:text-white"
                  showBudgetData={showBudgetData}
                  plannedAmount={budget.plannedAmount}
                  balance={budget.balance}>

                  {category.name}
                </StepButton>);

            })}
          </div>);

      case 'subCategory':
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {subCategories.map((category) => {
              const details = budgetDetails?.[category.id] || { monthly_amount: 0, cumulative_balance: 0 };
              return (
                <div key={category.id} className="relative group flex">
                <StepButton
                    onClick={() => handleSelect('subCategory', category)}
                    disabled={isSubmitting || !canSubmit}
                    className="bg-slate-600/50 border-slate-400/50 text-slate-100 hover:bg-slate-500/60 hover:border-green-400/60 hover:text-white flex-grow"
                    showBudgetData={showBudgetData}
                    plannedAmount={details.monthly_amount}
                    balance={details.cumulative_balance}>

                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : category.name}
                </StepButton>
                <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-1/2 -translate-y-1/2 left-1 h-8 w-8 rounded-full text-gray-400 hover:bg-red-500/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleCategoryVisibility(category.id);
                    }}
                    title="הסתר קטגוריה">

                    <EyeOff className="w-4 h-4" />
                </Button>
              </div>);

            })}
          </div>);

      default:
        return null;
    }
  };

  return (
    <div className="bg-white/5 px-4 py-4 rounded-xl min-h-[100px]">
      {step !== 'type' &&
      <div className="flex items-center justify-start mb-4">
          <Button variant="ghost" onClick={goBack} className="text-gray-400 hover:text-white">
            <ArrowRight className="w-4 h-4 ml-2" />
            חזור
          </Button>
        </div>
      }
      {renderStep()}
    </div>);

}
