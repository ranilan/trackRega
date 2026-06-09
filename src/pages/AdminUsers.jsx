import React, { useEffect, useMemo, useState } from 'react';
import { Activity, Database, KeyRound, Users } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@/entities/User';
import { hashAccessCode } from '@/lib/accessCodes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  { key: 'sources', table: 'financial_sources' },
  { key: 'categories', table: 'categories' },
  { key: 'transactions', table: 'transactions' },
  { key: 'budgets', table: 'budgets' },
];

const emptyUsage = {
  sources: 0,
  categories: 0,
  transactions: 0,
  budgets: 0,
};

const emptyCodeForm = {
  label: 'קוד השקה כללי',
  code: '',
  maxUses: '',
  discountPercent: '',
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
  const [accessCodes, setAccessCodes] = useState([]);
  const [usageByEmail, setUsageByEmail] = useState({});
  const [codeForm, setCodeForm] = useState(emptyCodeForm);
  const [loading, setLoading] = useState(true);
  const [savingCode, setSavingCode] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

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

      const [{ data: profilesData, error: profilesError }, { data: codesData, error: codesError }, ...usageResults] =
        await Promise.all([
          supabase
            .from('profiles')
            .select('id, email, full_name, role, plan, access_status, active_budget_group_name, created_at')
            .order('created_at', { ascending: false }),
          supabase
            .from('access_codes')
            .select('id, label, code_hash, is_active, max_uses, used_count, discount_percent, created_at')
            .order('created_at', { ascending: false }),
          ...usageTables.map(({ table }) => supabase.from(table).select('id, created_by, created_date')),
        ]);

      if (profilesError) throw profilesError;
      if (codesError) throw codesError;

      const nextUsageByEmail = {};
      usageResults.forEach((result, index) => {
        if (result.error) throw result.error;
        const key = usageTables[index].key;
        (result.data ?? []).forEach((row) => addCount(nextUsageByEmail, row.created_by, key));
      });

      setProfiles(profilesData ?? []);
      setAccessCodes(codesData ?? []);
      setUsageByEmail(nextUsageByEmail);
    } catch (loadError) {
      console.error('Error loading admin data:', loadError);
      setError(loadError.message || 'לא ניתן לטעון את נתוני האדמין');
    } finally {
      setLoading(false);
    }
  };

  const createAccessCode = async (event) => {
    event.preventDefault();
    setSavingCode(true);
    setError('');
    setNotice('');

    try {
      const codeHash = await hashAccessCode(codeForm.code);
      const { error: insertError } = await supabase.from('access_codes').insert({
        label: codeForm.label || 'קוד כניסה',
        code_hash: codeHash,
        max_uses: codeForm.maxUses ? Number(codeForm.maxUses) : null,
        discount_percent: codeForm.discountPercent ? Number(codeForm.discountPercent) : 0,
        created_by: currentUser.email,
      });

      if (insertError) throw insertError;

      setCodeForm(emptyCodeForm);
      setNotice('קוד הכניסה נוצר. שמור את הקוד הגולמי אצלך, כי באפליקציה נשמר רק hash.');
      await loadAdminData();
    } catch (createError) {
      console.error('Error creating access code:', createError);
      setError(createError.message || 'לא ניתן ליצור קוד כניסה');
    } finally {
      setSavingCode(false);
    }
  };

  const toggleAccessCode = async (code) => {
    setError('');
    setNotice('');

    const { error: updateError } = await supabase
      .from('access_codes')
      .update({ is_active: !code.is_active, updated_at: new Date().toISOString() })
      .eq('id', code.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await loadAdminData();
  };

  const rows = useMemo(() => {
    const rowsByEmail = new Map();

    profiles.forEach((profile) => {
      rowsByEmail.set(profile.email, {
        email: profile.email,
        fullName: profile.full_name || profile.email,
        role: profile.role || 'user',
        plan: profile.plan || 'free',
        accessStatus: profile.access_status || 'active',
        activeBudgetGroupName: profile.active_budget_group_name,
        usage: usageByEmail[profile.email] || { ...emptyUsage },
      });
    });

    Object.entries(usageByEmail).forEach(([email, usage]) => {
      if (!rowsByEmail.has(email)) {
        rowsByEmail.set(email, {
          email,
          fullName: email,
          role: email === currentUser?.email ? currentUser.role : 'user',
          plan: 'free',
          accessStatus: 'active',
          activeBudgetGroupName: '',
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
        <div className="mx-auto max-w-3xl rounded border border-red-900/50 bg-red-950/30 p-6">
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
          <h1 className="text-3xl font-bold">משתמשים וקודי כניסה</h1>
        </div>

        {error && <div className="rounded border border-red-900/50 bg-red-950/40 p-4 text-red-100">{error}</div>}
        {notice && (
          <div className="rounded border border-emerald-900/50 bg-emerald-950/40 p-4 text-emerald-100">
            {notice}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-4">
          <SummaryCard title="משתמשים" value={totals.users} icon={Users} />
          <SummaryCard title="עסקאות" value={totals.transactions} icon={Activity} />
          <SummaryCard title="רשומות דאטה" value={totals.sources + totals.categories + totals.budgets} icon={Database} />
          <SummaryCard title="קודי כניסה" value={accessCodes.length} icon={KeyRound} />
        </div>

        <Card className="border-emerald-900/50 bg-slate-950/70 text-white">
          <CardHeader>
            <CardTitle className="text-xl">יצירת קוד כניסה</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={createAccessCode} className="grid gap-3 md:grid-cols-[1.2fr_1fr_0.7fr_0.7fr_auto]">
              <Input
                value={codeForm.label}
                onChange={(event) => setCodeForm((prev) => ({ ...prev, label: event.target.value }))}
                className="border-emerald-900 bg-slate-900 text-white"
                placeholder="שם פנימי"
              />
              <Input
                value={codeForm.code}
                onChange={(event) => setCodeForm((prev) => ({ ...prev, code: event.target.value }))}
                className="border-emerald-900 bg-slate-900 text-white"
                placeholder="הקוד לשליחה למשתמשים"
                required
              />
              <Input
                value={codeForm.maxUses}
                onChange={(event) => setCodeForm((prev) => ({ ...prev, maxUses: event.target.value }))}
                className="border-emerald-900 bg-slate-900 text-white"
                placeholder="מכסה"
                type="number"
                min="1"
              />
              <Input
                value={codeForm.discountPercent}
                onChange={(event) => setCodeForm((prev) => ({ ...prev, discountPercent: event.target.value }))}
                className="border-emerald-900 bg-slate-900 text-white"
                placeholder="הנחה %"
                type="number"
                min="0"
                max="100"
              />
              <Button type="submit" disabled={savingCode} className="bg-emerald-500 text-slate-950 hover:bg-emerald-400">
                {savingCode ? 'שומר...' : 'צור קוד'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-emerald-900/50 bg-slate-950/70 text-white">
          <CardHeader>
            <CardTitle className="text-xl">קודי כניסה</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-emerald-900/50 hover:bg-transparent">
                  <TableHead className="text-right text-emerald-200">שם</TableHead>
                  <TableHead className="text-right text-emerald-200">Hash</TableHead>
                  <TableHead className="text-right text-emerald-200">שימושים</TableHead>
                  <TableHead className="text-right text-emerald-200">הנחה</TableHead>
                  <TableHead className="text-right text-emerald-200">סטטוס</TableHead>
                  <TableHead className="text-right text-emerald-200">פעולה</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accessCodes.map((code) => (
                  <TableRow key={code.id} className="border-emerald-900/40 hover:bg-emerald-950/30">
                    <TableCell className="font-medium text-white">{code.label}</TableCell>
                    <TableCell className="font-mono text-xs text-emerald-100">{code.code_hash.slice(0, 12)}...</TableCell>
                    <TableCell>
                      {code.used_count}
                      {code.max_uses ? ` / ${code.max_uses}` : ''}
                    </TableCell>
                    <TableCell>{code.discount_percent || 0}%</TableCell>
                    <TableCell>{code.is_active ? 'פעיל' : 'כבוי'}</TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => toggleAccessCode(code)}
                        className="border-emerald-800 bg-slate-900 text-emerald-100 hover:bg-slate-800"
                      >
                        {code.is_active ? 'כבה' : 'הפעל'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

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
                  <TableHead className="text-right text-emerald-200">מסלול</TableHead>
                  <TableHead className="text-right text-emerald-200">גישה</TableHead>
                  <TableHead className="text-right text-emerald-200">מקורות</TableHead>
                  <TableHead className="text-right text-emerald-200">קטגוריות</TableHead>
                  <TableHead className="text-right text-emerald-200">עסקאות</TableHead>
                  <TableHead className="text-right text-emerald-200">תקציבים</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.email} className="border-emerald-900/40 hover:bg-emerald-950/30">
                    <TableCell className="font-medium text-white">{row.email}</TableCell>
                    <TableCell className="text-emerald-100">{row.fullName}</TableCell>
                    <TableCell>
                      <RoleBadge role={row.role} />
                    </TableCell>
                    <TableCell>{row.plan}</TableCell>
                    <TableCell>{row.accessStatus}</TableCell>
                    <TableCell>{row.usage.sources}</TableCell>
                    <TableCell>{row.usage.categories}</TableCell>
                    <TableCell>{row.usage.transactions}</TableCell>
                    <TableCell>{row.usage.budgets}</TableCell>
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

function RoleBadge({ role }) {
  return (
    <span
      className={`rounded px-2 py-1 text-xs font-semibold ${
        role === 'admin' ? 'bg-amber-400 text-slate-950' : 'bg-emerald-900 text-emerald-100'
      }`}
    >
      {role}
    </span>
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
        <div className="flex h-11 w-11 items-center justify-center rounded bg-emerald-500 text-slate-950">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
