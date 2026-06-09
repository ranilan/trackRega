import React, { useEffect, useMemo, useState } from 'react';
import { Activity, Database, Shield, Users } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@/entities/User';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const usageTables = [
  { key: 'sources', label: 'מקורות', table: 'financial_sources' },
  { key: 'categories', label: 'קטגוריות', table: 'categories' },
  { key: 'transactions', label: 'עסקאות', table: 'transactions' },
  { key: 'budgets', label: 'תקציבים', table: 'budgets' },
];

const emptyUsage = {
  sources: 0,
  categories: 0,
  transactions: 0,
  budgets: 0,
};

const addCount = (usageByEmail, email, key) => {
  if (!email) return;
  if (!usageByEmail[email]) {
    usageByEmail[email] = { ...emptyUsage };
  }
  usageByEmail[email][key] += 1;
};

export default function AdminUsers() {
  const [currentUser, setCurrentUser] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [usageByEmail, setUsageByEmail] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    setError('');

    try {
      const user = await User.me();
      setCurrentUser(user);

      if (user.role !== 'admin') {
        setLoading(false);
        return;
      }

      const [{ data: profilesData, error: profilesError }, ...usageResults] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, email, full_name, role, active_budget_group_name, created_at, updated_at')
          .order('created_at', { ascending: false }),
        ...usageTables.map(({ table }) => supabase.from(table).select('id, created_by, created_date')),
      ]);

      if (profilesError) throw profilesError;

      const nextUsageByEmail = {};
      usageResults.forEach((result, index) => {
        if (result.error) throw result.error;
        const key = usageTables[index].key;
        (result.data ?? []).forEach((row) => addCount(nextUsageByEmail, row.created_by, key));
      });

      setProfiles(profilesData ?? []);
      setUsageByEmail(nextUsageByEmail);
    } catch (loadError) {
      console.error('Error loading admin users:', loadError);
      setError(loadError.message || 'לא ניתן לטעון את נתוני האדמין');
    } finally {
      setLoading(false);
    }
  };

  const rows = useMemo(() => {
    const rowsByEmail = new Map();

    profiles.forEach((profile) => {
      rowsByEmail.set(profile.email, {
        email: profile.email,
        fullName: profile.full_name || profile.email,
        role: profile.role || 'user',
        activeBudgetGroupName: profile.active_budget_group_name,
        createdAt: profile.created_at,
        usage: usageByEmail[profile.email] || { ...emptyUsage },
      });
    });

    Object.entries(usageByEmail).forEach(([email, usage]) => {
      if (!rowsByEmail.has(email)) {
        rowsByEmail.set(email, {
          email,
          fullName: email,
          role: email === currentUser?.email ? currentUser.role : 'user',
          activeBudgetGroupName: '',
          createdAt: '',
          usage,
        });
      }
    });

    return [...rowsByEmail.values()].sort((a, b) => {
      if (a.role !== b.role) return a.role === 'admin' ? -1 : 1;
      return a.email.localeCompare(b.email);
    });
  }, [currentUser, profiles, usageByEmail]);

  const totals = rows.reduce(
    (summary, row) => ({
      users: summary.users + 1,
      sources: summary.sources + row.usage.sources,
      categories: summary.categories + row.usage.categories,
      transactions: summary.transactions + row.usage.transactions,
      budgets: summary.budgets + row.usage.budgets,
    }),
    { users: 0, ...emptyUsage },
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#041D31]">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-400" />
      </div>
    );
  }

  if (currentUser?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#041D31] p-6 text-white" dir="rtl">
        <div className="mx-auto max-w-3xl rounded-lg border border-red-900/50 bg-red-950/30 p-6">
          <h1 className="text-2xl font-bold">אין הרשאת מנהל</h1>
          <p className="mt-2 text-red-100">העמוד הזה פתוח רק למשתמשים עם role=admin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#041D31] p-6 text-white" dir="rtl">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <p className="text-sm text-emerald-300">אזור מנהל</p>
          <h1 className="text-3xl font-bold">משתמשים ושימושים</h1>
        </div>

        {error && (
          <div className="rounded-lg border border-red-900/50 bg-red-950/40 p-4 text-red-100">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-4">
          <SummaryCard title="משתמשים" value={totals.users} icon={Users} />
          <SummaryCard title="עסקאות" value={totals.transactions} icon={Activity} />
          <SummaryCard title="רשומות דאטה" value={totals.sources + totals.categories + totals.budgets} icon={Database} />
          <SummaryCard title="אדמינים" value={rows.filter((row) => row.role === 'admin').length} icon={Shield} />
        </div>

        <Card className="border-emerald-900/50 bg-slate-950/70 text-white">
          <CardHeader>
            <CardTitle className="text-xl">טבלת משתמשים</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-emerald-900/50 hover:bg-transparent">
                  <TableHead className="text-right text-emerald-200">מייל</TableHead>
                  <TableHead className="text-right text-emerald-200">שם</TableHead>
                  <TableHead className="text-right text-emerald-200">הרשאה</TableHead>
                  <TableHead className="text-right text-emerald-200">מקורות</TableHead>
                  <TableHead className="text-right text-emerald-200">קטגוריות</TableHead>
                  <TableHead className="text-right text-emerald-200">עסקאות</TableHead>
                  <TableHead className="text-right text-emerald-200">תקציבים</TableHead>
                  <TableHead className="text-right text-emerald-200">תקציב פעיל</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.email} className="border-emerald-900/40 hover:bg-emerald-950/30">
                    <TableCell className="font-medium text-white">{row.email}</TableCell>
                    <TableCell className="text-emerald-100">{row.fullName}</TableCell>
                    <TableCell>
                      <span className={`rounded px-2 py-1 text-xs font-semibold ${
                        row.role === 'admin'
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-emerald-900 text-emerald-100'
                      }`}>
                        {row.role}
                      </span>
                    </TableCell>
                    <TableCell>{row.usage.sources}</TableCell>
                    <TableCell>{row.usage.categories}</TableCell>
                    <TableCell>{row.usage.transactions}</TableCell>
                    <TableCell>{row.usage.budgets}</TableCell>
                    <TableCell className="max-w-[220px] truncate text-emerald-200">
                      {row.activeBudgetGroupName || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon: Icon }) {
  return (
    <Card className="border-emerald-900/50 bg-slate-950/70 text-white">
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-emerald-300">{title}</p>
          <p className="mt-1 text-3xl font-bold">{value.toLocaleString('he-IL')}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500 text-slate-950">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
