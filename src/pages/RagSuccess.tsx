import { useState } from 'react'
import { CHAPTERS } from '../chapters'
import ChapterShell from '../components/ChapterShell'

const ch = CHAPTERS.find((c) => c.path === '/rag-success')!

const beats = [
  {
    caption: 'Northwind\'s HR team has a 280-page handbook. Every Monday, 60 employees ask the same questions.',
    llmNote: 'This is the textbook RAG use case: a fixed, well-structured corpus + repetitive queries + answers that need to be accurate and citable.',
    readingMs: 3200,
  },
  {
    caption: 'A junior employee asks: "Can I roll over unused vacation days?" The assistant retrieves the right paragraph.',
    llmNote: 'Good chunking means each section of the handbook is its own searchable unit, with metadata: department, last-updated, jurisdiction.',
    readingMs: 3200,
  },
  {
    caption: 'The answer quotes the policy in plain language and links back to page 47 of the handbook.',
    llmNote: 'Citations are not a nice-to-have. They are how employees trust the answer — and how HR catches the model when it drifts.',
    readingMs: 3400,
  },
  {
    caption: 'Three weeks later, HR updates the policy. They re-upload the handbook. The next answer reflects the change.',
    llmNote: 'Zero retraining. Zero downtime. One ingestion job. This is the single most under-sold benefit of RAG to executives.',
    readingMs: 3400,
  },
  {
    caption: 'Net result: 70% of HR tickets resolved without a human. The team focuses on the 30% that actually need judgement.',
    llmNote: 'These are realistic numbers for a well-built HR RAG bot. Customer support typically lands at 30–50% deflection — harder queries, fuzzier docs.',
    readingMs: 3400,
  },
]

const QUESTIONS = [
  {
    q: 'Can I roll over unused vacation days into next year?',
    chunk: 'Handbook §7.4 — Up to 5 days of unused vacation may be carried into the following year. Days beyond 5 are forfeited unless an exception is approved by HR.',
    src: 'Employee Handbook · page 47 · §7.4',
    a: '"You can roll over up to 5 unused vacation days. Anything beyond that needs HR approval per §7.4 of the handbook."',
  },
  {
    q: 'What\'s the parental leave policy for an adopting parent?',
    chunk: 'Handbook §9.1 — Adopting parents receive 12 weeks of paid parental leave, equivalent to birth parents, available within 12 months of the adoption finalisation.',
    src: 'Employee Handbook · page 62 · §9.1',
    a: '"Adopting parents get 12 weeks of paid leave, same as birth parents, taken within a year of the adoption finalising (§9.1)."',
  },
  {
    q: 'Is the EU office closed on US Thanksgiving?',
    chunk: 'Lyon office observes French public holidays only. Employees may take US holidays as personal days with manager approval.',
    src: 'Lyon Office Wiki · Holidays',
    a: '"The Lyon office observes French holidays only. Thanksgiving is a normal working day there — you can request it as a personal day."',
  },
]

const GOOD_INGREDIENTS = [
  { tone: 'mint', title: 'Clean source', text: 'One canonical handbook, one wiki. No duplicates, no stale Google Docs floating around.' },
  { tone: 'mint', title: 'Sensible chunks', text: 'Cut on section headers, not every 500 characters. Each chunk is one coherent idea.' },
  { tone: 'mint', title: 'Fresh index', text: 'Re-ingest on every handbook update. Nightly job catches anything else.' },
  { tone: 'mint', title: 'Citations on', text: 'Every answer links back to the source paragraph. No source → no answer.' },
  { tone: 'mint', title: 'Scoped retrieval', text: 'Filter by department, country, or date so an EU employee never gets the US answer.' },
]

export default function RagSuccess() {
  const [step, setStep] = useState(0)
  const qIdx = Math.min(step <= 1 ? 0 : step === 2 ? 1 : 2, QUESTIONS.length - 1)
  const showIngredients = step >= 3
  const currentQ = QUESTIONS[qIdx]

  return (
    <ChapterShell
      chapter={ch}
      beats={beats}
      onStep={setStep}
      watch={
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-mono uppercase tracking-widest text-mint">Use case · Northwind HR bot</span>
            <span className="ml-auto text-[11px] text-paper/40">Live chat preview</span>
          </div>

          {/* Chat thread */}
          <div className="rounded-xl border border-white/10 bg-ink p-4 space-y-3">
            {QUESTIONS.slice(0, qIdx + 1).map((q, i) => (
              <div key={i} className="space-y-2 anim-float-in">
                <div className="flex justify-end">
                  <div className="max-w-[90%] rounded-2xl rounded-tr-sm bg-white/10 px-3 py-2 text-sm">
                    {q.q}
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="max-w-[90%] space-y-2">
                    <div className="rounded-2xl rounded-tl-sm border-2 border-mint bg-ink-soft px-3 py-2 text-sm">
                      {q.a}
                    </div>
                    <div className="rounded-lg border border-mint/40 bg-mint/5 px-2.5 py-1.5 text-[11px] text-paper/85">
                      <span className="text-mint font-mono uppercase tracking-widest text-[9px]">Source · </span>
                      {q.src}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Retrieved chunk for current question */}
          <div className="mt-3 rounded-xl border-2 border-mint bg-ink-soft p-3">
            <p className="text-[10px] font-mono text-mint uppercase tracking-widest mb-1">Retrieved chunk used</p>
            <p className="text-sm text-paper leading-snug">"{currentQ.chunk}"</p>
          </div>

          {/* What made it work */}
          {showIngredients && (
            <div className="mt-4 anim-float-in">
              <p className="text-[10px] uppercase tracking-widest text-mint mb-2">Why this works (5 ingredients)</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {GOOD_INGREDIENTS.map((g) => (
                  <div key={g.title} className="rounded-lg border-2 border-mint bg-ink-soft p-2">
                    <p className="text-xs font-bold text-mint">✓ {g.title}</p>
                    <p className="text-[11px] text-paper mt-0.5 leading-snug">{g.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Outcome strip */}
          {step >= 4 && (
            <div className="mt-4 rounded-xl border-2 border-mint bg-mint/10 p-3 anim-float-in">
              <p className="text-[10px] font-mono text-mint uppercase tracking-widest mb-1">Six months later</p>
              <p className="text-sm text-paper">
                <span className="text-mint font-bold">70%</span> of HR tickets resolved by the assistant.
                <span className="text-mint font-bold ml-3">0</span> hallucinations in production audit.
                <span className="text-mint font-bold ml-3">2h</span> from handbook edit to live answer.
              </p>
            </div>
          )}
        </div>
      }
      outro={
        <p>
          The HR bot was easy because the data was already clean. The next chapter shows what happens when it isn't —
          and the four ways a RAG project quietly turns into six months of mystery bugs.
        </p>
      }
    />
  )
}
