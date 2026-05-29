import { useState } from 'react'
import { CHAPTERS } from '../chapters'
import ChapterShell from '../components/ChapterShell'

const ch = CHAPTERS.find((c) => c.path === '/three-roads')!

/* ──────────────────────────────────────────────────────────────────────────
 *  THREE INDEPENDENT APPROACHES — not three parts of one system.
 *  Each beat shows ONE approach applied to the base model, with the others
 *  hidden (not dimmed). The final beat shows three side-by-side scenarios
 *  to make independence visually unmistakable.
 *  ────────────────────────────────────────────────────────────────────── */

const beats = [
  {
    caption: 'You start with one base model. Three independent things you can do to make it useful at work.',
    llmNote: 'These three are NOT components of a single system. They are three different tools. You can pick one — or, separately, layer them (Ch 12).',
    readingMs: 3400,
  },
  {
    caption: 'Approach 1 · RAG, on its own. Leave the model alone. Wrap a search system around it.',
    llmNote: 'No model weights change. You change the prompt — the new bits of prompt are pulled from a search over your private data.',
    readingMs: 3400,
  },
  {
    caption: 'Approach 2 · LoRA, on its own. No documents. Just a tiny patch of new weights pinned to the brain.',
    llmNote: 'A LoRA adapter is under 1% of the original size. You can have many of them and swap them per task.',
    readingMs: 3400,
  },
  {
    caption: 'Approach 3 · Distillation, on its own. Train a smaller, cheaper copy that mimics the big model.',
    llmNote: 'The student keeps the teacher\'s style and roughly its quality, at ~10× the speed and ~10% of the cost.',
    readingMs: 3400,
  },
  {
    caption: 'Three independent approaches. Pick by the pain you have. (You can stack them later — see Ch 12.)',
    llmNote: 'In practice teams pick one, ship it, then add another six months later if a new pain shows up. The case study walks that timeline.',
    readingMs: 3400,
  },
]

type Road = 'rag' | 'lora' | 'distill'

export default function ThreeRoads() {
  const [step, setStep] = useState(0)
  const active: Road | 'all' | null =
    step === 0 ? null :
    step === 1 ? 'rag' :
    step === 2 ? 'lora' :
    step === 3 ? 'distill' :
    'all'

  return (
    <ChapterShell
      chapter={ch}
      beats={beats}
      onStep={setStep}
      watch={
        <div className="space-y-4">
          {/* Big honking independence banner — always visible */}
          <div className="rounded-xl border border-paper/30 bg-ink p-3 flex items-start gap-3">
            <span className="text-2xl shrink-0">🚦</span>
            <div>
              <p className="text-sm text-paper">
                <span className="font-bold text-paper">These are three independent approaches</span> — they are NOT parts of one system.
                Pick the one that fixes your pain. You can also <em>layer them</em>, but that is a separate (later) decision.
              </p>
            </div>
          </div>

          {/* Diagram switches between single-scenario (one treatment) and side-by-side (all three) */}
          {active === 'all' ? <ThreeScenarios /> : <SingleScenario active={active} />}

          <ComparisonTable active={active} />
          <PainMap />
        </div>
      }
      outro={
        <p>
          The order in real teams is almost always <span className="text-sky">RAG</span> first (it fixes the most common pain),
          then a small <span className="text-grape-soft">LoRA</span> if voice or format still feel off, and{' '}
          <span className="text-rose">distillation</span> last, once volume justifies the engineering. Each on its own
          buys you something different. Layering is optional.
        </p>
      }
    />
  )
}

/* ──────────────────────────────────────────────────────────────────────────
 *  Single-scenario diagram — base model + ONLY the active treatment.
 *  No ghosting of the other two. Empty space means "this approach uses
 *  nothing else".
 *  ────────────────────────────────────────────────────────────────────── */

