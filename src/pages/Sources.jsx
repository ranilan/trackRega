import React, { useState, useEffect, useMemo } from "react";
import { FinancialSource, Transaction, User } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Plus,
  ArrowRight,
  Pencil,
  Trash2,
  Landmark,
  CreditCard,
  Wallet,
  Briefcase,
  TrendingUp,
  CheckCircle,
  AlertCircle } from
"lucide-react";

import SourceForm from "../components/sources/SourceForm";
import SourceCard from "../components/sources/SourceCard";
import DeleteConfirmDialog from "../components/sources/DeleteConfirmDialog";
import { useDemoMode } from "../components/DemoModeContext";

const sourceIcons = {
  bank: Landmark,
  credit_card: CreditCard,
  cash: Wallet,
  digital_wallet: Wallet,
  investment: TrendingUp,
  other: Briefcase
};

const sourceTypeNames = {
  bank: "בנק",
  credit_card: "כרטיס אשראי",
  cash: "מזומן",
  digital_wallet: "ארנק דיגיטלי",
  investment: "השקעות",
  other: "אחר"
};

export default function Sources() {
  const { isDemoMode, getCurrentUser, filterDataForDemo } = useDemoMode();
  const [user, setUser] = useState(null);
  const [sources, setSources] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSource, setEditingSource] = useState(null);
  const [deleteSource, setDeleteSource] = useState(null);
  const [lastAction, setLastAction] = useState({ status: null, message: '' });

  useEffect(() => {
    loadData();
  }, [isDemoMode]);

  const loadData = async () => {
    try {
      setLoading(true);
      const currentUser = getCurrentUser();
      setUser(currentUser);

      const userEmail = currentUser?.email;
      if (!userEmail) {
        setLoading(false);
        return;
      }

      const [sourcesData, transactionsData] = await Promise.all([
      FinancialSource.filter({ created_by: userEmail }),
      Transaction.filter({ created_by: userEmail })]
      );
      setSources(filterDataForDemo(sourcesData, 'sources'));
      setTransactions(filterDataForDemo(transactionsData, 'transactions'));
    } catch (error) {
      console.error("Error loading data:", error);
      setLastAction({ status: 'error', message: 'שגיאה בטעינת הנתונים' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (sourceData) => {
    try {
      if (editingSource) {
        await FinancialSource.update(editingSource.id, sourceData);
        setLastAction({ status: 'success', message: 'המקור עודכן בהצלחה!' });
      } else {
        await FinancialSource.create(sourceData);
        setLastAction({ status: 'success', message: 'המקור נוצר בהצלחה!' });
      }
      setShowForm(false);
      setEditingSource(null);
      loadData();
    } catch (error) {
      console.error("Error saving source:", error);
      setLastAction({ status: 'error', message: 'שגיאה בשמירת המקור' });
    } finally {
      setTimeout(() => setLastAction({ status: null, message: '' }), 3000);
    }
  };

  const handleEdit = (source) => {
    setEditingSource(source);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteSource) return;

    try {
      await FinancialSource.delete(deleteSource.id);
      setLastAction({ status: 'success', message: 'המקור נמחק בהצלחה!' });
      setDeleteSource(null);
      loadData();
    } catch (error) {
      console.error("Error deleting source:", error);
      setLastAction({ status: 'error', message: 'שגיאה במחיקת המקור' });
    } finally {
      setTimeout(() => setLastAction({ status: null, message: '' }), 3000);
    }
  };

  const sourcesWithCalculatedBalances = useMemo(() => {
    if (loading) return [];
    return sources.map((source) => {
      // Ensure source.starting_balance_date is treated as a Date object for comparison
      const startingBalanceDate = source.starting_balance_date ? new Date(source.starting_balance_date) : null;

      const relevantTransactions = transactions.filter((t) =>
      t.source_id === source.id && (
      startingBalanceDate ? new Date(t.date) >= startingBalanceDate : true) // Include all transactions if no starting_balance_date
      );

      const balanceChange = relevantTransactions.reduce((acc, t) => {
        // Ensure t.amount is treated as a number
        const amount = Number(t.amount) || 0;
        if (t.type === 'income') return acc + amount;
        if (t.type === 'expense') return acc - amount;
        return acc;
      }, 0);

      // Ensure source.starting_balance is treated as a number
      const startingBalance = Number(source.starting_balance) || 0;

      return {
        ...source,
        calculated_balance: startingBalance + balanceChange
      };
    });
  }, [sources, transactions, loading]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6">
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
            <h1 className="text-3xl font-bold text-white">ניהול מקורות כספיים</h1>
            <p className="text-gray-400 mt-1"></p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold">

            <Plus className="w-5 h-5 ml-2" />
            מקור חדש
          </Button>
        </div>

        {lastAction.status &&
        <div className="text-center">
            {lastAction.status === 'success' &&
          <p className="text-green-400 flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" /> {lastAction.message}
              </p>
          }
            {lastAction.status === 'error' &&
          <p className="text-red-400 flex items-center justify-center gap-2">
                <AlertCircle className="w-5 h-5" /> {lastAction.message}
              </p>
          }
          </div>
        }

        {showForm &&
        <SourceForm
          source={editingSource}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingSource(null);
          }} />

        }

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ?
          Array(8).fill(0).map((_, i) =>
          <Card key={i} className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
                    <Skeleton className="h-6 w-20 bg-white/10" />
                  </div>
                  <Skeleton className="h-6 w-32 mb-2 bg-white/10" />
                  <Skeleton className="h-4 w-24 bg-white/10" />
                </CardContent>
              </Card>
          ) :

          sourcesWithCalculatedBalances.map((source) =>
          <SourceCard
            key={source.id}
            source={source}
            onEdit={handleEdit}
            onDelete={setDeleteSource}
            sourceIcons={sourceIcons}
            sourceTypeNames={sourceTypeNames} />

          )
          }
        </div>

        {!loading && sources.length === 0 &&
        <div className="text-center py-12">
            <Wallet className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">אין מקורות כספיים</h3>
            <p className="text-gray-400 mb-6">הוסף את המקור הכספי הראשון שלך כדי להתחיל</p>
            <Button
            onClick={() => setShowForm(true)}
            className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold">

              <Plus className="w-5 h-5 ml-2" />
              הוסף מקור חדש
            </Button>
          </div>
        }
      </div>

      <DeleteConfirmDialog
        isOpen={!!deleteSource}
        onOpenChange={() => setDeleteSource(null)}
        sourceName={deleteSource?.name}
        onConfirm={handleDelete} />

    </div>);

}