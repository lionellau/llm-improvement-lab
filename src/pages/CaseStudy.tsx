import { useEffect, useRef, useState } from 'react'
import { CHAPTERS } from '../chapters'
import ChapterShell from '../components/ChapterShell'

const ch = CHAPTERS.find((c) => c.path === '/case-study')!

interface Quarter {
  n: string
  title: string
  goal: string
  technique: string
  tone: 'coral' | 'sky' | 'sun' | 'rose'
  metric: { label: string; value: string }[]
  hardThing: string
  next: string
}

const QUARTERS: Quarter[] = [
  {
    n: 'Q1',
    title: 'The wake-up',
    goal: 'Ship anything that proves AI is useful here.',
    technique: 'Prompt + base model',
    tone: 'coral',
    metric: [
      { label: 'Pilot users', value: '12' },
      { label: 'Bot accuracy', value: '38%' },
      { label: 'Real value', value: 'Low' },
    ],
    hardThing: 'The pilot answers half the questions confidently, half the time wrong. Trust evaporates.',
    next: 'Try RAG — give the model Northwind\'s documents.',
  },
  {
    n: 'Q2',
    title: 'RAG ships',
    goal: 'Make the assistant correct about Northwind facts.',
    technique: 'RAG over handbook + product wiki',
    tone: 'sky',
    metric: [
      { label: 'Pilot users', value: '300' },
      { label: 'Bot accuracy', value: '74%' },
      { label: 'Real value', value: 'Visible' },
    ],
    hardThing: 'Answers are right but read like a corporate manual. CS team complains it doesn\'t sound like Northwind.',
    next: 'Add a small LoRA for brand voice and reply structure.',
  },
  {
    n: 'Q3',
    title: 'LoRA for voice',
    goal: 'Make the assistant sound like Northwind, not like the internet.',
    technique: 'LoRA fine-tune on 4 000 curated reply pairs',
    tone: 'sun',
    metric: [
      { label: 'Pilot users', value: '1 800' },
      { label: 'Bot accuracy', value: '81%' },
      { label: 'CSAT delta', value: '+11 pts' },
    ],
    hardThing: 'Quality is great. But at 1.4s/reply and $42k/month, scaling to all 4 000 employees blows the budget.',
    next: 'Distill the stack into a small student model.',
  },
  {
    n: 'Q4',
    title: 'Distill and scale',
    goal: 'Keep the quality. Cut the bill. Bring it on-prem.',
    technique: 'Distilled 7B student of the Q3 stack',
    tone: 'rose',
    metric: [
      { label: 'Users', value: '4 000 (all staff)' },
      { label: 'Latency', value: '130 ms' },
      { label: 'Monthly cost', value: '$3k' },
    ],
    hardThing: 'Student lags teacher on the trickiest 7% of tickets. Auto-escalation to the teacher catches those.',
    next: 'Roll out beyond support. Repeat the pattern per department.',
  },
]

const beats = [
  {
    caption: 'Q1: prompt-only pilot. Looks magical in the demo. Embarrassing in production. Sound familiar?',
    llmNote: 'Almost every internal AI project starts here. The lesson: a demo is not a deployment. Real questions are messier than the ones picked for the slide.',
    readingMs: 3200,
  },
  {
    caption: 'Q2: bolt on RAG. Suddenly the assistant cites real Northwind documents and stops making things up.',
    llmNote: 'This is usually the biggest single quality jump. Accuracy roughly doubles. Everything downstream gets easier.',
    readingMs: 3400,
  },
  {
    caption: 'Q3: small LoRA fine-tune for tone. Same brain, new sticky notes. Sounds like Northwind now.',
    llmNote: 'Notice the order. Don\'t fine-tune until you know what data the model has access to — otherwise you\'re fine-tuning on the wrong context.',
    readingMs: 3400,
  },
  {
    caption: 'Q4: distill the whole stack into a small student. Same quality, 14× cheaper, lives on-prem.',
    llmNote: 'Distillation is the LAST step on this road, not the first. You can only distill something good if you already have something good.',
    readingMs: 3400,
  },
  {
    caption: 'Four quarters. Three techniques. One platform Northwind actually owns.',
    llmNote: 'Prompt → RAG → LoRA → Distill. Roughly the canonical enterprise path. Most successful internal assistants land here.',
    readingMs: 3400,
  },
]

