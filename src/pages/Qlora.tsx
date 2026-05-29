import { useState } from 'react'
import { CHAPTERS } from '../chapters'
import ChapterShell from '../components/ChapterShell'

const ch = CHAPTERS.find((c) => c.path === '/qlora')!

const beats = [
  {
    caption: 'LoRA was clever about adapter size. QLoRA gets clever about the base model itself.',
    llmNote: 'QLoRA = Quantized LoRA. Before adding adapters, you compress the frozen base model so it physically fits on smaller hardware.',
    readingMs: 3200,
  },
  {
    caption: 'Imagine packing for a trip. Instead of 100 sharp pencils, take 100 chunky crayons. Same drawing, smaller bag.',
    llmNote: 'Quantization stores each number with fewer bits. 16-bit → 8-bit halves memory; 16-bit → 4-bit quarters it. The model loses precision, not knowledge.',
    readingMs: 3400,
  },
  {
    caption: 'A 70-billion-parameter model normally needs 140 GB. Quantized to 4 bits, it fits in ~35 GB — one consumer GPU.',
    llmNote: 'This is the headline result of QLoRA. Researchers fine-tuned a 65B model on a single 48GB consumer GPU, where full precision would need 8× that.',
    readingMs: 3400,
  },
  {
    caption: 'The crayon model is frozen. The sticky-note adapters are still trained in full precision, so quality stays high.',
    llmNote: 'The trick is asymmetric: weights are 4-bit, gradients flow through in 16-bit. You compress what you do not update.',
    readingMs: 3400,
  },
  {
    caption: 'When the trip is over, you can keep the crayons (deploy quantized) or unpack the original pencils (re-load full precision).',
    llmNote: 'In production, teams often serve the QLoRA-quantized model directly — it is small, fast, and the quality drop is usually under 1 point on benchmarks.',
    readingMs: 3400,
  },
  {
    caption: 'QLoRA is the reason a startup with three engineers and one rented GPU can fine-tune a frontier model. That is genuinely new.',
    llmNote: 'Before QLoRA (2023), fine-tuning a 65B model required tens of thousands of dollars of GPU time. After QLoRA: roughly $50–$200 per run.',
    readingMs: 3400,
  },
]

const SIZES = [
  { bits: 32, gb: 280, label: 'FP32 · float full',  tone: 'coral',      blurb: 'Research precision. Nobody serves this.' },
  { bits: 16, gb: 140, label: 'FP16 · half',        tone: 'sun',        blurb: 'Standard inference. Still huge.' },
  { bits: 8,  gb: 70,  label: 'INT8 · byte',        tone: 'sky',        blurb: 'Common in production. Quality cost tiny.' },
  { bits: 4,  gb: 35,  label: 'NF4 · QLoRA',        tone: 'grape-soft', blurb: 'QLoRA\'s 4-bit format. Surprisingly intact.' },
]

const CRAYONS = ['🖍️', '🖍️', '🖍️', '🖍️', '🖍️']
const PENCILS = ['✏️', '✏️', '✏️', '✏️', '✏️', '✏️', '✏️', '✏️', '✏️', '✏️']

