import { useState } from 'react'
import { CHAPTERS } from '../chapters'
import ChapterShell from '../components/ChapterShell'

const ch = CHAPTERS.find((c) => c.path === '/distillation')!

const beats = [
  {
    caption: 'You have a giant, expensive, slow model that gives great answers. You want a tiny, cheap, fast model that gives almost-as-great answers.',
    llmNote: 'This is distillation\'s entire purpose. It is not about quality — it is about ratio: quality-per-dollar and quality-per-millisecond.',
    readingMs: 3200,
  },
  {
    caption: 'Pick a teacher (the big model) and a student (a much smaller model from the same or different family).',
    llmNote: 'Common pairing: teacher is GPT-4 / Claude / Llama-70B; student is a 7B or 3B model. The student starts with zero knowledge of your task.',
    readingMs: 3400,
  },
  {
    caption: 'Ask the teacher 50,000 representative questions. Save its answers. That is your training set, free of human labellers.',
    llmNote: 'This is "synthetic data" or "soft labels". The teacher\'s output replaces what a human would have written. It costs API calls, not headcount.',
    readingMs: 3400,
  },
  {
    caption: 'Train the student to copy the teacher. Not just the final answer — the way the teacher reasons.',
    llmNote: 'The richest version, "soft-label distillation", trains the student on the teacher\'s full probability distribution, not just its top choice.',
    readingMs: 3400,
  },
  {
    caption: 'The student ends up roughly 10× smaller and 10× faster, with maybe a 5–10% quality drop on the target task.',
    llmNote: 'For narrow tasks (support replies, classification, summarisation) the drop is often negligible. For open-ended reasoning, the drop is bigger.',
    readingMs: 3400,
  },
  {
    caption: 'You now own the student. It runs on a small server. It is cheap to scale. It can live behind your firewall.',
    llmNote: 'Distillation is the typical "escape the API bill" move. Once volume is high enough, the math always points here.',
    readingMs: 3400,
  },
]

