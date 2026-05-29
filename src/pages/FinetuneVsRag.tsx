import { useState } from 'react'
import { CHAPTERS } from '../chapters'
import ChapterShell from '../components/ChapterShell'

const ch = CHAPTERS.find((c) => c.path === '/finetune-vs-rag')!

/* ──────────────────────────────────────────────────────────────────────────
 *  Decision tree, walked one branch per beat with a real example.
 *  Two yes/no questions. Four leaves.
 *
 *  Layout uses a single SVG to draw the connectors so the leaves always line
 *  up under the right voice question.
 *  ────────────────────────────────────────────────────────────────────── */

type Leaf = 'both' | 'rag' | 'tune' | 'prompt'

interface LeafMeta {
  label: string
  emoji: string
  color: string         // raw hex for SVG
  tone: string          // text-* class
  bg: string            // bg-*/N class
  border: string        // border-* class
  ring: string          // ring-*/N class
  blurb: string
}

const LEAF_META: Record<Leaf, LeafMeta> = {
  both:   { label: 'RAG + Fine-tune', emoji: '🧩', color: '#a78bfa', tone: 'text-grape-soft', bg: 'bg-grape/20',   border: 'border-grape-soft',  ring: 'ring-grape-soft/60',  blurb: 'Layer them. RAG for facts, fine-tune for voice.' },
  rag:    { label: 'RAG only',        emoji: '📖', color: '#38bdf8', tone: 'text-sky',        bg: 'bg-sky/15',     border: 'border-sky',         ring: 'ring-sky/60',         blurb: 'Wrap a search system around the model.' },
  tune:   { label: 'Fine-tune only',  emoji: '🗒️', color: '#fbbf24', tone: 'text-sun',        bg: 'bg-sun/15',     border: 'border-sun',         ring: 'ring-sun/60',         blurb: 'Teach the model new habits with a LoRA adapter.' },
  prompt: { label: 'Just a prompt',   emoji: '✏️', color: '#fdf6f0', tone: 'text-paper',      bg: 'bg-white/10',   border: 'border-paper/40',    ring: 'ring-paper/40',       blurb: 'A careful system prompt is enough.' },
}

interface Example {
  question: string
  reply: string
  factsWrong: boolean
  voiceWrong: boolean
  leaf: Leaf
  why: string
}

const EXAMPLES: Example[] = [
  {
    question: 'What is our refund window for Enterprise plans?',
    reply: '"Most plans offer 30 days, prorated." — invented, not from our handbook',
    factsWrong: true,
    voiceWrong: false,
    leaf: 'rag',
    why: 'Voice is fine. Facts are wrong because the model never read our handbook. RAG hands it the right page.',
  },
  {
    question: 'Reply to this angry customer.',
    reply: '"Dear Valued Customer, We sincerely regret the inconvenience…" — corporate, not Northwind tone',
    factsWrong: false,
    voiceWrong: true,
    leaf: 'tune',
    why: 'Facts are fine. Voice is wrong. A small LoRA fine-tune on 4 000 real replies teaches the right tone.',
  },
  {
    question: 'Draft a customer-support reply for account #4421 in our brand voice.',
    reply: '"Sorry for the trouble. I checked order #5512 and…" — wrong order AND wrong tone',
    factsWrong: true,
    voiceWrong: true,
    leaf: 'both',
    why: 'Facts wrong (no account data) AND voice wrong (default corporate). Need RAG for the data, LoRA for the voice. Layer them.',
  },
  {
    question: 'Summarise this meeting transcript in three bullets.',
    reply: '"• Decision X · • Owner Y · • Deadline Z" — actually fine',
    factsWrong: false,
    voiceWrong: false,
    leaf: 'prompt',
    why: 'No new knowledge needed (it has the transcript). No special voice needed. A clear system prompt is enough.',
  },
]

