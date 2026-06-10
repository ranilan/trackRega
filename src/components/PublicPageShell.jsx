import { Link } from 'react-router-dom';
import BrandWordmark from '@/components/BrandWordmark';

const navItems = [
  { label: 'מי אנחנו', to: '/About' },
  { label: 'צור קשר', to: '/Contact' },
  { label: 'ליווי אישי', to: '/PersonalGuidance' },
];

export default function PublicPageShell({ children }) {
  return (
    <main className="min-h-screen bg-[#0F172A] text-white" dir="rtl">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-5 px-5 py-6 sm:px-8">
          <Link to="/" className="shrink-0" aria-label="TrackRega">
            <BrandWordmark showTagline={false} size="lg" />
          </Link>
          <nav className="flex flex-wrap items-center justify-end gap-2 text-base font-medium text-[#CBD5E1] sm:text-lg">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded px-3 py-2 transition hover:bg-[#2DD4BF]/10 hover:text-white sm:px-4"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/"
              className="rounded border border-[#2DD4BF]/40 px-3 py-2 font-semibold text-[#2DD4BF] transition hover:bg-[#2DD4BF]/10 sm:px-4"
            >
              כניסה והרשמה
            </Link>
          </nav>
        </div>
      </header>
      {children}
    </main>
  );
}
