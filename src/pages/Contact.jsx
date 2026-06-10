import { useState } from 'react';
import { Bot, Mail, Send } from 'lucide-react';
import PublicPageShell from '@/components/PublicPageShell';

const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.23.2 2.23.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.44 2.91h-2.34V22C18.34 21.24 22 17.08 22 12.06Z" />
  </svg>
);

const InstagramIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <rect width="16" height="16" x="4" y="4" rx="4" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" />
    <circle cx="17" cy="7" r="1.2" fill="currentColor" />
  </svg>
);

const XIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M17.53 3h3.07l-6.7 7.66L21.78 21h-6.17l-4.83-6.32L5.25 21H2.16l7.17-8.2L1.78 3h6.33l4.37 5.78L17.53 3Zm-1.08 16.18h1.7L7.18 4.72H5.35l11.1 14.46Z" />
  </svg>
);

const LinkedinIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M4.98 3.5a2.5 2.5 0 1 0 0 5.01 2.5 2.5 0 0 0 0-5.01ZM3 9.75h3.96V21H3V9.75Zm6.2 0h3.8v1.54h.05c.53-1 1.82-2.06 3.75-2.06 4.01 0 4.75 2.64 4.75 6.07V21h-3.96v-5.05c0-1.2-.02-2.75-1.68-2.75-1.68 0-1.94 1.31-1.94 2.67V21H9.2V9.75Z" />
  </svg>
);

const socialLinks = [
  { label: 'Facebook אישי', href: 'https://www.facebook.com/ranilan.ri', icon: FacebookIcon },
  { label: 'Ranalyze בפייסבוק', href: 'https://www.facebook.com/ranalyze.pro', icon: FacebookIcon },
  { label: 'Instagram', href: 'https://www.instagram.com/ranilan1', icon: InstagramIcon },
  { label: 'X / Twitter', href: 'https://x.com/ranil111', icon: XIcon },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/ran-ilan-0561a647/', icon: LinkedinIcon },
];

const getAgentReply = (message) => {
  const text = message.toLowerCase();

  if (text.includes('קוד') || text.includes('הרשמה')) {
    return 'כרגע פתיחת חשבון ב-TrackRega נעשית עם קוד אישי. המטרה היא לוודא שמי שנכנס מקבל התחלה מסודרת ולא נזרק לבד למערכת.';
  }

  if (text.includes('ליווי') || text.includes('פגישה') || text.includes('מאמן')) {
    return 'הליווי האישי מיועד למי שרוצה להפוך את המעקב להרגל. בפגישות עוברים על הנתונים מתוך TrackRega, מזהים דפוסים, ובוחרים צעדים קטנים שאפשר לבצע בפועל.';
  }

  if (text.includes('תקציב') || text.includes('יעד') || text.includes('יעדים')) {
    return 'TrackRega מתחיל ממעקב, ורק אחר כך עובר לתקציב ויעדים. אחרי שיש תמונה אמיתית של ההכנסות וההוצאות, קל יותר לבנות יעד שלא מנותק מהחיים.';
  }

  if (text.includes('בנק') || text.includes('אוטומטי') || text.includes('בנקאות')) {
    return 'בעתיד הכיוון הוא חיבור לנתוני בנק, דרך בנקאות פתוחה או דרך פתרון חצי-אוטומטי. כרגע הדגש הוא על מעקב ידני מהיר שמייצר מודעות ושליטה.';
  }

  return 'הדרך של TrackRega מתחילה בשאלה פשוטה: מה קרה השבוע עם הכסף? משם אפשר לבנות בהירות, תקציב ויעדים. אם יש שאלה ספציפית, כדאי לכתוב אותה כאן או לשלוח מייל לרן.';
};

export default function Contact() {
  const [messages, setMessages] = useState([
    {
      role: 'agent',
      text: 'שלום, אני סוכן הכוונה ראשוני של TrackRega. אפשר לשאול על הרשמה, מעקב שבועי, ליווי אישי, תקציב או יעדים.',
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleChatSubmit = (event) => {
    event.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed) return;

    setMessages((current) => [
      ...current,
      { role: 'user', text: trimmed },
      { role: 'agent', text: getAgentReply(trimmed) },
    ]);
    setChatInput('');
  };

  return (
    <PublicPageShell>
      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:py-16">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold text-[#2DD4BF]">צור קשר</p>
          <h1 className="text-3xl font-bold leading-tight sm:text-5xl">אפשר להתחיל גם בלי לדעת בדיוק מה לשאול.</h1>
          <p className="mt-6 text-lg leading-9 text-[#CBD5E1]">
            אם TrackRega נראה רלוונטי, אם יש התלבטות לגבי ליווי אישי, או אם פשוט רוצים להבין איך מתחילים לעקוב
            בלי להסתבך, אפשר לשלוח הודעה או לשאול את סוכן ההכוונה הראשוני.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded border border-white/10 bg-white/[0.04] p-5">
            <Mail className="mb-4 h-6 w-6 text-[#F59E0B]" />
            <h2 className="text-xl font-semibold">מייל</h2>
            <p className="mt-2 leading-7 text-[#CBD5E1]">
              אפשר לכתוב על שימוש ב-TrackRega, על ליווי אישי, או פשוט לתאר איפה נתקעתם עם ניהול הכסף.
            </p>
            <a
              href="mailto:ranilan00@gmail.com"
              className="mt-5 inline-flex items-center gap-2 rounded bg-[#2DD4BF] px-4 py-2 font-semibold text-[#0F172A] transition hover:bg-[#5EEAD4]"
            >
              ranilan00@gmail.com
              <Send className="h-4 w-4" />
            </a>
          </article>

          <article className="rounded border border-white/10 bg-white/[0.04] p-5">
            <div className="mb-4 flex items-center gap-3">
              <Bot className="h-6 w-6 text-[#F59E0B]" />
              <div>
                <h2 className="text-xl font-semibold">צ׳אט הכוונה</h2>
                <p className="text-sm text-[#CBD5E1]">גרסת בסיס שאפשר להמשיך לאמן ולחבר בהמשך למודל AI אמיתי.</p>
              </div>
            </div>
            <div className="max-h-72 space-y-3 overflow-auto rounded bg-slate-950/50 p-4">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`rounded px-3 py-2 text-sm leading-6 ${
                    message.role === 'user'
                      ? 'mr-auto bg-[#2DD4BF] text-[#0F172A]'
                      : 'ml-auto bg-white/10 text-[#CBD5E1]'
                  }`}
                >
                  {message.text}
                </div>
              ))}
            </div>
            <form onSubmit={handleChatSubmit} className="mt-4 flex gap-2">
              <input
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                className="min-w-0 flex-1 rounded border border-white/10 bg-slate-900 px-3 py-2 text-white outline-none focus:border-[#2DD4BF]"
                placeholder="שאלה על מעקב, ליווי או הרשמה"
              />
              <button
                type="submit"
                className="rounded bg-[#2DD4BF] px-4 py-2 font-semibold text-[#0F172A] transition hover:bg-[#5EEAD4]"
              >
                שלח
              </button>
            </form>
          </article>
        </div>

        <section className="mt-10 rounded border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-2xl font-semibold">רשתות חברתיות</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            {socialLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded border border-[#2DD4BF]/35 px-4 py-2 text-[#CBD5E1] transition hover:bg-[#2DD4BF]/10 hover:text-white"
              >
                <link.icon className="h-5 w-5" />
                {link.label}
              </a>
            ))}
          </div>
        </section>
      </section>
    </PublicPageShell>
  );
}