const beats = [
  {
    caption: 'Two yes/no questions decide everything. Are the FACTS wrong? Are the VOICE or FORMAT wrong?',
    llmNote: 'Engineers tend to over-pick fine-tuning because it sounds more like "real ML". RAG is usually the boring right answer.',
    readingMs: 3200,
  },
  {
    caption: 'Example 1 — Bot makes up the refund policy. Facts wrong, voice fine. The tree says: RAG only.',
    llmNote: 'Most internal Q&A tools live in this branch. No fine-tuning needed — just retrieval over the right documents.',
    readingMs: 3400,
  },
  {
    caption: 'Example 2 — Bot sounds like corporate sludge. Facts are fine, voice is wrong. The tree says: Fine-tune only.',
    llmNote: 'A few thousand high-quality reply examples + a LoRA adapter handle this without retrieval.',
    readingMs: 3400,
  },
  {
    caption: 'Example 3 — Wrong account AND wrong tone. Both axes broken. The tree says: RAG + Fine-tune.',
    llmNote: 'Most production assistants end up here — RAG layer for live data, a thin adapter for tone and format.',
    readingMs: 3400,
  },
  {
    caption: 'Example 4 — It already works. Facts fine, voice fine. The tree says: Just a prompt.',
    llmNote: 'You\'d be surprised how often "write a better system prompt" is the entire answer. Try this before anything else.',
    readingMs: 3200,
  },
  {
    caption: 'Rule of thumb: facts → RAG. Voice → fine-tune. Both → layer them. Neither → prompt.',
    llmNote: 'When two are true, sequence matters: do RAG first so your fine-tuning sees the right context. Distillation, if needed, comes last.',
    readingMs: 3400,
  },
]

export default function FinetuneVsRag() {
  const [step, setStep] = useState(0)

  const activeIdx = step >= 1 && step <= 4 ? step - 1 : -1
  const showSummary = step === 5
  const example = activeIdx >= 0 ? EXAMPLES[activeIdx] : null

  return (
    <ChapterShell
      chapter={ch}
      beats={beats}
      onStep={setStep}
      watch={
        <div className="space-y-4">
          {example && <ExampleCard example={example} idx={activeIdx + 1} />}
          <DecisionTree example={example} />
          {example && (
            <div className={`rounded-xl border-2 bg-ink-soft p-3 ${LEAF_META[example.leaf].border}`}>
              <p className={`text-[10px] font-mono uppercase tracking-widest mb-1 ${LEAF_META[example.leaf].tone}`}>Why this branch</p>
              <p className="text-sm text-paper">{example.why}</p>
            </div>
          )}
          {showSummary && <SummaryRule />}
        </div>
      }
      outro={
        <p>
          If your problem lives in either branch where facts or voice is wrong, the next chapters explain how modern
          teams fine-tune giant models without a giant budget — <span className="text-grape-soft">LoRA</span> and{' '}
          <span className="text-sun">QLoRA</span>.
        </p>
      }
    />
  )
}

/* ── example card ──────────────────────────────────────────────────────── */

function ExampleCard({ example, idx }: { example: Example; idx: number }) {
  return (
    <div className="rounded-xl border border-white/15 bg-ink p-3">
      <p className="text-[10px] font-mono text-paper/45 uppercase tracking-widest mb-2">
        Example {idx} · what came out of the bot
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-lg border border-white/15 bg-ink-soft p-2.5">
          <p className="text-[10px] uppercase tracking-widest text-paper/45 mb-0.5">Maya asks</p>
          <p className="text-sm text-paper">"{example.question}"</p>
        </div>
        <div className="rounded-lg border border-white/15 bg-ink-soft p-2.5">
          <p className="text-[10px] uppercase tracking-widest text-paper/45 mb-0.5">Bot replies</p>
          <p className="text-sm text-paper">{example.reply}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Diagnose label="Facts wrong?" yes={example.factsWrong} />
        <Diagnose label="Voice / format wrong?" yes={example.voiceWrong} />
      </div>
    </div>
  )
}

