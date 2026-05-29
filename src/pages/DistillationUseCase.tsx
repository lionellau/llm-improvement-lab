import { useState } from 'react'
import { CHAPTERS } from '../chapters'
import ChapterShell from '../components/ChapterShell'

const ch = CHAPTERS.find((c) => c.path === '/distillation-use-case')!

const beats = [
  {
    caption: 'Northwind\'s support inbox runs 24/7. Volume doubled in a year. The big-model API bill is now $42k/month.',
    llmNote: 'This is the textbook tipping point. Below 1M queries/month, distillation rarely pays. Above it, the math is brutal.',
    readingMs: 3200,
  },
  {
    caption: 'The support team is happy with the big model\'s reply quality. They just cannot keep paying for it.',
    llmNote: 'Distillation is the right move precisely BECAUSE quality is already good. It would be a mistake to distill a bad teacher.',
    readingMs: 3200,
  },
  {
    caption: 'Step one: collect 60,000 anonymised real tickets, paired with the big model\'s replies. That is the training set.',
    llmNote: 'Real customer questions, not synthetic ones. Reality is messier than synthetic data and the student needs to see that mess.',
    readingMs: 3400,
  },
  {
    caption: 'Step two: fine-tune a 7-billion-parameter open model on those 60,000 pairs. One week of one rented GPU.',
    llmNote: 'In practice this is a QLoRA fine-tune on the open student — distillation often layers on top of LoRA/QLoRA, not instead of it.',
    readingMs: 3400,
  },
  {
    caption: 'Step three: measure. On a 200-ticket eval set, the student matches the teacher on 93% of replies.',
    llmNote: 'A small eval set graded by humans is non-negotiable. Without it, you do not know what quality you actually shipped.',
    readingMs: 3400,
  },
  {
    caption: 'Bill drops from $42k to $3k/month. Latency drops from 1.4s to 130ms. Support team ships.',
    llmNote: '14× cost reduction is realistic for high-volume narrow tasks. Latency improvements come from running a smaller model on cheaper hardware.',
    readingMs: 3400,
  },
  {
    caption: 'The teacher is still around — used for the hard 7% the student got wrong, and to grade the student\'s drift over time.',
    llmNote: 'Production pattern: "student first, escalate to teacher". Cheap by default, accurate when it matters.',
    readingMs: 3400,
  },
]

interface Metric {
  label: string
  before: string
  after: string
  tone: 'rose' | 'mint' | 'sun'
  bias: 'lower' | 'higher'
}
const METRICS: Metric[] = [
  { label: 'Monthly cost',    before: '$42 000', after: '$3 000', tone: 'rose', bias: 'lower' },
  { label: 'Latency / reply', before: '1.4 s',   after: '130 ms', tone: 'mint', bias: 'lower' },
  { label: 'Quality match',   before: '100%',    after: '93%',    tone: 'sun',  bias: 'higher' },
  { label: 'Data leaves us',  before: 'Yes',     after: 'No',     tone: 'rose', bias: 'lower' },
]

const STEPS = [
  { n: '1', title: 'Collect',  text: '60k anonymised tickets + teacher replies.' },
  { n: '2', title: 'Train',    text: 'QLoRA-fine-tune a 7B open model. ~1 week, 1 GPU.' },
  { n: '3', title: 'Evaluate', text: 'Humans grade 200 replies side-by-side.' },
  { n: '4', title: 'Ship',     text: 'Student serves by default; teacher catches edge cases.' },
]

