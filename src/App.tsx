import { Routes, Route, useLocation } from 'react-router-dom'
import TopNav from './components/TopNav'
import Home from './pages/Home'
import Pain from './pages/Pain'
import ThreeRoads from './pages/ThreeRoads'
import RagPrinciple from './pages/RagPrinciple'
import RagInternals from './pages/RagInternals'
import RagSuccess from './pages/RagSuccess'
import RagFailures from './pages/RagFailures'
import FinetuneVsRag from './pages/FinetuneVsRag'
import Lora from './pages/Lora'
import Qlora from './pages/Qlora'
import Distillation from './pages/Distillation'
import DistillationUseCase from './pages/DistillationUseCase'
import CaseStudy from './pages/CaseStudy'
import Recap from './pages/Recap'

export default function App() {
  const loc = useLocation()
  return (
    <div className="min-h-full flex flex-col">
      <TopNav />
      <main key={loc.pathname} className="flex-1 anim-float-in">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pain" element={<Pain />} />
          <Route path="/three-roads" element={<ThreeRoads />} />
          <Route path="/rag-principle" element={<RagPrinciple />} />
          <Route path="/rag-internals" element={<RagInternals />} />
          <Route path="/rag-success" element={<RagSuccess />} />
          <Route path="/rag-failures" element={<RagFailures />} />
          <Route path="/finetune-vs-rag" element={<FinetuneVsRag />} />
          <Route path="/lora" element={<Lora />} />
          <Route path="/qlora" element={<Qlora />} />
          <Route path="/distillation" element={<Distillation />} />
          <Route path="/distillation-use-case" element={<DistillationUseCase />} />
          <Route path="/case-study" element={<CaseStudy />} />
          <Route path="/recap" element={<Recap />} />
        </Routes>
      </main>
      <footer className="border-t border-white/5 py-5 text-center text-xs text-paper/40">
        Built for curious humans. No data leaves your browser.
      </footer>
    </div>
  )
}