function Diagnose({ label, yes }: { label: string; yes: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border-2 text-xs font-semibold ${
        yes ? 'border-coral text-coral bg-coral/10' : 'border-mint text-mint bg-mint/10'
      }`}
    >
      <span>{label}</span>
      <span className="font-mono">{yes ? '→ YES' : '→ no'}</span>
    </span>
  )
}

/* ── decision tree (proper 4-col grid + single SVG overlay) ───────────── */

const LEAF_ORDER: Leaf[] = ['both', 'rag', 'tune', 'prompt']

// Which leaf does (factsWrong, voiceWrong) map to?
function pickLeaf(factsWrong: boolean, voiceWrong: boolean): Leaf {
  if (factsWrong && voiceWrong) return 'both'
  if (factsWrong && !voiceWrong) return 'rag'
  if (!factsWrong && voiceWrong) return 'tune'
  return 'prompt'
}

function DecisionTree({ example }: { example: Example | null }) {
  const factsBranch: 'yes' | 'no' | null = example ? (example.factsWrong ? 'yes' : 'no') : null
  const activeLeaf: Leaf | null = example ? pickLeaf(example.factsWrong, example.voiceWrong) : null

  return (
    <div className="rounded-xl border border-white/10 bg-ink p-4">
      <p className="text-[10px] font-mono uppercase tracking-widest text-paper/55 mb-3">The decision tree</p>

      {/* ── Mobile (< md): stacked decision-list ── */}
      <div className="md:hidden">
        <DecisionList factsBranch={factsBranch} activeLeaf={activeLeaf} />
      </div>

      {/* ── Tablet+ (md+): full visual tree with SVG connectors ── */}
      <div className="hidden md:block">
        {/* Row 1 — trunk */}
        <div className="flex justify-center mb-2">
          <Node label='"Facts wrong?"' active={!!example} />
        </div>

        {/* Row 2 — diagonal connectors trunk → two voice questions */}
        <div className="relative" style={{ height: 56 }}>
          <Connectors
            paths={[
              { id: 'L', x1: 50, y1: 0,  x2: 25, y2: 100, label: 'YES', labelX: 30, active: factsBranch === 'yes' },
              { id: 'R', x1: 50, y1: 0,  x2: 75, y2: 100, label: 'no',  labelX: 64, active: factsBranch === 'no' },
            ]}
          />
        </div>

        {/* Row 3 — two voice questions, lined up with the leaf pairs underneath */}
        <div className="grid grid-cols-4 gap-3 mb-2">
          <div className="col-span-2 flex justify-center">
            <Node label='"Voice wrong?"' active={factsBranch === 'yes'} />
          </div>
          <div className="col-span-2 flex justify-center">
            <Node label='"Voice wrong?"' active={factsBranch === 'no'} />
          </div>
        </div>

        {/* Row 4 — diagonal connectors to leaves */}
        <div className="relative" style={{ height: 56 }}>
          <Connectors
            paths={[
              { id: 'a', x1: 25, y1: 0, x2: 12.5, y2: 100, label: 'YES', labelX: 15, active: activeLeaf === 'both' },
              { id: 'b', x1: 25, y1: 0, x2: 37.5, y2: 100, label: 'no',  labelX: 33, active: activeLeaf === 'rag' },
              { id: 'c', x1: 75, y1: 0, x2: 62.5, y2: 100, label: 'YES', labelX: 65, active: activeLeaf === 'tune' },
              { id: 'd', x1: 75, y1: 0, x2: 87.5, y2: 100, label: 'no',  labelX: 84, active: activeLeaf === 'prompt' },
            ]}
          />
        </div>

        {/* Row 5 — leaves */}
        <div className="grid grid-cols-4 gap-2">
          {LEAF_ORDER.map((leaf) => (
            <LeafCard key={leaf} leaf={leaf} active={activeLeaf === leaf} />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────────
 *  Mobile-only: stacked decision list. Each branch shown as a row with
 *  "Facts wrong? · Voice wrong? → leaf" — readable at 375px width.
 *  ────────────────────────────────────────────────────────────────────── */

interface MobileRow {
  facts: 'YES' | 'no'
  voice: 'YES' | 'no'
  leaf: Leaf
}
const MOBILE_ROWS: MobileRow[] = [
  { facts: 'YES', voice: 'YES', leaf: 'both' },
  { facts: 'YES', voice: 'no',  leaf: 'rag' },
  { facts: 'no',  voice: 'YES', leaf: 'tune' },
  { facts: 'no',  voice: 'no',  leaf: 'prompt' },
]

function DecisionList({
  factsBranch,
  activeLeaf,
}: {
  factsBranch: 'yes' | 'no' | null
  activeLeaf: Leaf | null
}) {
  return (
    <div className="space-y-2">
      {MOBILE_ROWS.map((row) => {
        const isActive = activeLeaf === row.leaf
        const onFactsPath = factsBranch === row.facts.toLowerCase()
        const m = LEAF_META[row.leaf]
        return (
          <div
            key={row.leaf}
            className={[
              'rounded-lg border-2 bg-ink-soft p-3 grid grid-cols-[auto_auto_1fr] items-center gap-3 transition-all',
              m.border,
              isActive ? `${m.bg} ring-2 ring-offset-2 ring-offset-ink ${m.ring} anim-pop-in` :
              onFactsPath ? '' : 'opacity-50',
            ].join(' ')}
          >
            {/* Diagnosis pills */}
            <div className="flex flex-col gap-1">
              <span className={`text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded ${row.facts === 'YES' ? 'bg-coral/20 text-coral' : 'bg-mint/15 text-mint'}`}>
                facts {row.facts}
              </span>
              <span className={`text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded ${row.voice === 'YES' ? 'bg-coral/20 text-coral' : 'bg-mint/15 text-mint'}`}>
                voice {row.voice}
              </span>
            </div>
            <span className="text-paper/40">→</span>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base leading-none">{m.emoji}</span>
                <p className={`font-bold text-sm ${m.tone}`}>{m.label}</p>
              </div>
              <p className="text-[11px] text-paper/85 leading-snug mt-0.5">{m.blurb}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function Node({ label, active }: { label: string; active: boolean }) {
  return (
    <div
      className={[
        'rounded-lg border-2 bg-ink-soft px-3 py-1.5 text-sm font-semibold transition-all whitespace-nowrap',
        active
          ? 'border-grape-soft text-paper ring-2 ring-offset-2 ring-offset-ink ring-grape-soft/50'
          : 'border-paper/25 text-paper/55',
      ].join(' ')}
    >
      {label}
    </div>
  )
}

interface ConnectorPath {
  id: string
  x1: number
  y1: number
  x2: number
  y2: number
  label: string
  labelX: number
  active: boolean
}

function Connectors({ paths }: { paths: ConnectorPath[] }) {
  return (
    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
      {paths.map((p) => {
        const stroke = p.active ? '#a78bfa' : 'rgba(253,246,240,0.18)'
        return (
          <g key={p.id}>
            <line
              x1={`${p.x1}%`} y1={`${p.y1}%`}
              x2={`${p.x2}%`} y2={`${p.y2}%`}
              stroke={stroke}
              strokeWidth={p.active ? 0.6 : 0.3}
              vectorEffect="non-scaling-stroke"
              className={p.active ? 'anim-dash-flow' : ''}
              style={p.active ? undefined : { strokeDasharray: 'none' }}
            />
          </g>
        )
      })}
      {/* Labels on top of lines */}
      {paths.map((p) => (
        <foreignObject key={`l-${p.id}`} x={`${p.labelX - 6}%`} y="40%" width="12%" height="20%">
          <div
            className={[
              'text-[10px] font-mono uppercase tracking-widest text-center rounded px-1',
              p.active ? 'text-grape-soft bg-ink' : 'text-paper/35',
            ].join(' ')}
          >
            {p.label}
          </div>
        </foreignObject>
      ))}
    </svg>
  )
}

function LeafCard({ leaf, active }: { leaf: Leaf; active: boolean }) {
  const m = LEAF_META[leaf]
  return (
    <div
      className={[
        'rounded-xl border-2 bg-ink-soft p-3 transition-all',
        m.border,
        active ? `${m.bg} ring-2 ring-offset-2 ring-offset-ink ${m.ring} anim-pop-in` : 'opacity-40',
      ].join(' ')}
    >
      <div className="flex items-baseline gap-1.5 mb-1">
        <span className="text-base">{m.emoji}</span>
        <p className={`font-bold text-sm leading-tight ${m.tone}`}>{m.label}</p>
      </div>
      <p className="text-[11px] text-paper leading-snug">{m.blurb}</p>
    </div>
  )
}

/* ── summary rule ──────────────────────────────────────────────────────── */

function SummaryRule() {
  return (
    <div className="rounded-xl border border-white/10 bg-ink-soft p-4">
      <p className="text-[10px] font-mono uppercase tracking-widest text-paper/55 mb-3">One-page rule</p>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-lg border-l-4 border-sky bg-ink p-3">
          <p className="font-bold text-sky">Facts wrong → 📖 RAG</p>
          <p className="text-xs text-paper/75 mt-0.5">Cheapest, fastest, no model changes.</p>
        </div>
        <div className="rounded-lg border-l-4 border-sun bg-ink p-3">
          <p className="font-bold text-sun">Voice wrong → 🗒️ Fine-tune (LoRA)</p>
          <p className="text-xs text-paper/75 mt-0.5">Small adapter, behaviour shifts, weights mostly frozen.</p>
        </div>
        <div className="rounded-lg border-l-4 border-grape-soft bg-ink p-3">
          <p className="font-bold text-grape-soft">Both wrong → 🧩 Layer them</p>
          <p className="text-xs text-paper/75 mt-0.5">RAG first, then a thin LoRA on top.</p>
        </div>
        <div className="rounded-lg border-l-4 border-paper/40 bg-ink p-3">
          <p className="font-bold text-paper">Neither → ✏️ Just a prompt</p>
          <p className="text-xs text-paper/75 mt-0.5">Try this before reaching for any of the above.</p>
        </div>
      </div>
    </div>
  )
}
