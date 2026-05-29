import { useEffect, useState } from 'react'
import { CHAPTERS } from '../chapters'
import ChapterShell from '../components/ChapterShell'
import VectorScatter2D from '../components/VectorScatter2D'

const ch = CHAPTERS.find((c) => c.path === '/rag-internals')!

/* ──────────────────────────────────────────────────────────────────────────
 *  ONE persistent horizontal pipeline. As beats progress, parts of the
 *  pipeline ANIMATE — they don't get appended below.
 *
 *    [📚 Library] ──▶ [✂️ Chunker] ──▶ [⚙️ Embedder] ──▶ [🗂️ Vector space] ──▶ [🤖 LLM] ──▶ answer
 *
 *  Beat 0 — entire pipeline visible but idle; Maya's question floats below
 *           with a coral "0 matches" indicator (keyword search fails).
 *  Beat 1 — chunker activates: a document slides in, scissors animate, the
 *           cut sentence flashes red, three "good" chunks emerge.
 *  Beat 2 — chunks travel into the embedder, vector-bars are produced,
 *           the bars settle as dots in the vector space.
 *  Beat 3 — vector space view zooms in, dots labelled; refund cluster vs
 *           the office-hours outlier.
 *  Beat 4 — the question is embedded the same way and DROPS into the space;
 *           similarity lines pulse to the top-3 nearest chunks.
 *  Beat 5 — top-3 chunks fly to the LLM, the grounded answer emerges.
 *  ────────────────────────────────────────────────────────────────────── */

const beats = [
  {
    caption: 'The whole pipeline is right here. Idle for now. The keyword question at the bottom matches nothing — that\'s what we have to fix.',
    llmNote: 'Old-school search returns nothing because Maya\'s words and the handbook\'s words don\'t overlap.',
    readingMs: 3200,
  },
  {
    caption: 'Step 1 · the chunker slices documents into pieces. Good cuts on sentence boundaries keep each idea whole.',
    llmNote: 'If you cut at fixed character count instead, "45 days" gets severed across two chunks. Retrieval never finds both pieces together.',
    readingMs: 3600,
  },
  {
    caption: 'Step 2 · each chunk goes through the embedder and becomes a row of numbers. Similar meanings get similar colour patterns.',
    llmNote: 'Embeddings are vectors of ~768 to ~3 072 numbers. We draw 10 here. Brighter = larger magnitude. Green vs coral = positive vs negative.',
    readingMs: 4000,
  },
  {
    caption: 'Step 3 · those number-rows are points in space. Similar phrasings cluster together. Different topics live far away.',
    llmNote: 'The math is just measuring distances between points. The vector database does this for millions of chunks in milliseconds.',
    readingMs: 3400,
  },
  {
    caption: 'Step 4 · embed Maya\'s question the same way. It drops into the cluster of refund-meaning chunks — even though her words and theirs don\'t overlap.',
    llmNote: 'This is the magic. Same embedder, same space, meaning matches without keyword matches.',
    readingMs: 3600,
  },
  {
    caption: 'Step 5 · top-K closest chunks fly to the LLM. The LLM writes the answer using them as ground truth.',
    llmNote: 'K is usually 3-10. More chunks = more context but more noise and more cost. Tune K per use case.',
    readingMs: 3400,
  },
]

/* ── data ───────────────────────────────────────────────────────────────── */

interface ChunkPoint {
  id: string
  text: string
  vec: number[]      // 10 dims for the bar visual
  topic: 'refund' | 'office'
  pos: { x: number; y: number }   // % within the vector-space mini-canvas
}

