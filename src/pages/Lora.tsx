import { useEffect, useState } from 'react'
import { CHAPTERS } from '../chapters'
import ChapterShell from '../components/ChapterShell'

const ch = CHAPTERS.find((c) => c.path === '/lora')!

/* ──────────────────────────────────────────────────────────────────────────
 *  ONE animated hero. A single layer stack on the left, a single output
 *  panel on the right. A pulse travels up the layers every ~2.5s.
 *
 *  As beats progress, things are ADDED around the hero:
 *    Beat 0 — stack only, no flow yet.
 *    Beat 1 — flow starts. Pulse runs up the layers, default output emerges.
 *    Beat 2 — sticky notes pin to specific layers; pulse glows when crossing
 *             a patched layer; output changes to the patched version.
 *    Beat 3 — side panel "what's in this patch" appears.
 *    Beat 4 — three adapter pills appear below; clicking swaps the patches
 *             in place and the output text follows.
 *    Beat 5 — math + cost panel appears below the hero.
 *
 *  No duplicated stacks. No page flips. The layer stack is drawn ONCE and
 *  the animation lives inside it.
 *  ────────────────────────────────────────────────────────────────────── */

interface Adapter {
  id: 'voice' | 'json' | 'legal'
  label: string
  emoji: string
  pin: string          // raw hex for the sticky-note background
  tone: string         // text-* class for headings
  border: string       // border-* class
  bg: string           // bg-*/N for the pill background
  patchLayers: number[]  // 1-indexed layer numbers that get a sticky note
  contains: string[]
  rawOutput: string
  patchedOutput: string
}

const ADAPTERS: Adapter[] = [
  {
    id: 'voice',
    label: 'Brand voice',
    emoji: '🗣️',
    pin: '#a78bfa',
    tone: 'text-grape-soft',
    border: 'border-grape-soft',
    bg: 'bg-grape/20',
    patchLayers: [2, 4, 5],
    contains: ['Warm tone', 'No corporate filler', 'Short sentences'],
    rawOutput: '"Dear Valued Customer, We sincerely regret the inconvenience caused by the delayed shipment of your order…"',
    patchedOutput: '"Hey Sam — sorry your order is late. I just checked tracking and it should land tomorrow. Let me know if it doesn\'t."',
  },
  {
    id: 'json',
    label: 'JSON ticket',
    emoji: '🏷️',
    pin: '#38bdf8',
    tone: 'text-sky',
    border: 'border-sky',
    bg: 'bg-sky/15',
    patchLayers: [1, 3, 6],
    contains: ['Strict schema', 'No prose', 'Required fields'],
    rawOutput: '"It sounds like you would like a refund. I can certainly help with that. Could you confirm your order number?"',
    patchedOutput: '{ "intent": "refund_request", "needs": ["order_id"], "next_action": "ask_order_id", "severity": "low" }',
  },
  {
    id: 'legal',
    label: 'Legal-safe',
    emoji: '⚖️',
    pin: '#fbbf24',
    tone: 'text-sun',
    border: 'border-sun',
    bg: 'bg-sun/15',
    patchLayers: [3, 4],
    contains: ['No forward-looking statements', 'Refer to AM', 'No price quotes'],
    rawOutput: '"Our pricing should remain stable, and we don\'t expect any major changes in the next year."',
    patchedOutput: '"I can\'t speculate about future pricing — please reach out to your account manager for our current published rates."',
  },
]

const NUM_LAYERS = 6
const PULSE_MS = 350  // one frame per layer

