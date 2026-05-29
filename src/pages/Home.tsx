import { Link } from 'react-router-dom'
import { CHAPTERS } from '../chapters'

const GROUPS: { id: string; label: string; sub: string; accent: string }[] = [
  { id: 'intro',    label: 'Start here',                sub: 'Why base LLMs disappoint at work.',     accent: 'text-coral' },
  { id: 'rag',      label: 'RAG · Open-book',           sub: 'Give the model your documents.',         accent: 'text-sky' },
  { id: 'finetune', label: 'Fine-tuning · LoRA/QLoRA',  sub: 'Change the model itself, cheaply.',      accent: 'text-grape-soft' },
  { id: 'distill',  label: 'Distillation',              sub: 'Make a smart model small and fast.',     accent: 'text-rose' },
  { id: 'apply',    label: 'Put it together',           sub: 'A full case study and recap.',           accent: 'text-sun' },
]

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 lg:py-16">
      <section className="text-center max-w-3xl mx-auto mb-12">
        <p className="text-grape-soft text-sm uppercase tracking-widest mb-3">A guided, animation-first tour</p>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-5">
          How do teams make an{' '}
          <span className="bg-gradient-to-r from-sun via-coral to-grape-soft bg-clip-text text-transparent">
            LLM
          </span>{' '}
          actually useful at work?
        </h1>
        <p className="text-lg text-paper/75 leading-relaxed mb-8">
          No math. No code. No prior background. Thirteen short chapters that walk you from{' '}
          <em className="text-coral not-italic">"why does this thing keep making things up?"</em> all the way to{' '}
          <em className="text-sun not-italic">"here's how we'd ship it next quarter"</em> — using one running story
          and a handful of simple analogies.
        </p>
        <Link
          to="/pain"
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-grape hover:bg-grape/80 font-semibold text-lg transition-all anim-pulse-glow"
        >
          ▶ Start with the pain
        </Link>
        <p className="mt-3 text-paper/40 text-sm">or jump to any chapter below</p>
      </section>

      <section className="mb-10 rounded-2xl border border-white/10 bg-ink-soft p-5 md:p-6 max-w-3xl mx-auto">
        <p className="text-[11px] uppercase tracking-widest text-paper/50 mb-2">The running story</p>
        <p className="text-paper/90 text-base md:text-lg leading-relaxed">
          <span className="text-mint font-semibold">Maya</span> is a product manager at{' '}
          <span className="text-mint font-semibold">Northwind Co.</span>, a mid-sized company with 4,000 employees,
          a thick employee handbook, a customer-support inbox that never sleeps, and a CEO who just sent the
          dreaded email: <em>"How are we using AI?"</em>
        </p>
        <p className="text-paper/65 text-sm mt-3 leading-relaxed">
          The same character. The same question. Every chapter watches her team try one more
          improvement and learn what it actually fixed — and what it didn't.
        </p>
      </section>

      <div className="space-y-8">
        {GROUPS.map((g) => (
          <section key={g.id}>
            <div className="flex items-baseline gap-3 mb-3">
              <h2 className={`text-xl font-bold ${g.accent}`}>{g.label}</h2>
              <p className="text-sm text-paper/55">{g.sub}</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {CHAPTERS.filter((c) => c.group === g.id).map((c) => (
                <Link
                  key={c.path}
                  to={c.path}
                  className={`group rounded-2xl border ${c.accentBorder} bg-ink-soft p-5 transition-all hover:-translate-y-0.5 hover:border-white/40`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-4xl group-hover:scale-110 transition-transform">{c.emoji}</span>
                    <span className="text-xs font-mono text-paper/40">{c.n}</span>
                  </div>
                  <h3 className={`text-lg font-bold mb-1 ${c.accent}`}>{c.title}</h3>
                  <p className="text-paper/90 text-sm font-medium mb-2">{c.tagline}</p>
                  <p className="text-paper/60 text-sm leading-relaxed">{c.blurb}</p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="mt-16 max-w-2xl mx-auto text-center text-paper/55 text-sm leading-relaxed">
        <p>
          The diagrams use small, hand-crafted examples — not a real production system — so the
          moving parts stay readable. Real deployments do this a few billion times.
        </p>
      </section>
    </div>
  )
}
