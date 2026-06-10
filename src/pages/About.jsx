import { Link } from 'react-router-dom';
import { CheckCircle2, Compass, HeartHandshake, LineChart } from 'lucide-react';
import PublicPageShell from '@/components/PublicPageShell';

const principles = [
  {
    icon: Compass,
    title: 'מתחילים ממעקב',
    text: 'לפני ניתוחים, החלטות גדולות או תוכניות מסובכות, TrackRega עוזר ליצור תמונה פשוטה של מה קורה בפועל.',
  },
  {
    icon: CheckCircle2,
    title: 'עקביות לפני קסמים',
    text: 'אין כאן הבטחה לפתרון מהיר. השליטה חוזרת דרך פעולה שבועית קצרה, ברורה וחוזרת.',
  },
  {
    icon: HeartHandshake,
    title: 'בלי שיפוטיות',
    text: 'ניהול כסף הוא נושא רגיש. המוצר נבנה כדי לעזור להתחיל מחדש, לא כדי להטיף או להאשים.',
  },
  {
    icon: LineChart,
    title: 'כלי שמחובר לליווי',
    text: 'TrackRega יכול לעבוד לבד, אבל הוא נבנה גם ככלי עבודה לליווי פיננסי אישי ומעשי.',
  },
];

export default function About() {
  return (
    <PublicPageShell>
      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
        <div className="max-w-2xl">
          <p className="mb-4 text-sm font-semibold text-[#2DD4BF]">מי אנחנו</p>
          <h1 className="text-3xl font-bold leading-tight sm:text-5xl">
            TrackRega נבנה כדי להפוך מעקב כסף להרגל פשוט ובר ביצוע.
          </h1>
          <p className="mt-6 text-lg leading-9 text-[#CBD5E1]">
            המוצר פותח על ידי רן אילן, מפתח TrackRega, אנליסט ומאמן פיננסי. הוא נולד מתוך הצורך ללוות משפחות,
            זוגות ואנשים שרוצים להחזיר לעצמם שליטה, אבל לא רוצים עוד אקסל מסובך או אפליקציית פיננסים קרה.
          </p>
          <p className="mt-4 text-lg leading-9 text-[#CBD5E1]">
            הרעיון המרכזי פשוט: מתחילים ממעקב שבועי קצר. אחרי שיש תמונה אמיתית, קל יותר לבנות תקציב,
            להבין דפוסים, לתכנן יעדים אישיים ולראות את המרחק מהם.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/PersonalGuidance"
              className="rounded bg-[#2DD4BF] px-5 py-3 font-semibold text-[#0F172A] transition hover:bg-[#5EEAD4]"
            >
              ליווי אישי
            </Link>
            <Link
              to="/Contact"
              className="rounded border border-white/15 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              יצירת קשר
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          {principles.map((item) => (
            <article key={item.title} className="rounded border border-white/10 bg-white/[0.04] p-5">
              <item.icon className="mb-4 h-6 w-6 text-[#F59E0B]" />
              <h2 className="text-xl font-semibold">{item.title}</h2>
              <p className="mt-2 leading-7 text-[#CBD5E1]">{item.text}</p>
            </article>
          ))}
        </div>
      </section>
    </PublicPageShell>
  );
}
