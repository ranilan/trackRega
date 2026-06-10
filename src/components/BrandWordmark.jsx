export default function BrandWordmark({
  tagline = 'מעקב שבועי פשוט כדי להתחיל מחדש',
  showTagline = true,
  className = '',
}) {
  return (
    <div className={`inline-flex flex-col items-start ${className}`} aria-label="TrackRega">
      <div className="leading-none">
        <span className="text-[1.55rem] font-bold tracking-normal text-slate-50">Track</span>
        <span className="text-[1.55rem] font-bold tracking-normal text-[#2DD4BF]">Rega</span>
      </div>
      <div className="mt-1 flex items-center gap-2">
        <svg width="150" height="14" viewBox="0 0 150 14" fill="none" aria-hidden="true">
          <path
            d="M2 8H36C52 8 58 2 72 2C86 2 92 8 108 8H145"
            stroke="#F59E0B"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="145" cy="8" r="4" fill="#F8FAFC" />
        </svg>
      </div>
      {showTagline && (
        <p className="mt-1 text-sm font-medium leading-5 text-[#CBD5E1]" dir="rtl">
          {tagline}
        </p>
      )}
    </div>
  );
}
