import { Link } from 'react-router-dom';
import { CheckCircle2, Compass, HeartHandshake, LineChart } from 'lucide-react';
import PublicPageShell from '@/components/PublicPageShell';

const principles = [
  {
    icon: Compass,
    title: 'מתחילים ממה שקורה באמת',
    text: 'לפני שמחליטים החלטות גדולות, כדאי לראות את התמונה. כמה נכנס, כמה יוצא, ומה חוזר על עצמו שבוע אחרי שבוע.',
  },
  {
    icon: CheckCircle2,
    title: 'הרגל קטן, לא פרויקט ענק',
    text: 'המטרה היא לא לנהל את החיים באקסל. המטרה היא כמה דקות של מעקב, מספיק ברור כדי שאפשר יהיה להתקדם.',
  },
  {
    icon: HeartHandshake,
    title: 'בלי אשמה ובלי הרצאות',
    text: 'כסף הוא נושא רגיש. TrackRega נבנה כדי לעזור להתחיל מחדש ממקום רגוע, לא כדי לשפוט החלטות שכבר קרו.',
  },
  {
    icon: LineChart,
    title: 'כלי שאפשר לעבוד איתו יחד',
    text: 'אפשר להשתמש ב-TrackRega לבד, ואפשר להשתמש בו גם בתוך תהליך ליווי אישי, כשצריך עוד זוג עיניים על המספרים.',
  },
];

export default function About() {
  return (
    <PublicPageShell>
      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:py-16">
        <div className="max-w-2xl">
          <p className="mb-4 text-sm font-semibold text-[#2DD4BF]">מי אנחנו</p>
          <h1 className="text-3xl font-bold leading-tight sm:text-5xl">
            TrackRega נבנה בשביל הרגע שבו רוצים להחזיר שליטה, אבל לא יודעים מאיפה להתחיל.
          </h1>
          <p className="mt-6 text-lg leading-9 text-[#CBD5E1]">
            אני רן אילן, מפתח TrackRega, אנליסט ומאמן פיננסי. בניתי את הכלי הזה כדי להפוך מעקב כסף למשהו שאפשר
            באמת להתמיד בו: קצר, ברור, ולא מאיים.
          </p>
          <p className="mt-4 text-lg leading-9 text-[#CBD5E1]">
            TrackRega מיועד למשפחות, זוגות ואנשים שרוצים להבין מה קורה עם הכסף שלהם בלי להרגיש שהם נכנסים לעוד
            מערכת מסובכת. מתחילים ממעקב שבועי פשוט, ומשם אפשר לבנות תקציב, לזהות דפוסים, ולתכנן יעדים בצורה יותר
            רגועה ומעשית.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/PersonalGuidance"
              className="rounded bg-[#2DD4BF] px-5 py-3 font-semibold text-[#0F172A] transition hover:bg-[#5EEAD4]"
            >
              לראות איך עובד ליווי אישי
            </Link>
            <Link
              to="/Contact"
              className="rounded border border-white/15 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              לשאול שאלה
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded border border-white/10 bg-white/[0.04] shadow-2xl">
          <img
            src="/brand/ran-ilan-about.png"
            alt="רן אילן, מפתח TrackRega, אנליסט ומאמן פיננסי"
            className="aspect-[4/5] w-full object-cover"
          />
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-5 pb-14 sm:px-8 md:grid-cols-2 lg:grid-cols-4">
        {principles.map((item) => (
          <article key={item.title} className="rounded border border-white/10 bg-white/[0.04] p-5">
            <item.icon className="mb-4 h-6 w-6 text-[#F59E0B]" />
            <h2 className="text-xl font-semibold">{item.title}</h2>
            <p className="mt-2 leading-7 text-[#CBD5E1]">{item.text}</p>
          </article>
        ))}
      </section>
    </PublicPageShell>
  );
}