const beats = [
  {
    caption: 'A base model is a tall stack of layers. Each layer transforms the input flowing up through it.',
    llmNote: 'A 7B model has roughly 30 layers. Each holds ~250M numbers. Full fine-tuning means touching all of them — slow, expensive, easy to break.',
    readingMs: 3000,
  },
  {
    caption: 'Press next — and watch a request flow up the stack. With no patches, the model produces its default voice. For Northwind, that\'s corporate sludge.',
    llmNote: 'The base model averages the internet. Your brand voice is not the average of the internet.',
    readingMs: 3600,
  },
  {
    caption: 'LoRA pins tiny sticky-note patches to a few specific layers. Same stack — but the pulse picks up a nudge at each patched layer.',
    llmNote: 'Each patch is a low-rank matrix pair (A, B). The frozen weight W becomes W + A·B. Same shape. Slightly different math.',
    readingMs: 4000,
  },
  {
    caption: 'Same input, same six layers — but the cumulative nudges change the output. Northwind voice now.',
    llmNote: 'No weights of the base model were touched. The patches sit BESIDE the originals, not on top of them.',
    readingMs: 3600,
  },
  {
    caption: 'Different patches, same base. Click a pill — the sticky-notes move to different layers and the output follows.',
    llmNote: 'One server, many adapters. Brand voice for marketing, JSON for ticketing, legal-safe for sales. ~10 MB each.',
    readingMs: 3600,
  },
  {
    caption: 'Cost: roughly 10× cheaper than full fine-tuning, 100× smaller artefact, same quality on behaviour tasks. That\'s the whole story.',
    llmNote: 'A 65B LoRA used to cost ~$30k of compute. Today it\'s under $200. That price drop is why every team can fine-tune.',
    readingMs: 3400,
  },
]

export default function Lora() {
  const [step, setStep] = useState(0)
  const [adapterIdx, setAdapterIdx] = useState(0)

  // Drives the pulse position. 0..5 = at layer 1..6, 6..8 = at output / pause.
  const [pulse, setPulse] = useState<number>(-1)

  // Re-arm the pulse whenever the chapter is at beat 1+ and the adapter changes.
  useEffect(() => {
    if (step < 1) {
      setPulse(-1)
      return
    }
    setPulse(0)
    let p = 0
    const id = window.setInterval(() => {
      p = (p + 1) % 9  // 0..5 layers, 6 output emerges, 7..8 pause, then loop
      setPulse(p)
    }, PULSE_MS)
    return () => clearInterval(id)
  }, [step, adapterIdx])

  const adapterOn = step >= 2
  const showLegend = step >= 3
  const showSwap   = step >= 4
  const showMath   = step >= 5

  const adapter = ADAPTERS[adapterIdx]

  return (
    <ChapterShell
      chapter={ch}
      beats={beats}
      onStep={setStep}
      watch={
        <div className="space-y-4">
          <Hero
            step={step}
            pulse={pulse}
            adapterOn={adapterOn}
            adapter={adapter}
            showLegend={showLegend}
          />

          {showSwap && (
            <SwapPills active={adapter.id} setIdx={setAdapterIdx} />
          )}

          {showMath && <MathAndCost />}
        </div>
      }
      outro={
        <p>
          One sentence to keep: <em className="text-grape-soft not-italic">LoRA freezes the brain and trains a folder of sticky-note packs.</em>{' '}
          Next chapter is QLoRA, which goes one step further and shrinks the brain itself before adding the notes.
        </p>
      }
    />
  )
}

/* ──────────────────────────────────────────────────────────────────────────
 *  Hero · the only place the layer stack ever appears.
 *  ────────────────────────────────────────────────────────────────────── */

function Hero({
  step,
  pulse,
  adapterOn,
  adapter,
  showLegend,
}: {
  step: number
  pulse: number
  adapterOn: boolean
  adapter: Adapter
  showLegend: boolean
}) {
  const outputVisible = step >= 1 && pulse >= 6
  // What output to show: base voice if no patches, patched voice otherwise.
  const outputText = adapterOn ? adapter.patchedOutput : ADAPTERS[0].rawOutput
  const outputAdapter = adapterOn ? adapter : null

  return (
    <div className="rounded-2xl border-2 border-grape-soft bg-ink-soft p-4">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="text-xs font-mono uppercase tracking-widest text-grape-soft">Live · the model + its patches</span>
        <span className="ml-auto text-[11px] text-paper/40">
          {step === 0 ? 'press next to start the flow' : 'flow loops automatically'}
        </span>
      </div>

      <div className={`grid gap-4 items-start ${showLegend ? 'md:grid-cols-[260px_1fr_220px]' : 'md:grid-cols-[260px_1fr]'}`}>
        <LayerStack pulse={pulse} adapterOn={adapterOn} adapter={adapter} />
        <OutputPanel
          step={step}
          visible={outputVisible}
          text={outputText}
          adapter={outputAdapter}
        />
        {showLegend && <AdapterLegend adapter={adapter} />}
      </div>

      <p className="mt-4 text-center text-xs text-paper/65 italic">
        {captionFor(step, adapter)}
      </p>
    </div>
  )
}

