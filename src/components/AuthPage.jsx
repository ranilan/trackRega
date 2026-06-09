import React, { useState } from 'react';
import {
  ArrowLeft,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  Chrome,
  Clock3,
  ShieldCheck,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabaseClient';
import { validateAccessCode } from '@/lib/accessCodes';

const benefits = [
  {
    icon: Clock3,
    title: '20 דקות בשבוע',
    text: 'לא מחכים לסוף חודש. פותחים חלון קצר ביומן ומעדכנים כשהכול עדיין טרי.',
  },
  {
    icon: CalendarCheck,
    title: 'מעקב לפני ניתוח',
    text: 'מתחילים מההרגל שמייצר שליטה, ורק אחר כך בונים תקציב מדויק יותר.',
  },
  {
    icon: BarChart3,
    title: 'תובנות ביחס גבוה למאמץ',
    text: 'מעט עבודה עקבית נותנת תמונה ברורה: איפה הכסף זז, ומה צריך תיקון עכשיו.',
  },
];

export default function AuthPage() {
  const [mode, setMode] = useState('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const isSignup = mode === 'signup';

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError('');
    setMessage('');
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
    }
  };

  const recordAccessCodeUse = async (accessCodeId, userId) => {
    if (!accessCodeId) return;

    await supabase.rpc('record_access_code_use', {
      access_code_id: accessCodeId,
      signed_up_user_id: userId,
      signed_up_email: email,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    let accessCodeId = null;

    if (isSignup) {
      const validation = await validateAccessCode(supabase, accessCode);
      if (!validation.isValid) {
        setError(validation.message);
        setLoading(false);
        return;
      }
      accessCodeId = validation.accessCodeId;
    }

    const authCall = isSignup
      ? supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName || email,
              access_code_id: accessCodeId,
            },
          },
        })
      : supabase.auth.signInWithPassword({ email, password });

    const { data, error: authError } = await authCall;
    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    if (isSignup) {
      await recordAccessCodeUse(accessCodeId, data.user?.id);
    }

    if (isSignup && !data.session) {
      setMessage('נרשמת בהצלחה. בדוק את המייל ואשר את החשבון כדי להתחבר.');
      return;
    }

    setMessage(isSignup ? 'נרשמת בהצלחה.' : 'התחברת בהצלחה.');
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#071923] text-white">
      <div className="grid min-h-screen lg:grid-cols-[1.12fr_0.88fr]">
        <section className="flex min-w-0 items-center px-5 py-10 sm:px-8 lg:px-14">
          <div className="mx-auto w-full min-w-0 max-w-3xl text-center sm:text-right">
            <div className="mb-10 flex items-center justify-center gap-3 sm:justify-start">
              <div className="flex h-11 w-11 items-center justify-center rounded bg-emerald-400 text-slate-950">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">TrackRega</p>
                <p className="text-sm text-cyan-100">מעקב תקציב קצר, שבועי, ובעברית</p>
              </div>
            </div>

            <div className="max-w-2xl space-y-7">
              <div className="inline-flex max-w-full items-center justify-center gap-2 rounded border border-emerald-300/40 bg-emerald-300/10 px-3 py-2 text-sm text-emerald-100">
                <Sparkles className="h-4 w-4" />
                <span>עכשיו בהרשמה מוקדמת עם קוד כניסה</span>
              </div>

              <div className="space-y-4">
                <h1
                  className="mx-auto max-w-2xl text-2xl font-bold leading-snug sm:mx-0 sm:text-5xl sm:leading-tight"
                  dir="rtl"
                >
                  <span className="block">במקום לחפור אחורה,</span>
                  <span className="block">מתחילים לעקוב קדימה.</span>
                </h1>
                <p className="mx-auto max-w-[310px] text-base leading-8 text-slate-200 sm:mx-0 sm:max-w-xl sm:text-lg" dir="rtl">
                  האפליקציה בנויה לאנשים שרוצים שליטה בכסף בלי להפוך את החיים לפרויקט.
                  מתחילים ממעקב ידני קצר, פעם בשבוע, ומשם בונים תקציב שמחובר למציאות.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {benefits.map((benefit) => (
                  <div key={benefit.title} className="rounded border border-white/10 bg-white/[0.04] p-4">
                    <benefit.icon className="mb-3 h-5 w-5 text-emerald-300" />
                    <h2 className="text-base font-semibold" dir="rtl">{benefit.title}</h2>
                    <p className="mx-auto mt-2 max-w-[280px] text-sm leading-6 text-slate-300" dir="rtl">
                      {benefit.text}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-slate-200">
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  הזנה ידנית ומהירה
                </span>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  תקציבים, קטגוריות ודוחות
                </span>
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-300" />
                  מוכן לתשתית מנויים בהמשך
                </span>
              </div>
            </div>
          </div>
        </section>

        <section
          className="flex min-w-0 items-center border-t border-white/10 bg-[#0D2633] px-5 py-10 sm:px-8 lg:border-r lg:border-t-0 lg:px-12"
        >
          <div className="mx-auto w-full min-w-0 max-w-md text-right">
            <div className="rounded border border-white/10 bg-slate-950/55 p-6 shadow-2xl">
              <div className="mb-6">
                <p className="text-sm text-emerald-200">{isSignup ? 'פתיחת חשבון' : 'כניסה לחשבון'}</p>
                <h2 className="mt-1 text-2xl font-bold">
                  {isSignup ? 'מתחילים מעקב שבועי' : 'טוב שחזרת'}
                </h2>
              </div>

              <div className="mb-5 grid grid-cols-2 rounded border border-white/10 bg-slate-900/70 p-1">
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className={`rounded px-3 py-2 text-sm font-medium transition ${
                    !isSignup ? 'bg-emerald-400 text-slate-950' : 'text-slate-200 hover:text-white'
                  }`}
                >
                  התחברות
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className={`rounded px-3 py-2 text-sm font-medium transition ${
                    isSignup ? 'bg-emerald-400 text-slate-950' : 'text-slate-200 hover:text-white'
                  }`}
                >
                  הרשמה
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
                {isSignup && (
                  <div>
                    <label className="mb-1 block text-sm text-slate-200">שם מלא</label>
                    <Input
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      autoComplete="name"
                      className="border-white/10 bg-slate-900 text-white"
                    />
                  </div>
                )}

                <div>
                  <label className="mb-1 block text-sm text-slate-200">אימייל</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    required
                    className="border-white/10 bg-slate-900 text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-slate-200">סיסמה</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete={isSignup ? 'new-password' : 'current-password'}
                    minLength={6}
                    required
                    className="border-white/10 bg-slate-900 text-white"
                  />
                </div>

                {isSignup && (
                  <div>
                    <label className="mb-1 block text-sm text-slate-200">קוד כניסה</label>
                    <Input
                      value={accessCode}
                      onChange={(event) => setAccessCode(event.target.value)}
                      autoComplete="one-time-code"
                      required
                      className="border-white/10 bg-slate-900 text-white"
                      placeholder="הקוד שקיבלת מרן"
                    />
                    <p className="mt-2 text-xs leading-5 text-slate-400">
                      בשלב ההשקה הכניסה ללא תשלום למי שקיבל קוד.
                    </p>
                  </div>
                )}

                {error && <p className="rounded bg-red-950/70 p-3 text-sm text-red-100">{error}</p>}
                {message && <p className="rounded bg-emerald-950/70 p-3 text-sm text-emerald-100">{message}</p>}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-400 font-semibold text-slate-950 hover:bg-emerald-300"
                >
                  {loading ? 'רק רגע...' : isSignup ? 'צור חשבון' : 'התחבר'}
                  {!loading && <ArrowLeft className="mr-2 h-4 w-4" />}
                </Button>
              </form>

              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xs text-slate-400">או</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <Button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                variant="outline"
                className="w-full border-white/10 bg-slate-900 text-slate-100 hover:bg-slate-800 hover:text-white"
              >
                <Chrome className="ml-2 h-4 w-4" />
                התחברות עם Google
              </Button>

              {isSignup && (
                <p className="mt-4 text-center text-xs leading-5 text-slate-400">
                  בהמשך ייתכנו מסלולים בתשלום, הנחות וקודים ייעודיים. כרגע ההרשמה פתוחה בקוד בלבד.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
