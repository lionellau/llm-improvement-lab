import { useEffect, useRef, useState, type ReactNode } from 'react'
import { CHAPTERS } from '../chapters'
import ChapterShell from '../components/ChapterShell'

const ch = CHAPTERS.find((c) => c.path === '/rag-failures')!

const beats = [
  {
    caption: 'Same pipeline as the success story. Six months later it is quietly failing in four very specific ways.',
    llmNote: 'None of these are "the AI is bad". Every one of them is a pipeline issue with a name and a fix.',
    readingMs: 3000,
  },
  {
    caption: 'Failure 1 · Chunk Soup. The key sentence gets sliced in half. Retrieval grabs the half without the answer.',
    llmNote: 'The single biggest quality lever in a RAG system. Most teams under-invest in chunking strategy for months.',
    readingMs: 3600,
  },
  {
    caption: 'Failure 2 · Stale Index. The source moved on. The index didn\'t.',
    llmNote: 'A staleness alarm is mandatory. "Last refreshed: 9 days ago" should be visible on every answer.',
    readingMs: 3400,
  },
  {
    caption: 'Failure 3 · Wrong Citation. The model writes a fluent answer and slaps a real-looking source on it — that does not say what the bot claims.',
    llmNote: 'The most dangerous failure. Citation makes the answer look trustworthy. Always verify quotes against retrieved text.',
    readingMs: 3600,
  },
  {
    caption: 'Failure 4 · Wrong-Scope. A French employee gets the American answer because nothing filtered by jurisdiction.',
    llmNote: 'Embeddings encode meaning, not policy. Tag every chunk with department, country, validity dates — filter before vector search.',
    readingMs: 3600,
  },
  {
    caption: 'Diagnose by smell, find the failure mode, apply the fix.',
    llmNote: 'You can use the smell column as a triage checklist. If an answer is wrong, ask which of these four it smells like.',
    readingMs: 3200,
  },
]

export default function RagFailures() {
  const [step, setStep] = useState(0)
  const activeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(min-width: 1024px)').matches) {
      activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [step])

  return (
    <ChapterShell
      chapter={ch}
      beats={beats}
      onStep={setStep}
      watch={
        <div className="space-y-5">
          <FailureCard idx={0} step={step} title="Overview · the four classic smells">
            <Overview />
          </FailureCard>

          {step >= 1 && (
            <FailureCard idx={1} step={step} title="🥣 Failure 1 · Chunk Soup" activeRef={step === 1 ? activeRef : undefined}>
              <ChunkSoup />
              <FixCard
                root="Chunks split by fixed character count, ignoring sentence and section boundaries."
                fix="Chunk on structure (headings, paragraphs, sentences). Overlap chunks by 10–20% so ideas aren't severed."
              />
            </FailureCard>
          )}

          {step >= 2 && (
            <FailureCard idx={2} step={step} title="🥫 Failure 2 · Stale Index" activeRef={step === 2 ? activeRef : undefined}>
              <StaleIndex />
              <FixCard
                root="Ingestion ran on a schedule, not on source-of-truth change. Nobody got paged when the handbook moved."
                fix="Auto-ingest on source-change events. Show 'last updated' on every answer. Weekly drift audit."
              />
            </FailureCard>
          )}

          {step >= 3 && (
            <FailureCard idx={3} step={step} title="🎯 Failure 3 · Wrong Citation" activeRef={step === 3 ? activeRef : undefined}>
              <WrongCitation />
              <FixCard
                root="Retrieval pulled the wrong chunk; the model wrote a plausible answer and reused the chunk's citation label."
                fix="Force quoted spans: the model can only output text that literally appears in retrieved chunks. Verify citations server-side."
              />
            </FailureCard>
          )}

          {step >= 4 && (
            <FailureCard idx={4} step={step} title="🌐 Failure 4 · Wrong-Scope" activeRef={step === 4 ? activeRef : undefined}>
              <WrongScope />
              <FixCard
                root="No filters applied before the vector search. Embeddings can't separate jurisdictions on their own."
                fix="Tag every chunk with department, country, validity dates. Filter before the vector search runs."
              />
            </FailureCard>
          )}

          {step >= 5 && (
            <FailureCard idx={5} step={step} title="Triage card · keep this nearby" activeRef={step === 5 ? activeRef : undefined}>
              <DiagnosticTable />
            </FailureCard>
          )}
        </div>
      }
      outro={
        <p>
          RAG fixes the model's knowledge problem. It does <em>nothing</em> for the model's behaviour problem —
          voice, format, refusal style. For that, you need to change the model itself. That's fine-tuning, and it
          is next.
        </p>
      }
    />
  )
}