const CHUNKS: ChunkPoint[] = [
  { id: 'c1', text: 'Refunds prorated up to 45 days, MSA §3.2',     vec: [+0.82, -0.21, +0.74, +0.10, -0.33, +0.65, -0.12, +0.41, +0.55, -0.18], topic: 'refund', pos: { x: 28, y: 38 } },
  { id: 'c2', text: 'Annual plans · 30-day satisfaction guarantee', vec: [+0.78, -0.27, +0.81, +0.18, -0.28, +0.58, -0.18, +0.46, +0.49, -0.22], topic: 'refund', pos: { x: 33, y: 30 } },
  { id: 'c3', text: 'Self-serve refund under $500 via Support',     vec: [+0.71, -0.31, +0.69, +0.14, -0.30, +0.61, -0.15, +0.39, +0.52, -0.20], topic: 'refund', pos: { x: 24, y: 46 } },
  { id: 'c4', text: 'Office hours · Lyon location · weekdays',      vec: [-0.55, +0.62, -0.21, +0.71, +0.42, -0.59, +0.78, -0.42, -0.36, +0.66], topic: 'office', pos: { x: 78, y: 70 } },
]

const QUESTION_TEXT = 'How do I get my money back?'
const QUERY_POS = { x: 30, y: 36 }
const QUERY_VEC = [+0.75, -0.25, +0.78, +0.15, -0.31, +0.62, -0.16, +0.44, +0.51, -0.21]

const FULL_SENTENCE =
  'Refunds for Enterprise plans are prorated up to 45 days from contract start, per MSA §3.2.'

/* ──────────────────────────────────────────────────────────────────────────
 *  Component
 *  ────────────────────────────────────────────────────────────────────── */

export default function RagInternals() {
  const [step, setStep] = useState(0)

  // Sub-tick for in-place animations (chunker scissors, embedder cycling).
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 700)
    return () => clearInterval(id)
  }, [])

  return (
    <ChapterShell
      chapter={ch}
      beats={beats}
      onStep={setStep}
      watch={
        <div className="rounded-2xl border-2 border-mint bg-ink-soft p-4">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-xs font-mono uppercase tracking-widest text-mint">Live · the RAG pipeline</span>
            <span className="ml-auto text-[11px] text-paper/40">step {step + 1} of {beats.length}</span>
          </div>

          {/* The pipeline strip — always visible, parts animate based on step */}
          <Pipeline step={step} tick={tick} />

          {/* Detail panel below the pipeline — content depends on the active step */}
          <DetailPanel step={step} tick={tick} />
        </div>
      }
      outro={
        <>
          <p>
            <span className="text-mint font-semibold">Chunking</span> makes documents searchable in focused passages.{' '}
            <span className="text-mint font-semibold">Embedding</span> makes search work on meaning, not keywords.
          </p>
          <p className="text-paper/65">
            Together they explain almost every "RAG works" or "RAG doesn't work" story.
          </p>
        </>
      }
    />
  )
}

/* ──────────────────────────────────────────────────────────────────────────
 *  The pipeline strip — five stages in a single row.
 *  Each stage takes the current step and renders accordingly.
 *  ────────────────────────────────────────────────────────────────────── */

function Pipeline({ step, tick }: { step: number; tick: number }) {
  return (
    <div className="overflow-x-auto -mx-2 px-2 mb-4">
      <div
        className="grid items-stretch gap-2"
        style={{ gridTemplateColumns: '110px 24px 120px 24px 130px 24px 160px 24px 130px', minWidth: 820 }}
      >
        <Stage label="A · Library"     icon="📚" active={step >= 0} highlight={step === 1}>
          {step === 1 && <DocFlyout tick={tick} />}
        </Stage>
        <Arrow active={step >= 1} />
        <Stage label="B · Chunker"     icon="✂️" active={step >= 1} highlight={step === 1}>
          {step >= 1 && <ChunkerMini tick={tick} />}
        </Stage>
        <Arrow active={step >= 2} />
        <Stage label="C · Embedder"    icon="⚙️" active={step >= 2} highlight={step === 2}>
          {step >= 2 && <EmbedderMini tick={tick} />}
        </Stage>
        <Arrow active={step >= 3} />
        <Stage label="D · Vector space" icon="🗂️" active={step >= 3} highlight={step >= 3 && step <= 4}>
          {step >= 3 && <VectorMini step={step} />}
        </Stage>
        <Arrow active={step >= 5} />
        <Stage label="E · LLM"         icon="🤖" active={step >= 5} highlight={step === 5}>
          {step >= 5 && <LlmMini />}
        </Stage>
      </div>
    </div>
  )
}

