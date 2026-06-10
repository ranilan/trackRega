export default function BrandWordmark({
  tagline = 'מעקב שבועי פשוט כדי להתחיל מחדש',
  showTagline = true,
  size = 'md',
  className = '',
}) {
  const isLarge = size === 'lg';
  const wordClass = isLarge ? 'text-[2rem] sm:text-[2.35rem]' : 'text-[1.55rem]';
  const lineWidth = isLarge ? 190 : 150;
  const lineHeight = isLarge ? 16 : 14;

  return (
    <div className={`inline-flex flex-col items-start ${className}`} aria-label="TrackRega">
      <div className="leading-none">
        <span className={`${wordClass} font-bold tracking-normal text-slate-50`}>Track</span>
        <span className={`${wordClass} font-bold tracking-normal text-[#2DD4BF]`}>Rega</span>
      </div>
      <div className="mt-1 flex items-center gap-2">
        <svg width={lineWidth} height={lineHeight} viewBox="0 0 190 16" fill="none" aria-hidden="true">
          <path
            d="M3 9H48C68 9 76 3 94 3C112 3 120 9 140 9H184"
            stroke="#F59E0B"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="184" cy="9" r="4" fill="#F8FAFC" />
        </svg>
      </div>
      {showTagline && (
        <p className={`${isLarge ? 'text-base' : 'text-sm'} mt-1 font-medium leading-5 text-[#CBD5E1]`} dir="rtl">
          {tagline}
        </p>
      )}
    </div>
  );
}
