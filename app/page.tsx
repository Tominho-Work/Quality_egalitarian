'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0b1220] text-slate-100">

      {/* Quick Links (implemented) */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/evaluation-survey" className="group rounded-xl border border-[#1d2b57] bg-[#0f1b3d] p-6 hover:bg-[#13244f] transition-colors">
            <h3 className="text-xl font-semibold text-blue-200 mb-2">Participant Evaluation</h3>
            <p className="text-slate-300">Satisfaction, preparedness, demographics and comments analysis across cycles.</p>
            <div className="mt-4 text-blue-300 group-hover:text-blue-200">Open →</div>
          </Link>
          <Link href="/proposals-feedback" className="group rounded-xl border border-[#1d2b57] bg-[#0f1b3d] p-6 hover:bg-[#13244f] transition-colors">
            <h3 className="text-xl font-semibold text-blue-200 mb-2">Project Proposals Feedback</h3>
            <p className="text-slate-300">Compare impact, digital transformation and clarity ratings for proposals.</p>
            <div className="mt-4 text-blue-300 group-hover:text-blue-200">Open →</div>
          </Link>
        </div>
      </section>

      {/* Coming soon */}
      <section className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-[#1d2b57] bg-[#0f1b3d] p-6 opacity-70 cursor-not-allowed">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-300 mb-2">Project Delivery Quality</h3>
              <span className="px-2 py-1 text-xs rounded-full bg-blue-600/20 text-blue-200 border border-blue-600/30">Coming soon</span>
            </div>
            <p className="text-slate-400">Measure delivery quality and outcomes across teams.</p>
          </div>
          <div className="rounded-xl border border-[#1d2b57] bg-[#0f1b3d] p-6 opacity-70 cursor-not-allowed">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-300 mb-2">Check Out Survey</h3>
              <span className="px-2 py-1 text-xs rounded-full bg-blue-600/20 text-blue-200 border border-blue-600/30">Coming soon</span>
            </div>
            <p className="text-slate-400">End-of-cycle reflections to close the loop.</p>
          </div>
        </div>
      </section>

      {/* Removed hero and about sections by request */}
    </div>
  )
}