function Stage({
  label,
  icon,
  active,
  highlight,
  children,
}: {
  label: string
  icon: string
  active: boolean
  highlight: boolean
  children?: React.ReactNode
}) {
  return (
    <div
      className={[
        'rounded-xl border-2 bg-ink-soft p-2 flex flex-col items-center justify-start gap-1 transition-all',
        highlight ? 'border-mint shadow-[0_0_20px_-6px_rgba(52,211,153,0.6)] scale-[1.03]'
        : active   ? 'border-mint/60'
                   : 'border-white/15 opacity-50',
      ].join(' ')}
      style={{ minHeight: 110 }}
    >
      <p className={`text-[9px] font-mono uppercase tracking-widest ${active ? 'text-mint' : 'text-paper/45'}`}>{label}</p>
      <span className="text-2xl">{icon}</span>
      <div className="w-full flex-1 flex items-center justify-center">{children}</div>
    </div>
  )
}

function Arrow({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 110" className="w-full h-full">
      <line
        x1="2" y1="55" x2="20" y2="55"
        stroke={active ? '#34d399' : 'rgba(253,246,240,0.18)'}
        strokeWidth={active ? 2.5 : 1.5}
        markerEnd={active ? 'url(#mintArr)' : undefined}
        className={active ? 'anim-dash-flow' : ''}
      />
      <defs>
        <marker id="mintArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="#34d399" />
        </marker>
      </defs>
    </svg>
  )
}

/* ── per-stage micro-animations ───────────────────────────────────────── */

function DocFlyout({ tick }: { tick: number }) {
  const docs = ['📄', '📄', '📄']
  const which = tick % docs.length
  return (
    <div className="flex flex-col gap-0.5">
      {docs.map((d, i) => (
        <span
          key={i}
          className="text-sm transition-transform duration-300"
          style={{ transform: i === which ? 'translateX(6px)' : 'none', opacity: i === which ? 1 : 0.55 }}
        >
          {d}
        </span>
      ))}
    </div>
  )
}

function ChunkerMini({ tick }: { tick: number }) {
  // Three chunks pulsing in sequence
  return (
    <div className="grid grid-cols-3 gap-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="block w-3 h-2 rounded-sm transition-all duration-200"
          style={{
            backgroundColor: '#34d399',
            opacity: tick % 3 === i ? 1 : 0.35,
            transform: tick % 3 === i ? 'scale(1.2)' : 'scale(1)',
          }}
        />
      ))}
    </div>
  )
}

function EmbedderMini({ tick }: { tick: number }) {
  const sample = CHUNKS[tick % CHUNKS.length]
  return (
    <div className="flex flex-col items-center gap-1">
      <VectorBars vec={sample.vec.slice(0, 6)} size={6} />
      <span className="text-[8px] font-mono text-mint">→ dot</span>
    </div>
  )
}