/* ── append wrapper ────────────────────────────────────────────────────── */

function FailureCard({
  idx,
  step,
  title,
  children,
  activeRef,
}: {
  idx: number
  step: number
  title: string
  children: ReactNode
  activeRef?: React.RefObject<HTMLDivElement | null>
}) {
  const active = step === idx
  return (
    <div
      ref={activeRef}
      className={[
        'rounded-xl border-2 bg-ink-soft p-4 transition-all',
        active ? 'border-coral ring-2 ring-coral/30 ring-offset-2 ring-offset-ink anim-float-in' : 'border-white/10 opacity-90',
      ].join(' ')}
    >
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-ink border border-coral/40 text-[10px] font-mono text-coral">
          {idx === 0 ? '·' : idx}
        </span>
        <p className={`text-sm font-semibold ${active ? 'text-coral' : 'text-paper/75'}`}>{title}</p>
        {active && <span className="ml-auto text-[10px] font-mono uppercase tracking-widest text-coral">live</span>}
        {!active && idx !== 0 && <span className="ml-auto text-[10px] font-mono uppercase tracking-widest text-paper/35">noted ✓</span>}
      </div>
      {children}
    </div>
  )
}

/* ── overview ──────────────────────────────────────────────────────────── */

const FAILURES = [
  { emoji: '🥣', name: 'Chunk Soup',     smell: 'Correct but missing the important sentence.' },
  { emoji: '🥫', name: 'Stale Index',    smell: 'Quotes the OLD policy.' },
  { emoji: '🎯', name: 'Wrong Citation', smell: 'Source link real, claim invented.' },
  { emoji: '🌐', name: 'Wrong-Scope',    smell: 'EU employee got the US answer.' },
]

function Overview() {
  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-3">
        {FAILURES.map((f) => (
          <div key={f.name} className="rounded-xl border border-coral/40 bg-ink p-3 flex items-center gap-3">
            <span className="text-3xl shrink-0">{f.emoji}</span>
            <div>
              <p className="font-bold text-coral">{f.name}</p>
              <p className="text-xs text-paper/85 italic">"{f.smell}"</p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-paper/70 mt-3 italic">Each one plays out below — same handbook, same model, same pipeline, four different bugs.</p>
    </div>
  )
}

/* ── Failure 1 · chunk soup ────────────────────────────────────────────── */

function ChunkSoup() {
  const SOURCE = 'Enterprise refunds are prorated, subject to the conditions set forth in MSA §3.2, up to 45 days from contract start.'
  const BAD_A = 'Enterprise refunds are prorated, subject to the conditions set forth in'
  const BAD_B = 'MSA §3.2, up to 45 days from contract start.'

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-white/15 bg-ink p-3">
        <p className="text-[10px] font-mono text-paper/45 uppercase tracking-widest mb-1">Source paragraph</p>
        <p className="text-sm text-paper">"{SOURCE}"</p>
      </div>

      <div className="rounded-lg border border-coral/40 bg-ink p-3">
        <p className="text-[10px] font-mono text-coral uppercase tracking-widest mb-2">Chunker cuts here ✂️</p>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="rounded border-2 border-coral bg-ink-soft p-2.5">
            <p className="text-[10px] font-mono text-coral mb-1">Chunk A</p>
            <p className="text-sm text-paper">"{BAD_A}…"</p>
            <p className="text-[11px] text-coral italic mt-1">→ no actual conditions stated</p>
          </div>
          <div className="rounded border-2 border-coral bg-ink-soft p-2.5">
            <p className="text-[10px] font-mono text-coral mb-1">Chunk B</p>
            <p className="text-sm text-paper">"…{BAD_B}"</p>
            <p className="text-[11px] text-coral italic mt-1">→ no subject — what does this refer to?</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_auto_1fr] gap-3 items-stretch">
        <div className="rounded-lg border border-coral/40 bg-ink p-3">
          <p className="text-[10px] font-mono text-coral uppercase tracking-widest mb-1">Retrieved (top-1)</p>
          <p className="text-sm text-paper">"{BAD_A}…"</p>
        </div>
        <div className="flex items-center justify-center text-2xl text-coral">→</div>
        <div className="rounded-lg border-2 border-coral bg-coral/5 p-3">
          <p className="text-[10px] font-mono text-coral uppercase tracking-widest mb-1">Bot answers</p>
          <p className="text-sm text-paper">
            "Enterprise refunds are prorated, <span className="text-coral">subject to certain conditions</span>."
          </p>
          <p className="text-[11px] text-coral italic mt-1">Missing the 45-day clause entirely.</p>
        </div>
      </div>
    </div>
  )
}

