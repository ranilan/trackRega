import React, { useState } from 'react';
import {
  ArrowLeft,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PublicPageShell from '@/components/PublicPageShell';
import { supabase } from '@/lib/supabaseClient';
import { validateAccessCode } from '@/lib/accessCodes';

const benefits = [
  {
    icon: Clock3,
    title: '20 דקות בשבוע',
    text: 'פותחים חלון קצר, מעדכנים כשהדברים עוד טריים, ולא מחכים לסוף החודש כדי להבין מה קרה.',
  },
  {
    icon: CalendarCheck,
    title: 'קודם מעקב, אחר כך החלטות',
    text: 'מתחילים מהרגל קטן שמייצר בהירות. אחרי שיש תמונה, הרבה יותר קל לבנות תקציב שמתאים למציאות.',
  },
  {
    icon: BarChart3,
    title: 'פחות ניחושים',
    text: 'כמה דקות עקביות נותנות תמונה ברורה יותר: לאן הכסף זז, מה חוזר על עצמו, ומה כדאי לשנות קודם.',
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
    <PublicPageShell>
      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-16">
        <div className="max-w-2xl text-center sm:text-right">
          <div className="inline-flex max-w-full items-center justify-center gap-2 rounded border border-[#2DD4BF]/40 bg-[#2DD4BF]/10 px-3 py-2 text-sm text-[#CBD5E1]">
            <Sparkles className="h-4 w-4" />
            <span>הרשמה מוקדמת עם קוד כניסה</span>
          </div>

          <div className="mt-7 space-y-4">
            <h1 className="mx-auto max-w-2xl text-3xl font-bold leading-tight sm:mx-0 sm:text-5xl">
              במקום לחפור אחורה, מתחילים לעקוב קדימה.
            </h1>
            <p className="mx-auto max-w-xl text-lg leading-9 text-[#CBD5E1] sm:mx-0">
              TrackRega נבנה לאנשים שרוצים להחזיר שליטה בלי להפוך את ניהול הכסף לפרויקט. מתחילים ממעקב ידני קצר,
              פעם בשבוע, ומשם בונים תמונה שאפשר באמת לעבוד איתה.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="rounded border border-white/10 bg-white/[0.04] p-4">
                <benefit.icon className="mb-3 h-5 w-5 text-[#2DD4BF]" />
                <h2 className="text-base font-semibold">{benefit.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">{benefit.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap justify-center gap-3 text-sm text-slate-200 sm:justify-start">
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#2DD4BF]" />
              הזנה ידנית ומהירה
            </span>
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#2DD4BF]" />
              תקציבים, קטגוריות ודוחות
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#2DD4BF]" />
              הרשמה בקוד בלבד
            </span>
          </div>
        </div>

        <div className="mx-auto w-full min-w-0 max-w-md text-right">
          <div className="rounded border border-white/10 bg-slate-950/55 p-6 shadow-2xl">
            <div className="mb-6">
              <p className="text-sm text-[#2DD4BF]">{isSignup ? 'פתיחת חשבון' : 'כניסה לחשבון'}</p>
              <h2 className="mt-1 text-2xl font-bold">
                {isSignup ? 'מתחילים מעקב שבועי' : 'טוב שחזרת'}
              </h2>
            </div>

            <div className="mb-5 grid grid-cols-2 rounded border border-white/10 bg-slate-900/70 p-1">
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className={`rounded px-3 py-2 text-sm font-medium transition ${
                  !isSignup ? 'bg-[#2DD4BF] text-slate-950' : 'text-slate-200 hover:text-white'
                }`}
              >
                התחברות
              </button>
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className={`rounded px-3 py-2 text-sm font-medium transition ${
                  isSignup ? 'bg-[#2DD4BF] text-slate-950' : 'text-slate-200 hover:text-white'
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
                    כרגע פתיחת חשבון אפשרית רק עם קוד אישי.
                  </p>
                </div>
              )}

              {error && <p className="rounded bg-red-950/70 p-3 text-sm text-red-100">{error}</p>}
              {message && <p className="rounded bg-emerald-950/70 p-3 text-sm text-emerald-100">{message}</p>}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2DD4BF] font-semibold text-slate-950 hover:bg-[#5EEAD4]"
              >
                {loading ? 'רק רגע...' : isSignup ? 'צור חשבון' : 'התחבר'}
                {!loading && <ArrowLeft className="mr-2 h-4 w-4" />}
              </Button>
            </form>

            <p className="mt-5 text-center text-xs leading-5 text-slate-400">
              התחברות והרשמה עם Google כבויות כרגע כדי לשמור על הרשמה בקוד אישי בלבד.
            </p>
          </div>
        </div>
      </section>
    </PublicPageShell>
  );
}
