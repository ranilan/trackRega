import { Link } from 'react-router-dom';
import { CalendarDays, ClipboardCheck, Goal, Repeat2 } from 'lucide-react';
import PublicPageShell from '@/components/PublicPageShell';

const steps = [
  {
    icon: ClipboardCheck,
    title: 'מסדרים את נקודת הפתיחה',
    text: 'מגדירים מקורות כסף, קטגוריות והרגל מעקב שאפשר לעמוד בו גם בשבוע עמוס.',
  },
  {
    icon: Repeat2,
    title: 'שומרים על קצב שבועי',
    text: 'המטרה היא שהמעקב יישאר קצר וברור. אם משהו מסרבל, מתקנים את התהליך במקום לוותר עליו.',
  },
  {
    icon: Goal,
    title: 'מתרגמים נתונים להחלטות',
    text: 'אחרי שיש תמונה, קל יותר לדבר על סדרי עדיפויות, גבולות, יעדים אישיים והמרחק מהם.',
  },
  {
    icon: CalendarDays,
    title: 'לא נשארים לבד מול המספרים',
    text: 'בפגישות הליווי משתמשים ב-TrackRega ככלי עבודה משותף, כדי להפוך את הנתונים לשיחה ולפעולה.',
  },
];

export default function PersonalGuidance() {
  return (
    <PublicPageShell>
      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:py-16">
        <div>
          <p className="mb-4 text-sm font-semibold text-[#2DD4BF]">ליווי אישי</p>
          <h1 className="text-3xl font-bold leading-tight sm:text-5xl">
            לפעמים הכלי מספיק. ולפעמים צריך גם מישהו שיעזור להישאר עם זה.
          </h1>
          <p className="mt-6 text-lg leading-9 text-[#CBD5E1]">
            הליווי האישי מיועד למי שרוצה להשתמש ב-TrackRega בצורה עקבית, להבין את המספרים, ולהפוך אותם לצעדים
            קטנים שאפשר לבצע. לא מדובר בפתרונות קסם, אלא בתהליך רגוע של סדר, בהירות והתמדה.
          </p>
          <p className="mt-4 text-lg leading-9 text-[#CBD5E1]">
            TrackRega נותן את הכלי. הליווי מוסיף שיחה, אחריות עדינה, ועזרה בקבלת החלטות שמתאימות לחיים האמיתיים.
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
