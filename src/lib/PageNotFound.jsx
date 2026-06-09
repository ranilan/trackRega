import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { User } from '@/entities/User';

export default function PageNotFound() {
  const location = useLocation();
  const pageName = location.pathname.substring(1);

  const { data: authData, isFetched } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const user = await User.me();
        return { user, isAuthenticated: true };
      } catch {
        return { user: null, isAuthenticated: false };
      }
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md">
        <div className="space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="text-7xl font-light text-slate-300">404</h1>
            <div className="mx-auto h-0.5 w-16 bg-slate-200" />
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-medium text-slate-800">העמוד לא נמצא</h2>
            <p className="leading-relaxed text-slate-600">
              העמוד <span className="font-medium text-slate-700">"{pageName}"</span> לא קיים באפליקציה.
            </p>
          </div>

          {isFetched && authData.isAuthenticated && authData.user?.role === 'admin' && (
            <div className="mt-8 rounded border border-slate-200 bg-slate-100 p-4 text-right">
              <p className="text-sm font-medium text-slate-700">הערת אדמין</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                אם העמוד אמור להיות קיים, צריך להוסיף route מתאים בקוד.
              </p>
            </div>
          )}

          <div className="pt-6">
            <button
              type="button"
              onClick={() => {
                window.location.href = '/';
              }}
              className="inline-flex items-center rounded border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              חזרה לדף הבית
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
