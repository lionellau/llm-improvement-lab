import { CHUNKS_2D, QUERY_POS_2D, QUERY_TEXT, rankedByDistance, type LabelSide } from '../three/vectorSpaceData'

const COLOR_MINT = '#34d399'
const COLOR_CORAL = '#fb7185'

/* 2D vector-space scatter.
 *
 * Positions are hand-tuned (see vectorSpaceData) so that labels never overlap.
 * Labels render either to the right or left of their dot depending on
 * labelSide, so the right-edge office chunk doesn't get its label clipped. */

export default function VectorScatter2D({
  showQuery,
  showLines,
  height = 320,
}: {
  showQuery: boolean
  showLines: boolean
  height?: number
}) {
  const ranked = rankedByDistance()
  const topIds = new Set(ranked.slice(0, 3).map((r) => r.id))

  return (
    <div
      className="rounded-xl border-2 border-mint bg-ink overflow-hidden relative"
      style={{ height }}
    >
      <span className="absolute top-1 left-2 text-[9px] font-mono uppercase tracking-widest text-paper/40">
        Vector space · 2D projection
      </span>

      {/* faint axes through the centre */}
      <div className="absolute top-1/2 left-0 right-0 border-t border-white/10" />
      <div className="absolute left-1/2 top-0 bottom-0 border-l border-white/10" />

      {/* similarity lines drawn before dots so dots sit on top */}
      {showLines && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {ranked.slice(0, 3).map((r) => (
            <line
              key={r.id}
              x1={`${QUERY_POS_2D.x}%`} y1={`${QUERY_POS_2D.y}%`}
              x2={`${r.pos2d.x}%`}     y2={`${r.pos2d.y}%`}
              stroke={COLOR_MINT}
              strokeWidth="2"
              strokeOpacity="0.85"
              className="anim-dash-flow"
            />
          ))}
        </svg>
      )}

      {CHUNKS_2D.map((c) => {
        const isTop = showLines && topIds.has(c.id)
        const color = c.topic === 'refund' ? COLOR_MINT : COLOR_CORAL
        return (
          <ChunkDot
            key={c.id}
            x={c.pos2d.x}
            y={c.pos2d.y}
            color={color}
            label={`"${c.text}"`}
            side={c.labelSide}
            emphasised={isTop}
          />
        )
      })}

      {showQuery && (
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 anim-pop-in"
          style={{ left: `${QUERY_POS_2D.x}%`, top: `${QUERY_POS_2D.y}%`, zIndex: 5 }}
        >
          <div className="w-5 h-5 rounded-full bg-sky border-2 border-paper anim-pulse-glow" />
          <p className="absolute left-4 top-5 text-[10px] whitespace-nowrap font-mono text-sky bg-ink/90 px-1 rounded">
            {QUERY_TEXT}
          </p>
        </div>
      )}
    </div>
  )
}

function ChunkDot({
  x,
  y,
  color,
  label,
  side,
  emphasised,
}: {
  x: number
  y: number
  color: string
  label: string
  side: LabelSide
  emphasised: boolean
}) {
  const size = emphasised ? 14 : 10
  const labelPos =
    side === 'right'
      ? { left: size / 2 + 6, top: -7 } // to the right of the dot, vertically centred
      : { right: size / 2 + 6, top: -7 } // to the left

  return (
    <div
      className={`absolute -translate-x-1/2 -translate-y-1/2 ${emphasised ? 'anim-pulse-glow' : ''}`}
      style={{ left: `${x}%`, top: `${y}%`, zIndex: emphasised ? 4 : 3 }}
    >
      <span
        className="block rounded-full"
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          boxShadow: emphasised ? `0 0 12px ${color}` : 'none',
        }}
      />
      <p
        className="absolute whitespace-nowrap font-mono text-[10px] px-1.5 py-0.5 rounded bg-ink/90 border"
        style={{
          color,
          borderColor: `${color}55`,
          ...labelPos,
        }}
      >
        {label}
      </p>
    </div>
  )
}
