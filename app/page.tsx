'use client'

import { ActivityGauge, SatisfactionGauge, EngagementGauge, AttendanceGauge } from '@/components/ui/activity-gauge'
import { KPIDonutChart, SatisfactionKPI, EngagementKPI, LearningOutcomeKPI } from '@/components/ui/kpi-donut-chart'
import { WordCloud } from '@/components/ui/word-cloud'
import { TrendsChart } from '@/components/ui/trends-chart'
import { processTextToWords } from '@/lib/text-processing'

// Sample data - this would come from your database in a real app
const sampleMetrics = {
  satisfaction: { value: 87, target: 85 },
  engagement: { value: 92, target: 90 },
  attendance: { value: 95, target: 95 },
  learning: { value: 4.3, target: 4.5 },
}

const cycleTrends = [
  { cycle: 'Q1 2024', satisfaction: 82, engagement: 88, attendance: 93 },
  { cycle: 'Q2 2024', satisfaction: 85, engagement: 90, attendance: 94 },
  { cycle: 'Q3 2024', satisfaction: 87, engagement: 92, attendance: 95 },
]

const feedbackTexts = [
  'Great workshop! Very informative and engaging. The facilitator was excellent.',
  'The workshop was good but could use more hands-on activities and practical examples.',
  'Excellent content and delivery. Learned a lot about leadership techniques.',
  'Amazing experience! The interactive sessions were very helpful.',
  'Good overall but the room was too small for the number of participants.',
  'Outstanding presentation skills and very relevant content to our work.',
  'Could benefit from more real-world case studies and examples.',
  'Fantastic workshop! Will definitely recommend to colleagues.',
]

const feedbackSentiments = ['positive', 'neutral', 'positive', 'positive', 'neutral', 'positive', 'neutral', 'positive']

export default function Dashboard() {
  const wordData = processTextToWords(feedbackTexts, feedbackSentiments)

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Navigation buttons */}
      <div className="flex flex-wrap gap-4">
        <a href="/evaluation-survey" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
          📊 Evaluation Survey Analysis
        </a>
        <div className="bg-gray-100 text-gray-500 px-6 py-3 rounded-lg font-medium">
          📈 Project Delivery Quality (Coming Soon)
        </div>
        <div className="bg-gray-100 text-gray-500 px-6 py-3 rounded-lg font-medium">
          🎤 Presentation Feedback (Coming Soon)
        </div>
        <div className="bg-gray-100 text-gray-500 px-6 py-3 rounded-lg font-medium">
          ✅ Check Out Survey (Coming Soon)
        </div>
      </div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Event Performance Dashboard
        </h1>
        <p className="text-gray-600">
          Track event metrics, analyze feedback, and identify improvement opportunities
        </p>
      </div>

      {/* KPI Overview - Activity Gauges */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Key Performance Indicators</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="metric-card">
            <SatisfactionGauge 
              value={sampleMetrics.satisfaction.value} 
              target={sampleMetrics.satisfaction.target}
              size="md"
            />
          </div>
          <div className="metric-card">
            <EngagementGauge 
              value={sampleMetrics.engagement.value} 
              target={sampleMetrics.engagement.target}
              size="md"
            />
          </div>
          <div className="metric-card">
            <AttendanceGauge 
              value={sampleMetrics.attendance.value} 
              target={sampleMetrics.attendance.target}
              size="md"
            />
          </div>
          <div className="metric-card">
            <ActivityGauge
              title="Learning Outcome"
              value={sampleMetrics.learning.value}
              target={sampleMetrics.learning.target}
              unit="score"
              size="md"
            />
          </div>
        </div>
      </div>

      {/* KPI Donut Charts */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Detailed KPI Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="metric-card">
            <SatisfactionKPI 
              value={sampleMetrics.satisfaction.value} 
              target={sampleMetrics.satisfaction.target}
            />
          </div>
          <div className="metric-card">
            <EngagementKPI 
              value={sampleMetrics.engagement.value} 
              target={sampleMetrics.engagement.target}
            />
          </div>
          <div className="metric-card">
            <LearningOutcomeKPI 
              value={sampleMetrics.learning.value} 
              target={sampleMetrics.learning.target}
            />
          </div>
        </div>
      </div>

      {/* Trends Chart */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Performance Trends</h2>
        <div className="metric-card">
          <TrendsChart data={cycleTrends} />
        </div>
      </div>

      {/* Feedback Word Cloud */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Feedback Analysis</h2>
        <div className="metric-card">
          <WordCloud 
            words={wordData}
            width={800}
            height={400}
            onWordClick={(word) => console.log('Clicked word:', word)}
          />
        </div>
      </div>

      {/* Improvement Points */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Improvement Opportunities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900">More Interactive Activities</h3>
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">High</span>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Participants requested more hands-on exercises and group activities.
            </p>
            <div className="flex items-center text-xs text-gray-500">
              <span className="mr-2">Content</span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">In Progress</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900">Improve Room Setup</h3>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Medium</span>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Current room layout doesn't facilitate group discussions effectively.
            </p>
            <div className="flex items-center text-xs text-gray-500">
              <span className="mr-2">Logistics</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full">Identified</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900">Extend Session Duration</h3>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Medium</span>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Participants felt rushed during some sessions.
            </p>
            <div className="flex items-center text-xs text-gray-500">
              <span className="mr-2">Process</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">Completed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 