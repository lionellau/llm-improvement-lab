// One color = one meaning. Don't reuse these tones across unrelated ideas.
//
//   coral       — pain, the broken status quo, hallucinations
//   sun         — fine-tuning / changing the model itself
//   sky         — retrieval / RAG / open-book lookup
//   mint        — knowledge base / company facts / ground truth
//   grape-soft  — LoRA / small adapters / parameter-efficient tweaks
//   rose        — teacher → student distillation
//   paper       — decision frameworks, recap, neutral copy

export interface Chapter {
  path: string
  n: string
  title: string
  tagline: string
  blurb: string
  emoji: string
  accent: string        // text-* tailwind class
  accentBorder: string  // border-*/40
  accentBg: string      // bg-*/10
  group: 'intro' | 'rag' | 'finetune' | 'distill' | 'apply'
}

export const CHAPTERS: Chapter[] = [
  {
    path: '/pain',
    n: '01',
    title: 'The Frozen Brain',
    tagline: 'Feel the pain of a base LLM.',
    blurb: 'Out-of-date answers. Confident nonsense. No idea what your company sells. This is where every improvement story begins.',
    emoji: '🧊',
    accent: 'text-coral',
    accentBorder: 'border-coral/40',
    accentBg: 'bg-coral/10',
    group: 'intro',
  },
  {
    path: '/three-roads',
    n: '02',
    title: 'Three Roads Out',
    tagline: 'Different problems → different fixes.',
    blurb: 'RAG, fine-tuning, distillation. They sound similar but solve very different problems. Here is the map.',
    emoji: '🗺️',
    accent: 'text-paper',
    accentBorder: 'border-paper/40',
    accentBg: 'bg-paper/10',
    group: 'intro',
  },
  {
    path: '/rag-principle',
    n: '03',
    title: 'RAG · Open-Book Exam',
    tagline: 'Give the model a cheat sheet.',
    blurb: 'Retrieval-Augmented Generation, explained the way you would explain an open-book test to a teenager.',
    emoji: '📖',
    accent: 'text-sky',
    accentBorder: 'border-sky/40',
    accentBg: 'bg-sky/10',
    group: 'rag',
  },
  {
    path: '/rag-internals',
    n: '04',
    title: 'RAG · Inside the Library',
    tagline: 'Embeddings + vector search, calmly.',
    blurb: 'How does the system actually find the right page? Watch a question travel through a vector database.',
    emoji: '🔎',
    accent: 'text-mint',
    accentBorder: 'border-mint/40',
    accentBg: 'bg-mint/10',
    group: 'rag',
  },
  {
    path: '/rag-success',
    n: '05',
    title: 'RAG · Done Right',
    tagline: 'A real win story.',
    blurb: 'An HR policy assistant that actually quotes the handbook. What good chunking, fresh data, and clear citations look like.',
    emoji: '✅',
    accent: 'text-mint',
    accentBorder: 'border-mint/40',
    accentBg: 'bg-mint/10',
    group: 'rag',
  },
  {
    path: '/rag-failures',
    n: '06',
    title: 'RAG · Gone Wrong',
    tagline: 'Where teams burn six months.',
    blurb: 'Stale indexes, chunk soup, wrong-but-confident citations. The four classic RAG failure modes — and the smell of each.',
    emoji: '⚠️',
    accent: 'text-coral',
    accentBorder: 'border-coral/40',
    accentBg: 'bg-coral/10',
    group: 'rag',
  },
  {
    path: '/finetune-vs-rag',
    n: '07',
    title: 'Fine-tune or Retrieve?',
    tagline: 'Knowing what vs. knowing how.',
    blurb: 'RAG teaches facts. Fine-tuning teaches style, format, and behaviour. A simple two-axis decision.',
    emoji: '🧭',
    accent: 'text-paper',
    accentBorder: 'border-paper/40',
    accentBg: 'bg-paper/10',
    group: 'finetune',
  },
  {
    path: '/lora',
    n: '08',
    title: 'LoRA · Sticky Notes',
    tagline: 'Tweak the model without rewriting it.',
    blurb: 'Why "Low-Rank Adaptation" lets a small team fine-tune a giant model on one laptop GPU — without breaking the original.',
    emoji: '🗒️',
    accent: 'text-grape-soft',
    accentBorder: 'border-grape-soft/40',
    accentBg: 'bg-grape/10',
    group: 'finetune',
  },
  {
    path: '/qlora',
    n: '09',
    title: 'QLoRA · Tiny Suitcase',
    tagline: 'Same trick, smaller bag.',
    blurb: 'Quantization squeezes a 70-billion-parameter model into consumer memory. Why it works and where it breaks.',
    emoji: '🧳',
    accent: 'text-sun',
    accentBorder: 'border-sun/40',
    accentBg: 'bg-sun/10',
    group: 'finetune',
  },
  {
    path: '/distillation',
    n: '10',
    title: 'Teacher → Student',
    tagline: 'A small model copies a smart one.',
    blurb: 'Knowledge distillation, demystified. How to get 90% of the quality at 10% of the cost — and what falls off the truck.',
    emoji: '🎓',
    accent: 'text-rose',
    accentBorder: 'border-rose/40',
    accentBg: 'bg-rose/10',
    group: 'distill',
  },
  {
    path: '/distillation-use-case',
    n: '11',
    title: 'Distillation in the Wild',
    tagline: 'A cheap, fast support bot.',
    blurb: 'When a giant model is overkill, distillation turns "too slow / too expensive" into "ships next quarter".',
    emoji: '🚚',
    accent: 'text-rose',
    accentBorder: 'border-rose/40',
    accentBg: 'bg-rose/10',
    group: 'distill',
  },
  {
    path: '/case-study',
    n: '12',
    title: 'Putting It Together',
    tagline: 'One company, three improvements.',
    blurb: 'Northwind Co. ships an internal assistant in four quarters. Watch RAG, LoRA, and distillation stack — in that order, on purpose.',
    emoji: '🏗️',
    accent: 'text-sun',
    accentBorder: 'border-sun/40',
    accentBg: 'bg-sun/10',
    group: 'apply',
  },
  {
    path: '/recap',
    n: '13',
    title: 'Recap',
    tagline: 'What you now know.',
    blurb: 'Thirteen ideas in one page. Bring it to your next AI roadmap meeting.',
    emoji: '🏁',
    accent: 'text-paper',
    accentBorder: 'border-paper/40',
    accentBg: 'bg-paper/10',
    group: 'apply',
  },
]
