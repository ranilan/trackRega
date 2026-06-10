import { Link } from 'react-router-dom';
import { CalendarDays, ClipboardCheck, Goal, Repeat2 } from 'lucide-react';
import PublicPageShell from '@/components/PublicPageShell';

const steps = [
  {
    icon: ClipboardCheck,
    title: 'מתחילים מתמונה קיימת',
    text: 'מגדירים מקורות, קטגוריות והרגל מעקב שמתאים לחיים האמיתיים.',
  },
  {
    icon: Repeat2,
    title: 'מעקב שבועי קצר',
    text: 'בודקים יחד שההזנה נשארת פשוטה, מהירה ועקבית.',
  },
  {
    icon: Goal,
    title: 'תכנון ויעדים',
    text: 'אחרי שיש נתונים, מגדירים סדר עדיפויות ויעדים אישיים בצורה זהירה ומעשית.',
  },
  {
    icon: CalendarDays,
    title: 'פגישות ליווי',
    text: 'משתמשים ב-TrackRega ככלי עבודה משותף כדי לא להישאר לבד מול המספרים.',
  },
];

export default function PersonalGuidance() {
  return (
    <PublicPageShell>
      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:py-16">
        <div>
          <p className="mb-4 text-sm font-semibold text-[#2DD4BF]">ליווי אישי</p>
          <h1 className="text-3xl font-bold leading-tight sm:text-5xl">
            ליווי פיננסי שמבוסס על מעקב אמיתי, לא על תחושות בטן.
          </h1>
          <p className="mt-6 text-lg leading-9 text-[#CBD5E1]">
            TrackRega יכול לשמש ככלי עצמאי, אבל הערך הגדול יותר עבור חלק מהמשתמשים הוא ליווי אנושי:
            פגישות שמוודאות שהמעקב קורה, שהנתונים מובנים, ושהצעדים הבאים נשארים מציאותיים.
          </p>
          <p className="mt-4 text-lg leading-9 text-[#CBD5E1]">
            אין הבטחה לפתרונות קסם. מה שעובד הוא התמדה, בהירות ועקביות לאורך זמן.
          </p>
          <Link
            to="/Contact"
            className="mt-8 inline-flex rounded bg-[#2DD4BF] px-5 py-3 font-semibold text-[#0F172A] transition hover:bg-[#5EEAD4]"
          >
            לדבר על ליווי אישי
          </Link>
        </div>

        <div className="grid gap-4">
          {steps.map((step) => (
            <article key={step.title} className="rounded border border-white/10 bg-white/[0.04] p-5">
              <step.icon className="mb-4 h-6 w-6 text-[#F59E0B]" />
              <h2 className="text-xl font-semibold">{step.title}</h2>
              <p className="mt-2 leading-7 text-[#CBD5E1]">{step.text}</p>
            </article>
          ))}
        </div>
      </section>
    </PublicPageShell>
  );
}