function VectorMini({ step }: { step: number }) {
  // Tiny vector-space preview — same dots but compact
  const showQuery = step >= 4
  const showLines = step >= 4
  const ranked = [...CHUNKS]
    .map((c) => ({ ...c, d: Math.hypot(c.pos.x - QUERY_POS.x, c.pos.y - QUERY_POS.y) }))
    .sort((a, b) => a.d - b.d)
  const topIds = new Set(ranked.slice(0, 3).map((r) => r.id))
  return (
    <div className="relative w-full h-16 bg-ink rounded border border-mint/30">
      {CHUNKS.map((c) => {
        const isTop = showLines && topIds.has(c.id)
        const color = c.topic === 'refund' ? '#34d399' : '#fb7185'
        return (
          <span
            key={c.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              left: `${c.pos.x}%`, top: `${c.pos.y}%`,
              width: isTop ? 7 : 5, height: isTop ? 7 : 5,
              backgroundColor: color,
              boxShadow: isTop ? `0 0 6px ${color}` : 'none',
            }}
          />
        )
      })}
      {showQuery && (
        <span
          className="absolute -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-sky border border-paper anim-pulse-glow"
          style={{ left: `${QUERY_POS.x}%`, top: `${QUERY_POS.y}%` }}
        />
      )}
      {showLines && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {ranked.slice(0, 3).map((r) => (
            <line
              key={r.id}
              x1={`${QUERY_POS.x}%`} y1={`${QUERY_POS.y}%`}
              x2={`${r.pos.x}%`}     y2={`${r.pos.y}%`}
              stroke="#34d399" strokeWidth="1.2" strokeOpacity="0.85"
              className="anim-dash-flow"
            />
          ))}
        </svg>
      )}
    </div>
  )
}

function LlmMini() {
  return (
    <div className="rounded border-2 border-sky bg-sky/10 px-2 py-1 anim-float-in">
      <p className="text-[9px] font-mono text-sky">+ top-3</p>
      <p className="text-[9px] font-mono text-sky">→ answer</p>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────────
 *  Detail panel below the pipeline — content depends on the active step,
 *  but the pipeline above NEVER disappears.
 *  ────────────────────────────────────────────────────────────────────── */

function DetailPanel({ step, tick }: { step: number; tick: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-ink p-4 min-h-[260px]">
      {step === 0 && <DetailKeyword />}
      {step === 1 && <DetailChunking />}
      {step === 2 && <DetailEmbedding tick={tick} />}
      {(step === 3 || step === 4) && <DetailVectorSpace step={step} />}
      {step >= 5 && <DetailAnswer />}
    </div>
  )
}

function DetailKeyword() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-mono text-paper/55 uppercase tracking-widest">Maya types</span>
        <span className="px-2.5 py-1 rounded bg-coral/15 border border-coral text-paper font-semibold text-sm">"{QUESTION_TEXT}"</span>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-mono text-paper/55 uppercase tracking-widest">Keywords tried</span>
        {['money', 'back', 'how'].map((w) => (
          <span key={w} className="px-2 py-0.5 rounded border border-coral/60 text-coral text-xs font-mono">
            {w} <span>✗</span>
          </span>
        ))}
      </div>
      <div className="rounded-lg border border-mint/40 bg-mint/5 p-3">
        <p className="text-[10px] font-mono text-mint uppercase tracking-widest mb-1">Handbook actually says</p>
        <p className="text-sm text-paper leading-snug">"{FULL_SENTENCE}"</p>
        <p className="text-[11px] text-paper/55 mt-1">
          Zero words in common with the question. Keyword search returns <span className="text-coral">0 matches</span>.
        </p>
      </div>
    </div>
  )
}