/* ── Failure 2 · stale index ───────────────────────────────────────────── */

function StaleIndex() {
  const events = [
    { date: 'Mar 1',  label: 'Handbook published',       value: 'Bereavement: 3 days',     ok: true,  side: 'src' as const },
    { date: 'Sep 15', label: 'HR updates Confluence',    value: 'Bereavement: 7 days',     ok: true,  side: 'src' as const },
    { date: 'Sep 15', label: 'Index re-ingest expected', value: 'No source change detected', ok: false, side: 'idx' as const },
    { date: 'Today',  label: 'Bot still serves stale',   value: 'Bereavement: 3 days',     ok: false, side: 'idx' as const },
  ]
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-white/15 bg-ink p-4 overflow-x-auto">
        <div className="grid grid-cols-[80px_1fr_1fr] gap-2 text-xs" style={{ minWidth: 500 }}>
          <div className="text-[10px] font-mono uppercase tracking-widest text-paper/45">Date</div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-mint">📄 Source of truth</div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-coral">🗂️ Vector index</div>
          {events.map((e, i) => (
            <div key={i} className="contents">
              <div className="text-paper/65 font-mono py-2 border-t border-white/5">{e.date}</div>
              <div className={`py-2 border-t border-white/5 ${e.side === 'src' ? 'opacity-100' : 'opacity-30'}`}>
                {e.side === 'src' && (
                  <div className={`rounded border-l-4 pl-2 ${e.ok ? 'border-mint' : 'border-coral'}`}>
                    <p className="font-semibold text-paper">{e.label}</p>
                    <p className="text-[11px] text-paper/65">{e.value}</p>
                  </div>
                )}
              </div>
              <div className={`py-2 border-t border-white/5 ${e.side === 'idx' ? 'opacity-100' : 'opacity-30'}`}>
                {e.side === 'idx' && (
                  <div className={`rounded border-l-4 pl-2 ${e.ok ? 'border-mint' : 'border-coral'}`}>
                    <p className="font-semibold text-paper">{e.label}</p>
                    <p className={`text-[11px] ${e.ok ? 'text-paper/65' : 'text-coral'}`}>{e.value}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_auto_1fr] gap-3 items-stretch">
        <div className="rounded-lg border border-mint/40 bg-ink p-3">
          <p className="text-[10px] font-mono text-mint uppercase tracking-widest mb-1">Real policy today</p>
          <p className="text-sm text-paper">7 days bereavement leave</p>
        </div>
        <div className="flex items-center justify-center text-2xl text-coral">≠</div>
        <div className="rounded-lg border-2 border-coral bg-coral/5 p-3">
          <p className="text-[10px] font-mono text-coral uppercase tracking-widest mb-1">Bot still answers</p>
          <p className="text-sm text-paper">"You get <span className="text-coral">3 days</span> bereavement leave per the handbook."</p>
        </div>
      </div>
    </div>
  )
}

/* ── Failure 3 · wrong citation ────────────────────────────────────────── */

function WrongCitation() {
  return (
    <div className="space-y-3">
      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-lg border border-coral/40 bg-ink p-3">
          <p className="text-[10px] font-mono text-coral uppercase tracking-widest mb-1">Bot says</p>
          <p className="text-sm text-paper leading-snug">
            "Per <span className="text-sky font-mono">§3.2</span>, refunds are prorated to <span className="text-coral">30 days</span> from purchase."
          </p>
          <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-sky/15 border border-sky text-[11px]">
            <span className="text-sky font-mono">SOURCE</span>
            <span className="text-paper">Handbook §3.2</span>
          </div>
        </div>
        <div className="rounded-lg border border-mint/40 bg-ink p-3">
          <p className="text-[10px] font-mono text-mint uppercase tracking-widest mb-1">§3.2 actually says</p>
          <p className="text-sm text-paper leading-snug">
            "§3.2 — <span className="text-mint font-semibold">Data Retention.</span> Northwind retains personal data for <span className="text-mint">90 days</span> after account closure unless legally required to retain longer."
          </p>
          <p className="text-[11px] text-mint italic mt-2">§3.2 has nothing to do with refunds.</p>
        </div>
      </div>

      <div className="rounded-lg border-2 border-coral bg-coral/10 p-3 flex items-center gap-3">
        <span className="text-3xl shrink-0">⚠️</span>
        <div>
          <p className="font-bold text-coral text-sm">Same section number. Totally different content.</p>
          <p className="text-xs text-paper">A reviewer who only checks "did it cite something real?" approves this. A reviewer who opens §3.2 catches it. Most reviewers stop at "looks cited".</p>
        </div>
      </div>
    </div>
  )
}

/* ── Failure 4 · wrong-scope ───────────────────────────────────────────── */

function WrongScope() {
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-white/15 bg-ink p-3">
        <p className="text-[10px] font-mono text-paper/45 uppercase tracking-widest mb-1">Asker</p>
        <p className="text-sm text-paper">🇪🇺 Camille (Lyon office) — "What is our overtime policy?"</p>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-lg border border-coral/40 bg-ink p-3">
          <p className="text-[10px] font-mono text-coral uppercase tracking-widest mb-2">❌ Without metadata filter</p>
          <div className="rounded border border-coral/40 bg-ink-soft p-2 mb-2">
            <div className="flex items-center gap-2 text-xs mb-1">
              <span className="text-coral font-mono">top-1</span>
              <span className="text-paper">🇺🇸 US handbook</span>
            </div>
            <p className="text-[11px] text-paper">"Overtime in California is time-and-a-half above 40h/week."</p>
          </div>
          <p className="text-[11px] text-coral italic">Bot replies with US law to an EU employee.</p>
        </div>
        <div className="rounded-lg border border-mint/40 bg-ink p-3">
          <p className="text-[10px] font-mono text-mint uppercase tracking-widest mb-2">✓ Filter country = EU first</p>
          <div className="rounded border border-mint/40 bg-ink-soft p-2 mb-2">
            <div className="flex items-center gap-2 text-xs mb-1">
              <span className="text-mint font-mono">top-1</span>
              <span className="text-paper">🇪🇺 EU policy</span>
            </div>
            <p className="text-[11px] text-paper">"EU working-time directive limits to 48h/week including overtime."</p>
          </div>
          <p className="text-[11px] text-mint italic">Filter narrows the vector search to EU chunks first.</p>
        </div>
      </div>

      <p className="text-[11px] text-paper/55 italic">
        Embeddings encode meaning, not jurisdiction. Tag chunks. Filter before search.
      </p>
    </div>
  )
}

/* ── triage ────────────────────────────────────────────────────────────── */

const ROWS = [
  { emoji: '🥣', name: 'Chunk Soup',     smell: 'Correct but missing a clause', cause: 'Fixed-char cuts',     fix: 'Cut on structure + overlap' },
  { emoji: '🥫', name: 'Stale Index',    smell: 'Quotes old policy',            cause: 'Source change ignored', fix: 'Ingest on source events' },
  { emoji: '🎯', name: 'Wrong Citation', smell: 'Real source, wrong claim',     cause: 'Bad chunk, glued cite', fix: 'Quote-only outputs + verify' },
  { emoji: '🌐', name: 'Wrong-Scope',    smell: 'Wrong jurisdiction',           cause: 'No metadata filter',    fix: 'Tag + filter before search' },
]

function DiagnosticTable() {
  return (
    <div>
      <div className="overflow-x-auto -mx-2 px-2">
        <table className="w-full text-xs border-separate border-spacing-y-1" style={{ minWidth: 580 }}>
          <thead>
            <tr className="text-[10px] font-mono uppercase tracking-widest text-paper/50">
              <th className="text-left px-2">Failure</th>
              <th className="text-left px-2">Smell</th>
              <th className="text-left px-2">Root cause</th>
              <th className="text-left px-2 text-mint">Fix</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.name} className="bg-ink">
                <td className="px-2 py-2 rounded-l-md">
                  <span className="text-base mr-1.5">{r.emoji}</span>
                  <span className="font-bold text-coral">{r.name}</span>
                </td>
                <td className="px-2 py-2 text-paper/85 italic">"{r.smell}"</td>
                <td className="px-2 py-2 text-paper/85">{r.cause}</td>
                <td className="px-2 py-2 rounded-r-md text-mint">{r.fix}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-paper/55 italic mt-3">
        When a RAG answer is wrong, ask which of these four it smells like first. Most "AI is bad" reports are one of them.
      </p>
    </div>
  )
}

/* ── shared fix card ───────────────────────────────────────────────────── */

function FixCard({ root, fix }: { root: string; fix: string }) {
  return (
    <div className="mt-3 grid sm:grid-cols-2 gap-3">
      <div className="rounded-lg border border-coral/40 bg-coral/5 p-3">
        <p className="text-[10px] font-mono text-coral uppercase tracking-widest mb-1">Root cause</p>
        <p className="text-sm text-paper">{root}</p>
      </div>
      <div className="rounded-lg border border-mint/40 bg-mint/5 p-3">
        <p className="text-[10px] font-mono text-mint uppercase tracking-widest mb-1">Fix</p>
        <p className="text-sm text-paper">{fix}</p>
      </div>
    </div>
  )
}