export default function DistillationUseCase() {
  const [step, setStep] = useState(0)

  const showBefore = step >= 0
  const showWhy = step >= 1
  const showSteps = step >= 2
  const showMetrics = step >= 5
  const showEscalation = step >= 6

  return (
    <ChapterShell
      chapter={ch}
      beats={beats}
      onStep={setStep}
      watch={
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-mono uppercase tracking-widest text-rose">Use case · Northwind support bot</span>
            <span className="ml-auto text-[11px] text-paper/40">The escape-the-bill playbook</span>
          </div>

          {/* Situation strip */}
          {showBefore && (
            <div className="rounded-xl border-2 border-coral bg-ink-soft p-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-coral mb-1">Where Maya's team started</p>
              <p className="text-sm text-paper">
                Big API model, great answers, $42k/month bill, 1.4s latency, customer data leaves the network on every call.
                CFO has stopped smiling.
              </p>
            </div>
          )}

          {showWhy && (
            <div className="mt-3 rounded-xl border border-white/10 bg-ink-soft p-3 anim-float-in">
              <p className="text-[10px] font-mono uppercase tracking-widest text-paper/45 mb-1">Why distillation, not RAG or fine-tune?</p>
              <p className="text-sm text-paper">
                Quality is fine. Knowledge is fine. Voice is fine. The problem is the bill and the latency.
                Both shrink when you replace a 70B model with a 7B copy.
              </p>
            </div>
          )}

          {/* Workflow */}
          {showSteps && (
            <div className="mt-4 anim-float-in">
              <p className="text-[10px] uppercase tracking-widest text-paper/45 mb-2">The four-step workflow</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {STEPS.map((s, i) => (
                  <div key={s.n} className="rounded-lg border-2 border-rose bg-ink-soft p-2 anim-float-in" style={{ animationDelay: `${i * 80}ms` }}>
                    <p className="text-[10px] font-mono text-rose">{s.n}. {s.title}</p>
                    <p className="text-[11px] text-paper leading-snug mt-0.5">{s.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Before/after metrics */}
          {showMetrics && (
            <div className="mt-4 anim-float-in">
              <p className="text-[10px] uppercase tracking-widest text-rose mb-2">Before → After</p>
              <div className="space-y-2">
                {METRICS.map((m) => {
                  const toneText = m.tone === 'rose' ? 'text-rose' : m.tone === 'mint' ? 'text-mint' : 'text-sun'
                  return (
                    <div key={m.label} className="grid grid-cols-[1fr_auto_auto_auto] gap-3 items-center rounded-lg border border-white/10 bg-ink p-2">
                      <p className="text-xs text-paper/80 truncate">{m.label}</p>
                      <p className="text-xs font-mono text-coral">{m.before}</p>
                      <span className="text-paper/40">→</span>
                      <p className={`text-xs font-mono font-bold ${toneText}`}>{m.after}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Escalation pattern */}
          {showEscalation && (
            <div className="mt-4 rounded-xl border-2 border-rose bg-ink-soft p-3 anim-float-in">
              <p className="text-[10px] font-mono uppercase tracking-widest text-rose mb-2">Production pattern: cheap-first, smart-on-demand</p>
              <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 text-xs">
                <div className="rounded-lg border-2 border-rose bg-ink p-2 text-center">
                  <p className="font-bold text-rose">Student</p>
                  <p className="text-paper/80 text-[11px]">serves 93%</p>
                </div>
                <span className="text-rose">→</span>
                <div className="rounded-lg border border-paper/30 bg-ink p-2 text-center">
                  <p className="font-bold text-paper">Confidence?</p>
                  <p className="text-paper/55 text-[11px]">low</p>
                </div>
                <span className="text-paper/55">→</span>
                <div className="rounded-lg border-2 border-rose/60 bg-ink p-2 text-center">
                  <p className="font-bold text-rose">Teacher</p>
                  <p className="text-paper/80 text-[11px]">handles 7%</p>
                </div>
              </div>
              <p className="text-[11px] text-paper/55 mt-2 text-center">Cost stays low. Hard tickets still get the best brain.</p>
            </div>
          )}
        </div>
      }
      outro={
        <p>
          Notice the layering: RAG gave Northwind facts, LoRA/QLoRA gave it voice, distillation made it
          affordable. The next chapter walks all three together as one twelve-month plan.
        </p>
      }
    />
  )
}
