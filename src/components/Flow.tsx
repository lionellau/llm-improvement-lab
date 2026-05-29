import type { ReactNode } from 'react'

/**
 * 2D Flow primitives. Readability over decoration.
 *
 * Rules:
 *   - Card BODY is always solid bg-ink-soft. NEVER bg-X/10.
 *   - A 2px coloured border carries semantic colour.
 *   - Title at full saturation; sub-text always text-paper full opacity.
 *   - States: active (ring-2 + offset + float-in), dim (opacity-35), base.
 */

export type FlowState = 'base' | 'active' | 'dim'

const TONES: Record<string, { border: string; text: string; ring: string; bg: string }> = {
  coral:      { border: 'border-coral',      text: 'text-coral',      ring: 'ring-coral/60',      bg: 'bg-coral/15' },
  sun:        { border: 'border-sun',        text: 'text-sun',        ring: 'ring-sun/60',        bg: 'bg-sun/15' },
  sky:        { border: 'border-sky',        text: 'text-sky',        ring: 'ring-sky/60',        bg: 'bg-sky/15' },
  mint:       { border: 'border-mint',       text: 'text-mint',       ring: 'ring-mint/60',       bg: 'bg-mint/15' },
  grape:      { border: 'border-grape-soft', text: 'text-grape-soft', ring: 'ring-grape-soft/60', bg: 'bg-grape/20' },
  rose:       { border: 'border-rose',       text: 'text-rose',       ring: 'ring-rose/60',       bg: 'bg-rose/15' },
  paper:      { border: 'border-paper/40',   text: 'text-paper',      ring: 'ring-paper/40',      bg: 'bg-white/10' },
}

export function FlowNode({
  tone = 'paper',
  title,
  sub,
  icon,
  state = 'base',
  size = 'md',
  className = '',
}: {
  tone?: keyof typeof TONES
  title: string
  sub?: ReactNode
  icon?: ReactNode
  state?: FlowState
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const t = TONES[tone] ?? TONES.paper
  const pad = size === 'sm' ? 'p-2.5' : size === 'lg' ? 'p-4' : 'p-3'
  const isActive = state === 'active'
  const isDim = state === 'dim'
  return (
    <div
      className={[
        'rounded-xl border-2 bg-ink-soft transition-all',
        t.border,
        pad,
        isActive ? `ring-2 ring-offset-2 ring-offset-ink ${t.ring} anim-float-in` : '',
        isDim ? 'opacity-35' : '',
        className,
      ].join(' ')}
    >
      <div className="flex items-start gap-2">
        {icon && <span className="text-lg leading-none mt-0.5">{icon}</span>}
        <div className="min-w-0 flex-1">
          <p className={`font-bold leading-tight ${t.text} ${size === 'lg' ? 'text-base' : 'text-sm'}`}>{title}</p>
          {sub && <div className="mt-1 text-xs text-paper leading-snug">{sub}</div>}
        </div>
      </div>
    </div>
  )
}

/**
 * Wrapper that fixes a 720px design width and adds horizontal scroll on mobile
 * so diagram labels never overlap.
 */
export function FlowDiagram({ children, height = 'auto', className = '' }: { children: ReactNode; height?: number | 'auto'; className?: string }) {
  return (
    <div className={`overflow-x-auto -mx-2 px-2 ${className}`}>
      <div className="relative mx-auto" style={{ width: 720, minWidth: 720, height: height === 'auto' ? undefined : height }}>
        {children}
      </div>
    </div>
  )
}

export function FlowArrow({
  x1, y1, x2, y2,
  tone = 'paper',
  active = false,
  label,
}: {
  x1: number; y1: number; x2: number; y2: number
  tone?: keyof typeof TONES
  active?: boolean
  label?: string
}) {
  const t = TONES[tone] ?? TONES.paper
  const color = {
    coral: '#fb7185', sun: '#fbbf24', sky: '#38bdf8', mint: '#34d399',
    grape: '#a78bfa', rose: '#f472b6', paper: '#fdf6f0',
  }[tone] ?? '#fdf6f0'
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  return (
    <svg className="absolute inset-0 pointer-events-none" width="720" style={{ height: '100%' }}>
      <defs>
        <marker id={`arr-${tone}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
        </marker>
      </defs>
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={color}
        strokeWidth={active ? 2.5 : 1.5}
        strokeOpacity={active ? 1 : 0.45}
        markerEnd={`url(#arr-${tone})`}
        className={active ? 'anim-dash-flow' : ''}
      />
      {label && (
        <g>
          <rect x={mx - 38} y={my - 9} width={76} height={18} rx={9} fill="#1a1a2e" stroke={color} strokeOpacity={0.5} />
          <text x={mx} y={my + 3} textAnchor="middle" fontSize="10" fill={color} className={`font-mono uppercase tracking-wider ${t.text}`}>{label}</text>
        </g>
      )}
    </svg>
  )
}

export function SectionLabel({ children, tone = 'paper' }: { children: ReactNode; tone?: keyof typeof TONES }) {
  const t = TONES[tone] ?? TONES.paper
  return (
    <span className={`inline-block text-[10px] font-mono uppercase tracking-widest ${t.text} opacity-80`}>{children}</span>
  )
}

export { TONES }