function SingleScenario({ active }: { active: Road | null }) {
  return (
    <div className="relative rounded-xl border border-white/10 bg-ink overflow-hidden" style={{ minHeight: 320 }}>
      {/* Scenario label top-left, treatment label top-right (only when there is one) */}
      <span className="absolute top-2 left-3 text-[10px] font-mono uppercase tracking-widest text-paper/50">
        {active === null ? 'Starting point · no treatment yet' : `Approach: ${LABEL[active]}`}
      </span>

      {/* Central base model */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="relative">
          <div className="rounded-full border-2 border-paper/60 bg-ink-soft w-28 h-28 flex flex-col items-center justify-center shadow-[0_0_24px_-4px_rgba(168,139,250,0.4)]">
            <span className="text-4xl">🧠</span>
            <p className="text-[10px] uppercase tracking-widest text-paper/60 mt-1">Base LLM</p>
          </div>

          {active === 'lora' && (
            <div className="absolute -top-2 -right-3 rotate-12 anim-pop-in">
              <div className="rounded-md bg-grape-soft text-ink-soft text-[10px] font-bold px-2 py-1 shadow-lg border border-grape-soft">
                🗒️ LoRA
                <p className="text-[8px] font-normal opacity-80">~1% new weights</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RAG — library to the left */}
      {active === 'rag' && (
        <div className="absolute top-1/2 left-6 -translate-y-1/2 anim-float-in">
          <div className="rounded-lg border-2 border-sky bg-ink-soft p-2 w-36">
            <p className="text-[10px] font-mono text-sky mb-1">📚 Library</p>
            <div className="space-y-0.5">
              {['Handbook', 'Wiki', 'FAQ'].map((d) => (
                <div key={d} className="text-[9px] text-paper/85 truncate">📄 {d}</div>
              ))}
            </div>
          </div>
          <svg className="absolute -right-32 top-1/2 -translate-y-1/2" width="130" height="40">
            <defs>
              <marker id="arrSky" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 z" fill="#38bdf8" />
              </marker>
            </defs>
            <line x1="5" y1="20" x2="120" y2="20" stroke="#38bdf8" strokeWidth="2" className="anim-dash-flow" markerEnd="url(#arrSky)" />
            <text x="60" y="14" textAnchor="middle" fontSize="10" fill="#38bdf8" className="font-mono">cheat sheet at query time</text>
          </svg>
        </div>
      )}

      {/* Distillation — clone to the right */}
      {active === 'distill' && (
        <div className="absolute top-1/2 right-6 -translate-y-1/2 anim-float-in">
          <svg className="absolute -left-32 top-1/2 -translate-y-1/2" width="130" height="40">
            <defs>
              <marker id="arrRose" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 z" fill="#f472b6" />
              </marker>
            </defs>
            <line x1="5" y1="20" x2="120" y2="20" stroke="#f472b6" strokeWidth="2" className="anim-dash-flow" markerEnd="url(#arrRose)" />
            <text x="60" y="14" textAnchor="middle" fontSize="10" fill="#f472b6" className="font-mono">trained to copy</text>
          </svg>
          <div className="rounded-full border-2 border-rose bg-ink-soft w-20 h-20 flex flex-col items-center justify-center">
            <span className="text-3xl">🌱</span>
            <p className="text-[8px] uppercase tracking-widest text-rose">Student</p>
          </div>
          <p className="text-[10px] text-rose font-mono mt-2 text-center">
            ~7B params · ~10× faster · ~10× cheaper
          </p>
        </div>
      )}

      {/* LoRA — callout explaining the patch */}
      {active === 'lora' && (
        <div className="absolute top-1/2 right-6 -translate-y-1/2 anim-float-in">
          <div className="rounded-lg border-2 border-grape-soft bg-ink-soft p-2 w-44">
            <p className="text-[10px] font-mono text-grape-soft mb-1">🗒️ The adapter holds</p>
            <div className="space-y-0.5 text-[10px] text-paper">
              <p>+ Brand voice</p>
              <p>+ JSON format</p>
              <p>+ Refusal rules</p>
            </div>
            <p className="text-[9px] text-paper/55 mt-1 italic">swappable per task</p>
          </div>
        </div>
      )}

      {/* Bottom-of-diagram explainer specific to the scenario */}
      <p className="absolute bottom-2 left-3 right-3 text-center text-[10px] text-paper/55">
        {active === null && 'Same base model in every scenario below.'}
        {active === 'rag' && 'No weight changes. The library lives outside the model.'}
        {active === 'lora' && 'No library. Just a tiny patch pinned to the frozen brain.'}
        {active === 'distill' && 'No library and no patch. A separate, smaller model trained on the teacher\'s answers.'}
      </p>
    </div>
  )
}

const LABEL: Record<Road, string> = {
  rag: 'RAG (retrieval)',
  lora: 'LoRA (fine-tune)',
  distill: 'Distillation',
}

/* ──────────────────────────────────────────────────────────────────────────
 *  Three side-by-side scenarios — drives independence home.
 *  ────────────────────────────────────────────────────────────────────── */

interface Scenario {
  id: Road
  emoji: string
  label: string
  tone: string         // text-* class
  border: string       // border-* class
  bg: string           // bg-*/N
  diagram: 'rag' | 'lora' | 'distill'
  oneLiner: string
}

const SCENARIOS: Scenario[] = [
  { id: 'rag',     emoji: '📖', label: 'RAG only',        tone: 'text-sky',        border: 'border-sky',        bg: 'bg-sky/5',   diagram: 'rag',     oneLiner: 'Base LLM + library, no weight changes.' },
  { id: 'lora',    emoji: '🗒️', label: 'LoRA only',       tone: 'text-grape-soft', border: 'border-grape-soft', bg: 'bg-grape/10', diagram: 'lora',    oneLiner: 'Base LLM + adapter, no library.' },
  { id: 'distill', emoji: '🎓', label: 'Distillation only', tone: 'text-rose',     border: 'border-rose',       bg: 'bg-rose/5',  diagram: 'distill', oneLiner: 'A new, smaller model. Separate from the original.' },
]

function ThreeScenarios() {
  return (
    <div>
      <p className="text-center text-[11px] font-mono uppercase tracking-widest text-paper/55 mb-2">
        Three independent scenarios — each fully working on its own
      </p>
      <div className="grid md:grid-cols-3 gap-3">
        {SCENARIOS.map((s) => (
          <MiniScenario key={s.id} scenario={s} />
        ))}
      </div>
      <p className="text-center text-[11px] text-paper/55 italic mt-3">
        Each box above is a complete, separate deployment. Chapter 12 shows what stacking all three looks like.
      </p>
    </div>
  )
}

function MiniScenario({ scenario }: { scenario: Scenario }) {
  return (
    <div className={`rounded-xl border-2 ${scenario.border} ${scenario.bg} p-3`}>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-xl">{scenario.emoji}</span>
        <p className={`text-sm font-bold ${scenario.tone}`}>{scenario.label}</p>
      </div>

      {/* Tiny diagram per scenario */}
      <div className="rounded-lg border border-white/10 bg-ink p-3 mb-2" style={{ minHeight: 120 }}>
        {scenario.diagram === 'rag' && <MiniRag />}
        {scenario.diagram === 'lora' && <MiniLora />}
        {scenario.diagram === 'distill' && <MiniDistill />}
      </div>

      <p className="text-[11px] text-paper">{scenario.oneLiner}</p>
    </div>
  )
}

function MiniRag() {
  return (
    <div className="flex items-center justify-center gap-2 h-full">
      <div className="rounded border-2 border-sky bg-ink-soft px-2 py-1.5 text-[10px] text-sky font-mono text-center">
        📚<br/>Library
      </div>
      <span className="text-sky">→</span>
      <div className="rounded-full border-2 border-paper/60 bg-ink-soft w-14 h-14 flex flex-col items-center justify-center">
        <span className="text-2xl">🧠</span>
        <span className="text-[8px] text-paper/60">Base</span>
      </div>
    </div>
  )
}

function MiniLora() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="relative">
        <div className="rounded-full border-2 border-paper/60 bg-ink-soft w-16 h-16 flex flex-col items-center justify-center">
          <span className="text-2xl">🧠</span>
          <span className="text-[8px] text-paper/60">Base</span>
        </div>
        <div className="absolute -top-1 -right-3 rotate-12">
          <div className="rounded bg-grape-soft text-ink-soft text-[9px] font-bold px-1.5 py-0.5">🗒️</div>
        </div>
      </div>
    </div>
  )
}