export default function Qlora() {
  const [step, setStep] = useState(0)
  const showCrayons = step >= 1
  const showSizes = step >= 2
  const showAsym = step >= 3
  const showDeploy = step >= 4
  const showWho = step >= 5

  return (
    <ChapterShell
      chapter={ch}
      beats={beats}
      onStep={setStep}
      watch={
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-mono uppercase tracking-widest text-sun">Quantization, in pictures</span>
            <span className="ml-auto text-[11px] text-paper/40">Same brain, smaller bits</span>
          </div>

          {/* Pencils vs crayons */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl border-2 border-coral bg-ink-soft p-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-coral mb-1">Original (FP16)</p>
              <p className="text-2xl tracking-wide mb-1">{PENCILS.join(' ')}</p>
              <p className="text-xs text-paper">Lots of precise pencils. Heavy bag. Won't fit on a laptop.</p>
            </div>
            <div className={`rounded-xl border-2 border-grape-soft bg-ink-soft p-3 transition-all ${showCrayons ? 'opacity-100 anim-float-in' : 'opacity-30'}`}>
              <p className="text-[10px] font-mono uppercase tracking-widest text-grape-soft mb-1">Quantized (NF4)</p>
              <p className="text-2xl tracking-wide mb-1">{CRAYONS.join(' ')}</p>
              <p className="text-xs text-paper">Fewer, chunkier strokes. Light bag. Same picture, mostly.</p>
            </div>
          </div>

          {/* Size table */}
          {showSizes && (
            <div className="mt-4 anim-float-in">
              <p className="text-[10px] uppercase tracking-widest text-paper/45 mb-2">Storing a 70B model</p>
              <div className="space-y-2">
                {SIZES.map((s) => {
                  const maxGb = 280
                  const pct = (s.gb / maxGb) * 100
                  const toneText  = s.tone === 'coral' ? 'text-coral' : s.tone === 'sun' ? 'text-sun' : s.tone === 'sky' ? 'text-sky' : 'text-grape-soft'
                  const toneBgBar = s.tone === 'coral' ? 'bg-coral'    : s.tone === 'sun' ? 'bg-sun'    : s.tone === 'sky' ? 'bg-sky'   : 'bg-grape-soft'
                  return (
                    <div key={s.bits} className="rounded-lg border border-white/10 bg-ink p-2">
                      <div className="flex items-baseline gap-2 mb-1">
                        <p className={`text-xs font-mono ${toneText}`}>{s.bits}-bit</p>
                        <p className="text-xs text-paper/85 truncate">{s.label}</p>
                        <p className={`ml-auto text-sm font-bold ${toneText}`}>{s.gb} GB</p>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full ${toneBgBar} anim-bar`} style={{ ['--target-width' as string]: `${pct}%`, width: `${pct}%` }} />
                      </div>
                      <p className="text-[11px] text-paper mt-1">{s.blurb}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Asymmetric trick */}
          {showAsym && (
            <div className="mt-4 grid sm:grid-cols-2 gap-3 anim-float-in">
              <div className="rounded-xl border-2 border-grape-soft bg-ink-soft p-3">
                <p className="text-[10px] font-mono uppercase tracking-widest text-grape-soft mb-1">Frozen base weights</p>
                <p className="text-sm text-paper">Stored at <span className="font-bold text-grape-soft">4 bits</span>. Read-only. Never touched during training.</p>
              </div>
              <div className="rounded-xl border-2 border-sun bg-ink-soft p-3">
                <p className="text-[10px] font-mono uppercase tracking-widest text-sun mb-1">Trainable adapters</p>
                <p className="text-sm text-paper">Stored at <span className="font-bold text-sun">16 bits</span>. Tiny. Updated normally.</p>
              </div>
            </div>
          )}

          {/* Deploy variants */}
          {showDeploy && (
            <div className="mt-4 rounded-xl border-2 border-sun bg-sun/10 p-3 anim-float-in">
              <p className="text-[10px] font-mono uppercase tracking-widest text-sun mb-1">After training, you choose</p>
              <ul className="text-sm text-paper space-y-1">
                <li>• Serve the 4-bit quantized model directly → smallest footprint, fastest inference.</li>
                <li>• Re-load full precision and apply the adapter → highest quality, biggest VRAM bill.</li>
              </ul>
            </div>
          )}

          {/* Who can do this */}
          {showWho && (
            <div className="mt-3 rounded-xl border-2 border-grape-soft bg-grape/10 p-3 anim-float-in">
              <p className="text-[10px] font-mono uppercase tracking-widest text-grape-soft mb-1">What changed in 2023</p>
              <p className="text-sm text-paper">
                A 65B fine-tune used to mean ~$30,000 of cloud GPU time. With QLoRA, the same job runs on a single
                rented GPU for <span className="font-bold text-grape-soft">~$50–$200</span>. That is the unlock.
              </p>
            </div>
          )}
        </div>
      }
      outro={
        <>
          <p>
            QLoRA does not make models smarter — it makes fine-tuning affordable. The combination
            (quantized base + tiny adapter) is now the default way teams customise open-weight models.
          </p>
          <p className="text-paper/65">
            But what if the goal isn't a bigger fine-tune — it's a smaller, faster model? That's distillation.
          </p>
        </>
      }
    />
  )
}
