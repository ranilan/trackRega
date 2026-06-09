import React, { useState, useEffect, useCallback } from "react";
import { Category } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Plus,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Pencil,
  Trash2,
  CheckCircle,
  AlertCircle,
  Lock,
  RotateCcw
} from "lucide-react";

import CategoryForm from "../components/categories/CategoryForm";
import CategoryCard from "../components/categories/CategoryCard";
import DeleteConfirmDialog from "../components/categories/DeleteConfirmDialog";
import { defaultCategoriesData } from "../components/categories/defaultCategories";
import { useDemoMode } from "../components/DemoModeContext";

export default function Categories() {
  const { isDemoMode, getCurrentUser, filterDataForDemo } = useDemoMode();
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formInitialData, setFormInitialData] = useState(null);
  const [deleteCategory, setDeleteCategory] = useState(null);
  const [activeTab, setActiveTab] = useState("expense");
  const [lastAction, setLastAction] = useState({ status: null, message: '' });
  const [isResetting, setIsResetting] = useState(false);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const currentUser = getCurrentUser();
      setUser(currentUser);
      
      const userEmail = currentUser?.email;
      if (!userEmail) {
        setLoading(false);
        return;
      }
      
      const categoriesData = await Category.filter({ created_by: userEmail });
      
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
    } catch (error) {
      console.error("Error loading categories:", error);
      setLastAction({ status: 'error', message: 'שגיאה בטעינת הקטגוריות' });
    } finally {
      setLoading(false);
    }
  }, [isDemoMode, getCurrentUser, filterDataForDemo]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const resetCategoriesToDefault = async () => {
    if (!window.confirm('האם אתה בטוח שברצונך לאפס את כל הקטגוריות לברירת המחדל? פעולה זו תמחק את כל הקטגוריות הקיימות ותיצור מחדש את קטגוריות המערכת הבסיסיות.')) {
      return;
    }

    setIsResetting(true);
    try {
      // Delete all existing categories
      // It's safer to get the latest categories just before deletion
      const currentCategories = await Category.filter({ created_by: user.email });
      for (const category of currentCategories) {
        try {
          await Category.delete(category.id);
        } catch (error) {
          console.warn(`Could not delete category ${category.name}:`, error);
        }
      }

      // Create default categories
      const categoriesToCreate = defaultCategoriesData.map(cat => ({ 
          ...cat, 
          created_by: user.email,
          is_system: true
      }));
      await Category.bulkCreate(categoriesToCreate);
      
      setLastAction({ status: 'success', message: 'הקטגוריות אופסו לברירת המחדל בהצלחה!' });
      loadCategories();
    } catch (error) {
      console.error("Error resetting categories:", error);
      setLastAction({ status: 'error', message: 'שגיאה באיפוס הקטגוריות' });
    } finally {
      setIsResetting(false);
      setTimeout(() => setLastAction({ status: null, message: '' }), 3000);
    }
  };

  const handleSubmit = async (categoryData) => {
    try {
      const dataToSubmit = { ...categoryData, created_by: user.email }; 
      if (editingCategory) {
        await Category.update(editingCategory.id, dataToSubmit);
        setLastAction({ status: 'success', message: 'הקטגוריה עודכנה בהצלחה!' });
      } else {
        await Category.create({ ...dataToSubmit, is_system: false }); 
        setLastAction({ status: 'success', message: 'הקטגוריה נוצרה בהצלחה!' });
      }
      setShowForm(false);
      setEditingCategory(null);
      setFormInitialData(null);
      loadCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      setLastAction({ status: 'error', message: 'שגיאה בשמירת הקטגוריה' });
    } finally {
      setTimeout(() => setLastAction({ status: null, message: '' }), 3000);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormInitialData(category);
    setShowForm(true);
  };
  
  const handleAddNewSubCategory = (parentCategory) => {
    setEditingCategory(null);
    setFormInitialData({
        parent_type: parentCategory.parent_type,
        parent_category_name: parentCategory.name,
        is_system: false,
    });
    setShowForm(true);
  };

  const handleToggleVisibility = async (category) => {
    try {
      await Category.update(category.id, { 
        ...category, 
        is_active: !category.is_active 
      });
      setLastAction({ 
        status: 'success', 
        message: category.is_active ? 'הקטגוריה הוסתרה' : 'הקטגוריה הופעלה' 
      });
      loadCategories();
    } catch (error) {
      console.error("Error toggling category visibility:", error);
      setLastAction({ status: 'error', message: 'שגיאה בעדכון הקטגוריה' });
    } finally {
      setTimeout(() => setLastAction({ status: null, message: '' }), 3000);
    }
  };

  const handleDelete = async () => {
    if (!deleteCategory) return;
    
    try {
      await Category.delete(deleteCategory.id);
      setLastAction({ status: 'success', message: 'הקטגוריה נמחקה בהצלחה!' });
      setDeleteCategory(null);
      loadCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      setLastAction({ status: 'error', message: 'שגיאה במחיקת הקטגוריה' });
    } finally {
      setTimeout(() => setLastAction({ status: null, message: '' }), 3000);
    }
  };

  const getParentCategories = (type) => {
    return categories.filter(c => 
      c.parent_type === type && 
      c.parent_category_name === null
    ).sort((a, b) => {
        if (a.is_system && !b.is_system) return -1;
        if (!a.is_system && b.is_system) return 1;
        return a.name.localeCompare(b.name, 'he');
    });
  };

  const getSubCategories = (parentName, type) => {
    return categories.filter(c => 
      c.parent_type === type && 
      c.parent_category_name === parentName
    ).sort((a,b) => a.name.localeCompare(b.name, 'he'));
  };
  
  const hasPersonalParentCategory = (type) => {
    return categories.some(c => c.parent_type === type && c.parent_category_name === null && !c.is_system);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link to={createPageUrl("Dashboard")}>
            <Button
              variant="outline"
              size="icon"
              className="bg-transparent border-slate-600 text-slate-300 hover:bg-slate-800 hover:border-slate-500 hover:text-white"
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <div className="text-right flex-1">
            <h1 className="text-2xl font-bold text-white">מנהל הקטגוריות</h1>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={resetCategoriesToDefault}
              disabled={isResetting}
              variant="outline"
              size="sm"
              className="bg-transparent border-red-600 text-red-400 hover:bg-red-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-3.5 h-3.5 ml-2" />
              {isResetting ? 'מאפס...' : 'איפוס'}
            </Button>
            <Button 
              onClick={() => {
                  setEditingCategory(null);
                  setFormInitialData({ 
                      parent_type: activeTab, 
                      parent_category_name: null, 
                      is_system: false 
                  });
                  setShowForm(true);
              }}
              disabled={hasPersonalParentCategory(activeTab)}
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold disabled:bg-slate-500 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4 ml-2" />
              קטגוריה ראשית
            </Button>
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full text-right" dir="rtl">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
            <TabsTrigger value="expense" className="flex items-center gap-2 data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400">
              <TrendingDown className="w-4 h-4" />
              הוצאות
            </TabsTrigger>
            <TabsTrigger value="income" className="flex items-center gap-2 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
              <TrendingUp className="w-4 h-4" />
              הכנסות
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="expense" className="pt-6 space-y-4 text-right" dir="rtl">
            {getParentCategories("expense").map((parentCategory) => (
              <Card key={parentCategory.id} className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-6 rounded-sm" style={{ backgroundColor: parentCategory.color || '#64748b' }}></div>
                      <h3 className="text-lg font-bold text-white">{parentCategory.name}</h3>
                      {parentCategory.is_system && (
                          <Badge variant="outline" className="border-amber-400 text-amber-400 text-xs py-0.5 px-2">
                            <Lock className="w-2.5 h-2.5 ml-1" />
                          </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                        <Button size="sm" onClick={() => handleAddNewSubCategory(parentCategory)} className="bg-slate-700 hover:bg-slate-600 text-white h-8">
                          <Plus className="w-3.5 h-3.5 ml-1" />
                          תת-קטגוריה
                        </Button>
                        {!parentCategory.is_system && (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(parentCategory)} className="text-gray-400 hover:text-amber-400 h-8 w-8">
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteCategory(parentCategory)} className="text-gray-400 hover:text-red-400 h-8 w-8">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="flex flex-wrap justify-start gap-3">
                    {getSubCategories(parentCategory.name, "expense").map((subCategory) => (
                      <CategoryCard
                        key={subCategory.id}
                        category={subCategory}
                        onEdit={handleEdit}
                        onDelete={setDeleteCategory}
                        onToggleVisibility={handleToggleVisibility}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="income" className="pt-6 space-y-4 text-right" dir="rtl">
            {getParentCategories("income").map((parentCategory) => (
                <Card key={parentCategory.id} className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-6 rounded-sm" style={{ backgroundColor: parentCategory.color || '#64748b' }}></div>
                      <h3 className="text-lg font-bold text-white">{parentCategory.name}</h3>
                      {parentCategory.is_system && (
                          <Badge variant="outline" className="border-amber-400 text-amber-400 text-xs py-0.5 px-2">
                            <Lock className="w-2.5 h-2.5 ml-1" />
                          </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                        <Button size="sm" onClick={() => handleAddNewSubCategory(parentCategory)} className="bg-slate-700 hover:bg-slate-600 text-white h-8">
                          <Plus className="w-3.5 h-3.5 ml-1" />
                          תת-קטגוריה
                        </Button>
                        {!parentCategory.is_system && (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(parentCategory)} className="text-gray-400 hover:text-amber-400 h-8 w-8">
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteCategory(parentCategory)} className="text-gray-400 hover:text-red-400 h-8 w-8">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="flex flex-wrap justify-start gap-3">
                    {getSubCategories(parentCategory.name, "income").map((subCategory) => (
                      <CategoryCard
                        key={subCategory.id}
                        category={subCategory}
                        onEdit={handleEdit}
                        onDelete={setDeleteCategory}
                        onToggleVisibility={handleToggleVisibility}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showForm} onOpenChange={(isOpen) => { if (!isOpen) { setShowForm(false); setEditingCategory(null); setFormInitialData(null); }}}>
        <DialogContent className="bg-slate-800 text-white border-slate-700" dir="rtl">
            <CategoryForm
              initialData={formInitialData}
              categories={categories}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingCategory(null);
                setFormInitialData(null);
              }}
            />
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        isOpen={!!deleteCategory}
        onOpenChange={() => setDeleteCategory(null)}
        categoryName={deleteCategory?.name}
        onConfirm={handleDelete}
        isSystem={deleteCategory?.is_system}
      />
    </div>
  );
}