function captionFor(step: number, adapter: Adapter): string {
  if (step === 0) return 'Six layers stacked. Frozen. No patches yet.'
  if (step === 1) return 'Pulse climbs through every layer. No patches → default voice at the top.'
  if (step === 2) return `Patches pinned at layers ${adapter.patchLayers.join(', ')}. Watch the pulse glow when it crosses one.`
  if (step === 3) return 'Same stack, same input. Cumulative nudges → new behaviour.'
  if (step === 4) return 'Hot-swap the patches. The base model never moves.'
  return 'W (frozen) + A · B (tiny) = W′ (slightly shifted). That is the whole math.'
}

/* ── the layer stack ──────────────────────────────────────────────────── */

function LayerStack({ pulse, adapterOn, adapter }: { pulse: number; adapterOn: boolean; adapter: Adapter }) {
  // Visual order: layer 6 at top → layer 1 at bottom. Pulse goes 0=layer1 .. 5=layer6.
  const visualOrder = [6, 5, 4, 3, 2, 1]
  return (
    <div className="relative">
      <p className="text-[10px] font-mono text-paper/45 uppercase tracking-widest mb-2">
        Base model · 6 transformer layers (frozen)
      </p>

      <div className="relative flex flex-col gap-1.5">
        {visualOrder.map((layerNum) => {
          const isActive = pulse === layerNum - 1
          const hasPatch = adapterOn && adapter.patchLayers.includes(layerNum)
          return (
            <LayerRow
              key={layerNum}
              num={layerNum}
              isActive={isActive}
              hasPatch={hasPatch}
              adapter={adapter}
            />
          )
        })}

        {/* The "data flow" track on the right edge of the stack */}
        <FlowTrack pulse={pulse} adapterOn={adapterOn} adapter={adapter} />
      </div>

      {/* Bottom · input label */}
      <p className="mt-2 text-center text-[10px] font-mono text-paper/45">
        ↑ input enters at layer 1
      </p>
    </div>
  )
}

function LayerRow({
  num,
  isActive,
  hasPatch,
  adapter,
}: {
  num: number
  isActive: boolean
  hasPatch: boolean
  adapter: Adapter
}) {
  // Base = paper border. Active = sky glow. Active + patch = adapter colour glow.
  const baseClasses = 'rounded-md border-2 px-3 py-2 flex items-center justify-between transition-all duration-300 relative'
  const activeStyle = isActive
    ? {
        borderColor: hasPatch ? adapter.pin : '#38bdf8',
        boxShadow: hasPatch
          ? `0 0 18px ${adapter.pin}80, inset 0 0 8px ${adapter.pin}40`
          : '0 0 14px rgba(56,189,248,0.55), inset 0 0 6px rgba(56,189,248,0.3)',
        backgroundColor: hasPatch ? `${adapter.pin}26` : 'rgba(56,189,248,0.18)',
        transform: 'scale(1.04)',
      }
    : undefined

  return (
    <div
      className={`${baseClasses} ${!isActive ? 'border-paper/25 bg-ink' : ''}`}
      style={activeStyle}
    >
      <span className="text-xs font-mono text-paper/85">Layer {num}</span>
      <span className="text-[10px] font-mono text-paper/40">~7B</span>

      {/* Sticky-note pin */}
      {hasPatch && (
        <div
          className="absolute -right-3 top-1/2 -translate-y-1/2 rotate-[8deg]"
          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}
        >
          <div
            className="rounded px-1.5 py-0.5 text-[9px] font-bold leading-none flex items-center gap-1"
            style={{ backgroundColor: adapter.pin, color: '#0f0f1e' }}
          >
            🗒️
          </div>
        </div>
      )}

      {/* "+nudge" callout when pulse is at this patched layer */}
      {isActive && hasPatch && (
        <span
          className="absolute -left-14 top-1/2 -translate-y-1/2 text-[10px] font-mono anim-pop-in whitespace-nowrap"
          style={{ color: adapter.pin }}
        >
          + nudge
        </span>
      )}
    </div>
  )
}

