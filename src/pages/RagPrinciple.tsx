import { useEffect, useState } from 'react'
import { CHAPTERS } from '../chapters'
import ChapterShell from '../components/ChapterShell'

const ch = CHAPTERS.find((c) => c.path === '/rag-principle')!

const beats = [
  {
    caption: 'Closed-book exam. The student has memorised facts from a year ago. Half of them are wrong now.',
    llmNote: 'This is a base LLM. Its weights are a snapshot of the internet from training time. It cannot see anything new.',
    readingMs: 3000,
  },
  {
    caption: 'Open-book exam. Before answering, the student is allowed to pull the three most relevant pages from a folder.',
    llmNote: 'RAG = Retrieval-Augmented Generation. A retrieval step fetches relevant chunks from your data and pastes them into the prompt before the model answers.',
    readingMs: 3400,
  },
  {
    caption: 'Watch the three retrieved chunks slide into the model. Same model, richer prompt.',
    llmNote: 'The model itself does not learn your data — it reads a few pages of it on every question and then forgets. That is the whole trick.',
    readingMs: 3400,
  },
  {
    caption: 'The model writes its answer using those pages — and can quote them.',
    llmNote: 'Citations are non-negotiable in production. They are how your users (and you) catch the model if it strays from the retrieved text.',
    readingMs: 3400,
  },
  {
    caption: 'Update the folder, the next answer updates. No retraining. No fine-tuning. No GPU bill.',
    llmNote: 'This is RAG\'s superpower: fresh knowledge is one re-index away. Most enterprise AI features start here for this reason.',
    readingMs: 3400,
  },
]

const QUESTION = 'What is our enterprise refund window?'

interface Chunk {
  score: number
  text: string
}
const CHUNKS: Chunk[] = [
  { score: 0.91, text: 'Refunds for Enterprise plans are prorated up to 45 days from contract start, per §3.2 of the MSA.' },
  { score: 0.87, text: 'Annual contracts include a 30-day satisfaction guarantee; refunds after that are subject to §3.2.' },
  { score: 0.62, text: 'Self-serve refund requests under $500 are handled by Support, not Finance.' },
]
const ANSWER_RAG = '"Enterprise plans have a 45-day prorated refund window per §3.2 of your MSA. The first 30 days are a flat satisfaction guarantee."'
const ANSWER_BAD = '"Most companies offer a 30-day window with a prorated refund."'

