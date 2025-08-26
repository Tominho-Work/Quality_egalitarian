'use client'

import { useEffect, useMemo, useState } from 'react'
import { WordCloud } from '@/components/ui/word-cloud'
import { WordData } from '@/lib/text-processing'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { ActivityGauge } from '@/components/ui/activity-gauge'
import { OverallTrendChart } from '@/components/ui/overall-trend-chart'
import { exportElementToPDF } from '@/lib/pdf-export'

interface QuestionStats {
  distribution: Record<number, number>
  average: number
}

interface AnalyticsData {
  cycles: Array<{ id: string; name: string }>
  programs: string[]
  totalResponses: number
  questions: {
    impact: QuestionStats
    digitalTransformation: QuestionStats
    clarity: QuestionStats
  }
  wordCloudData: WordData[]
  overallTrend?: Array<{ cycle: string; value: number }>
}

function toBarData(dist: Record<number, number>) {
  return [1,2,3,4,5].map(v => ({ rating: v, count: dist[v] || 0 }))
}

export default function ProposalsFeedbackPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [selectedCycle, setSelectedCycle] = useState<string>('all')
  const [selectedProgram, setSelectedProgram] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCycle !== 'all') params.append('cycleId', selectedCycle)
      if (selectedProgram !== 'all') params.append('program', selectedProgram)
      const res = await fetch(`/api/proposals-feedback/analytics${params.size ? `?${params.toString()}` : ''}`)
      const result = await res.json()
      setData(result)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [selectedCycle, selectedProgram])

  const charts = useMemo(() => {
    if (!data) return null
    return [
      { key: 'impact', title: 'Expected Impact (1-5)', stats: data.questions.impact },
      { key: 'digitalTransformation', title: 'Digital Transformation (1-5)', stats: data.questions.digitalTransformation },
      { key: 'clarity', title: 'Clarity & Detail (1-5)', stats: data.questions.clarity },
    ] as const
  }, [data])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">Loading proposals analytics...</div>
    )
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8 text-red-600">Failed to load data</div>
    )
  }

  const handleExport = async () => {
    const container = document.getElementById('proposals-export-root')
    if (!container) return
    await exportElementToPDF(container as HTMLElement, {
      fileName: `proposals-feedback-${selectedCycle}-${selectedProgram}.pdf`,
      orientation: 'portrait',
      format: 'a4',
      marginPt: 24,
      scale: 2,
    })
  }

  return (
    <div className="min-h-screen bg-[#0b1220] text-slate-100">
      <div className="container mx-auto px-4 py-8 space-y-8" id="proposals-export-root">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-blue-200 mb-2">Proposals Presentation Feedback</h1>
            <p className="text-slate-300">Analyze 1-5 ratings and comments by cycle and program</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-slate-300">Cycle:</label>
              <select className="bg-[#0f1b3d] border border-[#1d2b57] text-slate-100 rounded px-3 py-2 text-sm" value={selectedCycle} onChange={(e)=>setSelectedCycle(e.target.value)}>
                <option value="all">All</option>
                {data.cycles.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-slate-300">Program:</label>
              <select className="bg-[#0f1b3d] border border-[#1d2b57] text-slate-100 rounded px-3 py-2 text-sm" value={selectedProgram} onChange={(e)=>setSelectedProgram(e.target.value)}>
                <option value="all">All</option>
                {data.programs.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleExport}
              className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
            >
              Export PDF
            </button>
          </div>
        </div>

      {/* Average scores (target 4.0) */}
      <div className="bg-[#0f1b3d] rounded-lg shadow-sm border border-[#1d2b57] p-6">
        <h2 className="text-xl font-semibold text-blue-200 mb-6">Average Scores vs Target</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="metric-card">
            <ActivityGauge title="Expected Impact" value={data.questions.impact.average} target={4.0} unit="score" size="lg" />
          </div>
          <div className="metric-card">
            <ActivityGauge title="Digital Transformation" value={data.questions.digitalTransformation.average} target={4.0} unit="score" size="lg" />
          </div>
          <div className="metric-card">
            <ActivityGauge title="Clarity & Detail" value={data.questions.clarity.average} target={4.0} unit="score" size="lg" />
          </div>
        </div>
      </div>

      {/* Removed per-question distribution section as requested */}

      {data.wordCloudData.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-blue-200 mb-4">Comments Word Cloud</h2>
          <div className="bg-[#0f1b3d] rounded-lg shadow-sm border border-[#1d2b57] p-4">
            <WordCloud words={data.wordCloudData} width={900} height={400} />
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold text-blue-200 mb-4">Overall Score Trend by Cycle</h2>
        <div className="bg-[#0f1b3d] rounded-lg shadow-sm border border-[#1d2b57] p-4">
          <OverallTrendChart data={data.overallTrend || []} label="Overall score" />
        </div>
      </div>

      <div className="flex justify-between items-center pt-8 border-t border-[#1d2b57]">
        <a href="/" className="px-4 py-2 text-blue-300 hover:text-blue-200 hover:underline">← Back to Dashboard</a>
        <a href="/admin/import-proposals" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Import Data</a>
      </div>
      </div>
    </div>
  )
}