/* ── the data-flow track (a vertical dot that travels up the stack) ──── */

function FlowTrack({ pulse, adapterOn, adapter }: { pulse: number; adapterOn: boolean; adapter: Adapter }) {
  if (pulse < 0) return null

  // Each row is roughly 44px tall (py-2 + border + text + gap). Compute the
  // dot's percent position. 0 = bottom of stack, 1 = top.
  const fraction = pulse < 6 ? (pulse + 0.5) / NUM_LAYERS : 1
  const bottomPercent = `${fraction * 100}%`

  // Tint the dot based on whether the current layer is patched.
  const currentLayer = pulse < 6 ? pulse + 1 : NUM_LAYERS
  const onPatched = adapterOn && adapter.patchLayers.includes(currentLayer)
  const color = onPatched ? adapter.pin : '#38bdf8'

  return (
    <div className="absolute right-[-22px] top-0 bottom-0 w-2 pointer-events-none">
      {/* faint rail */}
      <div className="absolute inset-x-1/2 top-0 bottom-0 border-l border-white/10" />
      {/* the dot */}
      <div
        className="absolute -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full"
        style={{
          left: '50%',
          bottom: bottomPercent,
          backgroundColor: color,
          boxShadow: `0 0 12px ${color}, 0 0 6px ${color}`,
          transition: 'bottom 280ms cubic-bezier(.4,.2,.4,1)',
        }}
      />
    </div>
  )
}

/* ── output panel ─────────────────────────────────────────────────────── */

function OutputPanel({
  step,
  visible,
  text,
  adapter,
}: {
  step: number
  visible: boolean
  text: string
  adapter: Adapter | null
}) {
  const tone = adapter?.tone ?? 'text-coral'
  const border = adapter?.border ?? 'border-coral'

  return (
    <div className="flex flex-col items-stretch">
      <p className="text-[10px] font-mono text-paper/45 uppercase tracking-widest mb-2">
        ↑ output appears here
      </p>
      <div
        className={`rounded-lg border-2 p-3 transition-all min-h-[160px] flex flex-col justify-center ${
          visible ? border : 'border-white/15'
        }`}
      >
        {visible ? (
          <div className="anim-float-in" key={`${adapter?.id ?? 'base'}-${text}`}>
            <p className={`text-[10px] font-mono uppercase tracking-widest mb-2 ${tone}`}>
              {adapter ? `Base + ${adapter.label} adapter` : 'Base only'}
            </p>
            <p className="text-sm text-paper leading-snug">{text}</p>
          </div>
        ) : (
          <p className="text-xs text-paper/35 italic text-center">
            {step === 0 ? 'No flow yet — press Next step' : 'flow climbing…'}
          </p>
        )}
      </div>
    </div>
  )
}

/* ── side legend: what does this patch contain? ───────────────────────── */

function AdapterLegend({ adapter }: { adapter: Adapter }) {
  return (
    <div className={`rounded-lg border-2 ${adapter.border} bg-ink p-3 anim-float-in`}>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-lg">{adapter.emoji}</span>
        <p className={`text-sm font-bold ${adapter.tone}`}>{adapter.label}</p>
      </div>
      <p className="text-[10px] font-mono text-paper/45 uppercase tracking-widest mb-1">Patch holds</p>
      <ul className="text-[11px] text-paper space-y-0.5">
        {adapter.contains.map((c) => (
          <li key={c}>+ {c}</li>
        ))}
      </ul>
      <p className="text-[10px] font-mono text-paper/45 uppercase tracking-widest mt-3 mb-1">Pinned to layers</p>
      <p className={`text-sm font-mono font-bold ${adapter.tone}`}>{adapter.patchLayers.join(', ')}</p>
      <p className="text-[10px] text-paper/55 italic mt-1">~10 MB total · trains on one GPU</p>
    </div>
  )
}