export default function Distillation() {
  const [step, setStep] = useState(0)

  // Beat-driven visibility
  const showTeacher = step >= 0
  const showStudent = step >= 1
  const showAskBatch = step >= 2
  const showSoftLabels = step >= 3
  const showOutcome = step >= 4
  const showOwn = step >= 5

  return (
    <ChapterShell
      chapter={ch}
      beats={beats}
      onStep={setStep}
      watch={
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-mono uppercase tracking-widest text-rose">The teacher–student loop</span>
            <span className="ml-auto text-[11px] text-paper/40">Big mimics → small absorbs</span>
          </div>

          {/* Teacher / student diagram */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-3">
            <div className={`rounded-xl border-2 ${showTeacher ? 'border-rose' : 'border-white/15'} bg-ink-soft p-3 ${step === 0 ? 'ring-2 ring-rose/50 ring-offset-2 ring-offset-ink' : ''}`}>
              <p className="text-[10px] font-mono uppercase tracking-widest text-rose mb-1">Teacher</p>
              <p className="text-3xl text-center mb-2">🧠</p>
              <p className="text-xs text-paper text-center"><span className="text-rose font-bold">70B params</span><br/>$1.50 / 1k calls<br/>900 ms / reply</p>
            </div>

            <div className="flex flex-col items-center justify-center gap-1">
              {showAskBatch && (
                <div className="text-xs text-rose anim-float-in font-mono">50 000 Qs →</div>
              )}
              {showSoftLabels && (
                <div className="text-xs text-rose anim-float-in font-mono">← answers</div>
              )}
              {!showAskBatch && !showSoftLabels && (
                <div className="text-xs text-paper/30 font-mono">···</div>
              )}
            </div>

            <div className={`rounded-xl border-2 ${showStudent ? 'border-rose' : 'border-white/15'} bg-ink-soft p-3 ${step === 1 ? 'ring-2 ring-rose/50 ring-offset-2 ring-offset-ink' : ''}`}>
              <p className="text-[10px] font-mono uppercase tracking-widest text-rose mb-1">Student</p>
              <p className="text-3xl text-center mb-2">🌱</p>
              <p className="text-xs text-paper text-center"><span className="text-rose font-bold">7B params</span><br/>$0.12 / 1k calls<br/>80 ms / reply</p>
            </div>
          </div>

          {/* Synthetic-data sample */}
          {showAskBatch && (
            <div className="mt-4 rounded-xl border border-rose/40 bg-ink-soft p-3 anim-float-in">
              <p className="text-[10px] font-mono uppercase tracking-widest text-rose mb-2">A few of the 50,000 examples</p>
              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-[auto_1fr] gap-2 items-start">
                  <span className="text-paper/45 font-mono">Q</span>
                  <span className="text-paper">"Where is my order?"</span>
                </div>
                <div className="grid grid-cols-[auto_1fr] gap-2 items-start">
                  <span className="text-rose font-mono">A</span>
                  <span className="text-paper">"It looks like #4421 shipped yesterday — let me check tracking."</span>
                </div>
                <div className="grid grid-cols-[auto_1fr] gap-2 items-start">
                  <span className="text-paper/45 font-mono">Q</span>
                  <span className="text-paper">"How do I reset my 2FA?"</span>
                </div>
                <div className="grid grid-cols-[auto_1fr] gap-2 items-start">
                  <span className="text-rose font-mono">A</span>
                  <span className="text-paper">"Sign in, open Settings → Security, then click 'Reset 2FA' and follow the email link."</span>
                </div>
              </div>
            </div>
          )}

          {/* Soft labels explainer */}
          {showSoftLabels && (
            <div className="mt-3 rounded-xl border border-rose/40 bg-ink-soft p-3 anim-float-in">
              <p className="text-[10px] font-mono uppercase tracking-widest text-rose mb-2">"Soft labels" — the teacher\'s shades of certainty</p>
              <p className="text-xs text-paper mb-2">For each next word the teacher considered, we record the full probability — not just the winner.</p>
              <div className="space-y-1">
                {[
                  { word: 'shipped',  p: 0.62 },
                  { word: 'arrived',  p: 0.21 },
                  { word: 'left',     p: 0.10 },
                  { word: 'departed', p: 0.04 },
                ].map((row) => (
                  <div key={row.word} className="grid grid-cols-[80px_1fr_40px] gap-2 items-center text-xs">
                    <span className="font-mono text-paper/80">"{row.word}"</span>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-rose anim-bar" style={{ ['--target-width' as string]: `${row.p * 100}%`, width: `${row.p * 100}%` }} />
                    </div>
                    <span className="font-mono text-paper/55 text-right">{(row.p * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-paper/55 mt-2">The student copies the whole shape — it inherits taste, not just answers.</p>
            </div>
          )}

          {/* Outcome card */}
          {showOutcome && (
            <div className="mt-4 rounded-xl border-2 border-rose bg-rose/10 p-3 anim-float-in">
              <p className="text-[10px] font-mono uppercase tracking-widest text-rose mb-1">Net result</p>
              <p className="text-sm text-paper">
                <span className="text-rose font-bold">~10×</span> smaller ·
                <span className="text-rose font-bold ml-2">~10×</span> faster ·
                <span className="text-rose font-bold ml-2">~5–10%</span> quality drop on the target task.
              </p>
            </div>
          )}

          {showOwn && (
            <div className="mt-3 rounded-xl border-2 border-rose bg-ink-soft p-3 anim-float-in">
              <p className="text-[10px] font-mono uppercase tracking-widest text-rose mb-1">What you now own</p>
              <p className="text-sm text-paper">
                A small model file. Runs on your own server. No API bill. No data leaving your network. Yours to fine-tune,
                quantize, and ship anywhere.
              </p>
            </div>
          )}
        </div>
      }
      outro={
        <>
          <p>
            Distillation is rarely the first move. It only pays off when query volume is high enough that the
            API bill or the latency budget actually hurts.
          </p>
          <p className="text-paper/65">
            Next chapter: a real Northwind workflow where the cost finally tipped — and the team distilled.
          </p>
        </>
      }
    />
  )
}