function MiniDistill() {
  return (
    <div className="flex items-center justify-center gap-2 h-full">
      <div className="rounded-full border-2 border-paper/60 bg-ink-soft w-14 h-14 flex flex-col items-center justify-center">
        <span className="text-2xl">🧠</span>
        <span className="text-[8px] text-paper/60">Teacher</span>
      </div>
      <span className="text-rose">→</span>
      <div className="rounded-full border-2 border-rose bg-ink-soft w-10 h-10 flex flex-col items-center justify-center">
        <span className="text-base">🌱</span>
        <span className="text-[7px] text-rose">Student</span>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────────
 *  Comparison table (unchanged) and pain-map (unchanged).
 *  ────────────────────────────────────────────────────────────────────── */

interface Row {
  label: string
  rag: string
  lora: string
  distill: string
}

const ROWS: Row[] = [
  { label: 'What changes',  rag: 'Nothing',                lora: '< 1% of weights',     distill: 'A new, smaller model' },
  { label: 'Time to ship',  rag: 'Days – weeks',           lora: '1 – 4 weeks',         distill: 'Weeks – months' },
  { label: 'Needs GPU?',    rag: 'No',                     lora: '1 (consumer)',        distill: '1 (consumer)' },
  { label: 'Fixes facts',   rag: '✓',                      lora: '—',                   distill: '—' },
  { label: 'Fixes voice',   rag: '—',                      lora: '✓',                    distill: 'inherits teacher' },
  { label: 'Fixes cost',    rag: '—',                      lora: '—',                   distill: '✓' },
  { label: 'Stays fresh',   rag: 'Re-index any time',      lora: 'Needs new training',   distill: 'Needs new training' },
]

function ComparisonTable({ active }: { active: Road | 'all' | null }) {
  return (
    <div className="mt-5">
      <p className="text-[10px] uppercase tracking-widest text-paper/45 mb-2">Side-by-side · what each one is good for</p>
      <div className="overflow-x-auto -mx-2 px-2">
        <table className="w-full text-xs border-separate border-spacing-y-1" style={{ minWidth: 540 }}>
          <thead>
            <tr className="text-[10px] font-mono uppercase tracking-widest">
              <th className="text-left text-paper/50 px-2">·</th>
              <th className={`text-left px-2 ${active === 'rag' || active === 'all' ? 'text-sky' : 'text-sky/55'}`}>📖 RAG</th>
              <th className={`text-left px-2 ${active === 'lora' || active === 'all' ? 'text-grape-soft' : 'text-grape-soft/55'}`}>🗒️ LoRA</th>
              <th className={`text-left px-2 ${active === 'distill' || active === 'all' ? 'text-rose' : 'text-rose/55'}`}>🎓 Distill</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.label}>
                <td className="text-paper/65 px-2 py-1.5">{r.label}</td>
                <td className={`px-2 py-1.5 rounded-l-md ${active === 'rag' || active === 'all' ? 'bg-sky/10 text-paper' : 'text-paper/55'}`}>{r.rag}</td>
                <td className={`px-2 py-1.5 ${active === 'lora' || active === 'all' ? 'bg-grape/15 text-paper' : 'text-paper/55'}`}>{r.lora}</td>
                <td className={`px-2 py-1.5 rounded-r-md ${active === 'distill' || active === 'all' ? 'bg-rose/10 text-paper' : 'text-paper/55'}`}>{r.distill}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PainMap() {
  return (
    <div className="mt-5 grid grid-cols-3 gap-3 text-center">
      <div className="rounded-lg border-2 border-coral bg-ink-soft p-2">
        <p className="text-coral font-semibold text-sm">Knows wrong things</p>
        <p className="text-[10px] text-paper/60 mt-0.5">fix → 📖 RAG</p>
      </div>
      <div className="rounded-lg border-2 border-coral bg-ink-soft p-2">
        <p className="text-coral font-semibold text-sm">Speaks wrong</p>
        <p className="text-[10px] text-paper/60 mt-0.5">fix → 🗒️ LoRA</p>
      </div>
      <div className="rounded-lg border-2 border-coral bg-ink-soft p-2">
        <p className="text-coral font-semibold text-sm">Costs too much</p>
        <p className="text-[10px] text-paper/60 mt-0.5">fix → 🎓 Distill</p>
      </div>
    </div>
  )
}