function DetailChunking() {
  const KEY = '45 days'
  const BAD = [
    'Refunds for Enterprise plans are prorated up t',
    'o 45 days from contract start, per MSA §3.2.',
  ]
  const GOOD = ['Refunds for Enterprise plans are prorated up to 45 days from contract start, per MSA §3.2.']
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-white/15 bg-ink-soft p-3">
        <p className="text-[10px] font-mono text-paper/45 uppercase tracking-widest mb-1">Source sentence</p>
        <p className="text-sm text-paper">
          "{FULL_SENTENCE.split(KEY).map((part, i, arr) => (
            <span key={i}>{part}{i < arr.length - 1 && <mark className="bg-sky/40 text-paper rounded px-1">{KEY}</mark>}</span>
          ))}"
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-lg border-2 border-coral bg-ink-soft p-3">
          <p className="text-[10px] font-mono text-coral uppercase tracking-widest mb-2">❌ Cut every 48 chars</p>
          {BAD.map((c, i) => (
            <div key={i} className={`rounded border-l-4 px-2 py-1 text-[11px] mb-1 ${i === 0 ? 'border-coral bg-coral/10' : 'border-coral bg-ink'}`}>
              <span className="font-mono text-paper">"{c}"</span>
              {i === 0 && <span className="ml-2 text-[9px] uppercase tracking-widest text-coral font-mono">key info severed</span>}
            </div>
          ))}
          <p className="mt-1 text-[11px] text-coral italic">"45 days" split across two chunks.</p>
        </div>
        <div className="rounded-lg border-2 border-mint bg-ink-soft p-3">
          <p className="text-[10px] font-mono text-mint uppercase tracking-widest mb-2">✓ Cut on sentence boundary</p>
          {GOOD.map((c, i) => (
            <div key={i} className="rounded border-l-4 border-sky bg-sky/10 px-2 py-1.5 text-[11px] mb-1">
              <span className="text-paper">"{c}"</span>
              <span className="ml-2 text-[9px] uppercase tracking-widest text-sky font-mono">complete idea ✓</span>
            </div>
          ))}
          <p className="mt-1 text-[11px] text-mint italic">Whole answer survives in one chunk.</p>
        </div>
      </div>
    </div>
  )
}

function DetailEmbedding({ tick }: { tick: number }) {
  return (
    <div>
      <p className="text-sm text-paper mb-3">
        Four phrases run through the SAME embedder. Each phrase becomes 10 numbers.{' '}
        <span className="text-mint">Green</span> = positive, <span className="text-coral">coral</span> = negative.
      </p>
      <div className="space-y-2">
        {CHUNKS.map((c, i) => {
          const isLive = i === tick % CHUNKS.length
          return (
            <div
              key={c.id}
              className={`grid grid-cols-[1fr_auto] gap-3 items-center rounded px-2 py-1 transition-all ${
                isLive ? 'bg-mint/10' : ''
              }`}
            >
              <p className={`text-sm leading-snug ${c.topic === 'refund' ? 'text-paper' : 'text-paper/70'}`}>"{c.text}"</p>
              <VectorBars vec={c.vec} />
            </div>
          )
        })}
      </div>
      <div className="mt-3 grid sm:grid-cols-2 gap-2">
        <div className="rounded-lg border border-mint/40 bg-mint/5 p-2.5">
          <p className="text-[10px] font-mono text-mint uppercase tracking-widest mb-1">Rows 1-3</p>
          <p className="text-xs text-paper">Different words. <span className="text-mint font-semibold">Same colour pattern.</span> Same meaning → same numbers.</p>
        </div>
        <div className="rounded-lg border border-coral/40 bg-coral/5 p-2.5">
          <p className="text-[10px] font-mono text-coral uppercase tracking-widest mb-1">Row 4</p>
          <p className="text-xs text-paper">Office topic. <span className="text-coral font-semibold">Pattern flips.</span> Far away in number-space.</p>
        </div>
      </div>
    </div>
  )
}