/* ── adapter swap pills (only shown beat 4+) ──────────────────────────── */

function SwapPills({ active, setIdx }: { active: Adapter['id']; setIdx: (i: number) => void }) {
  return (
    <div className="rounded-xl border border-grape-soft/40 bg-ink-soft p-3 anim-float-in">
      <p className="text-[10px] font-mono text-paper/55 uppercase tracking-widest mb-2">
        Hot-swap the adapter · base model never moves
      </p>
      <div className="flex flex-wrap gap-2">
        {ADAPTERS.map((a, i) => {
          const on = a.id === active
          return (
            <button
              key={a.id}
              onClick={() => setIdx(i)}
              className={[
                'px-3 py-2 rounded-full border-2 text-xs font-semibold transition-all flex items-center gap-2',
                a.border,
                on ? `${a.bg} ${a.tone} scale-[1.05]` : 'text-paper/65 hover:text-paper',
              ].join(' ')}
            >
              <span>🗒️</span>
              <span>{a.emoji}</span>
              <span>{a.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ── math + cost (beat 5) ─────────────────────────────────────────────── */

function MathAndCost() {
  return (
    <div className="rounded-xl border border-grape-soft/40 bg-ink-soft p-3 anim-float-in space-y-3">
      <p className="text-[10px] font-mono text-paper/55 uppercase tracking-widest">The whole math, and the price tag</p>

      <div className="rounded-lg border border-grape-soft/40 bg-ink p-3">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Matrix w={70} h={70} label="W (frozen)" sub="d × d" color="rgba(253,246,240,0.25)" />
          <span className="text-2xl text-paper/65">+</span>
          <Matrix w={70} h={14}  label="A · B" sub="d × r · r × d" color="#a78bfa" />
          <span className="text-2xl text-paper/65">=</span>
          <Matrix w={70} h={70} label="W' (slightly shifted)" sub="d × d" color="rgba(168,139,250,0.25)" />
        </div>
        <p className="text-[11px] text-paper/60 mt-2 text-center italic">
          Rank r is small (usually 8 – 64) — so A · B is tiny compared to W. But it sits inside the same matrix
          multiplication and reshapes the output.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-2 text-center">
        <Cost label="Compute" before="~$3 000 / run" after="~$200 / run" />
        <Cost label="Artefact" before="14 GB" after="~30 MB" />
        <Cost label="Quality on voice / format tasks" before="100 %" after="≈ 100 %" tone="mint" />
      </div>
    </div>
  )
}

function Matrix({ w, h, label, sub, color }: { w: number; h: number; label: string; sub: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="rounded"
        style={{ width: w, height: h, backgroundColor: color, border: '1px solid rgba(255,255,255,0.12)' }}
      />
      <span className="text-[10px] font-mono text-paper/75">{label}</span>
      <span className="text-[9px] font-mono text-paper/40">{sub}</span>
    </div>
  )
}

function Cost({
  label,
  before,
  after,
  tone = 'grape-soft',
}: {
  label: string
  before: string
  after: string
  tone?: 'grape-soft' | 'mint'
}) {
  const toneText = tone === 'mint' ? 'text-mint' : 'text-grape-soft'
  const toneBorder = tone === 'mint' ? 'border-mint' : 'border-grape-soft'
  return (
    <div className={`rounded-lg border-2 ${toneBorder} bg-ink p-3`}>
      <p className={`text-[10px] font-mono uppercase tracking-widest ${toneText} mb-1`}>{label}</p>
      <p className="text-xs text-paper/60 line-through">{before}</p>
      <p className={`text-base font-bold ${toneText}`}>{after}</p>
    </div>
  )
}