const TONE_TEXT = (t: Quarter['tone']) =>
  t === 'coral' ? 'text-coral' : t === 'sky' ? 'text-sky' : t === 'sun' ? 'text-sun' : 'text-rose'
const TONE_BORDER = (t: Quarter['tone']) =>
  t === 'coral' ? 'border-coral' : t === 'sky' ? 'border-sky' : t === 'sun' ? 'border-sun' : 'border-rose'
const TONE_RING = (t: Quarter['tone']) =>
  t === 'coral' ? 'ring-coral/30' : t === 'sky' ? 'ring-sky/30' : t === 'sun' ? 'ring-sun/30' : 'ring-rose/30'
const TONE_BG_DOT = (t: Quarter['tone']) =>
  t === 'coral' ? 'bg-coral' : t === 'sky' ? 'bg-sky' : t === 'sun' ? 'bg-sun' : 'bg-rose'

export default function CaseStudy() {
  const [step, setStep] = useState(0)
  const activeIdx = Math.min(step, QUARTERS.length - 1)
  const showStack = step >= QUARTERS.length
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
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-mono uppercase tracking-widest text-sun">Northwind Co. · twelve months</span>
            <span className="ml-auto text-[11px] text-paper/40">{Math.min(step + 1, QUARTERS.length)} of {QUARTERS.length} quarters</span>
          </div>

          {/* Compact timeline rail with generous vertical room for labels */}
          <div className="relative px-1" style={{ height: 56 }}>
            <div className="absolute top-3 left-2 right-2 h-1 bg-white/10 rounded-full" />
            <div className="absolute inset-0 flex justify-between items-start px-2">
              {QUARTERS.map((q, i) => {
                const isPast = i <= activeIdx
                return (
                  <div key={q.n} className="flex flex-col items-center" style={{ width: 80 }}>
                    <div
                      className={[
                        'w-5 h-5 rounded-full border-2 border-white/30 transition-all',
                        isPast ? TONE_BG_DOT(q.tone) : 'bg-ink-soft',
                        i === activeIdx ? 'scale-125 anim-pulse-glow' : '',
                      ].join(' ')}
                    />
                    <span className={`text-[10px] mt-2 font-mono ${isPast ? TONE_TEXT(q.tone) : 'text-paper/40'}`}>
                      {q.n}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Append: every quarter card visible up to current beat */}
          <div className="space-y-3">
            {QUARTERS.slice(0, activeIdx + 1).map((q, i) => (
              <QuarterCard
                key={q.n}
                q={q}
                active={i === activeIdx}
                ref={i === activeIdx ? activeRef : undefined}
              />
            ))}
          </div>

          {showStack && <FinalStack />}
        </div>
      }
      outro={
        <p>
          One company. Three techniques. One sequence: <em>get facts right (RAG) → get voice right (LoRA) → get the bill right (distill)</em>.
          Bookmark this order — it is the single most useful slide in the whole tour.
        </p>
      }
    />
  )
}

/* ── quarter card ──────────────────────────────────────────────────────── */

const QuarterCard = ({
  q,
  active,
  ref,
}: {
  q: Quarter
  active: boolean
  ref?: React.RefObject<HTMLDivElement | null>
}) => (
  <div
    ref={ref}
    className={[
      'rounded-xl border-2 bg-ink-soft p-4 transition-all',
      TONE_BORDER(q.tone),
      active ? `ring-2 ring-offset-2 ring-offset-ink ${TONE_RING(q.tone)} anim-float-in` : 'opacity-85',
    ].join(' ')}
  >
    <div className="flex items-baseline gap-2 mb-1 flex-wrap">
      <span className={`text-xs font-mono uppercase tracking-widest ${TONE_TEXT(q.tone)}`}>{q.n}</span>
      <p className={`font-bold ${TONE_TEXT(q.tone)}`}>{q.title}</p>
      {active && (
        <span className={`ml-auto text-[10px] font-mono uppercase tracking-widest ${TONE_TEXT(q.tone)}`}>live</span>
      )}
      {!active && (
        <span className="ml-auto text-[10px] font-mono uppercase tracking-widest text-paper/35">shipped ✓</span>
      )}
    </div>
    <p className="text-sm text-paper mb-3">{q.goal}</p>

    <div className="grid sm:grid-cols-2 gap-3">
      <div className="rounded-lg border border-white/10 bg-ink p-2.5">
        <p className="text-[10px] font-mono uppercase tracking-widest text-paper/45 mb-1">Technique</p>
        <p className={`text-sm font-semibold ${TONE_TEXT(q.tone)}`}>{q.technique}</p>
      </div>
      <div className="rounded-lg border border-white/10 bg-ink p-2.5">
        <p className="text-[10px] font-mono uppercase tracking-widest text-paper/45 mb-1">Key numbers</p>
        <ul className="text-xs text-paper space-y-0.5">
          {q.metric.map((m) => (
            <li key={m.label} className="flex justify-between gap-2">
              <span className="text-paper/70">{m.label}</span>
              <span className={`font-bold ${TONE_TEXT(q.tone)}`}>{m.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>

    <div className="mt-3 grid sm:grid-cols-2 gap-3">
      <div className="rounded-lg border border-coral/30 bg-coral/5 p-2.5">
        <p className="text-[10px] font-mono uppercase tracking-widest text-coral mb-0.5">Hard thing this quarter</p>
        <p className="text-xs text-paper">{q.hardThing}</p>
      </div>
      <div className="rounded-lg border border-mint/30 bg-mint/5 p-2.5">
        <p className="text-[10px] font-mono uppercase tracking-widest text-mint mb-0.5">What it told us to do next</p>
        <p className="text-xs text-paper">{q.next}</p>
      </div>
    </div>
  </div>
)

/* ── final stack diagram ───────────────────────────────────────────────── */

interface StackLayer {
  emoji: string
  title: string
  desc: string
  tone: 'rose' | 'sun' | 'sky' | 'paper'
}
const STACK: StackLayer[] = [
  { emoji: '🎓', title: 'Distilled 7B student', desc: 'The model that actually answers, cheap and on-prem.', tone: 'rose' },
  { emoji: '🗒️', title: 'LoRA adapter',         desc: 'Northwind voice and reply structure.',                tone: 'sun' },
  { emoji: '📖', title: 'RAG layer',             desc: 'Pulls fresh chunks from handbook, wiki, tickets.',     tone: 'sky' },
  { emoji: '🧠', title: 'Open base model',       desc: 'Frozen — swapped only on major version bumps.',        tone: 'paper' },
]

function FinalStack() {
  return (
    <div className="rounded-xl border border-white/10 bg-ink-soft p-4 anim-float-in">
      <p className="text-[10px] font-mono uppercase tracking-widest text-paper/55 mb-3">
        The final stack — top to bottom
      </p>
      <div className="space-y-2">
        {STACK.map((s) => {
          const border =
            s.tone === 'rose' ? 'border-rose' :
            s.tone === 'sun' ? 'border-sun' :
            s.tone === 'sky' ? 'border-sky' :
            'border-paper/30'
          const text =
            s.tone === 'rose' ? 'text-rose' :
            s.tone === 'sun' ? 'text-sun' :
            s.tone === 'sky' ? 'text-sky' :
            'text-paper'
          return (
            <div key={s.title} className={`rounded-lg border-2 ${border} bg-ink p-3 flex items-start gap-3`}>
              <span className="text-2xl leading-none shrink-0">{s.emoji}</span>
              <div className="min-w-0">
                <p className={`font-bold ${text}`}>{s.title}</p>
                <p className="text-xs text-paper/80 leading-snug">{s.desc}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
