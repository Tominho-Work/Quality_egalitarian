'use client'

import { useState, useEffect } from 'react'
import { ActivityGauge } from '@/components/ui/activity-gauge'
import { WordCloud } from '@/components/ui/word-cloud'
import { WordData } from '@/lib/text-processing'

interface AnalyticsData {
  cycles: Array<{
    id: string
    name: string
    startDate: string
    endDate: string
  }>
  roles: string[]
  universities: string[]
  metrics: {
    overallSatisfaction: { value: number; target: number; count: number }
    preparedness: { value: number; target: number; count: number }
  }
  questionAverages: Record<string, number>
  wordCloudData: WordData[]
  demographics: {
    byRole: Record<string, number>
    byUniversity: Record<string, number>
    byCycle: Record<string, number>
  }
  totalResponses: number
}

export default function EvaluationSurveyPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [selectedCycle, setSelectedCycle] = useState<string>('all')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [selectedUniversity, setSelectedUniversity] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  const fetchData = async (cycleId?: string, role?: string, university?: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (cycleId && cycleId !== 'all') params.append('cycleId', cycleId)
      if (role && role !== 'all') params.append('role', role)
      if (university && university !== 'all') params.append('university', university)
      
      const queryString = params.toString()
      const response = await fetch(`/api/evaluation-survey/analytics${queryString ? '?' + queryString : ''}`)
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(
      selectedCycle === 'all' ? undefined : selectedCycle,
      selectedRole === 'all' ? undefined : selectedRole,
      selectedUniversity === 'all' ? undefined : selectedUniversity
    )
  }, [selectedCycle, selectedRole, selectedUniversity])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading analytics...</div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">Failed to load analytics data</div>
      </div>
    )
  }

  const questionLabels: Record<string, string> = {
    planning: 'Event Planning',
    localStaff: 'Local Staff Help',
    sendingInstitution: 'Sending Institution Help',
    accommodationTravel: 'Accommodation & Travel',
    programme: 'EGALITARIAN Programme',
    culturalTour: 'Cultural Tour',
    overallSatisfaction: 'Overall Satisfaction',
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Evaluation Survey Analysis
          </h1>
          <p className="text-gray-600">
            EGALITARIAN program participant feedback and satisfaction metrics
          </p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          {/* Cycle Filter */}
          <div className="flex items-center space-x-2">
            <label htmlFor="cycle-select" className="text-sm font-medium text-gray-700">
              Cycle:
            </label>
            <select
              id="cycle-select"
              value={selectedCycle}
              onChange={(e) => setSelectedCycle(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Cycles</option>
              {data.cycles.map((cycle) => (
                <option key={cycle.id} value={cycle.id}>
                  {cycle.name}
                </option>
              ))}
            </select>
          </div>

          {/* Role Filter */}
          <div className="flex items-center space-x-2">
            <label htmlFor="role-select" className="text-sm font-medium text-gray-700">
              Role:
            </label>
            <select
              id="role-select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Roles</option>
              {(data.roles || []).map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* University Filter */}
          <div className="flex items-center space-x-2">
            <label htmlFor="university-select" className="text-sm font-medium text-gray-700">
              University:
            </label>
            <select
              id="university-select"
              value={selectedUniversity}
              onChange={(e) => setSelectedUniversity(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Universities</option>
              {(data.universities || []).map((university) => (
                <option key={university} value={university}>
                  {university}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{data.totalResponses}</div>
            <div className="text-sm text-gray-500">Total Responses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{data.metrics.overallSatisfaction.value}</div>
            <div className="text-sm text-gray-500">Avg Satisfaction (Target: 4.4)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{data.metrics.preparedness.value}</div>
            <div className="text-sm text-gray-500">Avg Preparedness (Target: 4.4)</div>
          </div>
        </div>
      </div>

      {/* KPI Gauges */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Key Performance Indicators</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="metric-card">
            <ActivityGauge
              title="Overall Satisfaction"
              value={data.metrics.overallSatisfaction.value}
              target={data.metrics.overallSatisfaction.target}
              unit="score"
              size="lg"
            />
            <p className="text-xs text-gray-500 mt-2 text-center">
              Average of questions 2-8 • {data.metrics.overallSatisfaction.count} responses
            </p>
          </div>
          <div className="metric-card">
            <ActivityGauge
              title="Preparedness Level"
              value={data.metrics.preparedness.value}
              target={data.metrics.preparedness.target}
              unit="score"
              size="lg"
            />
            <p className="text-xs text-gray-500 mt-2 text-center">
              How prepared participants felt • {data.metrics.preparedness.count} responses
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Question Breakdown */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Question Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(data.questionAverages)
            .filter(([question, value]) => value > 0) // Only show questions with data
            .map(([question, value]) => (
            <div key={question} className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="font-medium text-gray-900 mb-2">{questionLabels[question] || question}</h3>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-blue-600">
                  {Math.round(value * 100) / 100}
                </span>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  value >= 4.4 ? 'bg-green-100 text-green-800' : 
                  value >= 4.0 ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  {value >= 4.4 ? 'Excellent' : value >= 4.0 ? 'Good' : 'Needs Improvement'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Demographics */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Demographics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="metric-card">
            <h3 className="font-medium text-gray-900 mb-4">By Role</h3>
            <div className="space-y-2">
              {Object.entries(data.demographics.byRole).map(([role, count]) => (
                <div key={role} className="flex justify-between">
                  <span className="text-sm text-gray-600">{role}</span>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="metric-card">
            <h3 className="font-medium text-gray-900 mb-4">By University</h3>
            <div className="space-y-2">
              {Object.entries(data.demographics.byUniversity).map(([university, count]) => (
                <div key={university} className="flex justify-between">
                  <span className="text-sm text-gray-600">{university}</span>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="metric-card">
            <h3 className="font-medium text-gray-900 mb-4">By Cycle</h3>
            <div className="space-y-2">
              {Object.entries(data.demographics.byCycle).map(([cycle, count]) => (
                <div key={cycle} className="flex justify-between">
                  <span className="text-sm text-gray-600">{cycle}</span>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Comments Word Cloud */}
      {data.wordCloudData.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Comments Analysis</h2>
          <div className="metric-card">
            <WordCloud 
              words={data.wordCloudData}
              width={800}
              height={400}
              onWordClick={(word) => console.log('Clicked word:', word)}
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center pt-8 border-t">
        <a 
          href="/" 
          className="px-4 py-2 text-blue-600 hover:text-blue-800 hover:underline"
        >
          ← Back to Dashboard
        </a>
        <a 
          href="/admin/import-evaluation" 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Import More Data
        </a>
      </div>
    </div>
  )
}