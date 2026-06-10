import { Mail, MessageCircle, Send, Share2 } from 'lucide-react';
import PublicPageShell from '@/components/PublicPageShell';

const contactOptions = [
  {
    icon: Mail,
    title: 'מייל',
    text: 'אפשר לכתוב על שימוש ב-TrackRega, על ליווי אישי, או פשוט לתאר איפה נתקעתם עם ניהול הכסף.',
    href: 'mailto:ranilan00@gmail.com',
    label: 'ranilan00@gmail.com',
  },
  {
    icon: MessageCircle,
    title: 'וואטסאפ',
    text: 'נוסיף כאן קישור ישיר אחרי שנבחר מספר ציבורי שמתאים לפניות מהאתר.',
    href: null,
    label: 'יעודכן בקרוב',
  },
  {
    icon: Share2,
    title: 'רשתות חברתיות',
    text: 'נחבר כאן את הערוצים הרלוונטיים כשנחליט איפה נכון ש-TrackRega יהיה נוכח.',
    href: null,
    label: 'בהכנה',
  },
];

export default function Contact() {
  return (
    <PublicPageShell>
      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:py-16">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold text-[#2DD4BF]">צור קשר</p>
          <h1 className="text-3xl font-bold leading-tight sm:text-5xl">אפשר להתחיל גם בלי לדעת בדיוק מה לשאול.</h1>
          <p className="mt-6 text-lg leading-9 text-[#CBD5E1]">
            אם TrackRega נראה רלוונטי, אם יש התלבטות לגבי ליווי אישי, או אם פשוט רוצים להבין איך מתחילים לעקוב
            בלי להסתבך, אפשר לשלוח הודעה. נתחיל מהמצב הקיים ונראה מה הצעד הבא ההגיוני.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {contactOptions.map((option) => (
            <article key={option.title} className="rounded border border-white/10 bg-white/[0.04] p-5">
              <option.icon className="mb-4 h-6 w-6 text-[#F59E0B]" />
              <h2 className="text-xl font-semibold">{option.title}</h2>
              <p className="mt-2 min-h-[72px] leading-7 text-[#CBD5E1]">{option.text}</p>
              {option.href ? (
                <a
                  href={option.href}
                  className="mt-5 inline-flex items-center gap-2 rounded bg-[#2DD4BF] px-4 py-2 font-semibold text-[#0F172A] transition hover:bg-[#5EEAD4]"
                >
                  {option.label}
                  <Send className="h-4 w-4" />
                </a>
              ) : (
                <span className="mt-5 inline-flex rounded border border-white/15 px-4 py-2 text-sm text-[#CBD5E1]">
                  {option.label}
                </span>
              )}
            </article>
          ))}
        </div>
      </section>
    </PublicPageShell>
  );
}
