import { Link } from 'react-router-dom'
import { CHAPTERS } from '../chapters'

interface Card {
  emoji: string
  title: string
  oneLine: string
  fixes: string
  link?: string
  tone: string
  border: string
  bg: string
}

const CARDS: Card[] = [
  {
    emoji: '🧊',
    title: 'Base LLMs are frozen',
    oneLine: 'A model trained months ago, with no access to your data, will confidently invent answers.',
    fixes: 'Diagnosed by four failure modes: no company data, stale facts, wrong voice, private events.',
    link: '/pain',
    tone: 'text-coral', border: 'border-coral', bg: 'bg-coral/10',
  },
  {
    emoji: '🗺️',
    title: 'Three roads, not one',
    oneLine: 'RAG, fine-tuning, and distillation solve very different problems. Don\'t confuse them.',
    fixes: 'Most "fine-tune the model" projects should have been RAG projects.',
    link: '/three-roads',
    tone: 'text-paper', border: 'border-paper/40', bg: 'bg-white/5',
  },
  {
    emoji: '📖',
    title: 'RAG = open book',
    oneLine: 'Search your documents first. Hand the relevant pages to the model as extra context.',
    fixes: 'Knowledge problems. Cited answers. Same-day updates.',
    link: '/rag-principle',
    tone: 'text-sky', border: 'border-sky', bg: 'bg-sky/10',
  },
  {
    emoji: '🔎',
    title: 'Embeddings find pages',
    oneLine: 'Chunks become vectors. Questions become vectors. "Closest vectors" is your search engine.',
    fixes: 'Chunking strategy + metadata filters are the biggest quality levers.',
    link: '/rag-internals',
    tone: 'text-mint', border: 'border-mint', bg: 'bg-mint/10',
  },
  {
    emoji: '✅',
    title: 'Good RAG looks like this',
    oneLine: 'Clean source · sensible chunks · fresh index · citations on · scoped retrieval.',
    fixes: 'These five together quietly resolve 70% of internal Q&A.',
    link: '/rag-success',
    tone: 'text-mint', border: 'border-mint', bg: 'bg-mint/10',
  },
  {
    emoji: '⚠️',
    title: 'Four RAG smells',
    oneLine: 'Chunk Soup, Stale Index, Confidently Wrong Citation, Wrong-Scope Retrieval.',
    fixes: 'When RAG misbehaves, it is almost always one of these four.',
    link: '/rag-failures',
    tone: 'text-coral', border: 'border-coral', bg: 'bg-coral/10',
  },
  {
    emoji: '🧭',
    title: 'Facts vs habits',
    oneLine: 'RAG teaches what the model knows. Fine-tuning teaches how it behaves.',
    fixes: 'Two axes. Four quadrants. Pick deliberately.',
    link: '/finetune-vs-rag',
    tone: 'text-paper', border: 'border-paper/40', bg: 'bg-white/5',
  },
  {
    emoji: '🗒️',
    title: 'LoRA = sticky notes',
    oneLine: 'Freeze the giant brain. Train a tiny patch of new weights next to it.',
    fixes: '~10× cheaper, ~100× smaller, hot-swappable per task.',
    link: '/lora',
    tone: 'text-grape-soft', border: 'border-grape-soft', bg: 'bg-grape/10',
  },
  {
    emoji: '🧳',
    title: 'QLoRA = chunky crayons',
    oneLine: 'Quantize the frozen base to 4 bits. Adapters still trained in 16-bit.',
    fixes: 'A 70B fine-tune now costs ~$50–$200, not ~$30 000.',
    link: '/qlora',
    tone: 'text-sun', border: 'border-sun', bg: 'bg-sun/10',
  },
  {
    emoji: '🎓',
    title: 'Distillation = mimic the teacher',
    oneLine: 'Ask a big model thousands of questions. Train a small model on its answers.',
    fixes: '~10× faster, ~10× cheaper, small quality drop on narrow tasks.',
    link: '/distillation',
    tone: 'text-rose', border: 'border-rose', bg: 'bg-rose/10',
  },
  {
    emoji: '🚚',
    title: 'Distill when volume tips',
    oneLine: 'Right answer is "yes" once the API bill or the latency budget actually hurts.',
    fixes: 'Production pattern: student by default, escalate to teacher on low confidence.',
    link: '/distillation-use-case',
    tone: 'text-rose', border: 'border-rose', bg: 'bg-rose/10',
  },
  {
    emoji: '🏗️',
    title: 'The canonical sequence',
    oneLine: 'Prompt → RAG → LoRA → Distill. Roughly in that order, for roughly that reason.',
    fixes: 'Each step assumes the last one is done. Don\'t skip.',
    link: '/case-study',
    tone: 'text-sun', border: 'border-sun', bg: 'bg-sun/10',
  },
  {
    emoji: '🏁',
    title: 'You\'re ready for the roadmap meeting',
    oneLine: 'When someone says "let\'s fine-tune", ask: is this a facts problem, or a habits problem?',
    fixes: 'That one question saves most teams six months and a budget cycle.',
    tone: 'text-paper', border: 'border-paper/40', bg: 'bg-white/5',
  },
]

const ch = CHAPTERS.find((c) => c.path === '/recap')!

export default function Recap() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 lg:py-12">
      <header className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
          <span className={`text-xs font-mono ${ch.accent}`}>{ch.n}</span>
          <span className="text-paper/30">·</span>
          <span className="text-xs uppercase tracking-widest text-paper/50">{ch.group}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold leading-tight">
          <span className="mr-2">{ch.emoji}</span>
          Thirteen ideas, one page.
        </h1>
        <p className="mt-3 text-paper/70 text-base md:text-lg max-w-2xl mx-auto">
          Bring this to your next AI roadmap meeting. It is the whole tour in one screen.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {CARDS.map((c, i) => {
          const inner = (
            <div className={`h-full rounded-2xl border-2 ${c.border} bg-ink-soft p-4 transition-all hover:-translate-y-0.5 hover:border-white/40`}>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl">{c.emoji}</span>
                <span className="text-[10px] font-mono text-paper/40">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <p className={`font-bold mb-1 ${c.tone}`}>{c.title}</p>
              <p className="text-sm text-paper mb-2 leading-snug">{c.oneLine}</p>
              <p className="text-xs text-paper/65 leading-snug">{c.fixes}</p>
            </div>
          )
          return c.link ? (
            <Link key={i} to={c.link} className="block">{inner}</Link>
          ) : (
            <div key={i}>{inner}</div>
          )
        })}
      </div>

      <section className="mt-12 max-w-3xl mx-auto rounded-2xl border border-white/10 bg-ink-soft p-5 md:p-6">
        <p className="text-[11px] uppercase tracking-widest text-paper/50 mb-2">The one decision tree</p>
        <ol className="space-y-2 text-sm text-paper leading-relaxed list-decimal list-inside">
          <li>Is the answer <em className="text-sky not-italic">wrong about facts</em>? → RAG.</li>
          <li>Is the answer <em className="text-sun not-italic">right but wrong in tone or shape</em>? → LoRA fine-tune.</li>
          <li>Is the answer correct but the system <em className="text-rose not-italic">too slow or too expensive</em>? → Distill.</li>
          <li>If two of the above are true, do them in the order above. Never skip.</li>
        </ol>
      </section>

      <section className="mt-10 text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-paper/80 hover:text-paper transition-colors"
        >
          ← Back to the start
        </Link>
      </section>
    </div>
  )
}
