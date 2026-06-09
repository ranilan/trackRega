import React, { useState } from 'react';
import { Chrome, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabaseClient';

export default function AuthPage() {
  const [mode, setMode] = useState('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const isSignup = mode === 'signup';

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const authCall = isSignup
      ? supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName || email,
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

    if (isSignup && !data.session) {
      setMessage('נרשמת בהצלחה. בדוק את המייל ואשר את החשבון כדי להתחבר.');
      return;
    }

    setMessage(isSignup ? 'נרשמת בהצלחה.' : 'התחברת בהצלחה.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#041D31] px-4" dir="rtl">
      <div className="w-full max-w-md rounded-lg border border-emerald-800/40 bg-slate-950/70 p-6 shadow-2xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500 text-slate-950">
            <Wallet className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">TrackRega</h1>
            <p className="text-sm text-emerald-200">
              {isSignup ? 'יצירת משתמש חדש' : 'כניסה לחשבון'}
            </p>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-2 rounded-md border border-emerald-800/50 p-1">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`rounded px-3 py-2 text-sm font-medium ${
              !isSignup ? 'bg-emerald-500 text-slate-950' : 'text-emerald-200'
            }`}
          >
            התחברות
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`rounded px-3 py-2 text-sm font-medium ${
              isSignup ? 'bg-emerald-500 text-slate-950' : 'text-emerald-200'
            }`}
          >
            הרשמה
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div>
              <label className="mb-1 block text-sm text-emerald-100">שם מלא</label>
              <Input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                autoComplete="name"
                className="border-emerald-800 bg-slate-900 text-white"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm text-emerald-100">אימייל</label>
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              className="border-emerald-800 bg-slate-900 text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-emerald-100">סיסמה</label>
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              minLength={6}
              required
              className="border-emerald-800 bg-slate-900 text-white"
            />
          </div>

          {error && <p className="rounded bg-red-950/60 p-3 text-sm text-red-200">{error}</p>}
          {message && <p className="rounded bg-emerald-950/60 p-3 text-sm text-emerald-200">{message}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 font-semibold text-slate-950 hover:bg-emerald-400"
          >
            {loading ? 'רק רגע...' : isSignup ? 'צור משתמש' : 'התחבר'}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-emerald-900" />
          <span className="text-xs text-emerald-300">או</span>
          <div className="h-px flex-1 bg-emerald-900" />
        </div>

        <Button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          variant="outline"
          className="w-full border-emerald-800 bg-slate-900 text-emerald-100 hover:bg-slate-800 hover:text-white"
        >
          <Chrome className="ml-2 h-4 w-4" />
          התחברות עם Google
        </Button>
      </div>
    </div>
  );
}