export default function RagPrinciple() {
  const [step, setStep] = useState(0)
  const [flyTick, setFlyTick] = useState(0)

  // Re-trigger the "fly" animation every time we enter stage 2 so re-watches show motion
  useEffect(() => {
    if (step === 2) {
      setFlyTick((t) => t + 1)
    }
  }, [step])

  const isClosed   = step === 0
  const isFlying   = step === 2
  const isAnswered = step >= 3
  const isFresh    = step >= 4

  return (
    <ChapterShell
      chapter={ch}
      beats={beats}
      onStep={setStep}
      watch={
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-mono uppercase tracking-widest text-sky">Walkthrough</span>
            <span className="ml-auto text-[11px] text-paper/40">
              {isClosed ? 'Closed-book' : 'Open-book'} mode
            </span>
          </div>

          {/* Question pinned at top */}
          <div className="rounded-xl border border-white/10 bg-ink p-3 mb-4">
            <p className="text-[10px] uppercase tracking-widest text-paper/45 mb-1">Maya asks</p>
            <p className="font-semibold text-paper">"{QUESTION}"</p>
          </div>

          {/* The big stage: library --(top-3)--> LLM --(answer)--> below */}
          <div className="relative grid grid-cols-[1fr_auto_1fr] gap-3 items-stretch" style={{ minHeight: 260 }}>

            {/* LEFT: Library (only visible from step 1 onward) */}
            <div className={`rounded-xl border-2 ${isClosed ? 'border-white/15 opacity-30' : 'border-mint'} bg-ink-soft p-3 flex flex-col`}>
              <p className="text-[10px] font-mono uppercase tracking-widest text-mint mb-2">📚 Northwind library</p>
              {isClosed ? (
                <p className="text-xs text-paper/55 italic mt-2">No retrieval. The model is on its own.</p>
              ) : (
                <div className="space-y-2 flex-1">
                  {CHUNKS.map((c, i) => {
                    const delay = `${i * 180}ms`
                    return (
                      <div
                        key={`${flyTick}-${i}`}
                        className={`rounded-lg border-2 border-mint bg-ink p-2 transition-all anim-float-in ${
                          isFlying ? 'translate-x-3 scale-[1.02]' : ''
                        }`}
                        style={{ animationDelay: delay }}
                      >
                        <p className="text-[10px] font-mono text-mint">match {c.score.toFixed(2)}</p>
                        <p className="text-[11px] text-paper leading-snug mt-0.5">"{c.text}"</p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* MIDDLE: Animated flow arrow */}
            <div className="flex flex-col items-center justify-center gap-1 px-1">
              {isClosed ? (
                <span className="text-3xl text-coral">∅</span>
              ) : (
                <svg width="40" height="200" className="overflow-visible">
                  <defs>
                    <marker id="ragArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#34d399" />
                    </marker>
                  </defs>
                  <line
                    x1="0" y1="100" x2="38" y2="100"
                    stroke="#34d399"
                    strokeWidth="2.5"
                    markerEnd="url(#ragArr)"
                    className={isFlying ? 'anim-dash-flow' : ''}
                  />
                  <text x="19" y="92" textAnchor="middle" fontSize="9" fill="#34d399" className="font-mono">top-3</text>
                </svg>
              )}
            </div>

            {/* RIGHT: Model + answer */}
            <div className="flex flex-col gap-3">
              {/* Model */}
              <div className={`rounded-xl border-2 ${isAnswered ? 'border-sky' : 'border-paper/40'} bg-ink-soft p-3 flex items-center gap-3`}>
                <span className="text-3xl">🤖</span>
                <div className="min-w-0">
                  <p className={`text-[10px] font-mono uppercase tracking-widest ${isClosed ? 'text-paper/60' : 'text-sky'}`}>LLM</p>
                  <p className="text-xs text-paper/85 leading-snug">
                    {isClosed
                      ? 'No retrieved context. Answers only from frozen training data.'
                      : 'Reads the question PLUS the retrieved chunks.'}
                  </p>
                </div>
              </div>

              {/* Answer card */}
              <div
                className={`rounded-xl border-2 p-3 ${
                  isClosed ? 'border-coral' : isAnswered ? 'border-sky' : 'border-white/15'
                }`}
              >
                <p className={`text-[10px] font-mono uppercase tracking-widest mb-1 ${
                  isClosed ? 'text-coral' : 'text-sky'
                }`}>
                  {isClosed ? 'Closed-book answer' : 'Open-book answer'}
                </p>
                {isClosed && (
                  <p className="text-sm text-paper leading-snug">
                    {ANSWER_BAD} <span className="text-coral">— invented.</span>
                  </p>
                )}
                {!isClosed && isAnswered && (
                  <p className="text-sm text-paper leading-snug anim-float-in">{ANSWER_RAG}</p>
                )}
                {!isClosed && !isAnswered && (
                  <p className="text-xs text-paper/50 italic">…waiting for the chunks to arrive…</p>
                )}
                {isAnswered && (
                  <p className="text-[10px] text-mint mt-2 anim-float-in">
                    cites <span className="font-mono">§3.2</span> — straight from a retrieved chunk
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Bottom "fresh data" demo for the last beat */}
          {isFresh && (
            <div className="mt-4 rounded-xl border-2 border-sky bg-sky/5 p-3 anim-float-in">
              <p className="text-[10px] font-mono uppercase tracking-widest text-sky mb-1">After re-indexing the handbook</p>
              <p className="text-sm text-paper">
                The model itself never changed. The library did. Next answer reflects the new policy automatically — no
                training, no downtime.
              </p>
            </div>
          )}

          {/* Caption strip */}
          <div className="mt-4 rounded-xl border border-white/10 bg-ink p-3 text-center">
            <p className="text-sm text-paper/85">
              {step === 0 && <>Without retrieval, the model has no choice but to guess.</>}
              {step === 1 && <>We slot a retrieval step in front of the model. Nothing about the model changes.</>}
              {step === 2 && <>The system finds the three closest chunks and slides them into the prompt.</>}
              {step === 3 && <>The model writes its answer using the chunks as ground truth. It can even cite them.</>}
              {step >= 4 && <>Update the library, and the next answer updates with it. That is RAG.</>}
            </p>
          </div>
        </div>
      }
      outro={
        <p>
          One key idea: the model is not changed. It is just <em>prompted with the right pages open</em>.
          That is why RAG is fast to ship, easy to update, and the default choice for any "Q&A over our docs" project.
        </p>
      }
    />
  )
}
