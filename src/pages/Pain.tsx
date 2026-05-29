import { useState } from 'react'
import { CHAPTERS } from '../chapters'
import ChapterShell from '../components/ChapterShell'

const ch = CHAPTERS.find((c) => c.path === '/pain')!

/* ──────────────────────────────────────────────────────────────────────────
 *  Calm palette pass. The previous version painted everything in coral
 *  borders, coral rings, coral backgrounds — which felt like a fire alarm.
 *
 *  This version keeps the chapter's symbolic accent (coral in the header
 *  chip and nav, because color-per-meaning is a global rule), but the
 *  scenario cards and the bot replies use neutral paper/ink tones. The
 *  problem-ness is conveyed by the WORDS and a single small "invented" tag,
 *  not by aggressive colour fields.
 *  ────────────────────────────────────────────────────────────────────── */

interface Scenario {
  question: string
  bad: string
  invented: string  // the bit that should be visually marked as the lie
  why: string
}

const SCENARIOS: Scenario[] = [
  {
    question: 'What is our refund policy for enterprise customers on annual plans?',
    bad: '"Most companies offer a 30-day window with a prorated refund."',
    invented: 'sounds confident, completely invented',
    why: 'The model has never read your handbook. It is averaging the internet.',
  },
  {
    question: 'What were our Q3 results?',
    bad: '"Q3 revenue grew 14% year over year, driven by the EMEA segment."',
    invented: 'fluent — and fictional',
    why: 'The model\'s training data was frozen 18 months ago. It can\'t see last quarter.',
  },
  {
    question: 'Reply to this customer in our brand voice: "We\'re really sorry for the wait."',
    bad: '"Dear Valued Customer, We sincerely regret the inconvenience…"',
    invented: 'corporate sludge, not your voice',
    why: 'The model picks the average tone of the internet. Your brand voice is not the average.',
  },
  {
    question: 'Did acquiring TerraMesh in 2025 affect headcount?',
    bad: '"I cannot find a public announcement of an acquisition called TerraMesh."',
    invented: 'it happened — privately',
    why: 'Even when the model is honest, it has no way to learn about events behind your firewall.',
  },
]

const beats = [
  {
    caption: 'Maya types a question her CEO just asked. The model answers in a second. The answer is wrong.',
    llmNote: 'A base LLM is an autocomplete trained on a giant slice of the public internet, frozen at one point in time. It has never seen your data.',
    readingMs: 3200,
  },
  {
    caption: 'It is not wrong because it is broken. It is wrong because it does not know — and does not know that it does not know.',
    llmNote: 'There is no "I have not been told this" wire inside the model. The same pathway that produces a correct sentence also produces a fluent fabrication.',
    readingMs: 3600,
  },
  {
    caption: 'Different question, same kind of miss. Each has a different cause.',
    llmNote: 'Each scenario isolates one of the four classic gaps: no company data, stale knowledge, wrong voice, private events.',
    readingMs: 3000,
  },
  {
    caption: 'And again. Each gap has a name — and a known fix in the rest of this tour.',
    llmNote: 'This is the slide that justifies a budget. Each gap has a name and a known countermeasure: RAG, fine-tuning, distillation, or all three.',
    readingMs: 3200,
  },
  {
    caption: 'Four gaps. Three improvement techniques ahead. The next chapter draws the map.',
    llmNote: 'Spoiler — most problems are RAG problems. Most projects that fail were trying to fine-tune their way out of a retrieval problem.',
    readingMs: 3000,
  },
]

export default function Pain() {
  const [step, setStep] = useState(0)
  const cap = Math.min(step, SCENARIOS.length - 1)

  return (
    <ChapterShell
      chapter={ch}
      beats={beats}
      onStep={setStep}
      watch={
        <div>
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-xs font-mono uppercase tracking-widest text-paper/55">Conversation log · Northwind Co.</span>
            <span className="ml-auto text-[11px] text-paper/40">{cap + 1} of {SCENARIOS.length}</span>
          </div>

          <div className="space-y-3">
            {SCENARIOS.map((s, i) => {
              const isActive = i === cap
              const isPast = i < cap
              return (
                <div
                  key={i}
                  className={[
                    'rounded-xl border bg-ink-soft transition-all p-4',
                    isActive ? 'border-paper/40 ring-2 ring-paper/20 ring-offset-2 ring-offset-ink anim-float-in' :
                    isPast   ? 'border-white/10 opacity-70' :
                               'border-white/10 opacity-30',
                  ].join(' ')}
                >
                  <p className="text-[10px] uppercase tracking-widest text-paper/45 mb-1">Maya asks</p>
                  <p className={`font-semibold mb-3 ${isActive ? 'text-paper' : 'text-paper/80'}`}>"{s.question}"</p>

                  {(isActive || isPast) && (
                    <>
                      <div className="rounded-lg border border-white/15 bg-ink p-3 mb-2 anim-float-in">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] uppercase tracking-widest text-paper/55">Base LLM replies</span>
                          <span className="ml-auto inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-widest border border-coral/40 text-coral/90 bg-coral/5">
                            ⚠ {s.invented}
                          </span>
                        </div>
                        <p className="text-sm text-paper leading-snug">{s.bad}</p>
                      </div>
                      <p className="text-xs text-paper/75 leading-snug">
                        <span className="text-paper/55 font-semibold uppercase tracking-widest text-[10px] mr-1">Why this happens ·</span>
                        {s.why}
                      </p>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      }
      outro={
        <p>
          Every story in this lab is one of these four gaps finally getting a real fix. Hold them in your head — they
          will come back labelled <em>RAG</em>, <em>fine-tuning</em>, and <em>distillation</em>.
        </p>
      }
    />
  )
}