function DetailVectorSpace({ step }: { step: number }) {
  const showQuery = step >= 4

  return (
    <div className="grid md:grid-cols-[1fr_220px] gap-4">
      <div>
        <p className="text-[10px] font-mono text-mint uppercase tracking-widest mb-1">
          Vector space · 2D projection
        </p>
        <VectorScatter2D showQuery={showQuery} showLines={showQuery} />
      </div>

      <div className="space-y-2">
        {!showQuery && (
          <>
            <div className="rounded-lg border-2 border-mint bg-ink-soft p-3">
              <p className="text-[10px] font-mono text-mint uppercase tracking-widest mb-1">Refund cluster</p>
              <p className="text-xs text-paper">Three different phrasings, same meaning — they cluster in the same corner of space.</p>
            </div>
            <div className="rounded-lg border-2 border-coral/60 bg-ink-soft p-3">
              <p className="text-[10px] font-mono text-coral uppercase tracking-widest mb-1">Office topic</p>
              <p className="text-xs text-paper">Different topic, parked on the opposite side.</p>
            </div>
            <p className="text-[11px] text-paper/55 italic">
              Three different phrasings clustered together, one office topic parked far away. That's the whole lesson.
            </p>
          </>
        )}
        {showQuery && (
          <>
            <div className="rounded-lg border-2 border-sky bg-ink-soft p-3 anim-float-in">
              <p className="text-[10px] font-mono text-sky uppercase tracking-widest mb-1">Maya's question</p>
              <p className="text-xs text-paper">Embedded the SAME way. The sky-blue dot lands inside the refund cluster.</p>
              <p className="text-[10px] font-mono text-paper/55 mt-1">
                vec ≈ {`[${QUERY_VEC.slice(0, 3).map((v) => v.toFixed(2)).join(', ')}, …]`}
              </p>
            </div>
            <div className="rounded-lg border-2 border-mint bg-mint/10 p-3 anim-float-in">
              <p className="text-[10px] font-mono text-mint uppercase tracking-widest mb-1">Top-3 retrieved</p>
              <ol className="text-xs text-paper space-y-1 list-decimal list-inside">
                {[...CHUNKS]
                  .map((c) => ({ ...c, d: Math.hypot(c.pos.x - QUERY_POS.x, c.pos.y - QUERY_POS.y) }))
                  .sort((a, b) => a.d - b.d)
                  .slice(0, 3)
                  .map((r) => <li key={r.id}>"{r.text}"</li>)}
              </ol>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function DetailAnswer() {
  const refundChunks = CHUNKS.filter((c) => c.topic === 'refund')
  return (
    <div className="grid md:grid-cols-[1fr_auto_1fr] gap-3 items-stretch">
      <div className="rounded-lg border-2 border-mint bg-ink-soft p-3">
        <p className="text-[10px] font-mono text-mint uppercase tracking-widest mb-2">Top-3 chunks fed to LLM</p>
        <ol className="text-xs text-paper space-y-1.5">
          {refundChunks.map((c) => (
            <li key={c.id} className="rounded border-l-2 border-mint pl-2">"{c.text}"</li>
          ))}
        </ol>
      </div>
      <div className="flex items-center justify-center text-3xl text-mint">→</div>
      <div className="rounded-lg border-2 border-sky bg-ink-soft p-3">
        <p className="text-[10px] font-mono text-sky uppercase tracking-widest mb-2">🤖 LLM answers Maya</p>
        <p className="text-sm text-paper leading-snug">
          "You get your money back via a <span className="text-sky font-semibold">prorated refund up to 45 days</span> from contract start — see <span className="text-mint">MSA §3.2</span>. The first 30 days are a flat satisfaction guarantee."
        </p>
        <p className="text-[11px] text-paper/55 mt-2 italic">Same meaning matched. No word overlap needed.</p>
      </div>
    </div>
  )
}

/* ── small vector-bar visual reused above ─────────────────────────────── */

function VectorBars({ vec, size = 14 }: { vec: number[]; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {vec.map((v, i) => {
        const pos = v >= 0
        const intensity = Math.min(1, Math.abs(v))
        const bg = pos
          ? `rgba(52, 211, 153, ${0.15 + intensity * 0.85})`
          : `rgba(251, 113, 133, ${0.15 + intensity * 0.85})`
        return (
          <div
            key={i}
            className="rounded-sm"
            style={{ backgroundColor: bg, width: size, height: size * 1.8, border: '1px solid rgba(255,255,255,0.06)' }}
            title={v.toFixed(2)}
          />
        )
      })}
    </div>
  )
}

