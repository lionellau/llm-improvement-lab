import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { CHAPTERS } from '../chapters'

export default function TopNav() {
  const loc = useLocation()
  const [open, setOpen] = useState(false)
  const current = CHAPTERS.find((c) => c.path === loc.pathname)

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-ink/80 border-b border-white/5">
      <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        <Link to="/" className="font-bold text-base sm:text-lg tracking-tight flex items-center gap-2 shrink-0">
          <span className="text-2xl">🧪</span>
          <span className="bg-gradient-to-r from-sun via-coral to-grape-soft bg-clip-text text-transparent whitespace-nowrap">
            LLM Improvement Lab
          </span>
        </Link>

        {/* Mobile current-chapter pill */}
        {current && (
          <span className={`md:hidden ml-1 px-2 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono ${current.accent} truncate max-w-[140px]`}>
            {current.n} · {current.title.split('·')[0].trim()}
          </span>
        )}

        {/* Tablet: 5 dots + Home, no labels — keeps single-row */}
        <div className="hidden md:flex lg:hidden items-center gap-2 ml-2">
          <NavLink to="/" end className={({ isActive }) => `text-sm px-2.5 py-1 rounded-full ${isActive ? 'bg-white/10 text-paper' : 'text-paper/60 hover:text-paper'}`}>🏠</NavLink>
          {CHAPTERS.map((c) => (
            <Link key={c.path} to={c.path} title={`${c.n} · ${c.title}`} className={`h-2 w-2 rounded-full transition-all ${loc.pathname === c.path ? `${c.accent.replace('text-','bg-')} scale-150` : 'bg-white/15 hover:bg-white/30'}`} />
          ))}
        </div>

        {/* Desktop: full pill list */}
        <div className="hidden lg:flex items-center gap-1 ml-2 overflow-hidden">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `px-2.5 py-1 rounded-full text-sm transition-colors ${
                isActive ? 'bg-white/10 text-paper' : 'text-paper/60 hover:text-paper hover:bg-white/5'
              }`
            }
          >
            🏠
          </NavLink>
          {CHAPTERS.map((c) => (
            <NavLink
              key={c.path}
              to={c.path}
              className={({ isActive }) =>
                `px-2 py-1 rounded-full text-xs font-mono transition-colors whitespace-nowrap ${
                  isActive ? `bg-white/10 ${c.accent}` : 'text-paper/50 hover:text-paper hover:bg-white/5'
                }`
              }
              title={`${c.title} — ${c.tagline}`}
            >
              {c.n}
            </NavLink>
          ))}
        </div>

        <button
          onClick={() => setOpen((o) => !o)}
          className="md:hidden ml-auto px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-paper/80"
          aria-label="Open chapter menu"
        >
          ☰
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-white/5 bg-ink/95 backdrop-blur max-h-[70vh] overflow-y-auto">
          <ul className="max-w-6xl mx-auto px-4 py-3 grid grid-cols-1 gap-1">
            <li>
              <Link
                to="/"
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${loc.pathname === '/' ? 'bg-white/10' : 'hover:bg-white/5'}`}
              >
                <span className="text-xl">🏠</span>
                <span className="font-semibold">Home</span>
              </Link>
            </li>
            {CHAPTERS.map((c) => (
              <li key={c.path}>
                <Link
                  to={c.path}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border ${loc.pathname === c.path ? `${c.accentBg} ${c.accentBorder}` : 'border-transparent hover:bg-white/5'}`}
                >
                  <span className="text-xl">{c.emoji}</span>
                  <div className="min-w-0">
                    <p className={`text-xs font-mono ${c.accent}`}>{c.n}</p>
                    <p className="font-semibold leading-tight truncate">{c.title}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  )
}
