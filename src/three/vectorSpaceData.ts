/* Shared chunk + query data for the Ch4 vector-space visualisation.
 *
 *   pos2d   — hand-tuned x/y in % of the scatter canvas. Spread out so each
 *             label is on its own row with no horizontal collision.
 *   labelSide — which side the label sits on, picked to keep labels inside
 *             the canvas (the office chunk on the right needs left-side).
 */

export type LabelSide = 'right' | 'left'

export interface VecChunk {
  id: string
  text: string
  topic: 'refund' | 'office'
  pos2d: { x: number; y: number }
  labelSide: LabelSide
}

export const QUERY_TEXT = '"How do I get my money back?"'
export const QUERY_POS_2D: { x: number; y: number } = { x: 22, y: 34 }

/* Positions tuned so no two labels share a row, AND the right-side office
 * label is parked far enough from the left cluster that even if its label
 * extends leftward, it never crashes into a refund label. */
export const CHUNKS_2D: VecChunk[] = [
  { id: 'c1', text: 'refund · 45 days',     topic: 'refund', pos2d: { x: 16, y: 18 }, labelSide: 'right' },
  { id: 'c2', text: '30-day satisfaction',  topic: 'refund', pos2d: { x: 20, y: 48 }, labelSide: 'right' },
  { id: 'c3', text: 'self-serve refund',    topic: 'refund', pos2d: { x: 14, y: 76 }, labelSide: 'right' },
  { id: 'c4', text: 'Lyon office hours',    topic: 'office', pos2d: { x: 82, y: 50 }, labelSide: 'left'  },
]

/** Top-K closest chunks to the query, by 2D Euclidean distance. */
export function rankedByDistance() {
  return [...CHUNKS_2D]
    .map((c) => ({
      ...c,
      d: Math.hypot(c.pos2d.x - QUERY_POS_2D.x, c.pos2d.y - QUERY_POS_2D.y),
    }))
    .sort((a, b) => a.d - b.d)
}
