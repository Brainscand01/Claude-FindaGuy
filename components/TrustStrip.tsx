const items = [
  {
    icon: (
      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 13l4 4L19 7" stroke="#166534" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    bg: '#DCFCE7',
    title: 'Verified businesses',
    sub: 'Every listing confirmed',
  },
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="#D97706" aria-hidden="true">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
    bg: '#FFFBEB',
    title: 'Real reviews',
    sub: 'From real customers',
  },
  {
    icon: (
      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#1D4ED8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    bg: '#EFF6FF',
    title: 'Bad actors flagged',
    sub: 'Removed fast',
  },
  {
    icon: (
      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="#64748b" strokeWidth="2" />
        <path d="M12 8v4l3 3" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    bg: '#F1F5F9',
    title: 'AI-matched results',
    sub: 'Smart search',
  },
]

export function TrustStrip() {
  return (
    <section
      className="bg-white border-y border-slate-100 px-4 sm:px-6 py-3.5"
      aria-label="Why trust FindaGuy"
    >
      <ul className="max-w-7xl mx-auto flex flex-wrap justify-center gap-x-10 gap-y-3">
        {items.map((item) => (
          <li key={item.title} className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: item.bg }}
            >
              {item.icon}
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-800">{item.title}</div>
              <div className="text-[10px] text-slate-400">{item.sub}</div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
